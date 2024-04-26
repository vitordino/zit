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

export const CommitLineButton = ({ className, ...props }: JSX.IntrinsicElements['button']) => (
	<button
		className={cn(
			'disabled:text-text-disabled text-text-muted focus-visible:text-text hover:text-text text-xs outline-none p-2 hover:bg-background active:bg-element-active data-[active="true"]:bg-element-active focus-visible:bg-element-active ring-1 ring-border ml-[1px]',
			className,
		)}
		{...props}
	/>
)
