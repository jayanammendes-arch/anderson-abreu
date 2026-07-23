import { useState, useMemo } from 'react'
import { TREATMENT_ICONS, ALL_TREATMENT_ICON_NAMES } from '@/lib/treatment-icons'
import { cn } from '@/lib/utils'
import { Check, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (icon: string) => void
}) {
  const [search, setSearch] = useState('')

  const filteredIcons = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return ALL_TREATMENT_ICON_NAMES
    return ALL_TREATMENT_ICON_NAMES.filter((name) => name.includes(query))
  }, [search])

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ícone..."
          className="pl-8"
        />
      </div>
      <div className="max-h-[280px] overflow-y-auto">
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {filteredIcons.map((iconName) => {
            const Icon = TREATMENT_ICONS[iconName]
            if (!Icon) return null
            const isSelected = value === iconName
            return (
              <button
                key={iconName}
                type="button"
                title={iconName}
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
        {filteredIcons.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum ícone encontrado.</p>
        )}
      </div>
    </div>
  )
}
