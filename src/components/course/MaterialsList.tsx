import { useEffect, useState } from 'react'
import {
  getMaterialsByLesson,
  getMaterialsByModule,
  getMaterialFileUrl,
} from '@/services/lesson-materials'
import { useRealtime } from '@/hooks/use-realtime'
import { downloadAndCacheFile, isUrlCached } from '@/lib/offline-cache'
import { Button } from '@/components/ui/button'
import { FileText, Download, Loader2, WifiOff, CheckCircle2 } from 'lucide-react'
import type { LessonMaterial } from '@/types'

interface MaterialsListProps {
  lessonId: string
  moduleId?: string
}

export function MaterialsList({ lessonId, moduleId }: MaterialsListProps) {
  const [lessonMaterials, setLessonMaterials] = useState<LessonMaterial[]>([])
  const [moduleMaterials, setModuleMaterials] = useState<LessonMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [cachedUrls, setCachedUrls] = useState<Set<string>>(new Set())
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const lessonMats = await getMaterialsByLesson(lessonId)
      const moduleMats = moduleId ? await getMaterialsByModule(moduleId) : []
      setLessonMaterials(lessonMats)
      setModuleMaterials(moduleMats)

      const allMats = [...lessonMats, ...moduleMats]
      const cached = new Set<string>()
      await Promise.all(
        allMats.map(async (m) => {
          const url = getMaterialFileUrl(m)
          if (await isUrlCached(url)) cached.add(url)
        }),
      )
      setCachedUrls(cached)
    } catch {
      setLessonMaterials([])
      setModuleMaterials([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [lessonId, moduleId])
  useRealtime('lesson_materials', () => {
    loadData()
  })

  const handleDownload = async (m: LessonMaterial) => {
    const url = getMaterialFileUrl(m)
    setDownloadingId(m.id)
    try {
      await downloadAndCacheFile(url, m.label || 'material')
      setCachedUrls((prev) => new Set(prev).add(url))
    } catch {
      // Error - silently fail
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  if (lessonMaterials.length === 0 && moduleMaterials.length === 0) return null

  const renderMaterial = (m: LessonMaterial) => {
    const url = getMaterialFileUrl(m)
    const isCached = cachedUrls.has(url)
    const isDownloading = downloadingId === m.id

    return (
      <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
        <FileText className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm truncate block">{m.label}</span>
          {isCached && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-0.5">
              <WifiOff className="h-3 w-3" /> Disponível offline
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDownload(m)}
          disabled={isDownloading}
          className="shrink-0"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isCached ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Baixar
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-1" /> Baixar
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {moduleMaterials.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Materiais do Módulo
          </h3>
          {moduleMaterials.map(renderMaterial)}
        </div>
      )}
      {lessonMaterials.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Materiais da Aula
          </h3>
          {lessonMaterials.map(renderMaterial)}
        </div>
      )}
    </div>
  )
}
