
import { Howl } from 'howler';
import confetti from 'canvas-confetti';

// --- Sound Definitions ---
const sounds = {
  ding: new Howl({
    src: ['/sounds/ding.wav'],
    volume: 0.5,
  }),
  loot_legendary: new Howl({
    src: ['/sounds/loot_legendary.wav'],
    volume: 0.7,
  }),
  pr: new Howl({
    src: ['/sounds/pr.wav'], 
    volume: 0.8,
  }),
  quest_complete: new Howl({
      src: ['/sounds/quest_complete.wav'],
      volume: 0.7
  })
};

/**
 * Plays a sound effect.
 * @param sound - The name of the sound to play (e.g., 'ding', 'pr').
 */
export const playSound = (sound: keyof typeof sounds) => {
  if (sounds[sound]) {
    sounds[sound].play();
  }
};

// --- Confetti Cannon ---
/**
 * Fires a burst of confetti from the center of the screen.
 */
export const fireConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  });
};
