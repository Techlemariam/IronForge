import React from "react";
import WorldMap from "@/features/game/WorldMap";

export default function MapPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <WorldMap />
    </div>
  );
}
