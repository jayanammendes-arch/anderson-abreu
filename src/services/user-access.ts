import pb from '@/lib/pocketbase/client'
import type { UserAccess } from '@/types'

export const getUserAccess = (userId: string): Promise<UserAccess[]> =>
  pb.collection('user_access').getFullList({ filter: `user = "${userId}"` })

export const grantAccess = (userId: string, courseId: string) =>
  pb.collection('user_access').create({ user: userId, course: courseId })

export const revokeAccess = (id: string) => pb.collection('user_access').delete(id)

export async function hasCourseAccess(userId: string, courseId: string): Promise<boolean> {
  try {
    await pb
      .collection('user_access')
      .getFirstListItem(`user = "${userId}" && course = "${courseId}"`)
    return true
  } catch {
    return false
  }
}
