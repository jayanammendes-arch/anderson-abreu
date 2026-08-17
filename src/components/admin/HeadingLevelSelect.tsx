import { useState } from 'react'
import { Heading, Heading1, Heading2, Heading3, Pilcrow, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { HeadingLevel, HeadingSizes } from '@/types'
import { DEFAULT_HEADING_SIZES, HEADING_LEVELS } from '@/lib/heading-sizes'

export type BlockTag = HeadingLevel | 'p'

interface ActiveState {
  block: BlockTag
}

interface Props {
  active: ActiveState
  onSelect: (tag: BlockTag) => void
  sizes: HeadingSizes
}

const ICONS: Record<HeadingLevel, typeof Heading1> = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading,
  h5: Heading,
  h6: Heading,
}

function sizeLabel(level: HeadingLevel, sizes: HeadingSizes, desktop: boolean): string {
  const entry = sizes[level] || DEFAULT_HEADING_SIZES[level]
  return desktop ? `${entry.desktop}px` : `${entry.mobile}px`
}

/**
 * Seletor dropdown de heading (p, h1..h6) com o nível atual e o tamanho em px
 * (mobile/desktop) ao lado de cada opção. Usado inline ao lado dos campos
 * editáveis da tela de Editar Categoria.
 */
export function HeadingLevelSelect({ active, onSelect, sizes }: Props) {
  const [open, setOpen] = useState(false)
  const CurrentIcon = active.block === 'p' ? Pilcrow : ICONS[active.block]

  const renderRow = (tag: BlockTag, label: string, Icon: typeof Heading1 | typeof Pilcrow) => {
    const isActive = active.block === tag
    return (
      <button
        key={tag}
        type="button"
        onClick={() => {
          onSelect(tag)
          setOpen(false)
        }}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors',
          isActive && 'bg-accent text-accent-foreground',
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium uppercase">{tag}</span>
        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
          {tag === 'p'
            ? label
            : `${sizeLabel(tag, sizes, false)} / ${sizeLabel(tag, sizes, true)}px`}
        </span>
      </button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          title="Nível do heading"
        >
          <CurrentIcon className="h-3.5 w-3.5" />
          <span className="uppercase">{active.block}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="text-xs font-semibold text-muted-foreground mb-1.5 px-1">
          Nível do heading
        </div>
        <div className="space-y-0.5">
          {renderRow('p', 'Parágrafo', Pilcrow)}
          {HEADING_LEVELS.map((lvl) => {
            const Icon = ICONS[lvl]
            return renderRow(lvl, `Heading ${lvl}`, Icon)
          })}
        </div>
        <div className="mt-2 pt-2 border-t border-border px-1 text-[10px] text-muted-foreground">
          Tamanhos: <span className="text-foreground">mobile / desktop</span>
        </div>
      </PopoverContent>
    </Popover>
  )
}
