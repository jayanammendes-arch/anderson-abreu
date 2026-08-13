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
    const url = pb.files.getUrl(settings, settings.credentials_image)
    return url || null
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
    const url = pb.files.getUrl(settings, settings.faq_section_image)
    return url || null
  }
  return null
}

export function getHypnosisInfoImageUrl(settings: {
  id: string
  hypnosis_info_image?: string
}): string | null {
  if (settings.hypnosis_info_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.hypnosis_info_image}`
  }
  return null
}

export function getBlueBandImageUrl(settings: {
  id: string
  blue_band_image?: string
}): string | null {
  if (settings.blue_band_image) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/platform_settings/${settings.id}/${settings.blue_band_image}`
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

/**
 * Normalizes a color into the bare HSL component format Tailwind expects
 * for `--primary` (e.g. "46 65% 52%"), which is consumed as `hsl(var(--primary))`.
 * Writing a raw hex like "#D4AF37" directly into `--primary` produces an invalid
 * `hsl(#D4AF37)` and silently breaks every `bg-primary`/`text-primary` utility.
 */
function normalizeColorToHsl(color: string): string {
  if (!color) return color
  const trimmed = color.trim()

  // Already in Tailwind HSL component format (e.g. "46 65% 52%")
  if (/^\d+\s+\d+%\s+\d+%$/.test(trimmed)) return trimmed

  // hex (#RGB or #RRGGBB)
  const hexMatch = trimmed.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  if (hexMatch) {
    let hex = hexMatch[1]
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('')
    }
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    const d = max - min
    let h = 0
    let s = 0
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1))
      switch (max) {
        case r:
          h = ((g - b) / d) % 6
          break
        case g:
          h = (b - r) / d + 2
          break
        default:
          h = (r - g) / d + 4
          break
      }
      h *= 60
      if (h < 0) h += 360
    }
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  }

  // hsl(h, s%, l%) or hsl(h s% l%) -> bare components
  const hslMatch = trimmed.match(/^hsla?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%/)
  if (hslMatch) {
    return `${Math.round(parseFloat(hslMatch[1]))} ${Math.round(parseFloat(hslMatch[2]))}% ${Math.round(
      parseFloat(hslMatch[3]),
    )}%`
  }

  return trimmed
}

export function applyBrandColor(color: string): void {
  document.documentElement.style.setProperty('--primary', normalizeColorToHsl(color))
}

export function shouldShowLogo(
  settings: { show_logo?: boolean | string } | null | undefined,
): boolean {
  if (!settings) return true
  const val = settings.show_logo
  return val !== false && val !== 'false'
}
