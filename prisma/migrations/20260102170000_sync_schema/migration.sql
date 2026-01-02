-- CreateEnum
CREATE TYPE "Archetype" AS ENUM ('JUGGERNAUT', 'PATHFINDER', 'WARDEN');

-- AlterTable
ALTER TABLE "ExerciseLog" ADD COLUMN     "archetype" "Archetype" NOT NULL DEFAULT 'WARDEN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "archetype" "Archetype" NOT NULL DEFAULT 'WARDEN',
ADD COLUMN     "archetypeSetAt" TIMESTAMP(3),
ALTER COLUMN "activePath" SET DEFAULT 'WARDEN';
