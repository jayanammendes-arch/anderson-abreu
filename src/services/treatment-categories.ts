import pb from '@/lib/pocketbase/client'
import type { TreatmentCategory } from '@/types'

export const getTreatmentCategories = (): Promise<TreatmentCategory[]> =>
  pb.collection('treatment_categories').getFullList({ sort: 'order', filter: 'is_active = true' })

export const getTreatmentCategoryBySlug = (slug: string): Promise<TreatmentCategory> =>
  pb.collection('treatment_categories').getFirstListItem(`slug = "${slug}" && is_active = true`)

export function getTreatmentCategoryImageUrl(category: TreatmentCategory): string | null {
  if (!category.image) return null
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatment_categories/${category.id}/${category.image}`
}

export function getTreatmentCategoryImageUrls(
  category: TreatmentCategory,
  field: 'como_funciona_images' | 'resultados_images' | 'cta_images',
): string[] {
  const files = category[field]
  if (!files || !Array.isArray(files) || files.length === 0) return []
  const base = `${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatment_categories/${category.id}`
  return files.map((f) => `${base}/${f}`)
}

export function getTreatmentCategorySintomasImageUrl(category: TreatmentCategory): string | null {
  if (!category.sintomas_image) return null
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/treatment_categories/${category.id}/${category.sintomas_image}`
}

export const adminGetTreatmentCategories = (): Promise<TreatmentCategory[]> =>
  pb.collection('treatment_categories').getFullList({ sort: 'order' })

export const adminGetTreatmentCategory = (id: string): Promise<TreatmentCategory> =>
  pb.collection('treatment_categories').getOne(id)

export const adminCreateTreatmentCategory = (data: Record<string, unknown> | FormData) =>
  pb.collection('treatment_categories').create(data)

export const adminUpdateTreatmentCategory = (
  id: string,
  data: Record<string, unknown> | FormData,
) => pb.collection('treatment_categories').update(id, data)

export const adminDeleteTreatmentCategory = (id: string) =>
  pb.collection('treatment_categories').delete(id)
