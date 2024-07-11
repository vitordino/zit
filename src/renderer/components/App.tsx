import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Header } from 'src/renderer/components/Header'
import { FilePanel } from 'src/renderer/components/FilePanel'
import { DebugWrapper } from 'src/renderer/components/DebugWrapper'
import { CommitLine } from 'src/renderer/components/CommitLine'
import { CommitLog } from 'src/renderer/components/CommitLog'
import { NotInitializedModal } from './NotInitializedModal'

// we’re using react-router for sharing state over query params, do not remove
const router = createBrowserRouter([
	{
		path: '/',
		element: (
			<>
				<FilePanel />
				<CommitLine />
				<CommitLog />
				<NotInitializedModal />
			</>
		),
	},
])

export const App = () => (
	<DebugWrapper>
		<Header />
		<RouterProvider router={router} />
	</DebugWrapper>
)
