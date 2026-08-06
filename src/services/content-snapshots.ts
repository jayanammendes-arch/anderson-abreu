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

export const selectiveRestoreSnapshot = (
  categoryId: string,
  snapshotId: string,
  fields: string[],
) =>
  pb.send(`/backend/v1/treatment-categories/${categoryId}/restore-selective/${snapshotId}`, {
    method: 'POST',
    body: JSON.stringify({ fields }),
    headers: { 'Content-Type': 'application/json' },
  })
