import { useState, useEffect } from 'react'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagePreviewProps {
  src?: string | null
  file?: File | null
  className?: string
  alt?: string
}

export function ImagePreview({ src, file, className, alt = 'Preview' }: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(src || null)
  }, [file, src])

  if (!previewUrl || hasError) {
    return (
      <div
        className={cn(
          'flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/50',
          className,
        )}
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border', className)}>
      <img
        src={previewUrl}
        alt={alt}
        className="h-auto w-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  )
}
