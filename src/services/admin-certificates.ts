import pb from '@/lib/pocketbase/client'

export interface AdminCertificate {
  id: string
  user: string
  userName: string
  course: string
  courseTitle: string
  issue_date: string
  workload_at_issue: number | null
  instructor_at_issue: string
  created: string
  certificate_file: string
}

export const adminGetCertificates = async (): Promise<AdminCertificate[]> =>
  pb.send('/backend/v1/admin/certificates', { method: 'GET' })

export const adminDeleteCertificate = (id: string) => pb.collection('certificates').delete(id)

export const getCertificateFileUrl = (cert: AdminCertificate): string | null =>
  cert.certificate_file
    ? `${pb.baseUrl}/api/files/certificates/${cert.id}/${cert.certificate_file}`
    : null
