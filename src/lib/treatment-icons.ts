import {
  Brain,
  Heart,
  Shield,
  Sparkles,
  Flower2,
  Scale,
  Smile,
  Moon,
  Zap,
  Activity,
  HeartHandshake,
  Eye,
  type LucideIcon,
} from 'lucide-react'

export const TREATMENT_ICONS: Record<string, LucideIcon> = {
  Brain,
  Heart,
  Shield,
  Sparkles,
  Flower2,
  Scale,
  Smile,
  Moon,
  Zap,
  Activity,
  HeartHandshake,
  Eye,
}

export const TREATMENT_ICON_NAMES = Object.keys(TREATMENT_ICONS)

export function getTreatmentIcon(name?: string): LucideIcon {
  if (name && TREATMENT_ICONS[name]) {
    return TREATMENT_ICONS[name]
  }
  return Sparkles
}
