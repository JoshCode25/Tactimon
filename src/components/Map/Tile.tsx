// src/components/Map/Tile.tsx
import React from 'react';
import { MapTile } from '../../types/map';
import { Unit } from './Unit';
import { Position } from '../../types/common';

interface TileProps {
	tile: MapTile;
	onClick: (position: Position) => void;
}

export const Tile: React.FC<TileProps> = ({ tile, onClick }) => {
	const getBackgroundColor = () => {
		switch (tile.terrain) {
			case 'plain':
				return 'bg-amber-50';
			case 'grass':
				return 'bg-green-200';
			case 'water':
				return 'bg-blue-200';
			case 'mountain':
				return 'bg-stone-400';
			case 'forest':
				return 'bg-emerald-300';
			default:
				return 'bg-gray-100';
		}
	};

	const handleClick = () => {
		// If there's a unit on this tile, log its info
		if (tile.unit) {
			console.log('Pokemon clicked:', tile.unit);
		}

		// Still call the original onClick handler
		onClick(tile.position);
	};

	return (
		<div
			className={`
        w-16 h-16 
        border border-gray-300
        ${getBackgroundColor()}
        ${tile.highlighted ? 'ring-2 ring-blue-500' : ''}
        ${
					tile.selectable
						? 'cursor-pointer hover:ring-2 hover:ring-green-500'
						: ''
				}
        hover:brightness-110
        transition-all duration-200
        flex items-center justify-center
        relative
      `}
			onClick={handleClick}
		>
			<span className="text-xs text-gray-500 absolute top-1 left-1">
				{tile.position.x},{tile.position.y}
			</span>

			{tile.unit && <Unit pokemon={tile.unit} selected={tile.highlighted} />}
		</div>
	);
};
