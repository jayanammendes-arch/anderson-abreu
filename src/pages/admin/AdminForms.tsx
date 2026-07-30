import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getForms, deleteForm, updateForm } from '@/services/forms'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Trash2, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { FormConfig } from '@/types'

export default function AdminForms() {
  const [forms, setForms] = useState<FormConfig[]>([])
  const [loading, setLoading] = useState(true)

  const loadForms = useCallback(async () => {
    setLoading(true)
    try {
      setForms((await getForms()) as FormConfig[])
    } catch {
      toast.error('Erro ao carregar formulários')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadForms()
  }, [loadForms])

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este formulário?')) return
    try {
      await deleteForm(id)
      toast.success('Formulário excluído')
      loadForms()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const handleToggleActive = async (form: FormConfig) => {
    try {
      await updateForm(form.id, { is_active: !form.is_active })
      loadForms()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Formulários</h1>
        <Button asChild>
          <Link to="/admin/forms/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Formulário
          </Link>
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card className="bg-card/50 border-border/50 p-12 text-center text-muted-foreground">
          Nenhum formulário cadastrado.
        </Card>
      ) : (
        <div className="grid gap-3">
          {forms.map((form) => (
            <Card key={form.id} className="flex items-center gap-4 p-4 bg-card/50 border-border/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{form.title}</h3>
                {form.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{form.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={form.is_active ? 'default' : 'secondary'}>
                    {form.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={() => handleToggleActive(form)}
                  />
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/admin/forms/${form.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(form.id)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
