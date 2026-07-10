// src/data/hyperProProgressions.ts

import type { HyperProProgressionFamily } from '@/types';

export const hyperProProgressions: HyperProProgressionFamily[] = [
  {
    id: 'nordic_curl_progression',
    name: 'Nordic Curl progression family',
    targetPattern: 'KNEE_FLEXION',
    cautionNote: 'Non-medical caution: Hamstrings are susceptible to cramps and strains during eccentric loading. Warm up thoroughly.',
    stages: [
      {
        name: 'Assisted Nordic Curl (Band/Hand Support)',
        rpeGuidance: 'RPE 6-7',
        stopCondition: 'Stop immediately if hamstrings cramp or if hip hinge cannot be maintained.',
        setupMode: 'Nordic Station with band peg or floor pads',
        description: 'Perform eccentric-only movement with strong band assistance or pushing off with hands on the floor to reduce overload.',
      },
      {
        name: 'Partial ROM / Eccentric Nordic Curl',
        rpeGuidance: 'RPE 7-8',
        stopCondition: 'Stop if knee control is lost or eccentric speed accelerates uncontrollably.',
        setupMode: 'Nordic Station',
        description: 'Lower yourself under control as far as possible without support, catching with hands at the bottom, then pushing back up.',
      },
      {
        name: 'Full Range Nordic Curl / Loaded Nordic',
        rpeGuidance: 'RPE 8-9',
        stopCondition: 'Stop if unable to pull back up from the bottom without a large push-off or hip bend.',
        setupMode: 'Nordic Station',
        description: 'Complete full eccentric and concentric phases under control. Add small external weights only when bodyweight is mastered.',
      },
    ],
  },
  {
    id: 'reverse_nordic_progression',
    name: 'Reverse Nordic progression family',
    targetPattern: 'KNEE_EXTENSION',
    cautionNote: 'Non-medical caution: Avoid excessive lean if knee joint discomfort or quad tightness occurs.',
    stages: [
      {
        name: 'Assisted Reverse Nordic',
        rpeGuidance: 'RPE 6-7',
        stopCondition: 'Stop if knee pain or hip flexor pinching is felt.',
        setupMode: 'Floor/Pad with band support behind torso',
        description: 'Lean back under control while holding onto a support band anchored in front to decrease quad loading.',
      },
      {
        name: 'Partial ROM Reverse Nordic',
        rpeGuidance: 'RPE 7-8',
        stopCondition: 'Stop if unable to return to upright position smoothly without momentum.',
        setupMode: 'Floor/Pad',
        description: 'Lean back to a moderate angle (e.g., 45 degrees) under control, maintaining a straight line from knee to shoulder.',
      },
      {
        name: 'Full ROM / Loaded Reverse Nordic',
        rpeGuidance: 'RPE 8-9',
        stopCondition: 'Stop if back arches excessively or hips fold.',
        setupMode: 'Floor/Pad',
        description: 'Lean back until shoulders touch or near the heels, then return to start. Add light plate across chest for loading.',
      },
    ],
  },
  {
    id: 'sissy_squat_progression',
    name: 'Sissy Squat progression family',
    targetPattern: 'KNEE_EXTENSION',
    cautionNote: 'Non-medical caution: Keep hips fully extended to prevent lower back compensation.',
    stages: [
      {
        name: 'Supported Sissy Squat',
        rpeGuidance: 'RPE 6-7',
        stopCondition: 'Stop if pressure on patella feels sharp or unstable.',
        setupMode: 'Sissy Squat Station with hand support (rack or wall)',
        description: 'Perform squatting motion while holding onto an external structure to assist with balance and concentric push.',
      },
      {
        name: 'Bodyweight Sissy Squat',
        rpeGuidance: 'RPE 7-8',
        stopCondition: 'Stop if unable to maintain full knee flexion under tension.',
        setupMode: 'Sissy Squat Station',
        description: 'Squat down on the station without holding external supports, leaning the torso back to load quads.',
      },
      {
        name: 'Weighted Sissy Squat',
        rpeGuidance: 'RPE 8-9',
        stopCondition: 'Stop if knee extension speed drops significantly or form breaks.',
        setupMode: 'Sissy Squat Station',
        description: 'Perform the movement holding a dumbbell or weight plate close to the chest for overload.',
      },
    ],
  },
  {
    id: 'back_extension_progression',
    name: 'Back Extension progression family',
    targetPattern: 'HIP_EXTENSION',
    cautionNote: 'Non-medical caution: Avoid hyper-extending the lower back beyond a neutral straight line.',
    stages: [
      {
        name: 'Bodyweight Back Extension',
        rpeGuidance: 'RPE 6-7',
        stopCondition: 'Stop if lower back tightens or pumps excessively.',
        setupMode: '45° or 90° Extension Station',
        description: 'Perform controlled extensions focusing on glute and hamstring contraction to lift the torso to neutral.',
      },
      {
        name: 'Tempo Back Extension / Iso Hold',
        rpeGuidance: 'RPE 7-8',
        stopCondition: 'Stop if unable to hold peak contraction for the designated duration.',
        setupMode: '45° or 90° Extension Station',
        description: 'Perform extensions with a 3-second hold at the top, or complete full sets with slower eccentric tempos.',
      },
      {
        name: 'Loaded / Single-Leg Back Extension',
        rpeGuidance: 'RPE 8-9',
        stopCondition: 'Stop if upper back rounds or single-leg balance fails.',
        setupMode: '45° or 90° Extension Station',
        description: 'Add load using a barbell or plate, or perform unilaterally (single-leg) to correct left-right imbalances.',
      },
    ],
  },
  {
    id: 'reverse_hyper_progression',
    name: 'Reverse Hyper progression family',
    targetPattern: 'HIP_EXTENSION',
    cautionNote: 'Non-medical caution: Keep movement controlled. Avoid using excessive momentum or swing.',
    stages: [
      {
        name: 'Bodyweight / Light Reverse Hyper',
        rpeGuidance: 'RPE 6-7',
        stopCondition: 'Stop if lower back feels a pinching sensation.',
        setupMode: 'Reverse Hyper Attachment',
        description: 'Perform high-rep, controlled leg lifts to horizontal without added weight to pump blood and build activation.',
      },
      {
        name: 'Controlled Tempo Reverse Hyper',
        rpeGuidance: 'RPE 7-8',
        stopCondition: 'Stop if swing speed becomes erratic or out of control.',
        setupMode: 'Reverse Hyper Attachment',
        description: 'Add light plate loading, emphasizing a slow 2-second eccentric phase and brief hold at the top.',
      },
      {
        name: 'Loaded Reverse Hyper',
        rpeGuidance: 'RPE 8-9',
        stopCondition: 'Stop if range of motion drops below horizontal.',
        setupMode: 'Reverse Hyper Attachment',
        description: 'Load heavier plates, using controlled hip extension to build strength in glutes and lower back.',
      },
    ],
  },
  {
    id: 'ghd_sit_up_progression',
    name: 'GHD Sit-Up progression family',
    targetPattern: 'TRUNK_CORE',
    cautionNote: 'Non-medical caution: Full range extension loads the abdominals in extreme stretch. Build up range slowly.',
    stages: [
      {
        name: 'Short ROM GHD Sit-Up (To Parallel)',
        rpeGuidance: 'RPE 6-7',
        stopCondition: 'Stop if rectus abdominis cramps or hip flexor strain occurs.',
        setupMode: 'GHD Station',
        description: 'Lower torso only until parallel with the floor, then pull back to upright. Focus on pulling with abs rather than hip flexors.',
      },
      {
        name: 'Full ROM GHD Sit-Up',
        rpeGuidance: 'RPE 7-8',
        stopCondition: 'Stop if unable to rise without using severe arm/leg momentum.',
        setupMode: 'GHD Station',
        description: 'Lower torso fully until hands touch or near the floor, then contract aggressively to return to upright.',
      },
      {
        name: 'Weighted / Iso-Hold GHD Sit-Up',
        rpeGuidance: 'RPE 8-9',
        stopCondition: 'Stop if unable to maintain rigid core integrity throughout.',
        setupMode: 'GHD Station',
        description: 'Hold a medicine ball or light plate near the chest, or add isometric holds at parallel during the set.',
      },
    ],
  },
];
