import { Reducer } from 'redux'

export type FolderPickerState = 'closed' | 'picking'

export type AppState = {
	folderPickerState: FolderPickerState
}

const INITIAL_STATE: AppState = { folderPickerState: 'closed' }

export type AppAction =
	| { type: 'APP:PICK_FOLDER' }
	| { type: 'APP:PICK_FOLDER@PICKING' }
	| { type: 'APP:PICK_FOLDER@PICKED'; payload: string[] }
	| { type: 'APP:PICK_FOLDER@CANCELED' }
	| { type: 'APP:QUIT' }

// noop reducer, all behavior happens on middleware
export const appReducer: Reducer<AppState, AppAction> = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case 'APP:PICK_FOLDER@PICKING':
			return { ...state, folderPickerState: 'picking' }
		case 'APP:PICK_FOLDER@PICKED':
		case 'APP:PICK_FOLDER@CANCELED':
			return { ...state, folderPickerState: 'closed' }
		default:
			return state
	}
}
