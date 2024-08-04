import { Dispatch, SetStateAction } from 'react'
import { useSearch, useLocation } from 'wouter'

type SetState<T> = Dispatch<SetStateAction<T>>

const set = (params: URLSearchParams, key: string, value: string | null) =>
	value === null ? params.delete(key) : params.set(key, value)

const polymorphicSet = (
	params: URLSearchParams,
	key: string,
	oldValue: string | null,
	newValue: string | null | ((oldValue: string | null) => string | null),
) => {
	if (typeof newValue !== 'function') return set(params, key, newValue)
	return set(params, key, newValue(oldValue))
}

export const useSearchKey = (key: string): [string | null, SetState<string | null>] => {
	const search = useSearch()
	const [location, setLocation] = useLocation()
	const state = new URLSearchParams(`?${search}`).get(key)

	const setState: Dispatch<SetStateAction<string | null>> = newState => {
		const params = new URLSearchParams(`?${search}`)
		const state = params.get(key)
		polymorphicSet(params, key, state, newState)
		return setLocation(`${location}?${params.toString()}`)
	}

	return [state, setState]
}
