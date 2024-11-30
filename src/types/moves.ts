import { ElementalType, Position } from './common';
import { BaseStats, StatusEffect } from './pokemon';

// Core move mechanics for our tactical RPG
export interface TacticalMoveProperties {
	range: {
		min: number;
		max: number;
	};
	areaOfEffect: {
		pattern: 'single' | 'line' | 'cross' | 'square' | 'diamond';
		size: number; // How many tiles the effect covers
	};
	targeting: {
		canOverwriteStatus: any;
		affectsEmpty: boolean; // Can target empty tiles
		affectsAllies: boolean; // Can target allies
		affectsSelf: boolean; // Can target self
		requiresLineOfSight: boolean;
	};
	movementProperties?: {
		knockback?: number; // Number of tiles to push target
		pullForward?: number; // Number of tiles to pull target
		selfMovement?: number; // Number of tiles user moves
	};
}

// Move template - static data about a move
export interface MoveTemplate {
	id: string;
	name: string;
	type: ElementalType;
	category: 'physical' | 'special' | 'status';
	basePower: number;
	accuracy: number;
	pp: number; // Number of times move can be used
	priority: number; // Higher priority moves go first
	tactical: TacticalMoveProperties;
	effects?: {
		status?: {
			type: StatusEffect['type'];
			chance: number; // Percentage chance to apply
			duration: number; // Number of turns
		};
		statChanges?: Array<{
			stat: keyof BaseStats;
			stages: number; // Positive or negative
			target: 'self' | 'target';
		}>;
		healing?: {
			amount: number; // Percentage of max HP
			target: 'self' | 'target';
		};
	};
	// For UI display
	description: string;
	animation?: {
		type: 'projectile' | 'beam' | 'explosion' | 'status';
		color: string;
		duration: number;
	};
}

// Instance of a move on a Pokemon
export interface Move extends MoveTemplate {
	pp: number; // Maximum PP
	currentPP: number; // Current PP remaining
	disabled?: boolean;
	cooldown?: number;
}

// API response types for fetching move data
export interface VersionGroupDetail {
	level_learned_at: number;
	move_learn_method: {
		name: string;
		url: string;
	};
	version_group: {
		name: string;
		url: string;
	};
}

export interface MoveData {
	move: {
		name: string;
		url: string;
	};
	version_group_details: VersionGroupDetail[];
}

// Example utility types for move management
export type LearnableMove = {
	move: MoveTemplate;
	levelLearned: number;
	method: 'levelup' | 'tutor' | 'tm';
};

export type MoveValidationResult = {
	isValid: boolean;
	inRange: boolean;
	hasLineOfSight: boolean;
	hasPP: boolean;
	targetable: boolean;
	errors: string[];
};

// Move selection for UI
export interface MoveOption {
	move: Move;
	valid: boolean;
	affectedTiles: Position[];
	predictedDamage?: number;
	predictedEffects?: string[];
}

export interface MoveAnimationState {
	active: boolean;
	move: Move;
	user: Position;
	targets: Position[];
	phase: 'start' | 'execute' | 'impact' | 'end';
	progress: number;
}
