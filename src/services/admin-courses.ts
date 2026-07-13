import pb from '@/lib/pocketbase/client'

export const adminGetCourses = () => pb.collection('courses').getFullList({ sort: 'order' })

export const adminGetCourse = (id: string) => pb.collection('courses').getOne(id)

export const adminCreateCourse = (data: Record<string, unknown> | FormData) =>
  pb.collection('courses').create(data)

export const adminUpdateCourse = (id: string, data: Record<string, unknown> | FormData) =>
  pb.collection('courses').update(id, data)

export const adminDeleteCourse = (id: string) => pb.collection('courses').delete(id)

export const adminGetModules = (courseId: string) =>
  pb.collection('modules').getFullList({ filter: `course = "${courseId}"`, sort: 'order' })

export const adminCreateModule = (data: {
  course: string
  title: string
  order: number
  description?: string
}) => pb.collection('modules').create(data)

export const adminUpdateModule = (
  id: string,
  data: { title?: string; order?: number; description?: string },
) => pb.collection('modules').update(id, data)

export const adminDeleteModule = (id: string) => pb.collection('modules').delete(id)

export const adminGetLessons = (moduleId: string) =>
  pb.collection('lessons').getFullList({ filter: `module = "${moduleId}"`, sort: 'order' })

export const adminCreateLesson = (data: Record<string, unknown>) =>
  pb.collection('lessons').create(data)

export const adminUpdateLesson = (id: string, data: Record<string, unknown>) =>
  pb.collection('lessons').update(id, data)

export const adminDeleteLesson = (id: string) => pb.collection('lessons').delete(id)

export const adminGetCourseAccessCount = async (courseId: string) => {
  const result = await pb.collection('user_access').getList(1, 1, {
    filter: `course = "${courseId}"`,
  })
  return result.totalItems
}

export const adminGetQuizByModule = async (moduleId: string) => {
  try {
    return await pb.collection('quizzes').getFirstListItem(`module = "${moduleId}"`)
  } catch {
    return null
  }
}

export const adminCreateQuiz = (data: {
  module: string
  title: string
  min_score?: number
  is_active?: boolean
}) => pb.collection('quizzes').create(data)

export const adminUpdateQuiz = (
  id: string,
  data: { title?: string; min_score?: number; is_active?: boolean },
) => pb.collection('quizzes').update(id, data)

export const adminDeleteQuiz = (id: string) => pb.collection('quizzes').delete(id)

export const adminGetQuizQuestions = (quizId: string) =>
  pb.collection('quiz_questions').getFullList({ filter: `quiz = "${quizId}"`, sort: 'created' })

export const adminCreateQuizQuestion = (data: {
  quiz: string
  question: string
  options: string[]
  correct_answer: number
}) => pb.collection('quiz_questions').create(data)

export const adminUpdateQuizQuestion = (
  id: string,
  data: { question?: string; options?: string[]; correct_answer?: number },
) => pb.collection('quiz_questions').update(id, data)

export const adminDeleteQuizQuestion = (id: string) => pb.collection('quiz_questions').delete(id)

export async function adminGetCourseWorkload(courseId: string): Promise<number> {
  const modules = (await adminGetModules(courseId)) as Array<{ id: string }>
  if (modules.length === 0) return 0
  const moduleIds = modules.map((m) => m.id)
  const filter = moduleIds.map((id: string) => `module = "${id}"`).join(' || ')
  const lessons = (await pb.collection('lessons').getFullList({ filter })) as Array<{
    duration_minutes?: number
  }>
  const totalMinutes = lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)
  return Math.round((totalMinutes / 60) * 10) / 10
}
