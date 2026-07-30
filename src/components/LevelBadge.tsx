import { Crown, Diamond, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const LEVEL_CONFIG: Record<string, { icon: typeof Crown; gradient: string }> = {
  Prata: { icon: Shield, gradient: 'from-[#C0C0C0] to-[#A8A8A8]' },
  Ouro: { icon: Crown, gradient: 'from-[#FFD700] to-[#FFA500]' },
  Diamante: { icon: Diamond, gradient: 'from-[#1E90FF] to-[#0047AB]' },
}

interface LevelBadgeProps {
  level?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function LevelBadge({ level, size = 'sm', showIcon = true }: LevelBadgeProps) {
  if (!level) return null
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
      {level}
    </span>
  )
}
