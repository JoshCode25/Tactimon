// src/components/Map/Tile.tsx
import React from 'react';
import { MapTile } from '../../types/map';
import { Position } from '../../types/common';

interface TileProps {
	tile: MapTile;
	onClick: (position: Position) => void;
}

export const Tile: React.FC<TileProps> = ({ tile, onClick }) => {
	const getBackgroundColor = () => {
		switch (tile.terrain) {
			case 'plain':
				return 'bg-stone-200';
			case 'grass':
				return 'bg-green-200';
			case 'water':
				return 'bg-blue-200';
			case 'mountain':
				return 'bg-stone-400';
			case 'forest':
				return 'bg-green-400';
			default:
				return 'bg-gray-100';
		}
	};

	console.log('Rendering tile:', tile); // Debug log

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
        hover:bg-yellow-100
        transition-all duration-200
        flex items-center justify-center
        relative
      `}
			onClick={() => {
				console.log('Tile clicked:', tile.position); // Debug log
				onClick(tile.position);
			}}
		>
			{/* Debug position display */}
			<span className="text-xs text-gray-500 absolute top-1 left-1">
				{tile.position.x},{tile.position.y}
			</span>

			{tile.unit && <div className="w-12 h-12 bg-red-500 rounded-full" />}
		</div>
	);
};
