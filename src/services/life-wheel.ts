import pb from '@/lib/pocketbase/client'
import type { LifeWheelCategory, LifeWheelQuestion, LifeWheelAssessment } from '@/types'

export const getLifeWheelCategories = (): Promise<LifeWheelCategory[]> =>
  pb.collection('life_wheel_categories').getFullList({ sort: 'order' })

export const getLifeWheelQuestions = (): Promise<LifeWheelQuestion[]> =>
  pb.collection('life_wheel_questions').getFullList({ sort: 'order', expand: 'category' })

export const getLifeWheelAssessments = (userId: string): Promise<LifeWheelAssessment[]> =>
  pb.collection('life_wheel_assessments').getFullList({
    filter: `user = "${userId}"`,
    sort: '-created',
  }) as Promise<LifeWheelAssessment[]>

export const saveLifeWheelAssessment = (data: {
  user: string
  type: 'pre' | 'post'
  scores: Record<string, number>
}) => pb.collection('life_wheel_assessments').create(data)

export const updateLifeWheelAssessment = (
  id: string,
  data: Partial<{ scores: Record<string, number> }>,
) => pb.collection('life_wheel_assessments').update(id, data)

export async function downloadLifeWheelPdf(id: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/life-wheel/assessments/${id}/pdf`,
    { headers: { Authorization: pb.authStore.token || '' } },
  )
  if (!response.ok) throw new Error('Failed to download PDF')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `roda-da-vida-${id}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export const adminGetLWCategories = (): Promise<LifeWheelCategory[]> =>
  pb.collection('life_wheel_categories').getFullList({ sort: 'order' })

export const adminCreateLWCategory = (data: Record<string, unknown>) =>
  pb.collection('life_wheel_categories').create(data)

export const adminUpdateLWCategory = (id: string, data: Record<string, unknown>) =>
  pb.collection('life_wheel_categories').update(id, data)

export const adminDeleteLWCategory = (id: string) =>
  pb.collection('life_wheel_categories').delete(id)

export const adminGetLWQuestions = (): Promise<LifeWheelQuestion[]> =>
  pb.collection('life_wheel_questions').getFullList({ sort: 'order', expand: 'category' })

export const adminCreateLWQuestion = (data: Record<string, unknown>) =>
  pb.collection('life_wheel_questions').create(data)

export const adminUpdateLWQuestion = (id: string, data: Record<string, unknown>) =>
  pb.collection('life_wheel_questions').update(id, data)

export const adminDeleteLWQuestion = (id: string) =>
  pb.collection('life_wheel_questions').delete(id)
