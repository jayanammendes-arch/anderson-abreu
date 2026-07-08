import pb from '@/lib/pocketbase/client'
import type { Module } from '@/types'

export const getModulesByCourse = (courseId: string): Promise<Module[]> =>
  pb.collection('modules').getFullList({ filter: `course = "${courseId}"`, sort: 'order' })
