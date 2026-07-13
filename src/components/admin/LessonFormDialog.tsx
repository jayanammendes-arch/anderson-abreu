import { useState, useEffect, useRef } from 'react'
import { adminCreateLesson, adminUpdateLesson } from '@/services/admin-courses'
import { SimpleFileManager } from '@/components/admin/SimpleFileManager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Radio, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Lesson } from '@/types'

interface LessonFormDialogProps {
  open: boolean
  moduleId: string
  lesson: Lesson | null
  lessonCount: number
  onClose: () => void
  onSaved: () => void
}

export function LessonFormDialog({
  open,
  moduleId,
  lesson,
  lessonCount,
  onClose,
  onSaved,
}: LessonFormDialogProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    video_url: '',
    duration: '',
    order: 0,
    content: '',
    is_live: false,
  })
  const prevOpen = useRef(false)

  useEffect(() => {
    if (open && !prevOpen.current) {
      setForm(
        lesson
          ? {
              title: lesson.title,
              description: lesson.description || '',
              video_url: lesson.video_url || '',
              duration: lesson.duration || '',
              order: lesson.order,
              content: lesson.content || '',
              is_live: lesson.is_live || false,
            }
          : {
              title: '',
              description: '',
              video_url: '',
              duration: '',
              order: lessonCount,
              content: '',
              is_live: false,
            },
      )
    }
    prevOpen.current = open
  }, [open, lesson, lessonCount])

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (lesson) {
        await adminUpdateLesson(lesson.id, form)
      } else {
        await adminCreateLesson({ ...form, module: moduleId })
      }
      toast.success('Aula salva')
      onClose()
      onSaved()
    } catch {
      toast.error('Erro ao salvar aula')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{lesson ? 'Editar Aula' : 'Nova Aula'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Resumo da aula"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Link do Vídeo</Label>
              <Input
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                placeholder="YouTube/Vimeo URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Duração</Label>
              <Input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="Ex: 15:30"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Switch
              checked={form.is_live}
              onCheckedChange={(c) => setForm({ ...form, is_live: c })}
            />
            <Label className="flex items-center gap-1 cursor-pointer">
              <Radio className="h-4 w-4 text-red-500" /> Aula ao vivo (Live)
            </Label>
          </div>
          <div className="space-y-2">
            <Label>Conteúdo (opcional)</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="h-24"
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
          {lesson && (
            <div className="rounded-lg border border-border/30 p-3 space-y-2">
              <p className="text-sm font-semibold">Materiais (PDF)</p>
              <SimpleFileManager
                collection="lessons"
                recordId={lesson.id}
                field="materials"
                files={lesson.materials || []}
                onUpdated={onSaved}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Aula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
