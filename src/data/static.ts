
import { Session, BlockType, ExerciseLogic, SkillNode, Achievement, TitanRank } from '../types';

// ... (SESSIONS and SKILL_TREE remain unchanged, copying them back or using placeholders if I can't shorten? The instructions say "Full content of file_1". I must output the full content.)
// I will output the full content of data.ts.

export const SESSIONS: Session[] = [
  {
    id: 'session_a',
    name: 'Pass A: Landmine & Heavy Pull',
    blocks: [
      {
        id: 'block_warmup_general',
        name: 'Warmup: General',
        type: BlockType.WARMUP,
        exercises: [
          {
            id: 'ex_band_pullaparts',
            name: 'Band Pullaparts',
            logic: ExerciseLogic.FIXED_REPS,
            instructions: [
              'Grip: Shoulder width, palms down.',
              'Action: Pull band apart until it touches chest.',
              'Focus: Retract scapula, keep elbows straight.',
              'Tempo: Controlled concentric, slow eccentric.'
            ],
            // Standard YouTube demonstration for non-Hyper Pro exercise
            demoUrl: 'https://www.youtube.com/watch?v=foB0MVq24kM',
            sets: [
              { id: 'wp1', reps: 25, completed: false },
              { id: 'wp2', reps: 25, completed: false }
            ]
          }
        ]
      },
      {
        id: 'block_landmine_setup',
        name: 'Initial Setup',
        type: BlockType.TRANSITION,
        targetSetupName: 'Landmine Station',
        setupInstructions: [
          'Insert Landmine attachment to upright A.',
          'Load Barbell into landmine.',
          'Set safety arms to lowest position.',
          'Prepare plates: 20s and 10s nearby.'
        ]
      },
      {
        id: 'block_landmine_main',
        name: 'Station: Landmine Press',
        type: BlockType.STATION,
        exercises: [
          {
            id: 'ex_landmine_press',
            name: 'Landmine Press (Viking Handle)',
            logic: ExerciseLogic.TM_PERCENT,
            trainingMax: 80, // Example TM
            instructions: [
              'Stance: Shoulder width, slight forward lean.',
              'Grip: Neutral grip on Viking handle.',
              'Execution: Press explosively, control the descent.',
              'Cue: "Punch through the ceiling".'
            ],
            // Specific tutorial for Viking Press
            demoUrl: 'https://www.youtube.com/watch?v=J3FVVz-AqrM',
            sets: [
              { id: 's1', reps: 5, weightPct: 0.65, completed: false },
              { id: 's2', reps: 5, weightPct: 0.75, completed: false },
              { id: 's3', reps: 'AMRAP', weightPct: 0.85, completed: false, isPrZone: true }
            ]
          }
        ]
      },
      {
        id: 'block_transition_ghd',
        name: 'Rebuild: GHD Mode',
        type: BlockType.TRANSITION,
        targetSetupName: 'Hyper Pro GHD Mode',
        setupInstructions: [
          'Remove Barbell & Landmine attachment.',
          'Adjust footplate to vertical position.',
          'Install knee pads (Slot 6).',
          'PRO TIP: Ligg tvärs över kuddarna för Pullover.'
        ]
      },
      {
        id: 'block_ghd_acc',
        name: 'Station: Posterior Chain',
        type: BlockType.STATION,
        exercises: [
          {
            id: 'ex_ghd_raise',
            name: 'GHD Raise',
            logic: ExerciseLogic.FIXED_REPS,
            instructions: [
              'Setup: Knees just behind the pad apex.',
              'Eccentric: Lower torso until parallel to floor.',
              'Concentric: Drive toes into plate, pull with hamstrings.',
              'Do not hyperextend lumbar spine at top.'
            ],
            // High quality GHD form guide
            demoUrl: 'https://www.youtube.com/watch?v=vWbTqX74BGs',
            sets: [
              { id: 'g1', reps: 10, weight: 0, completed: false },
              { id: 'g2', reps: 10, weight: 0, completed: false },
              { id: 'g3', reps: 10, weight: 0, completed: false },
            ]
          },
          {
            id: 'ex_db_pullover',
            name: 'DB Pullover (on GHD)',
            logic: ExerciseLogic.FIXED_REPS,
            instructions: [
              'Position: Upper back across GHD pads (perpendicular).',
              'Hips: Keep low to maximize thoracic stretch.',
              'Movement: Lower dumbbell until distinct lat stretch felt.',
              'Return: Pull over to chest level only.'
            ],
            // Specific YouTube search for this niche variation
            demoUrl: 'https://www.youtube.com/results?search_query=dumbbell+pullover+on+ghd',
            sets: [
              { id: 'p1', reps: 12, weight: 24, completed: false },
              { id: 'p2', reps: 12, weight: 24, completed: false },
              { id: 'p3', reps: 12, weight: 24, completed: false },
            ]
          }
        ]
      },
      {
        id: 'block_placeholder_setup',
        name: 'Setup: Placeholder Area',
        type: BlockType.TRANSITION,
        targetSetupName: 'Placeholder Configuration',
        setupInstructions: [
          'Arrange equipment as needed.',
          'Verify safety measures.',
          'Prepare for the placeholder exercises.'
        ]
      },
      {
        id: 'block_placeholder_station',
        name: 'Station: Placeholder',
        type: BlockType.STATION,
        exercises: [
          {
            id: 'ex_placeholder_1',
            name: 'Placeholder Movement A',
            logic: ExerciseLogic.FIXED_REPS,
            instructions: [
              'Execute movement pattern.',
              'Maintain consistent tempo.'
            ],
            sets: [
              { id: 'ph_a1', reps: 12, completed: false },
              { id: 'ph_a2', reps: 12, completed: false }
            ]
          },
          {
            id: 'ex_placeholder_2',
            name: 'Placeholder Movement B',
            logic: ExerciseLogic.FIXED_REPS,
            instructions: [
              'Isolate the target muscle.',
              'Squeeze at the peak of contraction.'
            ],
            sets: [
              { id: 'ph_b1', reps: 15, completed: false },
              { id: 'ph_b2', reps: 15, completed: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'session_b',
    name: 'Pass B: Belt Squat & Bench',
    blocks: [
      {
        id: 'block_belt_setup',
        name: 'Initial Setup',
        type: BlockType.TRANSITION,
        targetSetupName: 'Belt Squat Station',
        setupInstructions: [
          'Warning: Belt Squat Setup: Lossa sprint B.',
          'Fäll ryggstöd till plant läge.',
          'Connect Belt Squat lever arm.',
          'Attach belt to carabiner.'
        ]
      },
      {
        id: 'block_belt_squat',
        name: 'Station: Belt Squat',
        type: BlockType.STATION,
        exercises: [
          {
            id: 'ex_belt_squat',
            name: 'Belt Squat',
            logic: ExerciseLogic.TM_PERCENT,
            trainingMax: 140,
            instructions: [
              'Setup: Attach belt low on hips.',
              'Unrack: Stand tall to disengage lever arm safety.',
              'Squat: Maintain upright torso, sit down between legs.',
              'Depth: Hip crease below knee.'
            ],
            // Official Freak Athlete Belt Squat Demo
            demoUrl: 'https://www.youtube.com/watch?v=QAwV2VJKOqI',
            sets: [
              { id: 'bs1', reps: 5, weightPct: 0.65, completed: false },
              { id: 'bs2', reps: 5, weightPct: 0.75, completed: false },
              { id: 'bs3', reps: 'AMRAP', weightPct: 0.85, completed: false, isPrZone: true }
            ]
          }
        ]
      }
    ]
  }
];

export const SKILL_TREE: SkillNode[] = [
  // --- ROOT ---
  {
    id: 'root_start',
    title: 'Titan Initiate',
    description: 'The journey begins. Complete your first workout session.',
    category: 'utility',
    parents: [],
    x: 0,
    y: 0,
    currency: 'talent_point',
    cost: 1,
    requirements: [
      { type: 'achievement_count', exercise_id: 'any', value: 1, comparison: 'gte' }
    ]
  },

  // --- NORTH: PUSH (Standard Strength) ---
  {
    id: 'push_1',
    title: 'Iron Shoulder',
    description: 'Stabilize the overhead press. Unlocks "Viking Press" variation.',
    category: 'strength',
    parents: ['root_start'],
    x: 0,
    y: -150,
    currency: 'talent_point',
    cost: 1,
    requirements: [
      { type: '1rm_weight', exercise_id: 'ex_landmine_press', value: 30, comparison: 'gte' }
    ]
  },
  {
    id: 'push_2',
    title: 'Viking Strength',
    description: 'Mastery of the Landmine. Adds +2.5kg to Training Max calculations.',
    category: 'strength',
    parents: ['push_1'],
    x: 0,
    y: -300,
    currency: 'talent_point',
    cost: 2,
    requirements: [
      { type: '1rm_weight', exercise_id: 'ex_landmine_press', value: 50, comparison: 'gte' }
    ]
  },

  // --- SOUTH: LEGS (Standard Strength) ---
  {
    id: 'legs_1',
    title: 'Foundation',
    description: 'Build the base. Unlocks Belt Squat Warmup Templates.',
    category: 'strength',
    parents: ['root_start'],
    x: 0,
    y: 150,
    currency: 'talent_point',
    cost: 1,
    requirements: [
      { type: '1rm_weight', exercise_id: 'ex_belt_squat', value: 60, comparison: 'gte' }
    ]
  },
  {
    id: 'legs_2',
    title: 'Piston Power',
    description: 'Hip drive efficiency increased. Unlocks "Hip Thrust" alternate block.',
    category: 'strength',
    parents: ['legs_1'],
    x: 0,
    y: 300,
    currency: 'talent_point',
    cost: 2,
    requirements: [
      { type: '1rm_weight', exercise_id: 'ex_belt_squat', value: 100, comparison: 'gte' }
    ]
  },
  {
    id: 'legs_3',
    title: 'Quadzilla',
    description: 'Legs of a Titan. Belt Squat setup time reduced by 20% (Mental buff).',
    category: 'strength',
    parents: ['legs_2'],
    x: 0,
    y: 450,
    currency: 'talent_point',
    cost: 3,
    requirements: [
      { type: '1rm_weight', exercise_id: 'ex_belt_squat', value: 140, comparison: 'gte' }
    ]
  },

  // --- NORTH-EAST: BEAST MASTERY (Power/Enrage) ---
  {
    id: 'beast_1',
    title: 'Primal Roar',
    description: 'RPE check reduced by 5% during AMRAP sets.',
    category: 'strength', // Strength Category
    parents: ['root_start'],
    x: 150,
    y: -150,
    currency: 'talent_point',
    cost: 2,
    requirements: [
      { type: 'achievement_count', exercise_id: 'any', value: 3, comparison: 'gte' }
    ]
  },
  {
    id: 'beast_2',
    title: 'Heavy Metal',
    description: 'Unlocks "Joker Sets" logic. Auto-regulates weight up if RPE < 7.',
    category: 'strength',
    parents: ['beast_1'],
    x: 300,
    y: -300,
    currency: 'talent_point',
    cost: 4,
    requirements: [
      { type: '1rm_weight', exercise_id: 'ex_belt_squat', value: 120, comparison: 'gte' }
    ]
  },
  {
    id: 'beast_3',
    title: 'Apex Predator',
    description: 'Daily 1RM inputs no longer require a warmup set confirmation. "Ready on arrival".',
    category: 'strength',
    parents: ['beast_2'],
    x: 450,
    y: -450,
    currency: 'talent_point',
    cost: 8,
    requirements: [
      { type: 'achievement_count', exercise_id: 'any', value: 10, comparison: 'gte' }
    ]
  },

  // --- SOUTH-EAST: ENGINEERING (Setup/Tech) ---
  {
    id: 'eng_1',
    title: 'Gnomish Logistics',
    description: 'Transition timer starts automatically upon block completion.',
    category: 'utility', // Utility Category
    parents: ['root_start'],
    x: 150,
    y: 150,
    currency: 'talent_point',
    cost: 2,
    requirements: [
      { type: 'achievement_count', exercise_id: 'any', value: 2, comparison: 'gte' }
    ]
  },
  {
    id: 'eng_2',
    title: 'Precision Loading',
    description: 'Plate Visualizer highlights change-plates automatically for micro-loading.',
    category: 'utility',
    parents: ['eng_1'],
    x: 300,
    y: 300,
    currency: 'talent_point',
    cost: 3,
    requirements: [
      { type: 'achievement_count', exercise_id: 'any', value: 5, comparison: 'gte' }
    ]
  },
  {
    id: 'eng_3',
    title: 'Grand Architect',
    description: 'Unlocks "Edit Mode" to modify Station blocks mid-workout.',
    category: 'utility',
    parents: ['eng_2'],
    x: 450,
    y: 450,
    currency: 'talent_point',
    cost: 5,
    requirements: [
      { type: 'achievement_count', exercise_id: 'any', value: 8, comparison: 'gte' }
    ]
  },

  // --- WEST: WINDRUNNER (Endurance/Cardio) ---
  {
    id: 'wind_1',
    title: 'Fatigue Shroud',
    description: 'Reduces ATL penalty from cardio sessions by 10%.',
    category: 'endurance',
    parents: ['root_start'],
    x: -150,
    y: 0,
    currency: 'kinetic_shard',
    cost: 500,
    requirements: [
      { type: 'achievement_count', exercise_id: 'any', value: 2, comparison: 'gte' }
    ]
  },
  {
    id: 'wind_2',
    title: 'Aero Tech',
    description: 'Unlocks "Brick Workout" Transitions (Bike -> Run).',
    category: 'endurance',
    parents: ['wind_1'],
    x: -300,
    y: 0,
    currency: 'kinetic_shard',
    cost: 1500,
    requirements: [
      { type: 'achievement_count', exercise_id: 'any', value: 6, comparison: 'gte' }
    ]
  },
  {
    id: 'wind_3',
    title: 'Void Runner',
    description: 'Zone 2 training fills Body Battery 2x faster.',
    category: 'endurance',
    parents: ['wind_2'],
    x: -450,
    y: 0,
    currency: 'kinetic_shard',
    cost: 5000,
    requirements: [
      { type: 'vo2max_value', exercise_id: 'any', value: 50, comparison: 'gte' }
    ]
  },
  {
    id: 'wind_4',
    title: 'Elite Engine',
    description: 'Reach sub-70 VO2 Max range. Unlocks "The 70+ Club" regalia.',
    category: 'endurance',
    parents: ['wind_3'],
    x: -600,
    y: 0,
    currency: 'kinetic_shard',
    cost: 10000,
    requirements: [
      { type: 'vo2max_value', exercise_id: 'any', value: 60, comparison: 'gte' }
    ]
  }
];

export const TITAN_RANKS: TitanRank[] = [
  { id: 1, name: 'Novice Titan', minTp: 5, minKs: 500 },
  { id: 2, name: 'Ascendant Titan', minTp: 15, minKs: 1500, gateDescription: 'Unlock 1 Achievement in Dungeons, Professions, and Cardio.' },
  { id: 3, name: 'Warrior Titan', minTp: 35, minKs: 4000, gateDescription: 'Unlock 3 Feats of Strength Achievements.' },
  { id: 4, name: 'Windrunner Titan', minTp: 60, minKs: 8000, gateDescription: 'Unlock 2 Brick Workout Achievements.' },
  { id: 5, name: 'ELITE TITAN', minTp: 100, minKs: 15000, gateDescription: 'Mastery of All Disciplines.' },
];

export const ACHIEVEMENTS: Achievement[] = [
  // --- GENERAL ---
  {
    id: 'will_of_the_forsaken',
    title: 'Will of the Forsaken',
    description: 'Sleep is for the weak. Complete a workout with Sleep Score < 40.',
    category: 'general',
    points: 1
  },
  {
    id: 'resting_xp_bonus',
    title: 'Resting XP Bonus',
    description: 'Set a PR after 3 consecutive rest days.',
    category: 'general',
    points: 1
  },

  // --- DUNGEONS & RAIDS ---
  {
    id: 'clear_deadmines',
    title: 'Clear the Deadmines',
    description: 'Complete "Landmine Station" without failing a rep.',
    category: 'dungeons',
    points: 2
  },
  {
    id: 'defender_ironforge',
    title: 'Defender of Ironforge',
    description: 'Pass B: 3 sets of Belt Squat with weight > bodyweight.',
    category: 'dungeons',
    points: 2
  },
  {
    id: 'worgen_form',
    title: 'Shadowfang Keep',
    description: 'Perform Nordic Curls with 5s negatives.',
    category: 'dungeons',
    points: 2
  },
  {
    id: 'spine_of_deathwing',
    title: 'Spine of Deathwing',
    description: 'No weak back allowed. Complete 3 sets of heavy GHD Raises or Back Extensions.',
    category: 'dungeons',
    points: 5
  },
  {
    id: 'krol_blade',
    title: 'Krol Blade',
    description: 'Build a back worthy of a raid boss. Complete "Heavy Pull" block with RPE 9.',
    category: 'dungeons',
    points: 5
  },

  // --- PROFESSIONS ---
  {
    id: 'grand_master_engineer',
    title: 'Grand Master Engineer',
    description: 'Complete the GHD Transition in under 2 minutes.',
    category: 'professions',
    points: 1
  },
  {
    id: 'goblin_rocket_fuel',
    title: 'Goblin Rocket Fuel',
    description: 'Consume intra-workout nutrition during the heaviest set.',
    category: 'professions',
    points: 1
  },
  {
    id: 'perfect_plates',
    title: 'Perfect Plates',
    description: 'Load the Landmine Press with over 100kg using perfectly symmetrical plate math (no fractional plates).',
    category: 'professions',
    points: 5
  },

  // --- CARDIO / ENDURANCE (Elite Physics) ---
  {
    id: 'shattered_limits',
    title: 'Shattered Limits (Foundry)',
    description: 'Set a 20min Power PR (FTP) on the Wahoo KICKR while Body Battery < 50.',
    category: 'cardio',
    points: 50 // = 500 Kinetic Shards
  },
  {
    id: 'hour_of_power',
    title: 'The Hour of Power',
    description: 'Complete a 60min TT in Z3 without stopping.',
    category: 'cardio',
    points: 50 // = 500 Kinetic Shards
  },
  {
    id: 'the_high_ground',
    title: 'The High Ground (Barrens)',
    description: 'Treadmill: 5x3min Threshold Intervals at >2% incline.',
    category: 'cardio',
    points: 25 // = 250 Kinetic Shards
  },
  {
    id: 'ghost_pacer',
    title: 'Ghost Pacer',
    description: 'Beat a previous PR time on a 45min run by 5+ seconds.',
    category: 'cardio',
    points: 25
  },
  {
    id: 'kessel_run',
    title: 'The Kessel Run',
    description: 'Complete a 100km Ride or 21km Run in a single session.',
    category: 'cardio',
    points: 100 // = 1000 Kinetic Shards
  },
  // Brick Workout Achievements (Windrunner Gate)
  {
    id: 'brick_novice',
    title: 'Brick Layer',
    description: 'Complete a Brick Session: Heavy Squats followed immediately by 10min Z3 Run.',
    category: 'cardio',
    points: 30
  },
  {
    id: 'brick_master',
    title: 'Ironman Certified',
    description: 'Complete a "Double Brick": Bike -> Run -> Bike -> Run (Transition < 2min).',
    category: 'cardio',
    points: 60
  },
  {
    id: 'the_70_club',
    title: 'The 70+ Club',
    description: 'Achieve an estimated VO2 Max of 70 ml/kg/min or higher.',
    category: 'cardio',
    points: 200, // 2000 shards
  },
  {
    id: 'watopia_conqueror',
    title: 'Watopia Conqueror',
    description: 'Sustain >4.5 W/kg for 20 minutes OR win an A-Cat race.',
    category: 'cardio',
    points: 100
  },

  // --- FEATS OF STRENGTH ---
  {
    id: 'leeroy',
    title: 'Leeeeeeeroy!',
    description: 'Start an AMRAP set with < 60s rest and hit a PR.',
    category: 'feats',
    points: 5
  },
  {
    id: 'thunderfury',
    title: 'Thunderfury, Blessed Blade',
    description: 'Increase e1RM on all Big 3 lifts in one week.',
    category: 'feats',
    points: 10
  },
  {
    id: 'last_man_standing',
    title: 'Last Man Standing',
    description: 'Perform a 20-rep "Widowmaker" set on Belt Squat.',
    category: 'feats',
    points: 5
  },
  {
    id: 'deep_squat_dynasty',
    title: 'Deep Squat Dynasty',
    description: 'Squat 3 plates (140kg) or more for reps to full depth.',
    category: 'feats',
    points: 10
  }
];
