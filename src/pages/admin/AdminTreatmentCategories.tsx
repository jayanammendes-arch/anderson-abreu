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
import { MultiImageUploader } from '@/components/admin/MultiImageUploader'
import { IconPicker } from '@/components/admin/IconPicker'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2, Save } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const emptyForm: Partial<TreatmentCategory> = {
  name: '',
  slug: '',
  short_description: '',
  detailed_content: '',
  symptoms_list: '',
  como_funciona_text: '',
  resultados_text: '',
  cta_text: '',
  icon: 'brain',
  order: 0,
  is_active: true,
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

type MultiImageField = 'como_funciona_images' | 'resultados_images' | 'cta_images'

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
  const [newImages, setNewImages] = useState<Record<MultiImageField, File[]>>({
    como_funciona_images: [],
    resultados_images: [],
    cta_images: [],
  })
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [removedExistingImages, setRemovedExistingImages] = useState<
    Record<MultiImageField, number[]>
  >({
    como_funciona_images: [],
    resultados_images: [],
    cta_images: [],
  })

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

  const resetMultiImages = () => {
    setNewImages({ como_funciona_images: [], resultados_images: [], cta_images: [] })
    setRemovedExistingImages({ como_funciona_images: [], resultados_images: [], cta_images: [] })
  }

  const handleNew = () => {
    setFormData({ ...emptyForm, order: categories.length })
    setImageFile(null)
    setFieldErrors({})
    resetMultiImages()
    setDialogOpen(true)
  }

  const handleEdit = (cat: TreatmentCategory) => {
    setFormData({ ...cat })
    setImageFile(null)
    setFieldErrors({})
    resetMultiImages()
    setDialogOpen(true)
  }

  const getExistingImages = (field: MultiImageField): string[] => {
    const all = (formData[field] as string[]) || []
    return all.filter((_, idx) => !removedExistingImages[field].includes(idx))
  }

  const handleRemoveExistingImage = (field: MultiImageField, index: number) => {
    setRemovedExistingImages((prev) => ({
      ...prev,
      [field]: [...prev[field], index],
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFieldErrors({})
    try {
      const slug = formData.slug || slugify(formData.name || '')
      const fd = new FormData()
      fd.append('name', formData.name || '')
      fd.append('slug', slug)
      fd.append('short_description', formData.short_description || '')
      fd.append('detailed_content', formData.detailed_content || '')
      fd.append('symptoms_list', formData.symptoms_list || '')
      fd.append('icon', formData.icon || 'brain')
      fd.append('order', String(Number(formData.order) || 0))
      fd.append('como_funciona_text', formData.como_funciona_text || '')
      fd.append('resultados_text', formData.resultados_text || '')
      fd.append('cta_text', formData.cta_text || '')
      fd.append('is_active', String(formData.is_active ?? true))

      if (imageFile) fd.append('image', imageFile)

      const multiFields: MultiImageField[] = [
        'como_funciona_images',
        'resultados_images',
        'cta_images',
      ]
      for (const field of multiFields) {
        const allExisting = (formData[field] as string[]) || []
        const kept = allExisting.filter((_, idx) => !removedExistingImages[field].includes(idx))
        for (const filename of kept) {
          fd.append(`${field}`, filename)
        }
        for (const file of newImages[field]) {
          fd.append(`${field}`, file)
        }
      }

      const recordId = formData.id
      if (recordId) {
        for (const field of multiFields) {
          const allExisting = (formData[field] as string[]) || []
          for (const idx of removedExistingImages[field]) {
            const filename = allExisting[idx]
            if (filename) fd.append(`${field}-`, filename)
          }
        }
        await adminUpdateTreatmentCategory(recordId, fd)
      } else {
        await adminCreateTreatmentCategory(fd)
      }
      toast.success(recordId ? 'Categoria atualizada!' : 'Categoria criada!')
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

  const handleToggleActive = async (cat: TreatmentCategory) => {
    const newValue = !cat.is_active
    setTogglingId(cat.id)
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, is_active: newValue } : c)))
    try {
      await adminUpdateTreatmentCategory(cat.id, { is_active: newValue })
      toast.success(newValue ? 'Categoria ativada!' : 'Categoria desativada!')
    } catch {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: !newValue } : c)),
      )
      toast.error('Erro ao alterar status da categoria')
    } finally {
      setTogglingId(null)
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
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={cat.is_active ?? false}
                    onCheckedChange={() => handleToggleActive(cat)}
                    disabled={togglingId === cat.id}
                  />
                  <span className="text-xs text-muted-foreground w-12">
                    {cat.is_active ? 'Ativo' : 'Inativo'}
                  </span>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              {fieldErrors.icon && <p className="text-sm text-red-500">{fieldErrors.icon}</p>}
            </div>
            <div className="space-y-2">
              <Label>Imagem Principal</Label>
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

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-semibold">Como Funciona</h3>
              <RichTextEditor
                value={formData.como_funciona_text || ''}
                onChange={(html) => setFormData({ ...formData, como_funciona_text: html })}
              />
              {formData.id && (
                <MultiImageUploader
                  label="Imagens (até 3)"
                  existingImages={getExistingImages('como_funciona_images')}
                  onChange={(files) =>
                    setNewImages((prev) => ({ ...prev, como_funciona_images: files }))
                  }
                  onRemoveExisting={(idx) => handleRemoveExistingImage('como_funciona_images', idx)}
                  baseUrl={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatment_categories/${formData.id}`}
                />
              )}
              {!formData.id && (
                <MultiImageUploader
                  label="Imagens (até 3)"
                  existingImages={[]}
                  onChange={(files) =>
                    setNewImages((prev) => ({ ...prev, como_funciona_images: files }))
                  }
                  onRemoveExisting={() => {}}
                  baseUrl=""
                />
              )}
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-semibold">Resultados</h3>
              <RichTextEditor
                value={formData.resultados_text || ''}
                onChange={(html) => setFormData({ ...formData, resultados_text: html })}
              />
              {formData.id && (
                <MultiImageUploader
                  label="Imagens (até 3)"
                  existingImages={getExistingImages('resultados_images')}
                  onChange={(files) =>
                    setNewImages((prev) => ({ ...prev, resultados_images: files }))
                  }
                  onRemoveExisting={(idx) => handleRemoveExistingImage('resultados_images', idx)}
                  baseUrl={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatment_categories/${formData.id}`}
                />
              )}
              {!formData.id && (
                <MultiImageUploader
                  label="Imagens (até 3)"
                  existingImages={[]}
                  onChange={(files) =>
                    setNewImages((prev) => ({ ...prev, resultados_images: files }))
                  }
                  onRemoveExisting={() => {}}
                  baseUrl=""
                />
              )}
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-semibold">CTA Final</h3>
              <RichTextEditor
                value={formData.cta_text || ''}
                onChange={(html) => setFormData({ ...formData, cta_text: html })}
              />
              {formData.id && (
                <MultiImageUploader
                  label="Imagens (até 3)"
                  existingImages={getExistingImages('cta_images')}
                  onChange={(files) => setNewImages((prev) => ({ ...prev, cta_images: files }))}
                  onRemoveExisting={(idx) => handleRemoveExistingImage('cta_images', idx)}
                  baseUrl={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatment_categories/${formData.id}`}
                />
              )}
              {!formData.id && (
                <MultiImageUploader
                  label="Imagens (até 3)"
                  existingImages={[]}
                  onChange={(files) => setNewImages((prev) => ({ ...prev, cta_images: files }))}
                  onRemoveExisting={() => {}}
                  baseUrl=""
                />
              )}
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
