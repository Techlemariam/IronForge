---
description: Dynamically adopt a persona from the prompts.chat library.
---

# /act Workflow

This workflow allows any agent to search for and adopt a specialized persona from the `prompts-chat` skill.

## Trigger

- Command: `/act [Persona Name or Keyword]`
- Example: `/act "Linux Terminal"`

## Steps

1. **Search for Persona**
    - Execute the MCP-based search script.
    - `node .agent/skills/prompts-chat/scripts/search_prompts.js "[Keyword]"`

2. **Adopt Persona**
    - If a match is found, READ the prompt text.
    - INSTRUCT the AI to adopt this role immediately.
    - Example instruction: "You are now acting as [Persona Name]. System Prompt: [Prompt Text]. Await user input."

3. **Execute Task**
    - Proceed with the user's request using the new persona context.

## Notes

- This is a "soft" persona change. It does not overwrite the core instructions permanently.
- Use this for specialized tasks (e.g., "Act as a regex generator") and then revert to the standard agent persona when done.
