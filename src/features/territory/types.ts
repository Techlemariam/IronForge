export type TileState = "NEUTRAL" | "OWNED" | "HOSTILE" | "CONTESTED" | "HOME_ZONE";

export interface MapTile {
    id: string; // H3 index
    lat: number;
    lng: number;
    state: TileState;
    controlPoints: number; // For the current user
    ownerName?: string;
    cityName?: string;
}

export interface TerritoryStatsData {
    ownedTiles: number;
    contestedTiles: number;
    totalControlPoints: number;
    dailyGold: number;
    dailyXP: number;
    largestConnectedArea: number;
}

export interface TerritoryAction {
    type: "CONQUEST";
    tileId: string;
    pointsGained: number;
    timestamp: Date;
}
