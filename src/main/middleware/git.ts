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

const branchFetcher: Middleware = _store => next => async () => {
	try {
		next({ type: 'GIT:BRANCH@LOADING' })
		const payload = await simpleGit({ baseDir: __dirname }).branch()
		return next({ type: 'GIT:BRANCH@LOADED', payload })
	} catch (e) {
		return next({ type: 'GIT:BRANCH@ERROR', payload: JSON.stringify(e) })
	}
}

const FETCHER_ACTION_MAP: Partial<Record<GitAction['type'], Middleware>> = {
	'GIT:STATUS': statusFetcher,
	'GIT:BRANCH': branchFetcher
}

export const gitMiddleware: Middleware = store => next => async action => {
	const fetcher = FETCHER_ACTION_MAP[action.type]
	if (!fetcher) return next(action)
	return fetcher(store)(next)(action)
}
