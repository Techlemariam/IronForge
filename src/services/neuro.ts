
/**
 * THE NEURO-LINK ENGINE
 * Generates Binaural Beats to entrain brainwave states.
 * Requires Headphones for full effect (Stereo Separation).
 */

export const NeuroService = {
    ctx: null as AudioContext | null,
    oscLeft: null as OscillatorNode | null,
    oscRight: null as OscillatorNode | null,
    gainNode: null as GainNode | null,
    isPlaying: false,
    currentMode: 'OFF' as 'OFF' | 'ALPHA' | 'GAMMA' | 'THETA',

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtxClass) {
                this.ctx = new AudioCtxClass();
                this.gainNode = this.ctx.createGain();
                this.gainNode.gain.value = 0.05; // Keep it subtle (subliminal layer)
                this.gainNode.connect(this.ctx.destination);
            }
        }
    },

    /**
     * Entrains the brain to a specific frequency.
     * @param targetFreq The difference in Hz between ears (e.g., 40Hz for Gamma).
     * @param carrierFreq The base tone (e.g., 200Hz). Lower is usually more grounding.
     */
    start(targetFreq: number, carrierFreq: number = 200) {
        this.init();
        if (!this.ctx || !this.gainNode) return;

        // Stop existing if running
        this.stop();

        // Left Ear
        const pannerLeft = this.ctx.createStereoPanner();
        pannerLeft.pan.value = -1; // Full Left
        pannerLeft.connect(this.gainNode);

        this.oscLeft = this.ctx.createOscillator();
        this.oscLeft.type = 'sine';
        this.oscLeft.frequency.value = carrierFreq;
        this.oscLeft.connect(pannerLeft);

        // Right Ear (Carrier + Target)
        const pannerRight = this.ctx.createStereoPanner();
        pannerRight.pan.value = 1; // Full Right
        pannerRight.connect(this.gainNode);

        this.oscRight = this.ctx.createOscillator();
        this.oscRight.type = 'sine';
        this.oscRight.frequency.value = carrierFreq + targetFreq;
        this.oscRight.connect(pannerRight);

        // Engage
        this.oscLeft.start();
        this.oscRight.start();
        this.isPlaying = true;
        
        // Resume context if suspended (browser autoplay policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    stop() {
        if (this.oscLeft) {
            this.oscLeft.stop();
            this.oscLeft.disconnect();
            this.oscLeft = null;
        }
        if (this.oscRight) {
            this.oscRight.stop();
            this.oscRight.disconnect();
            this.oscRight = null;
        }
        this.isPlaying = false;
        this.currentMode = 'OFF';
    },

    engageFocus() {
        if (this.currentMode === 'GAMMA') return;
        // Gamma (40Hz) - Peak Focus, Binding, High Force Output
        console.log("[NEURO] Engaging Gamma Protocol (40Hz)");
        this.start(40, 200); 
        this.currentMode = 'GAMMA';
    },

    engageRecovery() {
        if (this.currentMode === 'ALPHA') return;
        // Alpha (10Hz) - Relaxation, Bridge between conscious/subconscious
        console.log("[NEURO] Engaging Alpha Protocol (10Hz)");
        this.start(10, 150);
        this.currentMode = 'ALPHA';
    },

    engageDeepRest() {
        if (this.currentMode === 'THETA') return;
        // Theta (6Hz) - Deep meditation, sleep onset
        console.log("[NEURO] Engaging Theta Protocol (6Hz)");
        this.start(6, 100);
        this.currentMode = 'THETA';
    }
};
