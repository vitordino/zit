import { CompositeProvider, Composite, CompositeItem } from '@ariakit/react/composite'

import { GitLog } from 'src/shared/reducers/git'
import { getRelativeTimeString } from 'src/shared/lib/time'
import { useDispatch, useGitPath, useGitStore } from 'src/renderer/hooks/useStore'
import { useIsLogVisible } from 'src/renderer/hooks/useIsLogVisible'
import { useCommitMessage } from 'src/renderer/hooks/useCommitMessage'

type CommitLogBaseProps = { log?: GitLog['data']; onUndo: (hex: string) => void }
export const CommitLogBase = ({ log, onUndo }: CommitLogBaseProps) => {
	// [TODO]: empty state
	if (!log?.all?.length) return null
	return (
		<CompositeProvider focusLoop virtualFocus>
			<Composite className='group max-h-24 overflow-auto outline-none'>
				{log.all.map((x, i) => (
					<CompositeItem
						className='flex content-between items-center w-full text-left outline-none hover:bg-element-hover group-focus-visible:data-[active-item="true"]:bg-element-selected px-2 text-xs '
						render={y => <div {...y} />}
						key={x.hash}
					>
						<div className='flex-1 leading-6 py-1'>{x.message}</div>
						{!i && (
							<button
								onClick={() => onUndo(x.hash)}
								className='focus-visible:bg-terminal-ansi-bright-red focus-visible:text-terminal-ansi-dim-red hover:bg-terminal-ansi-bright-red hover:text-terminal-ansi-dim-red text-terminal-ansi-red self-stretch px-3 mx-2 outline-none'
							>
								undo
							</button>
						)}
						<time>{getRelativeTimeString(new Date(x.date))}</time>
					</CompositeItem>
				))}
			</Composite>
		</CompositeProvider>
	)
}

export const CommitLog = () => {
	const [isLogVisible] = useIsLogVisible()
	const [_, setCommitMessage] = useCommitMessage()
	const log = useGitStore(x => x?.log?.data)
	const path = useGitPath()
	const dispatch = useDispatch()
	const onUndo = (payload: string) => {
		if (!path) return
		setCommitMessage(log?.latest?.message ?? '')
		dispatch({ type: 'GIT:UNDO_COMMIT', path, payload })
	}
	if (isLogVisible) return null
	return <CommitLogBase log={log} onUndo={onUndo} />
}
