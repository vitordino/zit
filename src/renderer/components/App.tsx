import { Header } from 'src/renderer/components/Header'
import { FilePanel } from 'src/renderer/components/FilePanel'
import { DebugWrapper } from './DebugWrapper'

export const App = () => (
	<>
		<DebugWrapper>
			<Header />
			<FilePanel />
		</DebugWrapper>
	</>
)
