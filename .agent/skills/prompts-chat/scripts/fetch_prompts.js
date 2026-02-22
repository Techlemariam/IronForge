#!/usr/bin/env node
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPTS_URL = "https://raw.githubusercontent.com/f/prompts.chat/master/prompts.csv";
const OUTPUT_PATH = path.join(__dirname, '..', 'prompts.csv');

console.log(`Fetching prompts from ${PROMPTS_URL}...`);

https.get(PROMPTS_URL, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Failed to fetch prompts: ${res.statusCode} ${res.statusMessage}`);
        res.resume();
        process.exit(1);
    }

    const file = fs.createWriteStream(OUTPUT_PATH);
    res.pipe(file);

    file.on('finish', () => {
        file.close(() => {
            console.log(`Successfully saved prompts to ${OUTPUT_PATH}`);
        });
    });
}).on('error', (err) => {
    console.error("Error fetching prompts:", err.message);
    process.exit(1);
});
