import type { ReactNode } from 'react'
import type { FileStatusResult } from 'simple-git'
import {
	CompositeProvider,
	Composite,
	CompositeItem,
	CompositeGroup,
	CompositeGroupLabel,
	useCompositeStore,
} from '@ariakit/react/composite'

import type { GitStatus } from 'src/shared/reducers/git'
import { useDispatch, useGitPath, useGitStore } from 'src/renderer/hooks/useStore'
import { ContextMenu, ContextMenuItem } from 'src/renderer/components/ContextMenu'
import { Icon, IconId } from 'src/renderer/components/Icon'
import { IconButton } from 'src/renderer/components/Button'
import { FileItem } from 'src/renderer/components/FileItem'

type FilePanelTitleProps = { children?: ReactNode }
const FilePanelTitle = ({ children }: FilePanelTitleProps) => (
	<CompositeGroupLabel className='flex-1 px-2 py-1 sticky top-0 text-text-muted flex items-center'>
		{children}
	</CompositeGroupLabel>
)

type UnstagedContextMenuProps = { onStage?: () => void; onDiscardChanges?: () => void }
const UnstagedContextMenu = ({ onStage, onDiscardChanges }: UnstagedContextMenuProps) => (
	<>
		<ContextMenuItem onClick={onStage}>stage</ContextMenuItem>
		<ContextMenuItem onClick={onDiscardChanges}>discard changes</ContextMenuItem>
	</>
)

type FilePanelBaseProps = {
	status?: GitStatus
	onStage?: (item: FileStatusResult) => void
	onUnstage?: (item: FileStatusResult) => void
	onDiscard?: (item: FileStatusResult) => void
	onStageAll?: () => void
	onUnstageAll?: () => void
}

type ActionButtonProps = {
	disabled?: boolean
	onClick?: () => void
	iconId: IconId
	tooltip?: ReactNode
}
const ActionButton = (props: ActionButtonProps) => <IconButton {...props} className='mx-2' />

export const FilePanelBase = ({
	status,
	onStage,
	onUnstage,
	onDiscard,
	onStageAll,
	onUnstageAll,
}: FilePanelBaseProps) => {
	const store = useCompositeStore()
	const unstaged = status?.data?.files.filter(x => x.working_dir !== ' ')
	const staged = status?.data?.files.filter(x => x.index !== ' ' && x.working_dir !== '?')

	const handleStage = (item: FileStatusResult) => {
		onStage?.(item)
		store.move(store.previous() || store.next())
	}
	const handleUnstage = (item: FileStatusResult) => {
		onUnstage?.(item)
		store.move(store.next() || store.previous())
	}
	const handleDiscard = (item: FileStatusResult) => {
		onDiscard?.(item)
		store.move(store.previous() || store.next())
	}
	const handleStageAll = () => {
		onStageAll?.()
		store.move(store.previous() || store.next())
	}
	const handleUnstageAll = () => {
		onUnstageAll?.()
		store.move(store.previous() || store.next())
	}
	return (
		<CompositeProvider store={store} focusLoop virtualFocus>
			<Composite
				className='group flex-1 flex flex-col outline-none overflow-clip scroll-pt-8'
				autoFocus
			>
				<CompositeGroup className='ring-border basis-1/2 flex-grow-0 ring-1 overflow-auto scroll-pt-7'>
					<div className='flex w-full items-center sticky top-0 border-border border-b bg-editor-background'>
						<FilePanelTitle>
							<Icon iconId='folder-dot' className='mr-2' /> unstaged changes
						</FilePanelTitle>
						<ActionButton
							onClick={handleStageAll}
							disabled={!unstaged?.length}
							iconId='arrow-down-to-line'
							tooltip='stage all'
						/>
					</div>
					{unstaged?.map(x => (
						<ContextMenu
							key={x.path}
							menu={
								<UnstagedContextMenu
									onStage={() => handleStage?.(x)}
									onDiscardChanges={() => handleDiscard?.(x)}
								/>
							}
						>
							{({ onContextMenu }) => (
								<FileItem onClick={() => handleStage?.(x)} onContextMenu={onContextMenu} {...x} />
							)}
						</ContextMenu>
					))}
				</CompositeGroup>

				<CompositeGroup className='ring-border basis-1/2 flex-grow-0 ring-1 overflow-auto scroll-pt-7'>
					<div className='flex items-center w-full sticky top-0 border-border border-b bg-editor-background'>
						<FilePanelTitle>
							<Icon iconId='folder-git' className='mr-2' /> staged changes
						</FilePanelTitle>
						<ActionButton
							onClick={handleUnstageAll}
							disabled={!staged?.length}
							iconId='arrow-up-from-line'
							tooltip='unstage all'
						/>
					</div>
					{staged?.map(x => (
						<ContextMenu
							key={x.path}
							menu={<ContextMenuItem onClick={() => handleUnstage?.(x)}>unstage</ContextMenuItem>}
						>
							{({ onContextMenu }) => (
								<FileItem
									onClick={() => handleUnstage?.(x)}
									key={x.path}
									onContextMenu={onContextMenu}
									{...x}
								/>
							)}
						</ContextMenu>
					))}
				</CompositeGroup>
			</Composite>
		</CompositeProvider>
	)
}

export const FilePanel = () => {
	const status = useGitStore(x => x?.status)
	const path = useGitPath()
	const dispatch = useDispatch()

	const onUnstage = (item: FileStatusResult) => {
		if (!path) return
		dispatch({ type: 'GIT:UNSTAGE', path, payload: item.path })
	}
	const onStage = (item: FileStatusResult) => {
		if (!path) return
		dispatch({ type: 'GIT:STAGE', path, payload: item.path })
	}
	const onDiscard = (item: FileStatusResult) => {
		if (!path) return
		dispatch({ type: 'GIT:DISCARD_FILE_CHANGES', path, payload: item.path })
	}
	const onStageAll = () => {
		if (!path) return
		dispatch({ type: 'GIT:STAGE_ALL', path })
	}
	const onUnstageAll = () => {
		if (!path) return
		dispatch({ type: 'GIT:UNSTAGE_ALL', path })
	}

	return (
		<FilePanelBase
			status={status}
			onStage={onStage}
			onUnstage={onUnstage}
			onStageAll={onStageAll}
			onUnstageAll={onUnstageAll}
			onDiscard={onDiscard}
		/>
	)
}
