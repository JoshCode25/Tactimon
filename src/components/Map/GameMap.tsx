// src/components/Map/GameMap.tsx
import React, { useContext } from 'react';
import { Grid } from './Grid';
import { GameContext } from '../../store/GameContext';
import { Position } from '../../types/common';
import { TurnControls } from '../TurnControls/TurnControls';
import { BattleControls } from '../Battle/BattleControls';

export const GameMap: React.FC = () => {
  const { state, dispatch } = useContext(GameContext);

  const handleTileClick = (position: Position) => {
    dispatch({ type: 'SELECT_TILE', payload: position });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <Grid mapState={state.mapState} onTileClick={handleTileClick} />
      </div>
      <TurnControls />
      {state.selectedUnit && <BattleControls />}
    </div>
  );
};