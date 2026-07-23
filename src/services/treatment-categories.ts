import pb from '@/lib/pocketbase/client'
import type { TreatmentCategory } from '@/types'

export const getTreatmentCategories = (): Promise<TreatmentCategory[]> =>
  pb.collection('treatment_categories').getFullList({ sort: 'order' })

export const getTreatmentCategoryBySlug = (slug: string): Promise<TreatmentCategory> =>
  pb.collection('treatment_categories').getFirstListItem(`slug = "${slug}"`)

export function getTreatmentCategoryImageUrl(category: TreatmentCategory): string | null {
  if (!category.image) return null
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatment_categories/${category.id}/${category.image}`
}

export const adminGetTreatmentCategories = (): Promise<TreatmentCategory[]> =>
  pb.collection('treatment_categories').getFullList({ sort: 'order' })

export const adminCreateTreatmentCategory = (data: Record<string, unknown> | FormData) =>
  pb.collection('treatment_categories').create(data)

export const adminUpdateTreatmentCategory = (
  id: string,
  data: Record<string, unknown> | FormData,
) => pb.collection('treatment_categories').update(id, data)

export const adminDeleteTreatmentCategory = (id: string) =>
  pb.collection('treatment_categories').delete(id)
