-- AlterTable
ALTER TABLE "User" ADD COLUMN     "homeLatitude" DOUBLE PRECISION,
ADD COLUMN     "homeLongitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "TerritoryTile" (
    "id" TEXT NOT NULL,
    "cityId" TEXT,
    "cityName" TEXT,
    "currentOwnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerritoryTile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TileControl" (
    "id" TEXT NOT NULL,
    "tileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "controlPoints" INTEGER NOT NULL DEFAULT 0,
    "lastVisitAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitCount" INTEGER NOT NULL DEFAULT 1,
    "dailyVisits" INTEGER NOT NULL DEFAULT 1,
    "lastDailyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TileControl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TerritoryTile_cityId_idx" ON "TerritoryTile"("cityId");

-- CreateIndex
CREATE INDEX "TerritoryTile_currentOwnerId_idx" ON "TerritoryTile"("currentOwnerId");

-- CreateIndex
CREATE INDEX "TileControl_userId_idx" ON "TileControl"("userId");

-- CreateIndex
CREATE INDEX "TileControl_tileId_idx" ON "TileControl"("tileId");

-- CreateIndex
CREATE UNIQUE INDEX "TileControl_tileId_userId_key" ON "TileControl"("tileId", "userId");

-- AddForeignKey
ALTER TABLE "TerritoryTile" ADD CONSTRAINT "TerritoryTile_currentOwnerId_fkey" FOREIGN KEY ("currentOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TileControl" ADD CONSTRAINT "TileControl_tileId_fkey" FOREIGN KEY ("tileId") REFERENCES "TerritoryTile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TileControl" ADD CONSTRAINT "TileControl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
