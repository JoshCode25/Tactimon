// src/services/pokemonQueueService.ts
import { Pokemon } from '../types/pokemon';
import pokemonService from './pokemonService';

class PokemonQueueService {
	private static instance: PokemonQueueService;
	private queue: Pokemon[] = [];
	private isLoading = false;

	private constructor() {}

	public static getInstance(): PokemonQueueService {
		if (!PokemonQueueService.instance) {
			PokemonQueueService.instance = new PokemonQueueService();
		}
		return PokemonQueueService.instance;
	}

	// List of Pokemon IDs to randomly select from
	private availablePokemon = Array.from({ length: 151 }, (_, i) =>
		(i + 1).toString()
	);

	private getRandomPokemonId(): string {
		const index = Math.floor(Math.random() * this.availablePokemon.length);
		return this.availablePokemon[index];
	}

	public async loadPokemon(amount: number = 1) {
		if (this.isLoading) return;
		this.isLoading = true;

		try {
			for (let i = 0; i < amount; i++) {
				const pokemon = await pokemonService.createPokemon(
					this.getRandomPokemonId(),
					1, // Default level, will be adjusted when spawned
					{ x: 0, y: 0 }, // Default position, will be updated when spawned
					{ teamId: 'team2' }
				);
				this.queue.push(pokemon);
			}
		} catch (error) {
			console.error('Error loading Pokemon:', error);
		} finally {
			this.isLoading = false;
		}
	}

	public getNextPokemon(
		level: number,
		position: { x: number; y: number }
	): Pokemon | null {
		if (this.queue.length === 0) {
			// Start loading more Pokemon if queue is empty
			this.loadPokemon(5);
			return null;
		}

		const pokemon = this.queue.shift();
		if (!pokemon) return null;

		// Load one more Pokemon to replace the one we just took
		this.loadPokemon(1);

		// Adjust level and position
		const levelIncrease = Math.floor(Math.random() * 3);
		const newLevel = level + levelIncrease;

		// Calculate new stats for the adjusted level
		const template = pokemonService.getTemplate(pokemon.templateId);
		if (!template) return null;

		const stats = pokemonService.calculateStats(template.baseStats, newLevel);

		return {
			...pokemon,
			level: newLevel,
			position,
			currentStats: stats,
			maxStats: stats,
		};
	}

	public get queueSize(): number {
		return this.queue.length;
	}
}

export default PokemonQueueService.getInstance();
