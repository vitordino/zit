import { createUseStore } from 'reduxtron/zustand-store'
import { Action, State } from 'src/shared/reducers'

export const useStore = createUseStore<State, Action>(window.reduxtron)

export const useDispatch = () => window.reduxtron.dispatch
