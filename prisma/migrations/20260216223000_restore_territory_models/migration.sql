-- CreateTable
CREATE TABLE "TerritoryContest" (
    "id" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "attackerId" TEXT NOT NULL,
    "defenderId" TEXT,
    "attackerScore" INTEGER NOT NULL DEFAULT 0,
    "defenderScore" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerritoryContest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TerritoryContest_territoryId_idx" ON "TerritoryContest"("territoryId");

-- CreateIndex
CREATE INDEX "TerritoryContest_attackerId_idx" ON "TerritoryContest"("attackerId");

-- AddForeignKey
ALTER TABLE "TerritoryContest" ADD CONSTRAINT "TerritoryContest_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryContest" ADD CONSTRAINT "TerritoryContest_attackerId_fkey" FOREIGN KEY ("attackerId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryContest" ADD CONSTRAINT "TerritoryContest_defenderId_fkey" FOREIGN KEY ("defenderId") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;
