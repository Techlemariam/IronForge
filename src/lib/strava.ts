import { CardioLog } from '@prisma/client';

export interface StravaTokenResponse {
    token_type: string;
    access_token: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    athlete: {
        id: number;
        username: string;
        firstname: string;
        lastname: string;
    };
}

export interface StravaActivity {
    id: number;
    name: string;
    distance: number; // meters
    moving_time: number; // seconds
    elapsed_time: number; // seconds
    total_elevation_gain: number; // meters
    type: string;
    start_date: string; // ISO 8601
    average_speed: number; // m/s
    max_speed: number; // m/s
    average_heartrate?: number;
    max_heartrate?: number;
    suffer_score?: number;
}

export interface StravaUploadResponse {
    id: number;
    id_str: string;
    external_id: string;
    error: string | null;
    status: string;
    activity_id: number | null;
}

/**
 * Maps a Strava activity to the IronForge CardioLog format.
 * Note: Does not create the record, just maps the data.
 */
export function mapStravaActivityToCardioLog(activity: StravaActivity, userId: string): Omit<CardioLog, 'id'> {
    // Simple Load Calculation (TSS approximation) if suffer_score is missing
    // TSS = (sec x IntensityFactor x IntensityFactor) / (36 x 100)
    // This is a rough fallback.
    let load = activity.suffer_score || 0;

    if (!load) {
        // Very rough estimate based on duration if no HR data
        // 1 hour moderate = ~50 TSS
        load = (activity.moving_time / 3600) * 50;
    }

    return {
        userId,
        date: new Date(activity.start_date),
        intervalsId: `strava_${activity.id}`, // specific prefix to avoid collision
        type: activity.type,
        duration: activity.moving_time,
        load: load,
        averageHr: activity.average_heartrate || null,
    };
}
