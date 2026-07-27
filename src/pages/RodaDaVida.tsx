import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
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
import type { LifeWheelCategory, LifeWheelQuestion, LifeWheelAssessment } from '@/types'

export default function RodaDaVida() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<LifeWheelCategory[]>([])
  const [questions, setQuestions] = useState<LifeWheelQuestion[]>([])
  const [assessments, setAssessments] = useState<LifeWheelAssessment[]>([])
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [chartAssessment, setChartAssessment] = useState<LifeWheelAssessment | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
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
  }, [user])

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
