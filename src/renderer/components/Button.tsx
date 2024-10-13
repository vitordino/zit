import { forwardRef, type ReactNode } from 'react'
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, tooltip, ...props }, ref) => {
		if (tooltip) {
			return (
				<Ariakit.TooltipProvider>
					<Ariakit.TooltipAnchor
						className={className}
						render={x => <Button {...x} {...props} ref={ref} />}
					/>
					<Ariakit.Tooltip className='py-1 px-2 text-sm bg-panel-background border border-border-variant rounded-md'>
						{tooltip}
					</Ariakit.Tooltip>
				</Ariakit.TooltipProvider>
			)
		}
		return (
			<button
				ref={ref}
				className={cn(
					'disabled:text-text-disabled text-text leading-none text-xs outline-none p-1 hover:bg-background active:bg-element-active data-[state="highlight"]:text-text-accent focus-visible:bg-element-active ml-[1px] flex-shrink-0 rounded-md flex items-center cursor-pointer disabled:cursor-not-allowed',
					className,
				)}
				{...props}
			/>
		)
	},
)

Button.displayName = 'Button'

type IconButtonState = 'default' | 'highlight'
type IconButtonProps = ButtonProps & { iconId: IconId; state?: IconButtonState }
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
	({ iconId, children, state = 'default', ...props }, ref) => (
		<Button data-state={state} {...props} ref={ref}>
			<Icon iconId={iconId} />
			{!!children && <div className='ml-2 mr-1 -my-1'>{children}</div>}
		</Button>
	),
)
IconButton.displayName = 'IconButton'
