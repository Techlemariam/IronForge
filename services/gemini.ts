
import { GoogleGenAI, Type } from "@google/genai";
import { IntervalsWellness, TTBIndices, Session, BlockType, ExerciseLogic } from '../types';
import { StorageService } from './storage';

// The Spirit Guide Service
// Uses Gemini to act as an AI Coach with RAG context
export const GeminiService = {
    
    async consultSpiritGuide(
        wellness: IntervalsWellness, 
        ttb: TTBIndices,
        recentPrs: string[]
    ): Promise<Session | null> {
        
        if (!process.env.API_KEY) {
            console.warn("Gemini API Key missing. Spirit Guide dormant.");
            return null;
        }

        // --- RAG STEP: Retrieve Context ---
        const history = await StorageService.getHistory();
        const recentLogs = history.slice(-20).map(h => 
            `Date: ${h.date.split('T')[0]}, Exercise: ${h.exerciseId}, e1RM: ${h.e1rm}kg`
        ).join('\n');

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
                model: 'gemini-2.5-flash',
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
                                                                weightPct: { type: Type.NUMBER, nullable: true }
                                                            }
                                                        }
                                                    },
                                                    instructions: {
                                                        type: Type.ARRAY,
                                                        items: { type: Type.STRING }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const sessionData = JSON.parse(response.text || "{}");
            
            return {
                ...sessionData,
                isGenerated: true
            } as Session;

        } catch (error) {
            console.error("The Spirit Guide is silent (Gemini Error):", error);
            return null;
        }
    }
};
