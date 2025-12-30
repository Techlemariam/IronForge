export type TrainingMetric = "hr" | "power" | "pace";

/**
 * Calculates the Game Zone (1-5) based on Power and FTP using 80/20 Endurance Zones.
 *
 * 80/20 Power Zones:
 * Zone 1: < 68% FTP
 * Zone 2: 69-83% FTP
 * Zone X (Game Z3): 84-94% FTP
 * Zone 3 (Game Z4): 95-105% FTP
 * Zone Y/4/5 (Game Z5): > 105% FTP
 */
export const calculatePowerZone = (watts: number, ftp: number): number => {
  if (ftp <= 0) return 1;

  const percentage = watts / ftp;

  if (percentage <= 0.68) return 1; // Zone 1
  if (percentage <= 0.83) return 2; // Zone 2
  if (percentage <= 0.94) return 3; // Zone X (Rhythm)
  if (percentage <= 1.05) return 4; // Zone 3 (High Voltage)
  return 5; // Zone Y+ (Titan Fury)
};

/**
 * Calculates the Game Zone (1-5) based on Speed (kph) and Threshold Speed.
 * Using a simplified linear mapping for now as pacing is complex.
 *
 * Threshold Speed is roughly 10k race pace or FTP-equivalent speed.
 */
export const calculatePaceZone = (
  speedKph: number,
  thresholdSpeedKph: number,
): number => {
  if (thresholdSpeedKph <= 0) return 1;

  const percentage = speedKph / thresholdSpeedKph;

  // Mapping similar relative effort to power
  if (percentage <= 0.75) return 1;
  if (percentage <= 0.88) return 2;
  if (percentage <= 0.96) return 3;
  if (percentage <= 1.05) return 4;
  return 5;
};
