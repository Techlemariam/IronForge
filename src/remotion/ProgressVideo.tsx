import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { z } from 'zod';

export const progressSchema = z.object({
  username: z.string(),
  weekNumber: z.number(),
  strengthGains: z.number(),
});

type ProgressProps = z.infer<typeof progressSchema>;

export const ProgressVideo: React.FC<ProgressProps> = ({ username, weekNumber, strengthGains }) => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const textOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'sans-serif',
      transform: `scale(${scale})`,
    }}>
      <h1 style={{
        opacity: titleOpacity,
        fontSize: '60px',
        fontWeight: 'bold',
        marginBottom: '20px',
      }}>
        Veckorapport för {username}
      </h1>
      <h2 style={{
        opacity: textOpacity,
        fontSize: '48px',
        fontWeight: 'normal',
      }}>
        Vecka {weekNumber}
      </h2>
      <p style={{
        opacity: textOpacity,
        fontSize: '90px',
        fontWeight: 'bold',
        color: '#4ade80', // A nice green color
        marginTop: '40px',
      }}>
        +{strengthGains} Styrka
      </p>
    </div>
  );
};
