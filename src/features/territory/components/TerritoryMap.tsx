"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapTile } from "../types";
import { tilesToGeoJsonFeatureCollection } from "@/lib/territory/tileUtils";

interface TerritoryMapProps {
    tiles: MapTile[];
    stats: any;
    homeLocation?: { lat: number; lng: number } | null;
}

const TILE_COLORS = {
    OWNED: "#10b981",      // Emerald 500
    HOSTILE: "#ef4444",    // Red 500
    CONTESTED: "#f59e0b",  // Amber 500
    NEUTRAL: "#4b5563",    // Gray 600
    HOME_ZONE: "#3b82f6",  // Blue 500
};

export const TerritoryMap: React.FC<TerritoryMapProps> = ({ tiles, homeLocation }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Initial center (Priority: Home > First Tile > Stockholm)
    const initialCenter = useMemo<[number, number]>(() => {
        if (homeLocation) return [homeLocation.lng, homeLocation.lat];
        if (tiles.length > 0) return [tiles[0].lng, tiles[0].lat];
        return [18.0686, 59.3293];
    }, [homeLocation, tiles]);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
            center: initialCenter,
            zoom: 13,
        });

        map.current.on("load", () => {
            setMapLoaded(true);

            // Add Tile Source
            map.current?.addSource("territory-tiles", {
                type: "geojson",
                data: tilesToGeoJsonFeatureCollection(
                    tiles.map((t) => ({
                        id: t.id,
                        properties: {
                            state: t.state,
                            control: t.controlPoints,
                            owner: t.ownerName,
                        },
                    }))
                ),
            });

            // Add Tile Layer
            map.current?.addLayer({
                id: "territory-tiles-layer",
                type: "fill",
                source: "territory-tiles",
                paint: {
                    "fill-color": [
                        "match",
                        ["get", "state"],
                        "OWNED", TILE_COLORS.OWNED,
                        "HOSTILE", TILE_COLORS.HOSTILE,
                        "CONTESTED", TILE_COLORS.CONTESTED,
                        "HOME_ZONE", TILE_COLORS.HOME_ZONE,
                        TILE_COLORS.NEUTRAL,
                    ],
                    "fill-opacity": 0.5,
                    "fill-outline-color": "#ffffff",
                },
            });

            // Add Click interaction
            map.current?.on("click", "territory-tiles-layer", (e) => {
                if (!e.features?.length) return;
                const props = e.features[0].properties;

                const color = TILE_COLORS[props.state as keyof typeof TILE_COLORS] || TILE_COLORS.NEUTRAL;

                new maplibregl.Popup({ closeButton: false, className: "territory-popup" })
                    .setLngLat(e.lngLat)
                    .setHTML(`
                        <div style="background: #111; color: white; padding: 12px; border-radius: 8px; border: 1px solid ${color}40; min-width: 180px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span style="font-size: 10px; text-transform: uppercase; color: #888;">Coordinate Hash</span>
                                <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; background: #333; border-radius: 4px;">#${props.tileId.substring(0, 8)}</span>
                            </div>
                            <h3 style="font-weight: 900; font-size: 16px; margin: 0 0 4px 0; color: ${color};">${props.state}</h3>
                            <div style="font-size: 12px; margin-bottom: 12px;">
                                ${props.owner ? `Controlled by <strong style="color: white;">${props.owner}</strong>` : "Neutral Territory"}
                            </div>
                            <div style="background: #222; border-radius: 6px; overflow: hidden; position: relative; height: 14px;">
                                <div style="background: ${color}; height: 100%; width: ${props.control}%; transition: width 0.5s ease-out;"></div>
                                <span style="position: absolute; width: 100%; text-align: center; font-size: 10px; line-height: 14px; font-weight: bold; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${props.control}% CONTROL</span>
                            </div>
                        </div>
                    `)
                    .addTo(map.current!);
            });

            // Pointer cursor on hover
            map.current?.on("mouseenter", "territory-tiles-layer", () => {
                map.current!.getCanvas().style.cursor = "pointer";
            });
            map.current?.on("mouseleave", "territory-tiles-layer", () => {
                map.current!.getCanvas().style.cursor = "";
            });
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, [initialCenter, tiles]);

    // Update data if tiles change
    useEffect(() => {
        if (!mapLoaded || !map.current) return;

        const source = map.current.getSource("territory-tiles") as maplibregl.GeoJSONSource;
        if (source) {
            source.setData(
                tilesToGeoJsonFeatureCollection(
                    tiles.map((t) => ({
                        id: t.id,
                        properties: {
                            state: t.state,
                            control: t.controlPoints,
                            owner: t.ownerName,
                        },
                    }))
                )
            );
        }
    }, [tiles, mapLoaded]);

    return (
        <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-2xl border-2 border-emerald-500/10">
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Legend Overlay */}
            <div className="absolute bottom-6 left-6 bg-black/90 backdrop-blur-xl p-4 rounded-xl border border-white/5 text-xs text-white z-10 shadow-2xl">
                <h4 className="font-black mb-3 uppercase tracking-tighter text-emerald-400 text-sm">Zone Intel</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ backgroundColor: TILE_COLORS.OWNED }} />
                        <span className="font-medium text-zinc-300">Imperial Domain</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.3)]" style={{ backgroundColor: TILE_COLORS.HOME_ZONE }} />
                        <span className="font-medium text-zinc-300">Titan&apos;s Sanctuary</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.3)]" style={{ backgroundColor: TILE_COLORS.CONTESTED }} />
                        <span className="font-medium text-zinc-300">Contested Flux</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.3)]" style={{ backgroundColor: TILE_COLORS.HOSTILE }} />
                        <span className="font-medium text-zinc-300">Hostile Presence</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
