import { useState, useEffect, useCallback } from 'react'
import { getSnapshots, restoreSnapshot } from '@/services/content-snapshots'
import type { ContentSnapshot } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { RotateCcw, Loader2, Clock, User } from 'lucide-react'

interface Props {
  recordId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRestored: () => void
}

export function SnapshotHistoryDialog({ recordId, open, onOpenChange, onRestored }: Props) {
  const [snapshots, setSnapshots] = useState<ContentSnapshot[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)

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
    if (open && recordId) loadSnapshots()
  }, [open, recordId, loadSnapshots])

  const handleRestore = async (snapshotId: string) => {
    setRestoring(snapshotId)
    try {
      await restoreSnapshot(recordId, snapshotId)
      toast.success('Versão restaurada com sucesso!')
      onRestored()
      onOpenChange(false)
    } catch {
      toast.error('Erro ao restaurar versão')
    } finally {
      setRestoring(null)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Histórico de Versões</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : snapshots.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma versão salva.</p>
          ) : (
            <div className="space-y-2">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
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
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restaurar
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
