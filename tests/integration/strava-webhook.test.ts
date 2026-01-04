import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { processUserCardioActivity } from '@/actions/pvp/duel';

// Mock Dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: { findFirst: vi.fn(), update: vi.fn() },
        cardioLog: { upsert: vi.fn() }
    },
    default: {
        user: { findFirst: vi.fn(), update: vi.fn() },
        cardioLog: { upsert: vi.fn() }
    }
}));

vi.mock('axios');
vi.mock('@/actions/pvp/duel', () => ({
    processUserCardioActivity: vi.fn()
}));

vi.mock('@/lib/strava', () => ({
    mapStravaActivityToCardioLog: vi.fn((activity, userId) => ({
        intervalsId: `strava_${activity.id}`,
        userId,
        type: activity.type,
        distance: activity.distance,
        duration: activity.moving_time,
        energyBurned: 500,
        averageHeartRate: 150,
        start_date: new Date()
    }))
}));

describe('Strava Webhook Integration', () => {
    beforeEach(() => {
        vi.resetModules();
        process.env.STRAVA_VERIFY_TOKEN = 'TEST_TOKEN';
        process.env.STRAVA_CLIENT_ID = 'TEST_ID';
        process.env.STRAVA_CLIENT_SECRET = 'TEST_SECRET';
        vi.clearAllMocks();
    });

    async function getHandlers() {
        return import('@/app/api/webhooks/strava/route');
    }

    describe('GET Verification', () => {
        it('should verify with correct token', async () => {
            const { GET } = await getHandlers();
            const req = new NextRequest('http://localhost/api/webhooks/strava?hub.mode=subscribe&hub.verify_token=TEST_TOKEN&hub.challenge=CHALLENGE_CODE');
            const res = await GET(req);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json['hub.challenge']).toBe('CHALLENGE_CODE');
        });

        it('should fail with incorrect token', async () => {
            const { GET } = await getHandlers();
            const req = new NextRequest('http://localhost/api/webhooks/strava?hub.mode=subscribe&hub.verify_token=WRONG_TOKEN&hub.challenge=CHALLENGE_CODE');
            const res = await GET(req);
            expect(res.status).toBe(403);
        });
    });

    describe('POST Event Handling', () => {
        it('should process new activity event', async () => {
            const { POST } = await getHandlers();
            const eventPayload = {
                object_type: 'activity',
                aspect_type: 'create',
                object_id: 12345,
                owner_id: 999
            };
            const req = new NextRequest('http://localhost/api/webhooks/strava', {
                method: 'POST',
                body: JSON.stringify(eventPayload)
            });

            // Mock User
            (prisma.user.findFirst as any).mockResolvedValue({
                id: 'user_1',
                stravaAccessToken: 'valid_token',
                stravaRefreshToken: 'refresh_token',
                stravaExpiresAt: Math.floor(Date.now() / 1000) + 3600 // Valid for 1h
            });

            // Mock Strava API
            (axios.get as any).mockResolvedValue({
                data: {
                    id: 12345,
                    type: 'Run',
                    distance: 5000, // 5km
                    moving_time: 1800 // 30 mins
                }
            });

            const res = await POST(req);

            expect(res.status).toBe(200);
            expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { stravaAthleteId: '999' } });
            // Should call Strava API with token
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('12345'), expect.objectContaining({
                headers: { Authorization: 'Bearer valid_token' }
            }));
            // Should persist log
            expect(prisma.cardioLog.upsert).toHaveBeenCalled();
            // Should process duel
            expect(processUserCardioActivity).toHaveBeenCalledWith('user_1', 'Run', 5, 30);
        });

        it('should refresh token if expired', async () => {
            const { POST } = await getHandlers();
            const eventPayload = {
                object_type: 'activity',
                aspect_type: 'create',
                object_id: 12345,
                owner_id: 999
            };
            const req = new NextRequest('http://localhost/api/webhooks/strava', {
                method: 'POST',
                body: JSON.stringify(eventPayload)
            });

            // Mock User with Expired Token
            (prisma.user.findFirst as any).mockResolvedValue({
                id: 'user_1',
                stravaAccessToken: 'expired_token',
                stravaRefreshToken: 'refresh_token',
                stravaExpiresAt: Math.floor(Date.now() / 1000) - 3600 // Expired 1h ago
            });

            // Mock Token Refresh
            (axios.post as any).mockResolvedValue({
                data: {
                    access_token: 'new_token',
                    refresh_token: 'new_refresh',
                    expires_at: Math.floor(Date.now() / 1000) + 3600
                }
            });

            // Mock Strava API (succeeds with NEW token)
            (axios.get as any).mockResolvedValue({
                data: {
                    id: 12345,
                    type: 'Run',
                    distance: 5000,
                    moving_time: 1800
                }
            });

            await POST(req);

            // Verify refresh call
            expect(axios.post).toHaveBeenCalledWith('https://www.strava.com/oauth/token', expect.objectContaining({
                grant_type: 'refresh_token',
                refresh_token: 'refresh_token',
                client_id: 'TEST_ID',
                client_secret: 'TEST_SECRET'
            }));

            // Verify User Update
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'user_1' },
                data: expect.objectContaining({ stravaAccessToken: 'new_token' })
            }));

            // Verify Activity Fetch uses NEW token
            expect(axios.get).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                headers: { Authorization: 'Bearer new_token' }
            }));
        });
    });
});
