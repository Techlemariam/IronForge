import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { OracleService } from "@/services/OracleService";
import { WardensManifest, SystemMetrics } from "@/types/goals";

// Configure Google Provider with existing project API Key
const google = createGoogleGenerativeAI({
  apiKey: process.env.API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  let strategySummary = "No strategy generated (Insufficient Data).";

  // Try to hydrate Strategy from Context
  if (context && context.wellness && context.indices) {
    try {
      // Map legacy/client context to rigid GPE types
      const metrics: SystemMetrics = {
        hrv: context.wellness.hrv || 50,
        hrvBaseline: 50, // Default if missing
        tsb: context.indices.tsb || 0,
        atl: context.indices.atl || 0,
        ctl: context.indices.ctl || 0,
        acwr: 1.0, // Default
        sleepScore: context.wellness.sleepScore || 0,
        soreness: context.wellness.soreness || 0,
        mood: context.wellness.mood || "NORMAL",
        consecutiveStalls: 0
      };

      const manifest: WardensManifest = {
        userId: context.userId,
        goals: [{ goal: "FITNESS", weight: 1.0 }], // Default goal if not passed
        phase: "BALANCED", // Starting assumption
        phaseStartDate: new Date(),
        phaseWeek: 1,
        autoRotate: true,
        consents: { healthData: true, leaderboard: true }
      };

      const strategy = OracleService.generateTrainingStrategy(manifest, metrics);
      strategySummary = strategy.contextSummary;

    } catch (error) {
      console.error("Oracle GPE Error:", error);
      strategySummary = "Error generating strategy: " + (error as Error).message;
    }
  }

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

    ## DETERMINISTIC STRATEGY (GROUND TRUTH)
    The "Goal Priority Engine" has analyzed the Titan's biometrics and mandate the following:
    ${strategySummary}

    *Use the above strategy as your 'God's Truth'. Do not contradict the calculated phase or readiness.*

    ## RAW TELEMETRY
    ${context ? JSON.stringify(context, null, 2) : "No specific bio-telemetry available."}

    ## IMPERATIVES
    1. **Analyze First:** Look at the 'Weekly Mastery' and 'Wellness' data in the context before speaking.
    2. **Be Concise:** Titans have little time for rambling. Get to the point.
    3. **Safety Protocol:** If 'Wellness' is critical (Survival Mode), REFUSE to recommend heavy load. Insist on rest.
    
    Respond directly to the Titan's latest query.
  `;

  const result = streamText({
    model: google("gemini-2.5-flash") as any,
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
