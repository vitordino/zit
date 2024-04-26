import { useSearchParams } from 'react-router-dom'

import { CommitLineButton } from 'src/renderer/components/Button'
import { CommitInput } from 'src/renderer/components/CommitInput'

type CommitLineBaseProps = { toggleLog: () => void }
export const CommitLineBase = ({ toggleLog }: CommitLineBaseProps) => (
	<div className='flex'>
		<CommitLineButton onClick={toggleLog}>log</CommitLineButton>
		<CommitInput />
	</div>
)

export const CommitLine = () => {
	const [search, setSearch] = useSearchParams()
	const toggleLog = () => setSearch({ log: search.get('log') === 'true' ? 'false' : 'true' })
	return <CommitLineBase toggleLog={toggleLog} />
}
