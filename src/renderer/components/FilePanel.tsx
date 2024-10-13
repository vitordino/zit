import type { ReactNode } from 'react'
import type { FileStatusResult } from 'simple-git'
import {
	CompositeProvider,
	Composite,
	CompositeItem,
	CompositeGroup,
	CompositeGroupLabel,
	CompositeItemProps,
} from '@ariakit/react/composite'

import type { GitStatus } from 'src/shared/reducers/git'
import { useDispatch, useGitPath, useGitStore } from 'src/renderer/hooks/useStore'
import { ContextMenu, ContextMenuItem } from 'src/renderer/components/ContextMenu'

type FilePanelTitleProps = { children?: ReactNode }
const FilePanelTitle = ({ children }: FilePanelTitleProps) => (
	<CompositeGroupLabel className='flex-1 border-border border-b px-2 py-1 sticky top-0 bg-editor-background text-text-muted'>
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

type FileItemProps = FileStatusResult & CompositeItemProps
const FileItem = ({ path, working_dir, index, from: _from, ...props }: FileItemProps) => (
	<CompositeItem
		itemID={path}
		className='w-full text-left outline-none hover:bg-element-hover group-focus-visible:data-[active-item="true"]:bg-element-selected flex items-stretch last:border-b border-border'
		{...props}
	>
		<div className='border-r border-border p-1 text-center w-8 whitespace-pre flex-shrink-0'>
			{(working_dir + index).trim()}
		</div>
		<div className='p-1 overflow-hidden text-ellipsis whitespace-nowrap'>{path}</div>
	</CompositeItem>
)

type FilePanelBaseProps = {
	status?: GitStatus
	onStage?: (item: FileStatusResult) => void
	onUnstage?: (item: FileStatusResult) => void
	onDiscard?: (item: FileStatusResult) => void
	onStageAll?: () => void
	onUnstageAll?: () => void
}
export const FilePanelBase = ({
	status,
	onStage,
	onUnstage,
	onDiscard,
	onStageAll,
	onUnstageAll,
}: FilePanelBaseProps) => {
	const unstaged = status?.data?.files.filter(x => x.working_dir !== ' ')
	const staged = status?.data?.files.filter(x => x.index !== ' ' && x.working_dir !== '?')
	return (
		<CompositeProvider focusLoop virtualFocus>
			<Composite
				className='group flex-1 flex flex-col outline-none overflow-clip scroll-pt-8'
				autoFocus
			>
				<CompositeGroup className='ring-border basis-1/2 flex-grow-0 ring-1 overflow-auto scroll-pt-7'>
					<div className='flex w-full sticky top-0'>
						<FilePanelTitle>unstaged changes</FilePanelTitle>
						<CompositeItem
							className='border-border border-l border-b px-2 py-1 bg-editor-background outline-none hover:bg-element-hover group-focus-visible:data-[active-item="true"]:bg-element-selected group-focus-visible:data-[active-item="true"]:text-text text-text-muted hover:text-text'
							onClick={onStageAll}
						>
							stage all
						</CompositeItem>
					</div>
					{unstaged?.map(x => (
						<ContextMenu
							key={x.path}
							menu={
								<UnstagedContextMenu
									onStage={() => onStage?.(x)}
									onDiscardChanges={() => onDiscard?.(x)}
								/>
							}
						>
							{({ onContextMenu }) => (
								<FileItem onClick={() => onStage?.(x)} onContextMenu={onContextMenu} {...x} />
							)}
						</ContextMenu>
					))}
				</CompositeGroup>

				<CompositeGroup className='ring-border basis-1/2 flex-grow-0 ring-1 overflow-auto scroll-pt-7'>
					<div className='flex w-full sticky top-0'>
						<FilePanelTitle>staged changes</FilePanelTitle>
						<CompositeItem
							className='border-border border-l border-b px-2 py-1 bg-editor-background outline-none hover:bg-element-hover group-focus-visible:data-[active-item="true"]:bg-element-selected group-focus-visible:data-[active-item="true"]:text-text text-text-muted hover:text-text'
							onClick={onUnstageAll}
						>
							unstage all
						</CompositeItem>
					</div>
					{staged?.map(x => (
						<ContextMenu
							key={x.path}
							menu={<ContextMenuItem onClick={() => onUnstage?.(x)}>unstage</ContextMenuItem>}
						>
							{({ onContextMenu }) => (
								<FileItem
									onClick={() => onUnstage?.(x)}
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
