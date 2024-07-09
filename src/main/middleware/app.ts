import { app } from 'electron/main'
import { dialog } from 'electron/main'
import type { Action, Middleware } from 'src/shared/reducers'

export const pickFolderMiddleware: Middleware = store => next => async action => {
	if (action.type !== 'APP:PICK_FOLDER') return next(action)
	const existingPaths = Object.keys(store.getState().git)
	const { canceled, filePaths } = await dialog.showOpenDialog({
		properties: ['openDirectory'],
		title: 'open local repository',
	})
	if (canceled && !filePaths?.[0] && !existingPaths.length) return next({ type: 'APP:QUIT' })
	if (!canceled && filePaths?.[0]) return store.dispatch({ type: 'GIT:OPEN', path: filePaths[0] })
	return next(action)
}

const quitMiddleware: Middleware = _store => next => async action => {
	if (action.type !== 'APP:QUIT') return next(action)
	app.quit()
	return next(action)
}

const APP_MIDDLEWARE_MAP: Partial<Record<Action['type'], Middleware>> = {
	'APP:PICK_FOLDER': pickFolderMiddleware,
	'APP:QUIT': quitMiddleware,
}

export const appMiddleware: Middleware = store => next => async action => {
	const middleware = APP_MIDDLEWARE_MAP[action.type]
	if (!middleware) return next(action)
	return middleware(store)(next)(action)
}
