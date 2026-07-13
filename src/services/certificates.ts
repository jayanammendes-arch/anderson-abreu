import pb from '@/lib/pocketbase/client'
import type { Certificate } from '@/types'

export async function getCertificates(userId: string): Promise<Certificate[]> {
  return pb.collection('certificates').getFullList({
    filter: `user = "${userId}"`,
    sort: '-created',
    expand: 'course',
  }) as Promise<Certificate[]>
}

export async function downloadCertificatePdf(id: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/certificates/${id}/pdf`,
    { headers: { Authorization: pb.authStore.token || '' } },
  )
  if (!response.ok) throw new Error('Failed to download certificate')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `certificado-${id}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export async function previewTestCertificate(): Promise<void> {
  const popup = window.open('about:blank', '_blank')
  try {
    const response = await fetch(
      `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/certificates/preview/pdf`,
      { headers: { Authorization: pb.authStore.token || '' } },
    )
    if (!response.ok) throw new Error('Failed to generate preview')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    if (popup) {
      popup.location.href = url
    } else {
      window.open(url, '_blank')
    }
    setTimeout(() => window.URL.revokeObjectURL(url), 60000)
  } catch (err) {
    if (popup) popup.close()
    throw err
  }
}
