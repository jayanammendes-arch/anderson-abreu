import pb from '@/lib/pocketbase/client'
import type { FAQ } from '@/types'

export const getFaqs = (): Promise<FAQ[]> => pb.collection('faqs').getFullList({ sort: 'order' })

export const adminGetFaqs = (): Promise<FAQ[]> =>
  pb.collection('faqs').getFullList({ sort: 'order' })

export const adminCreateFaq = (data: Record<string, any>) => pb.collection('faqs').create(data)

export const adminUpdateFaq = (id: string, data: Record<string, any>) =>
  pb.collection('faqs').update(id, data)

export const adminDeleteFaq = (id: string) => pb.collection('faqs').delete(id)
