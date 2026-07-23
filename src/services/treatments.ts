import pb from '@/lib/pocketbase/client'
import type { Treatment } from '@/types'

export const getAllTreatments = (): Promise<Treatment[]> =>
  pb.collection('treatments').getFullList({ sort: 'name' })

export const getTreatmentBySlug = (slug: string): Promise<Treatment> =>
  pb.collection('treatments').getFirstListItem(`slug = "${slug}"`)

export function getTreatmentImageUrl(treatment: Treatment): string | null {
  if (!treatment.image) return null
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatments/${treatment.id}/${treatment.image}`
}

export const adminGetTreatments = (): Promise<Treatment[]> =>
  pb.collection('treatments').getFullList({ sort: 'name' })

export const adminCreateTreatment = (data: Record<string, unknown> | FormData) =>
  pb.collection('treatments').create(data)

export const adminUpdateTreatment = (id: string, data: Record<string, unknown> | FormData) =>
  pb.collection('treatments').update(id, data)

export const adminDeleteTreatment = (id: string) => pb.collection('treatments').delete(id)
