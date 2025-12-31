-- CreateTable
CREATE TABLE "CombatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bossId" TEXT NOT NULL,
    "bossHp" INTEGER NOT NULL,
    "bossMaxHp" INTEGER NOT NULL,
    "playerHp" INTEGER NOT NULL,
    "playerMaxHp" INTEGER NOT NULL,
    "turnCount" INTEGER NOT NULL DEFAULT 0,
    "isVictory" BOOLEAN NOT NULL DEFAULT false,
    "isDefeat" BOOLEAN NOT NULL DEFAULT false,
    "logs" JSONB[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CombatSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CombatSession_userId_key" ON "CombatSession"("userId");

-- AddForeignKey
ALTER TABLE "CombatSession" ADD CONSTRAINT "CombatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
