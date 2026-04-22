import './globals.css';
import { GameToaster } from '@/components/ui/GameToast';
import type { Metadata } from 'next';
import { Cinzel, Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const cinzel = Cinzel({ subsets: ['latin'], display: 'swap', variable: '--font-serif' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'IronForge RPG | Train Like a Titan',
  description:
    'The AI-augmented strength training RPG. Integrate your workouts, battle bosses, and forge your legend.',
};

import { AnimationProvider } from '@/providers/AnimationProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${cinzel.variable} ${jetbrains.variable} bg-background text-foreground antialiased`}
      >
        <AnimationProvider>
          {children}
          <GameToaster />
        </AnimationProvider>
      </body>
    </html>
  );
}
