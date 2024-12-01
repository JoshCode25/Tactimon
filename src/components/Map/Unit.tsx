// src/components/Map/Unit.tsx
import React from 'react';
import { Pokemon } from '../../types/pokemon';
import pokemonService from '../../services/pokemonService';

interface UnitProps {
	pokemon: Pokemon;
	selected?: boolean;
}

export const Unit: React.FC<UnitProps> = ({ pokemon, selected }) => {
	const template = pokemonService.getTemplate(pokemon.templateId);

	return (
		<div
			className={`
        absolute inset-0
        flex items-center justify-center
        transition-all duration-200
        ${selected ? 'scale-110' : ''}
      `}
		>
			{template?.sprites.front && (
				<img
					src={template.sprites.front}
					alt={pokemon.nickname || pokemon.name}
					className="w-12 h-12 object-contain"
				/>
			)}
			{/* Health indicator */}
			<div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
				<div
					className="h-full bg-green-500 transition-all"
					style={{
						width: `${(pokemon.currentStats.hp / pokemon.maxStats.hp) * 100}%`,
					}}
				/>
			</div>
		</div>
	);
};
