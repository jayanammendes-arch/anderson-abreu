import { useState, useEffect, useCallback } from 'react'
import {
  adminGetTestimonials,
  adminCreateTestimonial,
  adminUpdateTestimonial,
  adminDeleteTestimonial,
  adminReorderTestimonials,
} from '@/services/testimonials'
import { SortableList } from '@/components/admin/SortableList'
import { adminGetCourses } from '@/services/admin-courses'
import type { Testimonial, Course } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2, Save, MessageSquare, Video, Search } from 'lucide-react'

const emptyForm: Partial<Testimonial> & { is_active: boolean } = {
  student_name: '',
  type: 'text',
  content: '',
  course: '',
  is_active: true,
  order: 0,
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<Partial<Testimonial> & { is_active: boolean }>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [data, courseData] = await Promise.all([adminGetTestimonials(), adminGetCourses()])
      setTestimonials(data as Testimonial[])
      setCourses(courseData as Course[])
    } catch {
      toast.error('Erro ao carregar depoimentos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('testimonials', () => {
    loadData()
  })

  const handleNew = () => {
    setFormData({ ...emptyForm, order: testimonials.length })
    setImageFile(null)
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({ ...testimonial })
    setImageFile(null)
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFieldErrors({})
    try {
      const baseData: Record<string, unknown> = {
        student_name: formData.student_name || '',
        type: formData.type || 'text',
        content: formData.content || '',
        course: formData.course || '',
        is_active: formData.is_active,
        order: Number(formData.order) || 0,
      }

      if (imageFile) {
        const fd = new FormData()
        Object.entries(baseData).forEach(([key, value]) => {
          fd.append(key, String(value))
        })
        fd.append('student_image', imageFile)
        if (formData.id) {
          await adminUpdateTestimonial(formData.id, fd)
        } else {
          await adminCreateTestimonial(fd)
        }
      } else {
        if (formData.id) {
          await adminUpdateTestimonial(formData.id, baseData)
        } else {
          await adminCreateTestimonial(baseData)
        }
      }
      toast.success(formData.id ? 'Depoimento atualizado!' : 'Depoimento criado!')
      setDialogOpen(false)
      loadData()
    } catch (err) {
      const errors = extractFieldErrors(err)
      setFieldErrors(errors)
      if (Object.keys(errors).length === 0) toast.error('Erro ao salvar depoimento')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await adminDeleteTestimonial(deleteId)
      toast.success('Depoimento excluído!')
      loadData()
    } catch {
      toast.error('Erro ao excluir')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleToggle = async (testimonial: Testimonial) => {
    try {
      await adminUpdateTestimonial(testimonial.id, { is_active: !testimonial.is_active })
      loadData()
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleReorder = async (reordered: Testimonial[]) => {
    const updates = reordered.map((item, index) => ({ id: item.id, order: index + 1 }))
    try {
      await adminReorderTestimonials(updates)
    } catch (err) {
      toast.error('Erro ao reordenar. Tente novamente.')
      throw err
    }
    const orderMap = new Map(updates.map((u) => [u.id, u.order]))
    setTestimonials((prev) =>
      prev
        .map((item) => ({ ...item, order: orderMap.get(item.id) ?? item.order }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    )
  }

  const filtered = testimonials.filter((t) =>
    t.student_name.toLowerCase().includes(search.toLowerCase()),
  )
  const hasSearch = search.trim().length > 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Depoimentos</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Depoimento
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome do aluno..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card/50 border-border/50 p-12 text-center text-muted-foreground">
          Nenhum depoimento cadastrado.
        </Card>
      ) : (
        <SortableList
          items={filtered}
          keyExtractor={(t) => t.id}
          onReorder={handleReorder}
          disabled={hasSearch}
          renderItem={(testimonial, { dragHandle }) => (
            <Card className="flex items-center gap-2 p-4 bg-card/50 border-border/50">
              {dragHandle}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                {testimonial.type === 'video' ? (
                  <Video className="h-5 w-5 text-primary" />
                ) : (
                  <MessageSquare className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{testimonial.student_name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs capitalize">
                    {testimonial.type === 'video' ? 'Vídeo' : 'Texto'}
                  </Badge>
                  <Badge
                    variant={testimonial.is_active ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {testimonial.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {testimonial.expand?.course && (
                    <span className="text-xs truncate">{testimonial.expand.course.title}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Switch
                  checked={testimonial.is_active}
                  onCheckedChange={() => handleToggle(testimonial)}
                />
                <Button variant="ghost" size="icon" onClick={() => handleEdit(testimonial)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(testimonial.id)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Depoimento' : 'Novo Depoimento'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as 'text' | 'video' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nome do Aluno *</Label>
              <Input
                required
                value={formData.student_name || ''}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
              />
              {fieldErrors.student_name && (
                <p className="text-sm text-red-500">{fieldErrors.student_name}</p>
              )}
            </div>

            {formData.type === 'text' && (
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[120px]"
                  placeholder="Digite o depoimento do aluno..."
                />
                {fieldErrors.content && (
                  <p className="text-sm text-red-500">{fieldErrors.content}</p>
                )}
              </div>
            )}

            {formData.type === 'video' && (
              <div className="space-y-2">
                <Label>Link do YouTube</Label>
                <Input
                  type="url"
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {fieldErrors.content && (
                  <p className="text-sm text-red-500">{fieldErrors.content}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>{formData.type === 'video' ? 'Thumbnail' : 'Foto'}</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 400×400 px (formato quadrado)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Curso Relacionado</Label>
              <Select
                value={formData.course || 'none'}
                onValueChange={(v) => setFormData({ ...formData, course: v === 'none' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                />
                <Label>Ativo</Label>
              </div>
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
                )}{' '}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Depoimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este depoimento? Esta ação não pode ser desfeita.
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
