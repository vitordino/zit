import { inspect } from 'util'
import type { Middleware } from 'src/shared/reducers'

const p = (i: unknown) => inspect(i, { depth: null, colors: true })

export const loggerMiddleware: Middleware = store => next => async action => {
	const result = next(action)
	console.log('='.repeat(80))
	console.log(action)
	console.log('-'.repeat(80))
	console.log(p(store.getState()))
	return result
}
