// src/components/Map/Grid.tsx
import React from 'react';
import { Tile } from './Tile';
import { MapState } from '../../types/map';
import { Position } from '../../types/common';

interface GridProps {
	mapState: MapState;
	onTileClick: (position: Position) => void;
}

export const Grid: React.FC<GridProps> = ({ mapState, onTileClick }) => {
	console.log('Rendering Grid with mapState:', mapState); // Debug log

	return (
		<div
			className="grid gap-0 bg-white p-4 rounded-lg shadow-lg"
			style={{
				gridTemplateColumns: `repeat(${mapState.tiles[0].length}, 4rem)`,
				gridTemplateRows: `repeat(${mapState.tiles.length}, 4rem)`,
			}}
		>
			{mapState.tiles.flat().map((tile) => (
				<Tile
					key={`${tile.position.x}-${tile.position.y}`}
					tile={tile}
					onClick={onTileClick}
				/>
			))}
		</div>
	);
};
