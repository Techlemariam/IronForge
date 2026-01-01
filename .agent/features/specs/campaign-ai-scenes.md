# Campaign AI Video Manifest
**Tone:** "Your Highness" / "Monty Python" meets "Pumping Iron".
**Visual Style:** 80s Dark Fantasy (Conan style) mixed with Neon-Gym aesthetic. POV shots.

## 🎬 Video Integration Strategy

We will use AI video (Sora/Runway/Veo) for **3 Key Moment Types**:
1.  **The "Call to Adventure" (Intros):** Sets the comedic/absurd stakes.
2.  **The "Beast Reveal" (Bosses):** Shows the ridiculous enemy you must face.
3.  **The "Victory/Shame" Loops:** Short loops playing behind the results screen.

---

## 🎭 Scene 1: The Awakening (Campaign Intro)
**Context:** You wake up. You are the "Chosen One", but you look terrible.
**Audio:** Marcus yelling: *"Awaken, slumbering beast! ...oh, is that what we're working with? Very well."*

### 🤖 AI Prompt (Sora/Gen-2)
> **Prompt:** First-person POV shot. Waking up in a stone dungeon that looks like a medieval locker room. Looking down at own body: wearing rusty plate armor over a grey t-shirt. A robotic squire (looks like a trash can with legs) hands you a glowing protein shaker. Dusty light beams, cinematic lighting, 8k, photorealistic, gritty fantasy style.

---

## 🎭 Scene 2: The Rust Titan (Strength Boss)
**Context:** The enemy isn't a dragon, it's a pile of neglected gym equipment that has gained sentience.
**Audio:** *"I am the Ghost of Leg Days Skipped! Tremble before my imbalance!"*

### 🤖 AI Prompt
> **Prompt:** Cinematic low-angle shot. A towering golem monster made entirely of rusty dumbbells, tangled cables, and broken bench-press bars. It flexes its biceps which are made of gym plates. It roars, spitting chalk dust. Dark dungeon background with neon red rune lights. Epic fantasy movie still, wide angle, terrifying but slightly ridiculous.

---

## 🎭 Scene 3: The Sludge of Stagnation (Cardio Boss)
**Context:** A blob monster that tries to convince you to sit on the couch.
**Audio:** *"Join usssss. The sofa is so sofffft. Why run when you can binge-watch?"*

### 🤖 AI Prompt
> **Prompt:** First-person POV running through a swamp. The mud creates grasping hands trying to pull the camera down. The "mud" looks like pizza dough and cushions. Ahead, a glowing exit gate made of treadmills. High speed motion blur, frantic energy, dark fantasy atmosphere.

---

## 🎭 Scene 4: The "Victory Feast" (Success Loop)
**Context:** You won. The celebration is underwhelmingly majestic.

### 🤖 AI Prompt
> **Prompt:** A stone pedestal in a spotlight. On top sits a single, golden banana emanating holy light. Rose petals falling in slow motion. A choir of muscular angels (wearing gym tank tops) floats in the background blowing trumpets. Baroque painting style, slow motion, majestic.

---

## 🎭 Scene 5: The "Walk of Shame" (Failure Loop)
**Context:** You failed the rep/time target.

### 🤖 AI Prompt
> **Prompt:** First-person POV looking at the ground. Walking slowly through a corridor of shame. Goblins point and laugh, throwing crumpled paper towels at the camera. Sad rain falling indoors. Desaturated colors.

---

## 🛠️ Implementation Plan
1.  **Generation:** Generate ~5 variations of each prompt.
2.  **Looping:** Convert best outputs to seamless 10s loops (`ffmpeg`).
3.  **Overlay:** The React UI will render the "Health Bar" and "Dialog Text" *over* these videos.
