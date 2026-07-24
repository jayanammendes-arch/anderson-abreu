import { useState, useEffect, useCallback } from 'react'
import {
  adminGetCertificationLogos,
  createCertificationLogo,
  updateCertificationLogo,
  deleteCertificationLogo,
  getCertificationLogoUrl,
} from '@/services/certification-logos'
import type { CertificationLogo } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { Trash2, Plus, Loader2, Upload, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react'

export default function AdminCertifications() {
  const [logos, setLogos] = useState<CertificationLogo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reordering, setReordering] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await adminGetCertificationLogos()
      setLogos(data as CertificationLogo[])
    } catch {
      toast.error('Erro ao carregar certificações')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('certification_logos', () => {
    loadData()
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('order', String(logos.length))
      await createCertificationLogo(fd)
      toast.success('Logo adicionado com sucesso!')
      loadData()
    } catch {
      toast.error('Erro ao enviar logo')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteCertificationLogo(deleteId)
      toast.success('Logo excluído!')
      loadData()
    } catch {
      toast.error('Erro ao excluir logo')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= logos.length) return
    const current = logos[index]
    const target = logos[targetIndex]
    setReordering(current.id)
    try {
      await Promise.all([
        updateCertificationLogo(current.id, { order: target.order }),
        updateCertificationLogo(target.id, { order: current.order }),
      ])
      toast.success('Ordem atualizada!')
      loadData()
    } catch {
      toast.error('Erro ao reordenar')
    } finally {
      setReordering(null)
    }
  }

  const handleOrderChange = async (logo: CertificationLogo, newOrder: number) => {
    try {
      await updateCertificationLogo(logo.id, { order: newOrder })
      loadData()
    } catch {
      toast.error('Erro ao atualizar ordem')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Certificações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tamanho recomendado: 180×80 px, fundo transparente
          </p>
        </div>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button disabled={uploading} asChild>
            <span>
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Adicionar Logo
            </span>
          </Button>
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : logos.length === 0 ? (
        <Card className="bg-card/50 border-border/50 p-12 text-center text-muted-foreground">
          <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
          Nenhuma certificação cadastrada. Clique em "Adicionar Logo" para começar.
        </Card>
      ) : (
        <div className="grid gap-3">
          {logos.map((logo, index) => {
            const url = getCertificationLogoUrl(logo)
            return (
              <Card
                key={logo.id}
                className="flex items-center gap-4 p-4 bg-card/50 border-border/50"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleReorder(index, -1)}
                    disabled={index === 0 || reordering === logo.id}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleReorder(index, 1)}
                    disabled={index === logos.length - 1 || reordering === logo.id}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex h-16 w-32 shrink-0 items-center justify-center rounded-lg bg-[#0a1628] border border-border/30 overflow-hidden">
                  {url ? (
                    <img
                      src={url}
                      alt={`Logo ${index + 1}`}
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground opacity-40" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{logo.image}</p>
                  <p className="text-xs text-muted-foreground">Ordem: {logo.order}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Input
                    type="number"
                    value={logo.order}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (!Number.isNaN(val)) {
                        handleOrderChange(logo, val)
                      }
                    }}
                    className="w-20"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(logo.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Logo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este logo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
