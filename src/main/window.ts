import { subscribe } from '@parcel/watcher'
import throttle from 'lodash/throttle'
import { shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

import icon from 'resources/icon.png?asset'
import { store } from './store'

const throttledDispatch = throttle(store.dispatch, 250, { leading: true, trailing: true })
const watchRepository = async (path: string) => {
	const subscription = await subscribe(
		path,
		error => !error && throttledDispatch({ type: 'GIT:REFRESH', path }),
		{ ignore: ['.git'] },
	)
	return subscription.unsubscribe
}

const loadHTML = (window: BrowserWindow) => {
	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (!is.dev || !process.env['ELECTRON_RENDERER_URL']) {
		return window.loadFile(join(__dirname, '../renderer/index.html'))
	}
	return window.loadURL(process.env['ELECTRON_RENDERER_URL'])
}

export const createWindow = async ({ gitPath }: { gitPath: string }) => {
	// Create the browser window.
	const window = new BrowserWindow({
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
	window.setTitle(gitPath)
	window.webContents.executeJavaScript(`
	  globalThis.sessionStorage.setItem('git-path', '${gitPath}')
	`)

	ipcMain.on('subscribe', async (state: unknown) => {
		if (window?.isDestroyed()) return
		window?.webContents?.send('subscribe', state)
	})

	window.on('ready-to-show', () => {
		store.dispatch({ type: 'GIT:REFRESH', path: gitPath })
		if (is.dev) return window.showInactive()
		return window.show()
	})

	loadHTML(window)

	const unsubscribe = await watchRepository(gitPath)
	window.on('closed', () => {
		store.dispatch({ type: 'GIT:CLOSE', path: gitPath })
		unsubscribe()
	})

	window.webContents.setWindowOpenHandler(details => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})
}
