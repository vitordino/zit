import type { ReactNode } from 'react'
import type { FileStatusResult } from 'simple-git'
import { CompositeProvider, Composite, CompositeItem } from '@ariakit/react/composite'

import type { GitStatus } from 'src/shared/reducers/git'
import { useDispatch, useStore } from 'src/renderer/hooks/useStore'

type FilePanelTitleProps = { children?: ReactNode }
const FilePanelTitle = ({ children }: FilePanelTitleProps) => (
	<h2 className='border-border ring-inset border-t border-b px-2 py-1'>{children}</h2>
)

type FileItemProps = FileStatusResult & { onClick?: () => void }
const FileItem = ({ path, working_dir, index, onClick }: FileItemProps) => (
	<CompositeItem
		itemID={path}
		className='w-full text-left outline-none data-[active-item="true"]:bg-border flex items-stretch'
		onClick={onClick}
	>
		<div className='bg-icon-muted p-1 text-center w-8 whitespace-pre'>
			{(working_dir + index).trim()}
		</div>
		<div className='p-1'>{path}</div>
	</CompositeItem>
)

type FileListProps = { items?: FileStatusResult[]; onItemClick?: (item: FileStatusResult) => void }
const FileList = ({ items, onItemClick }: FileListProps) => (
	<Composite className='outline-none'>
		{items?.map(x => <FileItem onClick={() => onItemClick?.(x)} key={x.path} {...x} />)}
	</Composite>
)

type FilePanelBaseProps = {
	status?: GitStatus
	onUnstagedItemClick?: (item: FileStatusResult) => void
	onStagedItemClick?: (item: FileStatusResult) => void
}
export const FilePanelBase = ({
	status,
	onUnstagedItemClick,
	onStagedItemClick,
}: FilePanelBaseProps) => {
	const unstaged = status?.data?.files.filter(x => !status.data?.staged.includes(x.path))
	const staged = status?.data?.files.filter(x => status.data?.staged.includes(x.path))
	return (
		<CompositeProvider virtualFocus>
			<FilePanelTitle>unstaged files</FilePanelTitle>
			<FileList items={unstaged} onItemClick={onUnstagedItemClick} />
			<FilePanelTitle>staged files</FilePanelTitle>
			<FileList items={staged} onItemClick={onStagedItemClick} />
		</CompositeProvider>
	)
}

export const FilePanel = () => {
	const status = useStore(x => x.git?.status)
	const dispatch = useDispatch()
	const onStageItemClick = (item: FileStatusResult) =>
		dispatch({ type: 'GIT:UNSTAGE', payload: item.path })

	const onUnstageItemClick = (item: FileStatusResult) =>
		dispatch({ type: 'GIT:STAGE', payload: item.path })

	return (
		<FilePanelBase
			status={status}
			onStagedItemClick={onStageItemClick}
			onUnstagedItemClick={onUnstageItemClick}
		/>
	)
}
