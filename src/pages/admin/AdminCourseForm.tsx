import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { adminGetCourse, adminCreateCourse, adminUpdateCourse } from '@/services/admin-courses'
import { ModuleManager } from '@/components/admin/ModuleManager'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Course } from '@/types'

const emptyForm = {
  title: '',
  short_description: '',
  description: '',
  external_buy_url: '',
  price: 0,
  discount_price: 0,
  discount_percentage: 0,
  visibility: 'home',
  is_available: true,
  category: '',
  order: 0,
  access_type: 'paid',
  catchy_title: '',
  public_description: '',
  buy_button_text: '',
}

function Section({
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

export default function AdminCourseForm() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const isEdit = !!courseId
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [footerBanner, setFooterBanner] = useState<File | null>(null)
  const [form, setForm] = useState(emptyForm)

  const loadCourse = useCallback(async () => {
    if (!courseId) return
    try {
      const c = (await adminGetCourse(courseId)) as Course
      setForm({
        title: c.title || '',
        short_description: c.short_description || '',
        description: c.description || '',
        external_buy_url: c.external_buy_url || '',
        price: c.price || 0,
        discount_price: c.discount_price || 0,
        discount_percentage: c.discount_percentage || 0,
        visibility: c.visibility || 'home',
        is_available: c.is_available,
        category: c.category || '',
        order: c.order || 0,
        access_type: c.access_type || 'paid',
        catchy_title: c.catchy_title || '',
        public_description: c.public_description || '',
        buy_button_text: c.buy_button_text || '',
      })
    } catch {
      toast.error('Curso não encontrado')
      navigate('/admin/cursos')
    } finally {
      setLoading(false)
    }
  }, [courseId, navigate])

  useEffect(() => {
    if (isEdit) loadCourse()
  }, [isEdit, loadCourse])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('short_description', form.short_description)
      fd.append('description', form.description)
      fd.append('external_buy_url', form.external_buy_url)
      fd.append('price', String(form.price))
      fd.append('discount_price', String(form.discount_price))
      fd.append('discount_percentage', String(form.discount_percentage))
      fd.append('order', String(form.order))
      fd.append('visibility', form.visibility)
      fd.append('is_available', String(form.is_available))
      fd.append('category', form.category)
      fd.append('access_type', form.access_type)
      fd.append('catchy_title', form.catchy_title)
      fd.append('public_description', form.public_description)
      fd.append('buy_button_text', form.buy_button_text)
      if (thumbnail) fd.append('thumbnail', thumbnail)
      if (footerBanner) fd.append('footer_banner', footerBanner)

      if (courseId) {
        await adminUpdateCourse(courseId, fd)
      } else {
        await adminCreateCourse(fd)
      }
      toast.success(courseId ? 'Curso atualizado!' : 'Curso criado!')
      if (!courseId) navigate('/admin/cursos')
    } catch {
      toast.error('Erro ao salvar curso')
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
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/admin/cursos">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Editar Curso' : 'Novo Curso'}</h1>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <Section title="Informações Gerais" defaultOpen>
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição Curta</Label>
            <Input
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Acesso</Label>
              <Select
                value={form.access_type}
                onValueChange={(v) => setForm({ ...form, access_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Livre</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="hypnosis">Exclusivo hipnose</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        <Section title="Página Pública (Landing Page)" defaultOpen>
          <div className="space-y-2">
            <Label>Título de Venda (Catchy Title)</Label>
            <Input
              value={form.catchy_title}
              onChange={(e) => setForm({ ...form, catchy_title: e.target.value })}
              placeholder="Ex: Transforme sua carreira em hipnose clínica"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição Pública (Long Description)</Label>
            <RichTextEditor
              value={form.public_description}
              onChange={(html) => setForm({ ...form, public_description: html })}
            />
          </div>
          <div className="space-y-2">
            <Label>Texto do Botão de Compra</Label>
            <Input
              value={form.buy_button_text}
              onChange={(e) => setForm({ ...form, buy_button_text: e.target.value })}
              placeholder="Ex: Quero começar agora"
            />
          </div>
          <div className="space-y-2">
            <Label>Banner do Rodapé (Footer Banner)</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFooterBanner(e.target.files?.[0] || null)}
            />
          </div>
        </Section>

        <Section title="Mídia">
          <div className="space-y-2">
            <Label>Capa (Thumbnail)</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
            />
          </div>
        </Section>

        <Section title="Preços">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Preço c/ Desconto</Label>
              <Input
                type="number"
                step="0.01"
                value={form.discount_price}
                onChange={(e) => setForm({ ...form, discount_price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>% Desconto</Label>
              <Input
                type="number"
                value={form.discount_percentage}
                onChange={(e) => setForm({ ...form, discount_percentage: Number(e.target.value) })}
              />
            </div>
          </div>
        </Section>

        <Section title="Link de Pagamento">
          <div className="space-y-2">
            <Label>URL de Compra Externa</Label>
            <Input
              type="url"
              value={form.external_buy_url}
              onChange={(e) => setForm({ ...form, external_buy_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </Section>

        <Section title="Visibilidade">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visibilidade</Label>
              <Select
                value={form.visibility}
                onValueChange={(v) => setForm({ ...form, visibility: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={form.is_available}
                onCheckedChange={(c) => setForm({ ...form, is_available: c })}
              />
              <Label>Disponível</Label>
            </div>
          </div>
        </Section>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" asChild>
            <Link to="/admin/cursos">Cancelar</Link>
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
            )}{' '}
            Salvar
          </Button>
        </div>
      </form>
      {isEdit && courseId && <ModuleManager courseId={courseId} />}
    </div>
  )
}
