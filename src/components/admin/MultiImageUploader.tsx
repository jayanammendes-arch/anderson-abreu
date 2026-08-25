import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Trash2, Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiImageUploaderProps {
  label: string
  existingImages: string[]
  onChange: (files: File[]) => void
  onRemoveExisting: (index: number) => void
  baseUrl: string
  maxImages?: number
  helperText?: string
}

export function MultiImageUploader({
  label,
  existingImages,
  onChange,
  onRemoveExisting,
  baseUrl,
  maxImages = 3,
  helperText,
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

  const moveExistingImage = (_idx: number, _direction: -1 | 1) => {
    // Reordering existing images is handled on save
  }

  const moveNewFile = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= newFiles.length) return
    const updated = [...newFiles]
    ;[updated[idx], updated[targetIdx]] = [updated[targetIdx], updated[idx]]
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
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
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
            <div className="absolute bottom-0 left-0 right-0 flex justify-between p-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => moveExistingImage(i, -1)}
                className="p-0.5 rounded bg-white/20 hover:bg-white/40 transition-colors"
                disabled={i === 0}
              >
                <ArrowLeft className="h-3 w-3 text-white" />
              </button>
              <button
                type="button"
                onClick={() => moveExistingImage(i, 1)}
                className="p-0.5 rounded bg-white/20 hover:bg-white/40 transition-colors"
                disabled={i === existingImages.length - 1}
              >
                <ArrowRight className="h-3 w-3 text-white" />
              </button>
            </div>
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
            <div className="absolute bottom-0 left-0 right-0 flex justify-between p-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => moveNewFile(i, -1)}
                className="p-0.5 rounded bg-white/20 hover:bg-white/40 transition-colors"
                disabled={i === 0}
              >
                <ArrowLeft className="h-3 w-3 text-white" />
              </button>
              <button
                type="button"
                onClick={() => moveNewFile(i, 1)}
                className="p-0.5 rounded bg-white/20 hover:bg-white/40 transition-colors"
                disabled={i === newFiles.length - 1}
              >
                <ArrowRight className="h-3 w-3 text-white" />
              </button>
            </div>
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
