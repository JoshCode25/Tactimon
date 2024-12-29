// src/types/notifications.ts
export interface Notification {
	id: string;
	message: string;
	timestamp: number;
	dismissed?: boolean;
}
