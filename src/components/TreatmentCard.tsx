import { Link } from 'react-router-dom'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import type { Treatment } from '@/types'

export function TreatmentCard({ treatment }: { treatment: Treatment }) {
  const Icon = getTreatmentIcon(treatment.icon)

  return (
    <Link
      to={`/tratamentos/${treatment.slug}`}
      className="group flex flex-col items-start gap-3 p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 transition-colors duration-300 group-hover:bg-blue-100">
        <Icon className="h-6 w-6 text-blue-500" strokeWidth={2} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
        {treatment.name}
      </h3>
    </Link>
  )
}
