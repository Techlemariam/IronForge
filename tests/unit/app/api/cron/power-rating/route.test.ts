import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/cron/power-rating/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { PowerRatingService } from "@/services/game/PowerRatingService";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
    prisma: {
        titan: {
            findMany: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("@/services/game/PowerRatingService", () => ({
    PowerRatingService: {
        syncPowerRating: vi.fn(),
    },
}));

vi.mock("@/lib/sentry-cron", () => ({
    withCronMonitor: (handler: any) => handler,
}));

// Mock Logger
vi.mock("@/lib/logger", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("Power Rating Cron", () => {
    const mockRequest = (authHeader?: string) => {
        const headers = new Headers();
        if (authHeader) {
            headers.set("authorization", authHeader);
        }
        return new NextRequest("http://localhost:3000/api/cron/power-rating", {
            headers,
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = "test-secret";
    });

    describe("Authorization", () => {
        it("should reject requests without auth header", async () => {
            const request = mockRequest();
            const response = await GET(request);

            expect(response.status).toBe(401);
            const json = await response.json();
            expect(json.error).toBe("Unauthorized");
        });

        it("should reject requests with invalid auth header", async () => {
            const request = mockRequest("Bearer wrong-secret");
            const response = await GET(request);

            expect(response.status).toBe(401);
            const json = await response.json();
            expect(json.error).toBe("Unauthorized");
        });

        it("should accept requests with valid auth header", async () => {
            const request = mockRequest("Bearer test-secret");
            vi.mocked(prisma.titan.findMany).mockResolvedValue([]);
            const response = await GET(request);
            expect(response.status).toBe(200);
        });
    });

    describe("Power Rating Calculation", () => {
        it("should process active titans", async () => {
            const now = new Date();
            const mockTitan = {
                userId: "user-1",
                lastActive: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                powerRating: 500,
            };

            vi.mocked(prisma.titan.findMany).mockResolvedValue([mockTitan] as any);
            vi.mocked(PowerRatingService.syncPowerRating).mockResolvedValue({} as any);

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const json = await response.json();

            expect(json.success).toBe(true);
            expect(json.processed).toBe(1);
            expect(json.recalculated).toBe(1);
            expect(PowerRatingService.syncPowerRating).toHaveBeenCalledWith("user-1");
        });

        it("should apply decay for inactive users", async () => {
            const now = new Date();
            const mockTitan = {
                userId: "user-2",
                lastActive: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
                powerRating: 1000,
            };

            vi.mocked(prisma.titan.findMany).mockResolvedValue([mockTitan] as any);
            vi.mocked(prisma.titan.update).mockResolvedValue({} as any);

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const json = await response.json();

            expect(json.decayed).toBe(1);
            // Decay 14 days: 1000 * 0.95^2 ~ 903
            expect(prisma.titan.update).toHaveBeenCalledWith({
                where: { userId: "user-2" },
                data: {
                    powerRating: 903,
                    lastPowerCalcAt: expect.any(Date),
                },
            });
        });

        it("should handle users without FTP data", async () => {
            const mockTitan = {
                userId: "user-3",
                lastActive: new Date(),
                powerRating: 500,
            };

            vi.mocked(prisma.titan.findMany).mockResolvedValue([mockTitan] as any);
            vi.mocked(PowerRatingService.syncPowerRating).mockResolvedValue({} as any);

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(200);
            expect(PowerRatingService.syncPowerRating).toHaveBeenCalledWith("user-3");
        });

        it("should handle users without PvP profile", async () => {
            const mockTitan = {
                userId: "user-4",
                lastActive: new Date(),
                powerRating: 500,
            };

            vi.mocked(prisma.titan.findMany).mockResolvedValue([mockTitan] as any);
            vi.mocked(PowerRatingService.syncPowerRating).mockResolvedValue({} as any);

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(200);
            expect(PowerRatingService.syncPowerRating).toHaveBeenCalledWith("user-4");
        });
    });

    describe("Error Handling", () => {
        it("should handle service errors gracefully", async () => {
            const mockTitans = [
                { userId: "user-good", lastActive: new Date(), powerRating: 500 },
                { userId: "user-bad", lastActive: new Date(), powerRating: 500 },
            ];

            vi.mocked(prisma.titan.findMany).mockResolvedValue(mockTitans as any);

            // Mock implementation to throw for specific user
            vi.mocked(PowerRatingService.syncPowerRating).mockImplementation(async (userId) => {
                if (userId === "user-bad") {
                    throw new Error("Service failed");
                }
                return {} as any;
            });

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const json = await response.json();

            expect(json.processed).toBe(1); // One succeeded
            expect(json.errors.length).toBe(1);
            expect(json.errors[0]).toContain("Service failed");
        });

        it("should handle database errors gracefully", async () => {
            vi.mocked(prisma.titan.findMany).mockRejectedValue(new Error("Database error"));

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(500);
            const json = await response.json();
            expect(json.success).toBe(false);
        });
    });
});
