import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main() {
    const query = process.argv[2]?.toLowerCase();

    const transport = new StdioClientTransport({
        command: "pnpm",
        args: ["dlx", "@fkadev/prompts.chat-mcp"],
        env: { ...process.env, PROMPTS_API_KEY: process.env.PROMPTS_CHAT_API_KEY }
    });

    const client = new Client({
        name: "prompts-chat-client",
        version: "1.0.0"
    }, {
        capabilities: {
            prompts: {}
        }
    });

    await client.connect(transport);

    try {
        const { prompts } = await client.listPrompts();

        if (!query) {
            console.log("Available personas:\n");
            prompts.forEach(p => console.log(`- ${p.name}: ${p.description || "No description"}`));
            process.exit(0);
        }

        const matches = prompts.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );

        if (matches.length === 0) {
            console.log(`No prompts found matching "${query}". Showing all available personas:\n`);
            prompts.forEach(p => console.log(`- ${p.name}`));
        } else {
            console.log(`Found ${matches.length} matching prompt(s):\n`);
            for (const match of matches) {
                console.log(`--- [Act: ${match.name}] ---`);
                const fullPrompt = await client.getPrompt({ name: match.name });
                const content = fullPrompt.messages?.[0]?.content?.text || "No content found.";
                console.log(content);
                console.log("\n");
            }
        }
    } catch (e) {
        console.error("Error communicating with MCP server:", e.message);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
