import { useState, useEffect, useCallback } from 'react'
import { adminGetFaqs, adminCreateFaq, adminUpdateFaq, adminDeleteFaq } from '@/services/faqs'
import type { FAQ } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2, Save, HelpCircle } from 'lucide-react'

const emptyFaq: Partial<FAQ> = { question: '', answer: '', category: '', order: 0 }

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<FAQ>>(emptyFaq)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadFaqs = useCallback(async () => {
    setIsLoading(true)
    try {
      setFaqs(await adminGetFaqs())
    } catch {
      toast.error('Erro ao carregar FAQs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFaqs()
  }, [loadFaqs])
  useRealtime('faqs', () => {
    loadFaqs()
  })

  const handleNew = () => {
    setFormData({ ...emptyFaq, order: faqs.length })
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleEdit = (faq: FAQ) => {
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
        category: formData.category || '',
        order: Number(formData.order) || 0,
      }
      if (formData.id) {
        await adminUpdateFaq(formData.id, data)
        toast.success('FAQ atualizada!')
      } else {
        await adminCreateFaq(data)
        toast.success('FAQ criada!')
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta FAQ?')) return
    try {
      await adminDeleteFaq(id)
      toast.success('FAQ excluída!')
      loadFaqs()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">FAQs</h1>
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
          Nenhuma FAQ cadastrada.
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
                  {faq.category && (
                    <Badge variant="secondary" className="text-xs">
                      {faq.category}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    #{faq.order}
                  </Badge>
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
                  onClick={() => handleDelete(faq.id)}
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
            <DialogTitle>{formData.id ? 'Editar FAQ' : 'Nova FAQ'}</DialogTitle>
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
                <Label>Categoria</Label>
                <Input
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                />
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
    </div>
  )
}
