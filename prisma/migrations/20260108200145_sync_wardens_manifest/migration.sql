-- CreateTable
CREATE TABLE "MobilityExercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ATG',
    "difficulty" TEXT NOT NULL DEFAULT 'BEGINNER',
    "durationSecs" INTEGER NOT NULL DEFAULT 60,
    "videoUrl" TEXT,
    "instructions" TEXT,
    "costCns" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "costMuscular" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "costMetabolic" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "targetRegions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobilityExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobilityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSecs" INTEGER NOT NULL,
    "notes" TEXT,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "passiveLayerLevel" TEXT,

    CONSTRAINT "MobilityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WardensManifest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "phaseStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phaseWeek" INTEGER NOT NULL DEFAULT 1,
    "autoRotate" BOOLEAN NOT NULL DEFAULT true,
    "privacyHealth" BOOLEAN NOT NULL DEFAULT true,
    "privacyPublic" BOOLEAN NOT NULL DEFAULT true,
    "goals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WardensManifest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MobilityExercise_source_idx" ON "MobilityExercise"("source");

-- CreateIndex
CREATE INDEX "MobilityExercise_difficulty_idx" ON "MobilityExercise"("difficulty");

-- CreateIndex
CREATE INDEX "MobilityLog_userId_date_idx" ON "MobilityLog"("userId", "date");

-- CreateIndex
CREATE INDEX "MobilityLog_exerciseId_idx" ON "MobilityLog"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "WardensManifest_userId_key" ON "WardensManifest"("userId");

-- AddForeignKey
ALTER TABLE "MobilityLog" ADD CONSTRAINT "MobilityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobilityLog" ADD CONSTRAINT "MobilityLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "MobilityExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WardensManifest" ADD CONSTRAINT "WardensManifest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
