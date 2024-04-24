import { Reducer } from 'redux'
import { Theme } from 'zedwind/constants'

export type Settings = { theme: Theme }
export type SettingsAction = { type: 'SETTINGS:SET_THEME'; payload: Theme }

export const DEFAULT_THEME = 'One Dark' as const satisfies Theme

export const settingsReducer: Reducer<Settings, SettingsAction> = (
	state = { theme: DEFAULT_THEME },
	action
) => {
	switch (action.type) {
		case 'SETTINGS:SET_THEME':
			return { ...state, theme: action.payload }
		default:
			return state
	}
}
