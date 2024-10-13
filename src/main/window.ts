import { shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

import icon from 'resources/icon.png?asset'
import { store } from './store'

export const createWindow = ({ gitPath }: { gitPath: string }) => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 900,
		height: 670,
		show: false,
		autoHideMenuBar: true,
		titleBarStyle: 'hiddenInset',
		trafficLightPosition: { x: 9, y: 9 },
		titleBarOverlay: false,
		frame: false,
		...(process.platform === 'linux' ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			sandbox: true,
			contextIsolation: true,
			nodeIntegration: false,
		},
	})
	mainWindow.setTitle(gitPath)
	mainWindow.webContents.executeJavaScript(`
	  globalThis.sessionStorage.setItem('git-path', '${gitPath}')
	`)

	ipcMain.on('subscribe', async (state: unknown) => {
		if (mainWindow?.isDestroyed()) return
		mainWindow?.webContents?.send('subscribe', state)
	})

	mainWindow.on('ready-to-show', () => {
		store.dispatch({ type: 'GIT:REFRESH', path: gitPath })
		if (is.dev) return mainWindow.showInactive()
		return mainWindow.show()
	})

	mainWindow.on('closed', () => {
		store.dispatch({ type: 'GIT:CLOSE', path: gitPath })
	})

	mainWindow.webContents.setWindowOpenHandler(details => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
	}
}
