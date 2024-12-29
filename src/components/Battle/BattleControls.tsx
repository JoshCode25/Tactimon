// src/components/Battle/BattleControls.tsx
import React, { useContext } from 'react';
import { GameContext } from '../../store/GameContext';
import { Move } from '../../types/moves';
import MoveTooltip from './MoveTooltip';
import pokemonService from '../../services/pokemonService';

export const BattleControls: React.FC = () => {
	const { state, dispatch } = useContext(GameContext);
	const { selectedUnit } = state;

	if (!selectedUnit) return null;

	const currentUnit = state.units[selectedUnit.templateId];
	if (!currentUnit) return null;

	// Get Pokemon template for additional info
	const template = pokemonService.getTemplate(currentUnit.templateId);
	if (!template) return null;

	const handleMoveSelect = (move: Move) => {
		dispatch({ type: 'SELECT_MOVE', payload: move });
	};

	const handleAttackCancel = () => {
		dispatch({ type: 'CANCEL_ATTACK' });
	};

	const handleDeselect = () => {
		dispatch({ type: 'DESELECT_UNIT' });
	};

	const handleHeaderClick = () => {
		if (
			currentUnit.teamId === state.mapState.currentTurn &&
			!currentUnit.hasMoved
		) {
			dispatch({ type: 'SELECT_UNIT', payload: currentUnit });
		}
	};

	const isDoneForTurn = currentUnit.hasAttacked && currentUnit.hasMoved;
	const healthPercentage =
		(currentUnit.currentStats.hp / currentUnit.maxStats.hp) * 100;
	const healthColorClass =
		healthPercentage > 50
			? 'bg-green-500'
			: healthPercentage > 25
			? 'bg-yellow-500'
			: 'bg-red-500';

	return (
		<div className="fixed bottom-4 left-4 flex flex-col gap-2 bg-white p-4 rounded-lg shadow-lg w-72">
			{/* Header - Pokemon Info */}
			<div
				className={`cursor-pointer ${
					!currentUnit.hasMoved &&
					currentUnit.teamId === state.mapState.currentTurn
						? 'hover:bg-gray-50'
						: ''
				}`}
				onClick={handleHeaderClick}
			>
				<div className="flex justify-between items-center mb-2">
					<div className="flex-grow">
						<div className="flex justify-between">
							<h3 className="font-bold text-lg">
								{currentUnit.nickname || currentUnit.name}
							</h3>
							<span className="text-gray-600">Lv. {currentUnit.level}</span>
						</div>

						{/* Types */}
						<div className="flex gap-2 mt-1">
							{template.types.map((type) => (
								<span
									key={type}
									className={`px-2 py-0.5 rounded text-xs text-white
                    ${
											type === 'fire'
												? 'bg-red-500'
												: type === 'water'
												? 'bg-blue-500'
												: type === 'grass'
												? 'bg-green-500'
												: type === 'electric'
												? 'bg-yellow-400'
												: 'bg-gray-500'
										}`}
								>
									{type.toUpperCase()}
								</span>
							))}
						</div>
					</div>
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleDeselect();
						}}
						className="text-gray-500 hover:text-gray-700"
					>
						✕
					</button>
				</div>

				{/* HP Bar */}
				<div className="mt-2">
					<div className="flex justify-between text-sm text-gray-600 mb-1">
						<span>HP</span>
						<span>
							{currentUnit.currentStats.hp} / {currentUnit.maxStats.hp}
						</span>
					</div>
					<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
						<div
							className={`h-full ${healthColorClass} transition-all duration-200`}
							style={{ width: `${healthPercentage}%` }}
						/>
					</div>
				</div>

				{/* Status Effect (if any) */}
				{currentUnit.status && (
					<div className="mt-1 text-sm font-medium text-purple-600">
						{currentUnit.status.type.toUpperCase()}
					</div>
				)}
			</div>

			{isDoneForTurn ? (
				<p className="text-gray-600">Unit has completed their turn</p>
			) : (
				<>
					{/* Attack Options */}
					{!currentUnit.hasAttacked && (
						<>
							<h4 className="font-semibold mt-2">Moves:</h4>
							<div className="grid grid-cols-2 gap-2">
								{currentUnit.moves.map((move) => (
									<div key={move.id} className="relative group">
										<button
											onClick={() => handleMoveSelect(move)}
											disabled={move.currentPP <= 0}
											className={`w-full px-4 py-2 rounded
                        						${
																			move.currentPP > 0
																				? 'bg-blue-500 hover:bg-blue-600 text-white'
																				: 'bg-gray-300 cursor-not-allowed'
																		}`}
										>
											{move.name}
										</button>
										<div className="hidden group-hover:block">
											<MoveTooltip move={move} />
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{/* Cancel Attack button */}
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

			{/* Action Status Indicators */}
			<div className="mt-2 flex justify-between text-sm">
				<div
					className={`px-2 py-1 rounded ${
						currentUnit.hasAttacked ? 'bg-gray-200' : 'bg-blue-100'
					}`}
				>
					{currentUnit.hasAttacked ? '✓ Attacked' : '◯ Can Attack'}
				</div>
				<div
					className={`px-2 py-1 rounded ${
						currentUnit.hasMoved ? 'bg-gray-200' : 'bg-green-100'
					}`}
				>
					{currentUnit.hasMoved ? '✓ Moved' : '◯ Can Move'}
				</div>
			</div>
		</div>
	);
};
