import React, { useEffect, useState } from 'react';
import { Pokemon } from '../../types/pokemon';
import pokemonService from '../../services/pokemonService';

interface UnitProps {
	pokemon: Pokemon;
	selected?: boolean;
}

export const Unit: React.FC<UnitProps> = ({ pokemon, selected }) => {
	const [template, setTemplate] = useState(
		pokemonService.getTemplate(pokemon.templateId)
	);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		if (!template) {
			const loadTemplate = async () => {
				try {
					await pokemonService.createPokemon(
						pokemon.templateId,
						pokemon.level,
						pokemon.position
					);
					setTemplate(pokemonService.getTemplate(pokemon.templateId));
				} catch (error) {
					console.error('Error loading Pokemon template:', error);
				}
			};
			loadTemplate();
		}
	}, [pokemon.templateId, pokemon.level, pokemon.position, template]);

	const teamColorClass =
		pokemon.teamId === 'team1'
			? 'ring-blue-500 shadow-blue-500/50'
			: 'ring-red-500 shadow-red-500/50';

	if (!template?.sprites.front) {
		return (
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
			</div>
		);
	}

	const healthPercentage =
		(pokemon.currentStats.hp / pokemon.maxStats.hp) * 100;
	const healthColorClass =
		healthPercentage > 50
			? 'bg-green-500'
			: healthPercentage > 25
			? 'bg-yellow-500'
			: 'bg-red-500';

	return (
		<div
			className={`
        absolute inset-0
        flex items-center justify-center
        transition-all duration-200
        ${selected ? 'scale-110 ring-2' : 'ring-1'}
        ring-opacity-50
        ${teamColorClass}
        rounded-lg
        shadow-lg
        ${pokemon.hasMoved ? 'opacity-60' : ''}
      `}
		>
			<img
				src={template.sprites.front}
				alt={pokemon.nickname || pokemon.name}
				className={`
          w-12 h-12 object-contain
          transition-opacity duration-200
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${pokemon.hasMoved ? 'grayscale' : ''}
        `}
				onLoad={() => setIsLoaded(true)}
			/>

			{/* Health bar */}
			<div className="absolute bottom-0 left-1 right-1 h-1 bg-gray-200 rounded-full overflow-hidden">
				<div
					className={`h-full ${healthColorClass} transition-all duration-200`}
					style={{ width: `${healthPercentage}%` }}
				/>
			</div>

			{/* Level indicator */}
			<div className="absolute top-0 right-1 text-xs font-bold text-white bg-gray-800 rounded px-1 opacity-75">
				{pokemon.level}
			</div>

			{/* Leader indicator */}
			{pokemon.isLeader && (
				<div className="absolute top-0 left-1 text-yellow-500">★</div>
			)}

			{/* Moved indicator */}
			{pokemon.hasMoved && (
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="bg-black bg-opacity-30 rounded-full p-1">
						<svg
							className="w-6 h-6 text-white opacity-80"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
				</div>
			)}
		</div>
	);
};
