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

globalThis.gitPath ??= globalThis.sessionStorage.getItem('git-path')
window.addEventListener('storage', e => {
	if (e.storageArea !== sessionStorage || e.key !== 'git-path') return
	if (globalThis.gitPath === e.newValue) return
	globalThis.gitPath = e.newValue
})

// @ts-expect-error write proper declaration later
const refresh = () => window.reduxtron.dispatch({ type: 'GIT:REFRESH', path: getGitPath() })
window.addEventListener('focus', refresh)
