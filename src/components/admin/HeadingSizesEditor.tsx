import { useState } from 'react'
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { HeadingLevel, HeadingSizes } from '@/types'
import { DEFAULT_HEADING_SIZES, HEADING_LEVELS } from '@/lib/heading-sizes'

interface Props {
  sizes: HeadingSizes
  onChange: (sizes: HeadingSizes) => void
  /** Compacto (sem card próprio) — usado inline no editor de categoria. */
  compact?: boolean
}

const ICONS: Record<HeadingLevel, typeof Heading1> = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
}

const LABELS: Record<HeadingLevel, string> = {
  h1: 'H1',
  h2: 'H2',
  h3: 'H3',
  h4: 'H4',
  h5: 'H5',
  h6: 'H6',
}

/**
 * Editor dos tamanhos (px) de cada heading (h1..h6), separando mobile e desktop.
 * Inclui botão para restaurar a tabela padrão (fallback).
 * h1 32/38, h2 26/30, h3 22/24, h4 18/20, h5 16/18, h6 14/16.
 */
export function HeadingSizesEditor({ sizes, onChange, compact = false }: Props) {
  const [open, setOpen] = useState(false)

  const update = (lvl: HeadingLevel, key: 'mobile' | 'desktop', value: string) => {
    const n = Number(value)
    const next = { ...sizes }
    next[lvl] = {
      mobile:
        key === 'mobile' ? (Number.isFinite(n) && n > 0 ? Math.round(n) : 0) : next[lvl].mobile,
      desktop:
        key === 'desktop' ? (Number.isFinite(n) && n > 0 ? Math.round(n) : 0) : next[lvl].desktop,
    }
    onChange(next)
  }

  const reset = () => onChange({ ...DEFAULT_HEADING_SIZES })

  const content = (
    <div className="space-y-2">
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center text-[11px] font-medium text-muted-foreground px-1">
        <span>Nível</span>
        <span className="text-center">Mobile (px)</span>
        <span className="text-center">Desktop (px)</span>
      </div>
      {HEADING_LEVELS.map((lvl) => {
        const Icon = ICONS[lvl]
        const entry = sizes[lvl] || DEFAULT_HEADING_SIZES[lvl]
        return (
          <div key={lvl} className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
            <div className="flex items-center gap-1.5 w-16">
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold">{LABELS[lvl]}</span>
            </div>
            <Input
              type="number"
              min={8}
              max={120}
              value={entry.mobile}
              onChange={(e) => update(lvl, 'mobile', e.target.value)}
              className="h-8 text-center text-xs"
            />
            <Input
              type="number"
              min={8}
              max={160}
              value={entry.desktop}
              onChange={(e) => update(lvl, 'desktop', e.target.value)}
              className="h-8 text-center text-xs"
            />
          </div>
        )
      })}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-[10px] text-muted-foreground">
          Padrão: 32/38, 26/30, 22/24, 18/20, 16/18, 14/16
        </span>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={reset}>
          <RotateCcw className="mr-1 h-3 w-3" />
          Restaurar padrão
        </Button>
      </div>
    </div>
  )

  if (compact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
            <Heading1 className="h-3.5 w-3.5" />
            Tamanhos de heading
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          {content}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="rounded-lg border border-border/60 bg-background/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Tamanhos de heading (h1–h6)</Label>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={reset}>
          <RotateCcw className="mr-1 h-3 w-3" />
          Restaurar padrão
        </Button>
      </div>
      {content}
    </div>
  )
}
