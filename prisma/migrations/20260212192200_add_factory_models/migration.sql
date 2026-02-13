-- CreateTable
CREATE TABLE "FactoryStatus" (
    "id" TEXT NOT NULL,
    "station" TEXT NOT NULL,
    "health" INTEGER NOT NULL,
    "current" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactoryStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactorySettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "mode" TEXT NOT NULL DEFAULT 'MANUAL',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactorySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FactoryStatus_station_key" ON "FactoryStatus"("station");
