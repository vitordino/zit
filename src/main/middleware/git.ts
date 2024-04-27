import simpleGit, { ResetMode } from 'simple-git'
import { stripBranchSummary, stripFileStatusResult, stripLogResult } from 'src/shared/lib/strip'
import type { Middleware } from 'src/shared/reducers'
import { GitAction } from 'src/shared/reducers/git'

const statusFetcher: Middleware = store => next => async action => {
	if (action.type !== 'GIT:STATUS') return next(action)
	const path = action.path
	// if loading, don’t fire a second fetch request — next(action)
	if (store.getState().git.status.state === 'loading') {
		return next({ type: 'GIT:STATUS@LOADING', path })
	}
	try {
		next({ type: 'GIT:STATUS@LOADING', path })
		const { isClean, ...status } = await simpleGit({ baseDir: path }).status()
		return next({
			type: 'GIT:STATUS@LOADED',
			path,
			payload: {
				...status,
				files: status.files.map(stripFileStatusResult),
				isClean: isClean(),
			},
		})
	} catch (e) {
		return next({ type: 'GIT:STATUS@ERROR', path, payload: JSON.stringify(e) })
	}
}

const branchFetcher: Middleware = store => next => async action => {
	if (action.type !== 'GIT:BRANCH') return next(action)
	const path = action.path
	// if loading, don’t fire a second fetch request — next(action)
	if (store.getState().git.branch.state === 'loading')
		return next({ type: 'GIT:BRANCH@LOADING', path })
	try {
		next({ type: 'GIT:BRANCH@LOADING', path })
		const branch = await simpleGit({ baseDir: path }).branchLocal()
		return next({
			type: 'GIT:BRANCH@LOADED',
			path,
			payload: stripBranchSummary(branch),
		})
	} catch (e) {
		return next({ type: 'GIT:BRANCH@ERROR', path, payload: JSON.stringify(e) })
	}
}

const logFetcher: Middleware = store => next => async action => {
	if (action.type !== 'GIT:LOG') return next(action)
	const path = action.path
	// if loading, don’t fire a second fetch request — next(action)
	if (store.getState().git.log.state === 'loading') {
		return next({ type: 'GIT:LOG@LOADING', path })
	}
	try {
		next({ type: 'GIT:LOG@LOADING', path })
		const log = await simpleGit({ baseDir: path }).log({ maxCount: 12, multiLine: false })
		return next({ type: 'GIT:LOG@LOADED', path, payload: stripLogResult(log) })
	} catch (e) {
		return next({ type: 'GIT:LOG@ERROR', path, payload: JSON.stringify(e) })
	}
}

const refreshFetcher: Middleware = store => next => async action => {
	statusFetcher(store)(next)(action)
	logFetcher(store)(next)(action)
	return branchFetcher(store)(next)(action)
}

const branchSwitcher: Middleware = store => next => async action => {
	if (action.type !== 'GIT:CHANGE_BRANCH') return next(action)
	const isClean = store.getState().git?.status?.data?.isClean
	if (!isClean)
		return next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: 'branch is not clean, commit or stash before changing branches' },
		})
	try {
		await simpleGit({ baseDir: action.path }).checkout(action.payload)
		return branchFetcher(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: 'issue while changing branches' },
		})
		return branchFetcher(store)(next)(action)
	}
}

const fileStager: Middleware = store => next => async action => {
	if (action.type !== 'GIT:STAGE') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).add(action.payload)
		return statusFetcher(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging file: ${action.payload}` },
		})
		return statusFetcher(store)(next)(action)
	}
}

const allStager: Middleware = store => next => async action => {
	if (action.type !== 'GIT:STAGE_ALL') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).add('.')
		return statusFetcher(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging all files` },
		})
		return statusFetcher(store)(next)(action)
	}
}

const fileUnstager: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNSTAGE') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).reset(ResetMode.MIXED, ['--', action.payload])
		return statusFetcher(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging file: ${action.payload}` },
		})
		return statusFetcher(store)(next)(action)
	}
}

const allUnstager: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNSTAGE_ALL') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).reset(ResetMode.MIXED, ['--'])
		return statusFetcher(store)(next)(action)
	} catch {
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging all files` },
		})
		return statusFetcher(store)(next)(action)
	}
}

const commit: Middleware = store => next => async action => {
	if (action.type !== 'GIT:COMMIT') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).commit(action.payload)
		statusFetcher(store)(next)(action)
		return logFetcher(store)(next)(action)
	} catch (e) {
		console.log(e)
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while commiting` },
		})
		statusFetcher(store)(next)(action)
		return logFetcher(store)(next)(action)
	}
}

const undoCommit: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNDO_COMMIT') return next(action)

	const latest = store.getState().git.log.data?.latest?.hash
	// don’t let user undo if not on the latest
	if (!latest || latest !== action.payload) return statusFetcher(store)(next)(action)

	try {
		const result = await simpleGit({ baseDir: action.path }).reset(ResetMode.SOFT, ['HEAD~'])
		console.log({ result })
		statusFetcher(store)(next)(action)
		return logFetcher(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while undoing commit: ${action.payload}` },
		})
		statusFetcher(store)(next)(action)
		return logFetcher(store)(next)(action)
	}
}

const push: Middleware = store => next => async action => {
	if (action.type !== 'GIT:PUSH') return next(action)
	try {
		const result = await simpleGit({ baseDir: action.path }).push()
		console.log({ result })
		statusFetcher(store)(next)(action)
		return logFetcher(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while pushing` },
		})
		statusFetcher(store)(next)(action)
		return logFetcher(store)(next)(action)
	}
}

const pull: Middleware = store => next => async action => {
	if (action.type !== 'GIT:PULL') return next(action)
	try {
		const result = await simpleGit({ baseDir: action.path }).pull()
		console.log({ result })
		statusFetcher(store)(next)(action)
		return logFetcher(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while pushing` },
		})
		statusFetcher(store)(next)(action)
		return logFetcher(store)(next)(action)
	}
}

const FETCHER_ACTION_MAP: Partial<Record<GitAction['type'], Middleware>> = {
	'GIT:REFRESH': refreshFetcher,
	'GIT:STATUS': statusFetcher,
	'GIT:BRANCH': branchFetcher,
	'GIT:LOG': logFetcher,
	'GIT:CHANGE_BRANCH': branchSwitcher,
	'GIT:STAGE': fileStager,
	'GIT:STAGE_ALL': allStager,
	'GIT:UNSTAGE': fileUnstager,
	'GIT:UNSTAGE_ALL': allUnstager,
	'GIT:COMMIT': commit,
	'GIT:UNDO_COMMIT': undoCommit,
	'GIT:PUSH': push,
	'GIT:PULL': pull,
}

export const gitMiddleware: Middleware = store => next => async action => {
	const fetcher = FETCHER_ACTION_MAP[action.type]
	if (!fetcher) return next(action)
	return fetcher(store)(next)(action)
}
