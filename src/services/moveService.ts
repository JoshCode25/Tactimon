import { ElementalType, Position } from '../types/common';
import { GameState } from '../types/game';
import { MapState } from '../types/map';
import {
	Move,
	MoveTemplate,
	MoveValidationResult,
	TacticalMoveProperties,
} from '../types/moves';
import { Pokemon, PokemonTemplate, StatusEffect } from '../types/pokemon';

export class MoveService {
	private static instance: MoveService;
	private moveTemplateCache: Map<string, MoveTemplate> = new Map();
	private pokemonService: typeof import('./pokemonService').default;

	private constructor() {
		// Synchronously import pokemonService
		// This works because in TypeScript, imports are hoisted
		this.pokemonService = require('./pokemonService').default;
	}

	// Type effectiveness chart (1 = normal, 2 = super effective, 0.5 = not very effective, 0 = no effect)
	private typeChart: Record<ElementalType, Record<ElementalType, number>> = {
		normal: {
			normal: 1,
			fighting: 1,
			flying: 1,
			poison: 1,
			ground: 1,
			rock: 0.5,
			bug: 1,
			ghost: 0,
			steel: 0.5,
			fire: 1,
			water: 1,
			grass: 1,
			electric: 1,
			psychic: 1,
			ice: 1,
			dragon: 1,
			dark: 1,
			fairy: 1,
		},
		fire: {
			normal: 1,
			fighting: 1,
			flying: 1,
			poison: 1,
			ground: 1,
			rock: 0.5,
			bug: 2,
			ghost: 1,
			steel: 2,
			fire: 0.5,
			water: 0.5,
			grass: 2,
			electric: 1,
			psychic: 1,
			ice: 2,
			dragon: 0.5,
			dark: 1,
			fairy: 1,
		},
		water: {
			normal: 1,
			fighting: 1,
			flying: 1,
			poison: 1,
			ground: 2,
			rock: 2,
			bug: 1,
			ghost: 1,
			steel: 1,
			fire: 2,
			water: 0.5,
			grass: 0.5,
			electric: 1,
			psychic: 1,
			ice: 1,
			dragon: 0.5,
			dark: 1,
			fairy: 1,
		},
		electric: {
			normal: 1,
			fighting: 1,
			flying: 2,
			poison: 1,
			ground: 0,
			rock: 1,
			bug: 1,
			ghost: 1,
			steel: 1,
			fire: 1,
			water: 2,
			grass: 0.5,
			electric: 0.5,
			psychic: 1,
			ice: 1,
			dragon: 0.5,
			dark: 1,
			fairy: 1,
		},
		grass: {
			normal: 1,
			fighting: 1,
			flying: 0.5,
			poison: 0.5,
			ground: 2,
			rock: 2,
			bug: 0.5,
			ghost: 1,
			steel: 0.5,
			fire: 0.5,
			water: 2,
			grass: 0.5,
			electric: 1,
			psychic: 1,
			ice: 1,
			dragon: 0.5,
			dark: 1,
			fairy: 1,
		},
		ice: {
			normal: 1,
			fighting: 1,
			flying: 2,
			poison: 1,
			ground: 2,
			rock: 1,
			bug: 1,
			ghost: 1,
			steel: 0.5,
			fire: 0.5,
			water: 0.5,
			grass: 2,
			electric: 1,
			psychic: 1,
			ice: 0.5,
			dragon: 2,
			dark: 1,
			fairy: 1,
		},
		fighting: {
			normal: 2,
			fighting: 1,
			flying: 0.5,
			poison: 0.5,
			ground: 1,
			rock: 2,
			bug: 0.5,
			ghost: 0,
			steel: 2,
			fire: 1,
			water: 1,
			grass: 1,
			electric: 1,
			psychic: 0.5,
			ice: 2,
			dragon: 1,
			dark: 2,
			fairy: 0.5,
		},
		poison: {
			normal: 1,
			fighting: 1,
			flying: 1,
			poison: 0.5,
			ground: 0.5,
			rock: 0.5,
			bug: 1,
			ghost: 0.5,
			steel: 0,
			fire: 1,
			water: 1,
			grass: 2,
			electric: 1,
			psychic: 1,
			ice: 1,
			dragon: 1,
			dark: 1,
			fairy: 2,
		},
		ground: {
			normal: 1,
			fighting: 1,
			flying: 0,
			poison: 2,
			ground: 1,
			rock: 2,
			bug: 0.5,
			ghost: 1,
			steel: 2,
			fire: 2,
			water: 1,
			grass: 0.5,
			electric: 2,
			psychic: 1,
			ice: 1,
			dragon: 1,
			dark: 1,
			fairy: 1,
		},
		flying: {
			normal: 1,
			fighting: 2,
			flying: 1,
			poison: 1,
			ground: 1,
			rock: 0.5,
			bug: 2,
			ghost: 1,
			steel: 0.5,
			fire: 1,
			water: 1,
			grass: 2,
			electric: 0.5,
			psychic: 1,
			ice: 1,
			dragon: 1,
			dark: 1,
			fairy: 1,
		},
		psychic: {
			normal: 1,
			fighting: 2,
			flying: 1,
			poison: 2,
			ground: 1,
			rock: 1,
			bug: 1,
			ghost: 1,
			steel: 0.5,
			fire: 1,
			water: 1,
			grass: 1,
			electric: 1,
			psychic: 0.5,
			ice: 1,
			dragon: 1,
			dark: 0,
			fairy: 1,
		},
		bug: {
			normal: 1,
			fighting: 0.5,
			flying: 0.5,
			poison: 0.5,
			ground: 1,
			rock: 1,
			bug: 1,
			ghost: 0.5,
			steel: 0.5,
			fire: 0.5,
			water: 1,
			grass: 2,
			electric: 1,
			psychic: 2,
			ice: 1,
			dragon: 1,
			dark: 2,
			fairy: 0.5,
		},
		rock: {
			normal: 1,
			fighting: 0.5,
			flying: 2,
			poison: 1,
			ground: 0.5,
			rock: 1,
			bug: 2,
			ghost: 1,
			steel: 0.5,
			fire: 2,
			water: 1,
			grass: 1,
			electric: 1,
			psychic: 1,
			ice: 2,
			dragon: 1,
			dark: 1,
			fairy: 1,
		},
		ghost: {
			normal: 0,
			fighting: 1,
			flying: 1,
			poison: 1,
			ground: 1,
			rock: 1,
			bug: 1,
			ghost: 2,
			steel: 1,
			fire: 1,
			water: 1,
			grass: 1,
			electric: 1,
			psychic: 2,
			ice: 1,
			dragon: 1,
			dark: 0.5,
			fairy: 1,
		},
		dragon: {
			normal: 1,
			fighting: 1,
			flying: 1,
			poison: 1,
			ground: 1,
			rock: 1,
			bug: 1,
			ghost: 1,
			steel: 0.5,
			fire: 1,
			water: 1,
			grass: 1,
			electric: 1,
			psychic: 1,
			ice: 1,
			dragon: 2,
			dark: 1,
			fairy: 0,
		},
		dark: {
			normal: 1,
			fighting: 0.5,
			flying: 1,
			poison: 1,
			ground: 1,
			rock: 1,
			bug: 1,
			ghost: 2,
			steel: 1,
			fire: 1,
			water: 1,
			grass: 1,
			electric: 1,
			psychic: 2,
			ice: 1,
			dragon: 1,
			dark: 0.5,
			fairy: 0.5,
		},
		steel: {
			normal: 1,
			fighting: 1,
			flying: 1,
			poison: 1,
			ground: 1,
			rock: 2,
			bug: 1,
			ghost: 1,
			steel: 0.5,
			fire: 0.5,
			water: 0.5,
			grass: 1,
			electric: 0.5,
			psychic: 1,
			ice: 2,
			dragon: 1,
			dark: 1,
			fairy: 2,
		},
		fairy: {
			normal: 1,
			fighting: 2,
			flying: 1,
			poison: 0.5,
			ground: 1,
			rock: 1,
			bug: 1,
			ghost: 1,
			steel: 0.5,
			fire: 0.5,
			water: 1,
			grass: 1,
			electric: 1,
			psychic: 1,
			ice: 1,
			dragon: 2,
			dark: 2,
			fairy: 1,
		},
	};

	private getPokemonTemplate(id: string): PokemonTemplate | undefined {
		return this.pokemonService.getTemplate(id);
	}

	private calculateTypeEffectiveness(
		moveType: ElementalType,
		target: Pokemon
	): number {
		const targetTemplate = this.getPokemonTemplate(target.templateId);
		if (!targetTemplate) return 1;

		let multiplier = 1;
		targetTemplate.types.forEach((type) => {
			multiplier *= this.typeChart[moveType][type] || 1;
		});

		return multiplier;
	}

	public static getInstance(): MoveService {
		if (!MoveService.instance) {
			MoveService.instance = new MoveService();
		}
		return MoveService.instance;
	}

	// Validate if a move can be used at target position
	public validateMove(
		move: Move,
		user: Pokemon,
		targetPos: Position,
		gameState: GameState
	): MoveValidationResult {
		const errors: string[] = [];
		const result: MoveValidationResult = {
			isValid: true,
			inRange: true,
			hasLineOfSight: true,
			hasPP: true,
			targetable: true,
			errors,
		};

		// Check PP
		if (move.currentPP <= 0) {
			result.hasPP = false;
			result.isValid = false;
			errors.push('No PP remaining');
		}

		// Check range
		const distance = this.calculateDistance(user.position, targetPos);
		if (
			distance < move.tactical.range.min ||
			distance > move.tactical.range.max
		) {
			result.inRange = false;
			result.isValid = false;
			errors.push('Target out of range');
		}

		// Check line of sight if required
		if (move.tactical.targeting.requiresLineOfSight) {
			result.hasLineOfSight = this.checkLineOfSight(
				user.position,
				targetPos,
				gameState
			);
			if (!result.hasLineOfSight) {
				result.isValid = false;
				errors.push('No line of sight to target');
			}
		}

		// Check if target is valid
		const targetTile = gameState.map.getTile(gameState.mapState, targetPos);
		const targetUnit = targetTile?.unit;

		if (targetUnit) {
			// Now targetUnit is a Pokemon object with teamId
			if (
				!move.tactical.targeting.affectsAllies &&
				targetUnit.teamId === user.teamId
			) {
				result.targetable = false;
				result.isValid = false;
				errors.push('Cannot target allies with this move');
			}
		} else if (!move.tactical.targeting.affectsEmpty) {
			result.targetable = false;
			result.isValid = false;
			errors.push('Must target a unit');
		}

		// Additional validation for status moves
		if (move.category === 'status' && targetUnit) {
			// Check if target can receive status effects
			if (targetUnit.status && !move.tactical.targeting.canOverwriteStatus) {
				result.targetable = false;
				result.isValid = false;
				errors.push('Target already has a status effect');
			}
		}

		return result;
	}

	// Get all tiles that would be affected by a move
	public getAffectedTiles(
		move: Move,
		targetPos: Position,
		gameState: GameState
	): Position[] {
		const affectedTiles: Position[] = [];
		const { pattern, size } = move.tactical.areaOfEffect;

		switch (pattern) {
			case 'single':
				affectedTiles.push(targetPos);
				break;
			case 'cross':
				this.addCrossPattern(targetPos, size, affectedTiles);
				break;
			case 'square':
				this.addSquarePattern(targetPos, size, affectedTiles);
				break;
			case 'diamond':
				this.addDiamondPattern(targetPos, size, affectedTiles);
				break;
			case 'line':
				// For line pattern, we need the user's position to determine direction
				// This would be handled by a separate method
				break;
		}

		// Filter out any positions that are off the map
		return affectedTiles.filter((pos) =>
			gameState.map.isValidPosition(gameState.mapState, pos)
		);
	}

	// Calculate combat effects of a move
	public calculateMoveEffects(
		move: Move,
		user: Pokemon,
		targets: Pokemon[]
	): Array<{
		target: Pokemon;
		damage: number;
		effects: StatusEffect[];
	}> {
		return targets.map((target) => {
			const result = {
				target,
				damage: 0,
				effects: [] as StatusEffect[],
			};

			if (move.category !== 'status') {
				result.damage = this.calculateDamage(move, user, target);
			}

			if (move.effects?.status) {
				const { chance, type, duration } = move.effects.status;
				if (Math.random() * 100 < chance) {
					result.effects.push({
						type,
						duration,
					});
				}
			}

			return result;
		});
	}

	public calculateDamage(move: Move, user: Pokemon, target: Pokemon): number {
		// Base damage formula similar to Pokemon games but simplified
		const attackStat =
			move.category === 'physical'
				? user.currentStats.attack
				: user.currentStats.spAttack;
		const defenseStat =
			move.category === 'physical'
				? target.currentStats.defense
				: target.currentStats.spDefense;

		let damage =
			(((2 * user.level) / 5 + 2) * move.basePower * attackStat) /
				defenseStat /
				50 +
			2;

		// Apply STAB (Same Type Attack Bonus)
		const userTemplate = this.getPokemonTemplate(user.templateId);
		if (userTemplate && userTemplate.types.includes(move.type)) {
			damage *= 1.5;
		}

		// Apply type effectiveness (would need a type chart)
		const typeMultiplier = this.calculateTypeEffectiveness(move.type, target);
		damage *= typeMultiplier;

		// Add some randomness (85-100% of calculated damage)
		damage *= 0.85 + Math.random() * 0.15;

		return Math.floor(damage);
	}

	public getValidTargets(move: Move, user: Pokemon, mapState: MapState): Position[] {
		const validTargets: Position[] = [];
		const baseRange = 1; // For now, keeping it simple with adjacent tiles only

		// Check each adjacent tile
		const directions = [
		{ x: 0, y: 1 },  // down
		{ x: 0, y: -1 }, // up
		{ x: 1, y: 0 },  // right
		{ x: -1, y: 0 }, // left
		];

		for (const dir of directions) {
		const targetPos = {
			x: user.position.x + dir.x,
			y: user.position.y + dir.y
		};

		// Skip if out of bounds
		if (targetPos.y < 0 || targetPos.y >= mapState.tiles.length ||
			targetPos.x < 0 || targetPos.x >= mapState.tiles[0].length) {
			continue;
		}

		const targetTile = mapState.tiles[targetPos.y][targetPos.x];
		
		// Skip if no unit on tile and move requires a target
		if (!targetTile.unit && !move.tactical.targeting.affectsEmpty) {
			continue;
		}

		// Skip if unit is on same team and move can't target allies
		if (targetTile.unit && 
			targetTile.unit.teamId === user.teamId && 
			!move.tactical.targeting.affectsAllies) {
			continue;
		}

		validTargets.push(targetPos);
		}

		return validTargets;
	}

	// Helper methods for pattern calculation
	private addCrossPattern(center: Position, size: number, tiles: Position[]) {
		for (let i = -size; i <= size; i++) {
			if (i === 0) continue;
			tiles.push({ x: center.x + i, y: center.y });
			tiles.push({ x: center.x, y: center.y + i });
		}
	}

	private addSquarePattern(center: Position, size: number, tiles: Position[]) {
		for (let dx = -size; dx <= size; dx++) {
			for (let dy = -size; dy <= size; dy++) {
				tiles.push({ x: center.x + dx, y: center.y + dy });
			}
		}
	}

	private addDiamondPattern(center: Position, size: number, tiles: Position[]) {
		for (let dx = -size; dx <= size; dx++) {
			for (let dy = -size; dy <= size; dy++) {
				if (Math.abs(dx) + Math.abs(dy) <= size) {
					tiles.push({ x: center.x + dx, y: center.y + dy });
				}
			}
		}
	}

	// Other helper methods would go here
	private calculateDistance(pos1: Position, pos2: Position): number {
		return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
	}

	private checkLineOfSight(
		start: Position,
		end: Position,
		gameState: GameState
	): boolean {
		// Implement Bresenham's line algorithm
		// Check if any tiles in the line are blocking
		return true; // Placeholder
	}
}

export default MoveService.getInstance();
