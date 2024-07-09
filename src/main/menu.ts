import { Menu, app } from 'electron/main'
import { Dispatch } from 'src/shared/reducers'

export const createMenu = (dispatch: Dispatch) =>
	Menu.setApplicationMenu(
		Menu.buildFromTemplate([
			{
				label: 'Zit',
				type: 'submenu',
				role: 'appMenu',
				submenu: [
					{
						label: 'quit',
						accelerator: 'CMD+Q',
						click: () => app.quit(),
					},
				],
			},
			{
				label: 'File',
				type: 'submenu',
				submenu: [
					{
						label: 'Open...',
						accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
						click: () => dispatch({ type: 'APP:PICK_FOLDER' }),
					},
					{
						label: 'Open Recent',
						type: 'submenu',
						role: 'recentDocuments',
						submenu: [{ label: 'Clear Recent', role: 'clearRecentDocuments' }],
					},
				],
			},
		]),
	)
