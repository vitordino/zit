import type { FileStatusResult } from 'simple-git'
import { CompositeItem, CompositeItemProps } from '@ariakit/react/composite'
import { Icon } from './Icon'

type GitFileStateIconProps = Pick<FileStatusResult, 'index' | 'working_dir'>
const GitFileStateIcon = ({ index, working_dir }: GitFileStateIconProps) => {
	const match = (x: string) => index.includes(x) || working_dir.includes(x)
	if (match('?') || match('A')) return <Icon iconId='square-plus' className='text-created' />
	if (match('M')) return <Icon iconId='square-dot' className='text-modified' />
	if (match('D')) return <Icon iconId='square-x' className='text-deleted' />
	return <Icon iconId='square-divide' className='text-conflict' />
}

type FileItemProps = FileStatusResult & CompositeItemProps
export const FileItem = ({ path, working_dir, index, from, ...props }: FileItemProps) => (
	<CompositeItem
		itemID={path}
		className='w-full text-left outline-none hover:bg-editor-highlighted-line-background group-focus-visible:data-[active-item=true]:bg-element-hover flex items-center last:border-b border-border'
		{...props}
	>
		<div className='px-2 py-1 whitespace-pre flex-shrink-0 flex'>
			<GitFileStateIcon working_dir={working_dir} index={index} />
		</div>
		<div className='py-1 overflow-hidden text-ellipsis whitespace-nowrap'>
			{from ? `${from} → ` : ''}
			{path}
		</div>
	</CompositeItem>
)
