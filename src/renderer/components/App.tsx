import { GitPathProvider } from 'src/renderer/contexts/gitPath'
import { Header } from 'src/renderer/components/Header'
import { FilePanel } from 'src/renderer/components/FilePanel'
import { DebugWrapper } from 'src/renderer/components/DebugWrapper'
import { CommitLine } from 'src/renderer/components/CommitLine'
import { CommitLog } from 'src/renderer/components/CommitLog'
import { NotInitializedModal } from 'src/renderer/components/NotInitializedModal'
import { NotificationsDrawer } from 'src/renderer/components/NotificationsDrawer'

export const App = () => (
	<GitPathProvider>
		<DebugWrapper>
			<Header />
			<FilePanel />
			<CommitLine />
			<CommitLog />
			<NotInitializedModal />
			<NotificationsDrawer />
		</DebugWrapper>
	</GitPathProvider>
)
