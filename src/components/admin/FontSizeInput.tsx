import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Minus, Plus } from 'lucide-react'
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
 * Sem dropdown, sem níveis predefinidos — apenas um input type="number.
 *
 * O onChange é disparado a CADA tecla digitada (não só no Enter/blur), de modo
 * que o tamanho da fonte reage imediatamente enquanto o usuário digita. O valor
 * exibido no campo é sempre o valor real aplicado.
 */
export function FontSizeInput({
  label,
  value,
  onChange,
  min = 1,
  max = 999,
  placeholder,
  className,
  compact = false,
}: Props) {
  const [inputValue, setInputValue] = useState<string>(value != null ? String(value) : '')

  // Sincroniza o campo quando o valor mudar externamente (ex.: botões + / -,
  // carregamento inicial, restore de snapshot). Enquanto o usuário digita, o
  // estado local já é mantido em paralelo pelo handleInputChange, então esta
  // sincronização não entra em conflito.
  useEffect(() => {
    setInputValue(value != null ? String(value) : '')
  }, [value])

  /**
   * Disparado a cada tecla. Atualiza o estado local E chama onChange com o
   * número já clampado, para que o editor reaja imediatamente e o valor
   * exibido corresponda ao valor aplicado.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Permite campo vazio enquanto o usuário apaga para digitar um novo valor.
    if (raw === '') {
      setInputValue('')
      return
    }
    const parsed = parseInt(raw, 10)
    if (isNaN(parsed)) return
    const clamped = Math.min(max, Math.max(min, parsed))
    setInputValue(String(clamped))
    onChange(clamped)
  }

  // Ao perder o foco, se o campo estiver vazio ou inválido, restaura para o
  // último valor aplicado (não dispara onChange de novo — já foi disparado).
  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10)
    if (isNaN(parsed)) {
      setInputValue(value != null ? String(value) : '')
    }
  }

  const handleDecrement = () => {
    const current = value != null ? value : (placeholder ?? 16)
    const nextVal = Math.max(min, current - 1)
    onChange(nextVal)
    setInputValue(String(nextVal))
  }

  const handleIncrement = () => {
    const current = value != null ? value : (placeholder ?? 16)
    const nextVal = Math.min(max, current + 1)
    onChange(nextVal)
    setInputValue(String(nextVal))
  }

  const inputProps = {
    type: 'number' as const,
    value: inputValue,
    placeholder: placeholder != null ? String(placeholder) : '',
    onChange: handleInputChange,
    onBlur: handleBlur,
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        {label && (
          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
            {label}
          </span>
        )}
        <div className="flex items-center bg-[#27272a]/60 border border-[#3f3f46] rounded-lg h-7 px-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-zinc-300 hover:text-white hover:bg-[#3f3f46]/60 rounded-md p-0"
            onClick={handleDecrement}
            title="Diminuir tamanho"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <input
            {...inputProps}
            className="w-9 h-5 bg-transparent text-center text-xs font-semibold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-zinc-300 hover:text-white hover:bg-[#3f3f46]/60 rounded-md p-0"
            onClick={handleIncrement}
            title="Aumentar tamanho"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <Label className="text-xs font-medium text-muted-foreground">{label}</Label>}
      <div className="flex items-center bg-[#27272a]/60 border border-[#3f3f46] rounded-lg h-8 px-1 shrink-0 w-fit">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-300 hover:text-white hover:bg-[#3f3f46]/60 rounded-md p-0"
          onClick={handleDecrement}
          title="Diminuir tamanho"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <input
          {...inputProps}
          className="w-10 h-6 bg-transparent text-center text-xs font-semibold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-300 hover:text-white hover:bg-[#3f3f46]/60 rounded-md p-0"
          onClick={handleIncrement}
          title="Aumentar tamanho"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
