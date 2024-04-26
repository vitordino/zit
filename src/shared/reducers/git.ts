import { Reducer } from 'redux'
import { StatusResult, BranchSummary } from 'simple-git'

export type GitState = 'initial' | 'idle' | 'loading' | 'revalidating' | 'error'
export type GitStatusData = Omit<StatusResult, 'isClean'> & { isClean: boolean }
export type GitStatus = { state: GitState; data: GitStatusData | null; error: string | null }
export type GitBranch = { state: GitState; data: BranchSummary | null; error: string | null }
export type Git = { status: GitStatus; branch: GitBranch }

export type GitAction =
	| { type: 'GIT:STATUS' }
	| { type: 'GIT:STATUS@LOADING' }
	| { type: 'GIT:STATUS@LOADED'; payload: Git['status']['data'] }
	| { type: 'GIT:STATUS@ERROR'; payload: Git['status']['error'] }
	| { type: 'GIT:BRANCH' }
	| { type: 'GIT:BRANCH@LOADING' }
	| { type: 'GIT:BRANCH@LOADED'; payload: Git['branch']['data'] }
	| { type: 'GIT:BRANCH@ERROR'; payload: Git['branch']['error'] }
	// the combination of all fetchers above
	| { type: 'GIT:REFRESH' }
	// commands
	| { type: 'GIT:CHANGE_BRANCH'; payload: string }
	| { type: 'GIT:STAGE'; payload: string }
	| { type: 'GIT:STAGE_ALL' }
	| { type: 'GIT:UNSTAGE'; payload: string }
	| { type: 'GIT:UNSTAGE_ALL' }

const INITIAL_GIT_STATUS: GitStatus = { state: 'initial', data: null, error: null }
const INITIAL_GIT_BRANCH: GitBranch = { state: 'initial', data: null, error: null }
const INITIAL_STATE: Git = { status: INITIAL_GIT_STATUS, branch: INITIAL_GIT_BRANCH }

export const gitReducer: Reducer<Git, GitAction> = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case 'GIT:STATUS@LOADING':
			return {
				...state,
				status: { ...state.status, state: state.status?.data ? 'revalidating' : 'loading' },
			}
		case 'GIT:STATUS@LOADED':
			return {
				...state,
				status: { state: 'idle', error: null, data: action.payload },
			}
		case 'GIT:STATUS@ERROR':
			return {
				...state,
				status: { state: 'error', error: action.payload, data: null },
			}

		case 'GIT:BRANCH@LOADING':
			return {
				...state,
				branch: { ...state.branch, state: state.branch?.data ? 'revalidating' : 'loading' },
			}
		case 'GIT:BRANCH@LOADED':
			return {
				...state,
				branch: { state: 'idle', error: null, data: action.payload },
			}
		case 'GIT:BRANCH@ERROR':
			return {
				...state,
				branch: { state: 'error', error: action.payload, data: null },
			}
		default:
			return state
	}
}
