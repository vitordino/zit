import { combineReducers, Dispatch as BaseDispatch, Reducer, Observable, AnyAction } from 'redux'

import { settingsReducer, Settings, SettingsAction } from './settings'
import { gitReducer, Git, GitAction } from './git'

export const reducer = combineReducers({
	settings: settingsReducer,
	git: gitReducer
})

export type Action = SettingsAction | GitAction

export type State = { settings: Settings; git: Git }
export type Dispatch = BaseDispatch<Action>
export type Subscribe = (listener: () => void) => () => void

export type Store = {
	getState: () => State
	dispatch: Dispatch
	subscribe: Subscribe
	replaceReducer: (nextReducer: Reducer<State, Action>) => void
	[Symbol.observable](): Observable<State>
}

type MiddlewareStore = Pick<Store, 'getState' | 'dispatch'>

export type Middleware<A extends AnyAction = Action> = (
	store: MiddlewareStore
) => (next: Dispatch) => (action: A) => Promise<A>
