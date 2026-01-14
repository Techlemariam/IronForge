import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatQuestType(type: string): string {
  const map: Record<string, string> = {
    "WORKOUT": "OPERATION",
    "GYM": "SECTOR",
    "REST": "REGENERATION",
    "CARDIO": "HULL INTEGRITY",
    "FATIGUE": "SYSTEM LOAD",
    "WEIGHT": "MASS",
  };
  return map[type.toUpperCase()] || type.toUpperCase();
}
