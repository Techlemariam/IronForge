import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/cron/power-rating/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
    prisma: {
        titan: {
            findMany: vi.fn(),
            update: vi.fn(),
        },
        exerciseLog: {
            count: vi.fn(),
        },
        cardioLog: {
            count: vi.fn(),
        },
    },
}));

vi.mock("@/lib/sentry-cron", () => ({
    withCronMonitor: (handler: any) => handler,
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
                user: {
                    id: "user-1",
                    activePath: "WARDEN",
                    bodyWeight: 80,
                    ftpCycle: 240,
                    ftpRun: null,
                    pvpProfile: {
                        highestWilksScore: 350,
                    },
                },
            };

            vi.mocked(prisma.titan.findMany).mockResolvedValue([mockTitan] as any);
            vi.mocked(prisma.exerciseLog.count).mockResolvedValue(3); // 3 strength sessions
            vi.mocked(prisma.cardioLog.count).mockResolvedValue(2); // 2 cardio sessions
            vi.mocked(prisma.titan.update).mockResolvedValue({} as any);

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const json = await response.json();

            expect(json.success).toBe(true);
            expect(json.processed).toBe(1);
            expect(json.recalculated).toBe(1);
            expect(prisma.titan.update).toHaveBeenCalledWith({
                where: { userId: "user-1" },
                data: expect.objectContaining({
                    powerRating: expect.any(Number),
                    strengthIndex: expect.any(Number),
                    cardioIndex: expect.any(Number),
                    mrvAdherence: expect.any(Number),
                    lastPowerCalcAt: expect.any(Date),
                }),
            });
        });

        it("should apply decay for inactive users", async () => {
            const now = new Date();
            const mockTitan = {
                userId: "user-2",
                lastActive: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
                user: {
                    id: "user-2",
                    activePath: "WARDEN",
                    bodyWeight: 75,
                    ftpCycle: 200,
                    ftpRun: null,
                    pvpProfile: {
                        highestWilksScore: 300,
                    },
                },
            };

            vi.mocked(prisma.titan.findMany).mockResolvedValue([mockTitan] as any);
            vi.mocked(prisma.exerciseLog.count).mockResolvedValue(0);
            vi.mocked(prisma.cardioLog.count).mockResolvedValue(0);
            vi.mocked(prisma.titan.update).mockResolvedValue({} as any);

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const json = await response.json();

            expect(json.decayed).toBe(1);
        });

        it("should handle users without FTP data", async () => {
            const mockTitan = {
                userId: "user-3",
                lastActive: new Date(),
                user: {
                    id: "user-3",
                    activePath: "JUGGERNAUT",
                    bodyWeight: 85,
                    ftpCycle: null,
                    ftpRun: null,
                    pvpProfile: {
                        highestWilksScore: 400,
                    },
                },
            };

            vi.mocked(prisma.titan.findMany).mockResolvedValue([mockTitan] as any);
            vi.mocked(prisma.exerciseLog.count).mockResolvedValue(4);
            vi.mocked(prisma.cardioLog.count).mockResolvedValue(0);
            vi.mocked(prisma.titan.update).mockResolvedValue({} as any);

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(200);
            expect(prisma.titan.update).toHaveBeenCalled();
        });

        it("should handle users without PvP profile", async () => {
            const mockTitan = {
                userId: "user-4",
                lastActive: new Date(),
                user: {
                    id: "user-4",
                    activePath: "PATHFINDER",
                    bodyWeight: 70,
                    ftpCycle: 220,
                    ftpRun: 250,
                    pvpProfile: null,
                },
            };

            vi.mocked(prisma.titan.findMany).mockResolvedValue([mockTitan] as any);
            vi.mocked(prisma.exerciseLog.count).mockResolvedValue(2);
            vi.mocked(prisma.cardioLog.count).mockResolvedValue(3);
            vi.mocked(prisma.titan.update).mockResolvedValue({} as any);

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(200);
            expect(prisma.titan.update).toHaveBeenCalled();
        });
    });

    describe("Adherence Calculation", () => {
        it("should calculate 100% adherence with 4 strength and 3 cardio sessions", async () => {
            const mockTitan = {
                userId: "user-5",
                lastActive: new Date(),
                user: {
                    id: "user-5",
                    activePath: "WARDEN",
                    bodyWeight: 75,
                    ftpCycle: 200,
                    ftpRun: null,
                    pvpProfile: { highestWilksScore: 300 },
                },
            };

            vi.mocked(prisma.titan.findMany).mockResolvedValue([mockTitan] as any);
            vi.mocked(prisma.exerciseLog.count).mockResolvedValue(4);
            vi.mocked(prisma.cardioLog.count).mockResolvedValue(3);
            vi.mocked(prisma.titan.update).mockResolvedValue({} as any);

            const request = mockRequest("Bearer test-secret");
            await GET(request);

            const updateCall = vi.mocked(prisma.titan.update).mock.calls[0][0];
            expect(updateCall.data.mrvAdherence).toBe(1.15); // 1.0 + (1.0 * 0.15)
        });

        it("should cap adherence at 100%", async () => {
            const mockTitan = {
                userId: "user-6",
                lastActive: new Date(),
                user: {
                    id: "user-6",
                    activePath: "WARDEN",
                    bodyWeight: 75,
                    ftpCycle: 200,
                    ftpRun: null,
                    pvpProfile: { highestWilksScore: 300 },
                },
            };

            vi.mocked(prisma.titan.findMany).mockResolvedValue([mockTitan] as any);
            vi.mocked(prisma.exerciseLog.count).mockResolvedValue(10); // More than needed
            vi.mocked(prisma.cardioLog.count).mockResolvedValue(10);
            vi.mocked(prisma.titan.update).mockResolvedValue({} as any);

            const request = mockRequest("Bearer test-secret");
            await GET(request);

            const updateCall = vi.mocked(prisma.titan.update).mock.calls[0][0];
            expect(updateCall.data.mrvAdherence).toBe(1.15); // Capped
        });
    });

    describe("Error Handling", () => {
        it("should handle database errors gracefully", async () => {
            vi.mocked(prisma.titan.findMany).mockRejectedValue(new Error("Database error"));

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(500);
            const json = await response.json();
            expect(json.success).toBe(false);
        });

        it("should continue processing on individual titan errors", async () => {
            const mockTitans = [
                {
                    userId: "user-good",
                    lastActive: new Date(),
                    user: {
                        id: "user-good",
                        activePath: "WARDEN",
                        bodyWeight: 75,
                        ftpCycle: 200,
                        ftpRun: null,
                        pvpProfile: { highestWilksScore: 300 },
                    },
                },
                {
                    userId: "user-bad",
                    lastActive: new Date(),
                    user: null, // Will cause error
                },
            ];

            vi.mocked(prisma.titan.findMany).mockResolvedValue(mockTitans as any);
            vi.mocked(prisma.exerciseLog.count).mockResolvedValue(3);
            vi.mocked(prisma.cardioLog.count).mockResolvedValue(2);
            vi.mocked(prisma.titan.update).mockResolvedValue({} as any);

            const request = mockRequest("Bearer test-secret");
            const response = await GET(request);

            expect(response.status).toBe(200);
            const json = await response.json();
            expect(json.errors).toBeDefined();
            expect(json.errors.length).toBeGreaterThan(0);
            expect(json.processed).toBe(1); // Only the good one
        });
    });
});
