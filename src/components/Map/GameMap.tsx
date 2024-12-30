// src/components/Map/GameMap.tsx
import React, { useContext } from 'react';
import { Grid } from './Grid';
import { GameContext } from '../../store/GameContext';
import { Position } from '../../types/common';
import { TurnControls } from '../TurnControls/TurnControls';
import { BattleControls } from '../Battle/BattleControls';
import { setupInitialTeams } from '../../utils/setupTeams';
import NotificationContainer from '../UI/NotificationContainer';
import pokemonQueService from '../../services/pokemonQueService';

export const GameMap: React.FC = () => {
	const { state, dispatch } = useContext(GameContext);

	//Initialize pokemon Que and load initial teams
	React.useEffect(() => {
		async function loadTeams() {
			pokemonQueService.loadPokemon(10);
			const newPokemon = await setupInitialTeams();
			dispatch({ type: 'ADD_UNITS', payload: newPokemon });
		}
		loadTeams();
	}, []);

	const handleTileClick = (position: Position) => {
		dispatch({ type: 'SELECT_TILE', payload: position });
	};

	const handleDismissNotification = (id: string) => {
		dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
			<div className="bg-white rounded-lg shadow-lg p-4">
				<Grid mapState={state.mapState} onTileClick={handleTileClick} />
			</div>
			<TurnControls />
			{state.selectedUnit && <BattleControls />}
			<NotificationContainer
				notifications={state.notifications}
				onDismiss={handleDismissNotification}
			/>
		</div>
	);
};
