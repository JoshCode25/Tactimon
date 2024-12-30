// src/utils/setupTeams.ts
import pokemonService from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';

export async function setupInitialTeams(): Promise<Pokemon[]> {
	const team2Diglett = await pokemonService.createPokemon(
		'diglett',
		3,
		{ x: 7, y: 5 },
		{
			teamId: 'team2',
			isLeader: false,
		}
	);

	const team2Skarmory = await pokemonService.createPokemon(
		'skarmory',
		2,
		{ x: 6, y: 6 },
		{
			teamId: 'team2',
			isLeader: false,
		}
	);
	return [team2Diglett, team2Skarmory];
}
