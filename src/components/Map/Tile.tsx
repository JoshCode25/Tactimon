// src/components/Map/Tile.tsx
import React, { useContext } from 'react';
import { MapTile } from '../../types/map';
import { Unit } from './Unit';
import { Position } from '../../types/common';
import { GameContext } from '../../store/GameContext';

interface TileProps {
  tile: MapTile;
  onClick: (position: Position) => void;
}

export const Tile: React.FC<TileProps> = ({ tile, onClick }) => {
  const { state, dispatch } = useContext(GameContext);
  const { selectedUnit, selectedMove, phase } = state;

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
    // Combat phase logic
    if (phase === 'combat' && selectedUnit && selectedMove && tile.unit) {
      const canTarget = state.validTargets.some(
        (pos) => pos.x === tile.position.x && pos.y === tile.position.y
      );

      if (canTarget) {
        dispatch({
          type: 'EXECUTE_ATTACK',
          payload: {
            attacker: selectedUnit,
            target: tile.unit,
            move: selectedMove,
          },
        });
        return;
      }
    }

    // Existing movement logic
    onClick(tile.position);
  };

  return (
    <div
      className={`
        w-16 h-16 
        border border-gray-300
        ${getBackgroundColor()}
        ${tile.highlighted ? 'ring-2 ring-blue-500' : ''}
        ${tile.selectable ? 'cursor-pointer hover:ring-2 hover:ring-green-500' : ''}
        ${
          phase === 'combat' && tile.highlighted
            ? 'ring-2 ring-red-500 cursor-pointer'
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