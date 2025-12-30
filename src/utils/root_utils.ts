import {
  Session,
  Block,
  Exercise,
  Set as WorkoutSet,
  ExerciseLogic,
  Rarity,
  SkillNode,
  IntervalsWellness,
  TitanAttributes,
  MeditationLog,
} from "../types";
import {
  ACHIEVEMENTS,
  TITAN_RANKS,
  SKILL_TREE,
  SESSIONS,
} from "../data/static";

// Cache for Max TMs to avoid iterating sessions constantly
let _maxTmCache: Record<string, number> | null = null;

export const getMaxTM = (exerciseId: string): number => {
  if (!_maxTmCache) {
    _maxTmCache = {};
    SESSIONS.forEach((session) => {
      session.blocks.forEach((block) => {
        block.exercises?.forEach((ex) => {
          if (ex.logic === ExerciseLogic.TM_PERCENT && ex.trainingMax) {
            const current = _maxTmCache![ex.id] || 0;
            _maxTmCache![ex.id] = Math.max(current, ex.trainingMax);
          }
        });
      });
    });
  }
  return _maxTmCache[exerciseId] || 0;
};

/**
 * Checks if the Gate requirements for a specific rank are met.
 */
export const checkGate = (
  rankId: number,
  unlockedIds: Set<string>,
): boolean => {
  // Rank 1: Novice - No Gate
  if (rankId === 1) return true;

  // Rank 2: Ascendant - 1 Dungeon, 1 Profession, 1 Cardio
  if (rankId === 2) {
    const hasDungeon = ACHIEVEMENTS.some(
      (a) => a.category === "dungeons" && unlockedIds.has(a.id),
    );
    const hasProfession = ACHIEVEMENTS.some(
      (a) => a.category === "professions" && unlockedIds.has(a.id),
    );
    const hasCardio = ACHIEVEMENTS.some(
      (a) => a.category === "cardio" && unlockedIds.has(a.id),
    );
    return hasDungeon && hasProfession && hasCardio;
  }

  // Rank 3: Warrior - 3 Feats of Strength
  if (rankId === 3) {
    const featsCount = ACHIEVEMENTS.filter(
      (a) => a.category === "feats" && unlockedIds.has(a.id),
    ).length;
    return featsCount >= 3;
  }

  // Rank 4: Windrunner - 2 Brick Workouts
  if (rankId === 4) {
    const brickCount = ["brick_novice", "brick_master"].filter((id) =>
      unlockedIds.has(id),
    ).length;
    return brickCount >= 2;
  }

  // Rank 5: Elite - Mastery of All Disciplines (Specific Hard Feats)
  if (rankId === 5) {
    // Must have completed a key Raid and a key Cardio feat
    const hasRaidMastery =
      unlockedIds.has("defender_ironforge") ||
      unlockedIds.has("clear_deadmines");
    const hasCardioMastery =
      unlockedIds.has("shattered_limits") || unlockedIds.has("the_70_club");
    return hasRaidMastery && hasCardioMastery;
  }

  return true;
};

/**
 * Calculates the user's current Titan Rank based on unlocked achievements.
 */
export const calculateTitanRank = (unlockedIds: Set<string>) => {
  // 1. Calculate Resources based on Achievement Categories
  const talentPoints = ACHIEVEMENTS.filter(
    (a) => unlockedIds.has(a.id) && a.category !== "cardio",
  ).reduce((acc, a) => acc + a.points, 0);

  const kineticShards = ACHIEVEMENTS.filter(
    (a) => unlockedIds.has(a.id) && a.category === "cardio",
  ).reduce((acc, a) => acc + a.points * 10, 0); // 1 point = 10 shards

  // 2. Iterate ranks (Highest ID first) to find the current rank
  // Rank requires TP threshold, KS threshold, AND Gate check.
  const reversedRanks = [...TITAN_RANKS].sort((a, b) => b.id - a.id);

  const currentRank = reversedRanks.find((rank) => {
    const meetsTp = talentPoints >= rank.minTp;
    const meetsKs = kineticShards >= rank.minKs;
    const meetsGate = checkGate(rank.id, unlockedIds);
    return meetsTp && meetsKs && meetsGate;
  }) || {
    id: 0,
    name: "Unranked",
    minTp: 0,
    minKs: 0,
    gateDescription: "Complete quests to earn rank.",
  };

  const currentRankIndex = TITAN_RANKS.findIndex(
    (r) => r.id === currentRank.id,
  );

  // 3. Determine next rank
  let nextRank = null;
  if (currentRank.id === 0) {
    nextRank = TITAN_RANKS[0];
  } else if (currentRankIndex < TITAN_RANKS.length - 1) {
    nextRank = TITAN_RANKS[currentRankIndex + 1];
  }

  const isElite = currentRank.id === 5;

  // 4. Calculate Level (XP Proxy for XP Bar)
  // Formula: (TP * 10) + (KS / 10 * 2) = Total XP. 100 XP per level.
  const totalXP = talentPoints * 10 + (kineticShards / 10) * 2;
  const level = Math.floor(totalXP / 100) + 1;

  return {
    currentRank,
    nextRank,
    level,
    talentPoints,
    kineticShards,
    isElite,
  };
};

/**
 * Calculates Football Manager style attributes (1-20) based on progress.
 * NEW: Accepts meditationLogs to boost Mental stat.
 */
export const calculateTitanAttributes = (
  unlockedIds: Set<string>,
  wellness: IntervalsWellness | null,
  purchasedSkills: Set<string>,
  meditationLogs: MeditationLog[] = [],
): TitanAttributes => {
  // Helper to normalize counts to 1-20 scale
  const normalize = (val: number, max: number) => {
    return Math.max(1, Math.min(20, Math.round((val / max) * 20)));
  };

  // --- PHYSICAL ATTRIBUTES ---

  // 1. MAX STRENGTH (P-Max)
  // Based on Push/Legs Tree & 1RM feats
  const strengthTalents = SKILL_TREE.filter(
    (n) => n.category === "push" || n.category === "legs",
  ).length;
  const strengthUnlocked = SKILL_TREE.filter(
    (n) =>
      (n.category === "push" || n.category === "legs") &&
      purchasedSkills.has(n.id),
  ).length;
  // Strength Calculation - Phase 1 starts low
  const strengthScore = normalize(strengthUnlocked, strengthTalents + 5);

  // 2. ENDURANCE (Aerobic/Anaerobic Cap)
  // Based on Endurance Tree + VO2 Max
  const endTalents = SKILL_TREE.filter(
    (n) => n.category === "endurance",
  ).length;
  const endUnlocked = SKILL_TREE.filter(
    (n) => n.category === "endurance" && purchasedSkills.has(n.id),
  ).length;
  let vo2Bonus = 0;
  if (wellness && wellness.vo2max) {
    vo2Bonus = Math.max(0, (wellness.vo2max - 30) / 5); // 30=0, 55=5pts
  }
  const enduranceScore = normalize(endUnlocked + vo2Bonus, endTalents + 8);

  // 3. HYPERTROPHY (Muscular Endurance)
  // Based on Pull Tree + Total Achievement Volume
  const pullSkills = SKILL_TREE.filter(
    (n) => n.category === "pull" && purchasedSkills.has(n.id),
  ).length;
  const totalCheevos = unlockedIds.size;
  const hypScore = normalize(pullSkills * 2 + totalCheevos / 2, 25);

  // --- MENTAL ATTRIBUTES (PHASE 1 FOCUS) ---

  // 4. MENTAL (Consistency & Focus & Mindfulness)
  const { level } = calculateTitanRank(unlockedIds);

  // Calculate Meditation Minutes (Last 7 days)
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentMeditationMinutes = meditationLogs
    .filter((log) => new Date(log.date) > oneWeekAgo)
    .reduce((sum, log) => sum + log.durationMinutes, 0);

  // Mental Calculation: Level (0-10) + Mindfulness (0-10)
  // 60 minutes of meditation per week = 5 points
  const mindfulnessBonus = Math.min(
    10,
    Math.ceil(recentMeditationMinutes / 12),
  );
  const mentalScore = Math.min(20, normalize(level, 10) + mindfulnessBonus);

  // 5. RECOVERY (Biological State)
  // Purely wellness based (0-100 -> 1-20)
  let recScore = 7; // Phase 1 Baseline
  if (wellness) {
    const sleep = wellness.sleepScore || 50;
    const bb = wellness.bodyBattery || 50;
    const hrv = wellness.hrv || 40;

    // Complex calculation: Sleep is king, HRV is queen
    const weightedWellness = sleep * 0.5 + bb * 0.3 + (hrv / 100) * 20;
    recScore = Math.ceil(weightedWellness / 5);
  }

  // --- TECHNICAL ATTRIBUTES ---

  // 6. TECHNIQUE (Form/Setup)
  // Based on Professions (Setup speed, nutrition) + Core
  const techCheevos = ACHIEVEMENTS.filter(
    (a) => a.category === "professions" && unlockedIds.has(a.id),
  ).length;
  const coreSkills = SKILL_TREE.filter(
    (n) => n.category === "core" && purchasedSkills.has(n.id),
  ).length;
  const techScore = normalize(techCheevos + coreSkills, 10);

  return {
    strength: strengthScore,
    endurance: enduranceScore,
    technique: techScore,
    mental: mentalScore,
    recovery: recScore,
    hypertrophy: hypScore,
  };
};

/**
 * Calculates the adaptive cost of a skill node based on wellness state.
 * Uses a granular Readiness Score (0-100).
 */
export const calculateAdaptiveCost = (
  node: SkillNode,
  wellness: IntervalsWellness | null,
) => {
  if (!wellness) return { cost: node.cost, modifier: 0 };

  // Calculate Composite Readiness Score (0-100)
  // We assume 50 is a neutral baseline for missing values
  const sleep = wellness.sleepScore || 50;
  // HRV Baseline assumption: 60ms is "100%" for normalization purposes in this MVP
  // In a production app, this would be relative to the user's specific baseline.
  const hrv = wellness.hrv ? Math.min(100, (wellness.hrv / 60) * 100) : 50;
  const bb = wellness.bodyBattery || 50;

  // Formula: 40% Sleep, 40% Body Battery, 20% HRV
  const readiness = sleep * 0.4 + bb * 0.4 + hrv * 0.2;

  let modifier = 0;

  if (readiness > 80) {
    // High Readiness: Discount intense physical trees to encourage capitalization
    // "Strike while the iron is hot"
    if (["push", "legs", "endurance"].includes(node.category)) {
      modifier = -0.2; // 20% discount
    }
  } else if (readiness < 40) {
    // Low Readiness: Tax intense stuff to discourage injury risk
    if (["push", "legs", "endurance"].includes(node.category)) {
      modifier = 0.25; // 25% Cost Penalty (Discourage High CNS Load)
    } else if (["core"].includes(node.category)) {
      // Core is considered Active Recovery / Stability work
      // Discount this to encourage "recovery" behavior
      modifier = -0.15; // 15% discount
    }
  }

  const newCost = Math.round(node.cost * (1 + modifier));
  // Ensure cost doesn't drop below 1
  return { cost: Math.max(1, newCost), modifier };
};

/**
 * Calculates plates needed for a target weight.
 */
export const calculatePlates = (
  targetWeight: number,
  barWeight = 20,
  isSingleLoaded = false,
) => {
  let remaining = Math.max(0, targetWeight - barWeight);

  if (!isSingleLoaded) {
    remaining = remaining / 2;
  }

  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const plates: number[] = [];

  for (const plate of availablePlates) {
    while (remaining >= plate) {
      plates.push(plate);
      remaining -= plate;
    }
  }

  return plates;
};

export const roundToPlates = (weight: number) => {
  return Math.round(weight / 2.5) * 2.5;
};

/**
 * Determines loot rarity based on intensity relative to TM.
 * Upgraded to consider actual performance (reps > target).
 */
export const calculateRarity = (
  set: WorkoutSet,
  exLogic: ExerciseLogic,
): Rarity => {
  // 1. PR Zones are always Epic initially
  if (set.isPrZone) {
    // If completed reps far exceed expectations, upgrade to Legendary
    // Assumption: For AMRAP 1+, getting 10+ is legendary
    if (
      typeof set.reps === "string" &&
      set.completedReps &&
      set.completedReps >= 10
    ) {
      return "legendary";
    }
    return "epic";
  }

  // 2. Performance Upgrades (Did you do more than asked?)
  if (
    typeof set.reps === "number" &&
    set.completedReps &&
    set.completedReps > set.reps
  ) {
    // Exceeding fixed reps usually implies accessory work, so Rare
    return "rare";
  }

  // 3. Weight Percentage Logic
  if (set.weightPct) {
    if (set.weightPct < 0.5) return "poor";
    if (set.weightPct < 0.7) return "common";
    if (set.weightPct < 0.85) return "uncommon";
    if (set.weightPct >= 0.85) return "rare";
  }

  // Fixed reps usually accessory
  if (exLogic === ExerciseLogic.FIXED_REPS) {
    return "common";
  }

  return "common";
};

/**
 * RPG Audio Engine (Singleton Optimized)
 * Uses a single AudioContext to prevent garbage collection pauses and memory leaks.
 */
class AudioController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.5; // Master volume
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public play(
    type:
      | "ding"
      | "quest_accept"
      | "fail"
      | "loot_epic"
      | "achievement"
      | "mystery_alert"
      | "ui_click"
      | "ui_hover"
      | "ui_error",
  ) {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = ctx.currentTime;

    switch (type) {
      case "ding": // Level Up / Completion
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.3); // C6
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.0);
        break;

      case "quest_accept": // Paper/Scroll sound metaphor (Low thud + swish)
        osc.type = "sine";
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case "loot_epic": // High shimmering sound
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(1760, now + 0.1);
        // Tremolo effect simulation
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.0);
        break;

      case "fail": // Aggro sound
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case "achievement": // Orchestral Snare Hit + Major Chord
        // 1. The Drum Hit
        const noise = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(1, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        noise.connect(this.masterGain);
        noise.start(now);

        // 2. The Chord (C Major: C, E, G)
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((f) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "triangle";
          o.frequency.value = f;

          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.15, now + 0.05); // Attack
          g.gain.exponentialRampToValueAtTime(0.01, now + 2.0); // Decay

          o.connect(this.masterGain!);
          o.start(now);
          o.stop(now + 2.0);
        });
        break;

      case "mystery_alert":
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case "ui_click":
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case "ui_hover":
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.02);
        break;

      case "ui_error":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  }
}

export const audioController = new AudioController();

// Wrapper for backward compatibility
export const playSound = (
  type:
    | "ding"
    | "quest_accept"
    | "fail"
    | "loot_epic"
    | "achievement"
    | "mystery_alert"
    | "ui_click"
    | "ui_hover"
    | "ui_error",
) => {
  audioController.play(type);
};

/**
 * P2: Haptic Feedback for mobile devices
 * Uses navigator.vibrate() API when available
 */
export const triggerHaptic = (
  type: "light" | "medium" | "heavy" | "success" | "error",
) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    switch (type) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(25);
        break;
      case "heavy":
        navigator.vibrate([50, 30, 50]);
        break;
      case "success":
        navigator.vibrate([30, 20, 30, 20, 50]);
        break;
      case "error":
        navigator.vibrate([100, 50, 100]);
        break;
    }
  }
};

export const fireConfetti = () => {
  // Re-using existing confetti but maybe we call it "Loot Explosion" conceptually
  const colors = ["#a335ee", "#0070dd", "#1eff00", "#ff8000"]; // Rarity colors
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: any[] = [];
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 5 + 2,
      life: 100,
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach((p) => {
      if (p.life > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravity
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });
    if (active) requestAnimationFrame(animate);
    else document.body.removeChild(canvas);
  };
  animate();
};

export const autoRegulateSession = (session: Session): Session => {
  const newSession = JSON.parse(JSON.stringify(session));

  newSession.blocks.forEach((block: Block) => {
    if (block.type === "station" && block.exercises) {
      block.exercises.forEach((ex: Exercise) => {
        if (ex.logic === ExerciseLogic.TM_PERCENT) {
          ex.name = `[FATIGUED] ${ex.name}`;
          ex.instructions = [
            "Debuff Active: -40% Intensity.",
            "Objective: Survive.",
            ...(ex.instructions || []),
          ];

          const newSets: WorkoutSet[] = [];
          ex.sets.forEach((set: WorkoutSet, idx: number) => {
            if (idx < 3) {
              const newSet = { ...set };
              if (newSet.weightPct && newSet.weightPct > 0.6) {
                newSet.weightPct = 0.6;
                newSet.rarity = "poor"; // Grey quality items
              }
              if (newSet.isPrZone) {
                newSet.isPrZone = false;
                newSet.reps = 5;
              }
              newSets.push(newSet);
            }
          });
          ex.sets = newSets;
        }
      });
    }
  });

  newSession.name += " (Volume Cap)";
  return newSession;
};
