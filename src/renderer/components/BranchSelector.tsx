import { startTransition, useMemo, useState } from 'react'
import { BranchSummaryBranch } from 'simple-git'
import { Dialog, useDialogStore } from '@ariakit/react/dialog'
import { Combobox, ComboboxItem, ComboboxProvider, ComboboxPopover } from '@ariakit/react/combobox'
import { matchSorter } from 'match-sorter'

import { useDispatch, useGitStore } from 'src/renderer/hooks/useStore'
import { StatusBarButton } from 'src/renderer/components/Button'

type BranchSelectorBaseProps = {
	branches: BranchSummaryBranch[]
	setBranch: (branch: string) => void
}

export const BranchSelectorBase = ({ branches, setBranch }: BranchSelectorBaseProps) => {
	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState('')
	const dialog = useDialogStore({ open, setOpen })
	const currentBranch = branches.find(x => x.current)
	const matches = useMemo(
		() => matchSorter(branches, search, { keys: ['name'] }),
		[search, branches],
	)

	return (
		<>
			<StatusBarButton className='text-text-muted' onClick={dialog.show}>
				{currentBranch?.name || `branch`}
			</StatusBarButton>
			<Dialog store={dialog} backdrop={<div className='fixed inset-0 bg-background opacity-50' />}>
				<div className='p-2 absolute left-0 right-0 top-0 bottom-0'>
					<ComboboxProvider
						disclosure={dialog}
						includesBaseElement={false}
						focusLoop
						resetValueOnHide
						setValue={value => startTransition(() => setSearch(value))}
					>
						<Combobox
							placeholder='Select branch…'
							autoSelect='always'
							className='relative left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 border border-border appearance-none outline-none bg-background text-text rounded-t-md py-1 px-4 w-full max-w-96 placeholder:text-text-muted'
							onKeyDown={e => e.key === 'Escape' && dialog.hide()}
						/>
						<ComboboxPopover
							sameWidth
							className='max-h-[50vh] overflow-auto scroll-p-2 border border-border border-t-0 p-2 bg-background rounded-b-md'
						>
							{matches?.map(match => (
								<ComboboxItem
									className='text-text data-[active-item]:bg-element-selected rounded-sm px-2'
									onClick={() => setBranch(match.name)}
									key={match.name}
									value={match.name}
								>
									{match.current ? '✔ ' : ''}
									{match.name}
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

export const BranchSelector = () => {
	const data = useGitStore(x => x?.branch?.data?.branches)
	const path = useGitStore(x => x?.path)
	const dispatch = useDispatch()
	const setBranch = (payload: string) => {
		if (!path) return
		dispatch({ type: 'GIT:CHANGE_BRANCH', path, payload })
	}
	const branches = Object.values(data || {})
	if (!branches?.length) return null
	return <BranchSelectorBase branches={branches} setBranch={setBranch} />
}
