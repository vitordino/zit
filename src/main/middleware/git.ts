import simpleGit from 'simple-git'
import { stripBranchSummary, stripFileStatusResult } from 'src/shared/lib/strip'
import type { Middleware } from 'src/shared/reducers'
import { GitAction } from 'src/shared/reducers/git'

const statusFetcher: Middleware = store => next => async () => {
	// if loading, don’t fire a second fetch request — next(action)
	if (store.getState().git.status.state === 'loading') return next({ type: 'GIT:STATUS@LOADING' })
	try {
		next({ type: 'GIT:STATUS@LOADING' })
		const { isClean, ...status } = await simpleGit({ baseDir: __dirname }).status()
		return next({
			type: 'GIT:STATUS@LOADED',
			payload: {
				...status,
				files: status.files.map(stripFileStatusResult),
				isClean: isClean()
			}
		})
	} catch (e) {
		return next({ type: 'GIT:STATUS@ERROR', payload: JSON.stringify(e) })
	}
}

const branchFetcher: Middleware = store => next => async () => {
	// if loading, don’t fire a second fetch request — next(action)
	if (store.getState().git.branch.state === 'loading') return next({ type: 'GIT:STATUS@LOADING' })
	try {
		next({ type: 'GIT:BRANCH@LOADING' })
		const branch = await simpleGit({ baseDir: __dirname }).branchLocal()
		return next({ type: 'GIT:BRANCH@LOADED', payload: stripBranchSummary(branch) })
	} catch (e) {
		return next({ type: 'GIT:BRANCH@ERROR', payload: JSON.stringify(e) })
	}
}

const refreshFetcher: Middleware = store => next => async action => {
	statusFetcher(store)(next)(action)
	return branchFetcher(store)(next)(action)
}

const branchSwitcher: Middleware = store => next => async action => {
	if (action.type !== 'GIT:CHANGE_BRANCH') return next(action)
	const isClean = store.getState().git?.status?.data?.isClean
	if (!isClean)
		return next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: 'branch is not clean, commit or stash before changing branches' }
		})
	try {
		await simpleGit({ baseDir: __dirname }).checkout(action.payload)
		return branchFetcher(store)(next)(action)
	} catch {
		return next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: 'issue while changing branches' }
		})
		return branchFetcher(store)(next)(action)
	}
}

const FETCHER_ACTION_MAP: Partial<Record<GitAction['type'], Middleware>> = {
	'GIT:REFRESH': refreshFetcher,
	'GIT:STATUS': statusFetcher,
	'GIT:BRANCH': branchFetcher,
	'GIT:CHANGE_BRANCH': branchSwitcher
}

export const gitMiddleware: Middleware = store => next => async action => {
	const fetcher = FETCHER_ACTION_MAP[action.type]
	if (!fetcher) return next(action)
	return fetcher(store)(next)(action)
}
