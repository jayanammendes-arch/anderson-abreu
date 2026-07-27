import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getLifeWheelCategories,
  getLifeWheelQuestions,
  getLifeWheelAssessments,
  saveLifeWheelAssessment,
  updateLifeWheelAssessment,
  downloadLifeWheelPdf,
} from '@/services/life-wheel'
import { LifeWheelChart, type ChartData } from '@/components/life-wheel/LifeWheelForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Download, RefreshCw, ClipboardList } from 'lucide-react'
import type { LifeWheelCategory, LifeWheelQuestion, LifeWheelAssessment } from '@/types'

export default function RodaDaVida() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<LifeWheelCategory[]>([])
  const [questions, setQuestions] = useState<LifeWheelQuestion[]>([])
  const [assessments, setAssessments] = useState<LifeWheelAssessment[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

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
      const initial: Record<string, number> = {}
      qs.forEach((q) => {
        initial[q.id] = 5
      })
      setAnswers(initial)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const preAssessment = assessments.find((a) => a.type === 'pre')
  const postAssessment = assessments.find((a) => a.type === 'post')
  const hasBoth = !!preAssessment && !!postAssessment

  const buildChartData = (
    assessment: LifeWheelAssessment | undefined,
    type: 'single' | 'pre' | 'post',
  ): ChartData[] =>
    categories.map((cat) => {
      const score = assessment?.scores?.[cat.id] ?? 0
      return type === 'single'
        ? { category: cat.name, score }
        : type === 'pre'
          ? { category: cat.name, pre: score }
          : { category: cat.name, post: score }
    })

  const comparisonData = useMemo((): ChartData[] => {
    if (!hasBoth) return []
    return categories.map((cat) => ({
      category: cat.name,
      pre: preAssessment!.scores?.[cat.id] ?? 0,
      post: postAssessment!.scores?.[cat.id] ?? 0,
    }))
  }, [categories, preAssessment, postAssessment, hasBoth])

  const handleAnswerChange = (qId: string, value: number) =>
    setAnswers((prev) => ({ ...prev, [qId]: value }))

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

      const type = !preAssessment ? 'pre' : 'post'
      if (type === 'post' && postAssessment) {
        await updateLifeWheelAssessment(postAssessment.id, { scores })
      } else {
        await saveLifeWheelAssessment({ user: user.id, type, scores })
      }
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

  const currentChart = hasBoth
    ? comparisonData
    : preAssessment
      ? buildChartData(preAssessment, 'single')
      : postAssessment
        ? buildChartData(postAssessment, 'single')
        : []
  const latestAssessment = postAssessment || preAssessment

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roda da Vida</h1>
          <p className="text-muted-foreground">Avalie sua vida antes e depois do tratamento</p>
        </div>
        <div className="flex gap-2">
          {latestAssessment && (
            <Button variant="outline" onClick={() => downloadLifeWheelPdf(latestAssessment.id)}>
              <Download className="mr-2 h-4 w-4" /> Baixar PDF
            </Button>
          )}
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              <RefreshCw className="mr-2 h-4 w-4" />
            ) : (
              <ClipboardList className="mr-2 h-4 w-4" />
            )}
            {showForm ? 'Ver Resultados' : preAssessment ? 'Nova Avaliação' : 'Iniciar Avaliação'}
          </Button>
        </div>
      </div>

      {showForm ? (
        <LifeWheelForm
          categories={categories}
          questions={questions}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleSubmit}
          submitLabel={!preAssessment ? 'Salvar Avaliação Inicial (Pré)' : 'Salvar Avaliação (Pós)'}
          submitting={submitting}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {currentChart.length > 0 ? (
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">
                {hasBoth
                  ? 'Comparação Pré vs Pós'
                  : `Avaliação ${preAssessment ? 'Pré' : 'Pós'}-Tratamento`}
              </h2>
              <LifeWheelChart data={currentChart} showComparison={hasBoth} />
            </Card>
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              Nenhuma avaliação realizada. Clique em "Iniciar Avaliação" para começar.
            </Card>
          )}
          {latestAssessment && (
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Resumo</h2>
              <div className="space-y-3">
                {categories.map((cat) => {
                  const preScore = preAssessment?.scores?.[cat.id]
                  const postScore = postAssessment?.scores?.[cat.id]
                  const currentScore = postScore ?? preScore
                  const diff = preScore && postScore ? postScore - preScore : null
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between border-b border-border/30 pb-2"
                    >
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {currentScore !== undefined && (
                          <span className="text-sm font-bold" style={{ color: cat.color }}>
                            {currentScore.toFixed(1)}
                          </span>
                        )}
                        {diff !== null && (
                          <span
                            className={`text-xs ${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-muted-foreground'}`}
                          >
                            {diff > 0 ? '+' : ''}
                            {diff.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
                {latestAssessment.scores?.overall_average !== undefined && (
                  <div className="flex items-center justify-between pt-3">
                    <span className="font-bold">Média Geral</span>
                    <span className="text-lg font-bold text-primary">
                      {latestAssessment.scores.overall_average.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
