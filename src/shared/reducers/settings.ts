import { Reducer } from 'redux'
import { Theme } from 'zedwind/constants'

export type Settings = { theme: Theme; debug: boolean }
export type SettingsAction =
	| { type: 'SETTINGS:SET_THEME'; payload: Theme }
	| { type: 'SETTINGS:SET_DEBUG'; payload: boolean }

export const DEFAULT_THEME = 'One Dark' as const satisfies Theme

export const settingsReducer: Reducer<Settings, SettingsAction> = (
	state = { theme: DEFAULT_THEME, debug: false },
	action,
) => {
	switch (action.type) {
		case 'SETTINGS:SET_THEME':
			return { ...state, theme: action.payload }
		case 'SETTINGS:SET_DEBUG':
			return { ...state, debug: action.payload }
		default:
			return state
	}
}
