import { TREATMENT_ICON_GROUPS, TREATMENT_ICONS } from '@/lib/treatment-icons'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (icon: string) => void
}) {
  return (
    <div className="max-h-[300px] overflow-y-auto space-y-4 rounded-lg border p-3">
      {Object.entries(TREATMENT_ICON_GROUPS).map(([groupName, iconNames]) => (
        <div key={groupName} className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{groupName}</p>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {iconNames.map((iconName) => {
              const Icon = TREATMENT_ICONS[iconName]
              if (!Icon) return null
              const isSelected = value === iconName
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => onChange(iconName)}
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all duration-200',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-muted',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isSelected ? 'text-primary' : 'text-muted-foreground',
                    )}
                    strokeWidth={2}
                  />
                  {isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
