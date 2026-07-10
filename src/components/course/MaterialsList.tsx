import { useEffect, useState } from 'react'
import {
  getMaterialsByLesson,
  getMaterialsByModule,
  getMaterialFileUrl,
} from '@/services/lesson-materials'
import { useRealtime } from '@/hooks/use-realtime'
import { FileText, Download, Loader2 } from 'lucide-react'
import type { LessonMaterial } from '@/types'

interface MaterialsListProps {
  lessonId: string
  moduleId?: string
}

export function MaterialsList({ lessonId, moduleId }: MaterialsListProps) {
  const [lessonMaterials, setLessonMaterials] = useState<LessonMaterial[]>([])
  const [moduleMaterials, setModuleMaterials] = useState<LessonMaterial[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const lessonMats = await getMaterialsByLesson(lessonId)
      setLessonMaterials(lessonMats)
      if (moduleId) {
        const moduleMats = await getMaterialsByModule(moduleId)
        setModuleMaterials(moduleMats)
      } else {
        setModuleMaterials([])
      }
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

  if (loading)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  if (lessonMaterials.length === 0 && moduleMaterials.length === 0) return null

  const renderMaterial = (m: LessonMaterial) => (
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
  )

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
