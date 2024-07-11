import { Dialog, useDialogStore } from '@ariakit/react/dialog'
import { useDispatch, useGitPath, useGitStore } from '../hooks/useStore'

export const NotInitializedModal = () => {
	const state = useGitStore(x => x?.status?.state)
	const path = useGitPath()
	const dispatch = useDispatch()
	const open = state === 'not_initialized'
	const dialog = useDialogStore({ open })
	const close = () => dispatch({ type: 'GIT:CLOSE', path })
	const initialize = () => dispatch({ type: 'GIT:INITIALIZE', path })
	return (
		<Dialog store={dialog} backdrop={<div className='fixed inset-0 bg-background opacity-50' />}>
			<div className='p-2 absolute left-0 right-0 top-0 bottom-0'>
				<div className='relative left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 border border-border appearance-none outline-none bg-panel-background text-text rounded-t-md py-1 px-4 w-full max-w-96 placeholder:text-text-muted border-b-0'>
					repo not initialized
				</div>
				<div className='flex relative left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 w-full max-w-96'>
					<button
						onClick={close}
						className='flex-1 border border-error-border appearance-none outline-none bg-error-background text-error rounded-b-md rounded-r-none py-1 px-4'
					>
						close
					</button>
					<button
						onClick={initialize}
						className='flex-1 border border-border appearance-none outline-none bg-background text-text rounded-b-md rounded-l-none py-1 px-4'
					>
						initialize
					</button>
				</div>
			</div>
		</Dialog>
	)
}
