import pb from '@/lib/pocketbase/client'
import type { PlatformSettings } from '@/types'

export async function getPlatformSettings(): Promise<PlatformSettings | null> {
  try {
    const records = await pb.collection('platform_settings').getFullList()
    return records[0] || null
  } catch {
    return null
  }
}

export const updatePlatformSettings = (id: string, data: Record<string, any> | FormData) =>
  pb.collection('platform_settings').update(id, data as any)

export const createPlatformSettings = (data: Record<string, any> | FormData) =>
  pb.collection('platform_settings').create(data as any)
