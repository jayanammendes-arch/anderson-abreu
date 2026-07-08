import pb from '@/lib/pocketbase/client'
import type {
  Course,
  CourseWithProgress,
  CourseDetailData,
  Module,
  Lesson,
  UserProgress,
} from '@/types'

export const getCourses = (): Promise<Course[]> =>
  pb.collection('courses').getFullList({ sort: 'order' })

export const getCourse = (id: string): Promise<Course> => pb.collection('courses').getOne(id)

export function getThumbnailUrl(course: Course): string {
  if (course.thumbnail) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/courses/${course.id}/${course.thumbnail}`
  }
  return `https://img.usecurling.com/p/600/400?q=${encodeURIComponent(course.title)}&color=blue`
}

export async function getCoursesWithProgress(userId: string): Promise<CourseWithProgress[]> {
  const courses = (await pb.collection('courses').getFullList({ sort: 'order' })) as Course[]
  const modules = (await pb.collection('modules').getFullList({ sort: 'order' })) as Module[]
  const lessons = (await pb.collection('lessons').getFullList({ sort: 'order' })) as Lesson[]
  const progress = (await pb
    .collection('user_progress')
    .getFullList({ filter: `user = "${userId}"` })) as UserProgress[]

  return courses.map((course) => {
    const courseModules = modules.filter((m) => m.course === course.id)
    const moduleIds = courseModules.map((m) => m.id)
    const courseLessons = lessons.filter((l) => moduleIds.includes(l.module))
    const completedCount = courseLessons.filter((l) =>
      progress.some((p) => p.lesson === l.id && p.completed),
    ).length
    const totalLessons = courseLessons.length
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

    return {
      ...course,
      modules: courseModules,
      lessons: courseLessons,
      completedCount,
      totalLessons,
      progress: progressPercent,
    }
  })
}

export async function getCourseDetailData(
  courseId: string,
  userId: string,
): Promise<CourseDetailData> {
  const course = (await pb.collection('courses').getOne(courseId)) as Course
  const modules = (await pb
    .collection('modules')
    .getFullList({ filter: `course = "${courseId}"`, sort: 'order' })) as Module[]
  const moduleIds = modules.map((m) => m.id)
  const lessons =
    moduleIds.length > 0
      ? ((await pb
          .collection('lessons')
          .getFullList({
            filter: moduleIds.map((id) => `module = "${id}"`).join(' || '),
            sort: 'order',
          })) as Lesson[])
      : []
  const progress = (await pb
    .collection('user_progress')
    .getFullList({ filter: `user = "${userId}"` })) as UserProgress[]

  return { course, modules, lessons, progress }
}
