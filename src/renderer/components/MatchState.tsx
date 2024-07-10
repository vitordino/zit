import { ReactNode } from 'react'
import { FetchState } from 'src/shared/reducers/git'
import { useGitStore } from 'src/renderer/hooks/useStore'

type MatchStateProps = {
	match: (state: FetchState) => boolean
	children: ReactNode
}

export const MatchState = ({ match, children }: MatchStateProps) => {
	const state = useGitStore(x => x?.status?.state)
	return !!state && match(state) && children
}
