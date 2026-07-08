import { useState, useEffect, useCallback } from 'react'
import {
  adminGetModules,
  adminCreateModule,
  adminUpdateModule,
  adminDeleteModule,
  adminGetLessons,
  adminCreateLesson,
  adminUpdateLesson,
  adminDeleteLesson,
} from '@/services/admin-courses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Module, Lesson } from '@/types'

export function ModuleManager({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<Module[]>([])
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({})
  const [loading, setLoading] = useState(true)
  const [moduleDialog, setModuleDialog] = useState<{ open: boolean; edit: Module | null }>({
    open: false,
    edit: null,
  })
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleOrder, setModuleOrder] = useState(0)
  const [lessonDialog, setLessonDialog] = useState<{
    open: boolean
    moduleId: string
    edit: Lesson | null
  }>({ open: false, moduleId: '', edit: null })
  const [lessonForm, setLessonForm] = useState({
    title: '',
    video_url: '',
    duration: '',
    order: 0,
    content: '',
  })

  const loadData = useCallback(async () => {
    try {
      const mods = await adminGetModules(courseId)
      setModules(mods)
      const lMap: Record<string, Lesson[]> = {}
      for (const m of mods) lMap[m.id] = await adminGetLessons(m.id)
      setLessonsMap(lMap)
    } catch {
      toast.error('Erro ao carregar modulos')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveModule = async () => {
    try {
      if (moduleDialog.edit) {
        await adminUpdateModule(moduleDialog.edit.id, { title: moduleTitle, order: moduleOrder })
      } else {
        await adminCreateModule({ course: courseId, title: moduleTitle, order: moduleOrder })
      }
      toast.success('Modulo salvo')
      setModuleDialog({ open: false, edit: null })
      loadData()
    } catch {
      toast.error('Erro ao salvar modulo')
    }
  }

  const deleteModule = async (id: string) => {
    if (!confirm('Excluir modulo e todas as suas aulas?')) return
    try {
      await adminDeleteModule(id)
      toast.success('Modulo excluido')
      loadData()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const saveLesson = async () => {
    try {
      const { moduleId, edit } = lessonDialog
      if (edit) {
        await adminUpdateLesson(edit.id, lessonForm)
      } else {
        const existing = lessonsMap[moduleId] || []
        await adminCreateLesson({ ...lessonForm, module: moduleId, order: existing.length })
      }
      toast.success('Aula salva')
      setLessonDialog({ open: false, moduleId: '', edit: null })
      loadData()
    } catch {
      toast.error('Erro ao salvar aula')
    }
  }

  const deleteLesson = async (id: string) => {
    try {
      await adminDeleteLesson(id)
      toast.success('Aula excluida')
      loadData()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Modulos e Aulas</h3>
        <Button
          size="sm"
          onClick={() => {
            setModuleTitle('')
            setModuleOrder(modules.length)
            setModuleDialog({ open: true, edit: null })
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Modulo
        </Button>
      </div>
      {modules.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum modulo cadastrado.</p>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {modules.map((mod) => (
            <AccordionItem key={mod.id} value={mod.id} className="border-border/50 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium">{mod.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {(lessonsMap[mod.id] || []).length} aulas
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {(lessonsMap[mod.id] || []).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-lg border border-border/30 p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.duration || 'Sem duracao'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setLessonForm({
                            title: lesson.title,
                            video_url: lesson.video_url || '',
                            duration: lesson.duration || '',
                            order: lesson.order,
                            content: lesson.content || '',
                          })
                          setLessonDialog({ open: true, moduleId: mod.id, edit: lesson })
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLesson(lesson.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setLessonForm({
                        title: '',
                        video_url: '',
                        duration: '',
                        order: 0,
                        content: '',
                      })
                      setLessonDialog({ open: true, moduleId: mod.id, edit: null })
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Aula
                  </Button>
                  <div className="flex gap-2 pt-2 border-t border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setModuleTitle(mod.title)
                        setModuleOrder(mod.order || 0)
                        setModuleDialog({ open: true, edit: mod })
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Renomear
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteModule(mod.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir Modulo
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      <Dialog
        open={moduleDialog.open}
        onOpenChange={(o) => {
          if (!o) {
            setModuleDialog({ open: false, edit: null })
            setModuleTitle('')
            setModuleOrder(0)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{moduleDialog.edit ? 'Renomear Modulo' : 'Novo Modulo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Titulo do Modulo</Label>
            <Input
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="Ex: Modulo 1 - Fundamentos"
            />
          </div>
          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input
              type="number"
              value={moduleOrder}
              onChange={(e) => setModuleOrder(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button onClick={saveModule}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={lessonDialog.open}
        onOpenChange={(o) => {
          if (!o) setLessonDialog({ open: false, moduleId: '', edit: null })
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{lessonDialog.edit ? 'Editar Aula' : 'Nova Aula'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titulo</Label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Link do Video</Label>
                <Input
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  placeholder="YouTube/Vimeo URL"
                />
              </div>
              <div className="space-y-2">
                <Label>Duracao</Label>
                <Input
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  placeholder="Ex: 15:30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conteudo (opcional)</Label>
              <Textarea
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                className="h-24"
              />
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={lessonForm.order}
                onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveLesson}>Salvar Aula</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
