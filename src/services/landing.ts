import pb from '@/lib/pocketbase/client'
import type { Event, Course } from '@/types'

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
  pb.collection('courses').getFullList({ sort: 'order' })
