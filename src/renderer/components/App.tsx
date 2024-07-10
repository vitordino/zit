import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Header } from 'src/renderer/components/Header'
import { FilePanel } from 'src/renderer/components/FilePanel'
import { DebugWrapper } from 'src/renderer/components/DebugWrapper'
import { CommitLine } from 'src/renderer/components/CommitLine'
import { CommitLog } from 'src/renderer/components/CommitLog'
import { MatchState } from 'src/renderer/components/MatchState'

const router = createBrowserRouter([
	{
		path: '/',
		element: (
			<>
				<MatchState match={state => state !== 'not_initialized'}>
					<FilePanel />
					<CommitLine />
					<CommitLog />
				</MatchState>
				<MatchState match={state => state === 'not_initialized'}>not initialized</MatchState>
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
