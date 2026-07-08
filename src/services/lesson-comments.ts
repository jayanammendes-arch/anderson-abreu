import pb from '@/lib/pocketbase/client'
import type { LessonComment } from '@/types'

export const getCommentsByLesson = (lessonId: string): Promise<LessonComment[]> =>
  pb.collection('lesson_comments').getFullList({
    filter: `lesson = "${lessonId}"`,
    sort: '-created',
    expand: 'user',
  }) as Promise<LessonComment[]>

export const createComment = (data: {
  lesson: string
  user: string
  content: string
}): Promise<LessonComment> =>
  pb.collection('lesson_comments').create(data) as Promise<LessonComment>

export const reactToComment = async (
  commentId: string,
  currentReactions: number,
): Promise<LessonComment> =>
  pb
    .collection('lesson_comments')
    .update(commentId, { reactions: currentReactions + 1 }) as Promise<LessonComment>
