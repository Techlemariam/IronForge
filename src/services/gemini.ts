import { OllamaService } from './ollama';
import type { IntervalsWellness, Session, TTBIndices } from '../types';
import { StorageService as Storage } from './storage';

// The Spirit Guide Service - NOW POWERED BY OLLAMA
// Acts as a wrapper for the local AI engine
export const GeminiService = {
  async consultSpiritGuide(
    wellness: IntervalsWellness,
    ttb: TTBIndices,
    _recentPrs: string[]
  ): Promise<Session | null> {
    const history = await Storage.getHistory();
    const recentLogs = history
      .slice(-20)
      .map((h) => `Date: ${h.date.split('T')[0]}, Exercise: ${h.exerciseId}, e1RM: ${h.e1rm}kg`)
      .join('\n');

    const prompt = `
            You are The Spirit Guide, an elite strength and conditioning coach for a "Titan" (athlete).
            
            Current Stats:
            - Body Battery: ${wellness.bodyBattery}/100
            - Sleep Score: ${wellness.sleepScore}/100
            - TTB Balance: Strength ${ttb.strength}, Endurance ${ttb.endurance}, Wellness ${ttb.wellness}
            - Lowest Stat: ${ttb.lowest}
            
            Recent Training History (Last 20 Logs):
            ${recentLogs}

            Task: Generate a JSON workout Session designed to fix the lowest stat while respecting the recovery state.
            If Wellness is low, generate an Active Recovery session.
            If Strength is low, look at the history and target a movement that hasn't been trained recently.
            If Endurance is low, generate a Cardio session.
            
            Flavor: Use RPG terminology (Quest, Boss, Loot).
        `;

    try {
      const sessionData = await OllamaService.generateJSON<any>({
        model: process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'qwen2.5-coder',
        prompt,
      });

      return {
        ...sessionData,
        isGenerated: true,
      } as Session;
    } catch (error) {
      console.error('The Spirit Guide is silent (Ollama Error):', error);
      return null;
    }
  },

  async generateOracleAdvice(context: {
    priority: string;
    trigger: string;
    wellness: IntervalsWellness;
    data?: unknown;
  }): Promise<string> {
    const prompt = `
            You are The Oracle, a mystical but scientific strength coach. 
            Write a short, punchy rationale (max 2 sentences) for a workout recommendation.
            
            Context:
            - Trigger: ${context.priority} (${context.trigger})
            - Wellness: Body Battery ${context.wellness.bodyBattery}, Sleep ${context.wellness.sleepScore}
            - Data: ${JSON.stringify(context.data)}

            Style: Epic, stern, vaguely fantasy but grounded in sports science. Use terms like "Titan", "System", "Load", "Adaptation".
        `;

    try {
      const res = await OllamaService.generate({
        model: process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'deepseek-r1:8b',
        prompt,
        system: 'You are The Oracle, a mystical but scientifically grounded AI coach for IronForge.',
      });
      return res.response || 'The Oracle nods in silence.';
    } catch (e) {
      console.error('Oracle Generation Error', e);
      return 'The Oracle focuses on the data.';
    }
  },

  async generateWeeklyPlanAI(
    userProfile: {
      heroName: string;
      level: number;
      trainingPath: string;
      equipment: string[];
      injuries: string[];
    },
    context: {
      wellness: IntervalsWellness;
      ttb: TTBIndices;
      intent: string;
      daysPerWeek: number;
    }
  ): Promise<any> {
    const prompt = `
            You are The Iron Oracle, creating a 7-day training program for a specific Titan.

            User Profile:
            - Hero: ${userProfile.heroName} (Level ${userProfile.level})
            - Path: ${userProfile.trainingPath}
            - Equipment: ${userProfile.equipment.join(', ')}
            - Injuries: ${userProfile.injuries.join(', ') || 'None'}

            Context:
            - Intent: ${context.intent}
            - Frequency: ${context.daysPerWeek} days/week
            - Physiology: Body Battery ${context.wellness.bodyBattery}, Strength Balance ${context.ttb.strength}

            Generate a full 7-day plan in JSON.
        `;

    try {
      return await OllamaService.generateJSON<any>({
        model: process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'qwen2.5-coder',
        prompt,
      });
    } catch (error) {
      console.error('Ollama Planning Error:', error);
      throw error;
    }
  },

  async chat(
    message: string,
    history: { role: string; content: string }[],
    bioContext: string
  ): Promise<string> {
    const system = `You are The Oracle, a mystical but scientifically grounded AI coach for IronForge.
      Context on the Titan (User):
      ${bioContext}`;

    try {
      const res = await OllamaService.generate({
        model: process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'deepseek-r1:8b',
        prompt: `History: ${JSON.stringify(history)}\nUser: ${message}`,
        system,
      });
      return res.response || 'The Oracle remains silent.';
    } catch (e) {
      console.error('Oracle Chat Error:', e);
      return 'The connection to the Oracle is unstable.';
    }
  },
};

