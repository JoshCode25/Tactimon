import { MapState } from './map';

// src/types/game.ts
export interface GameState {
	mapState: MapState;
	activeUnit?: string;
	phase: 'movement' | 'action' | 'enemy';
}
