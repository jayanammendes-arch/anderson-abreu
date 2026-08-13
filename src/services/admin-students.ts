import pb from '@/lib/pocketbase/client'
import type { UserAccess } from '@/types'

export const adminGetStudents = (search?: string) => {
  const options: any = { sort: '-created' }
  if (search && search.trim()) {
    options.filter = `name ~ "${search.trim()}" || email ~ "${search.trim()}"`
  }
  return pb.collection('users').getFullList(options)
}

export const adminGetStudentAccess = (userId: string): Promise<UserAccess[]> =>
  pb.collection('user_access').getFullList({ filter: `user = "${userId}"`, expand: 'course' })

export const adminGrantAccess = (userId: string, courseId: string) =>
  pb.collection('user_access').create({ user: userId, course: courseId })

export const adminRevokeAccess = (accessId: string) => pb.collection('user_access').delete(accessId)

export const adminUpdateLevel = (userId: string, level: string) =>
  pb.collection('users').update(userId, { level })

export const adminUpdateComecePorAquiAccess = (userId: string, enabled: boolean) =>
  pb.collection('users').update(userId, { comece_por_aqui_access: enabled })

export const adminUpdateAdminStatus = (userId: string, isAdmin: boolean) =>
  pb.collection('users').update(userId, { is_admin: isAdmin })

export const adminGetUsersByLevel = (level: string) =>
  pb.collection('users').getFullList({ filter: `level = "${level}"`, sort: '-created' })

export const adminGetHypnosisUsers = () =>
  pb.collection('users').getFullList({ filter: `is_patient = true`, sort: '-created' })

export const adminUpdateStudent = async (
  userId: string,
  data: {
    name?: string
    email?: string
    phone?: string
    instagram_handle?: string
    birth_date?: string
  },
) => {
  const payload: Record<string, unknown> = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.phone !== undefined) payload.phone = data.phone
  if (data.instagram_handle !== undefined) payload.instagram_handle = data.instagram_handle
  if (data.birth_date !== undefined) payload.birth_date = data.birth_date

  if (data.email !== undefined) {
    try {
      const current = await pb.collection('users').getOne(userId)
      if (current.email !== data.email) {
        payload.email = data.email
        payload.emailConfirm = data.email
      }
    } catch {
      payload.email = data.email
      payload.emailConfirm = data.email
    }
  }

  return pb.collection('users').update(userId, payload)
}
