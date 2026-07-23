import pb from '@/lib/pocketbase/client'
import type { SiteFAQ } from '@/types'

export const getActiveSiteFaqs = (): Promise<SiteFAQ[]> =>
  pb.collection('site_faqs').getFullList({ sort: 'order' })

export const adminGetSiteFaqs = (): Promise<SiteFAQ[]> =>
  pb.collection('site_faqs').getFullList({ sort: 'order' })

export const adminCreateSiteFaq = (data: Record<string, any>) =>
  pb.collection('site_faqs').create(data)

export const adminUpdateSiteFaq = (id: string, data: Record<string, any>) =>
  pb.collection('site_faqs').update(id, data)

export const adminDeleteSiteFaq = (id: string) => pb.collection('site_faqs').delete(id)
