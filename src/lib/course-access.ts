export function filterByAccessType<T extends { access_type?: string }>(
  courses: T[],
  isPatient: boolean,
): T[] {
  return courses.filter((c) => {
    if (c.access_type === 'patient' && !isPatient) return false
    return true
  })
}

export function hasCourseAccess(accessType: string | undefined, hasAccessRecord: boolean): boolean {
  if (accessType === 'free') return true
  return hasAccessRecord
}
