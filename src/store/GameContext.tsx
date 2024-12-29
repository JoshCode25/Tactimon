// src/store/GameContext.tsx
import React, { createContext, useReducer, ReactNode } from 'react';
import { GamePhase, GameState } from '../types/game';
import { Position } from '../types/common';
import { selectRandomMap } from '../config/maps';
import { MapState, MapTile, TeamId } from '../types/map';
import { MovementService } from '../services/movementService';
import { Pokemon } from '../types/pokemon';
import { Move } from '../types/moves';
import { MoveService } from '../services/moveService';
import {
	calculateExperience,
	processExperienceGain,
} from '../utils/experienceUtils';
import { Notification } from '../types/notifications';

type GameAction =
	| { type: 'SELECT_TILE'; payload: Position }
	| { type: 'SELECT_UNIT'; payload: Pokemon }
	| { type: 'DESELECT_UNIT' }
	| { type: 'SHOW_MOVEMENT_RANGE'; payload: Position[] }
	| { type: 'MOVE_UNIT'; payload: { unit: Pokemon; to: Position } }
	| { type: 'CHANGE_PHASE'; payload: GamePhase }
	| { type: 'SELECT_MOVE'; payload: Move }
	| { type: 'CANCEL_ATTACK' }
	| {
			type: 'EXECUTE_ATTACK';
			payload: { attacker: Pokemon; target: Pokemon; move: Move };
	  }
	| { type: 'ADD_UNITS'; payload: Pokemon[] }
	| { type: 'END_TURN'; payload: TeamId }
	| { type: 'ADD_NOTIFICATION'; payload: string }
	| { type: 'DISMISS_NOTIFICATION'; payload: string };

const initialState: GameState = {
	mapState: {
		tiles: selectRandomMap().generator(),
		highlightedTiles: [],
		currentTurn: 'team1',
	},
	phase: 'movement',
	validMoves: [],
	validTargets: [],
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
	notifications: [],
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
				// Get the most up-to-date unit state from the units record
				const currentUnit = state.units[clickedTile.unit.templateId];

				console.log('SELECT_TILE - Unit states:', {
					tileUnit: { ...clickedTile.unit },
					recordUnit: { ...currentUnit },
				});

				// Only allow selecting units on current team's turn and if they haven't completed all actions
				const unitCanAct =
					currentUnit.teamId === state.mapState.currentTurn &&
					!(currentUnit.hasMoved && currentUnit.hasAttacked) &&
					!currentUnit.isFainted;

				if (unitCanAct) {
					const validMoves = !currentUnit.hasMoved
						? MovementService.getInstance().findValidMoves(
								currentUnit,
								state.mapState
						  )
						: [];

					// Update the tiles with the current unit state
					const updatedTiles = state.mapState.tiles.map((row, y) =>
						row.map((tile, x) => ({
							...tile,
							unit:
								tile.unit?.templateId === currentUnit.templateId
									? currentUnit
									: tile.unit,
							highlighted: validMoves.some(
								(move) => move.x === x && move.y === y
							),
						}))
					);

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
				) &&
				!state.selectedUnit.hasMoved // Only allow movement if unit hasn't moved
			) {
				// Get the old position
				const oldPos = state.selectedUnit.position;

				// Create updated unit with new position and moved status
				const updatedUnit = {
					...state.selectedUnit,
					position: action.payload,
					hasMoved: true,
					hasAttacked: state.selectedUnit.hasAttacked,
				};

				// Create new tiles array with unit moved
				const newTiles = clearHighlights(state.mapState.tiles);
				// Remove unit from old position
				newTiles[oldPos.y][oldPos.x].unit = undefined;
				// Add unit to new position with preserved states
				newTiles[action.payload.y][action.payload.x].unit = updatedUnit;

				return {
					...state,
					selectedUnit: undefined,
					validMoves: [],
					units: {
						...state.units,
						[updatedUnit.templateId]: updatedUnit,
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

		case 'DESELECT_UNIT': {
			return {
				...state,
				selectedUnit: undefined,
				selectedMove: undefined,
				validMoves: [],
				validTargets: [],
				phase: 'movement',
				mapState: {
					...state.mapState,
					tiles: state.mapState.tiles.map((row) =>
						row.map((tile) => ({
							...tile,
							highlighted: false,
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

		case 'SELECT_MOVE': {
			console.log('SELECT_MOVE - Current unit state:', {
				selectedUnit: { ...state.selectedUnit },
				unitsRecord: state.selectedUnit
					? { ...state.units[state.selectedUnit.templateId] }
					: null,
			});

			// Check if unit exists in both locations and has already attacked
			const unitFromState = state.selectedUnit;
			const unitFromRecord = unitFromState
				? state.units[unitFromState.templateId]
				: null;

			if (!unitFromState || !unitFromRecord || unitFromRecord.hasAttacked) {
				console.log(
					'Attack prevented - Unit has already attacked or is invalid'
				);
				return state;
			}

			const validTargets = MoveService.getInstance().getValidTargets(
				action.payload,
				unitFromRecord, // Use the record version which should have the most up-to-date state
				state.mapState
			);

			return {
				...state,
				selectedUnit: unitFromRecord, // Update selectedUnit to use the record version
				selectedMove: action.payload,
				phase: 'combat',
				validTargets,
				mapState: {
					...state.mapState,
					tiles: state.mapState.tiles.map((row) =>
						row.map((tile) => ({
							...tile,
							// Update the unit in the tile if it matches
							unit:
								tile.unit?.templateId === unitFromRecord.templateId
									? unitFromRecord
									: tile.unit,
							highlighted: validTargets.some(
								(pos: Position) =>
									pos.x === tile.position.x && pos.y === tile.position.y
							),
						}))
					),
				},
			};
		}

		case 'CANCEL_ATTACK': {
			return {
				...state,
				selectedMove: undefined,
				phase: 'movement',
				validTargets: [],
				mapState: {
					...state.mapState,
					tiles: state.mapState.tiles.map((row) =>
						row.map((tile) => ({
							...tile,
							highlighted: false,
						}))
					),
				},
			};
		}

		case 'EXECUTE_ATTACK': {
			const { attacker, target, move } = action.payload;
			if (attacker.hasAttacked) {
				return state;
			}

			const damage = MoveService.getInstance().calculateDamage(
				move,
				attacker,
				target
			);

			// Update target's HP
			const newHP = Math.max(0, target.currentStats.hp - damage);
			const isFainted = newHP === 0;

			const updatedTarget = {
				...target,
				currentStats: {
					...target.currentStats,
					hp: newHP,
				},
				isFainted,
			};

			// Create updated attacker
			let updatedAttacker = {
				...attacker,
				moves: attacker.moves.map((m) =>
					m.id === move.id ? { ...m, currentPP: m.currentPP - 1 } : m
				),
				hasAttacked: true,
				hasMoved: attacker.hasMoved,
			};

			// Handle experience and notifications if target faints
			const newNotifications: Notification[] = [];

			if (isFainted) {
				const gainedExp = calculateExperience(target);
				const {
					pokemon: leveledUpAttacker,
					levelsGained,
					moveMessages,
				} = processExperienceGain(updatedAttacker, gainedExp);

				updatedAttacker = leveledUpAttacker;

				// Add defeat notification
				newNotifications.push({
					id: `defeat-${Date.now()}`,
					message: `${attacker.nickname || attacker.name} defeated ${
						target.nickname || target.name
					} and gained ${gainedExp}xp!`,
					timestamp: Date.now(),
				});

				// Add level up notification if applicable
				if (levelsGained > 0) {
					newNotifications.push({
						id: `levelup-${Date.now()}`,
						message: `${
							attacker.nickname || attacker.name
						} has leveled up to Level ${updatedAttacker.level}!`,
						timestamp: Date.now(),
					});
				}

				// Add move learning notifications
				moveMessages.forEach((msg) => {
					newNotifications.push({
						id: `move-${Date.now()}-${Math.random()}`,
						message: msg,
						timestamp: Date.now(),
					});
				});
			}

			// Create new tiles, removing fainted Team 2 Pokemon
			const newTiles = state.mapState.tiles.map((row) =>
				row.map((tile) => {
					if (tile.unit?.templateId === target.templateId) {
						if (isFainted && target.teamId === 'team2') {
							return { ...tile, unit: undefined };
						}
						return { ...tile, unit: updatedTarget };
					}
					if (tile.unit?.templateId === attacker.templateId) {
						return { ...tile, unit: updatedAttacker };
					}
					return tile;
				})
			);

			// Update units state
			const newUnits = { ...state.units };
			if (isFainted && target.teamId === 'team2') {
				delete newUnits[target.templateId];
			} else {
				newUnits[target.templateId] = updatedTarget;
			}
			newUnits[attacker.templateId] = updatedAttacker;

			const newState = {
				...state,
				selectedMove: undefined,
				phase: 'movement' as GamePhase,
				validTargets: [],
				units: newUnits,
				mapState: {
					...state.mapState,
					tiles: newTiles,
				},
				notifications: [...state.notifications, ...newNotifications],
			};

			return newState;
		}

		case 'ADD_UNITS': {
			const newUnits = { ...state.units };
			const newTiles = state.mapState.tiles.map((row) =>
				row.map((tile) => ({ ...tile }))
			);

			// Type guard to ensure we're working with Pokemon[]
			if (Array.isArray(action.payload)) {
				action.payload.forEach((pokemon: Pokemon) => {
					// Add to units dictionary
					newUnits[pokemon.templateId] = pokemon;

					// Add to map tiles
					const { x, y } = pokemon.position;
					if (newTiles[y] && newTiles[y][x]) {
						newTiles[y][x].unit = pokemon;
					}
				});
			}

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
						hasAttacked: false,
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
								hasAttacked: false,
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

		case 'ADD_NOTIFICATION': {
			const newNotification: Notification = {
				id: `notification-${Date.now()}`,
				message: action.payload,
				timestamp: Date.now(),
				dismissed: false,
			};
			return {
				...state,
				notifications: [...state.notifications, newNotification],
			};
		}

		case 'DISMISS_NOTIFICATION': {
			return {
				...state,
				notifications: state.notifications.filter(
					(n) => n.id !== action.payload
				),
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
