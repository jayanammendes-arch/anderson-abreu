import pb from '@/lib/pocketbase/client'
import type { Event, Course, FAQ, PlatformSettings } from '@/types'

export const getEvents = (): Promise<Event[]> =>
  pb.collection('events').getFullList({ sort: '-date' })

export const createEvent = (data: FormData | Record<string, any>) =>
  pb.collection('events').create(data)

export const updateEvent = (id: string, data: FormData | Record<string, any>) =>
  pb.collection('events').update(id, data)

export function getEventImageUrl(event: { id: string; image?: string }): string | null {
  if (event.image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/events/${event.id}/${event.image}`
  }
  return null
}

export const deleteEvent = (id: string) => pb.collection('events').delete(id)

export const submitContact = (data: {
  name: string
  email: string
  phone: string
  message: string
}) => pb.collection('contact_submissions').create(data)

export const getPublicCourses = (): Promise<Course[]> =>
  pb.collection('courses').getFullList({
    filter: 'is_available = true && (visibility = "home" || visibility = "both")',
    sort: 'order',
  })

export const getFaqs = (): Promise<FAQ[]> => pb.collection('faqs').getFullList({ sort: 'order' })

export const getPlatformSettingsPublic = async (): Promise<PlatformSettings | null> => {
  try {
    const records = await pb.collection('platform_settings').getFullList()
    return records[0] || null
  } catch {
    return null
  }
}

export function getAboutImageUrl(settings: { id: string; about_image?: string }): string | null {
  if (settings.about_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.about_image}`
  }
  return null
}

export function getHomeHeroImageUrl(settings: {
  id: string
  home_hero_image?: string
}): string | null {
  if (settings.home_hero_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.home_hero_image}`
  }
  return null
}

export function getLogoUrl(settings: { id: string; logo?: string }): string | null {
  if (settings.logo) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.logo}`
  }
  return null
}
