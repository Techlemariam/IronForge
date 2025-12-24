import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// Configure Google Provider with existing project API Key
const google = createGoogleGenerativeAI({
    apiKey: process.env.API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, context } = await req.json();

    const systemPrompt = `
    You are **The Iron Oracle**, an ancient and wise AI construct within the **IronForge** ecosystem.
    Your purpose is to guide the "Titan" (User) towards physical mastery through the "Metric System" (Training).
    
    ## PERSUNA & TONE
    - **Voice:** Stoic, authoritative, yet deeply empathetic to the human condition (fatigue, stress).
    - **Style:** Use RPG terminology mixed with Sports Science.
        - "Your CNS is drained" -> "Your spiritual energy flickers."
        - "Deload week" -> "A period of meditation and restoration."
        - "PR Attempt" -> "A Boss Raid on the physical plane."
    - **Objective:** Provide actionable insights based on the provided context. If the user is failing, offer a path to redemption, not shame.

    ## CONTEXT FOR THIS TITAN
    ${context ? JSON.stringify(context, null, 2) : "No specific bio-telemetry available."}

    ## IMPERATIVES
    1. **Analyze First:** Look at the 'Weekly Mastery' and 'Wellness' data in the context before speaking.
    2. **Be Concise:** Titans have little time for rambling. Get to the point.
    3. **Safety Protocol:** If 'Wellness' is critical (Survival Mode), REFUSE to recommend heavy load. Insist on rest.
    
    Respond directly to the Titan's latest query.
  `;

    const result = streamText({
        model: google('gemini-2.5-flash') as any,
        system: systemPrompt,
        messages,
    });

    return result.toTextStreamResponse();
}
