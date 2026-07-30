export type UserLevel = 'Prata' | 'Ouro' | 'Diamante'

const LEVEL_ORDER: Record<string, number> = {
  Prata: 1,
  Ouro: 2,
  Diamante: 3,
}

export function getLevelOrder(level?: string): number {
  return LEVEL_ORDER[level || 'Prata'] || 1
}

export function canAccessCommunity(level?: string): boolean {
  return getLevelOrder(level) >= LEVEL_ORDER.Ouro
}

export function canAccessCourse(
  courseLevel: string | undefined,
  userLevel: string | undefined,
): boolean {
  if (!courseLevel || courseLevel === 'all') return true
  return getLevelOrder(userLevel) >= getLevelOrder(courseLevel)
}

export function isPrata(level?: string): boolean {
  return (level || 'Prata') === 'Prata'
}

export function getDefaultLevel(): UserLevel {
  return 'Prata'
}
