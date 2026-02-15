#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Assuming built file is in build/index.js, root is ../..
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// Also try default location just in case
dotenv.config();
const API_KEY = process.env.N8N_API_KEY || process.env.n8n_access_token || process.env.N8N_ACCESS_TOKEN;
let BASE_URL = process.env.N8N_HOST;
// Try to derive host from webhook URL if not explicitly set
if (!BASE_URL && process.env.N8N_WEBHOOK_URL) {
    try {
        const url = new URL(process.env.N8N_WEBHOOK_URL);
        BASE_URL = `${url.protocol}//${url.host}`;
    }
    catch {
        // ignore
    }
}
if (!API_KEY) {
    console.error("Error: N8N_API_KEY environment variable is required");
    // We don't exit here to allow the server to start and report error via tools if needed,
    // but for now, strict requirement is better for debugging.
    process.exit(1);
}
if (!BASE_URL) {
    console.error("Error: N8N_HOST or N8N_WEBHOOK_URL environment variable is required");
    process.exit(1);
}
// Ensure no trailing slash
BASE_URL = BASE_URL.replace(/\/$/, "");
class N8nClient {
    headers;
    constructor() {
        this.headers = {
            "X-N8N-API-KEY": API_KEY,
            "Content-Type": "application/json",
        };
    }
    async fetch(endpoint, options = {}) {
        const url = `${BASE_URL}/api/v1${endpoint}`;
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.headers,
                    ...options.headers,
                },
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`n8n API Error: ${response.status} ${response.statusText} - ${text}`);
            }
            return response.json();
        }
        catch (error) {
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    }
    async listWorkflows(active, tags) {
        let query = "?limit=100";
        if (active !== undefined)
            query += `&active=${active}`;
        if (tags && tags.length > 0)
            query += `&tags=${tags.join(",")}`;
        return this.fetch(`/workflows${query}`);
    }
    async getWorkflow(id) {
        return this.fetch(`/workflows/${id}`);
    }
    async activateWorkflow(id) {
        return this.fetch(`/workflows/${id}/activate`, { method: "POST" });
    }
    async deactivateWorkflow(id) {
        return this.fetch(`/workflows/${id}/deactivate`, { method: "POST" });
    }
    async getExecutions(limit = 10, status) {
        let query = `?limit=${limit}`;
        if (status)
            query += `&status=${status}`;
        return this.fetch(`/executions${query}`);
    }
}
const n8nClient = new N8nClient();
const server = new Server({
    name: "n8n-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "n8n_list_workflows",
                description: "List all workflows in the n8n instance",
                inputSchema: zodToJsonSchema(z.object({
                    active: z.boolean().optional().describe("Filter by active status"),
                    tags: z.array(z.string()).optional().describe("Filter by tags"),
                })),
            },
            {
                name: "n8n_get_workflow",
                description: "Get details of a specific workflow",
                inputSchema: zodToJsonSchema(z.object({
                    id: z.string().describe("The ID of the workflow"),
                })),
            },
            {
                name: "n8n_activate_workflow",
                description: "Activate a workflow",
                inputSchema: zodToJsonSchema(z.object({
                    id: z.string().describe("The ID of the workflow"),
                })),
            },
            {
                name: "n8n_deactivate_workflow",
                description: "Deactivate a workflow",
                inputSchema: zodToJsonSchema(z.object({
                    id: z.string().describe("The ID of the workflow"),
                })),
            },
            {
                name: "n8n_get_executions",
                description: "Get recent workflow executions",
                inputSchema: zodToJsonSchema(z.object({
                    limit: z.number().optional().default(10).describe("Number of executions to return"),
                    status: z.enum(["running", "waiting", "succeeded", "error", "canceled"]).optional().describe("Filter by status"),
                })),
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case "n8n_list_workflows": {
                const args = request.params.arguments;
                const result = await n8nClient.listWorkflows(args.active, args.tags);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case "n8n_get_workflow": {
                const args = request.params.arguments;
                const result = await n8nClient.getWorkflow(args.id);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case "n8n_activate_workflow": {
                const args = request.params.arguments;
                const result = await n8nClient.activateWorkflow(args.id);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case "n8n_deactivate_workflow": {
                const args = request.params.arguments;
                const result = await n8nClient.deactivateWorkflow(args.id);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case "n8n_get_executions": {
                const args = request.params.arguments;
                const result = await n8nClient.getExecutions(args.limit, args.status);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});
// Helper to convert Zod schema to JSON schema
function zodToJsonSchema(schema) {
    // Simplified conversion for this specific use case
    // In a real app, use zod-to-json-schema package
    const zodSchema = schema;
    if (zodSchema._def.typeName === "ZodObject") {
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(zodSchema.shape)) {
            const field = value;
            properties[key] = {
                type: field._def.typeName === "ZodNumber" ? "number" :
                    field._def.typeName === "ZodBoolean" ? "boolean" :
                        field._def.typeName === "ZodArray" ? "array" : "string"
            };
            if (field.description) {
                properties[key].description = field.description;
            }
            if (field._def.typeName === "ZodEnum") {
                properties[key].enum = field._def.values;
            }
            if (!field.isOptional()) {
                required.push(key);
            }
        }
        return {
            type: "object",
            properties,
            required: required.length > 0 ? required : undefined
        };
    }
    return {};
}
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
