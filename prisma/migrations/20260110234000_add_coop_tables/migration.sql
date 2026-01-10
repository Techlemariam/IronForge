-- CreateTable
CREATE TABLE "active_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "workoutName" TEXT,
    "maxParticipants" INTEGER NOT NULL DEFAULT 4,
    "inviteCode" TEXT,

    CONSTRAINT "active_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "heroName" TEXT,
    "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastHeartbeat" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "active_sessions_inviteCode_key" ON "active_sessions"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "session_participants_sessionId_userId_key" ON "session_participants"("sessionId", "userId");

-- AddForeignKey
ALTER TABLE "active_sessions" ADD CONSTRAINT "active_sessions_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "active_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
