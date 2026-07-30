import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, Save, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { getFormQuestions, getFormSubmission, createFormSubmission } from '@/services/forms'
import type { FormQuestion, FormSubmission } from '@/types'

interface DynamicFormProps {
  formId: string
  userId: string
  onSubmitted?: () => void
}

export function DynamicForm({ formId, userId, onSubmitted }: DynamicFormProps) {
  const [questions, setQuestions] = useState<FormQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState<FormSubmission | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const [qs, sub] = await Promise.all([
          getFormQuestions(formId),
          getFormSubmission(userId, formId),
        ])
        setQuestions(qs as FormQuestion[])
        setSubmission(sub)
        if (sub && sub.answers) {
          const map: Record<string, string> = {}
          for (const a of sub.answers) {
            map[a.question_id] = a.answer_text || (a.selected_options || []).join(', ') || ''
          }
          setAnswers(map)
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [formId, userId])

  const handleSubmit = async () => {
    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) {
        toast.error(`Pergunta obrigatória: ${q.question_text}`)
        return
      }
    }
    setSubmitting(true)
    try {
      const answersArray = questions.map((q) => ({
        question_id: q.id,
        question_text: q.question_text,
        answer_text: q.question_type === 'open_text' ? answers[q.id] || '' : undefined,
        selected_options:
          q.question_type === 'multiple_choice'
            ? answers[q.id]
              ? [answers[q.id]]
              : []
            : undefined,
      }))
      const result = await createFormSubmission({
        user: userId,
        form: formId,
        answers: answersArray,
      })
      setSubmission(result as FormSubmission)
      toast.success('Formulário enviado com sucesso!')
      onSubmitted?.()
    } catch {
      toast.error('Erro ao enviar formulário')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (submission) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Formulário concluído</span>
          </div>
          {questions.map((q) => {
            const answer = submission.answers?.find((a) => a.question_id === q.id)
            const text = answer?.answer_text || (answer?.selected_options || []).join(', ') || '—'
            return (
              <div key={q.id} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{q.question_text}</Label>
                <p className="text-sm text-foreground whitespace-pre-wrap">{text}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-6 space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <Label>
              {q.question_text}
              {q.required && <span className="text-red-500"> *</span>}
            </Label>
            {q.question_type === 'open_text' ? (
              <Textarea
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                rows={2}
              />
            ) : (
              <RadioGroup
                value={answers[q.id] || ''}
                onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
              >
                {(q.options || []).map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                    <Label htmlFor={`${q.id}-${opt}`} className="font-normal cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        ))}
        {questions.length > 0 && (
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enviar Formulário
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
