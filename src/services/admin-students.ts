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

export const adminGetUsersByLevel = (level: string) =>
  pb.collection('users').getFullList({ filter: `level = "${level}"`, sort: '-created' })

export const adminGetHypnosisUsers = () =>
  pb.collection('users').getFullList({ filter: `is_patient = true`, sort: '-created' })

export const adminUpdateStudent = (
  userId: string,
  data: {
    name?: string
    email?: string
    phone?: string
    instagram_handle?: string
    birth_date?: string
  },
) => pb.collection('users').update(userId, data)
