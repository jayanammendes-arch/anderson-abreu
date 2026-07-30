export interface CrmLead {
  id: string
  name: string
  email: string
  phone: string
  instagram_handle: string
  stage: string
  source?: 'site' | 'social'
  notes: string
  linked_user: string
  created: string
  updated: string
  expand?: {
    linked_user?: {
      id: string
      name: string
      email: string
      phone?: string
      birth_date?: string
      instagram_handle?: string
    }
  }
}

export interface CrmInteraction {
  id: string
  lead: string
  user: string
  type: string
  content: string
  created: string
  updated: string
  expand?: { user?: { id: string; name: string } }
}

export interface CrmPurchase {
  id: string
  lead: string
  user: string
  course: string
  mentorship_service: string
  purchase_date: string
  amount: number
  created: string
  updated: string
  expand?: { course?: Course; user?: { id: string; name: string } }
}
