import { useState, useEffect, useCallback } from 'react'
import {
  adminGetModules,
  adminCreateModule,
  adminUpdateModule,
  adminDeleteModule,
  adminGetLessons,
  adminDeleteLesson,
} from '@/services/admin-courses'
import { SimpleFileManager } from '@/components/admin/SimpleFileManager'
import { LessonFormDialog } from '@/components/admin/LessonFormDialog'
import { QuizManager } from '@/components/admin/QuizManager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Plus, Trash2, Pencil, Loader2, FileText, FileQuestion } from 'lucide-react'
import { toast } from 'sonner'
import type { Module, Lesson } from '@/types'

export function ModuleManager({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<Module[]>([])
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({})
  const [loading, setLoading] = useState(true)
  const [modDialog, setModDialog] = useState<{ open: boolean; edit: Module | null }>({
    open: false,
    edit: null,
  })
  const [modTitle, setModTitle] = useState('')
  const [modDescription, setModDescription] = useState('')
  const [modOrder, setModOrder] = useState(0)
  const [lessonDialog, setLessonDialog] = useState<{
    open: boolean
    moduleId: string
    lessonId: string | null
  }>({ open: false, moduleId: '', lessonId: null })

  const loadData = useCallback(async () => {
    try {
      const mods = await adminGetModules(courseId)
      setModules(mods)
      const lMap: Record<string, Lesson[]> = {}
      for (const m of mods) lMap[m.id] = await adminGetLessons(m.id)
      setLessonsMap(lMap)
    } catch {
      toast.error('Erro ao carregar módulos')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveModule = async () => {
    try {
      if (modDialog.edit) {
        await adminUpdateModule(modDialog.edit.id, {
          title: modTitle,
          description: modDescription,
          order: modOrder,
        })
      } else {
        await adminCreateModule({
          course: courseId,
          title: modTitle,
          description: modDescription,
          order: modOrder,
        })
      }
      toast.success('Módulo salvo')
      setModDialog({ open: false, edit: null })
      loadData()
    } catch {
      toast.error('Erro ao salvar módulo')
    }
  }

  const delModule = async (id: string) => {
    if (!confirm('Excluir módulo e todas as suas aulas?')) return
    try {
      await adminDeleteModule(id)
      toast.success('Módulo excluído')
      loadData()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const delLesson = async (id: string) => {
    try {
      await adminDeleteLesson(id)
      toast.success('Aula excluída')
      loadData()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const openLesson = (moduleId: string, lessonId: string | null) => {
    setLessonDialog({ open: true, moduleId, lessonId })
  }

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )

  const currentLesson = lessonDialog.lessonId
    ? (lessonsMap[lessonDialog.moduleId] || []).find((l) => l.id === lessonDialog.lessonId) || null
    : null

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Módulos e Aulas</h3>
        <Button
          size="sm"
          onClick={() => {
            setModTitle('')
            setModDescription('')
            setModOrder(modules.length)
            setModDialog({ open: true, edit: null })
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Módulo
        </Button>
      </div>
      {modules.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum módulo cadastrado.</p>
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
                <div className="space-y-4 pt-2">
                  {mod.description && (
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                  )}
                  {(lessonsMap[mod.id] || []).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-lg border border-border/30 p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openLesson(mod.id, lesson.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => delLesson(lesson.id)}
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
                    onClick={() => openLesson(mod.id, null)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Aula
                  </Button>
                  <div className="rounded-lg border border-border/30 p-3 space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Materiais do Módulo (PDF)
                    </p>
                    <SimpleFileManager
                      collection="modules"
                      recordId={mod.id}
                      field="materials"
                      files={mod.materials || []}
                      onUpdated={loadData}
                    />
                  </div>
                  <div className="rounded-lg border border-border/30 p-3 space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <FileQuestion className="h-4 w-4 text-primary" /> Prova do Módulo
                    </p>
                    <QuizManager moduleId={mod.id} />
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setModTitle(mod.title)
                        setModDescription(mod.description || '')
                        setModOrder(mod.order || 0)
                        setModDialog({ open: true, edit: mod })
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Renomear
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => delModule(mod.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir Módulo
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      <Dialog
        open={modDialog.open}
        onOpenChange={(o) => {
          if (!o) {
            setModDialog({ open: false, edit: null })
            setModTitle('')
            setModDescription('')
            setModOrder(0)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modDialog.edit ? 'Editar Módulo' : 'Novo Módulo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Título do Módulo</Label>
            <Input
              value={modTitle}
              onChange={(e) => setModTitle(e.target.value)}
              placeholder="Ex: Módulo 1 - Fundamentos"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={modDescription}
              onChange={(e) => setModDescription(e.target.value)}
              placeholder="Resumo do módulo"
            />
          </div>
          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input
              type="number"
              value={modOrder}
              onChange={(e) => setModOrder(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button onClick={saveModule} className="bg-green-600 hover:bg-green-700 text-white">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LessonFormDialog
        open={lessonDialog.open}
        moduleId={lessonDialog.moduleId}
        lesson={currentLesson}
        lessonCount={lessonsMap[lessonDialog.moduleId]?.length || 0}
        onClose={() => setLessonDialog({ open: false, moduleId: '', lessonId: null })}
        onSaved={loadData}
      />
    </div>
  )
}
