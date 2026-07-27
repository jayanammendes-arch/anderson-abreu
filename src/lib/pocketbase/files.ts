import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export function getFileUrl(
  record: RecordModel,
  filename: string | undefined | null,
): string | null {
  if (!filename) return null
  return pb.files.getUrl(record, filename)
}
