import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getPreHypnosisForm } from '@/services/pre-hypnosis-forms'
import { getLifeWheelAssessments } from '@/services/life-wheel'
import { getCoursesWithProgress } from '@/services/courses'
import { isLessonCompleted } from '@/services/user-progress'
import { LevelBadge } from '@/components/LevelBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
import type { CourseWithProgress, LifeWheelAssessment } from '@/types'

interface StepState {
  unlocked: boolean
  completed: boolean
  progress: number
}

export default function ComecePorAqui() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [formCompleted, setFormCompleted] = useState(false)
  const [assessments, setAssessments] = useState<LifeWheelAssessment[]>([])
  const [prataCourses, setPrataCourses] = useState<CourseWithProgress[]>([])

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [form, assmts, courses] = await Promise.all([
        getPreHypnosisForm(user.id),
        getLifeWheelAssessments(user.id),
        getCoursesWithProgress(user.id),
      ])
      setFormCompleted(!!form?.completed)
      setAssessments(assmts)
      setPrataCourses(courses.filter((c) => c.level === 'Prata'))
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const step1: StepState = {
    unlocked: true,
    completed: formCompleted,
    progress: formCompleted ? 100 : 0,
  }
  const step2: StepState = {
    unlocked: step1.completed,
    completed: assessments.length >= 1,
    progress: Math.min((assessments.length / 2) * 100, 100),
  }
  const totalPrataLessons = prataCourses.reduce((sum, c) => sum + c.totalLessons, 0)
  const completedPrataLessons = prataCourses.reduce((sum, c) => sum + c.completedCount, 0)
  const step3: StepState = {
    unlocked: step2.completed,
    completed: totalPrataLessons > 0 && completedPrataLessons === totalPrataLessons,
    progress:
      totalPrataLessons > 0 ? Math.round((completedPrataLessons / totalPrataLessons) * 100) : 0,
  }
  const step4: StepState = { unlocked: step3.completed, completed: false, progress: 0 }

  const steps = [
    {
      num: 1,
      title: 'Formulário Pré-Hipnose',
      icon: ClipboardList,
      state: step1,
      desc: 'Preencha o formulário inicial',
      cta: step1.completed ? 'Editar formulário' : 'Preencher formulário',
      action: () => navigate('/dashboard/pre-hipnose'),
    },
    {
      num: 2,
      title: 'Roda da Vida',
      icon: CircleDot,
      state: step2,
      desc: `Avaliações: ${assessments.length}/2`,
      cta: 'Fazer avaliação',
      action: () => navigate('/dashboard/roda-da-vida'),
    },
    {
      num: 3,
      title: 'Aulas',
      icon: PlayCircle,
      state: step3,
      desc: `${completedPrataLessons}/${totalPrataLessons} aulas concluídas`,
      cta: prataCourses.length > 0 ? 'Assistir aulas' : 'Em breve',
      action: () => prataCourses[0] && navigate(`/dashboard/curso/${prataCourses[0].id}`),
    },
    {
      num: 4,
      title: 'Áudios',
      icon: Headphones,
      state: step4,
      desc: 'Materiais de áudio finais',
      cta: 'Em breve',
      action: () => {},
    },
  ]

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
          const isLocked = !step.state.unlocked
          return (
            <Card
              key={step.num}
              className={cn(
                'border-border/50 transition-all',
                isLocked && 'opacity-60',
                step.state.completed && 'border-green-500/30 bg-green-500/5',
              )}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      step.state.completed
                        ? 'bg-green-500/20 text-green-600'
                        : isLocked
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/10 text-primary',
                    )}
                  >
                    {step.state.completed ? (
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
                {step.state.unlocked && !step.state.completed && step.state.progress > 0 && (
                  <Progress value={step.state.progress} className="h-1.5" />
                )}
                <Button
                  size="sm"
                  variant={isLocked ? 'secondary' : 'default'}
                  disabled={isLocked || step.num === 4}
                  onClick={step.action}
                  className="w-full"
                >
                  {isLocked ? (
                    <>
                      <Lock className="mr-1 h-3 w-3" /> Bloqueado
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
