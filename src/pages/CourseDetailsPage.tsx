import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getPublicCourseDetail, getThumbnailUrl, getFooterBannerUrl } from '@/services/courses'
import { getUserAccess } from '@/services/user-access'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Lock,
  ExternalLink,
  ArrowLeft,
  ChevronRight,
  PlayCircle,
  BookOpen,
  Clock,
} from 'lucide-react'
import type { Course, Module, Lesson } from '@/types'

export default function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user, isAuthenticated } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
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
      <div className="flex h-96 items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (!course) {
    return (
      <div className="text-center py-20 bg-background min-h-screen">
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
  const coverImage = getThumbnailUrl(course)
  const footerBanner = getFooterBannerUrl(course)
  const catchyTitle = course.catchy_title || course.title
  const publicDescription = course.public_description || course.description || ''
  const totalLessons = lessons.length
  const totalDuration = lessons.reduce((acc, l) => acc + (l.duration ? 1 : 0), 0)

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
        <Button size="lg" className="px-10 py-6 text-lg" asChild>
          <Link to={`/dashboard/curso/${course.id}`}>
            <PlayCircle className="mr-2 h-5 w-5" /> Acessar Curso
          </Link>
        </Button>
      )
    }
    if (isHypnosis) {
      return (
        <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 rounded-lg px-6 py-4">
          <Lock className="h-6 w-6 shrink-0 text-primary" />
          <span className="font-medium">Acesso Exclusivo — Liberação mediante análise</span>
        </div>
      )
    }
    if (isFree) {
      if (isAuthenticated) {
        return (
          <Button size="lg" className="px-10 py-6 text-lg" asChild>
            <Link to={`/dashboard/curso/${course.id}`}>
              <PlayCircle className="mr-2 h-5 w-5" /> Acessar
            </Link>
          </Button>
        )
      }
      return (
        <Button size="lg" className="px-10 py-6 text-lg" asChild>
          <Link to="/login">
            <PlayCircle className="mr-2 h-5 w-5" /> Inscrever-se
          </Link>
        </Button>
      )
    }
    const ctaText = course.buy_button_text || 'Comprar Agora'
    if (course.external_buy_url) {
      return (
        <Button size="lg" className="px-10 py-6 text-lg" asChild>
          <a href={course.external_buy_url} target="_blank" rel="noopener noreferrer">
            {ctaText} <ExternalLink className="ml-2 h-5 w-5" />
          </a>
        </Button>
      )
    }
    return (
      <Button size="lg" className="px-10 py-6 text-lg" disabled>
        {ctaText}
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-primary to-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-foreground font-bold text-lg">
            Anderson Abreu
          </Link>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-foreground hover:text-foreground hover:bg-white/10"
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative h-[420px] md:h-[560px] overflow-hidden">
        <img
          src={coverImage}
          alt={course.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/30" />
        <div className="relative h-full flex items-end pb-12 md:pb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {course.category && <Badge className="bg-accent text-white">{course.category}</Badge>}
              {isFree && <Badge className="bg-green-600 text-white">Gratuito</Badge>}
              {totalLessons > 0 && (
                <Badge variant="outline" className="text-foreground border-border">
                  <BookOpen className="mr-1 h-3 w-3" /> {totalLessons} aulas
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground max-w-3xl leading-tight">
              {catchyTitle}
            </h1>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {publicDescription ? (
            <div
              className="prose prose-lg prose-invert max-w-none text-muted-foreground
                [&_h2]:text-foreground [&_h2]:font-bold [&_h3]:text-foreground [&_h3]:font-bold
                [&_strong]:text-primary [&_a]:text-primary"
              dangerouslySetInnerHTML={{ __html: publicDescription }}
            />
          ) : (
            course.short_description && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {course.short_description}
              </p>
            )
          )}
          <div className="mt-8">{renderCTA()}</div>
        </div>
      </section>

      {modules.length > 0 && (
        <section className="py-12 md:py-16 bg-card">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Conteúdo do Curso
            </h2>
            <div className="space-y-3">
              {modules.map((m) => {
                const moduleLessons = lessons.filter((l) => l.module === m.id)
                const isExpanded = expanded.has(m.id)
                return (
                  <div
                    key={m.id}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
                      onClick={() => toggleModule(m.id)}
                    >
                      <div className="text-left">
                        <span className="font-bold text-foreground text-lg block">{m.title}</span>
                        {m.description && (
                          <span className="text-sm text-muted-foreground mt-1 block">
                            {m.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{moduleLessons.length} aulas</span>
                        <ChevronRight
                          className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </button>
                    {isExpanded && moduleLessons.length > 0 && (
                      <div className="border-t border-border/50">
                        {moduleLessons.map((l) => (
                          <div
                            key={l.id}
                            className="flex items-center gap-3 px-5 py-3 text-sm border-b border-border/30 last:border-0"
                          >
                            <PlayCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1">
                              <span className="text-foreground font-medium">{l.title}</span>
                              {l.description && (
                                <span className="text-xs text-muted-foreground block mt-0.5">
                                  {l.description}
                                </span>
                              )}
                            </div>
                            {l.duration && (
                              <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {l.duration}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {footerBanner && (
        <section className="bg-background">
          <img src={footerBanner} alt="" className="w-full max-h-72 object-cover" />
        </section>
      )}

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">{renderCTA()}</div>
      </section>

      <footer className="bg-gradient-to-r from-primary to-background py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Anderson Abreu. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
