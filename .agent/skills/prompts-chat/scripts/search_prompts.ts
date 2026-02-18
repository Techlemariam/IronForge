#!/usr/bin/env bun
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";

const PROMPTS_PATH = ".agent/skills/prompts-chat/prompts.csv";

const args = process.argv.slice(2);
const query = args.join(" ").toLowerCase();

if (!query) {
    console.error("Usage: bun search_prompts.ts <keyword>");
    process.exit(1);
}

try {
    const csvContent = readFileSync(PROMPTS_PATH, "utf-8");
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
    });

    const results = records.filter((record: any) =>
        record.act.toLowerCase().includes(query) ||
        record.prompt.toLowerCase().includes(query)
    );

    if (results.length === 0) {
        console.log(`No prompts found matching "${query}".`);
    } else {
        console.log(`Found ${results.length} prompt(s):\n`);
        results.forEach((result: any) => {
            console.log(`--- [Acte: ${result.act}] ---`);
            console.log(result.prompt);
            console.log("\n");
        });
    }

} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`Error: Prompts file not found at ${PROMPTS_PATH}. Run 'fetch_prompts.ts' first.`);
    } else {
        console.error("Error searching prompts:", error);
    }
    process.exit(1);
}
