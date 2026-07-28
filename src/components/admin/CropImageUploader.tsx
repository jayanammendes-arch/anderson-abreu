import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Crop } from 'lucide-react'
import { ImagePreview } from './ImagePreview'

interface CropImageUploaderProps {
  label: string
  imageUrl: string | null
  file?: File | null
  cropX: number
  cropY: number
  onFileChange: (file: File | null) => void
  onCropChange: (x: number, y: number) => void
  accept?: string
  error?: string
  required?: boolean
}

export function CropImageUploader({
  label,
  imageUrl,
  file,
  cropX = 0.5,
  cropY = 0.5,
  onFileChange,
  onCropChange,
  accept = 'image/jpeg,image/png,image/webp',
  error,
  required,
}: CropImageUploaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const updateCropFromPointer = (clientX: number, clientY: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    onCropChange(x, y)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    updateCropFromPointer(e.clientX, e.clientY)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    updateCropFromPointer(e.clientX, e.clientY)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {imageUrl ? (
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-lg border border-border cursor-crosshair select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <img
            src={imageUrl}
            alt={label}
            className="h-48 w-full object-cover pointer-events-none"
            style={{ objectPosition: `${cropX * 100}% ${cropY * 100}%` }}
            draggable={false}
          />
          <div
            className="absolute pointer-events-none w-8 h-8 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${cropX * 100}%`, top: `${cropY * 100}%` }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg" />
            <div className="absolute inset-1 rounded-full border border-white/50" />
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white pointer-events-none">
            <Crop className="h-3 w-3" />
            Clique para definir o foco
          </div>
        </div>
      ) : (
        <ImagePreview src={null} file={null} />
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          {file ? 'Trocar imagem' : 'Escolher imagem'}
        </Button>
        {file && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onFileChange(null)}>
            <X className="mr-2 h-4 w-4" />
            Remover
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Recomendado: 800×600 px (formato paisagem). Clique na imagem para definir o ponto de foco.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          onFileChange(e.target.files?.[0] || null)
          e.target.value = ''
        }}
      />
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
