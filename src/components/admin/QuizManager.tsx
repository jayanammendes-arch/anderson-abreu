import { useState, useEffect, useCallback } from 'react'
import {
  adminGetQuizByModule,
  adminCreateQuiz,
  adminUpdateQuiz,
  adminGetQuizQuestions,
  adminCreateQuizQuestion,
  adminDeleteQuizQuestion,
} from '@/services/admin-courses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Quiz, QuizQuestion } from '@/types'

export function QuizManager({ moduleId }: { moduleId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [minScore, setMinScore] = useState(70)
  const [showForm, setShowForm] = useState(false)
  const [qForm, setQForm] = useState({ question: '', options: ['', '', '', ''], correct_answer: 0 })
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const q = await adminGetQuizByModule(moduleId)
      setQuiz(q)
      if (q) {
        setMinScore(q.min_score || 70)
        setQuestions(await adminGetQuizQuestions(q.id))
      }
    } catch {
      setQuiz(null)
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggle = async (active: boolean) => {
    setSaving(true)
    try {
      if (!quiz) {
        const created = await adminCreateQuiz({
          module: moduleId,
          title: 'Prova do Módulo',
          min_score: minScore,
          is_active: active,
        })
        setQuiz(created as Quiz)
      } else {
        await adminUpdateQuiz(quiz.id, { is_active: active })
        setQuiz({ ...quiz, is_active: active })
      }
      toast.success(active ? 'Prova ativada' : 'Prova desativada')
    } catch {
      toast.error('Erro ao atualizar prova')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMinScore = async () => {
    if (!quiz) return
    try {
      await adminUpdateQuiz(quiz.id, { min_score: minScore })
      toast.success('Nota mínima salva')
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  const handleAddQuestion = async () => {
    if (!quiz || !qForm.question.trim() || qForm.options.some((o) => !o.trim())) return
    setSaving(true)
    try {
      await adminCreateQuizQuestion({
        quiz: quiz.id,
        question: qForm.question,
        options: qForm.options,
        correct_answer: qForm.correct_answer,
      })
      setQuestions(await adminGetQuizQuestions(quiz.id))
      setQForm({ question: '', options: ['', '', '', ''], correct_answer: 0 })
      setShowForm(false)
      toast.success('Pergunta adicionada')
    } catch {
      toast.error('Erro ao adicionar pergunta')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    try {
      await adminDeleteQuizQuestion(id)
      if (quiz) setQuestions(await adminGetQuizQuestions(quiz.id))
      toast.success('Pergunta excluída')
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    )

  const isActive = quiz?.is_active ?? false

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch checked={isActive} onCheckedChange={handleToggle} disabled={saving} />
        <Label className="text-sm">Este módulo tem prova?</Label>
      </div>
      {isActive && quiz && (
        <div className="space-y-4 pl-3 border-l-2 border-primary/20">
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Nota mínima (%)</Label>
              <Input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="h-8 w-24 text-sm"
              />
            </div>
            <Button size="sm" variant="outline" onClick={handleSaveMinScore}>
              Salvar
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Perguntas ({questions.length})</Label>
              <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
                <Plus className="h-3 w-3 mr-1" /> Adicionar pergunta
              </Button>
            </div>
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border border-border/30 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {i + 1}. {q.question}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 shrink-0"
                    onClick={() => handleDeleteQuestion(q.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-green-500 mt-1">✓ {q.options[q.correct_answer]}</p>
              </div>
            ))}
          </div>
          {showForm && (
            <div className="rounded-lg border border-border/50 p-3 space-y-3 bg-muted/30">
              <div className="space-y-1">
                <Label className="text-xs">Enunciado</Label>
                <Input
                  value={qForm.question}
                  onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <RadioGroup
                value={String(qForm.correct_answer)}
                onValueChange={(v) => setQForm({ ...qForm, correct_answer: Number(v) })}
                className="space-y-2"
              >
                {qForm.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <RadioGroupItem value={String(i)} id={`opt-${i}`} />
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const opts = [...qForm.options]
                        opts[i] = e.target.value
                        setQForm({ ...qForm, options: opts })
                      }}
                      placeholder={`Alternativa ${i + 1}`}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Selecione o radio da alternativa correta.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddQuestion}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Adicionar'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
