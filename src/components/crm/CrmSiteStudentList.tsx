import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Download, Loader2, ChevronRight } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { getSiteLeadsWithSummary, exportSiteLeadsToCsv, type SiteLeadSummary } from '@/services/crm'

export function CrmSiteStudentList() {
  const { isAdmin } = useAuth()
  const [leads, setLeads] = useState<SiteLeadSummary[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadLeads = useCallback(async () => {
    try {
      setLeads(await getSiteLeadsWithSummary())
    } catch {
      toast.error('Erro ao carregar alunos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  useRealtime('crm_leads', () => loadLeads())

  const filtered = leads.filter((l) => {
    const s = search.toLowerCase()
    if (!s) return true
    return l.name.toLowerCase().includes(s) || l.email.toLowerCase().includes(s)
  })

  const handleExport = () => {
    exportSiteLeadsToCsv(filtered)
    toast.success('CSV exportado com sucesso!')
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-muted-foreground">Acesso restrito</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="border-border bg-card text-foreground hover:bg-muted"
        >
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground hidden sm:table-cell">
                Email
              </th>
              <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">
                Telefone
              </th>
              <th className="text-left px-4 py-3 font-semibold text-foreground hidden lg:table-cell">
                Instagram
              </th>
              <th className="text-center px-4 py-3 font-semibold text-foreground">Cursos</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground hidden xl:table-cell">
                Última Avaliação
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum aluno encontrado
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border/50 hover:bg-muted/50 cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {lead.email}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {lead.phone || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {lead.instagram_handle ? `@${lead.instagram_handle}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-primary text-primary-foreground">{lead.courseCount}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                    {lead.lastAssessmentDate
                      ? new Date(lead.lastAssessmentDate).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/admin/crm/aluno/${lead.id}`)
                      }}
                    >
                      Detalhes <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
