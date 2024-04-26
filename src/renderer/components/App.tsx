import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Header } from 'src/renderer/components/Header'
import { FilePanel } from 'src/renderer/components/FilePanel'
import { DebugWrapper } from 'src/renderer/components/DebugWrapper'
import { CommitInput } from 'src/renderer/components/CommitInput'
import { CommitLog } from 'src/renderer/components/CommitLog'

const router = createBrowserRouter([
	{
		path: '/',
		element: (
			<>
				<DebugWrapper>
					<Header />
					<FilePanel />
					<CommitInput />
					<CommitLog />
				</DebugWrapper>
			</>
		),
	},
])

export const App = () => <RouterProvider router={router} />
