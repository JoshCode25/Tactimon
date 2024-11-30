import { MapState, MapTile } from './map';
import { Pokemon } from './pokemon';
import { Position } from './common';

export interface GameState {
	mapState: MapState;
	activeUnit?: string;
	phase: 'movement' | 'action' | 'enemy';
	map: {
		getTile: (position: Position) => MapTile | undefined;
		isValidPosition: (position: Position) => boolean;
	};
	units: {
		[id: string]: Pokemon;
	};
}
