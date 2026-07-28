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
import { getAllTreatments } from '@/services/treatments'
import type { Treatment } from '@/types'

export function TreatmentsDropdown({
  children,
  isDark,
}: {
  children: ReactNode
  isDark?: boolean
}) {
  const [treatments, setTreatments] = useState<Treatment[]>([])

  useEffect(() => {
    getAllTreatments()
      .then(setTreatments)
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
        className="w-56 p-2 rounded-xl shadow-lg border-slate-100 bg-white"
      >
        {treatments.map((treatment) => (
          <DropdownMenuItem key={treatment.id} asChild>
            <Link
              to={`/tratamentos/${treatment.slug}`}
              className="w-full cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {treatment.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
