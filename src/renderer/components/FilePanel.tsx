import type { ReactNode } from 'react'
import type { FileStatusResult } from 'simple-git'
import {
	CompositeProvider,
	Composite,
	CompositeItem,
	CompositeGroup,
	CompositeGroupLabel,
} from '@ariakit/react/composite'

import type { GitStatus } from 'src/shared/reducers/git'
import { useDispatch, useGitPath, useGitStore } from 'src/renderer/hooks/useStore'

type FilePanelTitleProps = { children?: ReactNode }
const FilePanelTitle = ({ children }: FilePanelTitleProps) => (
	<CompositeGroupLabel className='flex-1 border-border border-b px-2 py-1 sticky top-0 bg-editor-background text-text-muted'>
		{children}
	</CompositeGroupLabel>
)

type FileItemProps = FileStatusResult & { onClick?: () => void }
const FileItem = ({ path, working_dir, index, onClick }: FileItemProps) => (
	<CompositeItem
		itemID={path}
		className='w-full text-left outline-none hover:bg-element-hover group-focus-visible:data-[active-item="true"]:bg-element-selected flex items-stretch last:border-b border-border'
		onClick={onClick}
	>
		<div className='border-r border-border p-1 text-center w-8 whitespace-pre flex-shrink-0'>
			{(working_dir + index).trim()}
		</div>
		<div className='p-1 overflow-hidden text-ellipsis whitespace-nowrap'>{path}</div>
	</CompositeItem>
)

type FileListProps = {
	items?: FileStatusResult[]
	onItemClick?: (item: FileStatusResult) => void
}
const FileList = ({ items, onItemClick }: FileListProps) => (
	<>{items?.map(x => <FileItem onClick={() => onItemClick?.(x)} key={x.path} {...x} />)}</>
)

type FilePanelBaseProps = {
	status?: GitStatus
	onUnstagedItemClick?: (item: FileStatusResult) => void
	onStagedItemClick?: (item: FileStatusResult) => void
	onStageAll?: () => void
	onUnstageAll?: () => void
}
export const FilePanelBase = ({
	status,
	onUnstagedItemClick,
	onStagedItemClick,
	onStageAll,
	onUnstageAll,
}: FilePanelBaseProps) => {
	const unstaged = status?.data?.files.filter(x => !status.data?.staged.includes(x.path))
	const staged = status?.data?.files.filter(x => status.data?.staged.includes(x.path))
	return (
		<CompositeProvider focusLoop virtualFocus>
			<Composite
				className='group flex-1 flex flex-col outline-none overflow-clip scroll-pt-8'
				autoFocus
			>
				<CompositeGroup className='ring-border basis-1/2 flex-grow-0 ring-1 overflow-auto scroll-pt-7'>
					<div className='flex w-full sticky top-0'>
						<FilePanelTitle>unstaged files</FilePanelTitle>
						<CompositeItem
							className='border-border border-l border-b px-2 py-1 bg-editor-background outline-none hover:bg-element-hover group-focus-visible:data-[active-item="true"]:bg-element-selected group-focus-visible:data-[active-item="true"]:text-text text-text-muted hover:text-text'
							onClick={onStageAll}
						>
							stage all
						</CompositeItem>
					</div>
					<FileList items={unstaged} onItemClick={onUnstagedItemClick} />
				</CompositeGroup>

				<CompositeGroup className='ring-border basis-1/2 flex-grow-0 ring-1 overflow-auto scroll-pt-7'>
					<div className='flex w-full sticky top-0'>
						<FilePanelTitle>staged files</FilePanelTitle>
						<CompositeItem
							className='border-border border-l border-b px-2 py-1 bg-editor-background outline-none hover:bg-element-hover group-focus-visible:data-[active-item="true"]:bg-element-selected group-focus-visible:data-[active-item="true"]:text-text text-text-muted hover:text-text'
							onClick={onUnstageAll}
						>
							unstage all
						</CompositeItem>
					</div>
					<FileList items={staged} onItemClick={onStagedItemClick} />
				</CompositeGroup>
			</Composite>
		</CompositeProvider>
	)
}

export const FilePanel = () => {
	const status = useGitStore(x => x?.status)
	const path = useGitPath()
	const dispatch = useDispatch()

	const onStagedItemClick = (item: FileStatusResult) => {
		if (!path) return
		dispatch({ type: 'GIT:UNSTAGE', path, payload: item.path })
	}

	const onUnstagedItemClick = (item: FileStatusResult) => {
		if (!path) return
		dispatch({ type: 'GIT:STAGE', path, payload: item.path })
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
			onStagedItemClick={onStagedItemClick}
			onUnstagedItemClick={onUnstagedItemClick}
			onStageAll={onStageAll}
			onUnstageAll={onUnstageAll}
		/>
	)
}
