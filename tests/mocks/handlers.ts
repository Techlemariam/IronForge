import { http, HttpResponse } from 'msw';

export const handlers = [
    // Mock external API - Hevy
    http.get('https://api.hevy.com/v1/workouts', () => {
        return HttpResponse.json([
            {
                id: 'workout-123',
                title: 'Morning Lift',
                exercises: []
            }
        ]);
    }),

    // Mock external API - Intervals.icu
    http.get('https://intervals.icu/api/v1/athlete/*/activities', () => {
        return HttpResponse.json([
            {
                id: 'activity-456',
                name: 'Zone 2 Run',
                type: 'Run',
                moving_time: 3600
            }
        ]);
    }),

    // Mock Supabase Auth (simplified)
    http.post('https://*.supabase.co/auth/v1/token', () => {
        return HttpResponse.json({
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600
        });
    })
];
