import { useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImagePreview } from './ImagePreview'

interface FileUploadFieldProps {
  label: string
  currentSrc?: string | null
  file?: File | null
  onChange: (file: File | null) => void
  error?: string
  required?: boolean
  accept?: string
  className?: string
  children?: ReactNode
}

export function FileUploadField({
  label,
  currentSrc,
  file,
  onChange,
  error,
  required,
  accept = 'image/*',
  className,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={cn('space-y-2', className)}>
      <Label>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <ImagePreview src={currentSrc} file={file} />
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          {file ? 'Trocar arquivo' : 'Escolher arquivo'}
        </Button>
        {file && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X className="mr-2 h-4 w-4" />
            Remover
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] || null)
          e.target.value = ''
        }}
      />
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
