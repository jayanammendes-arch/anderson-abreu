import pb from '@/lib/pocketbase/client'

export function getFileUrl(
  collectionName: string,
  recordId: string,
  filename: string | null | undefined,
  thumb?: string,
): string {
  if (!filename) return ''
  const base = pb.baseUrl || import.meta.env.VITE_POCKETBASE_URL
  const url = `${base}/api/files/${collectionName}/${recordId}/${filename}`
  return thumb ? `${url}?thumb=${thumb}` : url
}

export function getRecordFileUrl(
  record: { id: string; collectionName?: string } | null | undefined,
  filename: string | null | undefined,
  thumb?: string,
): string {
  if (!record || !filename) return ''
  return getFileUrl(record.collectionName || 'platform_settings', record.id, filename, thumb)
}
