import { useDispatch, useStore } from 'src/renderer/hooks/useStore'
import { ThemeSelector } from 'src/renderer/components/ThemeSelector'

const App = () => {
	const dispatch = useDispatch()
	const counter = useStore(x => x.counter)

	const decrement = () => dispatch({ type: 'COUNTER:DECREMENT' })
	const increment = () => dispatch({ type: 'COUNTER:INCREMENT' })
	return (
		<main>
			<button onClick={decrement}>decrement</button>
			{counter || 0}
			<button onClick={increment}>increment</button>
			<ThemeSelector />
		</main>
	)
}

export default App
