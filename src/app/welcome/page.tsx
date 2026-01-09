import type { Metadata } from "next";
import { WelcomeClient } from "./WelcomeClient";

export const metadata: Metadata = {
  title: "Welcome to IronForge | Begin Your Saga",
  description: "Join the next generation of strength training. Treats your fitness journey like an RPG. Forge your legacy with IronForge.",
  openGraph: {
    title: "IronForge RPG | Train Like a Titan",
    description: "The AI-augmented strength training RPG. Integrate your workouts, battle bosses, and forge your legend.",
  },
};

export default function WelcomePage() {
  return <WelcomeClient />;
}
