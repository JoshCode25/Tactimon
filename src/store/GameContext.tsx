// src/store/GameContext.tsx
import React, { createContext, useReducer, ReactNode } from 'react';
import { GameState } from '../types/game';
import { Position } from '../types/common';
import { selectRandomMap } from '../config/maps';
import { MapState, MapTile, TeamId } from '../types/map';
import { MovementService } from '../services/movementService';
import { Pokemon } from '../types/pokemon';

type GameAction =
	| { type: 'SELECT_TILE'; payload: Position }
	| { type: 'SELECT_UNIT'; payload: Pokemon }
	| { type: 'SHOW_MOVEMENT_RANGE'; payload: Position[] }
	| { type: 'MOVE_UNIT'; payload: { unit: Pokemon; to: Position } }
	| { type: 'CHANGE_PHASE'; payload: GameState['phase'] }
	| { type: 'ADD_UNITS'; payload: Pokemon[] }
	| { type: 'END_TURN'; payload: TeamId };

const initialState: GameState = {
	mapState: {
		tiles: selectRandomMap().generator(),
		highlightedTiles: [],
		currentTurn: 'team1',
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
	const clearHighlights = (tiles: MapTile[][]) => {
		return tiles.map((row) =>
			row.map((tile) => ({
				...tile,
				highlighted: false,
				selectable: true,
			}))
		);
	};
	switch (action.type) {
		case 'SELECT_TILE': {
			const clickedTile =
				state.mapState.tiles[action.payload.y][action.payload.x];

			// If there's a unit on the clicked tile
			if (clickedTile.unit) {
				// Only allow selecting units on current team's turn and if they haven't moved yet
				if (
					clickedTile.unit.teamId === state.mapState.currentTurn &&
					!clickedTile.unit.hasMoved
				) {
					console.log('Calculating moves for:', clickedTile.unit);
					// Select the unit and show its valid moves
					const validMoves = MovementService.getInstance().findValidMoves(
						clickedTile.unit,
						state.mapState
					);
					console.log('Valid moves calculated:', validMoves);

					return {
						...state,
						selectedUnit: clickedTile.unit,
						validMoves,
						mapState: {
							...state.mapState,
							tiles: state.mapState.tiles.map((row, y) =>
								row.map((tile, x) => ({
									...tile,
									highlighted: validMoves.some(
										(move) => move.x === x && move.y === y
									),
								}))
							),
						},
					};
				}
				return state;
			}

			// If we have a selected unit and this is a valid move
			if (
				state.selectedUnit &&
				state.validMoves.some(
					(pos) => pos.x === action.payload.x && pos.y === action.payload.y
				)
			) {
				// Get the old position
				const oldPos = state.selectedUnit.position;

				// Create new tiles array with unit moved
				const newTiles = clearHighlights(state.mapState.tiles);
				// Remove unit from old position
				newTiles[oldPos.y][oldPos.x].unit = undefined;
				// Add unit to new position
				newTiles[action.payload.y][action.payload.x].unit = {
					...state.selectedUnit,
					position: action.payload,
					hasMoved: true,
				};

				return {
					...state,
					selectedUnit: undefined,
					validMoves: [],
					units: {
						...state.units,
						[state.selectedUnit.templateId]: {
							...state.selectedUnit,
							position: action.payload,
							hasMoved: true,
						},
					},
					mapState: {
						...state.mapState,
						tiles: newTiles,
					},
				};
			}

			// If clicking on an empty tile with no unit selected
			return {
				...state,
				selectedUnit: undefined,
				validMoves: [],
				mapState: {
					...state.mapState,
					tiles: clearHighlights(state.mapState.tiles),
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

		case 'ADD_UNITS': {
			const newUnits = { ...state.units };
			const newTiles = state.mapState.tiles.map((row) =>
				row.map((tile) => ({ ...tile }))
			);

			action.payload.forEach((pokemon) => {
				// Add to units dictionary
				newUnits[pokemon.templateId] = pokemon;

				// Add to map tiles
				const { x, y } = pokemon.position;
				if (newTiles[y] && newTiles[y][x]) {
					newTiles[y][x].unit = pokemon;
				}
			});

			return {
				...state,
				units: newUnits,
				mapState: {
					...state.mapState,
					tiles: newTiles,
				},
			};
		}

		case 'END_TURN': {
			// Clear selections and highlights
			const newTiles = clearHighlights(state.mapState.tiles);

			// Reset all Pokemon movement flags for the next turn
			const resetUnits = Object.entries(state.units).reduce(
				(acc, [id, unit]) => {
					acc[id] = {
						...unit,
						hasMoved: false,
					};
					return acc;
				},
				{} as Record<string, Pokemon>
			);

			// Update tiles with reset units
			const updatedTiles = newTiles.map((row) =>
				row.map((tile) => {
					if (tile.unit) {
						return {
							...tile,
							unit: {
								...tile.unit,
								hasMoved: false,
							},
						};
					}
					return tile;
				})
			);

			return {
				...state,
				selectedUnit: undefined,
				validMoves: [],
				units: resetUnits,
				mapState: {
					...state.mapState,
					currentTurn: action.payload,
					tiles: updatedTiles,
				},
			};
		}

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
