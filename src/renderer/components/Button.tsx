import type { ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'
import { cn } from 'src/renderer/lib/css'
import { Icon, type IconId } from 'src/renderer/components/Icon'

type ButtonProps = React.ComponentProps<'button'> & { tooltip?: ReactNode }

export const HeaderButton = ({ className, ...props }: ButtonProps) => (
	<button
		className={cn(
			'text-text focus-visible:text-text hover:text-text text-xs leading-tight outline-none hover:bg-element-hover focus-visible:bg-element-hover px-2 py-1 rounded-md',
			className,
		)}
		{...props}
	/>
)

export const Button = ({ className, tooltip, ...props }: ButtonProps) => {
	if (tooltip) {
		return (
			<Ariakit.TooltipProvider>
				<Ariakit.TooltipAnchor
					className={className}
					render={<Button {...props} tooltip={false} />}
				/>
				<Ariakit.Tooltip className='py-1 px-2 text-sm bg-panel-background border border-border-variant rounded-md'>
					{tooltip}
				</Ariakit.Tooltip>
			</Ariakit.TooltipProvider>
		)
	}
	return (
		<button
			className={cn(
				'disabled:text-text-disabled text-text leading-none text-xs outline-none p-1 hover:bg-background active:bg-element-active data-[state="highlight"]:text-text-accent focus-visible:bg-element-active ml-[1px] flex-shrink-0 rounded-md flex items-center cursor-pointer disabled:cursor-not-allowed',
				className,
			)}
			{...props}
		/>
	)
}

type IconButtonState = 'default' | 'highlight'
type IconButtonProps = ButtonProps & { iconId: IconId; state?: IconButtonState }
export const IconButton = ({ iconId, children, state = 'default', ...props }: IconButtonProps) => (
	<Button data-state={state} {...props}>
		<Icon iconId={iconId} />
		{!!children && <div className='ml-2 mr-1 -my-1'>{children}</div>}
	</Button>
)
