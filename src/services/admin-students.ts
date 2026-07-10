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

export const adminGetHypnosisUsers = () =>
  pb.collection('users').getFullList({ filter: 'is_hypnosis = true', sort: '-created' })

export const adminToggleHypnosis = (userId: string, value: boolean) =>
  pb.collection('users').update(userId, { is_hypnosis: value })
