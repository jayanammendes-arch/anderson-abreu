import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CRM_STAGES, createCrmLead } from '@/services/crm'
import { getErrorMessage } from '@/lib/pocketbase/errors'

interface CrmLeadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CrmLeadFormDialog({ open, onOpenChange, onCreated }: CrmLeadFormDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [instagram, setInstagram] = useState('')
  const [stage, setStage] = useState<string>(CRM_STAGES[0])
  const [notes, setNotes] = useState('')
  const [source, setSource] = useState<'social' | 'site'>('social')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      toast.error('Nome e email são obrigatórios')
      return
    }
    setSubmitting(true)
    try {
      await createCrmLead({
        name,
        email,
        phone,
        instagram_handle: instagram,
        stage,
        notes,
        source,
      })
      toast.success('Lead criado com sucesso!')
      setName('')
      setEmail('')
      setPhone('')
      setInstagram('')
      setNotes('')
      setStage(CRM_STAGES[0])
      setSource('social')
      onOpenChange(false)
      onCreated()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-name">Nome *</Label>
            <Input
              id="lead-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-email">Email *</Label>
            <Input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border-gray-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Telefone</Label>
              <Input
                id="lead-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-instagram">Instagram</Label>
              <Input
                id="lead-instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@usuario"
                className="bg-white border-gray-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Estágio</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRM_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={source} onValueChange={(v) => setSource(v as 'social' | 'site')}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social Seller</SelectItem>
                  <SelectItem value="site">Site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-notes">Notas</Label>
            <Textarea
              id="lead-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-white border-gray-200"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-200"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="bg-gray-900 hover:bg-gray-800">
              {submitting ? 'Criando...' : 'Criar Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
