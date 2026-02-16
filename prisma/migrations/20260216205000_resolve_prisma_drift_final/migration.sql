-- Rename factory tables to match schema.prisma @@map attributes
ALTER TABLE "FactoryStatus" RENAME TO "factory_statuses";
ALTER TABLE "FactorySettings" RENAME TO "factory_settings";
ALTER TABLE "FactoryTask" RENAME TO "factory_tasks";

-- Rename indexes to match Prisma defaults for mapped tables
ALTER INDEX "FactoryStatus_station_key" RENAME TO "factory_statuses_station_key";
ALTER INDEX "FactoryTask_status_idx" RENAME TO "factory_tasks_status_idx";

-- Add foreign key constraints for active sessions
ALTER TABLE "session_participants" DROP CONSTRAINT IF EXISTS "session_participants_userId_fkey";
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "session_participants" DROP CONSTRAINT IF EXISTS "session_participants_sessionId_fkey";
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "active_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "active_sessions" DROP CONSTRAINT IF EXISTS "active_sessions_hostId_fkey";
ALTER TABLE "active_sessions" ADD CONSTRAINT "active_sessions_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
