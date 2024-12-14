// src/components/Battle/BattleControls.tsx
import React, { useContext } from 'react';
import { GameContext } from '../../store/GameContext';
import { Move } from '../../types/moves';

export const BattleControls: React.FC = () => {
  const { state, dispatch } = useContext(GameContext);
  const { selectedUnit } = state;

  if (!selectedUnit) return null;

  const handleMoveSelect = (move: Move) => {
    dispatch({ type: 'SELECT_MOVE', payload: move });
  };

  const handleAttackCancel = () => {
    dispatch({ type: 'CANCEL_ATTACK' });
  };

  return (
    <div className="fixed bottom-4 left-4 flex flex-col gap-2 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="font-bold text-lg mb-2">Moves</h3>
      <div className="grid grid-cols-2 gap-2">
        {selectedUnit.moves.map((move) => (
          <button
            key={move.id}
            onClick={() => handleMoveSelect(move)}
            disabled={move.currentPP <= 0 || selectedUnit.hasMoved}
            className={`
              px-4 py-2 rounded
              ${move.currentPP > 0 && !selectedUnit.hasMoved
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 cursor-not-allowed'}
            `}
          >
            {move.name} ({move.currentPP}/{move.pp})
          </button>
        ))}
      </div>
      <button
        onClick={handleAttackCancel}
        className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
      >
        Cancel
      </button>
    </div>
  );
};