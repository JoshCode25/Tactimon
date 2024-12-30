import React, { useEffect, useContext } from 'react';
import { GameProvider, GameContext } from './store/GameContext';
import { GameMap } from './components/Map/GameMap';
import pokemonService from './services/pokemonService';
import { TurnControls } from './components/TurnControls/TurnControls';

// Inner component to handle Pokemon creation
const GameInitializer: React.FC = () => {
	const { dispatch } = useContext(GameContext);

	useEffect(() => {
		const initializePokemon = async () => {
			try {
				// Create Pikachu at (2,2)
				const pikachu = await pokemonService.createPokemon(
					'pikachu',
					5,
					{
						x: 2,
						y: 2,
					},
					{
						teamId: 'team1',
						isLeader: true,
						nickname: 'Pika',
					}
				);

				// Create Gyarados at (6,4)
				const spearow = await pokemonService.createPokemon(
					'spearow',
					2,
					{
						x: 6,
						y: 4,
					},
					{
						teamId: 'team2',
						isLeader: false,
					}
				);

				// Add Pokemon to the game state
				dispatch({
					type: 'ADD_UNITS',
					payload: [pikachu, spearow],
				});
			} catch (error) {
				console.error('Error creating Pokemon:', error);
			}
		};

		initializePokemon();
	}, []); // Empty dependency array means this runs once on mount

	return null;
};

function App() {
	return (
		<GameProvider>
			<GameInitializer />
			<GameMap />
			<TurnControls />
		</GameProvider>
	);
}

export default App;
