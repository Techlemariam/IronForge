import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

type AmbientZone = 'citadel' | 'forge' | 'arena' | 'wilds' | 'void';

// Map zones to their audio files (assuming files exist or will be added)
// For now we can use placeholder URLs or synthesized sounds if files aren't ready.
// In a real app, these would be in /public/sounds/ambient/
const ZONE_TRACKS: Record<AmbientZone, string[]> = {
    citadel: ['/sounds/ambient/citadel_wind.mp3'],
    forge: ['/sounds/ambient/forge_fire.mp3'],
    arena: ['/sounds/ambient/arena_crowd_muffled.mp3'],
    wilds: ['/sounds/ambient/wilds_night.mp3'],
    void: ['/sounds/ambient/void_drone.mp3']
};

export const useAmbientSound = (activeZone: AmbientZone | null, enabled: boolean = true) => {
    const currentHowlRef = useRef<Howl | null>(null);
    const currentZoneRef = useRef<AmbientZone | null>(null);

    useEffect(() => {
        if (!enabled || !activeZone) {
            // Fade out and stop
            if (currentHowlRef.current) {
                currentHowlRef.current.fade(0.3, 0, 1000);
                setTimeout(() => {
                    currentHowlRef.current?.stop();
                    currentHowlRef.current = null;
                }, 1000);
            }
            currentZoneRef.current = null;
            return;
        }

        if (activeZone === currentZoneRef.current) return;

        // Crossfade logic
        const prevHowl = currentHowlRef.current;
        if (prevHowl) {
            prevHowl.fade(0.3, 0, 2000);
            setTimeout(() => prevHowl.stop(), 2000);
        }

        const src = ZONE_TRACKS[activeZone]?.[0];
        if (src) {
            const newHowl = new Howl({
                src: [src],
                loop: true,
                volume: 0,
                html5: true, // Streaming for longer files
                preload: true
            });

            newHowl.play();
            newHowl.fade(0, 0.3, 2000);
            currentHowlRef.current = newHowl;
            currentZoneRef.current = activeZone;
        }

        return () => {
            if (currentHowlRef.current) {
                currentHowlRef.current.fade(0.3, 0, 1000);
                setTimeout(() => currentHowlRef.current?.stop(), 1000);
            }
        };
    }, [activeZone, enabled]);
};
