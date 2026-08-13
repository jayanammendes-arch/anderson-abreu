import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, PlayCircle, Lock } from 'lucide-react'
import { getThumbnailUrl } from '@/services/courses'
import type { Course } from '@/types'

interface CourseCardProps {
  course: Course
  hasAccess?: boolean
}

export function CourseCard({ course, hasAccess }: CourseCardProps) {
  const isFree = course.access_type === 'free'
  const isHypnosis = course.access_type === 'hypnosis'
  const hasDiscount =
    course.discount_price != null && course.price != null && course.discount_price < course.price
  const ctaText = course.buy_button_text || 'Comprar'

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 flex flex-col">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img
          src={getThumbnailUrl(course)}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hasDiscount && !hasAccess && (
          <Badge className="absolute top-4 right-4 bg-primary text-white">
            -
            {course.discount_percentage ||
              Math.round((1 - course.discount_price! / course.price!) * 100)}
            %
          </Badge>
        )}
        {hasAccess && (
          <Badge className="absolute top-4 right-4 bg-green-500 text-white">Adquirido</Badge>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-muted-foreground text-sm mb-6 flex-1 line-clamp-3">
          {course.short_description || course.description}
        </p>
        <div className="mb-6">
          {isFree ? (
            <span className="text-2xl font-bold text-primary">Gratuito</span>
          ) : isHypnosis ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-5 w-5" />
              <span className="text-sm">Acesso exclusivo</span>
            </div>
          ) : hasDiscount ? (
            <div>
              <span className="text-sm text-muted-foreground line-through">
                R$ {course.price?.toFixed(2)}
              </span>
              <span className="text-2xl font-bold text-primary ml-2">
                R$ {course.discount_price?.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-primary">
              {course.price ? `R$ ${course.price.toFixed(2)}` : 'Consulte'}
            </span>
          )}
        </div>
        {hasAccess ? (
          <Button
            className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            asChild
          >
            <Link to={`/dashboard/curso/${course.id}`}>
              <PlayCircle className="mr-2 h-4 w-4" /> Acessar Curso
            </Link>
          </Button>
        ) : !isFree && course.external_buy_url ? (
          <Button
            className="w-full bg-[#D4AF37] hover:bg-[#C5A030] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)] border border-[#D4AF37]/30 transition-all duration-200 active:scale-[0.99]"
            asChild
          >
            <a href={course.external_buy_url} target="_blank" rel="noopener noreferrer">
              {ctaText} <ExternalLink className="ml-2 h-4 w-4 shrink-0" />
            </a>
          </Button>
        ) : (
          <Button
            className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            asChild
          >
            <Link to={`/cursos/${course.id}`}>Ver Detalhes</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
