import WorldMap from '@/features/game/WorldMap';
import React from 'react';

export default function MapPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <WorldMap />
    </div>
  );
}
