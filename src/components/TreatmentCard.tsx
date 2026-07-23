import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Treatment } from '@/types'

export function TreatmentCard({ treatment }: { treatment: Treatment }) {
  return (
    <Link
      to={`/tratamentos/${treatment.slug}`}
      className="group block p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors">
          {treatment.name}
        </h3>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
      </div>
      {treatment.short_description && (
        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{treatment.short_description}</p>
      )}
    </Link>
  )
}
