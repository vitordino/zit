import { useDispatch, useStore } from 'src/renderer/hooks/useStore'
import { Header } from 'src/renderer/components/Header'

export const App = () => {
	const dispatch = useDispatch()
	const state = useStore(x => x)
	const getStatus = () => dispatch({ type: 'GIT:STATUS' })
	const getBranches = () => dispatch({ type: 'GIT:BRANCH' })
	return (
		<>
			<Header />
			<main>
				<div className='absolute h-screen w-1/2 overflow-auto border-border border-r bg-panel-background'>
					<button className='block' onClick={getStatus}>
						get status
					</button>
					<button className='block' onClick={getBranches}>
						get branches
					</button>
					<pre>{JSON.stringify(state, null, 2)}</pre>
				</div>
			</main>
		</>
	)
}
