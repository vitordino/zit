import { ReactNode, createContext, useEffect, useState } from 'react'

// internal usage, do not export
const _key = 'git-path'
const _getGitPath = () => globalThis.sessionStorage.getItem(_key)

export const GitPathContext = createContext<string | null>(null)

type GitPathProviderProps = { children?: ReactNode }
export const GitPathProvider = ({ children }: GitPathProviderProps) => {
	const [state, setState] = useState<string | null>(null)

	useEffect(() => {
		requestIdleCallback(() => setState(_getGitPath))
		const onStorage = (e: StorageEvent) => {
			if (e.storageArea !== sessionStorage || e.key !== _key || !e.newValue) return
			setState(e.newValue)
		}
		const controller = new AbortController()
		window.addEventListener('storage', onStorage, { signal: controller.signal })
		return () => controller.abort()
	}, [setState])

	return <GitPathContext.Provider value={state}>{children}</GitPathContext.Provider>
}
