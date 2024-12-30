// src/utils/spawnUtils.ts
import { Pokemon } from '../types/pokemon';
import pokemonService from '../services/pokemonService';
import { Position } from '../types/common';
import { MapState } from '../types/map';

// List of available Pokemon to spawn - we can expand this later
const SPAWNABLE_POKEMON = [
	'charmander',
	'squirtle',
	'bulbasaur',
	'pikachu',
	'oddish',
	'growlithe',
	'poliwag',
	'abra',
	'machop',
	'geodude',
	'gastly',
	'voltorb',
];

function getRandomPokemon(): string {
	const index = Math.floor(Math.random() * SPAWNABLE_POKEMON.length);
	return SPAWNABLE_POKEMON[index];
}

function findEmptyPosition(mapState: MapState): Position | null {
	const validPositions: Position[] = [];

	mapState.tiles.forEach((row, y) => {
		row.forEach((tile, x) => {
			// Check if tile is empty and not a mountain or water
			if (
				!tile.unit &&
				tile.terrain !== 'mountain' &&
				tile.terrain !== 'water'
			) {
				validPositions.push({ x, y });
			}
		});
	});

	if (validPositions.length === 0) return null;

	const randomIndex = Math.floor(Math.random() * validPositions.length);
	return validPositions[randomIndex];
}

export function spawnNewPokemon(
	faintedPokemon: Pokemon,
	mapState: MapState
): Pokemon | null {
	const spawnPosition = findEmptyPosition(mapState);
	if (!spawnPosition) return null;

	// Calculate new level (0-2 levels higher)
	const levelIncrease = Math.floor(Math.random() * 3);
	const newLevel = faintedPokemon.level + levelIncrease;

	try {
		const template = pokemonService.getTemplate(getRandomPokemon());
		if (!template) return null;

		const stats = pokemonService.calculateStats(template.baseStats, newLevel);

		const newPokemon: Pokemon = {
			templateId: template.id,
			name: template.name,
			level: newLevel,
			experience: 0,
			currentStats: { ...stats },
			maxStats: { ...stats },
			moves: [], // We'll need to handle moves separately
			position: spawnPosition,
			facing: 'south',
			teamId: 'team2',
			isLeader: false,
			hasMoved: false,
			hasAttacked: false,
			isFainted: false,
		};

		return newPokemon;
	} catch (error) {
		console.error('Error spawning new Pokemon:', error);
		return null;
	}
}
