import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getPublicCourses,
  submitContact,
  getPlatformSettingsPublic,
  getHomeHeroImageUrl,
  getAboutImageUrl,
} from '@/services/landing'
import { getAllTreatments } from '@/services/treatments'
import { getBlogPosts } from '@/services/blog'
import { getThumbnailUrl } from '@/services/courses'
import type { Course, PlatformSettings, Treatment, BlogPost } from '@/types'
import { Button } from '@/components/ui/button'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { LandingLayout } from '@/components/LandingLayout'
import { TreatmentCard } from '@/components/TreatmentCard'
import { BlogCard } from '@/components/BlogCard'
import { ArrowRight, Calendar, Loader2 } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const [settingsData, treatmentsData, coursesData, blogData] = await Promise.all([
      getPlatformSettingsPublic().catch(() => null),
      getAllTreatments().catch(() => []),
      getPublicCourses().catch(() => []),
      getBlogPosts().catch(() => []),
    ])
    setSettings(settingsData as PlatformSettings | null)
    setTreatments(treatmentsData as Treatment[])
    setCourses(coursesData as Course[])
    setBlogPosts((blogData as BlogPost[]).slice(0, 3))
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('platform_settings', () => loadData())
  useRealtime('treatments', () => loadData())
  useRealtime('blog_posts', () => loadData())

  const heroImageUrl = settings?.home_hero_image ? getHomeHeroImageUrl(settings) : null
  const aboutImageUrl = settings?.about_image
    ? getAboutImageUrl(settings)
    : 'https://img.usecurling.com/p/600/700?q=professional%20therapist&color=gray'
  const agendarText = settings?.agendar_sessao_text || 'Agendar Sessão'
  const saibaMaisText = settings?.saiba_mais_text || 'Saiba mais'

  if (loading) {
    return (
      <LandingLayout settings={settings}>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LandingLayout>
    )
  }

  return (
    <LandingLayout settings={settings}>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {heroImageUrl ? (
          <>
            <img
              src={heroImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <h1
            className={cn(
              'text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]',
              heroImageUrl ? 'text-white' : 'text-slate-900',
            )}
          >
            {settings?.hero_title || 'Hipnoterapia que transforma vidas'}
          </h1>
          <p
            className={cn(
              'text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed',
              heroImageUrl ? 'text-white/70' : 'text-slate-500',
            )}
          >
            {settings?.hero_subtitle ||
              'Hipnose clínica, inteligência emocional e mentoria de alta performance para quem deseja romper limites e alcançar resultados extraordinários.'}
          </p>
          <Button
            size="lg"
            className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-10 shadow-lg"
            onClick={() => navigate('/agendar')}
          >
            <Calendar className="mr-2 h-5 w-5" />
            {settings?.hero_cta_text || agendarText}
          </Button>
        </div>
      </section>

      {/* About Intro */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-primary mb-4">
                {settings?.about_title || 'Nossa Metodologia'}
              </h2>
              <p className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-6">
                {settings?.about_intro ||
                  'Especialista em hipnose clínica e desenvolvimento humano, com mais de uma década transformando vidas.'}
              </p>
              {settings?.about_content ? (
                <div
                  className="prose prose-lg max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: settings.about_content }}
                />
              ) : (
                <p className="text-lg text-slate-600 leading-relaxed">
                  Fundado pelo especialista Anderson Abreu, o instituto tem a missão de formar
                  profissionais capacitados com o melhor ensino da hipnoterapia e desenvolvimento
                  humano.
                </p>
              )}
              <Button
                variant="outline"
                className="mt-8 rounded-full border-slate-300 hover:bg-slate-50"
                onClick={() => navigate('/sobre')}
              >
                {saibaMaisText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <img
                src={aboutImageUrl}
                alt="Anderson Abreu"
                className="rounded-2xl shadow-xl object-cover w-full h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Treatments */}
      {treatments.length > 0 && (
        <section id="tratamentos" className="py-24 bg-slate-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {settings?.treatments_section_title || 'O que podemos tratar'}
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                {settings?.treatments_section_intro ||
                  'Tratamentos especializados para diversos quadros emocionais e comportamentais.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {treatments.map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Courses */}
      {courses.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                  {settings?.courses_title || 'Cursos Online'}
                </h2>
                <p className="text-slate-500 text-lg">
                  {settings?.courses_intro || 'Aprenda no seu ritmo, com metodologia comprovada.'}
                </p>
              </div>
              <Button variant="outline" className="rounded-full hidden md:flex" asChild>
                <Link to="/cursos">
                  Ver todos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={getThumbnailUrl(course)}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {course.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                      {course.short_description || course.description}
                    </p>
                    {course.access_type === 'free' ? (
                      <span className="text-lg font-bold text-primary">Gratuito</span>
                    ) : course.price ? (
                      <span className="text-lg font-bold text-primary">
                        R$ {(course.discount_price || course.price).toFixed(2)}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section id="depoimentos">
        <TestimonialsSection customTitle={settings?.testimonials_section_title} />
      </section>

      {/* Blog */}
      {blogPosts.length > 0 && (
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                  {settings?.blog_section_title || 'Blog'}
                </h2>
                <p className="text-slate-500 text-lg max-w-xl">
                  {settings?.blog_section_intro ||
                    'Reflexões e técnicas sobre hipnose e desenvolvimento humano.'}
                </p>
              </div>
              <Button variant="outline" className="rounded-full hidden md:flex" asChild>
                <Link to="/blog">
                  Ver todos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para transformar sua vida?
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Agende sua sessão de hipnose clínica e dê o primeiro passo rumo ao bem-estar.
          </p>
          <Button
            size="lg"
            className="bg-white text-slate-900 hover:bg-white/90 rounded-full px-10"
            onClick={() => navigate('/agendar')}
          >
            <Calendar className="mr-2 h-5 w-5" />
            {agendarText}
          </Button>
        </div>
      </section>
    </LandingLayout>
  )
}

function cn(...args: any[]) {
  return args.filter(Boolean).join(' ')
}
