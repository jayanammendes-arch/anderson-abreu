import { useState, useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTreatmentCategories } from '@/services/treatment-categories'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import type { TreatmentCategory } from '@/types'

export function TreatmentsDropdown({
  children,
  isDark,
}: {
  children: ReactNode
  isDark?: boolean
}) {
  const [categories, setCategories] = useState<TreatmentCategory[]>([])

  useEffect(() => {
    getTreatmentCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-md transition-colors outline-none focus:outline-none',
          isDark
            ? 'text-white/80 hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10 data-[state=open]:text-white'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-900',
        )}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[480px] p-4 rounded-xl shadow-lg border-slate-100 bg-white"
      >
        <div className="grid grid-cols-2 gap-1">
          {categories.slice(0, 12).map((category) => {
            const Icon = getTreatmentIcon(category.icon)
            return (
              <DropdownMenuItem key={category.id} asChild className="p-0">
                <Link
                  to={`/tratamentos/${category.slug}`}
                  className="group flex items-center gap-3 w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-[18px] w-[18px] text-blue-500" strokeWidth={2} />
                  </span>
                  <span className="font-medium leading-snug line-clamp-2">{category.name}</span>
                </Link>
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
