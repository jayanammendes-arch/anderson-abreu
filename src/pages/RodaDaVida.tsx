import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { getOnboardingConfig } from '@/services/onboarding'
import { getFormSubmission } from '@/services/forms'
import { getPreHypnosisForm } from '@/services/pre-hypnosis-forms'
import {
  getLifeWheelCategories,
  getLifeWheelQuestions,
  getLifeWheelAssessments,
  saveLifeWheelAssessment,
  downloadLifeWheelPdf,
  downloadLifeWheelComparisonPdf,
} from '@/services/life-wheel'
import { LifeWheelChart, type ChartData } from '@/components/life-wheel/LifeWheelChart'
import { LifeWheelForm } from '@/components/life-wheel/LifeWheelForm'
import { LifeWheelAssessmentCard } from '@/components/life-wheel/LifeWheelAssessmentCard'
import { LifeWheelComparison } from '@/components/life-wheel/LifeWheelComparison'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, ClipboardList, ArrowLeft } from 'lucide-react'
import type {
  LifeWheelCategory,
  LifeWheelQuestion,
  LifeWheelAssessment,
  OnboardingStep,
} from '@/types'

const DEFAULT_STEPS: OnboardingStep[] = [
  { type: 'form', label: 'Formulário Pré-Hipnose' },
  { type: 'life_wheel', label: 'Roda da Vida' },
  { type: 'lesson', label: 'Primeira Aula' },
  { type: 'audio', label: 'Primeiro Áudio' },
]

export default function RodaDaVida() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<LifeWheelCategory[]>([])
  const [questions, setQuestions] = useState<LifeWheelQuestion[]>([])
  const [assessments, setAssessments] = useState<LifeWheelAssessment[]>([])
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [chartAssessment, setChartAssessment] = useState<LifeWheelAssessment | null>(null)

  const checkFormCompleted = useCallback(async (userId: string) => {
    const cfg = await getOnboardingConfig()
    const formSteps = (cfg?.steps || DEFAULT_STEPS).filter((s) => s.type === 'form')
    const stepsWithFormId = formSteps.filter((s) => s.form_id)
    const stepsWithoutFormId = formSteps.filter((s) => !s.form_id)

    if (stepsWithFormId.length > 0) {
      const submission = await getFormSubmission(userId, stepsWithFormId[0].form_id!)
      return !!submission
    }

    if (stepsWithoutFormId.length > 0) {
      const preHypnosisForm = await getPreHypnosisForm(userId)
      return !!preHypnosisForm
    }

    // Se não há steps de formulário configurados, permite o acesso
    return true
  }, [])

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const isFormDone = await checkFormCompleted(user.id)
      if (!isFormDone) {
        toast.info('Complete o formulário inicial antes de acessar a Roda da Vida.')
        navigate('/dashboard/comece-por-aqui', { replace: true })
        return
      }

      const [cats, qs, assmts] = await Promise.all([
        getLifeWheelCategories(),
        getLifeWheelQuestions(),
        getLifeWheelAssessments(user.id),
      ])
      setCategories(cats)
      setQuestions(qs)
      setAssessments(assmts)
      setAnswers({})
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [user, checkFormCompleted, navigate])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('life_wheel_assessments', () => {
    loadData()
  })

  const buildChartData = (a: LifeWheelAssessment): ChartData[] =>
    categories.map((cat) => ({ category: cat.name, score: a.scores?.[cat.id] ?? 0 }))

  const handleSubmit = async () => {
    if (!user) return
    setSubmitting(true)
    try {
      const scores: Record<string, number> = {}
      categories.forEach((cat) => {
        const catQs = questions.filter((q) => q.category === cat.id)
        const avg = catQs.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0) / (catQs.length || 1)
        scores[cat.id] = Math.round(avg * 10) / 10
      })
      const allScores = Object.values(scores)
      scores.overall_average =
        Math.round((allScores.reduce((a, b) => a + b, 0) / (allScores.length || 1)) * 10) / 10
      const type = assessments.length === 0 ? 'pre' : 'post'
      await saveLifeWheelAssessment({ user: user.id, type, scores })
      setShowForm(false)
      await loadData()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Nova Avaliação</h1>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
        <LifeWheelForm
          categories={categories}
          questions={questions}
          answers={answers}
          onAnswerChange={(qId, val) => setAnswers((p) => ({ ...p, [qId]: val }))}
          onSubmit={handleSubmit}
          submitLabel={
            assessments.length === 0 ? 'Salvar Avaliação Inicial (Pré)' : 'Salvar Avaliação (Pós)'
          }
          submitting={submitting}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roda da Vida</h1>
          <p className="text-muted-foreground">Avalie sua vida antes e depois do tratamento</p>
        </div>
        <Button
          onClick={() => {
            setAnswers({})
            setShowForm(true)
          }}
        >
          <ClipboardList className="mr-2 h-4 w-4" /> Nova Avaliação
        </Button>
      </div>

      {assessments.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Nenhuma avaliação realizada. Clique em "Nova Avaliação" para começar.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assessments.map((a) => (
            <LifeWheelAssessmentCard
              key={a.id}
              assessment={a}
              categories={categories}
              chartData={buildChartData(a)}
              onViewChart={() => setChartAssessment(a)}
              onDownloadPdf={() => downloadLifeWheelPdf(a.id)}
            />
          ))}
        </div>
      )}

      {assessments.length >= 2 && (
        <LifeWheelComparison
          assessments={assessments}
          categories={categories}
          onDownloadComparison={(id1, id2) => downloadLifeWheelComparisonPdf(id1, id2)}
        />
      )}

      <Dialog open={!!chartAssessment} onOpenChange={(open) => !open && setChartAssessment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Avaliação {chartAssessment?.type === 'pre' ? 'Pré' : 'Pós'}-Tratamento
            </DialogTitle>
          </DialogHeader>
          {chartAssessment && <LifeWheelChart data={buildChartData(chartAssessment)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
