// src/store/GameContext.tsx
import React, { createContext, useReducer, ReactNode } from 'react';
import { GameState } from '../types/game';
import { Position } from '../types/common';
import { selectRandomMap } from '../config/maps';
import { MapState, MapTile } from '../types/map';
import { MovementService } from '../services/movementService';
import { Pokemon } from '../types/pokemon';

type GameAction =
	| { type: 'SELECT_TILE'; payload: Position }
	| { type: 'SELECT_UNIT'; payload: Pokemon }
	| { type: 'SHOW_MOVEMENT_RANGE'; payload: Position[] }
	| { type: 'MOVE_UNIT'; payload: { unit: Pokemon; to: Position } }
	| { type: 'CHANGE_PHASE'; payload: GameState['phase'] };

const initialState: GameState = {
	mapState: {
		tiles: selectRandomMap().generator(),
		highlightedTiles: [],
		currentTurn: 'player',
	},
	phase: 'movement',
	validMoves: [],
	map: {
		getTile: (mapState: MapState, position: Position): MapTile | undefined => {
			const row = mapState.tiles[position.y];
			return row ? row[position.x] : undefined;
		},
		isValidPosition: (mapState: MapState, position: Position): boolean => {
			return (
				position.y >= 0 &&
				position.y < mapState.tiles.length &&
				position.x >= 0 &&
				position.x < mapState.tiles[0].length
			);
		},
	},
	units: {},
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
	switch (action.type) {
		case 'SELECT_TILE': {
			// If we have a selected unit and this is a valid move, move the unit
			if (
				state.selectedUnit &&
				state.validMoves.some(
					(pos) => pos.x === action.payload.x && pos.y === action.payload.y
				)
			) {
				return {
					...state,
					selectedUnit: undefined,
					validMoves: [],
					units: {
						...state.units,
						[state.selectedUnit.templateId]: {
							...state.selectedUnit,
							position: action.payload,
						},
					},
					mapState: {
						...state.mapState,
						tiles: state.mapState.tiles.map((row) =>
							row.map((tile) => ({
								...tile,
								unit:
									tile.position === action.payload
										? state.selectedUnit
										: undefined,
							}))
						),
					},
				};
			}
			return {
				...state,
				mapState: {
					...state.mapState,
					selectedTile: action.payload,
				},
			};
		}

		case 'SELECT_UNIT': {
			const validMoves = MovementService.getInstance().findValidMoves(
				action.payload,
				state.mapState
			);

			return {
				...state,
				selectedUnit: action.payload,
				validMoves,
				mapState: {
					...state.mapState,
					tiles: state.mapState.tiles.map((row) =>
						row.map((tile) => ({
							...tile,
							highlighted: validMoves.some(
								(pos) => pos.x === tile.position.x && pos.y === tile.position.y
							),
						}))
					),
				},
			};
		}

		case 'SHOW_MOVEMENT_RANGE': {
			return {
				...state,
				validMoves: action.payload,
				mapState: {
					...state.mapState,
					tiles: state.mapState.tiles.map((row) =>
						row.map((tile) => ({
							...tile,
							highlighted: action.payload.some(
								(pos) => pos.x === tile.position.x && pos.y === tile.position.y
							),
						}))
					),
				},
			};
		}

		case 'MOVE_UNIT': {
			return {
				...state,
				selectedUnit: undefined,
				validMoves: [],
				units: {
					...state.units,
					[action.payload.unit.templateId]: {
						...action.payload.unit,
						position: action.payload.to,
					},
				},
				mapState: {
					...state.mapState,
					tiles: state.mapState.tiles.map((row) =>
						row.map((tile) => ({
							...tile,
							highlighted: false,
							unit:
								tile.position === action.payload.to
									? action.payload.unit
									: undefined,
						}))
					),
				},
			};
		}

		case 'CHANGE_PHASE':
			return {
				...state,
				phase: action.payload,
			};

		default:
			return state;
	}
};

interface GameContextType {
	state: GameState;
	dispatch: React.Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextType>({
	state: initialState,
	dispatch: () => null,
});

export const GameProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(gameReducer, initialState);

	return (
		<GameContext.Provider value={{ state, dispatch }}>
			{children}
		</GameContext.Provider>
	);
};
