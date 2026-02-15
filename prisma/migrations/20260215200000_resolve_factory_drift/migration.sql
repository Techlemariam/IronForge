-- AlterTable
ALTER TABLE "FactoryStatus" ADD COLUMN "metadata" JSONB;

-- CreateTable
CREATE TABLE "FactoryTask" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "stage" TEXT NOT NULL DEFAULT 'DESIGN',
    "source" TEXT NOT NULL DEFAULT 'DISCORD',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactoryTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FactoryTask_status_idx" ON "FactoryTask"("status");
