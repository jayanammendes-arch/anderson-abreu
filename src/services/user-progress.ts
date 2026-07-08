import pb from '@/lib/pocketbase/client'
import type { UserProgress } from '@/types'

export const getUserProgress = (userId: string): Promise<UserProgress[]> =>
  pb.collection('user_progress').getFullList({ filter: `user = "${userId}"` })

export async function setLessonProgress(
  userId: string,
  lessonId: string,
  completed: boolean,
): Promise<UserProgress> {
  try {
    const existing = await pb
      .collection('user_progress')
      .getFirstListItem(`user = "${userId}" && lesson = "${lessonId}"`)
    return await pb.collection('user_progress').update(existing.id, { completed })
  } catch {
    return await pb
      .collection('user_progress')
      .create({ user: userId, lesson: lessonId, completed })
  }
}

export function isLessonCompleted(progress: UserProgress[], lessonId: string): boolean {
  return progress.some((p) => p.lesson === lessonId && p.completed)
}
