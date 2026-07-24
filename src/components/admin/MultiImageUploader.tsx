import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Trash2, Loader2, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiImageUploaderProps {
  label: string
  existingImages: string[]
  onChange: (files: File[]) => void
  onRemoveExisting: (index: number) => void
  baseUrl: string
  maxImages?: number
}

export function MultiImageUploader({
  label,
  existingImages,
  onChange,
  onRemoveExisting,
  baseUrl,
  maxImages = 3,
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const remainingSlots = maxImages - existingImages.length - newFiles.length

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return
    const available = maxImages - existingImages.length - newFiles.length
    const toAdd = Array.from(fileList).slice(0, Math.max(0, available))
    if (toAdd.length > 0) {
      const updated = [...newFiles, ...toAdd]
      setNewFiles(updated)
      onChange(updated)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeNewFile = (idx: number) => {
    const updated = newFiles.filter((_, i) => i !== idx)
    setNewFiles(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {existingImages.length + newFiles.length}/{maxImages} imagens
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {existingImages.map((img, i) => (
          <div
            key={`existing-${i}`}
            className="relative group aspect-square rounded-lg overflow-hidden border border-border"
          >
            <img src={`${baseUrl}/${img}`} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemoveExisting(i)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}
        {newFiles.map((file, i) => (
          <div
            key={`new-${i}`}
            className="relative group aspect-square rounded-lg overflow-hidden border border-border"
          >
            <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeNewFile(i)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}
        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors',
              uploading && 'opacity-50 pointer-events-none',
            )}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Enviar</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleSelect}
        disabled={remainingSlots <= 0}
      />
      {remainingSlots <= 0 && (
        <p className="text-xs text-muted-foreground">Máximo de {maxImages} imagens atingido.</p>
      )}
    </div>
  )
}
