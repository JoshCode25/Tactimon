import {
	PokemonTemplate,
	Pokemon,
	PokemonTemplateCache,
	BaseStats,
} from '../types/pokemon';
import {
	Move,
	MoveData,
	VersionGroupDetail,
	LearnableMove,
	MoveTemplate,
} from '../types/moves';
import { ElementalType, Position } from '../types/common';
import { TeamId } from '../types/map';

// In-memory cache for Pokemon templates
const templateCache: PokemonTemplateCache = {};

export class PokemonService {
	private static instance: PokemonService;
	private readonly API_BASE_URL = 'https://pokeapi.co/api/v2';

	private constructor() {}

	public static getInstance(): PokemonService {
		if (!PokemonService.instance) {
			PokemonService.instance = new PokemonService();
		}
		return PokemonService.instance;
	}

	public calculateStats(baseStats: BaseStats, level: number): BaseStats {
		return {
			hp: Math.floor((2 * baseStats.hp * level) / 100 + level + 10),
			attack: Math.floor((2 * baseStats.attack * level) / 100 + 5),
			defense: Math.floor((2 * baseStats.defense * level) / 100 + 5),
			spAttack: Math.floor((2 * baseStats.spAttack * level) / 100 + 5),
			spDefense: Math.floor((2 * baseStats.spDefense * level) / 100 + 5),
			speed: Math.floor((2 * baseStats.speed * level) / 100 + 5),
		};
	}

	private async fetchPokemonTemplate(
		identifier: string
	): Promise<PokemonTemplate> {
		if (templateCache[identifier]) {
			return templateCache[identifier];
		}

		try {
			const response = await fetch(
				`${this.API_BASE_URL}/pokemon/${identifier}`
			);
			const data = await response.json();

			const baseStats = {
				hp: data.stats[0].base_stat,
				attack: data.stats[1].base_stat,
				defense: data.stats[2].base_stat,
				spAttack: data.stats[3].base_stat,
				spDefense: data.stats[4].base_stat,
				speed: data.stats[5].base_stat,
			};

			// Transform API data into our PokemonTemplate format
			const template: PokemonTemplate = {
				id: data.id.toString(),
				name: data.name,
				types: data.types.map(
					(t: { type: { name: ElementalType } }) => t.type.name
				),
				baseStats,
				naturalMoves: await this.fetchMoves(data.moves),
				size: {
					height: data.height / 10, // Convert to meters
					weight: data.weight / 10, // Convert to kilograms
				},
				sprites: {
					front: data.sprites.front_default,
					back: data.sprites.back_default,
					icon: data.sprites.versions['generation-viii'].icons.front_default,
				},
				// Default recruitment difficulty based on base stat total
				recruitDifficulty:
					Object.values(baseStats).reduce((a, b) => a + b) / 100,
			};

			// Add evolution data
			const speciesResponse = await fetch(data.species.url);
			const speciesData = await speciesResponse.json();
			const evolutionResponse = await fetch(speciesData.evolution_chain.url);
			const evolutionData = await evolutionResponse.json();

			// Find this Pokemon's evolution data in the chain
			const evolution = this.findEvolutionInChain(
				evolutionData.chain,
				template.id
			);
			if (evolution) {
				template.evolution = evolution;
			}

			// Cache the template
			templateCache[identifier] = template;
			return template;
		} catch (error) {
			console.error('Error fetching Pokemon template:', error);
			throw error;
		}
	}

	private async fetchMoves(movesData: MoveData[]): Promise<LearnableMove[]> {
		const naturalMoves = movesData
			.filter((m) =>
				m.version_group_details.some(
					(d: VersionGroupDetail) => d.move_learn_method.name === 'level-up'
				)
			)
			.map(async (m) => {
				const moveResponse = await fetch(m.move.url);
				const moveData = await moveResponse.json();

				const moveTemplate: MoveTemplate = {
					id: moveData.id.toString(),
					name: moveData.name,
					type: moveData.type.name,
					category: moveData.damage_class.name,
					basePower: moveData.power || 0,
					accuracy: moveData.accuracy || 100,
					pp: moveData.pp,
					priority: moveData.priority,
					description: moveData.effect_entries[0]?.effect || '',
					tactical: {
						range: { min: 1, max: 1 }, // Default melee range
						areaOfEffect: {
							pattern: 'single',
							size: 1,
						},
						targeting: {
							affectsEmpty: false,
							affectsAllies: false,
							affectsSelf: false,
							requiresLineOfSight: true,
							canOverwriteStatus: undefined,
						},
					},
				};

				// Get level learned from version group details
				const levelDetail = m.version_group_details.find(
					(d) => d.move_learn_method.name === 'level-up'
				);

				return {
					move: moveTemplate,
					levelLearned: levelDetail?.level_learned_at || 1,
					method: 'levelup' as const,
				};
			});

		return Promise.all(naturalMoves);
	}

	private findEvolutionInChain(
		chain: any,
		pokemonId: string
	): { level: number; evolvesInto: string } | undefined {
		if (chain.species.url.endsWith(`/${pokemonId}/`)) {
			if (chain.evolves_to.length > 0) {
				const evolution = chain.evolves_to[0];
				const details = evolution.evolution_details[0];
				if (details.trigger.name === 'level-up') {
					return {
						level: details.min_level,
						evolvesInto: evolution.species.url.split('/').slice(-2, -1)[0],
					};
				}
			}
		}

		for (const evolution of chain.evolves_to) {
			const result = this.findEvolutionInChain(evolution, pokemonId);
			if (result) return result;
		}

		return undefined;
	}

	public async createPokemon(
		identifier: string,
		level: number,
		position: Position,
		options: {
			nickname?: string;
			isLeader?: boolean;
			teamId?: TeamId;
		} = {}
	): Promise<Pokemon> {
		const template = await this.fetchPokemonTemplate(identifier);
		const stats = this.calculateStats(template.baseStats, level);

		// Get moves appropriate for level
		const availableMoves = template.naturalMoves
			.filter((m) => m.levelLearned <= level)
			.slice(-4)
			.map((m) => ({
				...m.move,
				currentPP: m.move.pp,
				disabled: false,
			}));

		const pokemon: Pokemon = {
			templateId: template.id,
			name: template.name,
			nickname: options.nickname,
			level,
			experience: 0,
			currentStats: { ...stats },
			maxStats: { ...stats },
			moves: availableMoves,
			position,
			facing: 'south',
			teamId: options.teamId,
			isLeader: options.isLeader || false,
			hasMoved: false,
			hasAttacked: false,
			isFainted: false,
		};

		return pokemon;
	}

	public getTemplate(id: string): PokemonTemplate | undefined {
		return templateCache[id];
	}

	public clearCache(): void {
		Object.keys(templateCache).forEach((key) => delete templateCache[key]);
	}
}

export default PokemonService.getInstance();
