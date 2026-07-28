import { useState, useEffect } from 'react'
import { HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileSizeDisplayProps {
  file?: File | null
  url?: string | null
  className?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileSizeDisplay({ file, url, className }: FileSizeDisplayProps) {
  const [size, setSize] = useState<number | null>(null)

  useEffect(() => {
    if (file) {
      setSize(file.size)
      return
    }
    if (url) {
      setSize(null)
      fetch(url, { method: 'HEAD' })
        .then((res) => {
          const len = res.headers.get('content-length')
          if (len) setSize(parseInt(len, 10))
        })
        .catch(() => {})
    } else {
      setSize(null)
    }
  }, [file, url])

  if (size === null) return null

  return (
    <div className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      <HardDrive className="h-3 w-3" />
      <span>{formatFileSize(size)}</span>
    </div>
  )
}
