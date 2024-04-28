import simpleGit, { ResetMode } from 'simple-git'

import { stripBranchSummary, stripFileStatusResult, stripLogResult } from 'src/shared/lib/strip'
import type { Middleware } from 'src/shared/reducers'
import { GitAction } from 'src/shared/reducers/git'
import { createWindow } from 'src/main/window'

const openRepo: Middleware = store => next => async action => {
	if (action.type !== 'GIT:OPEN') return next(action)
	if (!action.path) return next(action)
	createWindow()
	return fetchRefresh(store)(next)(action)
}

const fetchStatus: Middleware = store => next => async action => {
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

const fetchBranch: Middleware = store => next => async action => {
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

const fetchLog: Middleware = store => next => async action => {
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

const fetchRefresh: Middleware = store => next => async action => {
	fetchStatus(store)(next)(action)
	fetchLog(store)(next)(action)
	return fetchBranch(store)(next)(action)
}

const switchBranch: Middleware = store => next => async action => {
	if (action.type !== 'GIT:CHANGE_BRANCH') return next(action)
	const isClean = store.getState().git?.status?.data?.isClean
	if (!isClean)
		return next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: 'branch is not clean, commit or stash before changing branches' },
		})
	try {
		await simpleGit({ baseDir: action.path }).checkout(action.payload)
		return fetchBranch(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: 'issue while changing branches' },
		})
		return fetchBranch(store)(next)(action)
	}
}

const stageFile: Middleware = store => next => async action => {
	if (action.type !== 'GIT:STAGE') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).add(action.payload)
		return fetchStatus(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging file: ${action.payload}` },
		})
		return fetchStatus(store)(next)(action)
	}
}

const stageAll: Middleware = store => next => async action => {
	if (action.type !== 'GIT:STAGE_ALL') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).add('.')
		return fetchStatus(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging all files` },
		})
		return fetchStatus(store)(next)(action)
	}
}

const unstageFile: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNSTAGE') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).reset(ResetMode.MIXED, ['--', action.payload])
		return fetchStatus(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging file: ${action.payload}` },
		})
		return fetchStatus(store)(next)(action)
	}
}

const unstageAll: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNSTAGE_ALL') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).reset(ResetMode.MIXED, ['--'])
		return fetchStatus(store)(next)(action)
	} catch {
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging all files` },
		})
		return fetchStatus(store)(next)(action)
	}
}

const commit: Middleware = store => next => async action => {
	if (action.type !== 'GIT:COMMIT') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).commit(action.payload)
		fetchStatus(store)(next)(action)
		return fetchLog(store)(next)(action)
	} catch (e) {
		console.log(e)
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while commiting` },
		})
		fetchStatus(store)(next)(action)
		return fetchLog(store)(next)(action)
	}
}

const undoCommit: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNDO_COMMIT') return next(action)

	const latest = store.getState().git.log.data?.latest?.hash
	// don’t let user undo if not on the latest
	if (!latest || latest !== action.payload) return fetchStatus(store)(next)(action)

	try {
		const result = await simpleGit({ baseDir: action.path }).reset(ResetMode.SOFT, ['HEAD~'])
		console.log({ result })
		fetchStatus(store)(next)(action)
		return fetchLog(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while undoing commit: ${action.payload}` },
		})
		fetchStatus(store)(next)(action)
		return fetchLog(store)(next)(action)
	}
}

const push: Middleware = store => next => async action => {
	if (action.type !== 'GIT:PUSH') return next(action)
	try {
		const result = await simpleGit({ baseDir: action.path }).push()
		console.log({ result })
		fetchStatus(store)(next)(action)
		return fetchLog(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while pushing` },
		})
		fetchStatus(store)(next)(action)
		return fetchLog(store)(next)(action)
	}
}

const pull: Middleware = store => next => async action => {
	if (action.type !== 'GIT:PULL') return next(action)
	try {
		const result = await simpleGit({ baseDir: action.path }).pull()
		console.log({ result })
		fetchStatus(store)(next)(action)
		return fetchLog(store)(next)(action)
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while pushing` },
		})
		fetchStatus(store)(next)(action)
		return fetchLog(store)(next)(action)
	}
}

const FETCHER_ACTION_MAP: Partial<Record<GitAction['type'], Middleware>> = {
	'GIT:OPEN': openRepo,
	'GIT:REFRESH': fetchRefresh,
	'GIT:STATUS': fetchStatus,
	'GIT:BRANCH': fetchBranch,
	'GIT:LOG': fetchLog,
	'GIT:CHANGE_BRANCH': switchBranch,
	'GIT:STAGE': stageFile,
	'GIT:STAGE_ALL': stageAll,
	'GIT:UNSTAGE': unstageFile,
	'GIT:UNSTAGE_ALL': unstageAll,
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
