import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getForm,
  createForm,
  updateForm,
  getFormQuestions,
  createFormQuestion,
  updateFormQuestion,
  deleteFormQuestion,
} from '@/services/forms'
import { QuestionEditor } from '@/components/admin/QuestionEditor'
import { SortableList } from '@/components/admin/SortableList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { FormQuestion } from '@/types'

const genId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export default function AdminFormEdit() {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()
  const isEdit = !!formId
  const [loading, setLoading] = useState(isEdit)
  const [savingForm, setSavingForm] = useState(false)
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null)
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

  const handleSaveForm = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }
    setSavingForm(true)
    try {
      const data = { title, description, is_active: isActive }
      if (formId) {
        await updateForm(formId, data)
        toast.success('Formulário salvo!')
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
        question_type: 'open_text',
        options: [],
        order: prev.length,
        required: true,
        created: '',
        updated: '',
      },
    ])

  const saveQuestion = async (q: FormQuestion) => {
    if (!q.question_text.trim()) {
      toast.error('Texto da pergunta é obrigatório')
      return
    }
    if (!formId) {
      toast.error('Salve o formulário primeiro')
      return
    }
    setSavingQuestionId(q.id)
    try {
      if (q.id.startsWith('temp-')) {
        const created = await createFormQuestion({
          form: formId,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options || [],
          order: q.order,
          required: q.required,
        })
        setQuestions((prev) =>
          prev.map((p) => (p.id === q.id ? { ...p, ...(created as FormQuestion) } : p)),
        )
      } else {
        await updateFormQuestion(q.id, {
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options || [],
          order: q.order,
          required: q.required,
        })
      }
      toast.success('Pergunta salva!')
    } catch {
      toast.error('Erro ao salvar pergunta')
    } finally {
      setSavingQuestionId(null)
    }
  }

  const removeQuestion = async (q: FormQuestion) => {
    if (!confirm('Excluir esta pergunta?')) return
    if (!q.id.startsWith('temp-')) {
      try {
        await deleteFormQuestion(q.id)
      } catch {
        toast.error('Erro ao excluir')
        return
      }
    }
    setQuestions((prev) => prev.filter((p) => p.id !== q.id))
    toast.success('Pergunta excluída')
  }

  const handleReorder = (reordered: FormQuestion[]) => {
    setQuestions(reordered)
    reordered.forEach((q, i) => {
      if (!q.id.startsWith('temp-')) {
        updateFormQuestion(q.id, { order: i }).catch(() => {})
      }
    })
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
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Perguntas</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="mr-1 h-4 w-4" /> Adicionar Pergunta
              </Button>
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
                    onSave={() => saveQuestion(q)}
                    onDelete={() => removeQuestion(q)}
                    saving={savingQuestionId === q.id}
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
