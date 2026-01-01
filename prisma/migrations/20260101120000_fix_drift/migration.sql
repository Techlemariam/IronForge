-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('BODYWEIGHT', 'BARBELL', 'DUMBBELL', 'CABLE', 'MACHINE', 'KETTLEBELL', 'BAND', 'HYPER_PRO', 'OTHER');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "equipmentType" "EquipmentType";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "consecutiveStalls" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "macroCycleStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nutritionMode" TEXT DEFAULT 'MAINTENANCE';

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
