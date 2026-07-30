import { useState, useEffect } from 'react'
import { Loader2, FileText } from 'lucide-react'
import { getPreHypnosisFormByUserId } from '@/services/pre-hypnosis-forms'
import { getOnboardingConfig } from '@/services/onboarding'
import { getFormSubmission, getFormQuestions } from '@/services/forms'
import type { PreHypnosisForm, FormQuestion, FormSubmission } from '@/types'

const FORM_FIELDS: ReadonlyArray<{ key: keyof PreHypnosisForm; label: string }> = [
  { key: 'nome', label: 'Nome' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'motivo_da_busca', label: 'Motivo da busca' },
  { key: 'informacoes_de_saude', label: 'Informações de saúde' },
  { key: 'medicamentos', label: 'Medicamentos' },
  { key: 'expectativas', label: 'Expectativas' },
]

export function CrmPreHypnosisForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true)
  const [oldForm, setOldForm] = useState<PreHypnosisForm | null>(null)
  const [questions, setQuestions] = useState<FormQuestion[]>([])
  const [submission, setSubmission] = useState<FormSubmission | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const cfg = await getOnboardingConfig()
        const formStep = (cfg?.steps || []).find((s: any) => s.type === 'form')
        if (formStep?.form_id) {
          const [sub, qs] = await Promise.all([
            getFormSubmission(userId, formStep.form_id),
            getFormQuestions(formStep.form_id),
          ])
          if (sub) {
            setSubmission(sub as FormSubmission)
            setQuestions(qs as FormQuestion[])
            return
          }
        }
        const form = await getPreHypnosisFormByUserId(userId)
        setOldForm(form)
      } catch {
        try {
          const form = await getPreHypnosisFormByUserId(userId)
          setOldForm(form)
        } catch {
          /* ignore */
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  if (loading)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )

  if (submission && questions.length > 0) {
    const answers = (submission.answers || {}) as Record<string, string | string[] | number>
    return (
      <div className="space-y-2 rounded-lg bg-muted/50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Formulário enviado</span>
        </div>
        <div className="space-y-1.5">
          {questions.map((q) => {
            const ans = answers[q.id]
            const text = Array.isArray(ans) ? ans.join(', ') : String(ans || '—')
            return (
              <div key={q.id} className="border border-border rounded p-2 text-xs bg-background">
                <span className="font-medium text-foreground">{q.question_text}:</span>
                <p className="text-muted-foreground mt-0.5 whitespace-pre-wrap">{text}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!oldForm) return <p className="text-sm text-muted-foreground">Nenhum formulário enviado.</p>

  return (
    <div className="space-y-2 rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Formulário enviado</span>
      </div>
      <div className="space-y-1.5">
        {FORM_FIELDS.map(({ key, label }) => (
          <div key={key} className="border border-border rounded p-2 text-xs bg-background">
            <span className="font-medium text-foreground">{label}:</span>
            <p className="text-muted-foreground mt-0.5 whitespace-pre-wrap">
              {(oldForm[key] as string) || '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
