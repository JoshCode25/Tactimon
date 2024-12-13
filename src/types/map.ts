import { Position, TerrainType } from './common';
import { Pokemon } from './pokemon';

export type TeamId = 'team1' | 'team2';

// src/types/map.ts
export interface MapTile {
	position: Position;
	terrain: TerrainType;
	unit?: Pokemon; // UUID of unit occupying the tile
	highlighted?: boolean;
	selectable?: boolean;
}

export interface MapState {
	tiles: MapTile[][];
	selectedTile?: Position;
	highlightedTiles: Position[];
	currentTurn: TeamId;
}
