import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { adminGetCourse, adminCreateCourse, adminUpdateCourse } from '@/services/admin-courses'
import { ModuleManager } from '@/components/admin/ModuleManager'
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
      if (thumbnail) {
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
        fd.append('thumbnail', thumbnail)
        if (courseId) {
          await adminUpdateCourse(courseId, fd)
        } else {
          await adminCreateCourse(fd)
        }
      } else {
        const payload = {
          title: form.title,
          short_description: form.short_description,
          description: form.description,
          external_buy_url: form.external_buy_url || undefined,
          price: Number(form.price),
          discount_price: Number(form.discount_price),
          discount_percentage: Number(form.discount_percentage),
          order: Number(form.order),
          visibility: form.visibility,
          is_available: Boolean(form.is_available),
          category: form.category,
        }
        if (courseId) {
          await adminUpdateCourse(courseId, payload)
        } else {
          await adminCreateCourse(payload)
        }
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
          <div className="space-y-2">
            <Label>Descrição Completa</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
        <Section title="Mídia">
          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
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
