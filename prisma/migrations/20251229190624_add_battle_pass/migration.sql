-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'LIFETIME');

-- CreateEnum
CREATE TYPE "Faction" AS ENUM ('ALLIANCE', 'HORDE');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('DAILY', 'WEEKLY', 'SEASONAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "heroName" TEXT,
    "email" TEXT,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "totalExperience" INTEGER NOT NULL DEFAULT 0,
    "kineticEnergy" INTEGER NOT NULL DEFAULT 0,
    "bodyWeight" DOUBLE PRECISION NOT NULL DEFAULT 75.0,
    "intervalsApiKey" TEXT,
    "intervalsAthleteId" TEXT,
    "hevyApiKey" TEXT,
    "stravaAccessToken" TEXT,
    "stravaRefreshToken" TEXT,
    "stravaExpiresAt" INTEGER,
    "stravaAthleteId" TEXT,
    "prioritizeHyperPro" BOOLEAN NOT NULL DEFAULT false,
    "ftpCycle" INTEGER DEFAULT 200,
    "ftpRun" INTEGER DEFAULT 250,
    "lthr" INTEGER DEFAULT 170,
    "maxHr" INTEGER DEFAULT 190,
    "restingHr" INTEGER DEFAULT 60,
    "hrv" DOUBLE PRECISION DEFAULT 0.0,
    "hrZones" JSONB,
    "powerZonesCycle" JSONB,
    "powerZonesRun" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginDate" TIMESTAMP(3),
    "loginStreak" INTEGER NOT NULL DEFAULT 0,
    "longestLoginStreak" INTEGER NOT NULL DEFAULT 0,
    "notificationPreferences" JSONB,
    "activePath" TEXT DEFAULT 'HYBRID_WARDEN',
    "currentMacroCycle" TEXT DEFAULT 'ALPHA',
    "mobilityLevel" TEXT DEFAULT 'NONE',
    "recoveryLevel" TEXT DEFAULT 'NONE',
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "subscriptionStatus" TEXT,
    "subscriptionExpiry" TIMESTAMP(3),
    "city" TEXT,
    "country" TEXT,
    "faction" "Faction" NOT NULL DEFAULT 'HORDE',
    "activeTitleId" TEXT,
    "guildId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Titan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Unnamed Titan',
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "currentHp" INTEGER NOT NULL DEFAULT 100,
    "maxHp" INTEGER NOT NULL DEFAULT 100,
    "strength" INTEGER NOT NULL DEFAULT 10,
    "vitality" INTEGER NOT NULL DEFAULT 10,
    "endurance" INTEGER NOT NULL DEFAULT 10,
    "agility" INTEGER NOT NULL DEFAULT 10,
    "willpower" INTEGER NOT NULL DEFAULT 10,
    "mood" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "energy" INTEGER NOT NULL DEFAULT 100,
    "dailyDecree" JSONB,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "currentBuff" JSONB,
    "buffExpiresAt" TIMESTAMP(3),
    "hrvBaseline" DOUBLE PRECISION,
    "isInjured" BOOLEAN NOT NULL DEFAULT false,
    "isResting" BOOLEAN NOT NULL DEFAULT false,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Titan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TitanMemory" (
    "id" TEXT NOT NULL,
    "titanId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TitanMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TitanScar" (
    "id" TEXT NOT NULL,
    "titanId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TitanScar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "CardioLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intervalsId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "load" DOUBLE PRECISION NOT NULL,
    "averageHr" DOUBLE PRECISION,

    CONSTRAINT "CardioLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Title" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conditionType" TEXT NOT NULL,
    "conditionValue" INTEGER NOT NULL,

    CONSTRAINT "Title_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTitle" (
    "userId" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTitle_pkey" PRIMARY KEY ("userId","titleId")
);

-- CreateTable
CREATE TABLE "ExerciseLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sets" JSONB NOT NULL,
    "notes" TEXT,
    "weight" DOUBLE PRECISION,
    "reps" INTEGER,
    "isPersonalRecord" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "secondaryMuscles" TEXT[],
    "equipment" TEXT NOT NULL,
    "videoUrl" TEXT,
    "instructions" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exercises" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION,
    "bodyFat" DOUBLE PRECISION,
    "measurements" JSONB,
    "photoUrl" TEXT,

    CONSTRAINT "BodyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeditationLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMinutes" INTEGER NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "MeditationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrimoireEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "metadata" JSONB,

    CONSTRAINT "GrimoireEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnlockedMonster" (
    "userId" TEXT NOT NULL,
    "monsterId" TEXT NOT NULL,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnlockedMonster_pkey" PRIMARY KEY ("userId","monsterId")
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNLOCKED',

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("userId","skillId")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("userId","achievementId")
);

-- CreateTable
CREATE TABLE "UserEquipment" (
    "userId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "isOwned" BOOLEAN NOT NULL DEFAULT true,
    "equipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserEquipment_pkey" PRIMARY KEY ("userId","equipmentId")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "power" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Monster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "hp" INTEGER NOT NULL DEFAULT 100,
    "weakness" TEXT,
    "stats" JSONB NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Monster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raid_bosses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_hp" BIGINT NOT NULL,
    "current_hp" BIGINT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "rewards" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regionId" TEXT NOT NULL DEFAULT 'iron_forge',
    "levelReq" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "raid_bosses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "levelReq" INTEGER NOT NULL DEFAULT 1,
    "coordX" INTEGER NOT NULL DEFAULT 0,
    "coordY" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "world_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'CHAT',

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PvpProfile" (
    "userId" TEXT NOT NULL,
    "rankScore" INTEGER NOT NULL DEFAULT 1000,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "totalDamageDealt" BIGINT NOT NULL DEFAULT 0,
    "highestWilksScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "season" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "duelElo" INTEGER NOT NULL DEFAULT 1200,
    "duelsWon" INTEGER NOT NULL DEFAULT 0,
    "duelsLost" INTEGER NOT NULL DEFAULT 0,
    "weeklyDuels" INTEGER NOT NULL DEFAULT 0,
    "lastDuelReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PvpProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "BattleLog" (
    "id" TEXT NOT NULL,
    "attackerId" TEXT NOT NULL,
    "defenderId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "battleType" TEXT NOT NULL DEFAULT 'DUEL',
    "logData" JSONB,

    CONSTRAINT "BattleLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "plan" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "criteria" JSONB NOT NULL,
    "rewards" JSONB NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChallenge" (
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChallenge_pkey" PRIMARY KEY ("userId","challengeId")
);

-- CreateTable
CREATE TABLE "GauntletRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wavesCleared" INTEGER NOT NULL,
    "totalDamage" INTEGER NOT NULL,
    "maxHeartRate" INTEGER,
    "avgHeartRate" INTEGER,
    "duration" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'NORMAL',

    CONSTRAINT "GauntletRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT,
    "leaderId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildRaid" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "bossName" TEXT NOT NULL,
    "totalHp" INTEGER NOT NULL,
    "currentHp" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildRaid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildRaidContribution" (
    "id" TEXT NOT NULL,
    "raidId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "damage" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildRaidContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "condition" JSONB NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingProgram" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weeks" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramWeek" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "focus" TEXT NOT NULL,

    CONSTRAINT "ProgramWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramWorkout" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "workoutDefinitionId" TEXT NOT NULL,
    "workoutData" JSONB NOT NULL,

    CONSTRAINT "ProgramWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keys" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuelChallenge" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "defenderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "challengerScore" INTEGER NOT NULL DEFAULT 0,
    "defenderScore" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DuelChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattlePassSeason" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BattlePassSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattlePassTier" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "tierLevel" INTEGER NOT NULL,
    "requiredXp" INTEGER NOT NULL,
    "freeRewardId" TEXT,
    "premiumRewardId" TEXT,
    "freeRewardData" JSONB,
    "premiumRewardData" JSONB,

    CONSTRAINT "BattlePassTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBattlePass" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "hasPremium" BOOLEAN NOT NULL DEFAULT false,
    "seasonXp" INTEGER NOT NULL DEFAULT 0,
    "currentTier" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserBattlePass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBattlePassClaim" (
    "id" TEXT NOT NULL,
    "userBattlePassId" TEXT NOT NULL,
    "tierLevel" INTEGER NOT NULL,
    "isPremium" BOOLEAN NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBattlePassClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Titan_userId_key" ON "Titan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CardioLog_intervalsId_key" ON "CardioLog"("intervalsId");

-- CreateIndex
CREATE INDEX "CardioLog_userId_date_idx" ON "CardioLog"("userId", "date");

-- CreateIndex
CREATE INDEX "ExerciseLog_userId_date_idx" ON "ExerciseLog"("userId", "date");

-- CreateIndex
CREATE INDEX "MeditationLog_userId_date_idx" ON "MeditationLog"("userId", "date");

-- CreateIndex
CREATE INDEX "GrimoireEntry_userId_date_idx" ON "GrimoireEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "WeeklyPlan_userId_weekStart_idx" ON "WeeklyPlan"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_code_key" ON "Challenge"("code");

-- CreateIndex
CREATE INDEX "GauntletRun_userId_wavesCleared_idx" ON "GauntletRun"("userId", "wavesCleared");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_tag_key" ON "Guild"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_leaderId_key" ON "Guild"("leaderId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "DuelChallenge_challengerId_idx" ON "DuelChallenge"("challengerId");

-- CreateIndex
CREATE INDEX "DuelChallenge_defenderId_idx" ON "DuelChallenge"("defenderId");

-- CreateIndex
CREATE INDEX "DuelChallenge_status_idx" ON "DuelChallenge"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BattlePassSeason_code_key" ON "BattlePassSeason"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BattlePassTier_seasonId_tierLevel_key" ON "BattlePassTier"("seasonId", "tierLevel");

-- CreateIndex
CREATE UNIQUE INDEX "UserBattlePass_userId_seasonId_key" ON "UserBattlePass"("userId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBattlePassClaim_userBattlePassId_tierLevel_isPremium_key" ON "UserBattlePassClaim"("userBattlePassId", "tierLevel", "isPremium");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeTitleId_fkey" FOREIGN KEY ("activeTitleId") REFERENCES "Title"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Titan" ADD CONSTRAINT "Titan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TitanMemory" ADD CONSTRAINT "TitanMemory_titanId_fkey" FOREIGN KEY ("titanId") REFERENCES "Titan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TitanScar" ADD CONSTRAINT "TitanScar_titanId_fkey" FOREIGN KEY ("titanId") REFERENCES "Titan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardioLog" ADD CONSTRAINT "CardioLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTitle" ADD CONSTRAINT "UserTitle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTitle" ADD CONSTRAINT "UserTitle_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTemplate" ADD CONSTRAINT "WorkoutTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyMetric" ADD CONSTRAINT "BodyMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeditationLog" ADD CONSTRAINT "MeditationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrimoireEntry" ADD CONSTRAINT "GrimoireEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockedMonster" ADD CONSTRAINT "UnlockedMonster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockedMonster" ADD CONSTRAINT "UnlockedMonster_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "raid_bosses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEquipment" ADD CONSTRAINT "UserEquipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEquipment" ADD CONSTRAINT "UserEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raid_bosses" ADD CONSTRAINT "raid_bosses_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "world_regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpProfile" ADD CONSTRAINT "PvpProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlan" ADD CONSTRAINT "WeeklyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GauntletRun" ADD CONSTRAINT "GauntletRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guild" ADD CONSTRAINT "Guild_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildRaid" ADD CONSTRAINT "GuildRaid_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildRaidContribution" ADD CONSTRAINT "GuildRaidContribution_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "GuildRaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildRaidContribution" ADD CONSTRAINT "GuildRaidContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingProgram" ADD CONSTRAINT "TrainingProgram_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWeek" ADD CONSTRAINT "ProgramWeek_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TrainingProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWorkout" ADD CONSTRAINT "ProgramWorkout_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "ProgramWeek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuelChallenge" ADD CONSTRAINT "DuelChallenge_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuelChallenge" ADD CONSTRAINT "DuelChallenge_defenderId_fkey" FOREIGN KEY ("defenderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuelChallenge" ADD CONSTRAINT "DuelChallenge_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattlePassTier" ADD CONSTRAINT "BattlePassTier_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "BattlePassSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBattlePass" ADD CONSTRAINT "UserBattlePass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBattlePass" ADD CONSTRAINT "UserBattlePass_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "BattlePassSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBattlePassClaim" ADD CONSTRAINT "UserBattlePassClaim_userBattlePassId_fkey" FOREIGN KEY ("userBattlePassId") REFERENCES "UserBattlePass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
