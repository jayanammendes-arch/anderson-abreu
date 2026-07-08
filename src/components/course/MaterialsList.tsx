import { useEffect, useState } from 'react'
import { getMaterialsByLesson, getMaterialFileUrl } from '@/services/lesson-materials'
import { useRealtime } from '@/hooks/use-realtime'
import { FileText, Download, Loader2 } from 'lucide-react'
import type { LessonMaterial } from '@/types'

export function MaterialsList({ lessonId }: { lessonId: string }) {
  const [materials, setMaterials] = useState<LessonMaterial[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setMaterials(await getMaterialsByLesson(lessonId))
    } catch {
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [lessonId])
  useRealtime('lesson_materials', () => {
    if (lessonId) loadData()
  })

  if (loading)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  if (materials.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Materiais
      </h3>
      {materials.map((m) => (
        <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <span className="flex-1 text-sm truncate">{m.label}</span>
          <a
            href={getMaterialFileUrl(m)}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Download className="h-4 w-4" /> Baixar
          </a>
        </div>
      ))}
    </div>
  )
}
