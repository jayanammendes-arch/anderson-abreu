import { IMAGE_POSITION_OPTIONS } from '@/lib/image-position'
import { cn } from '@/lib/utils'

interface ImagePositionSelectorProps {
  value: string
  onChange: (value: string) => void
  imageUrl: string | null
}

export function ImagePositionSelector({ value, onChange, imageUrl }: ImagePositionSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Posicionamento da imagem no hero</label>
      <div className="flex flex-wrap gap-2">
        {IMAGE_POSITION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg border-2 p-1 transition-colors',
              value === opt.value
                ? 'border-primary bg-primary/10'
                : 'border-muted hover:border-muted-foreground/30',
            )}
          >
            <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-muted">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={opt.label}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: opt.css }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[8px] text-center text-muted-foreground">
                  {opt.label}
                </div>
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-medium',
                value === opt.value ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {opt.label}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Define qual parte da imagem será priorizada no recorte do hero.
      </p>
    </div>
  )
}
