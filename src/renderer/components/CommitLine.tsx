import { useDispatch, useGitStore } from 'src/renderer/hooks/useStore'
import { useIsLogVisible } from 'src/renderer/hooks/useIsLogVisible'
import { IconButton } from 'src/renderer/components/Button'
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
	<div className='flex bg-editor-subheader-background items-center relative border-t border-border'>
		<IconButton
			tooltip='log'
			iconId='history'
			state={log ? 'highlight' : 'default'}
			onClick={toggleLog}
			className='mx-2'
		/>
		<CommitInput />
		{(!!behind || !!ahead) && (
			<div className='mx-1 flex items-center'>
				{!!behind && (
					<IconButton className='mx-1' tooltip='pull' iconId='cloud-download' onClick={onPull}>
						{behind}
					</IconButton>
				)}
				{!!ahead && (
					<IconButton className='mx-1' tooltip='push' iconId='cloud-upload' onClick={onPush}>
						{ahead}
					</IconButton>
				)}
			</div>
		)}
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
