import type { State, Middleware } from 'src/shared/reducers'
import { app } from 'electron'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { INITIAL_STATE as INITIAL_NOTIFICATION_STATE } from 'src/shared/reducers/notifications'
import { INITIAL_STATE as INITIAL_APP_STATE } from 'src/shared/reducers/app'
import { INITIAL_STATE as INITIAL_SETTINGS_STATE } from 'src/shared/reducers/settings'

const folder = join(app.getPath('appData'), 'zit')
const path = join(folder, 'state.json')
const options = { encoding: 'utf-8' } as const
const fallbackState: State = {
	git: {},
	app: INITIAL_APP_STATE,
	notifications: INITIAL_NOTIFICATION_STATE,
	settings: INITIAL_SETTINGS_STATE,
}

export const getPreloadedState = async (): Promise<State> => {
	try {
		const data = await readFile(path, options)
		const result = JSON.parse(data)
		return result
	} catch (e) {
		console.error(`[persistance middleware] couldn’t get state from ${path}`)
		console.error(e)
		return fallbackState
	}
}

const sanitizeDataToSave = (state: State): State => ({
	...fallbackState,
	settings: state.settings,
})

const saveData = async (data: State) => {
	try {
		await mkdir(folder, { recursive: true })
		const stringified = JSON.stringify(sanitizeDataToSave(data), null, 2)
		await writeFile(path, stringified, options)
	} catch (e) {
		console.error(e)
	}
}

export const persistanceMiddleware: Middleware = store => next => async action => {
	if (action.type === 'GLOBAL:LOAD') {
		const payload = await getPreloadedState()
		return next({ type: 'SETTINGS:LOAD', payload: payload.settings })
	}
	if (!action.type.startsWith('SETTINGS:')) return next(action)
	const result = next(action)
	await saveData(store.getState())
	return result
}
