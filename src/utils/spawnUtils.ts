// src/utils/spawnUtils.ts
import { Pokemon } from '../types/pokemon';
import pokemonService from '../services/pokemonService';
import { Position } from '../types/common';
import { MapState } from '../types/map';
import pokemonQueService from '../services/pokemonQueService';

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

	return pokemonQueService.getNextPokemon(faintedPokemon.level, spawnPosition);
}
