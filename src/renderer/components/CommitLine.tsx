import { useSearchParams } from 'react-router-dom'

import { CommitLineButton } from 'src/renderer/components/Button'
import { CommitInput } from 'src/renderer/components/CommitInput'

export const CommitLine = () => {
	const [search, setSearch] = useSearchParams()

	const toggleLog = () => setSearch({ log: search.get('log') === 'true' ? 'false' : 'true' })

	return (
		<div className='flex'>
			<CommitLineButton onClick={toggleLog}>log</CommitLineButton>
			<CommitInput />
		</div>
	)
}
