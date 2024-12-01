import { MapState, MapTile } from './map';
import { Pokemon } from './pokemon';
import { Position } from './common';

export interface MapInterface {
	getTile: (mapState: MapState, position: Position) => MapTile | undefined;
	isValidPosition: (mapState: MapState, position: Position) => boolean;
}

export interface GameState {
	mapState: MapState;
	activeUnit?: string;
	selectedUnit?: Pokemon;
	phase: 'movement' | 'action' | 'enemy';
	validMoves: Position[];
	map: MapInterface;
	units: {
		[id: string]: Pokemon;
	};
}
