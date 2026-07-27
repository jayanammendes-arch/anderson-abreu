import { useState, useEffect, useCallback } from 'react'
import {
  adminGetLWQuestions,
  adminCreateLWQuestion,
  adminUpdateLWQuestion,
  adminDeleteLWQuestion,
  adminGetLWCategories,
} from '@/services/life-wheel'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, Save } from 'lucide-react'
import type { LifeWheelQuestion, LifeWheelCategory } from '@/types'

export default function AdminLifeWheelQuestions() {
  const [items, setItems] = useState<LifeWheelQuestion[]>([])
  const [cats, setCats] = useState<LifeWheelCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<LifeWheelQuestion>>({
    text: '',
    explanation: '',
    category: '',
    order: 0,
  })
  const [errors, setErrors] = useState<FieldErrors>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [qs, cs] = await Promise.all([adminGetLWQuestions(), adminGetLWCategories()])
      setItems(qs)
      setCats(cs)
    } catch {
      toast.error('Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('life_wheel_questions', () => load())

  const catName = (id: string) => cats.find((c) => c.id === id)?.name || '—'
  const catIcon = (id: string) => cats.find((c) => c.id === id)?.icon || ''

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const data = {
        text: form.text,
        explanation: form.explanation,
        category: form.category,
        order: Number(form.order) || 0,
      }
      if (form.id) await adminUpdateLWQuestion(form.id, data)
      else await adminCreateLWQuestion(data)
      toast.success(form.id ? 'Atualizado!' : 'Criado!')
      setDialogOpen(false)
      load()
    } catch (err) {
      setErrors(extractFieldErrors(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await adminDeleteLWQuestion(deleteId)
      toast.success('Excluído!')
      load()
    } catch {
      toast.error('Erro ao excluir')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Perguntas — Roda da Vida</h1>
        <Button
          onClick={() => {
            setForm({ text: '', explanation: '', category: cats[0]?.id || '', order: items.length })
            setErrors({})
            setDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Pergunta
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((q) => (
            <Card key={q.id} className="flex items-center gap-3 p-3 bg-card/50 border-border/50">
              <span className="text-lg">{catIcon(q.category)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{q.text}</p>
                <p className="text-xs text-muted-foreground">
                  {catName(q.category)} · Ordem: {q.order}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setForm({ ...q })
                  setErrors({})
                  setDialogOpen(true)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(q.id)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar' : 'Nova'} Pergunta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Pergunta *</Label>
              <Textarea
                required
                value={form.text || ''}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={2}
              />
              {errors.text && <p className="text-sm text-red-500">{errors.text}</p>}
            </div>
            <div className="space-y-2">
              <Label>Explicação</Label>
              <Textarea
                value={form.explanation || ''}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={form.category || ''}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {cats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={form.order || 0}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pergunta</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
