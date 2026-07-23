import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { TREATMENT_ICONS, TREATMENT_ICON_NAMES } from '@/lib/treatment-icons'
import { Check } from 'lucide-react'

export function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (icon: string) => void
}) {
  const [selected, setSelected] = useState(value || '')

  const handleSelect = (iconName: string) => {
    setSelected(iconName)
    onChange(iconName)
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
      {TREATMENT_ICON_NAMES.map((iconName) => {
        const Icon = TREATMENT_ICONS[iconName]
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
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isSelected ? 'text-sky-600' : 'text-slate-500',
                  )}
                  strokeWidth={1.75}
                />
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
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
