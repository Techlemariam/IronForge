/**
 * Pocket Casts API Client (Unofficial)
 */

export interface PocketCastsPodcast {
    uuid: string;
    title: string;
    author: string;
    description?: string;
    thumbnail_url?: string;
    folder_url?: string;
}

export interface PocketCastsEpisode {
    uuid: string;
    podcast_uuid: string;
    title: string;
    url: string; // Direct MP3 link
    duration: number;
    playing_status: number; // Seconds played
    published_at?: string;
    thumbnail_url?: string;
    folder_url?: string;
    podcast_title?: string;
}

export class PocketCastsClient {
    private baseUrl = "https://api.pocketcasts.com";
    private headers: Record<string, string>;

    constructor(private token?: string) {
        this.headers = {
            "Content-Type": "application/json",
            "Origin": "https://play.pocketcasts.com",
        };
        if (token) {
            this.headers["Authorization"] = "Bearer " + token;
        }
    }

    private async _request(endpoint: string, method: "GET" | "POST" = "GET", body: any = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options: RequestInit = {
            method,
            headers: this.headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Pocket Casts API Error ${response.status}: ${response.statusText} - ${errorBody}`);
        }

        return await response.json();
    }

    /**
     * Logs in with email and password to retrieve a Bearer token
     */
    async login(email: string, password: string): Promise<string> {
        const data = await this._request("/user/login", "POST", {
            email,
            password,
            scope: "webplayer"
        });

        if (!data.token) {
            throw new Error("Login failed: No token returned from Pocket Casts.");
        }

        this.token = data.token;
        this.headers["Authorization"] = "Bearer " + this.token;
        return this.token as string;
    }

    /**
     * Fetches the user's subscribed podcasts
     */
    async getSubscriptions(): Promise<PocketCastsPodcast[]> {
        const data = await this._request("/user/podcast/list", "POST", {});
        return data.podcasts || [];
    }

    /**
     * Fetches episodes that are currently in progress
     */
    async getInProgress(): Promise<PocketCastsEpisode[]> {
        const data = await this._request("/user/history/summary", "POST", {});
        return data.episodes || [];
    }

    /**
     * Fetches the user's playback queue
     */
    async getQueue(): Promise<PocketCastsEpisode[]> {
        const data = await this._request("/user/podcast/queue", "POST", {});
        return data.episodes || [];
    }

    /**
     * Updates the playback progress for a specific episode
     * @param episodeId The UUID of the episode
     * @param podcastId The UUID of the podcast
     * @param position Current playback position in seconds
     * @param status 1 for playing, 2 for paused, 3 for finished
     */
    async updateProgress(
        episodeId: string,
        podcastId: string,
        position: number,
        status: number = 1
    ): Promise<void> {
        await this._request("/user/history/progress", "POST", {
            episode: episodeId,
            podcast: podcastId,
            position,
            status
        });
    }
}
