import { useState, useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAllTreatments } from '@/services/treatments'
import type { Treatment } from '@/types'

export function TreatmentsDropdown({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getAllTreatments()
      .then((data) => setTreatments(data))
      .catch(() => {})
  }, [])

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className={cn(
          'flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-md transition-colors',
          'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
          isOpen && 'text-slate-900 bg-slate-100',
        )}
      >
        {children}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && treatments.length > 0 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 min-w-[420px] animate-fade-in">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {treatments.map((treatment) => (
                <Link
                  key={treatment.id}
                  to={`/tratamentos/${treatment.slug}`}
                  className="block text-sm text-slate-600 hover:text-primary px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {treatment.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
