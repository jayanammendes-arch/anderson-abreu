import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getPublicCourseDetail, getThumbnailUrl } from '@/services/courses'
import { getUserAccess } from '@/services/user-access'
import { getActiveTestimonials } from '@/services/testimonials'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Lock,
  ExternalLink,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  PlayCircle,
  Clock,
} from 'lucide-react'
import type { Course, Module, Lesson, Testimonial } from '@/types'

function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0
  const parts = duration.split(':').map(Number)
  if (parts.some(isNaN)) return 0
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

function formatTotalDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  if (m > 0) return `${m}min`
  return '—'
}

export default function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user, isAuthenticated } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const loadData = useCallback(async () => {
    if (!courseId) return
    try {
      const data = await getPublicCourseDetail(courseId)
      setCourse(data.course)
      setModules(data.modules)
      setLessons(data.lessons)
      const t = await getActiveTestimonials()
      setTestimonials((t as Testimonial[]).filter((x) => x.course === courseId))
      if (user) {
        const access = await getUserAccess(user.id)
        setHasAccess(access.some((a) => a.course === courseId))
      }
    } catch {
      setCourse(null)
    } finally {
      setLoading(false)
    }
  }, [courseId, user])

  useEffect(() => {
    loadData()
  }, [loadData])
  useEffect(() => {
    if (modules.length > 0) setExpanded(new Set([modules[0].id]))
  }, [modules])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Curso não encontrado.</p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
    )
  }

  const isHypnosis = course.access_type === 'hypnosis'
  const isFree = course.access_type === 'free'
  const hasDiscount =
    course.discount_price != null && course.price != null && course.discount_price < course.price
  const totalLessons = lessons.length
  const totalDuration = formatTotalDuration(
    lessons.reduce((acc, l) => acc + parseDurationToSeconds(l.duration || ''), 0),
  )

  const toggleModule = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderCTA = () => {
    if (isAuthenticated && hasAccess) {
      return (
        <Button className="w-full" size="lg" asChild>
          <Link to={`/dashboard/curso/${course.id}`}>
            <PlayCircle className="mr-2 h-4 w-4" /> Acessar
          </Link>
        </Button>
      )
    }
    if (isHypnosis) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lock className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">Acesso exclusivo — liberação mediante análise</span>
        </div>
      )
    }
    if (isFree) {
      if (isAuthenticated) {
        return (
          <Button className="w-full" size="lg" asChild>
            <Link to={`/dashboard/curso/${course.id}`}>
              <PlayCircle className="mr-2 h-4 w-4" /> Acessar
            </Link>
          </Button>
        )
      }
      return (
        <Button className="w-full" size="lg" asChild>
          <Link to="/login">
            <PlayCircle className="mr-2 h-4 w-4" /> Inscrever-se
          </Link>
        </Button>
      )
    }
    return (
      <div className="space-y-3">
        {hasDiscount && (
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground line-through">
              R$ {course.price?.toFixed(2)}
            </span>
            <span className="text-3xl font-bold text-primary">
              R$ {course.discount_price?.toFixed(2)}
            </span>
          </div>
        )}
        {!hasDiscount && (
          <span className="text-3xl font-bold text-primary">
            {course.price ? `R$ ${course.price.toFixed(2)}` : 'Consulte'}
          </span>
        )}
        {course.external_buy_url ? (
          <Button className="w-full" size="lg" asChild>
            <a href={course.external_buy_url} target="_blank" rel="noopener noreferrer">
              Comprar Agora <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        ) : (
          <Button className="w-full" size="lg" disabled>
            Comprar Agora
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="aspect-video overflow-hidden rounded-xl mb-6 border border-border/50">
                <img
                  src={getThumbnailUrl(course)}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {course.category && (
                  <Badge variant="secondary" className="capitalize">
                    {course.category}
                  </Badge>
                )}
                {isHypnosis && (
                  <Badge className="bg-purple-500/90 text-white">
                    <Lock className="mr-1 h-3 w-3" /> Exclusivo Hipnose
                  </Badge>
                )}
                {isFree && <Badge className="bg-green-500/90 text-white">Livre</Badge>}
                {totalLessons > 0 && (
                  <Badge variant="outline">
                    <BookOpen className="mr-1 h-3 w-3" /> {totalLessons} aulas
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-4">{course.title}</h1>
              {course.short_description && (
                <p className="text-lg text-muted-foreground mb-6">{course.short_description}</p>
              )}
              {course.description && (
                <p className="text-muted-foreground leading-relaxed">{course.description}</p>
              )}
            </div>

            {modules.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Conteúdo do Curso</h2>
                <div className="space-y-2">
                  {modules.map((m) => {
                    const moduleLessons = lessons.filter((l) => l.module === m.id)
                    const isExpanded = expanded.has(m.id)
                    return (
                      <Card key={m.id} className="overflow-hidden border-border/50">
                        <button
                          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                          onClick={() => toggleModule(m.id)}
                        >
                          <span className="font-semibold text-left">{m.title}</span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{moduleLessons.length} aulas</span>
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            />
                          </div>
                        </button>
                        {isExpanded && moduleLessons.length > 0 && (
                          <div className="border-t border-border/50">
                            {moduleLessons.map((l) => (
                              <div
                                key={l.id}
                                className="flex items-center gap-3 px-4 py-3 text-sm border-b border-border/30 last:border-0"
                              >
                                {isHypnosis || (!isFree && !hasAccess) ? (
                                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                                ) : (
                                  <PlayCircle className="h-4 w-4 text-primary shrink-0" />
                                )}
                                <span className="flex-1">{l.title}</span>
                                {l.duration && (
                                  <span className="text-muted-foreground text-xs">
                                    {l.duration}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {testimonials.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Depoimentos</h2>
                <div className="grid gap-4">
                  {testimonials.map((t) => (
                    <Card key={t.id} className="border-border/50">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{t.student_name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">"{t.content}"</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-border/50">
              <CardContent className="p-6 space-y-4">
                {renderCTA()}
                {!isHypnosis && (
                  <div className="pt-4 border-t border-border/50 space-y-2 text-sm text-muted-foreground">
                    {totalLessons > 0 && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> {totalLessons} aulas
                      </div>
                    )}
                    {totalLessons > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> {totalDuration}
                      </div>
                    )}
                    {modules.length > 0 && (
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" /> {modules.length} módulos
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
