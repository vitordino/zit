import { Reducer } from 'redux'

export type App = Record<string, never>

export type AppAction = { type: 'APP:PICK_FOLDER' } | { type: 'APP:QUIT' }

// noop reducer, all behavior happens on middleware
export const appReducer: Reducer<App, AppAction> = (state = {}, _action) => state
