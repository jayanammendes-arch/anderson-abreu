import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  adminGetTreatmentCategory,
  adminCreateTreatmentCategory,
  adminUpdateTreatmentCategory,
} from '@/services/treatment-categories'
import type { TreatmentCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { MultiImageUploader } from '@/components/admin/MultiImageUploader'
import { IconPicker } from '@/components/admin/IconPicker'
import { FileUploadField } from '@/components/admin/FileUploadField'
import { CropImageUploader } from '@/components/admin/CropImageUploader'
import { FileSizeDisplay } from '@/components/admin/FileSizeDisplay'
import { SortableList } from '@/components/admin/SortableList'
import {
  getTreatmentDetailConfig,
  TREATMENT_DETAIL_SECTION_LABELS,
  type SectionConfigItem,
} from '@/lib/treatment-sections'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type MultiImageField = 'como_funciona_images' | 'resultados_images' | 'cta_images'

const emptyForm: Partial<TreatmentCategory> = {
  name: '',
  slug: '',
  short_description: '',
  detailed_content: '',
  icon: 'brain',
  symptoms_list: '',
  order: 0,
  is_active: true,
  crop_x: 0.5,
  crop_y: 0.5,
  hide_icon: false,
  como_funciona_title: '',
  como_funciona_text: '',
  como_funciona_images: [],
  resultados_title: '',
  resultados_text: '',
  resultados_images: [],
  cta_title: '',
  cta_text: '',
  cta_images: [],
  sintomas_title: '',
  sintomas_text: '',
  sintomas_image: undefined,
  faixa_text: '',
  sections_config: undefined,
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

function FormSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3">
            <CardTitle className="flex items-center justify-between text-base">
              {title}
              <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default function AdminTreatmentCategoryEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<TreatmentCategory>>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [sintomasImageFile, setSintomasImageFile] = useState<File | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [newImages, setNewImages] = useState<Record<MultiImageField, File[]>>({
    como_funciona_images: [],
    resultados_images: [],
    cta_images: [],
  })
  const [removedExistingImages, setRemovedExistingImages] = useState<
    Record<MultiImageField, number[]>
  >({
    como_funciona_images: [],
    resultados_images: [],
    cta_images: [],
  })
  const [showIconPicker, setShowIconPicker] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    adminGetTreatmentCategory(id)
      .then((cat) => {
        setFormData({ ...cat })
        setLoading(false)
      })
      .catch(() => {
        toast.error('Categoria não encontrada')
        navigate('/admin/categorias-tratamentos')
      })
  }, [id, navigate])

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImagePreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    if (formData.id && formData.image) {
      setImagePreviewUrl(
        `${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatment_categories/${formData.id}/${formData.image}`,
      )
    } else {
      setImagePreviewUrl(null)
    }
  }, [imageFile, formData.id, formData.image])

  const sections = getTreatmentDetailConfig(
    formData.sections_config as SectionConfigItem[] | undefined,
  )

  const handleToggleSectionVisible = (sectionId: string) => {
    const updated = sections.map((s) => (s.id === sectionId ? { ...s, visible: !s.visible } : s))
    setFormData({ ...formData, sections_config: updated })
  }

  const getExistingImages = (field: MultiImageField): string[] => {
    const all = (formData[field] as string[]) || []
    return all.filter((_, idx) => !removedExistingImages[field].includes(idx))
  }

  const handleRemoveExistingImage = (field: MultiImageField, index: number) => {
    setRemovedExistingImages((prev) => ({ ...prev, [field]: [...prev[field], index] }))
  }

  const getSintomasImageSrc = () => {
    if (sintomasImageFile) return URL.createObjectURL(sintomasImageFile)
    if (formData.id && formData.sintomas_image) {
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatment_categories/${formData.id}/${formData.sintomas_image}`
    }
    return null
  }

  const renderMultiImageUploader = (field: MultiImageField, label: string) => (
    <MultiImageUploader
      label={label}
      existingImages={getExistingImages(field)}
      onChange={(files) => setNewImages((prev) => ({ ...prev, [field]: files }))}
      onRemoveExisting={(idx) => handleRemoveExistingImage(field, idx)}
      baseUrl={
        formData.id
          ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatment_categories/${formData.id}`
          : ''
      }
      helperText="Recomendado: 800×600 px (formato paisagem)"
    />
  )

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'detailed_content':
        return (
          <RichTextEditor
            value={formData.detailed_content || ''}
            onChange={(html) => setFormData({ ...formData, detailed_content: html })}
          />
        )
      case 'como_funciona':
        return (
          <>
            <div className="space-y-2">
              <Label>Título da seção</Label>
              <Input
                value={formData.como_funciona_title || ''}
                onChange={(e) => setFormData({ ...formData, como_funciona_title: e.target.value })}
                placeholder="Como Funciona"
              />
            </div>
            <RichTextEditor
              value={formData.como_funciona_text || ''}
              onChange={(html) => setFormData({ ...formData, como_funciona_text: html })}
            />
            {renderMultiImageUploader('como_funciona_images', 'Imagens (até 3)')}
          </>
        )
      case 'sintomas':
        return (
          <>
            <div className="space-y-2">
              <Label>Título da seção</Label>
              <Input
                value={formData.sintomas_title || ''}
                onChange={(e) => setFormData({ ...formData, sintomas_title: e.target.value })}
                placeholder="Sintomas"
              />
            </div>
            <RichTextEditor
              value={formData.sintomas_text || ''}
              onChange={(html) => setFormData({ ...formData, sintomas_text: html })}
            />
          </>
        )
      case 'sintomas_imagem':
        return (
          <div className="space-y-2">
            <FileUploadField
              label="Imagem de Sintomas"
              currentSrc={getSintomasImageSrc()}
              file={sintomasImageFile}
              onChange={setSintomasImageFile}
              accept="image/jpeg,image/png,image/webp"
              error={fieldErrors.sintomas_image}
            />
            <FileSizeDisplay file={sintomasImageFile} url={getSintomasImageSrc()} />
          </div>
        )
      case 'resultados':
        return (
          <>
            <div className="space-y-2">
              <Label>Título da seção</Label>
              <Input
                value={formData.resultados_title || ''}
                onChange={(e) => setFormData({ ...formData, resultados_title: e.target.value })}
                placeholder="Resultados"
              />
            </div>
            <RichTextEditor
              value={formData.resultados_text || ''}
              onChange={(html) => setFormData({ ...formData, resultados_text: html })}
            />
            {renderMultiImageUploader('resultados_images', 'Imagens (até 3)')}
          </>
        )
      case 'faixa_destaque':
        return (
          <div className="space-y-2">
            <Label>Texto da Faixa</Label>
            <Input
              value={formData.faixa_text || ''}
              onChange={(e) => setFormData({ ...formData, faixa_text: e.target.value })}
              placeholder="Texto exibido em destaque full-width"
            />
          </div>
        )
      case 'cta':
        return (
          <>
            <div className="space-y-2">
              <Label>Título da seção</Label>
              <Input
                value={formData.cta_title || ''}
                onChange={(e) => setFormData({ ...formData, cta_title: e.target.value })}
                placeholder="Pronto para começar?"
              />
            </div>
            <RichTextEditor
              value={formData.cta_text || ''}
              onChange={(html) => setFormData({ ...formData, cta_text: html })}
            />
            {renderMultiImageUploader('cta_images', 'Imagens (até 3)')}
          </>
        )
      default:
        return null
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})
    try {
      const slug = formData.slug || slugify(formData.name || '')
      const fd = new FormData()
      fd.append('name', formData.name || '')
      fd.append('slug', slug)
      fd.append('short_description', formData.short_description || '')
      fd.append('detailed_content', formData.detailed_content || '')
      fd.append('icon', formData.icon || 'brain')
      fd.append('order', String(Number(formData.order) || 0))
      fd.append('is_active', String(formData.is_active ?? true))
      fd.append('crop_x', String(formData.crop_x ?? 0.5))
      fd.append('crop_y', String(formData.crop_y ?? 0.5))
      fd.append('hide_icon', String(formData.hide_icon ?? false))
      fd.append('como_funciona_title', formData.como_funciona_title || '')
      fd.append('como_funciona_text', formData.como_funciona_text || '')
      fd.append('resultados_title', formData.resultados_title || '')
      fd.append('resultados_text', formData.resultados_text || '')
      fd.append('sintomas_title', formData.sintomas_title || '')
      fd.append('sintomas_text', formData.sintomas_text || '')
      fd.append('faixa_text', formData.faixa_text || '')
      fd.append('cta_title', formData.cta_title || '')
      fd.append('cta_text', formData.cta_text || '')
      fd.append('symptoms_list', formData.symptoms_list || '')
      fd.append('sections_config', JSON.stringify(sections))
      if (imageFile) fd.append('image', imageFile)
      if (sintomasImageFile) fd.append('sintomas_image', sintomasImageFile)
      const multiFields: MultiImageField[] = [
        'como_funciona_images',
        'resultados_images',
        'cta_images',
      ]
      for (const field of multiFields) {
        const allExisting = (formData[field] as string[]) || []
        const kept = allExisting.filter((_, idx) => !removedExistingImages[field].includes(idx))
        for (const filename of kept) fd.append(field, filename)
        for (const file of newImages[field]) fd.append(field, file)
        if (id) {
          for (const idx of removedExistingImages[field]) {
            const filename = allExisting[idx]
            if (filename) fd.append(`${field}-`, filename)
          }
        }
      }
      if (id) {
        await adminUpdateTreatmentCategory(id, fd)
        toast.success('Categoria atualizada!')
      } else {
        await adminCreateTreatmentCategory(fd)
        toast.success('Categoria criada!')
      }
      navigate('/admin/categorias-tratamentos')
    } catch (err) {
      const errors = extractFieldErrors(err)
      setFieldErrors(errors)
      if (Object.keys(errors).length === 0) toast.error('Erro ao salvar categoria')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/admin/categorias-tratamentos">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</h1>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <FormSection title="Informações Gerais" defaultOpen>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={formData.order ?? 0}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={formData.is_active ?? true}
                onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
              />
              <Label>Ativo</Label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.hide_icon ?? false}
              onCheckedChange={(c) => setFormData({ ...formData, hide_icon: c })}
            />
            <Label>Ocultar ícone no Conteúdo Detalhado</Label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Switch checked={showIconPicker} onCheckedChange={setShowIconPicker} />
              <Label className="cursor-pointer">Mostrar/Ocultar seletor de ícones</Label>
            </div>
            {showIconPicker && (
              <>
                <IconPicker
                  value={formData.icon || ''}
                  onChange={(icon) => setFormData({ ...formData, icon })}
                />
                {fieldErrors.icon && <p className="text-sm text-red-500">{fieldErrors.icon}</p>}
              </>
            )}
          </div>
        </FormSection>

        <FormSection title="Imagem Principal" defaultOpen>
          <CropImageUploader
            label="Imagem Principal"
            imageUrl={imagePreviewUrl}
            file={imageFile}
            cropX={formData.crop_x ?? 0.5}
            cropY={formData.crop_y ?? 0.5}
            onFileChange={setImageFile}
            onCropChange={(x, y) => setFormData({ ...formData, crop_x: x, crop_y: y })}
            accept="image/jpeg,image/png,image/webp"
            error={fieldErrors.image}
          />
        </FormSection>

        <FormSection title="Lista de Sintomas (Legacy)">
          <div className="space-y-2">
            <Label>Lista de Sintomas</Label>
            <RichTextEditor
              value={formData.symptoms_list || ''}
              onChange={(html) => setFormData({ ...formData, symptoms_list: html })}
            />
          </div>
        </FormSection>

        <FormSection title="Seções da Página de Tratamento" defaultOpen>
          <p className="text-sm text-muted-foreground mb-3">
            Arraste para reordenar as seções. Use o switch para controlar a visibilidade na página
            pública.
          </p>
          <SortableList
            items={sections}
            keyExtractor={(item: SectionConfigItem) => item.id}
            onReorder={(reordered: SectionConfigItem[]) =>
              setFormData({ ...formData, sections_config: reordered })
            }
            renderItem={(
              item: SectionConfigItem,
              { dragHandle }: { dragHandle: React.ReactNode },
            ) => (
              <Card className="p-4 space-y-4 bg-card/50 border-border/50">
                <div className="flex items-center gap-2">
                  {dragHandle}
                  <span className="font-semibold text-sm flex-1">
                    {TREATMENT_DETAIL_SECTION_LABELS[item.id] || item.id}
                  </span>
                  <Switch
                    checked={item.visible}
                    onCheckedChange={() => handleToggleSectionVisible(item.id)}
                  />
                </div>
                {item.visible && renderSectionContent(item.id)}
              </Card>
            )}
          />
        </FormSection>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" asChild>
            <Link to="/admin/categorias-tratamentos">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar
          </Button>
        </div>
      </form>
    </div>
  )
}
