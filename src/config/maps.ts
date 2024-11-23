// src/config/maps.ts
import { TerrainType } from '../types/common';

type MapGenerator = () => {
	position: { x: number; y: number };
	terrain: TerrainType;
	highlighted: boolean;
	selectable: boolean;
}[][];

// Map 1: Valley Map - A central valley surrounded by mountains and forests
export const valleyMap: MapGenerator = () => {
	return Array(8)
		.fill(null)
		.map((_, y) =>
			Array(8)
				.fill(null)
				.map((_, x) => {
					let terrain: TerrainType;

					if ((x === 0 || x === 7) && y > 1 && y < 6) {
						terrain = 'mountain'; // Mountain borders
					} else if ((y === 0 || y === 7) && x > 1 && x < 6) {
						terrain = 'forest'; // Forest borders
					} else if (x === 3 && y === 3) {
						terrain = 'water'; // Central lake
					} else if (y > 2 && y < 5 && x > 2 && x < 5) {
						terrain = 'grass'; // Valley center
					} else {
						terrain = 'plain';
					}

					return {
						position: { x, y },
						terrain,
						highlighted: false,
						selectable: true,
					};
				})
		);
};

// Map 2: River Map - A winding river with strategic crossing points
export const riverMap: MapGenerator = () => {
	return Array(8)
		.fill(null)
		.map((_, y) =>
			Array(8)
				.fill(null)
				.map((_, x) => {
					let terrain: TerrainType;

					if ((x === 2 && y < 4) || (x === 4 && y > 3)) {
						terrain = 'water'; // River
					} else if (x === 3 && y === 3) {
						terrain = 'plain'; // Bridge/crossing point
					} else if (x < 2 && y < 2) {
						terrain = 'forest'; // Starting area forest
					} else if (x > 5 && y > 5) {
						terrain = 'mountain'; // End area mountains
					} else if ((x + y) % 3 === 0) {
						terrain = 'grass'; // Scattered grasslands
					} else {
						terrain = 'plain';
					}

					return {
						position: { x, y },
						terrain,
						highlighted: false,
						selectable: true,
					};
				})
		);
};

// Map 3: Fortress Map - A central fortress surrounded by varied terrain
export const fortressMap: MapGenerator = () => {
	return Array(8)
		.fill(null)
		.map((_, y) =>
			Array(8)
				.fill(null)
				.map((_, x) => {
					let terrain: TerrainType;

					if ((x === 3 || x === 4) && (y === 3 || y === 4)) {
						terrain = 'mountain'; // Central fortress
					} else if ((x === 2 || x === 5) && y >= 2 && y <= 5) {
						terrain = 'forest'; // Fortress walls
					} else if ((y === 2 || y === 5) && x >= 2 && x <= 5) {
						terrain = 'forest'; // Fortress walls
					} else if (x === 0 || x === 7 || y === 0 || y === 7) {
						terrain = 'water'; // Moat
					} else {
						terrain = 'grass'; // Surroundings
					}

					return {
						position: { x, y },
						terrain,
						highlighted: false,
						selectable: true,
					};
				})
		);
};

// Map configurations with metadata
export interface MapConfig {
	id: string;
	name: string;
	description: string;
	generator: MapGenerator;
	recommendedLevel?: number;
	suggestedTeamSize?: number;
}

export const predefinedMaps: MapConfig[] = [
	{
		id: 'valley',
		name: 'Valley of Decisions',
		description:
			'A strategic valley surrounded by mountains and forests, with a central lake creating choke points.',
		generator: valleyMap,
		recommendedLevel: 1,
		suggestedTeamSize: 4,
	},
	{
		id: 'river',
		name: 'River Crossing',
		description:
			'A winding river divides the map, with a crucial crossing point in the center.',
		generator: riverMap,
		recommendedLevel: 3,
		suggestedTeamSize: 5,
	},
	{
		id: 'fortress',
		name: 'Ancient Fortress',
		description:
			'A mountain fortress protected by forest walls and a water moat.',
		generator: fortressMap,
		recommendedLevel: 5,
		suggestedTeamSize: 6,
	},
];

// Helper function to select a random map
export const selectRandomMap = (): MapConfig => {
	const randomIndex = Math.floor(Math.random() * predefinedMaps.length);
	console.log(`Selected map: ${predefinedMaps[randomIndex].name}`);
	return predefinedMaps[randomIndex];
};
