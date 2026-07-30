import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Search } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { CRM_STAGES, getCrmLeads, updateCrmLeadStage } from '@/services/crm'
import { CrmKanbanBoard } from '@/components/crm/CrmKanbanBoard'
import { CrmLeadDetailSheet } from '@/components/crm/CrmLeadDetailSheet'
import { CrmLeadFormDialog } from '@/components/crm/CrmLeadFormDialog'
import type { CrmLead } from '@/types'

export default function CrmPage() {
  const [leads, setLeads] = useState<CrmLead[]>([])
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadLeads = useCallback(async () => {
    try {
      setLeads(await getCrmLeads())
    } catch {
      toast.error('Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  useRealtime('crm_leads', () => {
    loadLeads()
  })

  const filteredLeads = leads.filter((l) => {
    const s = search.toLowerCase()
    const matchSearch =
      !s ||
      l.name.toLowerCase().includes(s) ||
      l.email.toLowerCase().includes(s) ||
      (l.instagram_handle || '').toLowerCase().includes(s)
    return matchSearch
  })

  const visibleStages =
    stageFilter === 'all' ? CRM_STAGES : [stageFilter as (typeof CRM_STAGES)[number]]

  const handleMoveNext = async (lead: CrmLead) => {
    const idx = CRM_STAGES.indexOf(lead.stage as (typeof CRM_STAGES)[number])
    if (idx < CRM_STAGES.length - 1) {
      try {
        await updateCrmLeadStage(lead.id, CRM_STAGES[idx + 1])
      } catch {
        toast.error('Erro ao mover lead')
      }
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )

  return (
    <div className="bg-white min-h-[calc(100vh-4rem)] -m-6 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">CRM — Gestão de Leads</h1>
        <p className="text-sm text-gray-500">Gerencie leads e acompanhe o funil de vendas</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, email ou Instagram..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white border-gray-200">
            <SelectValue placeholder="Filtrar por estágio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estágios</SelectItem>
            {CRM_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Lead
        </Button>
      </div>

      <CrmKanbanBoard
        leads={filteredLeads}
        stages={visibleStages}
        onLeadClick={setSelectedLead}
        onMoveNext={handleMoveNext}
      />

      <CrmLeadDetailSheet
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(o) => !o && setSelectedLead(null)}
      />

      <CrmLeadFormDialog open={showForm} onOpenChange={setShowForm} onCreated={loadLeads} />
    </div>
  )
}
