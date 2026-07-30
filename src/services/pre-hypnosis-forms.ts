import pb from '@/lib/pocketbase/client'
import type { PreHypnosisForm } from '@/types'

export async function getPreHypnosisForm(userId: string): Promise<PreHypnosisForm | null> {
  try {
    return (await pb
      .collection('pre_hypnosis_forms')
      .getFirstListItem(`user = "${userId}"`)) as PreHypnosisForm
  } catch {
    return null
  }
}

export function createPreHypnosisForm(data: {
  user: string
  responses: Record<string, string>
  completed: boolean
}) {
  return pb.collection('pre_hypnosis_forms').create(data)
}

export function updatePreHypnosisForm(
  id: string,
  data: Partial<{ responses: Record<string, string>; completed: boolean }>,
) {
  return pb.collection('pre_hypnosis_forms').update(id, data)
}

export async function getPreHypnosisFormByUserId(userId: string): Promise<PreHypnosisForm | null> {
  return getPreHypnosisForm(userId)
}
