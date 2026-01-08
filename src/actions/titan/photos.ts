"use server";

import { revalidatePath } from "next/cache";

interface ProgressPhoto {
  id: string;
  userId: string;
  photoUrl: string;
  thumbnailUrl: string;
  date: Date;
  weight?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  notes?: string;
  visibility: "PRIVATE" | "FRIENDS" | "PUBLIC";
}

interface ProgressComparison {
  before: ProgressPhoto;
  after: ProgressPhoto;
  changes: {
    weightChange?: number;
    bodyFatChange?: number;
    daysBetween: number;
  };
}

/**
 * Upload a new progress photo.
 */
export async function uploadProgressPhotoAction(
  userId: string,
  _data: {
    photoUrl: string;
    weight?: number;
    bodyFat?: number;
    measurements?: ProgressPhoto["measurements"];
    notes?: string;
    visibility?: ProgressPhoto["visibility"];
  },
): Promise<{ success: boolean; photoId?: string }> {
  try {
    const photoId = `photo-${userId}-${Date.now()}`;

    console.log(`Uploaded progress photo: ${photoId}`);

    // In production, save to database
    revalidatePath("/progress");
    return { success: true, photoId };
  } catch (error) {
    console.error("Error uploading progress photo:", error);
    return { success: false };
  }
}

/**
 * Get user's progress photo timeline.
 */
export async function getProgressTimelineAction(
  userId: string,
  _limit: number = 20,
): Promise<ProgressPhoto[]> {
  try {
    // MVP: Return sample data
    return [
      {
        id: "photo-1",
        userId,
        photoUrl: "/progress/sample1.jpg",
        thumbnailUrl: "/progress/sample1-thumb.jpg",
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        weight: 85,
        bodyFat: 18,
        measurements: { chest: 100, waist: 85, arms: 35 },
        visibility: "PRIVATE",
      },
      {
        id: "photo-2",
        userId,
        photoUrl: "/progress/sample2.jpg",
        thumbnailUrl: "/progress/sample2-thumb.jpg",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        weight: 82,
        bodyFat: 15,
        measurements: { chest: 102, waist: 82, arms: 36 },
        visibility: "PRIVATE",
      },
      {
        id: "photo-3",
        userId,
        photoUrl: "/progress/sample3.jpg",
        thumbnailUrl: "/progress/sample3-thumb.jpg",
        date: new Date(),
        weight: 80,
        bodyFat: 13,
        measurements: { chest: 104, waist: 80, arms: 37 },
        visibility: "PRIVATE",
      },
    ];
  } catch (error) {
    console.error("Error getting progress timeline:", error);
    return [];
  }
}

/**
 * Compare two progress photos.
 */
export async function compareProgressPhotosAction(
  beforeId: string,
  afterId: string,
): Promise<ProgressComparison | null> {
  try {
    // In production, fetch from database
    const timeline = await getProgressTimelineAction("user");

    const before = timeline.find((p) => p.id === beforeId);
    const after = timeline.find((p) => p.id === afterId);

    if (!before || !after) return null;

    const daysBetween = Math.round(
      (after.date.getTime() - before.date.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      before,
      after,
      changes: {
        weightChange:
          before.weight && after.weight
            ? after.weight - before.weight
            : undefined,
        bodyFatChange:
          before.bodyFat && after.bodyFat
            ? after.bodyFat - before.bodyFat
            : undefined,
        daysBetween,
      },
    };
  } catch (error) {
    console.error("Error comparing photos:", error);
    return null;
  }
}

/**
 * Delete a progress photo.
 */
export async function deleteProgressPhotoAction(
  userId: string,
  photoId: string,
): Promise<{ success: boolean }> {
  try {
    console.log(`Deleted progress photo: ${photoId}`);
    revalidatePath("/progress");
    return { success: true };
  } catch (error) {
    console.error("Error deleting photo:", error);
    return { success: false };
  }
}

/**
 * Update photo visibility.
 */
export async function updatePhotoVisibilityAction(
  userId: string,
  photoId: string,
  visibility: ProgressPhoto["visibility"],
): Promise<{ success: boolean }> {
  try {
    console.log(`Updated visibility: ${photoId} -> ${visibility}`);
    revalidatePath("/progress");
    return { success: true };
  } catch (error) {
    console.error("Error updating visibility:", error);
    return { success: false };
  }
}
