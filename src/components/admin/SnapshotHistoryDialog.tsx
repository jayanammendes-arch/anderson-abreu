import { useState, useEffect, useCallback } from 'react'
import { getSnapshots, restoreSnapshot } from '@/services/content-snapshots'
import { computeFieldDiffs } from '@/lib/snapshot-diff'
import type { ContentSnapshot } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { RotateCcw, Loader2, Clock, User, GitCompare, ArrowLeft, FileText } from 'lucide-react'
import { SnapshotDiffViewer } from '@/components/admin/SnapshotDiffViewer'
import { SnapshotSelectiveRestore } from '@/components/admin/SnapshotSelectiveRestore'
import { cn } from '@/lib/utils'

interface Props {
  recordId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRestored: () => void
}

type ViewMode = 'list' | 'compare' | 'selective'

export function SnapshotHistoryDialog({ recordId, open, onOpenChange, onRestored }: Props) {
  const [snapshots, setSnapshots] = useState<ContentSnapshot[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('list')
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [selectiveSnap, setSelectiveSnap] = useState<ContentSnapshot | null>(null)

  const loadSnapshots = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSnapshots(recordId)
      setSnapshots(data as ContentSnapshot[])
    } catch {
      toast.error('Erro ao carregar histórico')
    } finally {
      setLoading(false)
    }
  }, [recordId])

  useEffect(() => {
    if (open && recordId) {
      loadSnapshots()
      setView('list')
      setCompareIds([])
      setSelectiveSnap(null)
    }
  }, [open, recordId, loadSnapshots])

  const handleRestore = async (snapshotId: string) => {
    setRestoring(snapshotId)
    try {
      await restoreSnapshot(recordId, snapshotId)
      toast.success('Versão restaurada com sucesso!')
      onRestored()
      onOpenChange(false)
    } catch {
      toast.error('Erro ao restaurar versão. Tente novamente.')
    } finally {
      setRestoring(null)
    }
  }

  const toggleCompare = (id: string) =>
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const sortedCompare =
    compareIds.length === 2
      ? snapshots
          .filter((s) => compareIds.includes(s.id))
          .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
      : []
  const diffs =
    sortedCompare.length === 2
      ? computeFieldDiffs(sortedCompare[0].snapshot, sortedCompare[1].snapshot)
      : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(view === 'list' ? 'max-w-md' : 'max-w-4xl')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {view !== 'list' && (
              <Button variant="ghost" size="sm" onClick={() => setView('list')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {view === 'list' && 'Histórico de Versões'}
            {view === 'compare' && 'Comparar Versões'}
            {view === 'selective' && 'Restauração Seletiva'}
          </DialogTitle>
        </DialogHeader>

        {view === 'list' && (
          <>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : snapshots.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma versão salva.</p>
            ) : (
              <>
                {compareIds.length === 2 && (
                  <Button size="sm" onClick={() => setView('compare')} className="mb-2 w-full">
                    <GitCompare className="h-4 w-4 mr-2" /> Comparar versões selecionadas
                  </Button>
                )}
                {compareIds.length === 1 && (
                  <p className="text-xs text-muted-foreground text-center mb-2">
                    Selecione mais uma versão para comparar.
                  </p>
                )}
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-2">
                    {snapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg border bg-card',
                          compareIds.includes(snap.id) && 'border-primary',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={compareIds.includes(snap.id)}
                            onCheckedChange={() => toggleCompare(snap.id)}
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{formatDate(snap.created)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{snap.expand?.user?.name || 'Sistema'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectiveSnap(snap)
                              setView('selective')
                            }}
                          >
                            <FileText className="h-3 w-3 mr-1" /> Seletivo
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(snap.id)}
                            disabled={restoring === snap.id}
                          >
                            {restoring === snap.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <RotateCcw className="h-3 w-3 mr-1" /> Restaurar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </>
        )}

        {view === 'compare' && (
          <SnapshotDiffViewer
            diffs={diffs}
            oldLabel={sortedCompare[0] ? formatDate(sortedCompare[0].created) : ''}
            newLabel={sortedCompare[1] ? formatDate(sortedCompare[1].created) : ''}
          />
        )}

        {view === 'selective' && selectiveSnap && (
          <SnapshotSelectiveRestore
            recordId={recordId}
            snapshot={selectiveSnap}
            onRestored={() => {
              onRestored()
              onOpenChange(false)
            }}
            onCancel={() => setView('list')}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
