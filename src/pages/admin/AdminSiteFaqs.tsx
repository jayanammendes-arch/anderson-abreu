import { useState, useEffect, useCallback } from 'react'
import {
  adminGetSiteFaqs,
  adminCreateSiteFaq,
  adminUpdateSiteFaq,
  adminDeleteSiteFaq,
} from '@/services/site-faqs'
import type { SiteFAQ } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2, Save, HelpCircle } from 'lucide-react'

const emptyFaq: Partial<SiteFAQ> = {
  question: '',
  answer: '',
  order: 0,
  is_active: true,
}

export default function AdminSiteFaqs() {
  const [faqs, setFaqs] = useState<SiteFAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<Partial<SiteFAQ>>(emptyFaq)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadFaqs = useCallback(async () => {
    setIsLoading(true)
    try {
      setFaqs(await adminGetSiteFaqs())
    } catch {
      toast.error('Erro ao carregar FAQs do site')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFaqs()
  }, [loadFaqs])

  useRealtime('site_faqs', () => {
    loadFaqs()
  })

  const handleNew = () => {
    setFormData({ ...emptyFaq, order: faqs.length })
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleEdit = (faq: SiteFAQ) => {
    setFormData({ ...faq })
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFieldErrors({})
    try {
      const data = {
        question: formData.question || '',
        answer: formData.answer || '',
        order: Number(formData.order) || 0,
        is_active: formData.is_active !== false,
      }
      if (formData.id) {
        await adminUpdateSiteFaq(formData.id, data)
        toast.success('FAQ do site atualizada!')
      } else {
        await adminCreateSiteFaq(data)
        toast.success('FAQ do site criada!')
      }
      setDialogOpen(false)
      loadFaqs()
    } catch (err) {
      const errors = extractFieldErrors(err)
      setFieldErrors(errors)
      if (Object.keys(errors).length === 0) toast.error('Erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await adminDeleteSiteFaq(deleteId)
      toast.success('FAQ do site excluída!')
      loadFaqs()
    } catch {
      toast.error('Erro ao excluir')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">FAQs do Site</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Nova FAQ
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : faqs.length === 0 ? (
        <Card className="bg-card/50 border-border/50 p-12 text-center text-muted-foreground">
          Nenhuma FAQ do site cadastrada.
        </Card>
      ) : (
        <div className="grid gap-3">
          {faqs.map((faq) => (
            <Card key={faq.id} className="flex items-start gap-4 p-4 bg-card/50 border-border/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <Badge variant="outline" className="text-xs">
                    #{faq.order}
                  </Badge>
                  {faq.is_active ? (
                    <Badge variant="secondary" className="text-xs text-green-500">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                </div>
                <div
                  className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(faq)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(faq.id)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar FAQ do Site' : 'Nova FAQ do Site'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Pergunta *</Label>
              <Input
                required
                value={formData.question || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              />
              {fieldErrors.question && (
                <p className="text-sm text-red-500">{fieldErrors.question}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Resposta *</Label>
              <RichTextEditor
                value={formData.answer || ''}
                onChange={(html) => setFormData({ ...formData, answer: html })}
              />
              {fieldErrors.answer && <p className="text-sm text-red-500">{fieldErrors.answer}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ativo</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={formData.is_active !== false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.is_active !== false ? 'Visível publicamente' : 'Oculto'}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}{' '}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir FAQ do Site</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta FAQ? Esta ação não pode ser desfeita.
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
