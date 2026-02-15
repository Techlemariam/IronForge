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
import { getQuota, trackUsage } from "./quota-manager.js";

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
        // In a real implementation, this would query the DB. 
        // For now, we return a summary from the filesystem or a mock.
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
                const taskPath = path.resolve(process.cwd(), "../../.agent/tasks/current.md");
                const taskContent = `# Autonomous Mission: ${workflow}\nModel: ${model}\nTriggered via MCP at ${new Date().toISOString()}`;

                fs.writeFileSync(taskPath, taskContent);
                trackUsage(1);

                return {
                    content: [{ type: "text", text: `Quota OK. Task signal written to .agent/tasks/current.md for Antigravity.` }],
                };
            } else {
                // Option B: Trigger directly via GitHub API (Octokit)
                try {
                    await octokit.rest.actions.createWorkflowDispatch({
                        owner: REPO_OWNER,
                        repo: REPO_NAME,
                        workflow_id: "autonomous-trigger.yml", // Assuming this is the filename
                        ref: "main",
                        inputs: { workflow, model },
                    });
                    trackUsage(1);

                    return {
                        content: [{ type: "text", text: `Quota CRITICAL. Triggered fallback via GitHub Actions workflow_dispatch.` }],
                    };
                } catch (error: any) {
                    return {
                        content: [{ type: "text", text: `Fallback trigger failed: ${error.message}` }],
                        isError: true,
                    };
                }
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
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
