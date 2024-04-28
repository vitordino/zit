import simpleGit, { ResetMode } from 'simple-git'

import { stripBranchSummary, stripFileStatusResult, stripLogResult } from 'src/shared/lib/strip'
import type { Middleware } from 'src/shared/reducers'
import { EMPTY_GIT_ACTION, GitAction } from 'src/shared/reducers/git'
import { createWindow } from 'src/main/window'

const openRepo: Middleware = store => next => async action => {
	if (action.type !== 'GIT:OPEN') return EMPTY_GIT_ACTION
	if (!action.path || store.getState().git.path) return EMPTY_GIT_ACTION
	next(action)
	createWindow({ gitPath: action.path })
	return fetchRefresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
}

const fetchStatus: Middleware = store => next => async action => {
	if (action.type !== 'GIT:STATUS') return EMPTY_GIT_ACTION
	// if loading, don’t fire a second fetch request — next(action)
	if (store.getState().git.status.state === 'loading') {
		return next({ type: 'GIT:STATUS@LOADING', path: action.path })
	}
	try {
		next({ type: 'GIT:STATUS@LOADING', path: action.path })
		const { isClean, ...status } = await simpleGit({ baseDir: action.path }).status()
		return next({
			type: 'GIT:STATUS@LOADED',
			path: action.path,
			payload: {
				...status,
				files: status.files.map(stripFileStatusResult),
				isClean: isClean(),
			},
		})
	} catch (e) {
		return next({ type: 'GIT:STATUS@ERROR', path: action.path, payload: JSON.stringify(e) })
	}
}

const fetchBranch: Middleware = store => next => async action => {
	if (action.type !== 'GIT:BRANCH') return EMPTY_GIT_ACTION
	// if loading, don’t fire a second fetch request — next(action)
	if (store.getState().git.branch.state === 'loading')
		return next({ type: 'GIT:BRANCH@LOADING', path: action.path })
	try {
		next({ type: 'GIT:BRANCH@LOADING', path: action.path })
		const branch = await simpleGit({ baseDir: action.path }).branchLocal()
		return next({
			type: 'GIT:BRANCH@LOADED',
			path: action.path,
			payload: stripBranchSummary(branch),
		})
	} catch (e) {
		return next({ type: 'GIT:BRANCH@ERROR', path: action.path, payload: JSON.stringify(e) })
	}
}

const fetchLog: Middleware = store => next => async action => {
	if (action.type !== 'GIT:LOG') return EMPTY_GIT_ACTION
	// if loading, don’t fire a second fetch request — next(action)
	if (store.getState().git.log.state === 'loading') {
		return next({ type: 'GIT:LOG@LOADING', path: action.path })
	}
	try {
		next({ type: 'GIT:LOG@LOADING', path: action.path })
		const log = await simpleGit({ baseDir: action.path }).log({ maxCount: 12, multiLine: false })
		return next({ type: 'GIT:LOG@LOADED', path: action.path, payload: stripLogResult(log) })
	} catch (e) {
		return next({ type: 'GIT:LOG@ERROR', path: action.path, payload: JSON.stringify(e) })
	}
}

const fetchRefresh: Middleware = store => next => async action => {
	if (action.type !== 'GIT:REFRESH') return EMPTY_GIT_ACTION
	fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
	fetchLog(store)(next)({ type: 'GIT:LOG', path: action.path })
	return fetchBranch(store)(next)({ type: 'GIT:BRANCH', path: action.path })
}

const switchBranch: Middleware = store => next => async action => {
	if (action.type !== 'GIT:CHANGE_BRANCH') return EMPTY_GIT_ACTION
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
	if (action.type !== 'GIT:STAGE') return EMPTY_GIT_ACTION
	try {
		await simpleGit({ baseDir: action.path }).add(action.payload)
		return fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging file: ${action.payload}` },
		})
		return fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
	}
}

const stageAll: Middleware = store => next => async action => {
	if (action.type !== 'GIT:STAGE_ALL') return EMPTY_GIT_ACTION
	try {
		await simpleGit({ baseDir: action.path }).add('.')
		return fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging all files` },
		})
		return fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
	}
}

const unstageFile: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNSTAGE') return EMPTY_GIT_ACTION
	try {
		await simpleGit({ baseDir: action.path }).reset(ResetMode.MIXED, ['--', action.payload])
		return fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging file: ${action.payload}` },
		})
		return fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
	}
}

const unstageAll: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNSTAGE_ALL') return EMPTY_GIT_ACTION
	try {
		await simpleGit({ baseDir: action.path }).reset(ResetMode.MIXED, ['--'])
		return fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
	} catch {
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging all files` },
		})
		return fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
	}
}

const commit: Middleware = store => next => async action => {
	if (action.type !== 'GIT:COMMIT') return EMPTY_GIT_ACTION
	try {
		await simpleGit({ baseDir: action.path }).commit(action.payload)
		fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
		return fetchLog(store)(next)({ type: 'GIT:LOG', path: action.path })
	} catch (e) {
		console.log(e)
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while commiting` },
		})
		fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
		return fetchLog(store)(next)({ type: 'GIT:LOG', path: action.path })
	}
}

const undoCommit: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNDO_COMMIT') return EMPTY_GIT_ACTION

	const latest = store.getState().git.log.data?.latest?.hash
	// don’t let user undo if not on the latest
	if (!latest || latest !== action.payload)
		return fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })

	try {
		const result = await simpleGit({ baseDir: action.path }).reset(ResetMode.SOFT, ['HEAD~'])
		console.log({ result })
		fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
		return fetchLog(store)(next)({ type: 'GIT:LOG', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while undoing commit: ${action.payload}` },
		})
		fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
		return fetchLog(store)(next)({ type: 'GIT:LOG', path: action.path })
	}
}

const push: Middleware = store => next => async action => {
	if (action.type !== 'GIT:PUSH') return EMPTY_GIT_ACTION
	try {
		const result = await simpleGit({ baseDir: action.path }).push()
		console.log({ result })
		fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
		return fetchLog(store)(next)({ type: 'GIT:LOG', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while pushing` },
		})
		fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
		return fetchLog(store)(next)({ type: 'GIT:LOG', path: action.path })
	}
}

const pull: Middleware = store => next => async action => {
	if (action.type !== 'GIT:PULL') return EMPTY_GIT_ACTION
	try {
		const result = await simpleGit({ baseDir: action.path }).pull()
		console.log({ result })
		fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
		return fetchLog(store)(next)({ type: 'GIT:LOG', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while pushing` },
		})
		fetchStatus(store)(next)({ type: 'GIT:STATUS', path: action.path })
		return fetchLog(store)(next)({ type: 'GIT:LOG', path: action.path })
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
