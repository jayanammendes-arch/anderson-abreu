import pb from '@/lib/pocketbase/client'
import type { Module, Lesson } from '@/types'

export const adminGetCourses = () => pb.collection('courses').getFullList({ sort: 'order' })

export const adminGetCourse = (id: string) => pb.collection('courses').getOne(id)

export const adminCreateCourse = (data: Record<string, any>) =>
  pb.collection('courses').create(data)

export const adminUpdateCourse = (id: string, data: Record<string, any>) =>
  pb.collection('courses').update(id, data)

export const adminDeleteCourse = (id: string) => pb.collection('courses').delete(id)

export const adminGetModules = (courseId: string): Promise<Module[]> =>
  pb.collection('modules').getFullList({ filter: `course = "${courseId}"`, sort: 'order' })

export const adminCreateModule = (data: { course: string; title: string; order: number }) =>
  pb.collection('modules').create(data)

export const adminUpdateModule = (id: string, data: Partial<{ title: string; order: number }>) =>
  pb.collection('modules').update(id, data)

export const adminDeleteModule = (id: string) => pb.collection('modules').delete(id)

export const adminGetLessons = (moduleId: string): Promise<Lesson[]> =>
  pb.collection('lessons').getFullList({ filter: `module = "${moduleId}"`, sort: 'order' })

export const adminCreateLesson = (data: Record<string, any>) =>
  pb.collection('lessons').create(data)

export const adminUpdateLesson = (id: string, data: Record<string, any>) =>
  pb.collection('lessons').update(id, data)

export const adminDeleteLesson = (id: string) => pb.collection('lessons').delete(id)

export const adminGetCourseAccessCount = async (courseId: string): Promise<number> => {
  try {
    const records = await pb
      .collection('user_access')
      .getFullList({ filter: `course = "${courseId}"` })
    return records.length
  } catch {
    return 0
  }
}
