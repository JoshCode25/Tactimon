import React from 'react';
import { Move } from '../../types/moves';

interface MoveTooltipProps {
	move: Move;
}

const MoveTooltip: React.FC<MoveTooltipProps> = ({ move }) => {
	const getTypeColor = (type: string) => {
		const typeColors: { [key: string]: string } = {
			normal: 'bg-gray-400',
			fire: 'bg-red-500',
			water: 'bg-blue-500',
			grass: 'bg-green-500',
			electric: 'bg-yellow-400',
			ice: 'bg-blue-200',
			fighting: 'bg-red-700',
			poison: 'bg-purple-500',
			ground: 'bg-yellow-600',
			flying: 'bg-indigo-400',
			psychic: 'bg-pink-500',
			bug: 'bg-lime-500',
			rock: 'bg-yellow-800',
			ghost: 'bg-purple-700',
			dragon: 'bg-indigo-600',
			dark: 'bg-gray-700',
			steel: 'bg-gray-500',
			fairy: 'bg-pink-300',
		};
		return typeColors[type.toLowerCase()] || 'bg-gray-400';
	};

	return (
		<div
			className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 
                    bg-gray-800 text-white rounded-lg p-3 text-sm shadow-lg"
		>
			{/* Triangle pointer */}
			<div
				className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 
                    w-0 h-0 border-l-4 border-r-4 border-t-4 
                    border-l-transparent border-r-transparent border-t-gray-800"
			></div>

			{/* Move Type Badge */}
			<div
				className={`inline-block px-2 py-0.5 rounded ${getTypeColor(
					move.type
				)} text-white text-xs mb-2`}
			>
				{move.type.toUpperCase()}
			</div>

			{/* Move Category */}
			<div className="text-gray-300 text-xs mb-2">
				{move.category.charAt(0).toUpperCase() + move.category.slice(1)}
			</div>

			{/* Stats */}
			<div className="space-y-1">
				{move.basePower > 0 && (
					<div className="flex justify-between">
						<span className="text-gray-400">Power:</span>
						<span>{move.basePower}</span>
					</div>
				)}
				<div className="flex justify-between">
					<span className="text-gray-400">Accuracy:</span>
					<span>{move.accuracy}%</span>
				</div>
				<div className="flex justify-between">
					<span className="text-gray-400">PP:</span>
					<span>
						{move.currentPP}/{move.pp}
					</span>
				</div>
			</div>

			{/* Effects */}
			{move.effects && (
				<div className="mt-2 text-xs text-gray-300 border-t border-gray-600 pt-2">
					{move.effects.status && (
						<div>
							May cause {move.effects.status.type}({move.effects.status.chance}%
							chance)
						</div>
					)}
					{move.effects.statChanges?.map((change, index) => (
						<div key={index}>
							{change.stages > 0 ? 'Raises' : 'Lowers'} {change.stat} by{' '}
							{Math.abs(change.stages)}
						</div>
					))}
					{move.effects.healing && (
						<div>
							Restores {move.effects.healing.amount}% HP (
							{move.effects.healing.target === 'self' ? 'user' : 'target'})
						</div>
					)}
				</div>
			)}

			{/* Move Description */}
			{move.description && (
				<div className="mt-2 text-xs text-gray-300 border-t border-gray-600 pt-2">
					{move.description}
				</div>
			)}
		</div>
	);
};

export default MoveTooltip;
