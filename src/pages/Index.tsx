import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCoursesWithProgress } from '@/services/courses'
import { getLastUpdatedProgress } from '@/services/user-progress'
import { getUserAccess } from '@/services/user-access'
import { getOnboardingConfig, getCoverImageUrl } from '@/services/onboarding'
import { CourseCard } from '@/components/CourseCard'
import { Button } from '@/components/ui/button'
import { PlayCircle, Star, Loader2, Sparkles, Radar, Lock, HelpCircle } from 'lucide-react'
import type { CourseWithProgress, OnboardingConfig } from '@/types'

export default function Index() {
  const { user, hasLevel, canAccessComecePorAqui } = useAuth()
  const [courses, setCourses] = useState<CourseWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [hasProgress, setHasProgress] = useState(false)
  const [accessCourseIds, setAccessCourseIds] = useState<Set<string>>(new Set())
  const [onboardingConfig, setOnboardingConfig] = useState<OnboardingConfig | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [data, accessRecords, config] = await Promise.all([
        getCoursesWithProgress(user.id),
        getUserAccess(user.id),
        getOnboardingConfig(),
      ])
      setCourses(data)
      setAccessCourseIds(new Set(accessRecords.map((a) => a.course)))
      setOnboardingConfig(config)
    } catch {
      setCourses([])
      setAccessCourseIds(new Set())
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('courses', () => {
    loadData()
  })
  useRealtime('lessons', () => {
    loadData()
  })
  useRealtime('user_progress', () => {
    loadData()
  })

  useEffect(() => {
    if (!user || loading || courses.length === 0) return
    const determineResume = async () => {
      try {
        const lastProgress = await getLastUpdatedProgress(user.id)
        if (lastProgress) {
          const courseWithLesson = courses.find((c) =>
            c.lessons.some((l) => l.id === lastProgress.lesson),
          )
          if (
            courseWithLesson &&
            (courseWithLesson.access_type === 'free' || accessCourseIds.has(courseWithLesson.id))
          ) {
            setResumeUrl(`/dashboard/curso/${courseWithLesson.id}?lesson=${lastProgress.lesson}`)
            setHasProgress(true)
            return
          }
        }
      } catch {
        /* ignore */
      }
      setHasProgress(false)
      const firstAccessCourse = courses.find((c) => c.is_available && accessCourseIds.has(c.id))
      if (firstAccessCourse) {
        setResumeUrl(`/dashboard/curso/${firstAccessCourse.id}`)
        return
      }
      const freeCourse = courses.find((c) => c.is_available && c.access_type === 'free')
      if (freeCourse) {
        setResumeUrl(`/dashboard/curso/${freeCourse.id}`)
      }
    }
    determineResume()
  }, [user, loading, courses, accessCourseIds])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const userName = user?.name?.split(' ')[0] || 'Aluno'
  const userIsPatient = !!user?.is_patient
  const visibleCourses = courses.filter((c) => c.access_type !== 'patient' || userIsPatient)
  const availableCourses = visibleCourses.filter(
    (c) => c.is_available && (c.access_type === 'free' || accessCourseIds.has(c.id)),
  )
  const lockedCourses = visibleCourses.filter((c) => !c.is_available)
  const pendingLessons = availableCourses.reduce(
    (acc, c) => acc + (c.totalLessons - c.completedCount),
    0,
  )
  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {hasLevel && onboardingConfig?.is_active && canAccessComecePorAqui && (
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 shadow-elevation min-h-[280px]">
          {getCoverImageUrl(onboardingConfig) ? (
            <>
              <img
                src={getCoverImageUrl(onboardingConfig)!}
                alt={onboardingConfig.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
          )}
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 sm:p-12 min-h-[280px]">
            <Sparkles className="h-10 w-10 text-primary mb-4" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-2">
              {onboardingConfig.title}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">{onboardingConfig.subtitle}</p>
            <Button size="lg" className="shadow-glow" asChild>
              <Link to="/dashboard/comece-por-aqui">
                <Sparkles className="mr-2 h-4 w-4" />
                Começar
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Usuário sem nível: mostra um banner explicativo em vez da jornada/curso */}
      {!hasLevel && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 sm:p-12 border border-white/5 shadow-elevation">
          <div className="relative z-10 max-w-2xl">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Olá, {userName}! <br className="hidden sm:block" />
              <span className="text-gradient-gold">Bem-vindo à plataforma</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Você ainda não possui um nível atribuído. Ao comprar seu primeiro curso, você será
              promovido automaticamente ao nível Ouro e ganhará acesso aos conteúdos da plataforma.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="shadow-glow" asChild>
                <Link to="/cursos">Ver cursos disponíveis</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10"
                asChild
              >
                <Link to="/dashboard/faq">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Central de Ajuda
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {hasLevel && (
        <>
          <section className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 sm:p-12 border border-white/5 shadow-elevation">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="relative z-10 max-w-2xl">
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Olá, {userName}! <br className="hidden sm:block" />
                <span className="text-gradient-gold">Vamos continuar sua jornada?</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                {pendingLessons > 0
                  ? `Você tem ${pendingLessons} aula${pendingLessons > 1 ? 's' : ''} pendente${pendingLessons > 1 ? 's' : ''}. Aproveite o momento para evoluir.`
                  : 'Parabéns! Você concluiu todas as aulas disponíveis. Confira novos cursos abaixo.'}
              </p>
              <div className="flex flex-wrap gap-4">
                {resumeUrl && (
                  <Button size="lg" className="shadow-glow group" asChild>
                    <Link to={resumeUrl}>
                      <PlayCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                      {hasProgress ? 'Retomar Aula Atual' : 'Começar Agora'}
                    </Link>
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                  asChild
                >
                  <Link to="/dashboard/produtos">Ver Produtos</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Meus Cursos</h2>
                <p className="text-sm text-muted-foreground">Continue de onde parou.</p>
              </div>
            </div>
            {availableCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {availableCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Nenhum curso disponível no momento.
              </p>
            )}
          </section>

          {lockedCourses.length > 0 && (
            <section className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                    <Star className="h-6 w-6 text-primary fill-primary" />
                    Em Breve
                  </h2>
                  <p className="text-sm text-muted-foreground">Novos cursos chegando para você.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {lockedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} locked />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!hasLevel && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Central de Ajuda</h2>
            <p className="text-sm text-muted-foreground">
              Tire suas dúvidas sobre compras e produtos.
            </p>
            <Button asChild>
              <Link to="/dashboard/faq">
                <HelpCircle className="mr-2 h-4 w-4" />
                Acessar a FAQ
              </Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
