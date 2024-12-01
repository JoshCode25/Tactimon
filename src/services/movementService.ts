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
		return Math.floor(template.baseStats.speed / 20) + 2;
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
		const baseRange = this.calculateBaseMovementRange(pokemon);
		const validMoves: Position[] = [];

		// Create a matrix for the grid
		const matrix = mapState.tiles.map((row) =>
			row.map((tile) => {
				const cost = this.getMovementCost(tile.terrain, pokemon);
				// Convert cost to 0 (unwalkable) or 1 (walkable)
				return cost === Infinity ? 0 : 1;
			})
		);

		// Create grid from matrix
		const grid = new PF.Grid(matrix);

		// Check each tile within maximum possible range
		const maxRange = baseRange * 2; // Account for diagonal movement
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

				// Create a copy of the grid for pathfinding
				const gridBackup = grid.clone();
				const finder = new PF.AStarFinder({
					diagonalMovement: PF.DiagonalMovement.Never,
				});

				const path = finder.findPath(
					pokemon.position.x,
					pokemon.position.y,
					x,
					y,
					gridBackup
				);

				// Calculate movement cost along the path
				if (path.length > 0) {
					let totalCost = 0;
					// Skip first position (current position)
					for (let i = 1; i < path.length; i++) {
						const tile = mapState.tiles[path[i][1]][path[i][0]];
						totalCost += this.getMovementCost(tile.terrain, pokemon);
					}

					// Add position if within movement range
					if (totalCost <= baseRange) {
						validMoves.push({ x, y });
					}
				}
			}
		}

		return validMoves;
	}
}

export default MovementService.getInstance();
