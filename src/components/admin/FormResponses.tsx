import { useState, useEffect, useCallback } from 'react'
import { getFormSubmissionsByFormId } from '@/services/forms'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronDown, ChevronUp, Users, BarChart3 } from 'lucide-react'
import { ResponseStatistics } from './ResponseStatistics'
import type { FormQuestion, FormSubmission, FormAnswers } from '@/types'

interface Props {
  formId: string
  questions: FormQuestion[]
}

export function FormResponses({ formId, questions }: Props) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)

  const load = useCallback(async () => {
    try {
      setSubmissions(await getFormSubmissionsByFormId(formId))
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [formId])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('form_submissions', () => {
    load()
  })

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" /> {submissions.length} resposta(s)
        </Badge>
        <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
          <BarChart3 className="mr-1 h-4 w-4" />{' '}
          {showStats ? 'Ocultar estatísticas' : 'Estatísticas'}
        </Button>
      </div>
      {showStats && <ResponseStatistics questions={questions} submissions={submissions} />}
      {submissions.length === 0 ? (
        <Card className="bg-card/50 border-border/50 p-12 text-center text-muted-foreground">
          Nenhuma resposta recebida ainda.
        </Card>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub) => {
            const isOpen = expanded === sub.id
            const userName = sub.expand?.user?.name || 'Usuário'
            const answers = sub.answers as FormAnswers
            return (
              <Card key={sub.id} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <button
                    className="flex items-center justify-between w-full text-left"
                    onClick={() => setExpanded(isOpen ? null : sub.id)}
                  >
                    <div>
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sub.created).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="mt-3 space-y-2">
                      {questions.map((q) => {
                        const ans = answers?.[q.id]
                        const text = Array.isArray(ans) ? ans.join(', ') : String(ans || '—')
                        return (
                          <div key={q.id} className="border border-border/50 rounded p-2">
                            <p className="text-xs font-medium">{q.question_text}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">
                              {text}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
