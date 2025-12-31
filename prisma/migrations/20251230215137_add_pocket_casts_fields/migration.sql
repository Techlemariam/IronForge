/*
  Warnings:

  - You are about to drop the column `energy` on the `Titan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DuelChallenge" ADD COLUMN     "activityType" TEXT,
ADD COLUMN     "challengerDistance" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "defenderDistance" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "duelType" TEXT DEFAULT 'TITAN_VS_TITAN',
ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "targetDistance" DOUBLE PRECISION,
ADD COLUMN     "wkgTier" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Titan" DROP COLUMN "energy",
ADD COLUMN     "currentEnergy" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "maxEnergy" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pocketCastsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pocketCastsToken" TEXT;

-- AlterTable
ALTER TABLE "UserSkill" ADD COLUMN     "unlocked" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'LOCKED';

-- CreateTable
CREATE TABLE "OracleMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OracleMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillPreset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "skillIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OracleMessage_userId_timestamp_idx" ON "OracleMessage"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "SkillPreset_userId_idx" ON "SkillPreset"("userId");

-- AddForeignKey
ALTER TABLE "OracleMessage" ADD CONSTRAINT "OracleMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillPreset" ADD CONSTRAINT "SkillPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
