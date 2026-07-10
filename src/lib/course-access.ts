export function filterByAccessType<T extends { access_type?: string }>(
  courses: T[],
  hasHypnosisTag: boolean,
): T[] {
  return courses.filter((c) => {
    if (c.access_type === 'hypnosis' && !hasHypnosisTag) return false
    return true
  })
}

export function hasCourseAccess(accessType: string | undefined, hasAccessRecord: boolean): boolean {
  if (accessType === 'free') return true
  return hasAccessRecord
}
