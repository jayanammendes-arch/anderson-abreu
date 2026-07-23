import { useState, useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { TREATMENT_ICONS, getIconsForCategory } from '@/lib/treatment-icons'
import { Check } from 'lucide-react'

export function IconPicker({
  value,
  onChange,
  category,
}: {
  value: string
  onChange: (icon: string) => void
  category?: string
}) {
  const [selected, setSelected] = useState(value || '')

  const iconNames = useMemo(() => getIconsForCategory(category), [category])

  const handleSelect = (iconName: string) => {
    setSelected(iconName)
    onChange(iconName)
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
      {iconNames.map((iconName) => {
        const Icon = TREATMENT_ICONS[iconName]
        if (!Icon) return null
        const isSelected = selected === iconName
        return (
          <Tooltip key={iconName}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleSelect(iconName)}
                className={cn(
                  'relative flex h-14 w-14 items-center justify-center rounded-lg border-2 transition-all duration-200',
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isSelected ? 'text-blue-600' : 'text-slate-500',
                  )}
                  strokeWidth={2}
                />
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {iconName}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
