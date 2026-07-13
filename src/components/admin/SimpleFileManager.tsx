import { useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Trash2, Upload, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface SimpleFileManagerProps {
  collection: 'modules' | 'lessons'
  recordId: string
  field: string
  files: string[]
  onUpdated: () => void
}

export function SimpleFileManager({
  collection,
  recordId,
  field,
  files,
  onUpdated,
}: SimpleFileManagerProps) {
  const [uploading, setUploading] = useState(false)
  const baseUrl = `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${collection}/${recordId}`

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    try {
      const fd = new FormData()
      ;(files || []).forEach((f) => fd.append(field, f))
      for (let i = 0; i < fileList.length; i++) {
        fd.append(field, fileList[i])
      }
      await pb.collection(collection).update(recordId, fd)
      onUpdated()
      toast.success('Arquivo enviado')
    } catch {
      toast.error('Erro ao enviar arquivo')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (filename: string) => {
    try {
      const fd = new FormData()
      ;(files || []).filter((f) => f !== filename).forEach((f) => fd.append(field, f))
      await pb.collection(collection).update(recordId, fd)
      onUpdated()
      toast.success('Arquivo excluído')
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-2">
      <label className="cursor-pointer inline-flex items-center gap-1 text-xs text-primary hover:underline">
        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        Enviar PDF
        <input
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      {files && files.length > 0 ? (
        <div className="space-y-1">
          {files.map((f, i) => (
            <div
              key={f + i}
              className="flex items-center gap-2 rounded border border-border/30 p-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
              <a
                href={`${baseUrl}/${f}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs truncate flex-1 hover:underline"
              >
                {f}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 shrink-0"
                onClick={() => handleDelete(f)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Nenhum material.</p>
      )}
    </div>
  )
}
