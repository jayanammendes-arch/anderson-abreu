import pb from '@/lib/pocketbase/client'
import type {
  AboutGrandName,
  AboutMediaMention,
  AboutRecommendation,
  AboutEnvironmentImage,
} from '@/types'

export const getAboutGrandNames = (): Promise<AboutGrandName[]> =>
  pb.collection('about_grand_names').getFullList({ sort: 'order' })

export function getAboutGrandNameImageUrl(item: { id: string; image?: string }): string | null {
  return item.image
    ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/about_grand_names/${item.id}/${item.image}`
    : null
}

export const adminCreateAboutGrandName = (data: FormData) =>
  pb.collection('about_grand_names').create(data)

export const adminUpdateAboutGrandName = (id: string, data: Record<string, unknown>) =>
  pb.collection('about_grand_names').update(id, data)

export const adminDeleteAboutGrandName = (id: string) =>
  pb.collection('about_grand_names').delete(id)

export const getAboutMediaMentions = (): Promise<AboutMediaMention[]> =>
  pb.collection('about_media_mentions').getFullList({ sort: 'order' })

export function getAboutMediaMentionImageUrl(item: { id: string; image?: string }): string | null {
  return item.image
    ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/about_media_mentions/${item.id}/${item.image}`
    : null
}

export const adminCreateAboutMediaMention = (data: FormData) =>
  pb.collection('about_media_mentions').create(data)

export const adminDeleteAboutMediaMention = (id: string) =>
  pb.collection('about_media_mentions').delete(id)

export const getAboutRecommendations = (): Promise<AboutRecommendation[]> =>
  pb.collection('about_recommendations').getFullList({ sort: 'order' })

export const adminCreateAboutRecommendation = (data: Record<string, unknown>) =>
  pb.collection('about_recommendations').create(data)

export const adminDeleteAboutRecommendation = (id: string) =>
  pb.collection('about_recommendations').delete(id)

export const getAboutEnvironmentImages = (): Promise<AboutEnvironmentImage[]> =>
  pb.collection('about_environment_images').getFullList({ sort: 'order' })

export function getAboutEnvironmentImageUrl(item: { id: string; image?: string }): string | null {
  return item.image
    ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/about_environment_images/${item.id}/${item.image}`
    : null
}

export const adminCreateAboutEnvironmentImage = (data: FormData) =>
  pb.collection('about_environment_images').create(data)

export const adminUpdateAboutEnvironmentImage = (id: string, data: Record<string, unknown>) =>
  pb.collection('about_environment_images').update(id, data)

export const adminDeleteAboutEnvironmentImage = (id: string) =>
  pb.collection('about_environment_images').delete(id)
