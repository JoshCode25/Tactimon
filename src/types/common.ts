// src/types/common.ts
export type Position = {
	x: number;
	y: number;
};

export type TerrainType = 'plain' | 'grass' | 'water' | 'mountain' | 'forest';

export type ElementalType =
	| 'normal'
	| 'fire'
	| 'water'
	| 'grass'
	| 'electric'
	| 'ice'
	| 'fighting'
	| 'poison'
	| 'ground'
	| 'flying'
	| 'psychic'
	| 'bug'
	| 'rock'
	| 'ghost'
	| 'dragon'
	| 'dark'
	| 'steel'
	| 'fairy';
