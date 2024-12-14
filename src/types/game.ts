// src/types/game.ts
import { MapState, MapTile } from './map';
import { Pokemon } from './pokemon';
import { Position } from './common';
import { Move } from './moves';

export interface MapInterface {
  getTile: (mapState: MapState, position: Position) => MapTile | undefined;
  isValidPosition: (mapState: MapState, position: Position) => boolean;
}

export type GamePhase = 'movement' | 'combat' | 'enemy';

export interface GameState {
  mapState: MapState;
  activeUnit?: string;
  selectedUnit?: Pokemon;
  selectedMove?: Move;
  phase: GamePhase;
  validMoves: Position[];
  validTargets: Position[];
  map: MapInterface;
  units: {
    [id: string]: Pokemon;
  };
}