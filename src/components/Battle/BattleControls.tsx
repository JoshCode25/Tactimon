// src/components/Battle/BattleControls.tsx
import React, { useContext } from 'react';
import { GameContext } from '../../store/GameContext';
import { Move } from '../../types/moves';

export const BattleControls: React.FC = () => {
	const { state, dispatch } = useContext(GameContext);
	const { selectedUnit } = state;

	// Only hide controls if no unit is selected
	if (!selectedUnit) return null;

	// Get the most up-to-date unit state from the units record
	const currentUnit = state.units[selectedUnit.templateId];

	// If we can't find the unit in the record, don't show controls
	if (!currentUnit) return null;

	const handleMoveSelect = (move: Move) => {
		dispatch({ type: 'SELECT_MOVE', payload: move });
	};

	const handleShowMovement = () => {
		dispatch({ type: 'SELECT_UNIT', payload: currentUnit });
	};

	const handleAttackCancel = () => {
		dispatch({ type: 'CANCEL_ATTACK' });
	};

	const handleDeselect = () => {
		dispatch({ type: 'SELECT_TILE', payload: { x: -1, y: -1 } }); // This will trigger unit deselection
	};

	const isDoneForTurn = currentUnit.hasAttacked && currentUnit.hasMoved;

	return (
		<div className="fixed bottom-4 left-4 flex flex-col gap-2 bg-white p-4 rounded-lg shadow-lg">
			<div className="flex justify-between items-center mb-2">
				<h3 className="font-bold text-lg">Actions</h3>
				<button
					onClick={handleDeselect}
					className="text-gray-500 hover:text-gray-700"
				>
					✕
				</button>
			</div>

			{isDoneForTurn ? (
				<p className="text-gray-600">Unit has completed their turn</p>
			) : (
				<>
					{/* Movement Option */}
					{!currentUnit.hasMoved && (
						<button
							onClick={handleShowMovement}
							className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
						>
							Move
						</button>
					)}

					{/* Attack Options */}
					{!currentUnit.hasAttacked && (
						<>
							<h4 className="font-semibold mt-2">Moves:</h4>
							<div className="grid grid-cols-2 gap-2">
								{currentUnit.moves.map((move) => (
									<button
										key={move.id}
										onClick={() => handleMoveSelect(move)}
										disabled={move.currentPP <= 0}
										className={`
                      px-4 py-2 rounded
                      ${
												move.currentPP > 0
													? 'bg-blue-500 hover:bg-blue-600 text-white'
													: 'bg-gray-300 cursor-not-allowed'
											}
                    `}
									>
										{move.name} ({move.currentPP}/{move.pp})
									</button>
								))}
							</div>
						</>
					)}

					{state.phase === 'combat' && (
						<button
							onClick={handleAttackCancel}
							className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
						>
							Cancel Attack
						</button>
					)}
				</>
			)}

			{/* Status Display */}
			<div className="mt-2 text-sm text-gray-600 space-y-1">
				<div>{currentUnit.hasMoved ? '✓ Moved' : '◯ Can Move'}</div>
				<div>{currentUnit.hasAttacked ? '✓ Attacked' : '◯ Can Attack'}</div>
			</div>
		</div>
	);
};
