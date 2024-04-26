import { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useStore } from '../hooks/useStore'

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
	}
	return (
		<form
			className='w-full flex items-stretch bg-editor-subheader-background ring-1 ring-border'
			onSubmit={onSubmit}
		>
			<textarea
				className='flex-1 bg-editor-subheader-background resize-none outline-none p-2 placeholder:text-text-muted'
				value={message}
				onChange={e => setMessage(e.target.value)}
				placeholder='commit message'
				onKeyDown={e => {
					if (!e.metaKey || e.key !== 'Enter') return
					onCommit?.(message)
					setMessage('')
				}}
			/>
			<button
				type='submit'
				disabled={!message.length || commitDisabled}
				className='border-l disabled:text-text-disabled border-border outline-none p-2 hover:bg-background active:bg-element-active focus-visible:bg-element-active'
			>
				commit
			</button>
		</form>
	)
}

export const CommitInput = () => {
	const [search, setSearch] = useSearchParams()
	const commitDisabled = useStore(x => !x.git?.status.data?.staged.length)
	const dispatch = useDispatch()
	const onCommit = (payload: string) => dispatch({ type: 'GIT:COMMIT', payload })

	const message = search.get('message') ?? ''
	const setMessage = (message: string) => setSearch({ message })

	return (
		<CommitInputBase
			onCommit={onCommit}
			commitDisabled={commitDisabled}
			message={message}
			setMessage={setMessage}
		/>
	)
}
