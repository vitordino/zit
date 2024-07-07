import { Menu, app } from 'electron/main'

export const createMenu = () =>
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
						label: 'Open Recent',
						type: 'submenu',
						role: 'recentDocuments',
						submenu: [
							{ label: 'Clear Recent', role: 'clearRecentDocuments' },
							{ type: 'separator' },
						],
					},
				],
			},
		]),
	)
