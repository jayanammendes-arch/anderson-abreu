import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Save, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getForm,
  getFormQuestions,
  getFormSubmission,
  createFormSubmission,
  getFormHeaderImageUrl,
} from '@/services/forms'
import { FormQuestionInput } from '@/components/FormQuestionInput'
import type { FormQuestion, FormSubmission, FormAnswers, FormConfig } from '@/types'

interface Props {
  formId: string
  userId: string
  onSubmitted?: () => void
}

export function DynamicForm({ formId, userId, onSubmitted }: Props) {
  const [questions, setQuestions] = useState<FormQuestion[]>([])
  const [formMeta, setFormMeta] = useState<FormConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState<FormSubmission | null>(null)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [answers, setAnswers] = useState<FormAnswers>({})
  const [otherValues, setOtherValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const form = await getForm(formId)
        setFormMeta(form)
        const [qs, sub] = await Promise.all([
          getFormQuestions(formId),
          getFormSubmission(userId, formId),
        ])
        setQuestions(qs)
        setSubmission(sub)
        if (sub?.answers) setAnswers(sub.answers as FormAnswers)
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [formId, userId])

  const setAnswer = (qId: string, val: string | string[] | number) =>
    setAnswers((prev) => ({ ...prev, [qId]: val }))

  const handleSubmit = async () => {
    for (const q of questions) {
      if (q.required) {
        const val = answers[q.id]
        if (val == null || val === '' || (Array.isArray(val) && val.length === 0)) {
          toast.error(`Pergunta obrigatória: ${q.question_text}`)
          return
        }
      }
    }
    setSubmitting(true)
    try {
      const result = await createFormSubmission({ user: userId, form: formId, answers })
      setSubmission(result as FormSubmission)
      setJustSubmitted(true)
      toast.success('Formulário enviado com sucesso!')
      onSubmitted?.()
    } catch {
      toast.error('Erro ao enviar formulário')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )

  const themeColor = formMeta?.color_theme || '#6366f1'
  const confirmationMsg = formMeta?.confirmation_message || 'Formulário enviado com sucesso!'
  const limitMsg = formMeta?.one_submission_message || 'Você já preencheu este formulário.'
  const headerImg = formMeta?.header_image ? getFormHeaderImageUrl(formMeta) : null

  if (submission) {
    const message = justSubmitted ? confirmationMsg : limitMsg
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">{message}</span>
          </div>
          {questions.map((q) => {
            const ans = (submission.answers as FormAnswers)?.[q.id]
            const text = Array.isArray(ans) ? ans.join(', ') : String(ans || '—')
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
    <Card className="border-border/50 overflow-hidden">
      {headerImg && (
        <div
          className="w-full h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${headerImg})` }}
        />
      )}
      <CardContent className="p-6 space-y-5">
        {questions.map((q) => (
          <FormQuestionInput
            key={q.id}
            question={q}
            answer={answers[q.id]}
            otherValue={otherValues[q.id]}
            onAnswer={(v) => setAnswer(q.id, v)}
            onOtherChange={(v) => setOtherValues((p) => ({ ...p, [q.id]: v }))}
          />
        ))}
        {questions.length > 0 && (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full text-white"
            style={{ backgroundColor: themeColor }}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}{' '}
            Enviar Formulário
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
