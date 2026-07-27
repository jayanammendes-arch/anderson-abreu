import pb from '@/lib/pocketbase/client'
import type { Testimonial } from '@/types'

export const getActiveTestimonials = (): Promise<Testimonial[]> =>
  pb.collection('testimonials').getFullList({
    filter: 'is_active = true',
    sort: 'order',
    expand: 'course',
  })

export const getTestimonialImageUrl = (testimonial: Testimonial): string | null => {
  if (!testimonial.student_image) return null
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/testimonials/${testimonial.id}/${testimonial.student_image}`
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return `https://www.youtube.com/embed/${match[1]}`
  }
  return null
}

export function getYouTubeThumbnail(url: string): string | null {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
  }
  return null
}

export const adminGetTestimonials = (): Promise<Testimonial[]> =>
  pb.collection('testimonials').getFullList({ sort: 'order', expand: 'course' })

export const adminCreateTestimonial = (data: Record<string, unknown> | FormData) =>
  pb.collection('testimonials').create(data)

export const adminUpdateTestimonial = (id: string, data: Record<string, unknown> | FormData) =>
  pb.collection('testimonials').update(id, data)

export const adminDeleteTestimonial = (id: string) => pb.collection('testimonials').delete(id)

export const adminReorderTestimonials = (items: { id: string; order: number }[]) =>
  Promise.all(
    items.map((item) => pb.collection('testimonials').update(item.id, { order: item.order })),
  )
