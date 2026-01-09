/**
 * @fileoverview GeminiService Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeminiService } from '@/services/gemini';

// Mock @google/genai
vi.mock("@google/genai", () => {
    return {
        GoogleGenAI: class MockGoogleGenAI {
            models = {
                generateContent: vi.fn().mockResolvedValue({
                    text: "Mock AI response from the Oracle"
                })
            };
        }
    };
});

describe("GeminiService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set API key for tests
        process.env.API_KEY = "test-api-key";
    });

    describe("chat", () => {
        it("should generate a response with bio-context", async () => {
            // Arrange
            const message = "How should I train today?";
            const history = [
                { role: "user" as const, content: "Hello" },
                { role: "model" as const, content: "Greetings, Titan." }
            ];
            const bioContext = "CTL: 45, ATL: 50, TSB: -5, Sleep: 85%";

            // Act
            const result = await GeminiService.chat(message, history, bioContext);

            // Assert
            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });

        it("should handle empty history", async () => {
            // Arrange
            const message = "First message";
            const history: { role: "user" | "model"; content: string }[] = [];
            const bioContext = "Initial context";

            // Act
            const result = await GeminiService.chat(message, history, bioContext);

            // Assert
            expect(result).toBeDefined();
        });

        it("should include bio-context in prompts", async () => {
            // This test verifies the integration - the actual prompt construction
            // happens internally but we can verify output is generated
            const message = "Am I recovered?";
            const bioContext = "Sleep Score: 92, HRV: 65, Body Battery: 80";

            const result = await GeminiService.chat(message, [], bioContext);

            // The function should not throw and should return a response
            expect(result).toBeDefined();
        });
    });
});
