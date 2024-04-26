import { Header } from 'src/renderer/components/Header'
import { FilePanel } from 'src/renderer/components/FilePanel'
import { DebugWrapper } from 'src/renderer/components/DebugWrapper'
import { CommitInput } from 'src/renderer/components/CommitInput'

export const App = () => (
	<>
		<DebugWrapper>
			<Header />
			<FilePanel />
			<CommitInput />
		</DebugWrapper>
	</>
)
