import type { UseBoundStore } from 'zustand'
import { createUseStore } from 'reduxtron/zustand-store'
import type { Action, State } from 'src/shared/reducers'
import type { GitRepo } from 'src/shared/reducers/git'

export const getGitPath = (): string | null => globalThis.gitPath
export const useGitPath = getGitPath

export const useStore = createUseStore<State, Action>(window.reduxtron)

type UseGitStore = UseBoundStore<{
	getState: () => Partial<GitRepo>
	subscribe: () => () => void
}>
// @ts-expect-error find a safer way to type this
export const useGitStore: UseGitStore = selector => useStore(x => selector(x.git?.[useGitPath()]))

export const useDispatch = () => window.reduxtron.dispatch
