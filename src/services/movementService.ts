import PF from 'pathfinding';
import { Position, TerrainType } from '../types/common';
import { Pokemon } from '../types/pokemon';
import { MapState, MapTile } from '../types/map';
import pokemonService from './pokemonService';

interface TerrainCost {
	multiplier: number;
	restricted?: string[]; // Pokemon types that cannot enter
}

export class MovementService {
	private static instance: MovementService;

	private terrainCosts: Record<TerrainType, TerrainCost> = {
		plain: { multiplier: 1.0 },
		grass: { multiplier: 1.0 },
		forest: { multiplier: 1.5 },
		water: {
			multiplier: 2.0,
			restricted: ['fire', 'ground', 'rock'],
		},
		mountain: {
			multiplier: 2.0,
			restricted: ['water'],
		},
	};

	private constructor() {}

	public static getInstance(): MovementService {
		if (!MovementService.instance) {
			MovementService.instance = new MovementService();
		}
		return MovementService.instance;
	}

	public calculateBaseMovementRange(pokemon: Pokemon): number {
		const template = pokemonService.getTemplate(pokemon.templateId);
		if (!template) return 3; // Default movement range

		// Normalize speed to movement range
		return Math.floor(template.baseStats.speed / 35) + 2;
	}

	public getMovementCost(terrain: TerrainType, pokemon: Pokemon): number {
		const template = pokemonService.getTemplate(pokemon.templateId);
		if (!template) return Infinity;

		const cost = this.terrainCosts[terrain];

		// Check if Pokemon type is restricted from this terrain
		if (
			cost.restricted &&
			template.types.some((type) => cost.restricted?.includes(type))
		) {
			return Infinity;
		}

		return cost.multiplier;
	}

	public findValidMoves(pokemon: Pokemon, mapState: MapState): Position[] {
		console.log('Finding valid moves for pokemon:', pokemon);
		const baseRange = this.calculateBaseMovementRange(pokemon);
		console.log('Base movement range:', baseRange);

		const validMoves: Position[] = [];

		// Add current position as a valid move (for staying in place)
		validMoves.push({ x: pokemon.position.x, y: pokemon.position.y });

		// Check each tile within maximum possible range
		const maxRange = baseRange;
		for (let dy = -maxRange; dy <= maxRange; dy++) {
			for (let dx = -maxRange; dx <= maxRange; dx++) {
				const x = pokemon.position.x + dx;
				const y = pokemon.position.y + dy;

				// Skip if out of bounds
				if (
					x < 0 ||
					y < 0 ||
					x >= mapState.tiles[0].length ||
					y >= mapState.tiles.length
				) {
					continue;
				}

				// Skip if Manhattan distance is greater than movement range
				if (Math.abs(dx) + Math.abs(dy) > maxRange) {
					continue;
				}

				// Skip if tile is occupied by another unit
				const targetTile = mapState.tiles[y][x];
				if (targetTile.unit && targetTile.unit !== pokemon) {
					continue;
				}

				// Check if terrain is traversable
				const terrainCost = this.getMovementCost(targetTile.terrain, pokemon);
				if (terrainCost === Infinity) {
					continue;
				}

				// Simple distance-based validation
				const manhattanDistance = Math.abs(dx) + Math.abs(dy);
				if (manhattanDistance * terrainCost <= baseRange) {
					validMoves.push({ x, y });
				}
			}
		}

		console.log('Valid moves found:', validMoves);
		return validMoves;
	}
}

export default MovementService.getInstance();
