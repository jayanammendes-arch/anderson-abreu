import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props {
  /** Rótulo curto exibido ao lado do campo (ex.: "Título", "Conteúdo"). */
  label?: string
  /** Valor atual em pixels. */
  value: number | undefined | null
  /** Callback emitido com o novo número (já arredondado, mínimo 8). */
  onChange: (value: number) => void
  /** Tamanho mínimo permitido (padrão 8). */
  min?: number
  /** Tamanho máximo permitido (padrão 200). */
  max?: number
  /** Placeholder quando vazio. */
  placeholder?: number
  /** Classes extras para o wrapper. */
  className?: string
  /** Variante compacta (sem Label grande) — útil para uso inline. */
  compact?: boolean
}

/**
 * Campo numérico simples para escolher o tamanho da fonte em pixels (px).
 * Sem dropdown, sem níveis predefinidos — apenas um input type="number".
 */
export function FontSizeInput({
  label,
  value,
  onChange,
  min = 8,
  max = 200,
  placeholder,
  className,
  compact = false,
}: Props) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value)
    if (!Number.isFinite(n)) return
    const clamped = Math.min(max, Math.max(min, Math.round(n)))
    onChange(clamped)
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        {label && (
          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
            {label}
          </span>
        )}
        <div className="relative w-20">
          <Input
            type="number"
            min={min}
            max={max}
            value={value ?? ''}
            placeholder={placeholder != null ? String(placeholder) : ''}
            onChange={handle}
            className="h-7 pr-7 text-xs tabular-nums"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
            px
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <Label className="text-xs font-medium text-muted-foreground">{label}</Label>}
      <div className="relative w-28">
        <Input
          type="number"
          min={min}
          max={max}
          value={value ?? ''}
          placeholder={placeholder != null ? String(placeholder) : ''}
          onChange={handle}
          className="pr-8 tabular-nums"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          px
        </span>
      </div>
    </div>
  )
}
