import { Reducer } from 'redux'

export type Notification = { id: string; parent: string; body: string }
export type Notifications = { entries: Notification[] }

export type NotificationsAction =
	| { type: 'NOTIFICATIONS:LOAD'; payload: Notification[] }
	| { type: 'NOTIFICATIONS:ADD_NOTIFICATION'; payload: Notification }
	| { type: 'NOTIFICATIONS:REMOVE_NOTIFICATION'; payload: { id: string } }

export const INITIAL_STATE = { entries: [] }

export const notificationsReducer: Reducer<Notifications, NotificationsAction> = (
	state = INITIAL_STATE,
	action,
) => {
	switch (action.type) {
		case 'NOTIFICATIONS:LOAD':
			return { ...state, entries: action.payload }
		case 'NOTIFICATIONS:ADD_NOTIFICATION':
			return { ...state, entries: [...state.entries, action.payload] }
		case 'NOTIFICATIONS:REMOVE_NOTIFICATION':
			return { ...state, entries: state.entries.filter(x => x.id !== action.payload.id) }
		default:
			return state
	}
}
