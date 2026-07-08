import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getQuizByModule, getQuizQuestions, saveQuizResult } from '@/services/quizzes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { XCircle, RotateCcw, Trophy, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Quiz, QuizQuestion } from '@/types'

interface QuizPanelProps {
  moduleId: string
  onQuizComplete: () => void
}

export function QuizPanel({ moduleId, onQuizComplete }: QuizPanelProps) {
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const q = await getQuizByModule(moduleId)
        setQuiz(q)
        if (q) setQuestions(await getQuizQuestions(q.id))
      } catch {
        /* intentionally ignored */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [moduleId])

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  if (!quiz || questions.length === 0) return null

  const handleSubmit = async () => {
    let correct = 0
    for (const q of questions) if (answers[q.id] === q.correct_answer) correct++
    const total = questions.length
    const pct = Math.round((correct / total) * 100)
    const passed = pct >= (quiz.min_score || 70)
    setScore(correct)
    setSubmitted(true)
    if (user) {
      try {
        await saveQuizResult({ user: user.id, quiz: quiz.id, score: correct, total, passed })
      } catch {
        /* intentionally ignored */
      }
      onQuizComplete()
    }
  }

  const handleRetake = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(0)
  }
  const pct = Math.round((score / questions.length) * 100)
  const passed = pct >= (quiz.min_score || 70)

  if (submitted) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? (
              <Trophy className="h-5 w-5 text-amber-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Resultado da Prova
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="text-3xl font-bold">{pct}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              {score} de {questions.length} corretas
            </p>
            <p className={cn('mt-3 font-medium', passed ? 'text-green-500' : 'text-red-500')}>
              {passed ? 'Aprovado!' : 'Reprovado'}
            </p>
          </div>
          <Progress
            value={pct}
            className="h-3"
            indicatorClassName={passed ? 'bg-green-500' : 'bg-red-500'}
          />
          {!passed && (
            <Button onClick={handleRetake} variant="outline" className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" /> Refazer Prova
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q, qi) => (
          <div key={q.id} className="space-y-2">
            <p className="text-sm font-medium">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                  className={cn(
                    'w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-colors',
                    answers[q.id] === oi
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 hover:bg-white/5',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <Button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="w-full"
        >
          Enviar Respostas
        </Button>
      </CardContent>
    </Card>
  )
}
