import React, { useEffect } from 'react';
import { GameProvider } from './store/GameContext';
import { GameMap } from './components/Map/GameMap';
import pokemonService from './services/pokemonService';

function App() {
	useEffect(() => {
		const testPokemonCreation = async () => {
			try {
				// Create a Charizard at level 50 at position (2,2)
				const charizard = await pokemonService.createPokemon(
					'charizard',
					50,
					{ x: 2, y: 2 },
					{
						nickname: 'Flamey',
						isLeader: true,
						teamId: 'player',
					}
				);
				console.log('Created Pokemon:', charizard);

				// Get the template data
				const template = pokemonService.getTemplate(charizard.templateId);
				console.log('Pokemon Template:', template);

				// Create another Pokemon
				const pikachu = await pokemonService.createPokemon('pikachu', 25, {
					x: 3,
					y: 3,
				});
				console.log('Created second Pokemon:', pikachu);
			} catch (error) {
				console.error('Error creating Pokemon:', error);
			}
		};

		testPokemonCreation();
	}, []); // Empty dependency array means this runs once on mount

	return (
		<GameProvider>
			<GameMap />
		</GameProvider>
	);
}

export default App;
