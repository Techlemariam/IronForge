-- CreateTable
CREATE TABLE "factory_statuses" (
    "id" TEXT NOT NULL,
    "station" TEXT NOT NULL,
    "health" INTEGER NOT NULL,
    "current" TEXT,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factory_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factory_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "mode" TEXT NOT NULL DEFAULT 'MANUAL',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factory_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factory_tasks" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "stage" TEXT NOT NULL DEFAULT 'DESIGN',
    "source" TEXT NOT NULL DEFAULT 'DISCORD',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factory_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "factory_statuses_station_key" ON "factory_statuses"("station");

-- CreateIndex
CREATE INDEX "factory_tasks_status_idx" ON "factory_tasks"("status");
