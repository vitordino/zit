import { Reducer } from 'redux'

export type Notification = { body: string }
export type Notifications = { notifications: Notification[] }

export type NotificationsAction =
	| { type: 'NOTIFICATIONS:LOAD'; payload: Notification[] }
	| { type: 'NOTIFICATIONS:ADD_NOTIFICATION'; payload: Notification }

export const INITIAL_STATE = { notifications: [] }

export const notificationsReducer: Reducer<Notifications, NotificationsAction> = (
	state = INITIAL_STATE,
	action,
) => {
	switch (action.type) {
		case 'NOTIFICATIONS:LOAD':
			return { ...state, notifications: action.payload }
		case 'NOTIFICATIONS:ADD_NOTIFICATION':
			return { ...state, notifications: [...state.notifications, action.payload] }
		default:
			return state
	}
}
