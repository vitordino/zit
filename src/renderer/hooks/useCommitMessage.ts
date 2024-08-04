import { useSearchKey } from 'src/renderer/hooks/useSearchKey'

export const useCommitMessage = () => {
	const [state, setState] = useSearchKey('message')
	return [state ?? '', setState] as const
}
