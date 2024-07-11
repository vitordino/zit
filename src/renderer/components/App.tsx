import { Header } from 'src/renderer/components/Header'
import { FilePanel } from 'src/renderer/components/FilePanel'
import { DebugWrapper } from 'src/renderer/components/DebugWrapper'
import { CommitLine } from 'src/renderer/components/CommitLine'
import { CommitLog } from 'src/renderer/components/CommitLog'
import { NotInitializedModal } from './NotInitializedModal'

export const App = () => (
	<DebugWrapper>
		<Header />
		<FilePanel />
		<CommitLine />
		<CommitLog />
		<NotInitializedModal />
	</DebugWrapper>
)
