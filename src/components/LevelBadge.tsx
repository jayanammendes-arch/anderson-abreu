import { Crown, Diamond, Shield, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NO_LEVEL } from '@/lib/level-access'

const LEVEL_CONFIG: Record<string, { icon: typeof Crown; gradient: string; label: string }> = {
  Prata: { icon: Shield, gradient: 'from-[#C0C0C0] to-[#A8A8A8]', label: 'Prata' },
  Ouro: { icon: Crown, gradient: 'from-[#FFD700] to-[#FFA500]', label: 'Ouro' },
  Diamante: { icon: Diamond, gradient: 'from-[#4F46E5] to-[#3B82F6]', label: 'Diamante' },
}

interface LevelBadgeProps {
  level?: string | null
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  /** Quando true, renderiza também um badge para "Sem nivel". Caso contrário, retorna null. */
  showNoLevel?: boolean
}

export function LevelBadge({
  level,
  size = 'sm',
  showIcon = true,
  showNoLevel = false,
}: LevelBadgeProps) {
  // Usuário sem nível: só renderiza um badge discreto se solicitado.
  if (!level || level === NO_LEVEL) {
    if (!showNoLevel) return null
    const sizeClasses = {
      sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
      md: 'text-xs px-2 py-1 gap-1',
      lg: 'text-sm px-3 py-1.5 gap-1.5',
    }
    const iconSizes = { sm: 'h-2.5 w-2.5', md: 'h-3 w-3', lg: 'h-4 w-4' }
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full font-semibold bg-muted text-muted-foreground border border-border/50 shadow-sm',
          sizeClasses[size],
        )}
      >
        {showIcon && <User className={iconSizes[size]} />}
        {NO_LEVEL}
      </span>
    )
  }

  const config = LEVEL_CONFIG[level]
  if (!config) return null

  const Icon = config.icon
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2 py-1 gap-1',
    lg: 'text-sm px-3 py-1.5 gap-1.5',
  }
  const iconSizes = { sm: 'h-2.5 w-2.5', md: 'h-3 w-3', lg: 'h-4 w-4' }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold bg-gradient-to-r text-white shadow-sm',
        config.gradient,
        sizeClasses[size],
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  )
}
