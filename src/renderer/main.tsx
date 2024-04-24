import React from 'react'
import ReactDOM from 'react-dom/client'
import App from 'src/renderer/components/App'
import 'src/renderer/main.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)

const onWindowFocus = () => window.reduxtron.dispatch({ type: 'GIT:REFRESH' })
window.addEventListener('focus', onWindowFocus)
