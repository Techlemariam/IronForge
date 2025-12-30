import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteAccountAction, signOutAction } from "../account";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

// Mocks
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      delete: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("account actions", () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  describe("deleteAccountAction", () => {
    it("should return error if not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await deleteAccountAction();
      expect(result).toEqual({ success: false, error: "Not authenticated" });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it("should delete user and sign out if authenticated", async () => {
      const mockUser = { id: "user-123" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      (prisma.user.delete as any).mockResolvedValue({});

      const result = await deleteAccountAction();

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should handle errors gracefully", async () => {
      const mockUser = { id: "user-123" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      (prisma.user.delete as any).mockRejectedValue(new Error("DB Error"));

      const result = await deleteAccountAction();

      expect(result).toEqual({
        success: false,
        error: "Failed to delete account. Please contact support.",
      });
    });
  });

  describe("signOutAction", () => {
    it("should sign out and redirect", async () => {
      await signOutAction();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });
});
