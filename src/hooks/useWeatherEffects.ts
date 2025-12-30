"use client";

import { useState, useEffect, useCallback } from "react";

type WeatherType =
  | "CLEAR"
  | "RAIN"
  | "STORM"
  | "SNOW"
  | "FOG"
  | "SANDSTORM"
  | "AURORA";
type TimeOfDay = "DAWN" | "DAY" | "DUSK" | "NIGHT";

interface WeatherState {
  type: WeatherType;
  intensity: number; // 0-100
  timeOfDay: TimeOfDay;
  effects: WeatherEffect[];
  ambientColor: string;
  particleCount: number;
}

interface WeatherEffect {
  name: string;
  description: string;
  modifier: { stat: string; value: number };
  isPositive: boolean;
}

const WEATHER_EFFECTS: Record<WeatherType, WeatherEffect[]> = {
  CLEAR: [
    {
      name: "Clear Skies",
      description: "+10% XP gain",
      modifier: { stat: "xpGain", value: 10 },
      isPositive: true,
    },
  ],
  RAIN: [
    {
      name: "Slippery",
      description: "-5% speed",
      modifier: { stat: "speed", value: -5 },
      isPositive: false,
    },
    {
      name: "Refreshing",
      description: "+5% HP regen",
      modifier: { stat: "hpRegen", value: 5 },
      isPositive: true,
    },
  ],
  STORM: [
    {
      name: "Lightning Charge",
      description: "+15% lightning damage",
      modifier: { stat: "lightningDamage", value: 15 },
      isPositive: true,
    },
    {
      name: "Treacherous",
      description: "-10% accuracy",
      modifier: { stat: "accuracy", value: -10 },
      isPositive: false,
    },
  ],
  SNOW: [
    {
      name: "Frozen Ground",
      description: "-10% speed",
      modifier: { stat: "speed", value: -10 },
      isPositive: false,
    },
    {
      name: "Ice Armor",
      description: "+10% defense",
      modifier: { stat: "defense", value: 10 },
      isPositive: true,
    },
  ],
  FOG: [
    {
      name: "Obscured",
      description: "-20% accuracy, +10% evasion",
      modifier: { stat: "accuracy", value: -20 },
      isPositive: false,
    },
  ],
  SANDSTORM: [
    {
      name: "Blinding Sand",
      description: "-15% accuracy",
      modifier: { stat: "accuracy", value: -15 },
      isPositive: false,
    },
    {
      name: "Desert Fury",
      description: "+10% damage",
      modifier: { stat: "damage", value: 10 },
      isPositive: true,
    },
  ],
  AURORA: [
    {
      name: "Celestial Blessing",
      description: "+20% all stats",
      modifier: { stat: "allStats", value: 20 },
      isPositive: true,
    },
  ],
};

const AMBIENT_COLORS: Record<WeatherType, Record<TimeOfDay, string>> = {
  CLEAR: { DAWN: "#ffd4a8", DAY: "#87ceeb", DUSK: "#ff7e5f", NIGHT: "#1a1a2e" },
  RAIN: { DAWN: "#a8c0d4", DAY: "#708090", DUSK: "#5a5a7a", NIGHT: "#1a1a28" },
  STORM: { DAWN: "#6a7080", DAY: "#4a4a5a", DUSK: "#3a3a4a", NIGHT: "#0a0a1a" },
  SNOW: { DAWN: "#e8f0f8", DAY: "#ffffff", DUSK: "#d8e0e8", NIGHT: "#c8d0d8" },
  FOG: { DAWN: "#c8c8d0", DAY: "#b0b0b8", DUSK: "#989898", NIGHT: "#787888" },
  SANDSTORM: {
    DAWN: "#e8c878",
    DAY: "#d8b858",
    DUSK: "#c8a848",
    NIGHT: "#8a6a38",
  },
  AURORA: {
    DAWN: "#88ff88",
    DAY: "#88ffaa",
    DUSK: "#aa88ff",
    NIGHT: "#ff88aa",
  },
};

/**
 * Get current weather state.
 */
function getCurrentWeather(): WeatherState {
  const hour = new Date().getHours();
  const timeOfDay: TimeOfDay =
    hour >= 5 && hour < 8
      ? "DAWN"
      : hour >= 8 && hour < 18
        ? "DAY"
        : hour >= 18 && hour < 21
          ? "DUSK"
          : "NIGHT";

  // Simulate weather based on time
  const weatherTypes: WeatherType[] = [
    "CLEAR",
    "CLEAR",
    "CLEAR",
    "RAIN",
    "STORM",
    "SNOW",
    "FOG",
  ];
  const randomWeather =
    weatherTypes[Math.floor(Math.random() * weatherTypes.length)];

  const intensity = 30 + Math.floor(Math.random() * 70);

  return {
    type: randomWeather,
    intensity,
    timeOfDay,
    effects: WEATHER_EFFECTS[randomWeather],
    ambientColor: AMBIENT_COLORS[randomWeather][timeOfDay],
    particleCount: Math.floor(intensity * 2),
  };
}

/**
 * Hook for weather effects.
 */
export function useWeatherEffects() {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    // Get initial weather
    setWeather(getCurrentWeather());

    // Update weather every 30 minutes
    const interval = setInterval(
      () => {
        setWeather(getCurrentWeather());
      },
      30 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [enabled]);

  const toggleWeather = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const forceWeather = useCallback(
    (type: WeatherType) => {
      const current = weather || getCurrentWeather();
      setWeather({
        ...current,
        type,
        effects: WEATHER_EFFECTS[type],
        ambientColor: AMBIENT_COLORS[type][current.timeOfDay],
      });
    },
    [weather],
  );

  const getActiveModifiers = useCallback(() => {
    if (!weather || !enabled) return {};

    const modifiers: Record<string, number> = {};
    for (const effect of weather.effects) {
      modifiers[effect.modifier.stat] =
        (modifiers[effect.modifier.stat] || 0) + effect.modifier.value;
    }
    return modifiers;
  }, [weather, enabled]);

  return {
    weather,
    enabled,
    toggleWeather,
    forceWeather,
    getActiveModifiers,
  };
}

/**
 * Get CSS class for weather particles.
 */
export function getWeatherParticleClass(type: WeatherType): string {
  const classes: Record<WeatherType, string> = {
    CLEAR: "",
    RAIN: "weather-rain",
    STORM: "weather-storm",
    SNOW: "weather-snow",
    FOG: "weather-fog",
    SANDSTORM: "weather-sand",
    AURORA: "weather-aurora",
  };
  return classes[type] || "";
}
