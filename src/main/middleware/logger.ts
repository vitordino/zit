import type { Middleware } from 'src/shared/reducers'

export const loggerMiddleware: Middleware = store => next => async action => {
	console.log('dispatching', { action, state: store.getState() })
	const result = next(action)
	console.log('next state', store.getState())
	return result
}
