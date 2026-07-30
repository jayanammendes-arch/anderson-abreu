import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Download, Loader2, ChevronRight } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { getSiteLeadsWithSummary, exportSiteLeadsToCsv, type SiteLeadSummary } from '@/services/crm'
import { CrmStudentDetailSheet } from '@/components/crm/CrmStudentDetailSheet'

export function CrmSiteStudentList() {
  const { isAdmin } = useAuth()
  const [leads, setLeads] = useState<SiteLeadSummary[]>([])
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<SiteLeadSummary | null>(null)
  const [loading, setLoading] = useState(true)

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
        <p className="text-gray-500">Acesso restrito</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200"
          />
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">
                Email
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">
                Telefone
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">
                Instagram
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Cursos</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden xl:table-cell">
                Última Avaliação
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum aluno encontrado
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{lead.email}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {lead.phone || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                    {lead.instagram_handle ? `@${lead.instagram_handle}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      {lead.courseCount}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden xl:table-cell">
                    {lead.lastAssessmentDate
                      ? new Date(lead.lastAssessmentDate).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-900"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedLead(lead)
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

      <CrmStudentDetailSheet
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(o) => !o && setSelectedLead(null)}
      />
    </div>
  )
}
