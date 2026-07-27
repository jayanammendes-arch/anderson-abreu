import { useState, useEffect, useCallback } from 'react'
import {
  adminGetLWCategories,
  adminCreateLWCategory,
  adminUpdateLWCategory,
  adminDeleteLWCategory,
} from '@/services/life-wheel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
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
import { SortableList } from '@/components/admin/SortableList'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, Save, GripVertical } from 'lucide-react'
import type { LifeWheelCategory } from '@/types'

const empty = { name: '', icon: '', color: '#3b82f6', order: 0 }

export default function AdminLifeWheelCategories() {
  const [items, setItems] = useState<LifeWheelCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<LifeWheelCategory>>(empty)
  const [errors, setErrors] = useState<FieldErrors>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await adminGetLWCategories())
    } catch {
      toast.error('Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('life_wheel_categories', () => load())

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const data = {
        name: form.name,
        icon: form.icon,
        color: form.color,
        order: Number(form.order) || 0,
      }
      if (form.id) await adminUpdateLWCategory(form.id, data)
      else await adminCreateLWCategory(data)
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
      await adminDeleteLWCategory(deleteId)
      toast.success('Excluído!')
      load()
    } catch {
      toast.error('Erro ao excluir')
    } finally {
      setDeleteId(null)
    }
  }

  const handleReorder = async (reordered: LifeWheelCategory[]) => {
    setItems(reordered)
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].order !== i) await adminUpdateLWCategory(reordered[i].id, { order: i })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categorias — Roda da Vida</h1>
        <Button
          onClick={() => {
            setForm({ ...empty, order: items.length })
            setErrors({})
            setDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <SortableList
          items={items}
          keyExtractor={(i) => i.id}
          onReorder={handleReorder}
          renderItem={(cat, { dragHandle }) => (
            <Card className="flex items-center gap-3 p-4 bg-card/50 border-border/50">
              {dragHandle}
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold">{cat.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-muted-foreground">{cat.color}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setForm({ ...cat })
                  setErrors({})
                  setDialogOpen(true)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(cat.id)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          )}
        />
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar' : 'Nova'} Categoria</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Ícone (emoji)</Label>
              <Input
                value={form.icon || ''}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="🙏"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor (hex)</Label>
              <div className="flex gap-2">
                <Input
                  value={form.color || ''}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="#3b82f6"
                />
                <input
                  type="color"
                  value={form.color || '#3b82f6'}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-9 w-12 rounded border border-input"
                />
              </div>
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
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
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
