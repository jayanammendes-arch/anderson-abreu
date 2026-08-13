import { Link } from 'react-router-dom'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import type { TreatmentCategory } from '@/types'

export function TreatmentCard({ category }: { category: TreatmentCategory }) {
  const Icon = getTreatmentIcon(category.icon)

  return (
    <Link
      to={`/tratamentos/${category.slug}`}
      className="group flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mb-4">
        <Icon className="h-7 w-7 text-primary" strokeWidth={2} />
      </div>
      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
        {category.name}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
        {category.short_description}
      </p>
    </Link>
  )
}
