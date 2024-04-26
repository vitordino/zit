import { BranchSummary, FileStatusResult } from 'simple-git'

export const stripFileStatusResult = (input: FileStatusResult) => ({
	from: input.from,
	path: input.path,
	index: input.index,
	working_dir: input.working_dir,
})

export const stripBranchSummary = (input: BranchSummary) => ({
	all: input.all,
	branches: input.branches,
	current: input.current,
	detached: input.detached,
})
