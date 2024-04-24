import { startTransition, useEffect, useMemo, useState } from 'react'
import { Button } from '@ariakit/react/button'
import { Dialog, useDialogStore } from '@ariakit/react/dialog'
import { Combobox, ComboboxItem, ComboboxProvider, ComboboxPopover } from '@ariakit/react/combobox'
import { matchSorter } from 'match-sorter'
import { ALL_THEMES, Theme } from 'zedwind/constants'
import { useDispatch, useStore } from '../hooks/useStore'
import { DEFAULT_THEME } from 'src/shared/reducers/settings'

const setDocumentTheme = (theme: Theme) =>
	document.documentElement.setAttribute('data-theme', theme)

type ThemeSelectorBaseProps = {
	theme: Theme
	setTheme: (theme: Theme) => void
}

export const ThemeSelectorBase = ({ theme, setTheme }: ThemeSelectorBaseProps) => {
	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState('')
	const [previewTheme, setPreviewTheme] = useState<Theme | ''>('')
	const dialog = useDialogStore({ open, setOpen })
	const matches = useMemo(() => matchSorter(ALL_THEMES, search), [search])

	useEffect(() => {
		if (open && previewTheme) return setDocumentTheme(previewTheme)
		setPreviewTheme(theme)
		setDocumentTheme(theme)
	}, [previewTheme, theme, open, setPreviewTheme])

	return (
		<>
			<Button onClick={dialog.show}>theme</Button>
			<Dialog store={dialog} backdrop={<div className='fixed inset-0 bg-background opacity-0' />}>
				<div className='p-2 absolute left-0 right-0 top-0 bottom-0'>
					<ComboboxProvider
						disclosure={dialog}
						selectedValue={previewTheme}
						includesBaseElement={false}
						focusLoop
						resetValueOnHide
						setValue={value => startTransition(() => setSearch(value))}
					>
						<Combobox
							placeholder='Select theme…'
							autoSelect='always'
							className='relative left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 border border-border appearance-none outline-none bg-background text-text rounded-t-md py-1 px-4 w-full max-w-96'
						/>
						<ComboboxPopover
							sameWidth
							className='max-h-[50vh] overflow-auto scroll-p-2 border border-border border-t-0 p-2 bg-background rounded-b-md'
						>
							{matches?.map(match => (
								<ComboboxItem
									className='text-text data-[active-item]:bg-element-selected rounded-sm px-2'
									onFocusVisible={() => setPreviewTheme(match)}
									onClick={() => setTheme(match)}
									key={match}
									value={match}
								>
									{match}
								</ComboboxItem>
							))}
							{!matches.length && <div className='text-text-disabled px-2'>No matches</div>}
						</ComboboxPopover>
					</ComboboxProvider>
				</div>
			</Dialog>
		</>
	)
}

export const ThemeSelector = () => {
	const theme = useStore(x => x.settings?.theme)
	const dispatch = useDispatch()
	const setTheme = (payload: Theme) => dispatch({ type: 'SETTINGS:SET_THEME', payload })
	return <ThemeSelectorBase theme={theme ?? DEFAULT_THEME} setTheme={setTheme} />
}
