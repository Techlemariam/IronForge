-- AlterTable
ALTER TABLE "DuelChallenge" ADD COLUMN     "challengerDuration" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "challengerElevation" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "defenderDuration" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "defenderElevation" DOUBLE PRECISION DEFAULT 0;
