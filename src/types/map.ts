import { Position, TerrainType } from './common';

// src/types/map.ts
export interface MapTile {
	position: Position;
	terrain: TerrainType;
	unit?: string; // UUID of unit occupying the tile
	highlighted?: boolean;
	selectable?: boolean;
}

export interface MapState {
	tiles: MapTile[][];
	selectedTile?: Position;
	highlightedTiles: Position[];
	currentTurn: 'player' | 'enemy';
}
