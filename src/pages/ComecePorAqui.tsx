import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getPreHypnosisForm } from '@/services/pre-hypnosis-forms'
import { getLifeWheelAssessments } from '@/services/life-wheel'
import { getCoursesWithProgress } from '@/services/courses'
import { getUserProgress, isLessonCompleted } from '@/services/user-progress'
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
import type { CourseWithProgress, LifeWheelAssessment, UserProgress } from '@/types'

interface LessonRef {
  id: string
  title: string
  courseId: string
}

export default function ComecePorAqui() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [formDone, setFormDone] = useState(false)
  const [preAssessmentDone, setPreAssessmentDone] = useState(false)
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [firstLesson, setFirstLesson] = useState<LessonRef | null>(null)
  const [firstAudio, setFirstAudio] = useState<LessonRef | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [form, assmts, courses, prog] = await Promise.all([
        getPreHypnosisForm(user.id),
        getLifeWheelAssessments(user.id),
        getCoursesWithProgress(user.id),
        getUserProgress(user.id),
      ])
      setFormDone(!!form)
      setPreAssessmentDone(assmts.some((a: LifeWheelAssessment) => a.type === 'pre'))
      setProgress(prog)

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
          if (moduleLessons[0])
            setFirstLesson({
              id: moduleLessons[0].id,
              title: moduleLessons[0].title,
              courseId: firstCourse.id,
            })
          if (moduleLessons[1])
            setFirstAudio({
              id: moduleLessons[1].id,
              title: moduleLessons[1].title,
              courseId: firstCourse.id,
            })
        }
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const step1Done = formDone
  const step2Done = preAssessmentDone
  const step3Done = firstLesson ? isLessonCompleted(progress, firstLesson.id) : false
  const step4Done = firstAudio ? isLessonCompleted(progress, firstAudio.id) : false

  const steps = [
    {
      num: 1,
      title: 'Formulário Pré-Hipnose',
      icon: ClipboardList,
      desc: 'Preencha o formulário inicial',
      cta: 'Preencher formulário',
      done: step1Done,
      unlocked: true,
      canAct: true,
      action: () => navigate('/dashboard/pre-hipnose'),
    },
    {
      num: 2,
      title: 'Roda da Vida',
      icon: CircleDot,
      desc: 'Complete a avaliação pré-tratamento',
      cta: 'Fazer avaliação',
      done: step2Done,
      unlocked: step1Done,
      canAct: true,
      action: () => navigate('/dashboard/roda-da-vida'),
    },
    {
      num: 3,
      title: 'Primeira Aula',
      icon: PlayCircle,
      desc: firstLesson?.title || 'Nenhuma aula disponível',
      cta: 'Assistir aula',
      done: step3Done,
      unlocked: step2Done,
      canAct: !!firstLesson,
      action: () =>
        firstLesson &&
        navigate(`/dashboard/curso/${firstLesson.courseId}?lesson=${firstLesson.id}`),
    },
    {
      num: 4,
      title: 'Primeiro Áudio',
      icon: Headphones,
      desc: firstAudio?.title || 'Nenhum áudio disponível',
      cta: 'Ouvir áudio',
      done: step4Done,
      unlocked: step3Done,
      canAct: !!firstAudio,
      action: () =>
        firstAudio && navigate(`/dashboard/curso/${firstAudio.courseId}?lesson=${firstAudio.id}`),
    },
  ]

  const activeStepNum = steps.find((s) => s.unlocked && !s.done)?.num

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
        {steps.map((step) => {
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
                  disabled={isLocked || step.done || !step.canAct}
                  onClick={step.action}
                  className="w-full"
                >
                  {isLocked ? (
                    <>
                      <Lock className="mr-1 h-3 w-3" /> Bloqueado
                    </>
                  ) : step.done ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Concluído
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
    </div>
  )
}
