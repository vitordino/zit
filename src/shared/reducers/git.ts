import { Reducer } from 'redux'
import { StatusResult } from 'simple-git'

export type GitState = 'initial' | 'idle' | 'loading' | 'revalidating' | 'error'
export type GitStatus = Omit<StatusResult, 'isClean'> & { isClean: boolean }
export type Git = { status: { state: GitState; data: GitStatus | null; error: string | null } }
export type GitAction =
	| { type: 'GIT:STATUS' }
	| { type: 'GIT:STATUS@LOADING' }
	| { type: 'GIT:STATUS@LOADED'; payload: Git['status']['data'] }
	| { type: 'GIT:STATUS@ERROR'; payload: Git['status']['error'] }

export const gitReducer: Reducer<Git, GitAction> = (
	state = { status: { state: 'initial', data: null, error: null } },
	action
) => {
	switch (action.type) {
		case 'GIT:STATUS@LOADING':
			return {
				...state,
				status: { ...state.status, state: state.status?.data ? 'revalidating' : 'loading' }
			}
		case 'GIT:STATUS@LOADED':
			return {
				...state,
				status: { state: 'idle', error: null, data: action.payload }
			}
		case 'GIT:STATUS@ERROR':
			return {
				...state,
				status: { state: 'error', error: action.payload, data: null }
			}
		default:
			return state
	}
}
