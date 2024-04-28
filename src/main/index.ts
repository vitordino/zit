import { app, BrowserWindow, ipcMain } from 'electron/main'
import { dialog } from 'electron/main'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { mainReduxBridge } from 'reduxtron/main'

import { store } from 'src/main/store'
import { tray } from 'src/main/tray'
import { createWindow } from 'src/main/window'

const { unsubscribe } = mainReduxBridge(ipcMain, store)

tray.setState(store.getState())
tray.setDispatch(store.dispatch)
store.subscribe(() => tray.setState(store.getState()))

// check to see if there’s a selected path to open a window for,
// otherwise open file dialog and update store to include a path
const createWindowOrPickFolder = async () => {
	if (store.getState().git.path) return createWindow()
	const { canceled, filePaths } = await dialog.showOpenDialog({
		properties: ['openDirectory'],
		title: 'open local repository',
	})
	console.log({ canceled, filePaths })
	if (canceled || !filePaths?.length) return app.quit()
	store.dispatch({ type: 'GIT:OPEN', path: filePaths[0] })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId('com.electron')

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window)
	})

	createWindowOrPickFolder()
	tray.create()

	app.on('activate', () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindowOrPickFolder()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('quit', unsubscribe)

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
