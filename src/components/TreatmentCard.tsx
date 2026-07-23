import { Link } from 'react-router-dom'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { getTreatmentCategoryImageUrl } from '@/services/treatment-categories'
import type { TreatmentCategory } from '@/types'

export function TreatmentCard({ category }: { category: TreatmentCategory }) {
  const Icon = getTreatmentIcon(category.icon)
  const imageUrl = getTreatmentCategoryImageUrl(category)

  return (
    <Link
      to={`/tratamentos/${category.slug}`}
      className="group flex gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-2 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-500 shrink-0" strokeWidth={2} />
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
            {category.name}
          </h3>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2">{category.short_description}</p>
      </div>
    </Link>
  )
}
