import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/sync/user/route";
import { getDescription } from "@/lib/auth"; // Unused but keeping structure
import { getUserAction, updateSettingsAction, updateGoldAction, updateEquipmentAction } from "@/actions/user-actions";
import * as AuthLib from "@/lib/auth";

// Mock dependencies
vi.mock("@/lib/auth", () => ({
    getSession: vi.fn(),
}));

vi.mock("@/actions/user-actions", () => ({
    getUserAction: vi.fn(),
    updateSettingsAction: vi.fn(),
    updateGoldAction: vi.fn(),
    updateEquipmentAction: vi.fn(),
}));

describe("Sync API Route (POST)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createRequest = (body: any) =>
        new Request("http://localhost:3000/api/sync/user", {
            method: "POST",
            body: JSON.stringify(body),
        });

    it("should return 401 if not authenticated", async () => {
        vi.spyOn(AuthLib, "getSession").mockResolvedValue(null);

        const req = createRequest({ action: "GET_USER" });
        const res = await POST(req);

        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: "Unauthorized" });
    });

    it("should return 400 for invalid payload", async () => {
        vi.spyOn(AuthLib, "getSession").mockResolvedValue({
            user: { id: "test-user" },
        } as any);

        // Invalid action
        const req = createRequest({ action: "INVALID_ACTION", payload: {} });
        const res = await POST(req);

        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("Invalid payload");
    });

    it("should return 400 for negative gold update (Zod validation)", async () => {
        vi.spyOn(AuthLib, "getSession").mockResolvedValue({
            user: { id: "test-user" },
        } as any);

        const req = createRequest({
            action: "UPDATE_GOLD",
            payload: -500,
        });
        const res = await POST(req);

        expect(res.status).toBe(400);
    });

    it("should return 404 if user not found in DB", async () => {
        vi.spyOn(AuthLib, "getSession").mockResolvedValue({
            user: { id: "test-user" },
        } as any);
        (getUserAction as any).mockResolvedValue(null);

        const req = createRequest({
            action: "UPDATE_GOLD",
            payload: 100,
        });
        const res = await POST(req);

        expect(res.status).toBe(404);
    });

    it("should handle UPDATE_GOLD successfully", async () => {
        vi.spyOn(AuthLib, "getSession").mockResolvedValue({
            user: { id: "test-user" },
        } as any);
        (getUserAction as any).mockResolvedValue({ id: "test-user" });
        (updateGoldAction as any).mockResolvedValue(undefined);

        const req = createRequest({
            action: "UPDATE_GOLD",
            payload: 100,
        });
        const res = await POST(req);

        expect(res.status).toBe(200);
        expect(updateGoldAction).toHaveBeenCalledWith("test-user", 100);
    });

    it("should handle UPDATE_EQUIPMENT successfully", async () => {
        vi.spyOn(AuthLib, "getSession").mockResolvedValue({
            user: { id: "test-user" },
        } as any);
        (getUserAction as any).mockResolvedValue({ id: "test-user" });

        const equipment = [
            { id: "eq-1", name: "Barbell", category: "Barbell", isOwned: true },
        ];
        const req = createRequest({
            action: "UPDATE_EQUIPMENT",
            payload: equipment,
        });
        const res = await POST(req);

        expect(res.status).toBe(200);
        expect(updateEquipmentAction).toHaveBeenCalledWith(
            "test-user",
            equipment
        );
    });

    it("should validate Equipment schema strictly", async () => {
        vi.spyOn(AuthLib, "getSession").mockResolvedValue({
            user: { id: "test-user" },
        } as any);
        (getUserAction as any).mockResolvedValue({ id: "test-user" });

        const invalidEquipment = [
            { id: "eq-1", name: "Barbell", category: "INVALID_CATEGORY", isOwned: true },
        ];
        const req = createRequest({
            action: "UPDATE_EQUIPMENT",
            payload: invalidEquipment,
        });
        const res = await POST(req);

        expect(res.status).toBe(400); // Invalid enum
    });
});
