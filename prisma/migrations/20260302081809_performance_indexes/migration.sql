-- AlterTable
ALTER TABLE "Titan" ADD COLUMN     "dailyXpEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastXpReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "GuildRaidContribution_raidId_idx" ON "GuildRaidContribution"("raidId");

-- CreateIndex
CREATE INDEX "GuildRaidContribution_userId_idx" ON "GuildRaidContribution"("userId");

-- CreateIndex
CREATE INDEX "TitanMemory_titanId_idx" ON "TitanMemory"("titanId");

-- CreateIndex
CREATE INDEX "TitanScar_titanId_idx" ON "TitanScar"("titanId");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE INDEX "UserChallenge_userId_idx" ON "UserChallenge"("userId");

-- CreateIndex
CREATE INDEX "UserEquipment_userId_idx" ON "UserEquipment"("userId");
