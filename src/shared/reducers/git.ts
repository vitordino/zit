import { Reducer } from 'redux'
import { StatusResult, BranchSummary, LogResult } from 'simple-git'

export type FetchState =
	| 'initial'
	| 'not_initialized'
	| 'idle'
	| 'loading'
	| 'revalidating'
	| 'error'

export type GitStatusData = Omit<StatusResult, 'isClean'> & { isClean: boolean }
export type GitStatus = { state: FetchState; data: GitStatusData | null; error: string | null }
export type GitBranch = { state: FetchState; data: BranchSummary | null; error: string | null }
export type GitLog = { state: FetchState; data: LogResult | null; error: string | null }
export type GitRepo = { path?: string; status: GitStatus; branch: GitBranch; log: GitLog }
export type Git = Record<string, GitRepo>

export type GitAction = { path: string } & (
	| { type: 'GIT:OPEN' }
	| { type: 'GIT:LOAD'; payload: Git }
	| { type: 'GIT:NOT_INITIALIZED' }
	| { type: 'GIT:INITIALIZE' }
	| { type: 'GIT:CLOSE' }
	| { type: 'GIT:STATUS' }
	| { type: 'GIT:STATUS@LOADING' }
	| { type: 'GIT:STATUS@LOADED'; payload: GitRepo['status']['data'] }
	| { type: 'GIT:STATUS@ERROR'; payload: GitRepo['status']['error'] }
	| { type: 'GIT:BRANCH' }
	| { type: 'GIT:BRANCH@LOADING' }
	| { type: 'GIT:BRANCH@LOADED'; payload: GitRepo['branch']['data'] }
	| { type: 'GIT:BRANCH@ERROR'; payload: GitRepo['branch']['error'] }
	| { type: 'GIT:LOG' }
	| { type: 'GIT:LOG@LOADING' }
	| { type: 'GIT:LOG@LOADED'; payload: GitRepo['log']['data'] }
	| { type: 'GIT:LOG@ERROR'; payload: GitRepo['log']['error'] }
	// the combination of all fetchers above
	| { type: 'GIT:REFRESH' }
	// commands
	| { type: 'GIT:CHANGE_BRANCH'; payload: string }
	| { type: 'GIT:STAGE'; payload: string }
	| { type: 'GIT:STAGE_ALL' }
	| { type: 'GIT:UNSTAGE'; payload: string }
	| { type: 'GIT:UNSTAGE_ALL' }
	| { type: 'GIT:COMMIT'; payload: string }
	| { type: 'GIT:UNDO_COMMIT'; payload: string }
	| { type: 'GIT:PUSH' }
	| { type: 'GIT:PULL' }
)

const INITIAL = { state: 'initial', data: null, error: null } as const
export const INITIAL_REPO_STATE: GitRepo = { status: INITIAL, branch: INITIAL, log: INITIAL }

export const gitReducer: Reducer<Git, GitAction> = (state = {}, action) => {
	if (!action.path) return state
	switch (action.type) {
		case 'GIT:OPEN':
			return { ...state, [action.path]: { ...INITIAL_REPO_STATE, path: action.path } }
		case 'GIT:CLOSE':
			if (!action.path) return state
			return Object.fromEntries(Object.entries(state).filter(([path]) => path !== action.path))
		case 'GIT:NOT_INITIALIZED':
			return {
				...state,
				[action.path]: {
					...state[action.path],
					status: {
						...state[action.path]?.status,
						state: 'not_initialized',
					},
				},
			}
		case 'GIT:STATUS@LOADING':
			return {
				...state,
				[action.path]: {
					...state[action.path],
					status: {
						...state[action.path]?.status,
						state: state[action.path]?.status?.data ? 'revalidating' : 'loading',
					},
				},
			}
		case 'GIT:STATUS@LOADED':
			return {
				...state,
				[action.path]: {
					...state[action.path],
					status: { state: 'idle', error: null, data: action.payload },
				},
			}
		case 'GIT:STATUS@ERROR':
			return {
				...state,
				[action.path]: {
					...state[action.path],
					status: { state: 'error', error: action.payload, data: null },
				},
			}

		case 'GIT:BRANCH@LOADING':
			return {
				...state,
				[action.path]: {
					...state[action.path],
					branch: {
						...state[action.path]?.branch,
						state: state[action.path]?.branch?.data ? 'revalidating' : 'loading',
					},
				},
			}
		case 'GIT:BRANCH@LOADED':
			return {
				...state,
				[action.path]: {
					...state[action.path],
					branch: { state: 'idle', error: null, data: action.payload },
				},
			}
		case 'GIT:BRANCH@ERROR':
			return {
				...state,
				[action.path]: {
					...state[action.path],
					branch: { state: 'error', error: action.payload, data: null },
				},
			}

		case 'GIT:LOG@LOADING':
			return {
				...state,
				[action.path]: {
					...state[action.path],
					log: {
						...state[action.path]?.log,
						state: state[action.path]?.log?.data ? 'revalidating' : 'loading',
					},
				},
			}
		case 'GIT:LOG@LOADED':
			return {
				...state,
				[action.path]: {
					...state[action.path],
					log: { state: 'idle', error: null, data: action.payload },
				},
			}
		case 'GIT:LOG@ERROR':
			return {
				...state,
				[action.path]: {
					...state[action.path],
					log: { state: 'error', error: action.payload, data: null },
				},
			}

		default:
			return state
	}
}
