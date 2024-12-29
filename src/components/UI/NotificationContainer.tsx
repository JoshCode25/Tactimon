// src/components/UI/NotificationContainer.tsx
import React from 'react';
import { Notification } from '../../types/notifications';
import BattleNotification from './BattleNotification';

interface NotificationContainerProps {
	notifications: Notification[];
	onDismiss: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
	notifications,
	onDismiss,
}) => {
	return (
		<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col gap-2">
			{notifications.map((notification) => (
				<BattleNotification
					key={notification.id}
					notification={notification}
					onDismiss={onDismiss}
				/>
			))}
		</div>
	);
};

export default NotificationContainer;
