import { useSearchParams } from 'react-router-dom'

import { CommitLineButton } from 'src/renderer/components/Button'
import { CommitInput } from 'src/renderer/components/CommitInput'
import { useDispatch, useStore } from '../hooks/useStore'

type CommitLineBaseProps = {
	log?: boolean
	behind?: number
	ahead?: number
	toggleLog?: () => void
	onPull: () => void
	onPush: () => void
}
export const CommitLineBase = ({
	log,
	toggleLog,
	behind,
	ahead,
	onPull,
	onPush,
}: CommitLineBaseProps) => (
	<div className='flex'>
		<CommitLineButton data-active={log} onClick={toggleLog}>
			log
		</CommitLineButton>
		<CommitInput />
		{!!behind && <CommitLineButton onClick={onPull}>pull&nbsp;{behind}</CommitLineButton>}
		{!!ahead && <CommitLineButton onClick={onPush}>push&nbsp;{ahead}</CommitLineButton>}
	</div>
)

export const CommitLine = () => {
	const [search, setSearch] = useSearchParams()
	const behind = useStore(x => x.git?.status.data?.behind)
	const ahead = useStore(x => x.git?.status.data?.ahead)
	const path = useStore(x => x.git?.path)
	const dispatch = useDispatch()
	const log = search.get('log') === 'true' ? true : false
	const toggleLog = () =>
		setSearch(x => {
			x.set('log', log ? 'false' : 'true')
			return x
		})
	const onPull = () => path && dispatch({ type: 'GIT:PULL', path })
	const onPush = () => path && dispatch({ type: 'GIT:PUSH', path })

	return (
		<CommitLineBase
			log={log}
			toggleLog={toggleLog}
			behind={behind}
			ahead={ahead}
			onPull={onPull}
			onPush={onPush}
		/>
	)
}
