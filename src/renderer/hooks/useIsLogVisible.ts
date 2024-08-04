import { Dispatch, SetStateAction, useCallback } from 'react'
import { useSearchKey } from 'src/renderer/hooks/useSearchKey'

type SetState<T> = Dispatch<SetStateAction<T>>
export const useIsLogVisible = (): [boolean, SetState<boolean>] => {
	const [_state, _setState] = useSearchKey('log')
	const state = _state === 'true'

	const setState: SetState<boolean> = useCallback(
		newState => {
			if (typeof newState !== 'function') return _setState(newState.toString())
			return _setState(newState(state).toString())
		},
		[state, _setState],
	)

	return [state, setState] as const
}
