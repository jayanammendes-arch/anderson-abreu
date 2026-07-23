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
import { getTreatmentCategories } from '@/services/treatment-categories'
import { getBlogPosts } from '@/services/blog'
import { getThumbnailUrl } from '@/services/courses'
import type { Course, PlatformSettings, TreatmentCategory, BlogPost } from '@/types'
import { Button } from '@/components/ui/button'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { LandingLayout } from '@/components/LandingLayout'
import { TreatmentCard } from '@/components/TreatmentCard'
import { BlogCard } from '@/components/BlogCard'
import { ArrowRight, Calendar, Loader2, CheckCircle2, ArrowUpRight } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [treatments, setTreatments] = useState<TreatmentCategory[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const [settingsData, treatmentsData, coursesData, blogData] = await Promise.all([
      getPlatformSettingsPublic().catch(() => null),
      getTreatmentCategories().catch(() => []),
      getPublicCourses().catch(() => []),
      getBlogPosts().catch(() => []),
    ])
    setSettings(settingsData as PlatformSettings | null)
    setTreatments(treatmentsData as TreatmentCategory[])
    setCourses(coursesData as Course[])
    setBlogPosts((blogData as BlogPost[]).slice(0, 3))
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('platform_settings', () => loadData())
  useRealtime('treatment_categories', () => loadData())
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
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-slate-50">
        {heroImageUrl && (
          <>
            <img
              src={heroImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-right md:object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:w-3/4" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent sm:hidden" />
          </>
        )}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h1
              className={cn(
                'text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 leading-[1.1] text-slate-900 uppercase',
              )}
            >
              {settings?.hero_title || 'HIPNOSE CLÍNICA AVANÇADA'}
            </h1>

            {settings?.hero_subtitle ? (
              settings.hero_subtitle.split('\n').map((line, i, arr) => (
                <p
                  key={i}
                  className={cn(
                    arr.length > 1 && i === 0
                      ? 'text-xl md:text-3xl text-slate-800 mb-6 font-medium'
                      : 'text-lg md:text-xl text-slate-600 mb-6 leading-relaxed',
                  )}
                >
                  {line}
                </p>
              ))
            ) : (
              <>
                <p className="text-xl md:text-3xl text-slate-800 mb-6 font-medium">
                  Resultados em 2 Sessões*
                </p>
                <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
                  Ansiedade, depressão, traumas, fobias, compulsões e bloqueios tratados com hipnose
                  clínica focada na causa.
                </p>
              </>
            )}

            <div className="pt-4">
              <Button
                size="lg"
                className="bg-[#00A3C4] hover:bg-[#008ca8] text-white rounded-full px-10 py-6 text-lg font-medium shadow-lg transition-all hover:scale-105"
                onClick={() => navigate('/agendar')}
              >
                {settings?.hero_cta_text || 'Falar com especialista'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Treatments */}
      {treatments.length > 0 && (
        <section id="tratamentos" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {settings?.treatments_section_title || 'O que podemos tratar com Hipnose'}
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                {settings?.treatments_section_intro ||
                  'Tratamentos especializados para diversos quadros emocionais e comportamentais.'}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {treatments.map((category) => (
                <TreatmentCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {settings?.services_title && (
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {settings.services_title}
              </h2>
              {settings.services_subtitle && (
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                  {settings.services_subtitle}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                try {
                  const items = JSON.parse(settings.services_items || '[]')
                  if (Array.isArray(items)) {
                    return items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="group block p-8 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h3 className="text-xl font-semibold text-slate-900 group-hover:text-primary transition-colors">
                            {item.title || item.name}
                          </h3>
                          <ArrowUpRight className="h-6 w-6 shrink-0 text-slate-300 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {item.description || item.content || item.text}
                        </p>
                      </div>
                    ))
                  }
                } catch (e) {
                  return null
                }
              })()}
            </div>
          </div>
        </section>
      )}

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

      {/* Courses */}
      {courses.length > 0 && null}

      {/* Testimonials */}
      <section id="depoimentos">
        <TestimonialsSection customTitle={settings?.testimonials_section_title} />
      </section>

      {/* Blog */}
      {blogPosts.length > 0 && (
        <section className="py-24 bg-white">
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
