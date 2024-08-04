import { FormEvent } from 'react'
import { useDispatch, useGitStore } from 'src/renderer/hooks/useStore'
import { useCommitMessage } from 'src/renderer/hooks/useCommitMessage'
import { CommitLineButton } from 'src/renderer/components/Button'

type CommitInputBaseProps = {
	onCommit?: (message: string) => void
	commitDisabled?: boolean
	message: string
	setMessage: (message: string) => void
}
export const CommitInputBase = ({
	onCommit,
	commitDisabled,
	message,
	setMessage,
}: CommitInputBaseProps) => {
	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		onCommit?.(message)
		setMessage('')
	}
	return (
		<form className='w-full flex items-stretch bg-editor-subheader-background' onSubmit={onSubmit}>
			<textarea
				className='flex-1 bg-editor-subheader-background resize-none outline-none px-2 py-[6px] placeholder:text-text-muted ring-1 ring-border whitespace-nowrap w-0'
				value={message}
				onChange={e => setMessage(e.target.value)}
				placeholder='commit message'
				onKeyDown={e => {
					if (!e.metaKey || e.key !== 'Enter') return
					onCommit?.(message)
					setMessage('')
				}}
			/>
			<CommitLineButton type='submit' disabled={!message.length || commitDisabled}>
				commit
			</CommitLineButton>
		</form>
	)
}

export const CommitInput = () => {
	const [message, setMessage] = useCommitMessage()
	const commitDisabled = useGitStore(x => !x?.status?.data?.staged.length)
	const path = useGitStore(x => x?.path)
	const dispatch = useDispatch()
	const onCommit = (payload: string) => path && dispatch({ type: 'GIT:COMMIT', path, payload })

	return (
		<CommitInputBase
			onCommit={onCommit}
			commitDisabled={commitDisabled}
			message={message}
			setMessage={setMessage}
		/>
	)
}
