import pb from '@/lib/pocketbase/client'
import type { AppNotification } from '@/types'

export function getNotifications(userId: string) {
  return pb.collection('notifications').getList(1, 20, {
    filter: `user = "${userId}"`,
    sort: '-created',
  })
}

export function getUnreadCount(userId: string): Promise<number> {
  return pb.collection('notifications').count(`user = "${userId}" && read = false`)
}

export function markAsRead(id: string) {
  return pb.collection('notifications').update(id, { read: true })
}

export async function markAllAsRead(userId: string) {
  const items = (await pb.collection('notifications').getFullList({
    filter: `user = "${userId}" && read = false`,
  })) as AppNotification[]
  await Promise.all(
    items.map((item) => pb.collection('notifications').update(item.id, { read: true })),
  )
}
