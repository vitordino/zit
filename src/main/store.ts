import { configureStore } from '@reduxjs/toolkit'

import { reducer, State, Action, Store } from 'src/shared/reducers'
import { middleware } from 'src/main/middleware'

export const store: Store = configureStore<State, Action>({
	// @ts-expect-error ignore for now
	reducer,
	// @ts-expect-error ignore for now
	middleware: x => [...x(), ...middleware],
})
