import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Treatment } from '@/types'
import { getTreatmentIcon } from '@/lib/treatment-icons'

export function TreatmentCard({ treatment }: { treatment: Treatment }) {
  const Icon = getTreatmentIcon(treatment.icon)
  return (
    <Link
      to={`/tratamentos/${treatment.slug}`}
      className="group flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-sky-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-100 transition-colors duration-300 group-hover:bg-sky-200">
        <Icon className="h-7 w-7 text-sky-600" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
            {treatment.name}
          </h3>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
        </div>
        {treatment.short_description && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{treatment.short_description}</p>
        )}
      </div>
    </Link>
  )
}
