// src/components/UI/BattleNotification.tsx
import React, { useEffect } from 'react';
import { Notification } from '../../types/notifications';

interface BattleNotificationProps {
	notification: Notification;
	onDismiss: (id: string) => void;
}

const BattleNotification: React.FC<BattleNotificationProps> = ({
	notification,
	onDismiss,
}) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onDismiss(notification.id);
		}, 10000);

		return () => clearTimeout(timer);
	}, [notification.id, onDismiss]);

	return (
		<div
			className={`
        flex items-center justify-between
        bg-gray-800 text-white
        px-4 py-3 rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        hover:bg-gray-700 cursor-pointer
        ${notification.dismissed ? 'opacity-0 translate-y-2' : 'opacity-100'}
      `}
			onClick={() => onDismiss(notification.id)}
		>
			<span className="mr-4">{notification.message}</span>
			<button
				className="text-gray-400 hover:text-white"
				onClick={(e) => {
					e.stopPropagation();
					onDismiss(notification.id);
				}}
			>
				✕
			</button>
		</div>
	);
};

export default BattleNotification;
