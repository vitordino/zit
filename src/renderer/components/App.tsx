import { useDispatch, useStore } from 'src/renderer/hooks/useStore'
import { ThemeSelector } from 'src/renderer/components/ThemeSelector'

const App = () => {
	const dispatch = useDispatch()
	const state = useStore(x => x)
	const getStatus = () => dispatch({ type: 'GIT:STATUS' })
	const getBranches = () => dispatch({ type: 'GIT:BRANCH' })
	return (
		<main className='flex-col h-screen overflow-auto'>
			<ThemeSelector />
			<button className='block' onClick={getStatus}>
				get status
			</button>
			<button className='block' onClick={getBranches}>
				get branches
			</button>
			<pre>---</pre>
			<pre>{JSON.stringify(state, null, 2)}</pre>
		</main>
	)
}

export default App
