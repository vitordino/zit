import React from 'react'
import ReactDOM from 'react-dom/client'
import { getGitPath } from 'src/renderer/hooks/useStore'
import { App } from 'src/renderer/components/App'
import 'src/renderer/main.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)

// @ts-expect-error write proper declaration later
const refresh = () => window.reduxtron.dispatch({ type: 'GIT:REFRESH', path: getGitPath() })
window.addEventListener('focus', refresh)
