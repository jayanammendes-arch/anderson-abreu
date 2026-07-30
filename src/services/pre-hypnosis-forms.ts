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
  nome: string
  telefone: string
  motivo_da_busca: string
  informacoes_de_saude: string
  medicamentos: string
  expectativas: string
}) {
  return pb.collection('pre_hypnosis_forms').create(data)
}

export async function getPreHypnosisFormByUserId(userId: string): Promise<PreHypnosisForm | null> {
  return getPreHypnosisForm(userId)
}
