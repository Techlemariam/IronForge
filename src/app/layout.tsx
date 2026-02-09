import "./globals.css";
import type { Metadata } from "next";
import { Inter, Cinzel, JetBrains_Mono } from "next/font/google";
import { GameToaster } from "@/components/ui/GameToast";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], display: "swap", variable: "--font-serif" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });

export const metadata: Metadata = {
  title: "IronForge RPG | Train Like a Titan",
  description: "The AI-augmented strength training RPG. Integrate your workouts, battle bosses, and forge your legend.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${cinzel.variable} ${jetbrains.variable} bg-background text-foreground antialiased`}>
        {children}
        <GameToaster />
        {process.env.NODE_ENV === "production" && <SpeedInsights />}
      </body>
    </html>
  );
}
