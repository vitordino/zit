import { BranchSummary, DefaultLogFields, FileStatusResult, LogResult } from 'simple-git'

export const stripFileStatusResult = (input: FileStatusResult): FileStatusResult => ({
	from: input.from,
	path: input.path,
	index: input.index,
	working_dir: input.working_dir,
})

export const stripBranchSummary = (input: BranchSummary): BranchSummary => ({
	all: input.all,
	branches: input.branches,
	current: input.current,
	detached: input.detached,
})

export const stripLogFields = (input: DefaultLogFields): DefaultLogFields => ({
	hash: input.hash,
	date: input.date,
	message: input.message,
	refs: input.refs,
	body: input.body,
	author_name: input.author_name,
	author_email: input.author_email,
})

export const stripLogResult = (input: LogResult): LogResult => ({
	all: input.all.map(stripLogFields),
	total: input.total,
	latest: input.latest ? stripLogFields(input.latest) : null,
})
