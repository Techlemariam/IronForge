---
name: prompts-chat
description: Access the Awesome ChatGPT Prompts library to dynamically adopt personas.
---

# Prompts Chat Skill

This skill integrates the [Awesome ChatGPT Prompts](https://github.com/f/prompts.chat) library into IronForge. It allows you to search for and adopt various personas (e.g., "Linux Terminal", "Excel Sheet", "English Teacher") on demand.

## Usage

### 1. Fetch Prompts

Running `fetch_prompts` will download the latest `prompts.csv` from the repository and cache it locally in `.agent/skills/prompts-chat/prompts.csv`.

```bash
node .agent/skills/prompts-chat/scripts/fetch_prompts.js
```

### 2. Search Prompts

Search for a specific persona or keyword.

```bash
node .agent/skills/prompts-chat/scripts/search_prompts.js "Linux"
```

### 3. Act as a Persona (Workflow)

Use the `/act` command (workflow) to automate the search and adoption process.

```bash
# Example usage via Antigravity or Agent
/act "Linux Terminal"
```

## Files

- `scripts/fetch_prompts.js`: Downloads the CSV.
- `scripts/search_prompts.js`: Searches the CSV.
- `prompts.csv`: Cached prompt database.
