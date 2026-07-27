import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getPublicCourses,
  submitContact,
  getPlatformSettingsPublic,
  getHomeHeroImageUrl,
  getParallaxBackgroundImageUrl,
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
import { ArrowRight, Calendar, Loader2, ArrowUpRight } from 'lucide-react'
import { CredentialsMarquee } from '@/components/CredentialsMarquee'
import { HomeCredentialSection } from '@/components/HomeCredentialSection'
import { cn } from '@/lib/utils'

function ParallaxCTASection({ settings }: { settings: PlatformSettings }) {
  const bgUrl = getParallaxBackgroundImageUrl(settings)
  if (!bgUrl) return null

  return (
    <section className="parallax-cta-section">
      <div className="parallax-cta-bg" style={{ backgroundImage: `url(${bgUrl})` }} />
      <div className="parallax-cta-overlay" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="parallax-cta-headline not-italic font-normal text-center text-[50px] text-[#ffffff] opacity-[1]">
          {settings.parallax_headline}
        </h2>
        {settings.parallax_button_text && (
          <Button
            size="lg"
            className="mt-8 bg-[#00A3C4] hover:bg-[#008ca8] text-white rounded-full px-10 py-6 text-lg font-medium shadow-lg transition-all hover:scale-105"
            asChild
          >
            {settings.parallax_button_link && settings.parallax_button_link.startsWith('/') ? (
              <Link to={settings.parallax_button_link}>{settings.parallax_button_text}</Link>
            ) : settings.parallax_button_link ? (
              <a href={settings.parallax_button_link} target="_blank" rel="noopener noreferrer">
                {settings.parallax_button_text}
              </a>
            ) : (
              <span>{settings.parallax_button_text}</span>
            )}
          </Button>
        )}
      </div>
    </section>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [treatmentCategories, setTreatmentCategories] = useState<TreatmentCategory[]>([])
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
    setTreatmentCategories(treatmentsData as TreatmentCategory[])
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
  const agendarText = settings?.agendar_sessao_text || 'Agendar Sessão'
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
      {treatmentCategories.length > 0 && (
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
              {treatmentCategories.map((category) => (
                <TreatmentCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Credentials Marquee */}
      <CredentialsMarquee />

      {/* Services */}
      {settings?.services_title && null}

      {/* Home Credential Section (replaces old About Intro) */}
      <HomeCredentialSection settings={settings} />

      {/* Saiba mais button below specialist description */}
      <div className="pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex justify-center">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-10 py-6 text-lg font-medium shadow-lg transition-all hover:scale-105 border-slate-300 text-slate-900 hover:bg-slate-100"
            asChild
          >
            <Link to="/sobre">
              {settings?.saiba_mais_text || 'Saiba mais'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* O que é Hipnose Clínica? */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://img.usecurling.com/p/600/500?q=clinical%20hypnosis%20session&color=blue"
                alt="O que é Hipnose Clínica?"
                className="rounded-2xl shadow-xl object-cover w-full h-[400px] md:h-[500px]"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                O que é Hipnose Clínica?
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-4">
                A hipnose clínica é uma técnica terapêutica reconhecida cientificamente que utiliza
                um estado de relaxamento profundo e foco concentrado para acessar o subconsciente,
                permitindo transformações profundas e duradouras.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-4">
                Diferente do que se vê em shows de entretenimento, a hipnose clínica é uma
                ferramenta terapêutica séria e eficaz, utilizada para tratar ansiedade, depressão,
                fobias, traumas, compulsões e diversos outros quadros emocionais e comportamentais.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Através de técnicas comprovadas, o terapeuta guia o paciente a um estado de
                relaxamento profundo onde a mente se torna mais receptiva a mudanças positivas,
                promovendo cura emocional e bem-estar duradouro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax CTA Section */}
      {settings?.parallax_background_image && settings?.parallax_headline && (
        <ParallaxCTASection settings={settings} />
      )}

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
                <Link
                  className="text-[#000000] bg-[Verde | #008000] bg-[Verde | #008000]"
                  to="/blog"
                >
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
