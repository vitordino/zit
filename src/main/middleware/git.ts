import { app } from 'electron'
import simpleGit, { CheckRepoActions, ResetMode } from 'simple-git'

import { stripBranchSummary, stripFileStatusResult, stripLogResult } from 'src/shared/lib/strip'
import type { Middleware } from 'src/shared/reducers'
import { GitAction } from 'src/shared/reducers/git'
import { createWindow } from 'src/main/window'
import { BrowserWindow } from 'electron/main'

const openRepo: Middleware = store => next => async action => {
	if (action.type !== 'GIT:OPEN') return next(action)
	// user asked to open an already open project
	// [TODO]: focus the window for that project
	if (!action.path || store.getState().git[action.path]?.path) return next(action)
	createWindow({ gitPath: action.path })
	app.addRecentDocument(action.path)
	return next(action)
}

const closeRepo: Middleware = _store => next => async action => {
	if (action.type !== 'GIT:CLOSE') return next(action)
	BrowserWindow.getAllWindows()
		.filter(x => x.getTitle() === action.path)
		.forEach(x => x.close())
	return next(action)
}

const initializeRepo: Middleware = store => next => async action => {
	if (action.type !== 'GIT:INITIALIZE') return next(action)
	const { path } = action
	if (store.getState().git?.[path].status.state !== 'not_initialized') return next(action)
	next({ type: 'GIT:INITIALIZE@LOADING', path })
	try {
		await simpleGit({ baseDir: path }).init()
		next({ type: 'GIT:INITIALIZE@LOADED', path })
	} catch {
		next({ type: 'GIT:INITIALIZE@ERROR', path })
	}
	return store.dispatch({ type: 'GIT:REFRESH', path: action.path })
}

const fetchStatus: Middleware = store => next => async action => {
	if (action.type !== 'GIT:STATUS') return next(action)
	// if loading, don’t fire a second fetch request — next(action)
	if (store.getState().git[action.path]?.status?.state === 'loading') {
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
	if (action.type !== 'GIT:BRANCH') return next(action)
	// if loading, don’t fire a second fetch request — next(action)
	if (store.getState().git[action.path]?.branch?.state === 'loading')
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
	if (action.type !== 'GIT:LOG') return next(action)
	// if loading, don’t fire a second fetch request — next(action)
	if (store.getState().git[action.path]?.log?.state === 'loading') {
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

const refresh: Middleware = store => next => async action => {
	if (action.type !== 'GIT:REFRESH') return next(action)
	const path = action.path
	const isRepo = await simpleGit({ baseDir: path }).checkIsRepo(CheckRepoActions.IS_REPO_ROOT)
	if (!isRepo) return store.dispatch({ type: 'GIT:NOT_INITIALIZED', path })
	store.dispatch({ type: 'GIT:STATUS', path })
	store.dispatch({ type: 'GIT:LOG', path })
	return store.dispatch({ type: 'GIT:BRANCH', path })
}

const switchBranch: Middleware = store => next => async action => {
	if (action.type !== 'GIT:CHANGE_BRANCH') return next(action)
	const isClean = store.getState().git?.[action.path]?.status?.data?.isClean
	console.log('switchBranch', { action, isClean })
	if (!isClean)
		return next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: 'branch is not clean, commit or stash before changing branches' },
		})
	try {
		await simpleGit({ baseDir: action.path }).checkout(action.payload)
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	} catch (e) {
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: 'issue while changing branches' },
		})
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	}
}

const stageFile: Middleware = store => next => async action => {
	if (action.type !== 'GIT:STAGE') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).add(action.payload)
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging file: ${action.payload}` },
		})
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	}
}

const stageAll: Middleware = store => next => async action => {
	if (action.type !== 'GIT:STAGE_ALL') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).add('.')
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging all files` },
		})
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	}
}

const unstageFile: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNSTAGE') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).reset(ResetMode.MIXED, ['--', action.payload])
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging file: ${action.payload}` },
		})
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	}
}

const unstageAll: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNSTAGE_ALL') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).reset(ResetMode.MIXED, ['--'])
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	} catch {
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while staging all files` },
		})
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	}
}

const commit: Middleware = store => next => async action => {
	if (action.type !== 'GIT:COMMIT') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).commit(action.payload)
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	} catch (e) {
		console.log(e)
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while commiting` },
		})
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	}
}

const undoCommit: Middleware = store => next => async action => {
	if (action.type !== 'GIT:UNDO_COMMIT') return next(action)

	const latest = store.getState().git[action.path]?.log.data?.latest?.hash
	// don’t let user undo if not on the latest
	if (!latest || latest !== action.payload) {
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	}

	try {
		await simpleGit({ baseDir: action.path }).reset(ResetMode.SOFT, ['HEAD~'])
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while undoing commit: ${action.payload}` },
		})
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	}
}

const push: Middleware = store => next => async action => {
	if (action.type !== 'GIT:PUSH') return next(action)
	try {
		await simpleGit({ baseDir: action.path }).push()

		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while pushing` },
		})
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	}
}

const pull: Middleware = store => next => async action => {
	if (action.type !== 'GIT:PULL') return next(action)
	try {
		const result = await simpleGit({ baseDir: action.path }).pull()
		console.log({ result })
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	} catch (e) {
		console.log({ e })
		next({
			type: 'NOTIFICATIONS:ADD_NOTIFICATION',
			payload: { body: `issue while pushing` },
		})
		return refresh(store)(next)({ type: 'GIT:REFRESH', path: action.path })
	}
}

const GIT_ACTION_MAP: Partial<Record<GitAction['type'], Middleware>> = {
	'GIT:OPEN': openRepo,
	'GIT:CLOSE': closeRepo,
	'GIT:INITIALIZE': initializeRepo,
	'GIT:STATUS': fetchStatus,
	'GIT:BRANCH': fetchBranch,
	'GIT:LOG': fetchLog,
	'GIT:REFRESH': refresh,
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
	const fetcher = GIT_ACTION_MAP[action.type]
	if (!fetcher) return next(action)
	return fetcher(store)(next)(action)
}
