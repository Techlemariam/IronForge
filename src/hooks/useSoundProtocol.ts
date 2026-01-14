import { useRef, useEffect } from "react";
// We use dynamic imports for Howler to avoid SSR issues or ensure it loads on client only,
// though standard import often works if strictly used in useEffect. 
// For now, we assume simple import or that standard 'Howl' usage is safe in client components.
import { Howl } from "howler";

type SoundType = "clink" | "thud" | "chirp" | "heartbeat" | "deploy";

// Sound Assets (Placeholders pointed to public/sounds/...)
// Real production would need actual files. We'll set paths that *should* exist.
const SOUND_PATHS = {
    clink: "/sounds/mech-clink.mp3",
    thud: "/sounds/heavy-thud.mp3",
    chirp: "/sounds/digital-chirp.mp3",
    heartbeat: "/sounds/heartbeat-sub.mp3",
    deploy: "/sounds/bolt-action.mp3",
};

export const useSoundProtocol = () => {
    const sounds = useRef<Record<SoundType, Howl | null>>({
        clink: null,
        thud: null,
        chirp: null,
        heartbeat: null,
        deploy: null,
    });

    useEffect(() => {
        // Initialize standard sounds
        Object.keys(SOUND_PATHS).forEach((key) => {
            const type = key as SoundType;
            sounds.current[type] = new Howl({
                src: [SOUND_PATHS[type]],
                volume: 0.5,
            });
        });

        return () => {
            // Cleanup if needed? Howler usually manages itself but good practice to stop loops.
            Object.values(sounds.current).forEach(sound => sound?.unload());
        };
    }, []);

    const play = (type: SoundType) => {
        try {
            if (sounds.current[type]) {
                sounds.current[type]?.play();
            }
        } catch (e) {
            // In case of any audio context errors, fail silently to not break UI
            console.warn("Audio Protocol Failed:", e);
        }
    };

    return { play };
};
