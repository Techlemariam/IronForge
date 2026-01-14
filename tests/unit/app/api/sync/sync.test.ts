import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../logs/route";
import { NextResponse } from "next/server";

// Mocks
vi.mock("@/services/server/UserService", () => ({
  UserService: {
    getOrCreateUser: vi.fn(),
  },
}));

vi.mock("@/services/server/LogService", () => ({
  LogService: {
    saveExerciseLog: vi.fn(),
    saveMeditationLog: vi.fn(),
    getExerciseHistory: vi.fn(),
  },
}));

import { UserService } from "@/services/server/UserService";
import { LogService } from "@/services/server/LogService";

describe("Sync API Route (Logs)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (UserService.getOrCreateUser as any).mockResolvedValue({ id: "user-1" });
  });

  it("should save exercise log correctly", async () => {
    const mockRequest = new Request("http://localhost:3000/api/sync/logs", {
      method: "POST",
      body: JSON.stringify({
        action: "SAVE_LOG",
        userId: "user-1",
        payload: { exercise: "Squat", weight: 100 },
      }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(LogService.saveExerciseLog).toHaveBeenCalledWith("user-1", {
      exercise: "Squat",
      weight: 100,
    });
  });

  it("should save meditation log correctly", async () => {
    const mockRequest = new Request("http://localhost:3000/api/sync/logs", {
      method: "POST",
      body: JSON.stringify({
        action: "SAVE_MEDITATION",
        userId: "user-1",
        payload: { duration: 10 },
      }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(LogService.saveMeditationLog).toHaveBeenCalledWith("user-1", {
      duration: 10,
    });
  });

  it("should handle invalid action", async () => {
    const mockRequest = new Request("http://localhost:3000/api/sync/logs", {
      method: "POST",
      body: JSON.stringify({
        action: "INVALID_ACTION",
        userId: "user-1",
      }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid action");
  });

  it("should handle server error", async () => {
    (LogService.saveExerciseLog as any).mockRejectedValue(
      new Error("DB Error"),
    );

    const mockRequest = new Request("http://localhost:3000/api/sync/logs", {
      method: "POST",
      body: JSON.stringify({
        action: "SAVE_LOG",
        userId: "user-1",
        payload: {},
      }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
  });
});
