import { SNAPSHOT_FIELDS, type SnapshotFieldDef } from '@/lib/snapshot-fields'

export type DiffStatus = 'added' | 'removed' | 'modified' | 'unchanged'

export interface LineDiffEntry {
  type: 'added' | 'removed' | 'unchanged'
  content: string
}

export interface FieldDiff {
  key: string
  label: string
  type: string
  status: DiffStatus
  oldValue: string
  newValue: string
  lineDiff: LineDiffEntry[]
}

export function parseSnapshot(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  if (typeof raw === 'object' && raw !== null) return raw as Record<string, unknown>
  return {}
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeValue(value: unknown, type: string): string {
  if (value === null || value === undefined || value === '') return ''
  if (type === 'richtext') return stripHtml(String(value))
  if (type === 'json') {
    try {
      return JSON.stringify(typeof value === 'string' ? JSON.parse(value) : value, null, 2)
    } catch {
      return String(value)
    }
  }
  if (type === 'boolean') return value ? 'Sim' : 'Não'
  return String(value)
}

function lcsDiff(a: string[], b: string[]): LineDiffEntry[] {
  const m = a.length,
    n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
  const result: LineDiffEntry[] = []
  let i = m,
    j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'unchanged', content: a[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', content: b[j - 1] })
      j--
    } else {
      result.unshift({ type: 'removed', content: a[i - 1] })
      i--
    }
  }
  return result
}

export function computeFieldDiffs(oldRaw: unknown, newRaw: unknown): FieldDiff[] {
  const oldData = parseSnapshot(oldRaw)
  const newData = parseSnapshot(newRaw)
  return SNAPSHOT_FIELDS.map((field: SnapshotFieldDef) => {
    const oldValue = normalizeValue(oldData[field.key], field.type)
    const newValue = normalizeValue(newData[field.key], field.type)
    let status: DiffStatus = 'unchanged'
    if (!oldValue && newValue) status = 'added'
    else if (oldValue && !newValue) status = 'removed'
    else if (oldValue !== newValue) status = 'modified'
    const oldLines = oldValue ? oldValue.split('\n') : []
    const newLines = newValue ? newValue.split('\n') : []
    const lineDiff =
      status === 'unchanged'
        ? oldLines.map((l) => ({ type: 'unchanged' as const, content: l }))
        : lcsDiff(oldLines, newLines)
    return {
      key: field.key,
      label: field.label,
      type: field.type,
      status,
      oldValue,
      newValue,
      lineDiff,
    }
  })
}
