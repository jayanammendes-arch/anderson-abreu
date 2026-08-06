import { useState } from 'react'
import { SNAPSHOT_FIELDS } from '@/lib/snapshot-fields'
import { parseSnapshot } from '@/lib/snapshot-diff'
import { selectiveRestoreSnapshot } from '@/services/content-snapshots'
import type { ContentSnapshot } from '@/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, RotateCcw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  recordId: string
  snapshot: ContentSnapshot
  onRestored: () => void
  onCancel: () => void
}

export function SnapshotSelectiveRestore({ recordId, snapshot, onRestored, onCancel }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [restoring, setRestoring] = useState(false)
  const [parseError, setParseError] = useState(false)

  const snapshotData = parseSnapshot(snapshot.snapshot)
  if (snapshot.snapshot && Object.keys(snapshotData).length === 0) {
    setParseError(true)
  }

  const available = SNAPSHOT_FIELDS.filter((f) => {
    const val = snapshotData[f.key]
    return val !== undefined && val !== null && val !== ''
  })

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const handleRestore = async () => {
    if (selected.size === 0) {
      toast.error('Selecione pelo menos um campo para restaurar')
      return
    }
    setRestoring(true)
    try {
      await selectiveRestoreSnapshot(recordId, snapshot.id, Array.from(selected))
      toast.success('Campos restaurados com sucesso!')
      onRestored()
    } catch {
      toast.error('Erro ao restaurar campos selecionados. Verifique se a versão é válida.')
    } finally {
      setRestoring(false)
    }
  }

  if (parseError) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-500">
          Não foi possível ler os dados desta versão. O snapshot pode estar corrompido.
        </p>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Selecione os campos que deseja restaurar desta versão.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelected(new Set(available.map((f) => f.key)))}
          >
            Selecionar todos
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
            Limpar
          </Button>
        </div>
      </div>
      {available.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhum campo com dados encontrado nesta versão.
        </p>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-1">
            {available.map((field) => (
              <label
                key={field.key}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox
                  checked={selected.has(field.key)}
                  onCheckedChange={() => toggle(field.key)}
                />
                <span className="text-sm">{field.label}</span>
              </label>
            ))}
          </div>
        </ScrollArea>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button size="sm" onClick={handleRestore} disabled={restoring || selected.size === 0}>
          {restoring ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-1" />
          )}
          Restaurar {selected.size > 0 ? `(${selected.size})` : ''}
        </Button>
      </div>
    </div>
  )
}
