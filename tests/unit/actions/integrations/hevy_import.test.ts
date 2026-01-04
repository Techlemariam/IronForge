import { describe, it, expect, vi, beforeEach } from "vitest";
import { importHevyRoutineToTemplateAction } from "@/actions/integrations/hevy";
import prisma from "@/lib/prisma"; // We will mock this

// Mock Supabase
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({ data: { user: { id: "test-user-id" } } })),
    },
  })),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    workoutTemplate: {
      create: vi.fn(),
    },
  },
}));

describe("importHevyRoutineToTemplateAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should import a valid routine as a workout template", async () => {
    const mockRoutine = {
      title: "Leg Day",
      exercises: [
        {
          exercise_template_id: "ex-1",
          exercise_template: { title: "Squat" },
          sets: [{ reps: 5, weight_kg: 100, type: "normal" }],
          notes: "Deep",
        },
      ],
    };

    const mockCreatedTemplate = { id: "template-1", name: "Leg Day" };
    (prisma.workoutTemplate.create as any).mockResolvedValue(
      mockCreatedTemplate,
    );

    const result = await importHevyRoutineToTemplateAction(mockRoutine);

    expect(result).toEqual({ success: true, templateId: "template-1" });

    expect(prisma.workoutTemplate.create).toHaveBeenCalledWith({
      data: {
        userId: "test-user-id",
        name: "Leg Day",
        exercises: [
          {
            name: "Squat",
            exerciseId: "ex-1",
            sets: [{ reps: 5, weight: 100, type: "normal" }],
            notes: "Deep",
          },
        ],
      },
    });
  });

  it("should handle unauthorized users", async () => {
    // Override mock for this test
    const { createClient } = await import("@/utils/supabase/server");
    (createClient as any).mockImplementation(() => ({
      auth: {
        getUser: vi.fn(() => ({ data: { user: null } })),
      },
    }));

    await expect(importHevyRoutineToTemplateAction({})).rejects.toThrow(
      "Unauthorized",
    );
  });
});
