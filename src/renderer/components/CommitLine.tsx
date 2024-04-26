import { useSearchParams } from 'react-router-dom'

import { CommitLineButton } from 'src/renderer/components/Button'
import { CommitInput } from 'src/renderer/components/CommitInput'
import { useStore } from '../hooks/useStore'

type CommitLineBaseProps = {
	log?: boolean
	toggleLog?: () => void
	behind?: number
	ahead?: number
}
export const CommitLineBase = ({ log, toggleLog, behind, ahead }: CommitLineBaseProps) => (
	<div className='flex'>
		<CommitLineButton data-active={log} onClick={toggleLog} className='-ml-[1px]'>
			log
		</CommitLineButton>
		<CommitInput />
		{!!behind && <CommitLineButton>pull&nbsp;{behind}</CommitLineButton>}
		{!!ahead && <CommitLineButton>push&nbsp;{ahead}</CommitLineButton>}
	</div>
)

export const CommitLine = () => {
	const [search, setSearch] = useSearchParams()
	const behind = useStore(x => x.git?.status.data?.behind)
	const ahead = useStore(x => x.git?.status.data?.ahead)
	const log = search.get('log') === 'true' ? true : false
	const toggleLog = () => setSearch({ log: log ? 'false' : 'true' })

	return <CommitLineBase log={log} toggleLog={toggleLog} behind={behind} ahead={ahead} />
}
