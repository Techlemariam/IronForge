"use server";

import { prisma } from "@/lib/prisma";

interface StatCategory {
  name: string;
  icon: string;
  stats: StatItem[];
}

interface StatItem {
  name: string;
  value: number | string;
  unit?: string;
  trend?: "UP" | "DOWN" | "STABLE";
  change?: number;
  rank?: number;
}

interface ComprehensiveStats {
  categories: StatCategory[];
  highlights: StatHighlight[];
  comparisons: StatComparison[];
}

interface StatHighlight {
  title: string;
  value: string;
  description: string;
  icon: string;
}

interface StatComparison {
  stat: string;
  you: number;
  average: number;
  percentile: number;
}

/**
 * Get comprehensive statistics.
 */
export async function getComprehensiveStatsAction(
  userId: string,
): Promise<ComprehensiveStats> {
  const categories: StatCategory[] = [
    {
      name: "Training",
      icon: "💪",
      stats: [
        { name: "Total Workouts", value: 156, trend: "UP", change: 12 },
        { name: "Total Sets", value: 4680, trend: "UP", change: 180 },
        {
          name: "Total Volume",
          value: 1250000,
          unit: "kg",
          trend: "UP",
          change: 45000,
        },
        { name: "Training Days", value: 145, trend: "STABLE" },
        {
          name: "Avg Workout Duration",
          value: 52,
          unit: "min",
          trend: "DOWN",
          change: -3,
        },
        { name: "Favorite Exercise", value: "Bench Press" },
      ],
    },
    {
      name: "Progress",
      icon: "📈",
      stats: [
        { name: "Current Level", value: 42, trend: "UP" },
        { name: "Total XP", value: 125000, trend: "UP", change: 5000 },
        { name: "Personal Records", value: 47, trend: "UP", change: 3 },
        { name: "Achievements", value: 38, trend: "STABLE" },
        { name: "Current Streak", value: 15, unit: "days", trend: "UP" },
        { name: "Longest Streak", value: 28, unit: "days" },
      ],
    },
    {
      name: "Combat",
      icon: "⚔️",
      stats: [
        { name: "Battles Won", value: 234 },
        { name: "Bosses Defeated", value: 18 },
        { name: "Total Damage", value: 1500000 },
        { name: "Highest Floor", value: 35 },
        { name: "PvP Wins", value: 12 },
        { name: "PvP Losses", value: 8 },
      ],
    },
    {
      name: "Social",
      icon: "👥",
      stats: [
        { name: "Friends", value: 24 },
        { name: "Guild Rank", value: "Officer" },
        { name: "Challenges Won", value: 8 },
        { name: "Referrals", value: 3 },
        { name: "Likes Received", value: 156 },
        { name: "Comments", value: 42 },
      ],
    },
    {
      name: "Economy",
      icon: "💰",
      stats: [
        { name: "Gold Balance", value: 12500 },
        { name: "Total Earned", value: 85000 },
        { name: "Items Collected", value: 67 },
        { name: "Crates Opened", value: 34 },
        { name: "Prestige Level", value: 2 },
      ],
    },
  ];

  const highlights: StatHighlight[] = [
    {
      title: "Total Volume",
      value: "1.25M kg",
      description: "Lifetime volume lifted",
      icon: "🏋️",
    },
    {
      title: "Longest Streak",
      value: "28 days",
      description: "Your best consistency run",
      icon: "🔥",
    },
    {
      title: "PRs This Month",
      value: "7",
      description: "Personal records set",
      icon: "🏆",
    },
    {
      title: "Combat Rating",
      value: "A+",
      description: "Top 10% of players",
      icon: "⚔️",
    },
  ];

  const comparisons: StatComparison[] = [
    { stat: "Weekly Volume", you: 15000, average: 8500, percentile: 85 },
    { stat: "Workout Frequency", you: 5, average: 3.2, percentile: 90 },
    { stat: "Level", you: 42, average: 28, percentile: 75 },
    { stat: "Combat Rating", you: 2400, average: 1800, percentile: 80 },
  ];

  return { categories, highlights, comparisons };
}

/**
 * Get stat history for charts.
 */
export async function getStatHistoryAction(
  userId: string,
  stat: string,
  days: number = 30,
): Promise<Array<{ date: string; value: number }>> {
  const history: Array<{ date: string; value: number }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    history.push({
      date: date.toISOString().split("T")[0],
      value: Math.floor(Math.random() * 1000) + 500,
    });
  }

  return history;
}

/**
 * Export stats as JSON.
 */
export async function exportStatsAction(userId: string): Promise<string> {
  const stats = await getComprehensiveStatsAction(userId);
  return JSON.stringify(stats, null, 2);
}
