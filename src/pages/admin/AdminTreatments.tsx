import { useState, useEffect, useCallback } from 'react'
import {
  adminGetTreatments,
  adminCreateTreatment,
  adminUpdateTreatment,
  adminDeleteTreatment,
  adminReorderTreatments,
  getTreatmentImageUrl,
} from '@/services/treatments'
import { SortableList } from '@/components/admin/SortableList'
import type { Treatment } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { IconPicker } from '@/components/admin/IconPicker'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2, Save } from 'lucide-react'

const emptyForm: Partial<Treatment> = {
  name: '',
  slug: '',
  short_description: '',
  detailed_content: '',
  order: 0,
  icon: '',
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function AdminTreatments() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<Partial<Treatment>>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await adminGetTreatments()
      setTreatments(data as Treatment[])
    } catch {
      toast.error('Erro ao carregar tratamentos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('treatments', () => loadData())

  const handleReorder = async (reordered: Treatment[]) => {
    const updates = reordered.map((item, index) => ({ id: item.id, order: index + 1 }))
    try {
      await adminReorderTreatments(updates)
    } catch (err) {
      toast.error('Erro ao reordenar. Tente novamente.')
      throw err
    }
    const orderMap = new Map(updates.map((u) => [u.id, u.order]))
    setTreatments((prev) =>
      prev
        .map((item) => ({ ...item, order: orderMap.get(item.id) ?? item.order }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    )
  }

  const handleNew = () => {
    setFormData({ ...emptyForm, order: treatments.length })
    setImageFile(null)
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleEdit = (treatment: Treatment) => {
    setFormData({ ...treatment })
    setImageFile(null)
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFieldErrors({})
    try {
      const slug = formData.slug || slugify(formData.name || '')
      const baseData: Record<string, unknown> = {
        name: formData.name || '',
        slug,
        short_description: formData.short_description || '',
        detailed_content: formData.detailed_content || '',
        order: Number(formData.order) || 0,
        icon: formData.icon || '',
      }

      if (imageFile) {
        const fd = new FormData()
        Object.entries(baseData).forEach(([key, value]) => fd.append(key, String(value)))
        fd.append('image', imageFile)
        if (formData.id) await adminUpdateTreatment(formData.id, fd)
        else await adminCreateTreatment(fd)
      } else {
        if (formData.id) await adminUpdateTreatment(formData.id, baseData)
        else await adminCreateTreatment(baseData)
      }
      toast.success(formData.id ? 'Tratamento atualizado!' : 'Tratamento criado!')
      setDialogOpen(false)
      loadData()
    } catch (err) {
      const errors = extractFieldErrors(err)
      setFieldErrors(errors)
      if (Object.keys(errors).length === 0) toast.error('Erro ao salvar tratamento')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await adminDeleteTreatment(deleteId)
      toast.success('Tratamento excluído!')
      loadData()
    } catch {
      toast.error('Erro ao excluir')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tratamentos</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Tratamento
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : treatments.length === 0 ? (
        <Card className="bg-card/50 border-border/50 p-12 text-center text-muted-foreground">
          Nenhum tratamento cadastrado.
        </Card>
      ) : (
        <SortableList
          items={treatments}
          keyExtractor={(t) => t.id}
          onReorder={handleReorder}
          renderItem={(treatment, { dragHandle }) => {
            const Icon = getTreatmentIcon(treatment.icon)
            return (
              <Card className="flex items-center gap-2 p-4 bg-card/50 border-border/50">
                {dragHandle}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{treatment.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    /tratamentos/{treatment.slug}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(treatment)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(treatment.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          }}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Tratamento' : 'Novo Tratamento'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-gerado a partir do nome"
              />
              {fieldErrors.slug && <p className="text-sm text-red-500">{fieldErrors.slug}</p>}
            </div>
            <div className="space-y-2">
              <Label>Descrição Curta</Label>
              <Input
                value={formData.short_description || ''}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo Detalhado *</Label>
              <RichTextEditor
                value={formData.detailed_content || ''}
                onChange={(html) => setFormData({ ...formData, detailed_content: html })}
              />
              {fieldErrors.detailed_content && (
                <p className="text-sm text-red-500">{fieldErrors.detailed_content}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <IconPicker
                value={formData.icon || ''}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>
            <div className="space-y-2">
              <Label>Imagem</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 800×600 px (formato paisagem)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={formData.order || 0}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tratamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este tratamento? Esta ação não pode ser desfeita.
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
