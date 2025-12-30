import { GoogleGenAI, Type } from "@google/genai";
import {
  IntervalsWellness,
  TTBIndices,
  Session,
  BlockType,
  ExerciseLogic,
} from "../types";
import { StorageService } from "./storage";

// The Spirit Guide Service
// Uses Gemini to act as an AI Coach with RAG context
export const GeminiService = {
  async consultSpiritGuide(
    wellness: IntervalsWellness,
    ttb: TTBIndices,
    recentPrs: string[],
  ): Promise<Session | null> {
    if (!process.env.API_KEY) {
      console.warn("Gemini API Key missing. Spirit Guide dormant.");
      return null;
    }

    // --- RAG STEP: Retrieve Context ---
    const history = await StorageService.getHistory();
    const recentLogs = history
      .slice(-20)
      .map(
        (h) =>
          `Date: ${h.date.split("T")[0]}, Exercise: ${h.exerciseId}, e1RM: ${h.e1rm}kg`,
      )
      .join("\n");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              zoneName: { type: Type.STRING },
              difficulty: { type: Type.STRING }, // Normal, Heroic, Mythic
              blocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    type: { type: Type.STRING }, // warmup, station, transition, cooldown
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          logic: { type: Type.STRING },
                          sets: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                id: { type: Type.STRING },
                                reps: { type: Type.STRING }, // Can be number or string
                                completed: { type: Type.BOOLEAN },
                                weightPct: {
                                  type: Type.NUMBER,
                                  nullable: true,
                                },
                              },
                            },
                          },
                          instructions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const sessionData = JSON.parse(response.text || "{}");

      return {
        ...sessionData,
        isGenerated: true,
      } as Session;
    } catch (error) {
      console.error("The Spirit Guide is silent (Gemini Error):", error);
      return null;
    }
  },

  async generateOracleAdvice(context: {
    priority: string;
    trigger: string;
    wellness: IntervalsWellness;
    data?: any; // e.g. TTB, Auditor findings
  }): Promise<string> {
    if (!process.env.API_KEY) return "The Spirits are silent (No API Key).";

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
            You are The Oracle, a mystical but scientific strength coach. 
            Write a short, punchy rationale (max 2 sentences) for a workout recommendation.
            
            Context:
            - Trigger: ${context.priority} (${context.trigger})
            - Wellness: Body Battery ${context.wellness.bodyBattery}, Sleep ${context.wellness.sleepScore}
            - Data: ${JSON.stringify(context.data)}

            Style: Epic, stern, vaguely fantasy but grounded in sports science. Use terms like "Titan", "System", "Load", "Adaptation".
            Example: "Your nervous system is shattered. We must rebuild the foundation before adding load."
        `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text || "The Oracle nods in silence.";
    } catch (e) {
      console.error("Oracle Generation Error", e);
      return "The Oracle focuses on the data.";
    }
  },

  /**
   * Generates a full 7-day training plan based on user constraints and physiology.
   */
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
      intent: string; // e.g. "Hypertrophy", "Strength", "Peak Week"
      daysPerWeek: number;
    },
  ): Promise<any> {
    if (!process.env.API_KEY) throw new Error("No API Key");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
            You are The Iron Oracle, creating a 7-day training program for a specific Titan.

            User Profile:
            - Hero: ${userProfile.heroName} (Level ${userProfile.level})
            - Path: ${userProfile.trainingPath}
            - Equipment: ${userProfile.equipment.join(", ")}
            - Injuries: ${userProfile.injuries.join(", ") || "None"}

            Context:
            - Intent: ${context.intent}
            - Frequency: ${context.daysPerWeek} days/week
            - Physiology: Body Battery ${context.wellness.bodyBattery}, Strength Balance ${context.ttb.strength}

            Directives:
            1. Generate a 7-day plan (Monday-Sunday).
            2. Respect the 'daysPerWeek' constraint - assign "Rest Day" to others.
            3. progressive overload principles appropriate for the '${context.intent}'.
            4. Adjust volume based on Body Battery (if < 30, force deload).

            Output JSON Schema:
            {
                "weekRationale": "Brief explanation of the microcycle focus...",
                "days": [
                    {
                        "dayOfWeek": 0 (Mon) to 6 (Sun),
                        "focus": "Legs / Push / Rest",
                        "isRestDay": boolean,
                        "session": {
                             "name": "Session Title",
                             "difficulty": "Normal | Heroic | Mythic",
                             "blocks": [ ... standard Session Block / Exercise structure ... ]
                        } (or null if rest)
                    }
                ]
            }
        `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              weekRationale: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayOfWeek: { type: Type.NUMBER },
                    focus: { type: Type.STRING },
                    isRestDay: { type: Type.BOOLEAN },
                    session: {
                      type: Type.OBJECT,
                      nullable: true,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        zoneName: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        blocks: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              name: { type: Type.STRING },
                              type: { type: Type.STRING },
                              exercises: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    id: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    logic: { type: Type.STRING },
                                    sets: {
                                      type: Type.ARRAY,
                                      items: {
                                        type: Type.OBJECT,
                                        properties: {
                                          id: { type: Type.STRING },
                                          reps: { type: Type.STRING },
                                          weightPct: {
                                            type: Type.NUMBER,
                                            nullable: true,
                                          },
                                        },
                                      },
                                    },
                                    instructions: {
                                      type: Type.ARRAY,
                                      items: { type: Type.STRING },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Planning Error:", error);
      throw error;
    }
  },
};
