"use server";

import { revalidatePath } from "next/cache";

type ResourceType = "GOLD" | "ENERGY" | "MATERIALS" | "XP";

interface ResourceGenerator {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  baseProduction: number;
  currentProduction: number;
  lastCollected: Date;
  capacity: number;
  currentStored: number;
  upgradeCost: { gold: number; materials: number };
}

interface PassiveIncome {
  generators: ResourceGenerator[];
  totalProduction: Record<ResourceType, number>;
  totalStored: Record<ResourceType, number>;
  lastUpdate: Date;
}

/**
 * Get passive income status.
 */
export async function getPassiveIncomeAction(
  _userId: string,
): Promise<PassiveIncome> {
  const now = new Date();

  const generators: ResourceGenerator[] = [
    {
      id: "gold-mine",
      type: "GOLD",
      name: "Gold Mine",
      description: "Generates gold over time",
      level: 3,
      maxLevel: 10,
      baseProduction: 10,
      currentProduction: 30,
      lastCollected: new Date(Date.now() - 4 * 60 * 60 * 1000),
      capacity: 500,
      currentStored: 120,
      upgradeCost: { gold: 500, materials: 5 },
    },
    {
      id: "energy-well",
      type: "ENERGY",
      name: "Energy Well",
      description: "Restores energy over time",
      level: 2,
      maxLevel: 10,
      baseProduction: 5,
      currentProduction: 10,
      lastCollected: new Date(Date.now() - 2 * 60 * 60 * 1000),
      capacity: 100,
      currentStored: 20,
      upgradeCost: { gold: 300, materials: 3 },
    },
    {
      id: "material-quarry",
      type: "MATERIALS",
      name: "Material Quarry",
      description: "Produces crafting materials",
      level: 1,
      maxLevel: 10,
      baseProduction: 1,
      currentProduction: 1,
      lastCollected: new Date(Date.now() - 6 * 60 * 60 * 1000),
      capacity: 50,
      currentStored: 6,
      upgradeCost: { gold: 200, materials: 2 },
    },
  ];

  const totalProduction: Record<ResourceType, number> = {
    GOLD: 0,
    ENERGY: 0,
    MATERIALS: 0,
    XP: 0,
  };
  const totalStored: Record<ResourceType, number> = {
    GOLD: 0,
    ENERGY: 0,
    MATERIALS: 0,
    XP: 0,
  };

  for (const gen of generators) {
    totalProduction[gen.type] += gen.currentProduction;
    totalStored[gen.type] += gen.currentStored;
  }

  return {
    generators,
    totalProduction,
    totalStored,
    lastUpdate: now,
  };
}

/**
 * Collect resources from generator.
 */
export async function collectResourcesAction(
  userId: string,
  generatorId: string,
): Promise<{
  success: boolean;
  amountCollected: number;
  resourceType: ResourceType;
}> {
  console.log(`Collected resources from ${generatorId}`);
  revalidatePath("/resources");

  return {
    success: true,
    amountCollected: 120,
    resourceType: "GOLD",
  };
}

/**
 * Collect all resources.
 */
export async function collectAllResourcesAction(
  userId: string,
): Promise<Record<ResourceType, number>> {
  console.log(`Collected all resources for ${userId}`);
  revalidatePath("/resources");

  return {
    GOLD: 120,
    ENERGY: 20,
    MATERIALS: 6,
    XP: 0,
  };
}

/**
 * Upgrade generator.
 */
export async function upgradeGeneratorAction(
  userId: string,
  generatorId: string,
): Promise<{ success: boolean; newLevel: number; newProduction: number }> {
  console.log(`Upgraded generator ${generatorId}`);
  revalidatePath("/resources");

  return {
    success: true,
    newLevel: 4,
    newProduction: 40,
  };
}

/**
 * Calculate time until generator is full.
 */
export function calculateTimeUntilFull(generator: ResourceGenerator): number {
  const remaining = generator.capacity - generator.currentStored;
  const hoursRemaining = remaining / generator.currentProduction;
  return Math.ceil(hoursRemaining * 60 * 60 * 1000);
}
