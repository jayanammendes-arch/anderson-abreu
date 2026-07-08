import pb from '@/lib/pocketbase/client'
import type { Lesson } from '@/types'

export const getLessonsByModule = (moduleId: string): Promise<Lesson[]> =>
  pb.collection('lessons').getFullList({ filter: `module = "${moduleId}"`, sort: 'order' })

export async function getLessonsByModuleIds(moduleIds: string[]): Promise<Lesson[]> {
  if (moduleIds.length === 0) return []
  const filter = moduleIds.map((id) => `module = "${id}"`).join(' || ')
  return pb.collection('lessons').getFullList({ filter, sort: 'order' })
}
