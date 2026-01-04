-- CreateEnum
CREATE TYPE "TerritoryType" AS ENUM ('TRAINING_GROUNDS', 'RESOURCE_NODE', 'FORTRESS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "garminAccessToken" TEXT,
ADD COLUMN     "garminConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "garminRefreshToken" TEXT,
ADD COLUMN     "garminUserSecret" TEXT,
ADD COLUMN     "garminUserToken" TEXT,
ADD COLUMN     "preferences" JSONB;

-- CreateTable
CREATE TABLE "Territory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "type" "TerritoryType" NOT NULL DEFAULT 'TRAINING_GROUNDS',
    "bonuses" JSONB NOT NULL,
    "coordX" INTEGER NOT NULL DEFAULT 0,
    "coordY" INTEGER NOT NULL DEFAULT 0,
    "controlledById" TEXT,
    "controlledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Territory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerritoryContestEntry" (
    "id" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "workoutCount" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "memberCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TerritoryContestEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerritoryHistory" (
    "id" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lostAt" TIMESTAMP(3),
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "TerritoryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Territory_region_idx" ON "Territory"("region");

-- CreateIndex
CREATE INDEX "Territory_controlledById_idx" ON "Territory"("controlledById");

-- CreateIndex
CREATE INDEX "TerritoryContestEntry_territoryId_weekNumber_year_idx" ON "TerritoryContestEntry"("territoryId", "weekNumber", "year");

-- CreateIndex
CREATE UNIQUE INDEX "TerritoryContestEntry_territoryId_guildId_weekNumber_year_key" ON "TerritoryContestEntry"("territoryId", "guildId", "weekNumber", "year");

-- AddForeignKey
ALTER TABLE "Territory" ADD CONSTRAINT "Territory_controlledById_fkey" FOREIGN KEY ("controlledById") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryContestEntry" ADD CONSTRAINT "TerritoryContestEntry_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryHistory" ADD CONSTRAINT "TerritoryHistory_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
