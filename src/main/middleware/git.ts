import simpleGit from 'simple-git'
import type { Middleware } from 'src/shared/reducers'
import { GitAction } from 'src/shared/reducers/git'

const statusFetcher: Middleware = _store => next => async () => {
	try {
		next({ type: 'GIT:STATUS@LOADING' })
		const status = await simpleGit({ baseDir: __dirname }).status()
		return next({ type: 'GIT:STATUS@LOADED', payload: { ...status, isClean: status.isClean() } })
	} catch (e) {
		return next({ type: 'GIT:STATUS@ERROR', payload: JSON.stringify(e) })
	}
}

const FETCHER_ACTION_MAP: Partial<Record<GitAction['type'], Middleware>> = {
	'GIT:STATUS': statusFetcher
}

export const gitMiddleware: Middleware = store => next => async action => {
	const fetcher = FETCHER_ACTION_MAP[action.type]
	if (!fetcher) return next(action)
	return fetcher(store)(next)(action)
}
