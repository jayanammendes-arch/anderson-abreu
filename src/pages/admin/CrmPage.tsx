import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, Search, Download } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { CRM_STAGES, getCrmLeads, updateCrmLeadStage, exportLeadsToCsv } from '@/services/crm'
import { filterLeadsByTab, type CrmTab } from '@/lib/crm-utils'
import { CrmKanbanBoard } from '@/components/crm/CrmKanbanBoard'
import { CrmLeadFormDialog } from '@/components/crm/CrmLeadFormDialog'
import { CrmSiteStudentList } from '@/components/crm/CrmSiteStudentList'
import { CrmIntegradosList } from '@/components/crm/CrmIntegradosList'
import type { CrmLead } from '@/types'

export default function CrmPage() {
  const [leads, setLeads] = useState<CrmLead[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<CrmTab>('social')
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
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

  const filteredByTab = filterLeadsByTab(leads, activeTab)

  const filteredLeads = filteredByTab
    .filter((l) => {
      const s = search.toLowerCase()
      if (!s) return true
      return (
        l.name.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        (l.phone || '').toLowerCase().includes(s) ||
        (l.instagram_handle || '').toLowerCase().includes(s)
      )
    })
    .sort((a, b) => a.name.localeCompare(b.name))

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

  const handleExportCsv = () => {
    exportLeadsToCsv(filteredLeads)
    toast.success('CSV exportado com sucesso!')
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)] -m-6 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">CRM — Gestão de Leads</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie leads e acompanhe o funil de vendas
        </p>
      </div>

      <div className="mb-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CrmTab)}>
          <TabsList className="bg-muted">
            <TabsTrigger value="site">Site</TabsTrigger>
            <TabsTrigger value="social">Social Seller</TabsTrigger>
            <TabsTrigger value="integrados">Integrados</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'site' ? (
        <CrmSiteStudentList />
      ) : activeTab === 'integrados' ? (
        <CrmIntegradosList />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou Instagram..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Lead
            </Button>
            <Button
              onClick={handleExportCsv}
              variant="outline"
              className="border-border bg-card text-foreground hover:bg-muted"
            >
              <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Button>
          </div>

          <CrmKanbanBoard
            leads={filteredLeads}
            stages={CRM_STAGES}
            onLeadClick={(lead) => navigate(`/admin/crm/aluno/${lead.id}`)}
            onMoveNext={handleMoveNext}
          />

          <CrmLeadFormDialog open={showForm} onOpenChange={setShowForm} onCreated={loadLeads} />
        </>
      )}
    </div>
  )
}
