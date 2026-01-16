import { Shield, Heart, Flame, Coins, Clock } from "lucide-react";
import React from "react";

export interface CardioBuff {
  id: string;
  name: string;
  description: string;
  zone: number; // 1-5
  effects: {
    xpMultiplier: number;
    goldMultiplier: number;
    energyMultiplier: number;
  };
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const ZONE_BUFFS: Record<number, CardioBuff> = {
  1: {
    id: "restoration",
    name: "Restoration",
    description: "Generating Recovery Potential",
    zone: 1,
    effects: { xpMultiplier: 1.0, goldMultiplier: 1.0, energyMultiplier: 1.0 },
    icon: Heart,
    color: "text-blue-400",
  },
  2: {
    id: "iron_lung",
    name: "Iron Lung",
    description: "+20% Kinetic Energy Efficiency",
    zone: 2,
    effects: { xpMultiplier: 1.0, goldMultiplier: 1.0, energyMultiplier: 1.2 },
    icon: Shield,
    color: "text-green-400",
  },
  3: {
    id: "rhythm",
    name: "Rhythm",
    description: "+10% XP & Gold Gain",
    zone: 3,
    effects: { xpMultiplier: 1.1, goldMultiplier: 1.1, energyMultiplier: 1.0 },
    icon: Clock, // Tempo
    color: "text-yellow-400",
  },
  4: {
    id: "high_voltage",
    name: "High Voltage",
    description: "+50% Gold Drop Rate",
    zone: 4,
    effects: { xpMultiplier: 1.0, goldMultiplier: 1.5, energyMultiplier: 1.0 },
    icon: Coins,
    color: "text-orange-500",
  },
  5: {
    id: "titan_fury",
    name: "Titan Fury",
    description: "2X XP Gain (Anaerobic)",
    zone: 5,
    effects: { xpMultiplier: 2.0, goldMultiplier: 1.0, energyMultiplier: 1.0 },
    icon: Flame,
    color: "text-red-600",
  },
};

export const getBuffForZone = (zone: number): CardioBuff => {
  return ZONE_BUFFS[zone] || ZONE_BUFFS[1];
};
