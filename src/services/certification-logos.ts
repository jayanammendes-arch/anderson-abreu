import pb from '@/lib/pocketbase/client'
import type { CertificationLogo } from '@/types'

export const getCertificationLogos = (): Promise<CertificationLogo[]> =>
  pb.collection('certification_logos').getFullList({ sort: 'order' })

export const adminGetCertificationLogos = (): Promise<CertificationLogo[]> =>
  pb.collection('certification_logos').getFullList({ sort: 'order' })

export const createCertificationLogo = (data: FormData | Record<string, unknown>) =>
  pb.collection('certification_logos').create(data)

export const updateCertificationLogo = (id: string, data: FormData | Record<string, unknown>) =>
  pb.collection('certification_logos').update(id, data)

export const deleteCertificationLogo = (id: string) =>
  pb.collection('certification_logos').delete(id)

export function getCertificationLogoUrl(logo: { id: string; image?: string }): string | null {
  if (logo.image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/certification_logos/${logo.id}/${logo.image}`
  }
  return null
}
