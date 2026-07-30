const RUNTIME_CACHE = 'pwa-runtime-v1'

export async function isUrlCached(url: string): Promise<boolean> {
  try {
    const cache = await caches.open(RUNTIME_CACHE)
    const match = await cache.match(url)
    return !!match
  } catch {
    return false
  }
}

export async function downloadAndCacheFile(url: string, filename: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Falha ao baixar arquivo')
  const blob = await response.blob()

  try {
    const cache = await caches.open(RUNTIME_CACHE)
    const cacheResponse = new Response(blob)
    await cache.put(url, cacheResponse)
  } catch {
    // Caching fails silently — download still works
  }

  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(objectUrl)
}

const VIEWED_LESSONS_KEY = 'pwa-viewed-lessons'

export function markLessonViewed(lessonId: string): void {
  try {
    const viewed: string[] = JSON.parse(localStorage.getItem(VIEWED_LESSONS_KEY) || '[]')
    if (!viewed.includes(lessonId)) {
      viewed.push(lessonId)
      localStorage.setItem(VIEWED_LESSONS_KEY, JSON.stringify(viewed))
    }
  } catch {
    // localStorage unavailable
  }
}

export function isLessonViewed(lessonId: string): boolean {
  try {
    const viewed: string[] = JSON.parse(localStorage.getItem(VIEWED_LESSONS_KEY) || '[]')
    return viewed.includes(lessonId)
  } catch {
    return false
  }
}

export function isOnline(): boolean {
  return navigator.onLine
}
