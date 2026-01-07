import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GameToaster } from "@/components/ui/GameToast";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {children}
        <GameToaster />
        {process.env.NODE_ENV === "production" && <SpeedInsights />}
      </body>
    </html>
  );
}
