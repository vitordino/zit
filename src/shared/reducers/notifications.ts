import { Reducer } from 'redux'

export type Notification = { body: string }
export type Notifications = { notifications: Notification[] }
export type NotificationsAction = { type: 'NOTIFICATIONS:ADD_NOTIFICATION'; payload: Notification }

export const notificationsReducer: Reducer<Notifications, NotificationsAction> = (
	state = { notifications: [] },
	action,
) => {
	switch (action.type) {
		case 'NOTIFICATIONS:ADD_NOTIFICATION':
			return { ...state, notifications: [...state.notifications, action.payload] }
		default:
			return state
	}
}
