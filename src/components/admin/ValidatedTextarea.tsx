import { type TextareaHTMLAttributes } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ValidatedTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  required?: boolean
}

export function ValidatedTextarea({
  label,
  error,
  required,
  className,
  id,
  ...props
}: ValidatedTextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={textareaId}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}
      <Textarea
        id={textareaId}
        className={cn(error && 'border-destructive ring-1 ring-destructive', className)}
        {...props}
      />
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
