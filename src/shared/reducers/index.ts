import {
	combineReducers,
	Dispatch as BaseDispatch,
	Reducer,
	Observable,
	AnyAction,
	ActionFromReducer,
} from 'redux'

import { settingsReducer } from './settings'
import { gitReducer } from './git'
import { notificationsReducer } from './notifications'
import { appReducer } from './app'

export const reducer = combineReducers({
	settings: settingsReducer,
	git: gitReducer,
	notifications: notificationsReducer,
	app: appReducer,
})

export type Action = ActionFromReducer<typeof reducer> | { type: 'GLOBAL:LOAD' }
export type State = ReturnType<typeof reducer>
export type Dispatch = BaseDispatch<Action>
export type Subscribe = (listener: () => void) => () => void
export type MatchAction<T extends Action['type']> = Extract<Action, { type: T }>

export type Store = {
	getState: () => State
	dispatch: Dispatch
	subscribe: Subscribe
	replaceReducer: (nextReducer: Reducer<State, Action>) => void
	[Symbol.observable](): Observable<State>
}

type MiddlewareStore = Pick<Store, 'getState' | 'dispatch'>

export type Middleware<A extends AnyAction = Action> = (
	store: MiddlewareStore,
) => (next: Dispatch) => (action: A) => Promise<A>
