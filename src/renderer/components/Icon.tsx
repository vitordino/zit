import type { ComponentProps } from 'react'

import { cn } from 'src/renderer/lib/css'

// source: https://lucide.dev/icons/
import ArrowDownToLine from 'src/renderer/icons/arrow-down-to-line.svg'
import ArrowUpFromLine from 'src/renderer/icons/arrow-up-from-line.svg'
import BookDown from 'src/renderer/icons/book-down.svg'
import BookUp from 'src/renderer/icons/book-up.svg'
import Branch from 'src/renderer/icons/branch.svg'
import CloudDownload from 'src/renderer/icons/cloud-download.svg'
import CloudUpload from 'src/renderer/icons/cloud-upload.svg'
import CornerDownLeft from 'src/renderer/icons/corner-down-left.svg'
import FolderDot from 'src/renderer/icons/folder-dot.svg'
import FolderGit from 'src/renderer/icons/folder-git.svg'
import History from 'src/renderer/icons/history.svg'
import Package from 'src/renderer/icons/package.svg'
import SquareDot from 'src/renderer/icons/square-dot.svg'
import SquareMinus from 'src/renderer/icons/square-minus.svg'
import SquarePlus from 'src/renderer/icons/square-plus.svg'
import UndoDot from 'src/renderer/icons/undo-dot.svg'
import SwatchBook from 'src/renderer/icons/swatch-book.svg'

const ICON_MAP = {
	'arrow-down-to-line': ArrowDownToLine,
	'arrow-up-from-line': ArrowUpFromLine,
	'book-down': BookDown,
	'book-up': BookUp,
	'cloud-download': CloudDownload,
	'cloud-upload': CloudUpload,
	'corner-down-left': CornerDownLeft,
	'folder-dot': FolderDot,
	'folder-git': FolderGit,
	'square-dot': SquareDot,
	'square-minus': SquareMinus,
	'square-plus': SquarePlus,
	'undo-dot': UndoDot,
	branch: Branch,
	history: History,
	package: Package,
	'swatch-book': SwatchBook,
} as const

export type IconId = keyof typeof ICON_MAP
type IconProps = ComponentProps<'svg'> & { iconId: IconId }
export const Icon = ({ iconId, className, ...props }: IconProps) => {
	const Component = ICON_MAP[iconId]
	// @ts-expect-error wrong typing coming from svgr
	return <Component className={cn('h-[14px] w-auto', className)} {...props} />
}
