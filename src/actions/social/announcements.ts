"use server";

type AnnouncementType =
  | "EVENT"
  | "MAINTENANCE"
  | "UPDATE"
  | "COMMUNITY"
  | "EMERGENCY"
  | "CELEBRATION";
type AnnouncementPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

interface GlobalAnnouncement {
  id: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  title: string;
  content: string;
  imageUrl?: string;
  actionUrl?: string;
  actionLabel?: string;
  startsAt: Date;
  expiresAt?: Date;
  isRead: boolean;
  isDismissed: boolean;
}

/**
 * Get active global announcements.
 */
export async function getGlobalAnnouncementsAction(
  userId: string,
): Promise<GlobalAnnouncement[]> {
  const now = new Date();

  return [
    {
      id: "ann1",
      type: "EVENT",
      priority: "HIGH",
      title: "🎄 Iron Winter Festival is LIVE!",
      content:
        "Complete winter challenges, earn exclusive rewards, and climb the seasonal leaderboard!",
      actionUrl: "/events/winter-2025",
      actionLabel: "View Event",
      startsAt: new Date("2024-12-20"),
      expiresAt: new Date("2025-01-10"),
      isRead: false,
      isDismissed: false,
    },
    {
      id: "ann2",
      type: "CELEBRATION",
      priority: "NORMAL",
      title: "🎉 10,000 Titans Strong!",
      content:
        "Our community just hit 10,000 active Titans! Thanks for being part of the journey.",
      startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
      isDismissed: false,
    },
    {
      id: "ann3",
      type: "UPDATE",
      priority: "NORMAL",
      title: "⚔️ New Combat System Update",
      content: "Check out the new combo system and enhanced combat animations!",
      actionUrl: "/combat",
      actionLabel: "Try It Now",
      startsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRead: true,
      isDismissed: false,
    },
  ];
}

/**
 * Mark announcement as read.
 */
export async function markAnnouncementReadAction(
  userId: string,
  announcementId: string,
): Promise<{ success: boolean }> {
  console.log(`Marked announcement ${announcementId} as read for ${userId}`);
  return { success: true };
}

/**
 * Dismiss announcement.
 */
export async function dismissAnnouncementAction(
  userId: string,
  announcementId: string,
): Promise<{ success: boolean }> {
  console.log(`Dismissed announcement ${announcementId} for ${userId}`);
  return { success: true };
}

/**
 * Get unread announcement count.
 */
export async function getUnreadAnnouncementCountAction(
  userId: string,
): Promise<number> {
  const announcements = await getGlobalAnnouncementsAction(userId);
  return announcements.filter((a) => !a.isRead).length;
}

/**
 * Check for urgent announcements (maintenance, emergency).
 */
export async function getUrgentAnnouncementsAction(
  userId: string,
): Promise<GlobalAnnouncement[]> {
  const all = await getGlobalAnnouncementsAction(userId);
  return all.filter(
    (a) =>
      a.priority === "URGENT" ||
      a.type === "EMERGENCY" ||
      a.type === "MAINTENANCE",
  );
}
