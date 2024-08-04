import { useDispatch, useGitStore } from 'src/renderer/hooks/useStore'
import { useIsLogVisible } from 'src/renderer/hooks/useIsLogVisible'
import { CommitLineButton } from 'src/renderer/components/Button'
import { CommitInput } from 'src/renderer/components/CommitInput'

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
	const [isLogVisible, setLogVisible] = useIsLogVisible()
	const behind = useGitStore(x => x?.status?.data?.behind)
	const ahead = useGitStore(x => x?.status?.data?.ahead)
	const path = useGitStore(x => x?.path)
	const dispatch = useDispatch()
	const toggleLog = () => setLogVisible(x => !x)

	const onPull = () => path && dispatch({ type: 'GIT:PULL', path })
	const onPush = () => path && dispatch({ type: 'GIT:PUSH', path })

	return (
		<CommitLineBase
			log={isLogVisible}
			toggleLog={toggleLog}
			behind={behind}
			ahead={ahead}
			onPull={onPull}
			onPush={onPush}
		/>
	)
}
