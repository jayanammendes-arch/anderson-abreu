import pb from '@/lib/pocketbase/client'
import type { LessonMaterial } from '@/types'

export const getMaterialsByLesson = (lessonId: string): Promise<LessonMaterial[]> =>
  pb
    .collection('lesson_materials')
    .getFullList({ filter: `lesson = "${lessonId}"`, sort: 'created' }) as Promise<LessonMaterial[]>

export function getMaterialFileUrl(material: LessonMaterial): string {
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/lesson_materials/${material.id}/${material.file}`
}

export const adminGetMaterialsByLesson = (lessonId: string): Promise<LessonMaterial[]> =>
  pb
    .collection('lesson_materials')
    .getFullList({ filter: `lesson = "${lessonId}"`, sort: 'created' }) as Promise<LessonMaterial[]>

export const adminCreateMaterial = (data: FormData) =>
  pb.collection('lesson_materials').create(data)

export const adminDeleteMaterial = (id: string) => pb.collection('lesson_materials').delete(id)
