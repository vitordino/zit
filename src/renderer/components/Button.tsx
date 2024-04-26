import { cn } from 'src/renderer/lib/css'

export const StatusBarButton = ({ className, ...props }: JSX.IntrinsicElements['button']) => (
	<button
		className={cn(
			'text-text focus-visible:text-text hover:text-text text-xs leading-tight outline-none hover:bg-element-hover focus-visible:bg-element-hover px-2 py-1 rounded-md',
			className,
		)}
		{...props}
	/>
)
