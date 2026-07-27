import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getTreatmentCategoryBySlug,
  getTreatmentCategories,
  getTreatmentCategoryImageUrl,
  getTreatmentCategoryImageUrls,
} from '@/services/treatment-categories'
import { getPlatformSettingsPublic } from '@/services/landing'
import type { TreatmentCategory, PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { ComparisonTable } from '@/components/treatment/ComparisonTable'
import { RichSection } from '@/components/treatment/RichSection'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { Loader2, ArrowLeft } from 'lucide-react'
import { ScrollFadeIn } from '@/components/ScrollFadeIn'

export default function TreatmentDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [category, setCategory] = useState<TreatmentCategory | null>(null)
  const [allCategories, setAllCategories] = useState<TreatmentCategory[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      getTreatmentCategoryBySlug(slug).catch(() => null),
      getTreatmentCategories().catch(() => []),
      getPlatformSettingsPublic().catch(() => null),
    ]).then(([cat, cats, sett]) => {
      setCategory(cat as TreatmentCategory | null)
      setAllCategories(cats as TreatmentCategory[])
      setSettings(sett as PlatformSettings | null)
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <LandingLayout settings={settings}>
        <div className="flex h-screen items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LandingLayout>
    )
  }

  if (!category) {
    return (
      <LandingLayout settings={settings}>
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 px-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Tratamento não encontrado</h1>
          <Button asChild>
            <Link to="/#tratamentos">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para tratamentos
            </Link>
          </Button>
        </div>
      </LandingLayout>
    )
  }

  const imageUrl = getTreatmentCategoryImageUrl(category)
  const Icon = getTreatmentIcon(category.icon)
  const otherCategories = allCategories.filter((c) => c.slug !== slug)
  const agendarText = settings?.agendar_sessao_text || 'Agendar Sessão'
  const stats = [
    { value: `${settings?.stats_students || 500}+`, label: 'Pacientes' },
    { value: `${settings?.stats_years || 10}+`, label: 'Anos' },
    { value: `${settings?.stats_courses || 20}+`, label: 'Cursos' },
    { value: `${settings?.stats_countries || 5}+`, label: 'Países' },
  ]

  const comoFuncionaImages = getTreatmentCategoryImageUrls(category, 'como_funciona_images')
  const resultadosImages = getTreatmentCategoryImageUrls(category, 'resultados_images')
  const ctaImages = getTreatmentCategoryImageUrls(category, 'cta_images')

  const hasComoFunciona = category.como_funciona_text?.trim() || comoFuncionaImages.length > 0
  const hasResultados = category.resultados_text?.trim() || resultadosImages.length > 0
  const hasCta = category.cta_text?.trim() || ctaImages.length > 0

  return (
    <LandingLayout settings={settings}>
      <ScrollFadeIn>
        <section className="relative min-h-[60vh] flex items-center overflow-hidden pt-20">
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700" />
          )}
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
            <div className="max-w-2xl">
              <Icon className="h-12 w-12 text-white/80 mb-6" strokeWidth={1.5} />
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{category.name}</h1>
              <p className="text-lg md:text-xl text-white/80 mb-8">{category.short_description}</p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-white/90 rounded-full px-8"
                  onClick={() => navigate('/agendar')}
                >
                  {agendarText}
                </Button>
                <a href="#o-que-e">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full border-white/30 text-white hover:bg-white/10 hover:text-white"
                  >
                    Saiba Mais
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      <ScrollFadeIn>
        <section id="o-que-e" className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">O que é {category.name}</h2>
            <div
              className="prose prose-lg max-w-none text-slate-600 [&_h2]:text-slate-900 [&_h2]:font-bold"
              dangerouslySetInnerHTML={{ __html: category.detailed_content }}
            />
          </div>
        </section>
      </ScrollFadeIn>

      {hasComoFunciona && (
        <ScrollFadeIn>
          <RichSection
            title="Como a Hipnose Funciona"
            html={category.como_funciona_text}
            images={comoFuncionaImages}
            className="py-24 bg-slate-50"
          />
        </ScrollFadeIn>
      )}

      {hasResultados && (
        <ScrollFadeIn>
          <RichSection
            title="Resultados Comprovados"
            html={category.resultados_text}
            images={resultadosImages}
            className="py-24 bg-white"
          />
        </ScrollFadeIn>
      )}

      {category.symptoms_list && (
        <ScrollFadeIn>
          <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Sintomas Comuns</h2>
              <div
                className="prose prose-lg max-w-none text-slate-600 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2"
                dangerouslySetInnerHTML={{ __html: category.symptoms_list }}
              />
            </div>
          </section>
        </ScrollFadeIn>
      )}

      <ScrollFadeIn>
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Outros Tratamentos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherCategories.map((cat) => {
                const CatIcon = getTreatmentIcon(cat.icon)
                return (
                  <Link
                    key={cat.id}
                    to={`/tratamentos/${cat.slug}`}
                    className="group flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <CatIcon className="h-8 w-8 text-blue-500" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 text-center">
                      {cat.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      <ScrollFadeIn>
        <TestimonialsSection customTitle={settings?.testimonials_section_title} />
      </ScrollFadeIn>

      <ScrollFadeIn>
        <ComparisonTable />
      </ScrollFadeIn>

      {hasCta && (
        <ScrollFadeIn>
          <RichSection
            title="Pronto para começar?"
            html={category.cta_text}
            images={ctaImages}
            className="py-24 bg-slate-50"
          />
        </ScrollFadeIn>
      )}

      {!hasCta && (
        <ScrollFadeIn>
          <section className="py-24 bg-slate-900">
            <div className="max-w-3xl mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Pronto para começar?
              </h2>
              <p className="text-white/60 text-lg mb-10">
                Dê o primeiro passo rumo à transformação. Agende sua sessão de hipnose clínica.
              </p>
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-white/90 rounded-full px-10"
                onClick={() => navigate('/agendar')}
              >
                {agendarText}
              </Button>
            </div>
          </section>
        </ScrollFadeIn>
      )}
    </LandingLayout>
  )
}
