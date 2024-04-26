import { combineReducers, Dispatch as BaseDispatch, Reducer, Observable, AnyAction, ActionFromReducer } from 'redux'

import { settingsReducer } from './settings'
import { gitReducer } from './git'
import { notificationsReducer } from './notifications'

export const reducer = combineReducers({
	settings: settingsReducer,
	git: gitReducer,
	notifications: notificationsReducer
})

export type Action = ActionFromReducer<typeof reducer>
export type State = ReturnType<typeof reducer>
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
