import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main() {
    const transport = new StdioClientTransport({
        command: "pnpm",
        args: ["dlx", "@fkadev/prompts.chat-mcp"],
        env: { ...process.env, PROMPTS_API_KEY: process.env.PROMPTS_CHAT_API_KEY }
    });

    const client = new Client({
        name: "test-client",
        version: "1.0.0"
    }, {
        capabilities: {}
    });

    await client.connect(transport);

    console.log("Connected to MCP server.");

    try {
        const tools = await client.listTools();
        console.log("Available tools:", JSON.stringify(tools, null, 2));
    } catch (e) {
        console.error("Error listing tools:", e);
    }

    try {
        const prompts = await client.listPrompts();
        console.log("Available prompts:", JSON.stringify(prompts, null, 2));
    } catch (e) {
        console.error("Error listing prompts:", e);
    }

    await client.close();
}

main().catch(console.error);
