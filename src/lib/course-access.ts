const LEVEL_ORDER: Record<string, number> = { Prata: 1, Ouro: 2, Diamante: 3 }

function getLevelOrder(level?: string): number {
  return LEVEL_ORDER[level || 'Prata'] || 1
}

export function filterByAccessType<T extends { access_type?: string; level?: string }>(
  courses: T[],
  userLevel: string,
): T[] {
  return courses.filter((c) => {
    if (c.access_type === 'hypnosis') {
      return getLevelOrder(userLevel) >= getLevelOrder('Ouro')
    }
    if (c.level && c.level !== 'all') {
      return getLevelOrder(userLevel) >= getLevelOrder(c.level)
    }
    return true
  })
}

export function hasCourseAccess(accessType: string | undefined, hasAccessRecord: boolean): boolean {
  if (accessType === 'free') return true
  return hasAccessRecord
}
