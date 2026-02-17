import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "octokit";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getQuota, trackUsage } from "./quota-manager.js";
import { startWebhookServer } from "./webhook-server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// Environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER || "Techlemariam";
const REPO_NAME = process.env.REPO_NAME || "IronForge";

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const server = new Server(
    {
        name: "ironforge-factory-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            resources: {},
            tools: {},
        },
    }
);

// Helper to find the agent tasks directory
function getTaskDirectory(): string {
    // 1. Try environment variable
    if (process.env.AGENT_TASKS_DIR) {
        return process.env.AGENT_TASKS_DIR;
    }

    // 2. Try to find .agent/tasks relative to this script
    // We assume the standard structure: <workspace>/.agent/tasks
    // This script is usually at <workspace>/mcp/factory-server/build/index.js

    // Try to find workspace root by looking for .agent directory walking up
    let currentDir = __dirname;
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
        const agentDir = path.join(currentDir, ".agent");
        if (fs.existsSync(agentDir)) {
            return path.join(agentDir, "tasks");
        }
        currentDir = path.dirname(currentDir);
    }

    // 3. Fallback to hardcoded Antigravity path if we can't find it (Windows specific)
    const userProfile = process.env.USERPROFILE;
    if (userProfile) {
        const antigravityTasks = path.join(userProfile, ".gemini", "antigravity", "tasks"); // Guessing path
        // Better fallback: just use the CWD fallback but log warning
    }

    // 4. Fallback to original relative path logic (often fails if CWD is wrong)
    return path.resolve(process.cwd(), "../../.agent/tasks");
}

/**
 * Resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "factory://status",
                name: "Factory Orchestration Status",
                mimeType: "application/json",
                description: "Aggregated health and metadata for all factory stations",
            },
            {
                uri: "factory://usage",
                name: "Gemini Quota Usage",
                mimeType: "application/json",
                description: "Daily token consumption metrics",
            },
            {
                uri: "factory://health",
                name: "MCP Server Health",
                mimeType: "application/json",
                description: "Health status of MCP server and Antigravity integration",
            },
        ],
    };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    if (uri === "factory://usage") {
        return {
            contents: [
                {
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify(getQuota(), null, 2),
                },
            ],
        };
    }

    if (uri === "factory://status") {
        return {
            contents: [
                {
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify({ status: "operational", stations: 8 }, null, 2),
                },
            ],
        };
    }

    if (uri === "factory://health") {
        const taskDir = getTaskDirectory();

        let antigravityAvailable = false;
        try {
            antigravityAvailable = fs.existsSync(taskDir);
        } catch (e) {
            antigravityAvailable = false;
        }

        const health = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            antigravity: {
                available: antigravityAvailable,
                taskDirectory: taskDir,
                cwd: process.cwd(),
                dirname: __dirname
            },
            quota: getQuota(),
            mcp: {
                version: "1.0.0",
                server: "ironforge-factory-mcp",
                webhook_enabled: process.env.ENABLE_WEBHOOK_SERVER === "true",
                webhook_port: process.env.WEBHOOK_PORT || "3030"
            },
        };

        return {
            contents: [
                {
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify(health, null, 2),
                },
            ],
        };
    }

    throw new Error(`Resource not found: ${uri}`);
});

/**
 * Tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_quota_status",
                description: "Checks the remaining Gemini API quota for the day based on local tracking.",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "check_runner_health",
                description: "Executes the local runner health check script.",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "trigger_autonomous_workflow",
                description: "Triggers a GitHub Action workflow or local signal depending on quota.",
                inputSchema: {
                    type: "object",
                    properties: {
                        workflow: {
                            type: "string",
                            enum: ["night-shift", "polish", "git-hygiene", "cleanup", "debt-attack", "security", "sprint-auto"],
                        },
                        model: {
                            type: "string",
                            enum: ["gemini-2.5-flash", "gemini-2.5-pro"],
                        },
                    },
                    required: ["workflow", "model"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
        case "get_quota_status": {
            const quota = getQuota();
            return {
                content: [
                    {
                        type: "text",
                        text: `Quota Status: ${quota.status}\nUsed: ${quota.used} / 1500\nRemaining: ${quota.remaining}\nUsage: ${quota.percentUsed}%`,
                    },
                ],
            };
        }

        case "check_runner_health": {
            try {
                const scriptPath = path.resolve(process.cwd(), "../../scripts/check-runner-health.ps1");
                const { stdout } = await execAsync(`powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}"`);
                return {
                    content: [{ type: "text", text: stdout }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Health check failed: ${error.message}` }],
                    isError: true,
                };
            }
        }

        case "trigger_autonomous_workflow": {
            const { workflow, model } = args as { workflow: string; model: string };
            const quota = getQuota();

            // Quota-Aware Fallback Logic
            if (quota.status !== "Critical") {
                // Option A: Signal Antigravity via file
                const taskDir = getTaskDirectory();
                const taskPath = path.join(taskDir, "current.md");

                // Ensure directory exists
                if (!fs.existsSync(taskDir)) {
                    try {
                        fs.mkdirSync(taskDir, { recursive: true });
                    } catch (e) {
                        // Ignore, let write fail or fallback
                    }
                }

                if (fs.existsSync(taskDir)) {
                    const taskContent = `# Autonomous Mission: ${workflow}\nModel: ${model}\nTriggered via MCP at ${new Date().toISOString()}`;
                    fs.writeFileSync(taskPath, taskContent);
                    trackUsage(1);

                    return {
                        content: [{ type: "text", text: `Quota OK. Task signal written to ${taskPath} for Antigravity.` }],
                    };
                }
            }

            // Fallback (or if Option A failed/skipped)
            // Option B: Trigger directly via GitHub API (Octokit)
            try {
                await octokit.rest.actions.createWorkflowDispatch({
                    owner: REPO_OWNER,
                    repo: REPO_NAME,
                    workflow_id: "autonomous-antigravity-trigger.yml", // Corrected filename
                    ref: "main",
                    inputs: { workflow, model },
                });
                trackUsage(1);

                return {
                    content: [{ type: "text", text: `Triggered fallback via GitHub Actions workflow_dispatch.` }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Fallback trigger failed: ${error.message}` }],
                    isError: true,
                };
            }
        }

        default:
            throw new Error(`Tool not found: ${name}`);
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Factory MCP Server running on stdio");

    // Optionally start webhook server for external integrations
    if (process.env.ENABLE_WEBHOOK_SERVER === "true") {
        try {
            startWebhookServer();
            console.error(`Webhook server enabled on port ${process.env.WEBHOOK_PORT || 3030}`);
        } catch (e: any) {
            console.error(`Failed to start webhook server: ${e.message}`);
        }
    }
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
