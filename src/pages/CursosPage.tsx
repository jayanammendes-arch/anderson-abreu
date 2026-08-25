import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getAllAvailableCourses, getThumbnailUrl } from '@/services/courses'
import { getUserAccess } from '@/services/user-access'
import { getPlatformSettingsPublic } from '@/services/landing'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, PlayCircle, Lock, Loader2 } from 'lucide-react'
import { canAccessCourse } from '@/lib/level-access'
import type { Course, PlatformSettings } from '@/types'

export default function CursosPage() {
  const { user, isAuthenticated } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [accessIds, setAccessIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [coursesData, settingsData] = await Promise.all([
        getAllAvailableCourses(),
        getPlatformSettingsPublic().catch(() => null),
      ])
      const filteredCourses = coursesData.filter((c) =>
        // Usuário sem nível não vê cursos de nível; Prata/Ouro/Diamante vê conforme seu nível.
        canAccessCourse(c.level, user?.level || ''),
      )
      setCourses(filteredCourses)
      setSettings(settingsData as PlatformSettings | null)
      if (user) {
        const access = await getUserAccess(user.id)
        setAccessIds(new Set(access.map((a: any) => a.course)))
      }
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <LandingLayout settings={settings}>
        <div className="flex h-96 items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LandingLayout>
    )
  }

  return (
    <LandingLayout settings={settings}>
      <div className="pt-32 pb-24 bg-card min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {settings?.courses_section_title || 'Cursos Disponíveis'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {settings?.courses_section_text ||
                'Conheça nossos cursos e formações em hipnoterapia e desenvolvimento humano.'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.length > 0 ? (
              courses.map((course) => {
                const hasAccess = accessIds.has(course.id)
                const isHypnosis = course.access_type === 'hypnosis'
                const isFree = course.access_type === 'free'
                const hasDiscount =
                  course.discount_price != null &&
                  course.price != null &&
                  course.discount_price < course.price
                const ctaText = course.buy_button_text || 'Comprar'
                return (
                  <div
                    key={course.id}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 flex flex-col"
                  >
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
                        <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                          Adquirido
                        </Badge>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-6 flex-1">
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
                          className="w-full bg-[#1F3552] text-white hover:bg-[#1F3552]/80 border border-[#1F3552]/50"
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
                          <a
                            href={course.external_buy_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {ctaText} <ExternalLink className="ml-2 h-4 w-4 shrink-0" />
                          </a>
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-[#1F3552] text-white hover:bg-[#1F3552]/80 border border-[#1F3552]/50"
                          asChild
                        >
                          <Link to={`/cursos/${course.id}`}>Ver Detalhes</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                Nenhum curso disponível no momento.
              </div>
            )}
          </div>
          {isAuthenticated && (
            <div className="text-center mt-16">
              <Button variant="outline" className="rounded-full border-border" asChild>
                <Link to="/dashboard">Ir para Área do Aluno</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </LandingLayout>
  )
}
