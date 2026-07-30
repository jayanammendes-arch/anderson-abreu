import { ChevronRight, Globe, Users } from 'lucide-react'
import type { CrmLead } from '@/types'

interface CrmLeadCardProps {
  lead: CrmLead
  onClick: () => void
  onMoveNext: () => void
  isLastStage: boolean
}

export function CrmLeadCard({ lead, onClick, onMoveNext, isLastStage }: CrmLeadCardProps) {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-sm text-gray-900 truncate">{lead.name}</p>
            {lead.source === 'site' ? (
              <Globe className="h-3 w-3 text-blue-500 flex-shrink-0" />
            ) : (
              <Users className="h-3 w-3 text-purple-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{lead.email}</p>
          {lead.instagram_handle && (
            <p className="text-xs text-gray-400 truncate">@{lead.instagram_handle}</p>
          )}
        </div>
        {!isLastStage && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMoveNext()
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700 flex-shrink-0"
            title="Mover para próximo estágio"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
