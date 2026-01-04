-- AlterTable
ALTER TABLE "Guild" ADD COLUMN "powerRating" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BattleEmote" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "gifPath" TEXT NOT NULL,
    "unlockLevel" INTEGER NOT NULL DEFAULT 1,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "seasonCode" TEXT,

    CONSTRAINT "BattleEmote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PvpEmoteLog" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "emoteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PvpEmoteLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PvpSeason" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "rewards" JSONB NOT NULL,

    CONSTRAINT "PvpSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PvpRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1200,
    "peakRating" INTEGER NOT NULL DEFAULT 1200,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "rank" TEXT NOT NULL DEFAULT 'BRONZE',

    CONSTRAINT "PvpRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PvpMatch" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "winnerId" TEXT,
    "player1Rating" INTEGER NOT NULL,
    "player2Rating" INTEGER NOT NULL,
    "ratingChange" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PvpMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BattleEmote_category_idx" ON "BattleEmote"("category");

-- CreateIndex
CREATE INDEX "BattleEmote_isPremium_idx" ON "BattleEmote"("isPremium");

-- CreateIndex
CREATE INDEX "PvpEmoteLog_matchId_idx" ON "PvpEmoteLog"("matchId");

-- CreateIndex
CREATE INDEX "PvpEmoteLog_senderId_idx" ON "PvpEmoteLog"("senderId");

-- CreateIndex
CREATE INDEX "PvpRating_seasonId_rating_idx" ON "PvpRating"("seasonId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "PvpRating_userId_seasonId_key" ON "PvpRating"("userId", "seasonId");

-- CreateIndex
CREATE INDEX "PvpMatch_seasonId_idx" ON "PvpMatch"("seasonId");

-- CreateIndex
CREATE INDEX "PvpMatch_player1Id_idx" ON "PvpMatch"("player1Id");

-- CreateIndex
CREATE INDEX "PvpMatch_player2Id_idx" ON "PvpMatch"("player2Id");

-- AddForeignKey
ALTER TABLE "PvpRating" ADD CONSTRAINT "PvpRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpRating" ADD CONSTRAINT "PvpRating_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "PvpSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpMatch" ADD CONSTRAINT "PvpMatch_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "PvpSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpEmoteLog" ADD CONSTRAINT "PvpEmoteLog_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "PvpMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpEmoteLog" ADD CONSTRAINT "PvpEmoteLog_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "BattleEmote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
