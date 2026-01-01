"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapTile } from "../types";
import { tilesToGeoJsonFeatureCollection } from "@/lib/territory/tileUtils";

interface TerritoryMapProps {
    tiles: MapTile[];
    stats: any;
}

const TILE_COLORS = {
    OWNED: "#10b981",      // Emerald 500
    HOSTILE: "#ef4444",    // Red 500
    CONTESTED: "#f59e0b",  // Amber 500
    NEUTRAL: "#6b7280",    // Gray 500
    HOME_ZONE: "#3b82f6",  // Blue 500
};

export const TerritoryMap: React.FC<TerritoryMapProps> = ({ tiles }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Initial center (default to first tile or Stockholm if empty)
    const initialCenter: [number, number] = tiles.length > 0
        ? [tiles[0].lng, tiles[0].lat]
        : [18.0686, 59.3293];

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://demotiles.maplibre.org/style.json", // Basic OSM style
            center: initialCenter,
            zoom: 12,
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
                    "fill-opacity": 0.6,
                    "fill-outline-color": "#ffffff",
                },
            });

            // Add Click interaction
            map.current?.on("click", "territory-tiles-layer", (e) => {
                if (!e.features?.length) return;
                const props = e.features[0].properties;

                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                        <div class="p-2 text-black">
                            <h3 class="font-bold">${props.tileId}</h3>
                            <p>State: <strong>${props.state}</strong></p>
                            <p>Control: ${props.control}%</p>
                            ${props.owner ? `<p>Owner: ${props.owner}</p>` : ""}
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
    }, []);

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
        <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-2xl border-2 border-emerald-500/20">
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs text-white z-10">
                <h4 className="font-bold mb-2 uppercase tracking-wider text-emerald-400">Territory Legend</h4>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: TILE_COLORS.OWNED }} />
                        <span>Owned Territory</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: TILE_COLORS.HOME_ZONE }} />
                        <span>Home Zone (+50% Control)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: TILE_COLORS.CONTESTED }} />
                        <span>Contested (No Owner)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: TILE_COLORS.HOSTILE }} />
                        <span>Hostile Territory</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
