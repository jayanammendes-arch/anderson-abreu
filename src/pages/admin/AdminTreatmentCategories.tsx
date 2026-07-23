import { useState, useEffect, useCallback } from 'react'
import {
  adminGetTreatmentCategories,
  adminCreateTreatmentCategory,
  adminUpdateTreatmentCategory,
  adminDeleteTreatmentCategory,
} from '@/services/treatment-categories'
import type { TreatmentCategory } from '@/types'
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

const emptyForm: Partial<TreatmentCategory> = {
  name: '',
  slug: '',
  short_description: '',
  detailed_content: '',
  symptoms_list: '',
  icon: 'brain',
  order: 0,
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

export default function AdminTreatmentCategories() {
  const [categories, setCategories] = useState<TreatmentCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<Partial<TreatmentCategory>>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await adminGetTreatmentCategories()
      setCategories(data as TreatmentCategory[])
    } catch {
      toast.error('Erro ao carregar categorias')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('treatment_categories', () => loadData())

  const handleNew = () => {
    setFormData({ ...emptyForm, order: categories.length })
    setImageFile(null)
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleEdit = (cat: TreatmentCategory) => {
    setFormData({ ...cat })
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
        symptoms_list: formData.symptoms_list || '',
        icon: formData.icon || 'brain',
        order: Number(formData.order) || 0,
      }
      if (imageFile) {
        const fd = new FormData()
        Object.entries(baseData).forEach(([k, v]) => fd.append(k, String(v)))
        fd.append('image', imageFile)
        if (formData.id) await adminUpdateTreatmentCategory(formData.id, fd)
        else await adminCreateTreatmentCategory(fd)
      } else {
        if (formData.id) await adminUpdateTreatmentCategory(formData.id, baseData)
        else await adminCreateTreatmentCategory(baseData)
      }
      toast.success(formData.id ? 'Categoria atualizada!' : 'Categoria criada!')
      setDialogOpen(false)
      loadData()
    } catch (err) {
      const errors = extractFieldErrors(err)
      setFieldErrors(errors)
      if (Object.keys(errors).length === 0) toast.error('Erro ao salvar categoria')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await adminDeleteTreatmentCategory(deleteId)
      toast.success('Categoria excluída!')
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
        <h1 className="text-2xl font-bold">Categorias de Tratamento</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <Card className="bg-card/50 border-border/50 p-12 text-center text-muted-foreground">
          Nenhuma categoria cadastrada.
        </Card>
      ) : (
        <div className="grid gap-3">
          {categories.map((cat) => {
            const Icon = getTreatmentIcon(cat.icon)
            return (
              <Card
                key={cat.id}
                className="flex items-center gap-4 p-4 bg-card/50 border-border/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100">
                  <Icon className="h-5 w-5 text-sky-600" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">/tratamentos/{cat.slug}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(cat.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
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
              <Label>Descrição Curta *</Label>
              <Input
                required
                value={formData.short_description || ''}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              />
              {fieldErrors.short_description && (
                <p className="text-sm text-red-500">{fieldErrors.short_description}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Conteúdo Detalhado</Label>
              <RichTextEditor
                value={formData.detailed_content || ''}
                onChange={(html) => setFormData({ ...formData, detailed_content: html })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lista de Sintomas</Label>
              <RichTextEditor
                value={formData.symptoms_list || ''}
                onChange={(html) => setFormData({ ...formData, symptoms_list: html })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ícone *</Label>
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
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Esta ação não pode ser desfeita.
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
