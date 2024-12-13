// src/components/TurnControls/TurnControls.tsx
import React, { useContext } from 'react';
import { GameContext } from '../../store/GameContext';
import { TeamId } from '../../types/map';

export const TurnControls: React.FC = () => {
	const { state, dispatch } = useContext(GameContext);

	const handleEndTurn = () => {
		const nextTurn: TeamId =
			state.mapState.currentTurn === 'team1' ? 'team2' : 'team1';
		dispatch({ type: 'END_TURN', payload: nextTurn });
	};

	return (
		<div className="fixed bottom-4 right-4 flex flex-col items-end gap-2">
			<div className="bg-white px-4 py-2 rounded-lg shadow-lg mb-2">
				<span className="font-bold">
					Current Turn:{' '}
					{state.mapState.currentTurn === 'team1' ? 'Team 1' : 'Team 2'}
				</span>
			</div>
			<button
				onClick={handleEndTurn}
				className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-lg transition-colors"
			>
				End Turn
			</button>
		</div>
	);
};
