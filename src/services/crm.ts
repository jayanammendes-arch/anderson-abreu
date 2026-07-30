import pb from '@/lib/pocketbase/client'
import type { CrmLead, CrmInteraction, CrmPurchase } from '@/types'

export const CRM_STAGES = [
  'Leads externos',
  'Novos Seguidores',
  'Base',
  'No Show',
  'Conexao',
  'Wtz ok Anderson',
  'Fechado',
] as const

export type CrmStage = (typeof CRM_STAGES)[number]

export const getCrmLeads = (): Promise<CrmLead[]> =>
  pb.collection('crm_leads').getFullList({ sort: '-created', expand: 'linked_user' })

export const createCrmLead = (data: {
  name: string
  email: string
  phone?: string
  instagram_handle?: string
  stage: string
  notes?: string
}) => pb.collection('crm_leads').create(data)

export const updateCrmLeadStage = (id: string, stage: string) =>
  pb.collection('crm_leads').update(id, { stage })

export const updateCrmLeadNotes = (id: string, notes: string) =>
  pb.collection('crm_leads').update(id, { notes })

export const getCrmInteractions = (leadId: string): Promise<CrmInteraction[]> =>
  pb
    .collection('crm_interactions')
    .getFullList({ filter: `lead = "${leadId}"`, sort: '-created', expand: 'user' })

export const createCrmInteraction = (data: { lead: string; type: string; content: string }) =>
  pb.collection('crm_interactions').create(data)

export const getCrmPurchases = (leadId: string): Promise<CrmPurchase[]> =>
  pb
    .collection('crm_purchases')
    .getFullList({ filter: `lead = "${leadId}"`, sort: '-purchase_date', expand: 'course,user' })

export async function getLinkedUserData(userId: string) {
  const [access, certificates, assessments] = await Promise.all([
    pb.collection('user_access').getFullList({ filter: `user = "${userId}"`, expand: 'course' }),
    pb.collection('certificates').getFullList({ filter: `user = "${userId}"`, expand: 'course' }),
    pb
      .collection('life_wheel_assessments')
      .getFullList({ filter: `user = "${userId}"`, sort: 'created' }),
  ])
  return { access, certificates, assessments }
}
