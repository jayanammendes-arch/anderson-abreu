import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Treatment } from '@/types'

export function TreatmentCard({ treatment }: { treatment: Treatment }) {
  return (
    <Link
      to={`/tratamentos/${treatment.slug}`}
      className="group relative flex items-center justify-between border-b border-slate-200 py-5 px-2 hover:bg-slate-50 transition-all duration-300"
    >
      <div className="flex-1">
        <h3 className="text-lg font-medium text-slate-900 group-hover:text-primary transition-colors">
          {treatment.name}
        </h3>
        {treatment.short_description && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-1">{treatment.short_description}</p>
        )}
      </div>
      <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
    </Link>
  )
}
