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

export function getAboutPageImageUrl(settings: {
  id: string
  about_page_image?: string
}): string | null {
  if (settings.about_page_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.about_page_image}`
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

export function getAgendaImageUrl(settings: { id: string; agenda_image?: string }): string | null {
  if (settings.agenda_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.agenda_image}`
  }
  return null
}

export function getLoginImageUrl(settings: { id: string; login_image?: string }): string | null {
  if (settings.login_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.login_image}`
  }
  return null
}

export function getAgendarBackgroundImageUrl(settings: {
  id: string
  agendar_background_image?: string
}): string | null {
  if (settings.agendar_background_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.agendar_background_image}`
  }
  return null
}

export function getCredentialsImageUrl(settings: {
  id: string
  credentials_image?: string
}): string | null {
  if (settings.credentials_image) {
    return pb.files.getUrl(settings, settings.credentials_image)
  }
  return null
}

export function getHomeCredentialImageUrl(settings: {
  id: string
  home_credential_image?: string
}): string | null {
  if (settings.home_credential_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.home_credential_image}`
  }
  return null
}

export function getParallaxBackgroundImageUrl(settings: {
  id: string
  parallax_background_image?: string
}): string | null {
  if (settings.parallax_background_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.parallax_background_image}`
  }
  return null
}

export function getFaqSectionImageUrl(settings: {
  id: string
  faq_section_image?: string
}): string | null {
  if (settings.faq_section_image) {
    return pb.files.getUrl(settings, settings.faq_section_image)
  }
  return null
}

export function getAboutHeroImageUrl(settings: {
  id: string
  about_hero_image?: string
}): string | null {
  if (settings.about_hero_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.about_hero_image}`
  }
  return null
}

export function getAboutJourneyPhotoUrl(settings: {
  id: string
  about_journey_photo?: string
}): string | null {
  if (settings.about_journey_photo) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.about_journey_photo}`
  }
  return null
}

export function getAboutFormationsImageUrl(settings: {
  id: string
  about_formations_image?: string
}): string | null {
  if (settings.about_formations_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.about_formations_image}`
  }
  return null
}

export function getAboutCtaBackgroundImageUrl(settings: {
  id: string
  about_cta_background_image?: string
}): string | null {
  if (settings.about_cta_background_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.about_cta_background_image}`
  }
  return null
}

export function applyBrandColor(color: string): void {
  document.documentElement.style.setProperty('--primary', color)
}

export function shouldShowLogo(
  settings: { show_logo?: boolean | string } | null | undefined,
): boolean {
  if (!settings) return true
  const val = settings.show_logo
  return val !== false && val !== 'false'
}
