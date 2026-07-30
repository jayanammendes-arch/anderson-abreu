import { useState, useEffect } from 'react'
import {
  getOnboardingConfig,
  updateOnboardingConfig,
  createOnboardingConfig,
  getCoverImageUrl,
} from '@/services/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SortableList } from '@/components/admin/SortableList'
import { Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { getForms } from '@/services/forms'
import type { OnboardingConfig, OnboardingStep, Course, Module, Lesson, FormConfig } from '@/types'

const STEP_TYPES = [
  { value: 'form', label: 'Formulário Pré-Hipnose' },
  { value: 'life_wheel', label: 'Roda da Vida' },
  { value: 'lesson', label: 'Aula' },
  { value: 'audio', label: 'Áudio' },
]

const genId = () => Math.random().toString(36).substring(2, 9)

const ensureIds = (steps: OnboardingStep[]): OnboardingStep[] =>
  steps.map((s) => ({ ...s, id: s.id || genId() }))

export default function AdminOnboarding() {
  const [config, setConfig] = useState<OnboardingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [forms, setForms] = useState<FormConfig[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [cfg, c, m, l, f] = await Promise.all([
          getOnboardingConfig(),
          pb.collection('courses').getFullList({ sort: 'order' }),
          pb.collection('modules').getFullList({ sort: 'order' }),
          pb.collection('lessons').getFullList({ sort: 'order' }),
          getForms(),
        ])
        setCourses(c as Course[])
        setModules(m as Module[])
        setLessons(l as Lesson[])
        setForms(f as FormConfig[])
        if (cfg) {
          setConfig(cfg)
          setTitle(cfg.title || '')
          setSubtitle(cfg.subtitle || '')
          setIsActive(cfg.is_active !== false)
          setSteps(ensureIds(Array.isArray(cfg.steps) ? cfg.steps : []))
        } else {
          setSteps(
            ensureIds([
              { type: 'form', label: 'Formulário Pré-Hipnose' },
              { type: 'life_wheel', label: 'Roda da Vida' },
              { type: 'lesson', label: 'Primeira Aula' },
              { type: 'audio', label: 'Primeiro Áudio' },
            ]),
          )
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const lessonsForCourse = (courseId?: string): Lesson[] => {
    if (!courseId) return []
    const moduleIds = modules.filter((m) => m.course === courseId).map((m) => m.id)
    return lessons.filter((l) => moduleIds.includes(l.module))
  }

  const updateStep = (id: string, patch: Partial<OnboardingStep>) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))

  const addStep = () =>
    setSteps((prev) => [...prev, { id: genId(), type: 'lesson', label: 'Nova Etapa' }])

  const removeStep = (id: string) => setSteps((prev) => prev.filter((s) => s.id !== id))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('subtitle', subtitle)
      fd.append('is_active', String(isActive))
      fd.append('steps', JSON.stringify(steps))
      if (coverImage) fd.append('cover_image', coverImage)
      if (config) await updateOnboardingConfig(config.id, fd)
      else await createOnboardingConfig(fd)
      toast.success('Configuração salva com sucesso!')
    } catch {
      toast.error('Erro ao salvar')
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

  const coverUrl = config ? getCoverImageUrl(config) : null

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Comece por Aqui — Onboarding</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure a jornada de onboarding dos alunos.
        </p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Ativar Onboarding</Label>
              <p className="text-sm text-muted-foreground">
                Habilita ou desabilita a jornada para os alunos.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            {(coverUrl || coverImage) && (
              <img
                src={coverImage ? URL.createObjectURL(coverImage) : coverUrl!}
                alt="Capa"
                className="h-40 w-full rounded-lg object-cover"
              />
            )}
            <Input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 1920×600 px (JPG/PNG, até 5MB)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Comece por Aqui"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtítulo</Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Sua jornada de transformação"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Etapas da Jornada</Label>
              <p className="text-sm text-muted-foreground">Arraste para reordenar.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addStep}>
              <Plus className="mr-1 h-4 w-4" /> Adicionar
            </Button>
          </div>

          <SortableList
            items={steps}
            keyExtractor={(s) => s.id || genId()}
            onReorder={setSteps}
            renderItem={(step, { dragHandle }) => (
              <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-card p-4">
                {dragHandle}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={step.type}
                      onValueChange={(v) =>
                        updateStep(step.id!, { type: v as OnboardingStep['type'] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STEP_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Rótulo</Label>
                    <Input
                      value={step.label}
                      onChange={(e) => updateStep(step.id!, { label: e.target.value })}
                    />
                  </div>
                  {step.type === 'form' && (
                    <div className="space-y-1">
                      <Label className="text-xs">Formulário</Label>
                      <Select
                        value={step.form_id || ''}
                        onValueChange={(v) => updateStep(step.id!, { form_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar formulário" />
                        </SelectTrigger>
                        <SelectContent>
                          {forms.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {(step.type === 'lesson' || step.type === 'audio') && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">Curso</Label>
                        <Select
                          value={step.courseId || ''}
                          onValueChange={(v) => updateStep(step.id!, { courseId: v, lessonId: '' })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar curso" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Aula</Label>
                        <Select
                          value={step.lessonId || ''}
                          onValueChange={(v) => updateStep(step.id!, { lessonId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar aula" />
                          </SelectTrigger>
                          <SelectContent>
                            {lessonsForCourse(step.courseId).map((l) => (
                              <SelectItem key={l.id} value={l.id}>
                                {l.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStep(step.id!)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>
    </form>
  )
}
