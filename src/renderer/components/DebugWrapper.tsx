import { ReactNode, useEffect } from 'react'
import { useDispatch, useStore } from 'src/renderer/hooks/useStore'

const DebugPanel = ({ children }: { children: ReactNode }) => {
	const dispatch = useDispatch()
	const state = useStore(x => x)
	const getStatus = () => dispatch({ type: 'GIT:STATUS' })
	const getBranches = () => dispatch({ type: 'GIT:BRANCH' })
	return (
		<>
			<div className='absolute h-screen w-1/2 overflow-auto border-border border-r bg-panel-background'>
				<button className='block' onClick={getStatus}>
					get status
				</button>
				<button className='block' onClick={getBranches}>
					get branches
				</button>
				<pre className='select-all pointer-events-auto'>{JSON.stringify(state, null, 2)}</pre>
			</div>
			<div className='w-1/2 ml-[50%] flex h-full flex-col overflow-auto'>{children}</div>
		</>
	)
}

export const DebugWrapper = ({ children }: { children: ReactNode }) => {
	const debug = useStore(x => x.settings?.debug)
	const dispatch = useDispatch()
	const setDebug = (payload: boolean) => dispatch({ type: 'SETTINGS:SET_DEBUG', payload })

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (!e.metaKey || e.key !== '\\') return
			setDebug(!debug)
		}
		window.addEventListener('keydown', onKeyDown)
		return () => {
			window.removeEventListener('keydown', onKeyDown)
		}
	}, [setDebug])

	if (!debug) return children
	return <DebugPanel>{children}</DebugPanel>
}
