import { OracleService } from '@/services/oracle';
import { OllamaService } from '@/services/ollama';
import type { SystemMetrics, WardensManifest } from '@/types/goals';

// Allow streaming responses up to 60 seconds (Ollama can be slower on some hardware)
export const maxDuration = 60;

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error('Chat API: Failed to parse request JSON:', e);
    return new Response(JSON.stringify({ error: 'Invalid JSON input' }), { status: 400 });
  }

  const { messages, context } = body;

  let strategySummary = 'No strategy generated (Insufficient Data).';

  // Try to hydrate Strategy from Context
  if (context?.wellness && context.indices) {
    try {
      const metrics: SystemMetrics = {
        hrv: context.wellness.hrv || 50,
        hrvBaseline: 50,
        tsb: context.indices.tsb || 0,
        atl: context.indices.atl || 0,
        ctl: context.indices.ctl || 0,
        acwr: 1.0,
        sleepScore: context.wellness.sleepScore || 0,
        bodyBattery: context.wellness.bodyBattery ?? 50,
        soreness: context.wellness.soreness || 0,
        mood: context.wellness.mood || 'NORMAL',
        consecutiveStalls: 0,
      };

      const manifest: WardensManifest = {
        userId: context.userId,
        goals: [{ goal: 'FITNESS', weight: 1.0 }],
        phase: 'BALANCED',
        phaseStartDate: new Date(),
        phaseWeek: 1,
        autoRotate: true,
        consents: { healthData: true, leaderboard: true },
      };

      const strategy = OracleService.generateTrainingStrategy(manifest, metrics);
      strategySummary = strategy.contextSummary;
    } catch (error) {
      console.error('Oracle GPE Error:', error);
      strategySummary = `Error generating strategy: ${(error as Error).message}`;
    }
  }

  const systemPrompt = `
    You are **The Iron Oracle**, an ancient and wise AI construct within the **IronForge** ecosystem.
    Your purpose is to guide the "Titan" (User) towards physical mastery through the "Metric System" (Training).
    
    ## PERSUNA & TONE
    - **Voice:** Stoic, authoritative, yet deeply empathetic to the human condition (fatigue, stress).
    - **Style:** Use RPG terminology mixed with Sports Science.
    - **Objective:** Provide actionable insights based on the provided context.

    ## DETERMINISTIC STRATEGY (GROUND TRUTH)
    The "Goal Priority Engine" has analyzed the Titan's biometrics and mandate the following:
    ${strategySummary}

    *Use the above strategy as your 'God's Truth'. Do not contradict the calculated phase or readiness.*

    ## RAW TELEMETRY
    ${context ? JSON.stringify(context, null, 2) : 'No specific bio-telemetry available.'}
  `;

  // Standard Ollama call
  try {
    const stream = await OllamaService.streamResponse({
      prompt: '', // Prompt is empty because we use 'messages' for chat mode
      model: process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'qwen2.5-coder',
      messages: messages,
      system: systemPrompt,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Ollama Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Local AI is unavailable' }), { status: 503 });
  }
}
