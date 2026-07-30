import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getOnboardingConfig } from '@/services/onboarding'
import { getPreHypnosisForm } from '@/services/pre-hypnosis-forms'
import { getLifeWheelAssessments } from '@/services/life-wheel'
import { getCoursesWithProgress } from '@/services/courses'
import { getUserProgress, isLessonCompleted } from '@/services/user-progress'
import { getFormSubmission } from '@/services/forms'
import { DynamicForm } from '@/components/DynamicForm'
import { LevelBadge } from '@/components/LevelBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  Lock,
  Unlock,
  CheckCircle2,
  ClipboardList,
  CircleDot,
  PlayCircle,
  Headphones,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  CourseWithProgress,
  LifeWheelAssessment,
  UserProgress,
  OnboardingConfig,
  OnboardingStep,
} from '@/types'

const DEFAULT_STEPS: OnboardingStep[] = [
  { type: 'form', label: 'Formulário Pré-Hipnose' },
  { type: 'life_wheel', label: 'Roda da Vida' },
  { type: 'lesson', label: 'Primeira Aula' },
  { type: 'audio', label: 'Primeiro Áudio' },
]

const STEP_ICONS: Record<string, typeof ClipboardList> = {
  form: ClipboardList,
  life_wheel: CircleDot,
  lesson: PlayCircle,
  audio: Headphones,
}

const STEP_CTAS: Record<string, string> = {
  form: 'Preencher formulário',
  life_wheel: 'Fazer avaliação',
  lesson: 'Assistir aula',
  audio: 'Ouvir áudio',
}

const STEP_DESCS: Record<string, string> = {
  form: 'Preencha o formulário inicial',
  life_wheel: 'Complete a avaliação pré-tratamento',
  lesson: 'Assista à primeira aula do curso',
  audio: 'Ouça o primeiro áudio do curso',
}

interface LessonRef {
  id: string
  title: string
  courseId: string
}

export default function ComecePorAqui() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<OnboardingConfig | null>(null)
  const [formDone, setFormDone] = useState(false)
  const [preAssessmentDone, setPreAssessmentDone] = useState(false)
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [courses, setCourses] = useState<CourseWithProgress[]>([])
  const [activeFormId, setActiveFormId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [cfg, assmts, crs, prog] = await Promise.all([
        getOnboardingConfig(),
        getLifeWheelAssessments(user.id),
        getCoursesWithProgress(user.id),
        getUserProgress(user.id),
      ])
      setConfig(cfg)
      setPreAssessmentDone(assmts.some((a: LifeWheelAssessment) => a.type === 'pre'))
      setCourses(crs)
      setProgress(prog)
      const formStep = (cfg?.steps || DEFAULT_STEPS).find((s) => s.type === 'form')
      if (formStep?.form_id) {
        const submission = await getFormSubmission(user.id, formStep.form_id)
        setFormDone(!!submission)
      } else {
        const form = await getPreHypnosisForm(user.id)
        setFormDone(!!form)
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('pre_hypnosis_forms', () => loadData())
  useRealtime('life_wheel_assessments', () => loadData())
  useRealtime('user_progress', () => loadData())
  useRealtime('onboarding_config', () => loadData())
  useRealtime('form_submissions', () => loadData())

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (config && !config.is_active) {
    return (
      <div className="flex h-96 items-center justify-center animate-fade-in">
        <div className="text-center space-y-2">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">
            A jornada de onboarding ainda não está disponível.
          </p>
        </div>
      </div>
    )
  }

  const steps = config?.steps || DEFAULT_STEPS

  let prevDone = true
  const displaySteps = steps.map((step, index) => {
    const Icon = STEP_ICONS[step.type] || ClipboardList
    let done = false
    let canAct = true
    let desc = STEP_DESCS[step.type] || ''
    let lessonRef: LessonRef | null = null

    if (step.type === 'form') {
      done = formDone
    } else if (step.type === 'life_wheel') {
      done = preAssessmentDone
    } else if (step.type === 'lesson' || step.type === 'audio') {
      if (step.lessonId) {
        for (const c of courses) {
          const found = c.lessons.find((l) => l.id === step.lessonId)
          if (found) {
            lessonRef = { id: found.id, title: found.title, courseId: c.id }
            break
          }
        }
      } else {
        const sortedCourses = [...courses].sort((a, b) => (a.order || 0) - (b.order || 0))
        const firstCourse = sortedCourses.find((c) => c.lessons?.length > 0)
        if (firstCourse) {
          const sortedModules = [...firstCourse.modules].sort(
            (a, b) => (a.order || 0) - (b.order || 0),
          )
          const firstModule = sortedModules[0]
          if (firstModule) {
            const moduleLessons = firstCourse.lessons
              .filter((l) => l.module === firstModule.id)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
            const idx = step.type === 'audio' ? 1 : 0
            if (moduleLessons[idx]) {
              lessonRef = {
                id: moduleLessons[idx].id,
                title: moduleLessons[idx].title,
                courseId: firstCourse.id,
              }
            }
          }
        }
      }
      done = lessonRef ? isLessonCompleted(progress, lessonRef.id) : false
      canAct = !!lessonRef
      desc = lessonRef?.title || 'Nenhuma aula disponível'
    }

    const unlocked = prevDone
    prevDone = done

    return {
      num: index + 1,
      title: step.label,
      icon: Icon,
      desc,
      cta: STEP_CTAS[step.type] || 'Iniciar',
      done,
      unlocked,
      canAct,
      action: () => {
        if (step.type === 'form') {
          if (step.form_id) setActiveFormId(step.form_id)
          else navigate('/dashboard/pre-hipnose')
        } else if (step.type === 'life_wheel') navigate('/dashboard/roda-da-vida')
        else if (lessonRef)
          navigate(`/dashboard/curso/${lessonRef.courseId}?lesson=${lessonRef.id}`)
      },
    }
  })

  const activeStepNum = displaySteps.find((s) => s.unlocked && !s.done)?.num

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comece por Aqui</h1>
          <p className="text-muted-foreground mt-2">
            Sua jornada passo a passo. Complete cada etapa para desbloquear a próxima.
          </p>
        </div>
        {user?.level && <LevelBadge level={user.level} size="md" />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displaySteps.map((step) => {
          const Icon = step.icon
          const isLocked = !step.unlocked
          const isActive = step.num === activeStepNum
          return (
            <Card
              key={step.num}
              className={cn(
                'border-border/50 transition-all',
                isLocked && 'opacity-60',
                step.done && 'border-green-500/30 bg-green-500/5',
                isActive && !step.done && 'border-primary/50 ring-2 ring-primary/20',
              )}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      step.done
                        ? 'bg-green-500/20 text-green-600'
                        : isLocked
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/10 text-primary',
                    )}
                  >
                    {step.done ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Passo {step.num}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{step.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
                <Button
                  size="sm"
                  variant={isLocked ? 'secondary' : 'default'}
                  disabled={
                    isLocked ||
                    (step.done && !(step.type === 'form' && step.form_id)) ||
                    !step.canAct
                  }
                  onClick={step.action}
                  className="w-full"
                >
                  {isLocked ? (
                    <>
                      <Lock className="mr-1 h-3 w-3" /> Bloqueado
                    </>
                  ) : step.done ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />{' '}
                      {step.type === 'form' && step.form_id ? 'Ver Resumo' : 'Concluído'}
                    </>
                  ) : (
                    <>
                      {step.cta} <ChevronRight className="ml-1 h-3 w-3" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="rounded-lg border border-border/50 bg-card/50 p-4 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Unlock className="h-4 w-4 text-primary" />
          Complete cada etapa na ordem para desbloquear a próxima. Seu progresso é salvo
          automaticamente.
        </p>
      </div>

      {activeFormId && user && (
        <DynamicForm formId={activeFormId} userId={user.id} onSubmitted={() => loadData()} />
      )}
    </div>
  )
}
