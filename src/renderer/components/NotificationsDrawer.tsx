import { useCallback, useEffect } from 'react'
import { Toaster, toast, ToasterProps, useSonner } from 'sonner'
import { useDispatch, useGitPath, useStore } from 'src/renderer/hooks/useStore'

const toastOptions: ToasterProps['toastOptions'] = {
	unstyled: true,
	classNames: {
		toast:
			'font-mono text-xs group border border-border appearance-none bg-panel-background outline-none text-text rounded-md p-4',
		closeButton:
			'opacity-0 group-data-[index=0]:opacity-100 group-data-[expanded=true]:opacity-100 bg-background border border-border outline-none hover:bg-border focus-visible:bg-border focus-visible:border-none hover:border-none rounded-sm',
	},
}

export const NotificationsDrawer = () => {
	const dispatch = useDispatch()
	const path = useGitPath()
	const entries = useStore(x => x.notifications?.entries ?? [])

	const { toasts } = useSonner()
	const showing = toasts.map(({ id }) => id)
	const toShow = entries.filter(x => !showing.includes(x.id) && x.parent === `git:${path}`)

	const hide = useCallback(
		(id: string) => () => dispatch({ type: 'NOTIFICATIONS:REMOVE_NOTIFICATION', payload: { id } }),
		[dispatch],
	)

	useEffect(() => {
		toShow.forEach(({ body, id }) =>
			toast(body, {
				id,
				dismissible: true,
				onDismiss: hide(id),
				onAutoClose: hide(id),
			}),
		)
	}, [toShow, dispatch, hide])

	return <Toaster closeButton toastOptions={toastOptions} className='bg-error' />
}
