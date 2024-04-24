import { MenuItemConstructorOptions } from 'electron'
import { ALL_THEMES } from 'zedwind/constants'

import type { Dispatch, State } from 'src/shared/reducers'

export const TraySettings = (
	state: Partial<State>,
	dispatch: Dispatch
): MenuItemConstructorOptions[] => {
	const themeItems: MenuItemConstructorOptions[] = ALL_THEMES.map(theme => ({
		label: theme,
		type: 'radio',
		checked: theme === state.settings?.theme,
		click: () => dispatch({ type: 'SETTINGS:SET_THEME', payload: theme })
	}))

	return [
		{
			label: 'theme',
			type: 'submenu',
			submenu: [
				{ type: 'normal', label: `current: ${state.settings?.theme}`, enabled: false },
				{ type: 'separator' },
				...themeItems
			]
		}
	]
}
