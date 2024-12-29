// src/utils/experienceUtils.ts
import { Pokemon } from '../types/pokemon';
import pokemonService from '../services/pokemonService';

export function calculateExperience(faintedPokemon: Pokemon): number {
	return faintedPokemon.level;
}

export function processExperienceGain(
	pokemon: Pokemon,
	gainedExp: number
): {
	pokemon: Pokemon;
	levelsGained: number;
	moveMessages: string[];
} {
	let currentExp = pokemon.experience + gainedExp;
	let currentLevel = pokemon.level;
	let levelsGained = 0;
	const moveMessages: string[] = [];

	const template = pokemonService.getTemplate(pokemon.templateId);
	if (!template) {
		throw new Error(`Cannot find template for Pokemon ${pokemon.templateId}`);
	}

	// Keep leveling up while we have enough exp
	while (currentExp >= currentLevel) {
		currentExp -= currentLevel;
		currentLevel++;
		levelsGained++;

		// Check for new moves at this level
		const newMoves = template.naturalMoves.filter(
			(move) => move.levelLearned === currentLevel
		);

		newMoves.forEach((move) => {
			moveMessages.push(
				`${pokemon.nickname || pokemon.name} can learn ${
					move.move.name
				} at level ${currentLevel}`
			);
		});

		// Calculate new stats using the template's base stats
		const updatedStats = pokemonService.calculateStats(
			template.baseStats,
			currentLevel
		);
	}

	// Calculate new stats for the leveled up Pokemon
	const updatedStats = pokemonService.calculateStats(
		template.baseStats,
		currentLevel
	);

	return {
		pokemon: {
			...pokemon,
			level: currentLevel,
			experience: currentExp,
			maxStats: updatedStats,
			currentStats: {
				...updatedStats,
				hp: pokemon.currentStats.hp, // Maintain current HP
			},
		},
		levelsGained,
		moveMessages,
	};
}
