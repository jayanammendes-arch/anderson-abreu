import { Badge } from '@/components/ui/badge'
import { CrmLeadCard } from '@/components/crm/CrmLeadCard'
import type { CrmLead } from '@/types'

interface CrmKanbanBoardProps {
  leads: CrmLead[]
  stages: readonly string[]
  onLeadClick: (lead: CrmLead) => void
  onMoveNext: (lead: CrmLead) => void
}

export function CrmKanbanBoard({ leads, stages, onLeadClick, onMoveNext }: CrmKanbanBoardProps) {
  const lastStage = stages[stages.length - 1]

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
      {stages.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage)
        return (
          <div key={stage} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-semibold text-sm text-gray-700">{stage}</h3>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                {stageLeads.length}
              </Badge>
            </div>
            <div className="space-y-2 bg-gray-50 rounded-lg p-2 min-h-[200px]">
              {stageLeads.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Nenhum lead</p>
              ) : (
                stageLeads.map((lead) => (
                  <CrmLeadCard
                    key={lead.id}
                    lead={lead}
                    onClick={() => onLeadClick(lead)}
                    onMoveNext={() => onMoveNext(lead)}
                    isLastStage={stage === lastStage}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
