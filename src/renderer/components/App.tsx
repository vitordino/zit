import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Header } from 'src/renderer/components/Header'
import { FilePanel } from 'src/renderer/components/FilePanel'
import { DebugWrapper } from 'src/renderer/components/DebugWrapper'
import { CommitLine } from 'src/renderer/components/CommitLine'
import { CommitLog } from 'src/renderer/components/CommitLog'

const router = createBrowserRouter([
	{
		path: '/',
		element: (
			<>
				<DebugWrapper>
					<Header />
					<FilePanel />
					<CommitLine />
					<CommitLog />
				</DebugWrapper>
			</>
		),
	},
])

const abc = ''

export const App = () => <RouterProvider router={router} />
