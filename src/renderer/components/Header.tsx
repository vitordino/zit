import { useGitPath } from 'src/renderer/hooks/useStore'
import { ThemeSelector } from 'src/renderer/components/ThemeSelector'
import { StatusBarButton } from 'src/renderer/components/Button'
import { BranchSelector } from 'src/renderer/components/BranchSelector'

export const Header = () => {
	const path = useGitPath()
	const folder = path?.split('/').reverse()[0] || path
	return (
		<div className='flex-shrink-0 sticky top-0 w-full pt-0.5 flex items-center bg-status-bar-background h-[35px]'>
			<div className='drag-region h-full w-16 mr-2'></div>
			{/* [TODO]: path selector (recent + open dialog) */}
			<StatusBarButton title={path}>{folder}</StatusBarButton>
			<BranchSelector />
			<div className='drag-region h-full flex-1'></div>
			<ThemeSelector />
			<div className='drag-region h-full w-2'></div>
			<div className='h-[1px] w-full absolute left-0 bottom-0 bg-border' />
		</div>
	)
}
