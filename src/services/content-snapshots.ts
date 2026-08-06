import pb from '@/lib/pocketbase/client'
import type { ContentSnapshot } from '@/types'

export const getSnapshots = (recordId: string): Promise<ContentSnapshot[]> =>
  pb.collection('content_snapshots').getFullList({
    filter: `record_id = "${recordId}"`,
    sort: '-created',
    expand: 'user',
  })

export const restoreSnapshot = (categoryId: string, snapshotId: string) =>
  pb.send(`/backend/v1/treatment-categories/${categoryId}/restore/${snapshotId}`, {
    method: 'POST',
  })
