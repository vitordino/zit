import { useEffect } from 'react'
import { useGitPath } from 'src/renderer/hooks/useStore'

export const FocusListener = () => {
	const path = useGitPath()
	useEffect(() => {
		const controller = new AbortController()
		window.addEventListener(
			'focus',
			() => path && window.reduxtron.dispatch({ type: 'GIT:REFRESH', path }),
			{ signal: controller.signal },
		)
		return () => controller.abort()
	}, [path])

	return null
}
