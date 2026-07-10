import { useState, useEffect, useCallback } from 'react'
import {
  adminGetMaterialsByLesson,
  adminGetMaterialsByModule,
  adminCreateMaterial,
  adminDeleteMaterial,
  getMaterialFileUrl,
} from '@/services/lesson-materials'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Trash2, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { LessonMaterial } from '@/types'

interface MaterialsManagerProps {
  ownerType: 'module' | 'lesson'
  ownerId: string
}

function formatBytes(bytes: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function MaterialsManager({ ownerType, ownerId }: MaterialsManagerProps) {
  const [materials, setMaterials] = useState<LessonMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [label, setLabel] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const loadData = useCallback(async () => {
    try {
      const items =
        ownerType === 'module'
          ? await adminGetMaterialsByModule(ownerId)
          : await adminGetMaterialsByLesson(ownerId)
      setMaterials(items)
    } catch {
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }, [ownerType, ownerId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append(ownerType, ownerId)
      fd.append('file', file)
      fd.append('label', label || file.name)
      fd.append('file_size', String(file.size))
      await adminCreateMaterial(fd)
      setLabel('')
      setFile(null)
      loadData()
      toast.success('Material adicionado')
    } catch {
      toast.error('Erro ao enviar arquivo')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminDeleteMaterial(id)
      loadData()
      toast.success('Material excluído')
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[120px] space-y-1">
          <Label className="text-xs">Nome do material</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Apostila Módulo 1"
            className="h-8 text-sm"
          />
        </div>
        <Input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="h-8 text-sm w-auto"
        />
        <Button
          size="sm"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
      </div>
      {materials.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">Nenhum material cadastrado.</p>
      ) : (
        <div className="space-y-2">
          {materials.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 rounded-lg border border-border/30 p-2"
            >
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{m.label}</p>
                {m.file_size ? (
                  <p className="text-xs text-muted-foreground">{formatBytes(m.file_size)}</p>
                ) : null}
              </div>
              <a
                href={getMaterialFileUrl(m)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Ver
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500"
                onClick={() => handleDelete(m.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
