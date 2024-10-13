import { useCallback, useState, type ReactNode } from 'react'
import { useMenuStore, Menu, MenuItem, MenuItemProps } from '@ariakit/react/menu'

type ContextMenuProps = {
	children?: (props: {
		onContextMenu: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
	}) => JSX.Element
	menu?: ReactNode
}
export const ContextMenu = ({ children, menu }: ContextMenuProps) => {
	const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 })
	const store = useMenuStore()
	const onContextMenu = useCallback(
		(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
			event.preventDefault()
			setAnchorRect({ x: event.clientX, y: event.clientY })
			store.show()
		},
		[store.show, setAnchorRect],
	)
	if (!children) return null
	return (
		<>
			{children({ onContextMenu })}
			<Menu
				className='text-sm group border border-border appearance-none bg-panel-background outline-none text-text rounded-md p-1'
				store={store}
				modal
				getAnchorRect={() => anchorRect}
			>
				{menu}
			</Menu>
		</>
	)
}

export const ContextMenuItem = (props: MenuItemProps) => (
	<MenuItem
		className='text-text data-[active-item]:bg-element-selected rounded-[3px] px-2 outline-none'
		{...props}
	/>
)
