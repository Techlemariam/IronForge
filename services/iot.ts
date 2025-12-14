
import { AppSettings } from '../types';
import { StorageService } from './storage';

/**
 * IoT Service for "The Smart Gym" (Philips Hue & Atmosphere)
 */
export const IoTService = {
    bridgeIp: null as string | null,
    username: null as string | null,
    lastZone: 'REST' as 'REST' | 'WORK' | 'LIMIT',
    
    async init() {
        const settings = await StorageService.getState<AppSettings>('settings');
        if (settings?.hueBridgeIp && settings?.hueUsername) {
            this.bridgeIp = settings.hueBridgeIp;
            this.username = settings.hueUsername;
        }
    },

    /**
     * "The Atmosphere" - Biometric Sync
     * Adjusts room environment based on Heart Rate.
     */
    syncAtmosphere(bpm: number) {
        if (!bpm) return;

        let newZone: 'REST' | 'WORK' | 'LIMIT' = 'REST';
        if (bpm > 160) newZone = 'LIMIT';
        else if (bpm > 120) newZone = 'WORK';

        // Only fire API calls if zone changes to prevent spamming the bridge
        if (newZone !== this.lastZone) {
            this.lastZone = newZone;
            console.log(`[ATMOSPHERE] Switching to ${newZone} Mode`);

            if (newZone === 'REST') {
                this.triggerRecovery();
                // Simulate Spotify API: Play Lo-Fi
                console.log("[SPOTIFY] Playing: 'Chill Lofi Beats'");
            } else if (newZone === 'WORK') {
                this.triggerFocus();
                // Simulate Spotify API: Play Phonk
                console.log("[SPOTIFY] Playing: 'Training Montage'");
            } else if (newZone === 'LIMIT') {
                this.triggerRedAlert();
                // Simulate Spotify API: Max Volume
                console.log("[SPOTIFY] VOLUME 100%");
            }
        }
    },

    async setGroupState(groupId: number, state: any) {
        if (!this.bridgeIp || !this.username) return;

        try {
            fetch(`http://${this.bridgeIp}/api/${this.username}/groups/${groupId}/action`, {
                method: 'PUT',
                body: JSON.stringify(state)
            }).catch(e => console.warn("Hue IoT Error", e));
        } catch (e) {
            console.warn("Hue IoT Error", e);
        }
    },

    triggerRedAlert() {
        // Red, Max Brightness, Breathe
        this.setGroupState(1, {
            on: true,
            bri: 254,
            hue: 0,
            sat: 254,
            alert: 'lselect' 
        });
    },

    triggerVictory() {
        this.setGroupState(1, {
            on: true,
            bri: 200,
            hue: 25500, // Green
            sat: 254,
            alert: 'select'
        });
    },

    triggerRecovery() {
        this.setGroupState(1, {
            on: true,
            bri: 100,
            hue: 46920, // Blue
            sat: 254,
            alert: 'none'
        });
    },

    triggerFocus() {
        this.setGroupState(1, {
            on: true,
            bri: 200,
            hue: 0, 
            sat: 0, // White
            alert: 'none'
        });
    }
};
