import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Send } from 'lucide-react'
import {
  CRM_STAGES,
  getCrmInteractions,
  getCrmPurchases,
  updateCrmLeadStage,
  updateCrmLeadNotes,
  createCrmInteraction,
} from '@/services/crm'
import { CrmLinkedUserData } from '@/components/crm/CrmLinkedUserData'
import type { CrmLead, CrmInteraction, CrmPurchase } from '@/types'

interface CrmLeadDetailSheetProps {
  lead: CrmLead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CrmLeadDetailSheet({ lead, open, onOpenChange }: CrmLeadDetailSheetProps) {
  const [interactions, setInteractions] = useState<CrmInteraction[]>([])
  const [purchases, setPurchases] = useState<CrmPurchase[]>([])
  const [linkedUserId, setLinkedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [stage, setStage] = useState('')
  const [newIntType, setNewIntType] = useState('')
  const [newIntContent, setNewIntContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!lead) return
    setNotes(lead.notes || '')
    setStage(lead.stage)
    setLinkedUserId(lead.linked_user || null)
    setLoading(true)
    Promise.all([
      getCrmInteractions(lead.id).catch(() => []),
      getCrmPurchases(lead.id).catch(() => []),
    ])
      .then(([ints, purs]) => {
        setInteractions(ints as CrmInteraction[])
        setPurchases(purs as CrmPurchase[])
      })
      .finally(() => setLoading(false))
  }, [lead])

  const handleSaveNotes = async () => {
    if (!lead) return
    setSaving(true)
    try {
      await updateCrmLeadNotes(lead.id, notes)
      toast.success('Notas salvas!')
    } catch {
      toast.error('Erro ao salvar notas')
    } finally {
      setSaving(false)
    }
  }

  const handleStageChange = async (newStage: string) => {
    if (!lead) return
    setStage(newStage)
    try {
      await updateCrmLeadStage(lead.id, newStage)
    } catch {
      toast.error('Erro ao alterar estágio')
    }
  }

  const handleAddInteraction = async () => {
    if (!lead || !newIntContent.trim()) return
    try {
      const created = await createCrmInteraction({
        lead: lead.id,
        type: newIntType || 'Nota',
        content: newIntContent,
      })
      setInteractions((prev) => [created as CrmInteraction, ...prev])
      setNewIntType('')
      setNewIntContent('')
      toast.success('Interação registrada!')
    } catch {
      toast.error('Erro ao adicionar interação')
    }
  }

  if (!lead) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle className="text-xl">{lead.name}</SheetTitle>
          <SheetDescription>{lead.email}</SheetDescription>
        </SheetHeader>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Telefone:</span> {lead.phone || '—'}
          </div>
          <div>
            <span className="text-gray-500">Instagram:</span>{' '}
            {lead.instagram_handle ? `@${lead.instagram_handle}` : '—'}
          </div>
        </div>
        <div className="mt-3">
          <Label className="text-xs text-gray-500">Estágio</Label>
          <Select value={stage} onValueChange={handleStageChange}>
            <SelectTrigger className="mt-1">
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
        <Tabs defaultValue="notes" className="mt-6">
          <TabsList>
            <TabsTrigger value="notes">Notas</TabsTrigger>
            <TabsTrigger value="interactions">Interações ({interactions.length})</TabsTrigger>
            {linkedUserId && <TabsTrigger value="linked">Aluno</TabsTrigger>}
          </TabsList>
          <TabsContent value="notes" className="space-y-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Adicione notas sobre este lead..."
            />
            <Button size="sm" onClick={handleSaveNotes} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}{' '}
              Salvar Notas
            </Button>
          </TabsContent>
          <TabsContent value="interactions" className="space-y-3">
            <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
              <Input
                placeholder="Tipo (ex: Ligação, WhatsApp)"
                value={newIntType}
                onChange={(e) => setNewIntType(e.target.value)}
                className="h-8 text-sm"
              />
              <Textarea
                placeholder="Conteúdo da interação..."
                value={newIntContent}
                onChange={(e) => setNewIntContent(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <Button size="sm" onClick={handleAddInteraction} disabled={!newIntContent.trim()}>
                <Send className="mr-2 h-3 w-3" /> Registrar
              </Button>
            </div>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              interactions.map((i) => (
                <div key={i.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary">{i.type}</Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(i.created).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: i.content }} />
                </div>
              ))
            )}
          </TabsContent>
          {linkedUserId && (
            <TabsContent value="linked">
              <CrmLinkedUserData userId={linkedUserId} purchases={purchases} />
            </TabsContent>
          )}
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
