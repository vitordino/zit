import { app } from 'electron/main'
import { dialog } from 'electron/main'
import type { Action, Middleware } from 'src/shared/reducers'

export const pickFolderMiddleware: Middleware = store => next => async action => {
	if (action.type !== 'APP:PICK_FOLDER') return next(action)
	// if already picking, ignore
	if (store.getState().app.folderPickerState === 'picking') return next(action)

	// open folder dialog
	next({ type: 'APP:PICK_FOLDER@PICKING' })
	const { canceled, filePaths } = await dialog.showOpenDialog({
		properties: ['openDirectory'],
		title: 'open local repository',
	})
	if (canceled || !filePaths.length) return store.dispatch({ type: 'APP:PICK_FOLDER@CANCELED' })
	return store.dispatch({ type: 'APP:PICK_FOLDER@PICKED', payload: filePaths })
}

const pickFolderPickedMiddleware: Middleware = store => next => async action => {
	if (action.type !== 'APP:PICK_FOLDER@PICKED') return next(action)

	action.payload.forEach(path => store.dispatch({ type: 'GIT:OPEN', path }))
	return next(action)
}

const cancelledPickFolderMiddleware: Middleware = store => next => async action => {
	if (action.type !== 'APP:PICK_FOLDER@CANCELED') return next(action)
	const existingPaths = Object.keys(store.getState().git)
	if (!existingPaths.length) return store.dispatch({ type: 'APP:QUIT' })
	return next(action)
}

const quitMiddleware: Middleware = _store => next => async action => {
	if (action.type !== 'APP:QUIT') return next(action)
	app.quit()
	return next(action)
}

const APP_MIDDLEWARE_MAP: Partial<Record<Action['type'], Middleware>> = {
	'APP:PICK_FOLDER': pickFolderMiddleware,
	'APP:PICK_FOLDER@PICKED': pickFolderPickedMiddleware,
	'APP:PICK_FOLDER@CANCELED': cancelledPickFolderMiddleware,
	'APP:QUIT': quitMiddleware,
}

export const appMiddleware: Middleware = store => next => async action => {
	const middleware = APP_MIDDLEWARE_MAP[action.type]
	if (!middleware) return next(action)
	return middleware(store)(next)(action)
}
