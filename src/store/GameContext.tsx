// src/store/GameContext.tsx
import React, { createContext, useReducer, ReactNode } from 'react';
import { GameState } from '../types/game';
import { Position } from '../types/common';
import { selectRandomMap } from '../config/maps';

type GameAction =
	| { type: 'SELECT_TILE'; payload: Position }
	| { type: 'HIGHLIGHT_TILES'; payload: Position[] }
	| { type: 'SELECT_UNIT'; payload: string }
	| { type: 'CHANGE_PHASE'; payload: GameState['phase'] };

const initialState: GameState = {
	mapState: {
		tiles: selectRandomMap().generator(),
		highlightedTiles: [],
		currentTurn: 'player',
	},
	phase: 'movement',
};
const gameReducer = (state: GameState, action: GameAction): GameState => {
	switch (action.type) {
		case 'SELECT_TILE':
			return {
				...state,
				mapState: {
					...state.mapState,
					selectedTile: action.payload,
				},
			};

		case 'HIGHLIGHT_TILES':
			return {
				...state,
				mapState: {
					...state.mapState,
					highlightedTiles: action.payload,
				},
			};

		case 'SELECT_UNIT':
			return {
				...state,
				activeUnit: action.payload,
			};

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
