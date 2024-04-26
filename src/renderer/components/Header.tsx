import { ThemeSelector } from 'src/renderer/components/ThemeSelector'
import { StatusBarButton } from 'src/renderer/components/Button'
import { BranchSelector } from './BranchSelector'

export const Header = () => (
	<div className='relative pt-0.5 flex items-center bg-status-bar-background h-[35px]'>
		<div className='drag-region h-full w-[76px]'></div>
		{/* [TODO]: path selector (recent + open dialog) */}
		<StatusBarButton>path</StatusBarButton>
		{/* [TODO]: branch selector (recent + local + remotes) */}
		<BranchSelector />
		<div className='drag-region h-full flex-1'></div>
		<ThemeSelector />
		<div className='drag-region h-full w-4'></div>
	</div>
)
