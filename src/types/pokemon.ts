import { ElementalType, Position } from './common';
import { TeamId } from './map';
import { Move, LearnableMove } from './moves';

export interface BaseStats {
	hp: number;
	attack: number;
	defense: number;
	spAttack: number;
	spDefense: number;
	speed: number;
}

export interface StatusEffect {
	type: 'burn' | 'paralysis' | 'sleep' | 'poison' | 'frozen';
	duration: number;
	modifier?: Partial<BaseStats>;
}

export interface Evolution {
	level: number;
	evolvesInto: string; // Pokemon template ID
}

export interface PokemonTemplate {
	id: string;
	name: string;
	types: ElementalType[];
	baseStats: BaseStats;
	naturalMoves: LearnableMove[];
	evolution?: Evolution;
	size: {
		height: number;
		weight: number;
	};
	sprites: {
		front: string;
		back: string;
		icon: string;
	};
	recruitDifficulty: number;
}

export interface Pokemon {
	templateId: string;
	name: string;
	nickname?: string;
	level: number;
	experience: number;
	currentStats: BaseStats;
	maxStats: BaseStats;
	moves: Move[];
	status?: StatusEffect;
	position: Position;
	facing: 'north' | 'south' | 'east' | 'west';
	teamId?: TeamId;
	isLeader: boolean;
	hasMoved: boolean;
	hasAttacked: boolean;
	isFainted: boolean;
}

// Cache for Pokemon templates to avoid repeated API calls
export interface PokemonTemplateCache {
	[key: string]: PokemonTemplate;
}
