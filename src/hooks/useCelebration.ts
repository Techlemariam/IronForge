'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { triggerHaptic, playSound } from '@/utils';

/**
 * Final Push: Micro-Celebration Hook
 * Provides confetti, screen shake, and gold burst effects
 */
export const useCelebration = () => {

    const fireConfetti = useCallback((options?: { origin?: { x: number; y: number } }) => {
        triggerHaptic('success');
        playSound('achievement');

        confetti({
            particleCount: 150,
            spread: 70,
            origin: options?.origin ?? { y: 0.6, x: 0.5 },
            colors: ['#ffd700', '#ff8000', '#a335ee', '#0070dd', '#1eff00'],
            shapes: ['star', 'circle'],
            scalar: 1.2
        });
    }, []);

    const screenShake = useCallback((intensity: 'light' | 'heavy' = 'light') => {
        triggerHaptic(intensity === 'heavy' ? 'heavy' : 'medium');

        const duration = intensity === 'heavy' ? 300 : 150;
        const magnitude = intensity === 'heavy' ? 8 : 4;

        document.body.style.transition = 'transform 0.05s';

        const shake = () => {
            const x = (Math.random() - 0.5) * magnitude;
            const y = (Math.random() - 0.5) * magnitude;
            document.body.style.transform = `translate(${x}px, ${y}px)`;
        };

        const interval = setInterval(shake, 50);

        setTimeout(() => {
            clearInterval(interval);
            document.body.style.transform = 'translate(0, 0)';
        }, duration);
    }, []);

    const goldBurst = useCallback((count = 20) => {
        triggerHaptic('light');
        playSound('loot_epic');

        confetti({
            particleCount: count,
            spread: 60,
            origin: { y: 0.7, x: 0.5 },
            colors: ['#ffd700', '#ffec8b', '#daa520'],
            shapes: ['circle'],
            gravity: 1.2,
            scalar: 0.8
        });
    }, []);

    const victorySequence = useCallback(() => {
        // Full celebration: confetti + shake + sound
        screenShake('heavy');
        setTimeout(() => fireConfetti(), 200);
        setTimeout(() => goldBurst(30), 600);
    }, [screenShake, fireConfetti, goldBurst]);

    return {
        fireConfetti,
        screenShake,
        goldBurst,
        victorySequence
    };
};

export default useCelebration;
