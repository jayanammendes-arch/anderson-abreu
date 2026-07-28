import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  adminGetTreatmentCategories,
  adminUpdateTreatmentCategory,
  adminDeleteTreatmentCategory,
} from '@/services/treatment-categories'
import type { TreatmentCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { useRealtime } from '@/hooks/use-realtime'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export default function AdminTreatmentCategories() {
  const [categories, setCategories] = useState<TreatmentCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await adminGetTreatmentCategories()
      setCategories(data as TreatmentCategory[])
    } catch {
      toast.error('Erro ao carregar categorias')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('treatment_categories', () => loadData())

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await adminDeleteTreatmentCategory(deleteId)
      toast.success('Categoria excluída!')
      loadData()
    } catch {
      toast.error('Erro ao excluir')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleToggleActive = async (cat: TreatmentCategory) => {
    const newValue = !cat.is_active
    setTogglingId(cat.id)
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, is_active: newValue } : c)))
    try {
      await adminUpdateTreatmentCategory(cat.id, { is_active: newValue })
      toast.success(newValue ? 'Categoria ativada!' : 'Categoria desativada!')
    } catch {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: !newValue } : c)),
      )
      toast.error('Erro ao alterar status da categoria')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categorias de Tratamento</h1>
        <Button asChild>
          <Link to="/admin/categorias-tratamentos/novo">
            <Plus className="mr-2 h-4 w-4" /> Nova Categoria
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <Card className="bg-card/50 border-border/50 p-12 text-center text-muted-foreground">
          Nenhuma categoria cadastrada.
        </Card>
      ) : (
        <div className="grid gap-3">
          {categories.map((cat) => {
            const Icon = getTreatmentIcon(cat.icon)
            return (
              <Card
                key={cat.id}
                className="flex items-center gap-4 p-4 bg-card/50 border-border/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100">
                  <Icon className="h-5 w-5 text-sky-600" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">/tratamentos/{cat.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={cat.is_active ?? false}
                    onCheckedChange={() => handleToggleActive(cat)}
                    disabled={togglingId === cat.id}
                  />
                  <span className="text-xs text-muted-foreground w-12">
                    {cat.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/categorias-tratamentos/${cat.id}/editar`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(cat.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
