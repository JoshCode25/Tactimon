// src/utils/setupTeams.ts
import pokemonService from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';

export async function setupInitialTeams(): Promise<Pokemon[]> {
	const team1Dugtrio = await pokemonService.createPokemon(
		'dugtrio',
		35,
		{ x: 1, y: 1 },
		{
			teamId: 'team1',
			isLeader: false,
		}
	);

	const team2Skarmory = await pokemonService.createPokemon(
		'skarmory',
		25,
		{ x: 6, y: 6 },
		{
			teamId: 'team2',
			isLeader: false,
		}
	);

	return [team1Dugtrio, team2Skarmory];
}
