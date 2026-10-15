import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Save, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
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

interface ViaCepResponse {
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean | string
}

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
  const [currentStep, setCurrentStep] = useState(0)
  const [stepError, setStepError] = useState<string | null>(null)
  const [loadingCep, setLoadingCep] = useState(false)
  const [cepNotice, setCepNotice] = useState<{
    message: string
    type: 'success' | 'warning' | 'error'
  } | null>(null)

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

  const normalizeText = (txt: string) =>
    txt
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const fetchCepAddress = async (rawCep: string) => {
    const digitsOnly = String(rawCep || '').replace(/\D/g, '')
    if (digitsOnly.length !== 8) return

    setLoadingCep(true)
    setCepNotice(null)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digitsOnly}/json/`)
      if (!res.ok) {
        setCepNotice({
          message: 'CEP não encontrado. Por favor, preencha o endereço manualmente.',
          type: 'warning',
        })
        return
      }
      const data: ViaCepResponse = await res.json()
      if (data.erro === true || data.erro === 'true') {
        setCepNotice({
          message: 'CEP não encontrado. Por favor, preencha o endereço manualmente.',
          type: 'warning',
        })
        return
      }

      // Procurar as perguntas de endereço no formulário
      let ruaQ: FormQuestion | undefined
      let bairroQ: FormQuestion | undefined
      let cidadeQ: FormQuestion | undefined
      let estadoQ: FormQuestion | undefined

      for (const q of questions) {
        const norm = normalizeText(q.question_text)
        if (
          !ruaQ &&
          (norm.includes('rua') || norm.includes('endereco') || norm.includes('logradouro'))
        ) {
          ruaQ = q
        } else if (!bairroQ && norm.includes('bairro')) {
          bairroQ = q
        } else if (!cidadeQ && norm.includes('cidade')) {
          cidadeQ = q
        } else if (!estadoQ && (norm.includes('estado') || norm.includes('uf'))) {
          estadoQ = q
        }
      }

      setAnswers((prev) => {
        const next = { ...prev }
        if (ruaQ && data.logradouro) {
          next[ruaQ.id] = data.logradouro
        }
        if (bairroQ && data.bairro) {
          next[bairroQ.id] = data.bairro
        }
        if (cidadeQ && data.localidade) {
          next[cidadeQ.id] = data.localidade
        }
        if (estadoQ && data.uf) {
          next[estadoQ.id] = data.uf
        }
        return next
      })

      setCepNotice({
        message:
          'Endereço localizado e preenchido automaticamente! Você pode editá-lo se necessário.',
        type: 'success',
      })
    } catch {
      setCepNotice({
        message: 'Não foi possível buscar o CEP automaticamente. Preencha manualmente.',
        type: 'warning',
      })
    } finally {
      setLoadingCep(false)
    }
  }

  const setAnswer = (qId: string, val: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }))
    setStepError(null)

    // Se for campo de CEP e atingir 8 dígitos, buscar automaticamente
    const q = questions.find((item) => item.id === qId)
    if (q) {
      const norm = normalizeText(q.question_text)
      if (norm.includes('cep')) {
        const clean = String(val || '').replace(/\D/g, '')
        if (clean.length === 8) {
          fetchCepAddress(clean)
        } else {
          setCepNotice(null)
        }
      }
    }
  }

  const handleBlur = (qId: string) => {
    const q = questions.find((item) => item.id === qId)
    if (q) {
      const norm = normalizeText(q.question_text)
      if (norm.includes('cep')) {
        const clean = String(answers[qId] || '').replace(/\D/g, '')
        if (clean.length === 8 && !loadingCep) {
          fetchCepAddress(clean)
        }
      }
    }
  }

  const validateQuestion = (q: FormQuestion): boolean => {
    const isRequired =
      q.required === true || (q.required as unknown) === 'true' || (q.required as unknown) === 1
    if (!isRequired) return true
    const val = answers[q.id]
    if (val == null || val === '' || (Array.isArray(val) && val.length === 0)) {
      return false
    }
    return true
  }

  const handleNext = () => {
    const q = questions[currentStep]
    if (!q) return
    if (!validateQuestion(q)) {
      setStepError('Esta pergunta é obrigatória')
      return
    }
    setStepError(null)
    setCurrentStep((prev) => Math.min(prev + 1, questions.length - 1))
  }

  const handleBack = () => {
    setStepError(null)
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!validateQuestion(q)) {
        toast.error(`Pergunta obrigatória: ${q.question_text}`)
        setCurrentStep(i)
        setStepError('Esta pergunta é obrigatória')
        return
      }
    }
    setSubmitting(true)
    try {
      const result = await createFormSubmission({ user: userId, form: formId, answers })
      setSubmission(result as unknown as FormSubmission)
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

  if (questions.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          Nenhuma pergunta disponível neste formulário.
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const progress = ((currentStep + 1) / questions.length) * 100

  return (
    <Card className="border-border/50 overflow-hidden">
      {headerImg && (
        <div
          className="w-full h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${headerImg})` }}
        />
      )}
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Pergunta {currentStep + 1} de {questions.length}
            </span>
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: themeColor }}
            />
          </div>
        </div>

        <FormQuestionInput
          key={currentQuestion.id}
          question={{
            ...currentQuestion,
            required:
              currentQuestion.required === true ||
              (currentQuestion.required as unknown) === 'true' ||
              (currentQuestion.required as unknown) === 1,
          }}
          answer={answers[currentQuestion.id]}
          otherValue={otherValues[currentQuestion.id]}
          onAnswer={(v) => setAnswer(currentQuestion.id, v)}
          onOtherChange={(v) => setOtherValues((p) => ({ ...p, [currentQuestion.id]: v }))}
          onBlur={() => handleBlur(currentQuestion.id)}
        />

        {loadingCep && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Consultando CEP no ViaCEP...</span>
          </div>
        )}

        {cepNotice && (
          <div
            className={`text-xs p-2.5 rounded border animate-fade-in ${
              cepNotice.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
            }`}
          >
            {cepNotice.message}
          </div>
        )}

        {stepError && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {stepError}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <Button variant="outline" onClick={handleBack} disabled={submitting}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
          ) : (
            <div />
          )}
          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="text-white"
              style={{ backgroundColor: themeColor }}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Enviar Formulário
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="text-white"
              style={{ backgroundColor: themeColor }}
            >
              Avançar <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
