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
import { Loader2, Save, Send, Lock } from 'lucide-react'
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
  readOnlyFields?: boolean
  onUpdateField?: (id: string, data: Record<string, unknown>) => Promise<void>
}

export function CrmLeadDetailSheet({
  lead,
  open,
  onOpenChange,
  readOnlyFields = false,
  onUpdateField,
}: CrmLeadDetailSheetProps) {
  const [interactions, setInteractions] = useState<CrmInteraction[]>([])
  const [purchases, setPurchases] = useState<CrmPurchase[]>([])
  const [linkedUserId, setLinkedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [stage, setStage] = useState('')
  const [phone, setPhone] = useState('')
  const [instagram, setInstagram] = useState('')
  const [newIntType, setNewIntType] = useState('')
  const [newIntContent, setNewIntContent] = useState('')
  const [saving, setSaving] = useState(false)

  const isSiteLead = lead?.source === 'site'
  const isReadOnly = readOnlyFields || isSiteLead

  useEffect(() => {
    if (!lead) return
    setNotes(lead.notes || '')
    setStage(lead.stage)
    setPhone(lead.phone || '')
    setInstagram(lead.instagram_handle || '')
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

  const handleSaveContactFields = async () => {
    if (!lead || !onUpdateField) return
    setSaving(true)
    try {
      await onUpdateField(lead.id, { phone, instagram_handle: instagram })
    } finally {
      setSaving(false)
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
          <SheetTitle className="text-xl text-gray-900">{lead.name}</SheetTitle>
          <SheetDescription className="text-gray-500">{lead.email}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex items-center gap-2">
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            {lead.source === 'site' ? 'Site' : 'Social Seller'}
          </Badge>
          {linkedUserId && (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Usuário vinculado
            </Badge>
          )}
          {isSiteLead && (
            <Badge variant="outline" className="text-gray-500 border-gray-300 gap-1">
              <Lock className="h-3 w-3" /> Dados sincronizados
            </Badge>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <Label className="text-xs text-gray-500">Telefone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isReadOnly}
              placeholder="—"
              className="mt-1 bg-white border-gray-200 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Instagram</Label>
            <Input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              disabled={isReadOnly}
              placeholder="—"
              className="mt-1 bg-white border-gray-200 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        {!isReadOnly && onUpdateField && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveContactFields}
            disabled={saving}
            className="mt-2 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar contato
          </Button>
        )}

        <div className="mt-3">
          <Label className="text-xs text-gray-500">Estágio</Label>
          <Select value={stage} onValueChange={handleStageChange}>
            <SelectTrigger className="mt-1 bg-white border-gray-200 text-gray-900">
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
          <TabsList className="bg-gray-100">
            <TabsTrigger value="notes" className="text-gray-700">
              Notas
            </TabsTrigger>
            <TabsTrigger value="interactions" className="text-gray-700">
              Interações ({interactions.length})
            </TabsTrigger>
            {linkedUserId && (
              <TabsTrigger value="linked" className="text-gray-700">
                Aluno
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="notes" className="space-y-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Adicione notas sobre este lead..."
              className="bg-white border-gray-200 text-gray-900"
            />
            <Button
              size="sm"
              onClick={handleSaveNotes}
              disabled={saving}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
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
                className="h-8 text-sm bg-white border-gray-200 text-gray-900"
              />
              <Textarea
                placeholder="Conteúdo da interação..."
                value={newIntContent}
                onChange={(e) => setNewIntContent(e.target.value)}
                rows={2}
                className="text-sm bg-white border-gray-200 text-gray-900"
              />
              <Button
                size="sm"
                onClick={handleAddInteraction}
                disabled={!newIntContent.trim()}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Send className="mr-2 h-3 w-3" /> Registrar
              </Button>
            </div>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              interactions.map((i) => (
                <div key={i.id} className="border border-gray-200 rounded-lg p-3 text-sm bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      {i.type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(i.created).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: i.content }} />
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
