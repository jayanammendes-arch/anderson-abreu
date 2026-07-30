import type { CrmLead } from '@/types'

export type CrmTab = 'site' | 'social' | 'integrados'

export function filterLeadsByTab(leads: CrmLead[], tab: CrmTab): CrmLead[] {
  if (tab === 'site') {
    return leads.filter((l) => l.source === 'site')
  }
  if (tab === 'social') {
    return leads.filter((l) => l.source === 'social' || !l.source)
  }
  const socialEmails = new Set(
    leads.filter((l) => l.source === 'social' || !l.source).map((l) => l.email.toLowerCase()),
  )
  return leads.filter(
    (l) => l.source === 'site' && l.linked_user && socialEmails.has(l.email.toLowerCase()),
  )
}
