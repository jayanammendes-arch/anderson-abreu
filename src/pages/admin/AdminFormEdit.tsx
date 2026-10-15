import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getForm,
  createForm,
  updateForm,
  getFormQuestions,
  bulkSaveFormQuestions,
} from '@/services/forms'
import { QuestionEditor } from '@/components/admin/QuestionEditor'
import { SortableList } from '@/components/admin/SortableList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2, Plus, SaveAll } from 'lucide-react'
import { toast } from 'sonner'
import type { FormQuestion } from '@/types'

const genId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export default function AdminFormEdit() {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()
  const isEdit = !!formId
  const [loading, setLoading] = useState(isEdit)
  const [savingForm, setSavingForm] = useState(false)
  const [savingAll, setSavingAll] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [questions, setQuestions] = useState<FormQuestion[]>([])

  const loadForm = useCallback(async () => {
    if (!formId) return
    try {
      const [f, qs] = await Promise.all([getForm(formId), getFormQuestions(formId)])
      setTitle(f.title || '')
      setDescription(f.description || '')
      setIsActive(f.is_active !== false)
      setQuestions(qs as FormQuestion[])
    } catch {
      toast.error('Formulário não encontrado')
      navigate('/admin/forms')
    } finally {
      setLoading(false)
    }
  }, [formId, navigate])

  useEffect(() => {
    if (isEdit) loadForm()
  }, [isEdit, loadForm])

  const validateQuestionsList = (qs: FormQuestion[]) => {
    for (const q of qs) {
      if (!q.question_text.trim()) {
        toast.error('Todas as perguntas devem ter texto')
        return false
      }
      if (q.question_type === 'linear_scale') {
        const sMin = q.scale_min ?? 1
        const sMax = q.scale_max ?? 5
        if (sMin >= sMax) {
          toast.error('Escala linear: mínimo deve ser menor que máximo')
          return false
        }
      }
    }
    return true
  }

  const handleSaveForm = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }
    setSavingForm(true)
    try {
      const data = { title, description, is_active: isActive }
      if (formId) {
        if (questions.length > 0) {
          if (!validateQuestionsList(questions)) {
            setSavingForm(false)
            return
          }
        }
        await updateForm(formId, data)
        if (questions.length > 0) {
          const result = await bulkSaveFormQuestions(formId, questions)
          setQuestions(result.questions as FormQuestion[])
        }
        toast.success('Formulário e perguntas salvos!')
      } else {
        const created = await createForm(data)
        toast.success('Formulário criado!')
        navigate(`/admin/forms/${created.id}`)
      }
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSavingForm(false)
    }
  }

  const updateQuestion = (id: string, patch: Partial<FormQuestion>) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)))

  const addQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      {
        id: genId(),
        form: formId || '',
        question_text: '',
        question_type: 'short_text',
        options: [],
        order: prev.length,
        required: true,
        description: '',
        shuffle_options: false,
        scale_min: 1,
        scale_max: 5,
        scale_label_left: '',
        scale_label_right: '',
        has_other: false,
        created: '',
        updated: '',
      },
    ])

  const duplicateQuestion = (q: FormQuestion) =>
    setQuestions((prev) => {
      const idx = prev.findIndex((p) => p.id === q.id)
      const copy: FormQuestion = {
        ...q,
        id: genId(),
        question_text: `${q.question_text} (cópia)`,
        created: '',
        updated: '',
      }
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next.map((p, i) => ({ ...p, order: i }))
    })

  const removeQuestion = (q: FormQuestion) => {
    if (!confirm('Excluir esta pergunta?')) return
    setQuestions((prev) => prev.filter((p) => p.id !== q.id))
    toast.success('Pergunta removida. Clique em "Salvar Tudo" para confirmar.')
  }

  const handleReorder = (reordered: FormQuestion[]) => {
    setQuestions(reordered.map((q, i) => ({ ...q, order: i })))
  }

  const handleSaveAll = async () => {
    if (!formId) {
      toast.error('Salve o formulário primeiro')
      return
    }
    if (!validateQuestionsList(questions)) {
      return
    }
    setSavingAll(true)
    try {
      const result = await bulkSaveFormQuestions(formId, questions)
      setQuestions(result.questions as FormQuestion[])
      toast.success('Todas as perguntas salvas!')
    } catch {
      toast.error('Erro ao salvar perguntas')
    } finally {
      setSavingAll(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/admin/forms">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Editar Formulário' : 'Novo Formulário'}</h1>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Formulário Pré-Hipnose"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional"
              rows={2}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>Ativo</Label>
          </div>
          <Button onClick={handleSaveForm} disabled={savingForm}>
            {savingForm ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Formulário
          </Button>
        </CardContent>
      </Card>

      {isEdit && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-base font-semibold">Perguntas</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="mr-1 h-4 w-4" /> Adicionar
                </Button>
                <Button type="button" size="sm" onClick={handleSaveAll} disabled={savingAll}>
                  {savingAll ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <SaveAll className="mr-1 h-4 w-4" />
                  )}
                  Salvar Tudo
                </Button>
              </div>
            </div>
            <SortableList
              items={questions}
              keyExtractor={(q) => q.id}
              onReorder={handleReorder}
              renderItem={(q, { dragHandle }) => (
                <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-card p-4">
                  {dragHandle}
                  <QuestionEditor
                    question={q}
                    onChange={(patch) => updateQuestion(q.id, patch)}
                    onDelete={() => removeQuestion(q)}
                    onDuplicate={() => duplicateQuestion(q)}
                  />
                </div>
              )}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
