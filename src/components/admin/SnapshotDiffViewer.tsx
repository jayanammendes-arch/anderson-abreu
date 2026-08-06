import { useState } from 'react'
import type { FieldDiff } from '@/lib/snapshot-diff'
import { cn } from '@/lib/utils'
import { Check, Minus, Plus, AlertCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Props {
  diffs: FieldDiff[]
  oldLabel?: string
  newLabel?: string
}

const statusConfig = {
  added: { label: 'Adicionado', color: 'text-green-500', bg: 'bg-green-500/10', icon: Plus },
  removed: { label: 'Removido', color: 'text-red-500', bg: 'bg-red-500/10', icon: Minus },
  modified: {
    label: 'Modificado',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    icon: AlertCircle,
  },
  unchanged: { label: 'Sem alterações', color: 'text-muted-foreground', bg: '', icon: Check },
}

export function SnapshotDiffViewer({ diffs, oldLabel, newLabel }: Props) {
  const [viewMode, setViewMode] = useState<'unified' | 'side-by-side'>('unified')
  const [showUnchanged, setShowUnchanged] = useState(false)
  const filtered = showUnchanged ? diffs : diffs.filter((d) => d.status !== 'unchanged')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            className={cn(
              'px-3 py-1 rounded-md text-sm transition-colors',
              viewMode === 'unified' ? 'bg-primary text-primary-foreground' : 'bg-muted',
            )}
            onClick={() => setViewMode('unified')}
          >
            Unificado
          </button>
          <button
            className={cn(
              'px-3 py-1 rounded-md text-sm transition-colors',
              viewMode === 'side-by-side' ? 'bg-primary text-primary-foreground' : 'bg-muted',
            )}
            onClick={() => setViewMode('side-by-side')}
          >
            Lado a lado
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showUnchanged} onCheckedChange={setShowUnchanged} id="show-unchanged" />
          <Label htmlFor="show-unchanged" className="text-sm cursor-pointer">
            Mostrar sem alterações
          </Label>
        </div>
      </div>
      {oldLabel && newLabel && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            De: <strong className="text-foreground">{oldLabel}</strong>
          </span>
          <span>→</span>
          <span>
            Para: <strong className="text-foreground">{newLabel}</strong>
          </span>
        </div>
      )}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhuma alteração encontrada entre as versões.
        </p>
      ) : (
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-2">
            {filtered.map((diff) => {
              const cfg = statusConfig[diff.status]
              const Icon = cfg.icon
              return (
                <div key={diff.key} className={cn('rounded-lg border p-3', cfg.bg)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn('h-4 w-4', cfg.color)} />
                    <span className="font-medium text-sm">{diff.label}</span>
                    <span className={cn('text-xs', cfg.color)}>{cfg.label}</span>
                  </div>
                  {viewMode === 'unified' ? (
                    <UnifiedDiff diff={diff} />
                  ) : (
                    <SideBySideDiff diff={diff} />
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

function UnifiedDiff({ diff }: { diff: FieldDiff }) {
  if (diff.status === 'unchanged')
    return (
      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
        {diff.oldValue || '(vazio)'}
      </pre>
    )
  return (
    <div className="space-y-0.5">
      {diff.lineDiff.map((line, i) => (
        <div
          key={i}
          className={cn(
            'text-xs font-mono px-2 py-0.5 rounded',
            line.type === 'added' && 'bg-green-500/15 text-green-600',
            line.type === 'removed' && 'bg-red-500/15 text-red-600',
            line.type === 'unchanged' && 'text-muted-foreground',
          )}
        >
          <span className="select-none mr-2">
            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
          </span>
          {line.content || '(vazio)'}
        </div>
      ))}
    </div>
  )
}

function SideBySideDiff({ diff }: { diff: FieldDiff }) {
  const oldLines = diff.lineDiff.filter((l) => l.type !== 'added')
  const newLines = diff.lineDiff.filter((l) => l.type !== 'removed')
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-0.5">
        <div className="text-xs text-muted-foreground mb-1">Antes</div>
        {oldLines.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">(vazio)</div>
        ) : (
          oldLines.map((line, i) => (
            <div
              key={i}
              className={cn(
                'text-xs font-mono px-2 py-0.5 rounded',
                line.type === 'removed' && 'bg-red-500/15 text-red-600',
                line.type === 'unchanged' && 'text-muted-foreground',
              )}
            >
              {line.content || '(vazio)'}
            </div>
          ))
        )}
      </div>
      <div className="space-y-0.5">
        <div className="text-xs text-muted-foreground mb-1">Depois</div>
        {newLines.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">(vazio)</div>
        ) : (
          newLines.map((line, i) => (
            <div
              key={i}
              className={cn(
                'text-xs font-mono px-2 py-0.5 rounded',
                line.type === 'added' && 'bg-green-500/15 text-green-600',
                line.type === 'unchanged' && 'text-muted-foreground',
              )}
            >
              {line.content || '(vazio)'}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
