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
export type CrmSource = 'site' | 'social'

export const getCrmLeads = (): Promise<CrmLead[]> =>
  pb.collection('crm_leads').getFullList({ sort: '-created', expand: 'linked_user' })

export const getCrmLeadById = (id: string): Promise<CrmLead> =>
  pb.collection('crm_leads').getOne(id, { expand: 'linked_user' })

export const createCrmLead = (data: {
  name: string
  email: string
  phone?: string
  instagram_handle?: string
  stage: string
  notes?: string
  source?: CrmSource
  treatments?: string[]
}) => pb.collection('crm_leads').create(data)

export const updateCrmLeadStage = (id: string, stage: string) =>
  pb.collection('crm_leads').update(id, { stage })

export const updateCrmLeadNotes = (id: string, notes: string) =>
  pb.collection('crm_leads').update(id, { notes })

export const updateCrmLeadField = (id: string, data: Record<string, unknown>) =>
  pb.collection('crm_leads').update(id, data)

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

export function exportLeadsToCsv(leads: CrmLead[]): void {
  const headers = [
    'Nome',
    'Email',
    'Telefone',
    'Instagram',
    'Estágio',
    'Origem',
    'Anotações',
    'Data de Criação',
  ]
  const rows = leads.map((l) => [
    l.name || '',
    l.email || '',
    l.phone || '',
    l.instagram_handle || '',
    l.stage || '',
    (l as any).source || 'social',
    (l.notes || '').replace(/\n/g, ' '),
    l.created ? new Date(l.created).toLocaleString('pt-BR') : '',
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `crm-leads-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export interface IntegratedLead {
  socialLead: CrmLead
  siteLead: CrmLead | null
  user: {
    id: string
    name: string
    email: string
    created: string
    phone?: string
    instagram_handle?: string
  }
  purchases: CrmPurchase[]
}

export async function getIntegratedLeads(): Promise<IntegratedLead[]> {
  const leads = await pb.collection('crm_leads').getFullList({
    filter: 'linked_user != ""',
    expand: 'linked_user',
    sort: '-created',
  })

  const byUser = new Map<string, { social?: CrmLead; site?: CrmLead; user?: any }>()
  for (const lead of leads as unknown as CrmLead[]) {
    const userId = lead.linked_user
    if (!userId) continue
    if (!byUser.has(userId)) byUser.set(userId, {})
    const group = byUser.get(userId)!
    const source = lead.source || 'social'
    const expand = (lead as any).expand
    if (source === 'social') {
      group.social = lead
      if (expand?.linked_user) group.user = expand.linked_user
    } else {
      group.site = lead
      if (expand?.linked_user && !group.user) group.user = expand.linked_user
    }
  }

  const integrated: IntegratedLead[] = []
  for (const [, group] of byUser) {
    if (!group.social || !group.user) continue
    const leadIds = [group.social.id, group.site?.id].filter(Boolean) as string[]
    let purchases: CrmPurchase[] = []
    if (leadIds.length > 0) {
      try {
        const filter = leadIds.map((id) => `lead = "${id}"`).join(' || ')
        purchases = await pb.collection('crm_purchases').getFullList({
          filter,
          expand: 'course',
          sort: '-created',
        })
      } catch {
        /* intentionally ignored */
      }
    }
    integrated.push({
      socialLead: group.social,
      siteLead: group.site || null,
      user: {
        id: group.user.id,
        name: group.user.name || '',
        email: group.user.email || '',
        created: group.user.created || '',
        phone: group.user.phone || '',
        instagram_handle: group.user.instagram_handle || '',
      },
      purchases,
    })
  }

  return integrated.sort(
    (a, b) => new Date(b.user.created).getTime() - new Date(a.user.created).getTime(),
  )
}

export async function getCounterpartLead(
  linkedUserId: string,
  currentLeadId: string,
): Promise<CrmLead | null> {
  try {
    const leads = await pb.collection('crm_leads').getFullList({
      filter: `linked_user = "${linkedUserId}" && id != "${currentLeadId}"`,
    })
    return (leads[0] as unknown as CrmLead) || null
  } catch {
    return null
  }
}

export function exportIntegratedLeadsToCsv(leads: IntegratedLead[]): void {
  const headers = [
    'Nome',
    'Email',
    'Telefone',
    'Instagram',
    'Estágio (Social Seller)',
    'Data Registro (Plataforma)',
    'Cursos/Compras',
  ]
  const rows = leads.map((l) => [
    l.socialLead.name || '',
    l.socialLead.email || '',
    l.socialLead.phone || '',
    l.socialLead.instagram_handle || '',
    l.socialLead.stage || '',
    l.user.created ? new Date(l.user.created).toLocaleDateString('pt-BR') : '',
    l.purchases
      .map((p) => p.expand?.course?.title || p.mentorship_service || '—')
      .filter(Boolean)
      .join('; '),
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `integrados-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export interface SiteLeadSummary extends CrmLead {
  courseCount: number
  lastAssessmentDate: string | null
}

export interface StudentCourseProgress {
  id: string
  courseTitle: string
  progress: number
  completedLessons: number
  totalLessons: number
}

export interface StudentMentorship {
  id: string
  service: string
  purchaseDate: string
  amount: number
}

export async function getSiteLeadsWithSummary(): Promise<SiteLeadSummary[]> {
  const leads = await pb.collection('crm_leads').getFullList({
    filter: 'source = "site"',
    sort: '-created',
    expand: 'linked_user',
  })

  const summaries = await Promise.all(
    leads.map(async (lead) => {
      const userId = lead.linked_user
      if (!userId) {
        return { ...lead, courseCount: 0, lastAssessmentDate: null } as SiteLeadSummary
      }
      const [access, assessments] = await Promise.all([
        pb.collection('user_access').getFullList({ filter: `user = "${userId}"` }),
        pb
          .collection('life_wheel_assessments')
          .getFullList({ filter: `user = "${userId}"`, sort: '-created' }),
      ])
      return {
        ...lead,
        courseCount: access.length,
        lastAssessmentDate:
          (assessments[0] as any)?.date || (assessments[0] as any)?.created || null,
      } as SiteLeadSummary
    }),
  )
  return summaries
}

export async function getStudentCoursesWithProgress(
  userId: string,
): Promise<StudentCourseProgress[]> {
  const access = await pb
    .collection('user_access')
    .getFullList({ filter: `user = "${userId}"`, expand: 'course' })

  const progress = await pb
    .collection('user_progress')
    .getFullList({ filter: `user = "${userId}"` })

  const completedLessonIds = new Set(
    progress.filter((p: any) => p.completed).map((p: any) => p.lesson),
  )

  const results = await Promise.all(
    access.map(async (a: any) => {
      const course = a.expand?.course
      if (!course) {
        return { id: a.id, courseTitle: '—', progress: 0, completedLessons: 0, totalLessons: 0 }
      }
      const modules = await pb
        .collection('modules')
        .getFullList({ filter: `course = "${course.id}"` })
      const moduleIds = modules.map((m: any) => m.id)
      if (moduleIds.length === 0) {
        return {
          id: a.id,
          courseTitle: course.title,
          progress: 0,
          completedLessons: 0,
          totalLessons: 0,
        }
      }
      const lessonsArrays = await Promise.all(
        moduleIds.map((mid: string) =>
          pb.collection('lessons').getFullList({ filter: `module = "${mid}"` }),
        ),
      )
      const lessons = lessonsArrays.flat()
      const totalLessons = lessons.length
      const completedLessons = lessons.filter((l: any) => completedLessonIds.has(l.id)).length
      const progressPercent =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      return {
        id: a.id,
        courseTitle: course.title,
        progress: progressPercent,
        completedLessons,
        totalLessons,
      }
    }),
  )
  return results
}

export async function getStudentMentorship(leadId: string): Promise<StudentMentorship | null> {
  try {
    const purchases = await pb.collection('crm_purchases').getFullList({
      filter: `lead = "${leadId}" && mentorship_service != ""`,
      sort: '-created',
    })
    if (purchases.length === 0) return null
    const p = purchases[0] as any
    return {
      id: p.id,
      service: p.mentorship_service,
      purchaseDate: p.purchase_date || '',
      amount: p.amount || 0,
    }
  } catch {
    return null
  }
}

export function exportSiteLeadsToCsv(leads: SiteLeadSummary[]): void {
  const headers = ['Nome', 'Email', 'Telefone', 'Instagram', 'Cursos Comprados', 'Última Avaliação']
  const rows = leads.map((l) => [
    l.name || '',
    l.email || '',
    l.phone || '',
    l.instagram_handle || '',
    String(l.courseCount || 0),
    l.lastAssessmentDate ? new Date(l.lastAssessmentDate).toLocaleDateString('pt-BR') : '',
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `alunos-site-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
