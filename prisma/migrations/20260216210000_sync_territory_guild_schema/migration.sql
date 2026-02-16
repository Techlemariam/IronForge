-- AlterTable
ALTER TABLE "Guild" ADD COLUMN "gold" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TerritoryContest" (
    "id" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "attackerId" TEXT NOT NULL,
    "defenderId" TEXT,
    "attackerScore" INTEGER NOT NULL DEFAULT 0,
    "defenderScore" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "winnerId" TEXT,

    CONSTRAINT "TerritoryContest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TerritoryContest_territoryId_idx" ON "TerritoryContest"("territoryId");

-- CreateIndex
CREATE INDEX "TerritoryContest_attackerId_idx" ON "TerritoryContest"("attackerId");

-- CreateIndex
CREATE UNIQUE INDEX "Territory_name_key" ON "Territory"("name");

-- AddForeignKey
ALTER TABLE "TerritoryContest" ADD CONSTRAINT "TerritoryContest_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryContest" ADD CONSTRAINT "TerritoryContest_attackerId_fkey" FOREIGN KEY ("attackerId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryContest" ADD CONSTRAINT "TerritoryContest_defenderId_fkey" FOREIGN KEY ("defenderId") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;
