#!/usr/bin/env bun
import { writed, file } from "bun";

const PROMPTS_URL = "https://raw.githubusercontent.com/f/prompts.chat/master/prompts.csv";
const OUTPUT_PATH = ".agent/skills/prompts-chat/prompts.csv";

async function fetchPrompts() {
    console.log(`Fetching prompts from ${PROMPTS_URL}...`);
    try {
        const response = await fetch(PROMPTS_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch prompts: ${response.statusText}`);
        }
        const csvContent = await response.text();
        await Bun.write(OUTPUT_PATH, csvContent);
        console.log(`Successfully saved prompts to ${OUTPUT_PATH}`);
    } catch (error) {
        console.error("Error fetching prompts:", error);
        process.exit(1);
    }
}

fetchPrompts();
