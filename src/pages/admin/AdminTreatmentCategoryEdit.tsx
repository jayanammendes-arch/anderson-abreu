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
import { IconPicker } from '@/components/admin/IconPicker'
import { FileUploadField } from '@/components/admin/FileUploadField'
import { CropImageUploader } from '@/components/admin/CropImageUploader'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const emptyForm: Partial<TreatmentCategory> = {
  name: '',
  slug: '',
  short_description: '',
  detailed_content: '',
  icon: 'brain',
  order: 0,
  is_active: true,
  crop_x: 0.5,
  crop_y: 0.5,
  hide_icon: false,
  como_funciona_title: '',
  como_funciona_text: '',
  faixa_azul_frase: '',
  resultados_title: '',
  resultados_text: '',
  sintomas_title: '',
  sintomas_text: '',
  por_que_tantas_title: '',
  por_que_tantas_content: '',
  comparacao_title: '',
  comparacao_content: '',
  cta_title: '',
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
  const [comoFuncionaImageFile, setComoFuncionaImageFile] = useState<File | null>(null)
  const [resultadosImageFile, setResultadosImageFile] = useState<File | null>(null)
  const [sintomasImageFile, setSintomasImageFile] = useState<File | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
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

  const getExistingImageSrc = (
    field: keyof TreatmentCategory,
    file: File | null,
  ): string | null => {
    if (file) return URL.createObjectURL(file)
    const filename = formData[field] as string
    if (!filename || !formData.id) return null
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatment_categories/${formData.id}/${filename}`
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
      fd.append('icon', formData.icon || 'brain')
      fd.append('order', String(Number(formData.order) || 0))
      fd.append('is_active', String(formData.is_active ?? true))
      fd.append('crop_x', String(formData.crop_x ?? 0.5))
      fd.append('crop_y', String(formData.crop_y ?? 0.5))
      fd.append('hide_icon', String(formData.hide_icon ?? false))
      fd.append('como_funciona_title', formData.como_funciona_title || '')
      fd.append('como_funciona_text', formData.como_funciona_text || '')
      fd.append('faixa_azul_frase', formData.faixa_azul_frase || '')
      fd.append('resultados_title', formData.resultados_title || '')
      fd.append('resultados_text', formData.resultados_text || '')
      fd.append('sintomas_title', formData.sintomas_title || '')
      fd.append('sintomas_text', formData.sintomas_text || '')
      fd.append('por_que_tantas_title', formData.por_que_tantas_title || '')
      fd.append('por_que_tantas_content', formData.por_que_tantas_content || '')
      fd.append('comparacao_title', formData.comparacao_title || '')
      fd.append('comparacao_content', formData.comparacao_content || '')
      fd.append('cta_title', formData.cta_title || '')
      fd.append('detailed_content', formData.detailed_content || '')
      fd.append('symptoms_list', formData.symptoms_list || '')
      if (imageFile) fd.append('image', imageFile)
      if (comoFuncionaImageFile) fd.append('como_funciona_image', comoFuncionaImageFile)
      if (resultadosImageFile) fd.append('resultados_image', resultadosImageFile)
      if (sintomasImageFile) fd.append('sintomas_image', sintomasImageFile)

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
          </div>
          <div className="space-y-2">
            <Label>Descrição Curta *</Label>
            <Input
              required
              value={formData.short_description || ''}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"></div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Switch checked={showIconPicker} onCheckedChange={setShowIconPicker} />
              <Label className="cursor-pointer">Mostrar/Ocultar seletor de ícones</Label>
            </div>
            {showIconPicker && (
              <IconPicker
                value={formData.icon || ''}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            )}
          </div>
        </FormSection>

        <FormSection title="Imagem Principal (Hero)" defaultOpen>
          <CropImageUploader
            label="Imagem Principal"
            imageUrl={imagePreviewUrl}
            file={imageFile}
            cropX={formData.crop_x ?? 0.5}
            cropY={formData.crop_y ?? 0.5}
            onFileChange={setImageFile}
            onCropChange={(x, y) => setFormData({ ...formData, crop_x: x, crop_y: y })}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            error={fieldErrors.image}
          />
          <p className="text-xs text-muted-foreground">
            O botão "Agendar Sessão" é exibido automaticamente no hero e direciona para /agendar.
          </p>
        </FormSection>

        <FormSection title="1. Como Funciona" defaultOpen>
          <div className="space-y-2">
            <Label>Título</Label>
            <RichTextEditor
              value={formData.como_funciona_title || ''}
              onChange={(html) => setFormData({ ...formData, como_funciona_title: html })}
            />
          </div>
          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <RichTextEditor
              value={formData.como_funciona_text || ''}
              onChange={(html) => setFormData({ ...formData, como_funciona_text: html })}
            />
          </div>
          <FileUploadField
            label="Imagem"
            currentSrc={getExistingImageSrc('como_funciona_image', comoFuncionaImageFile)}
            file={comoFuncionaImageFile}
            onChange={setComoFuncionaImageFile}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            error={fieldErrors.como_funciona_image}
          />
        </FormSection>

        <FormSection title="2. Faixa Azul (Frase Configurável)" defaultOpen>
          <div className="space-y-2">
            <Label>Frase da Faixa Azul</Label>
            <Input
              value={formData.faixa_azul_frase || ''}
              onChange={(e) => setFormData({ ...formData, faixa_azul_frase: e.target.value })}
              placeholder="Texto exibido na faixa azul full-width"
            />
          </div>
        </FormSection>

        <FormSection title="3. Resultados Respaldados Pela Ciência" defaultOpen>
          <div className="space-y-2">
            <Label>Título</Label>
            <RichTextEditor
              value={formData.resultados_title || ''}
              onChange={(html) => setFormData({ ...formData, resultados_title: html })}
            />
          </div>
          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <RichTextEditor
              value={formData.resultados_text || ''}
              onChange={(html) => setFormData({ ...formData, resultados_text: html })}
            />
          </div>
          <FileUploadField
            label="Imagem"
            currentSrc={getExistingImageSrc('resultados_image', resultadosImageFile)}
            file={resultadosImageFile}
            onChange={setResultadosImageFile}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            error={fieldErrors.resultados_image}
          />
        </FormSection>

        <FormSection title="4. Sintomas" defaultOpen>
          <div className="space-y-2">
            <Label>Título</Label>
            <RichTextEditor
              value={formData.sintomas_title || ''}
              onChange={(html) => setFormData({ ...formData, sintomas_title: html })}
            />
          </div>
          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <RichTextEditor
              value={formData.sintomas_text || ''}
              onChange={(html) => setFormData({ ...formData, sintomas_text: html })}
            />
          </div>
          <FileUploadField
            label="Imagem"
            currentSrc={getExistingImageSrc('sintomas_image', sintomasImageFile)}
            file={sintomasImageFile}
            onChange={setSintomasImageFile}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            error={fieldErrors.sintomas_image}
          />
        </FormSection>

        <FormSection title="5. Por que tantas pessoas buscam a Hipnoterapia?" defaultOpen>
          <div className="space-y-2">
            <Label>Título</Label>
            <RichTextEditor
              value={formData.por_que_tantas_title || ''}
              onChange={(html) => setFormData({ ...formData, por_que_tantas_title: html })}
            />
          </div>
          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <RichTextEditor
              value={formData.por_que_tantas_content || ''}
              onChange={(html) => setFormData({ ...formData, por_que_tantas_content: html })}
            />
          </div>
        </FormSection>

        <FormSection title="6. Comparação / Explicação" defaultOpen>
          <div className="space-y-2">
            <Label>Título</Label>
            <RichTextEditor
              value={formData.comparacao_title || ''}
              onChange={(html) => setFormData({ ...formData, comparacao_title: html })}
            />
          </div>
          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <RichTextEditor
              value={formData.comparacao_content || ''}
              onChange={(html) => setFormData({ ...formData, comparacao_content: html })}
            />
          </div>
        </FormSection>

        <FormSection title="7. CTA Final (Comece sua Jornada)" defaultOpen>
          <div className="space-y-2">
            <Label>Título</Label>
            <RichTextEditor
              value={formData.cta_title || ''}
              onChange={(html) => setFormData({ ...formData, cta_title: html })}
            />
          </div>
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
