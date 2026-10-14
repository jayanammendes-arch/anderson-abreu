import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getAllAvailableCourses, getThumbnailUrl } from '@/services/courses'
import { getUserAccess } from '@/services/user-access'
import { getPlatformSettingsPublic } from '@/services/landing'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ExternalLink,
  PlayCircle,
  Lock,
  Loader2,
  Sparkles,
  GraduationCap,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'
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
              <div className="col-span-full">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1D2F] to-[#1F3552] border border-[#0E1D2F] p-8 sm:p-12 md:p-16 text-center shadow-xl">
                  {/* Linha de destaque dourada no topo */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A15A] to-transparent" />

                  {/* Efeito de brilho de fundo sutil */}
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C9A15A]/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Badge de status */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A15A]/15 border border-[#C9A15A]/30 text-[#C9A15A] text-xs sm:text-sm font-semibold mb-8 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-[#C9A15A]" />
                    <span>Novidades em Breve</span>
                  </div>

                  {/* Ícone central elegante */}
                  <div className="relative mx-auto mb-6 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0E1D2F] border border-[#0E1D2F] flex items-center justify-center shadow-inner">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#1F3552] border border-[#0E1D2F] flex items-center justify-center">
                      <GraduationCap
                        className="w-8 h-8 sm:w-9 sm:h-9 text-[#C9A15A]"
                        strokeWidth={2}
                      />
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                    Cursos em desenvolvimento
                  </h3>

                  {/* Texto descritivo */}
                  <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                    Estamos preparando formações exclusivas para você. Em breve, novos cursos e
                    metodologias transformadoras estarão disponíveis aqui.
                  </p>

                  {/* Ações de apoio */}
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button
                      asChild
                      className="rounded-full bg-[#1F3552] text-white hover:bg-[#1F3552]/80 border border-[#0E1D2F] px-6 py-2.5 font-medium shadow-sm transition-all duration-200"
                    >
                      <Link to="/agendar">
                        Conhecer Hipnoterapia
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>

                    {settings?.whatsapp_number && (
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full bg-[#0E1D2F] text-white hover:bg-[#0E1D2F]/80 hover:text-white border border-[#0E1D2F] px-6 py-2.5 font-medium transition-all duration-200"
                      >
                        <a
                          href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre os próximos cursos e formações.')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4 text-[#C9A15A]" />
                          Falar no WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
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
