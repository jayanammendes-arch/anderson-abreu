import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getTreatmentCategoryBySlug,
  getTreatmentCategories,
  getTreatmentCategoryImageUrl,
  getTreatmentCategoryComoFuncionaImageUrl,
  getTreatmentCategoryResultadosImageUrl,
  getTreatmentCategorySintomasImageUrl,
} from '@/services/treatment-categories'
import { getPlatformSettingsPublic } from '@/services/landing'
import type { TreatmentCategory, PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { Loader2, ArrowRight, Calendar } from 'lucide-react'
import { ScrollFadeIn } from '@/components/ScrollFadeIn'
import { GlobalBlueBand } from '@/components/GlobalBlueBand'
import { HypnotherapyComparisonSection } from '@/components/HypnotherapyComparisonSection'
import { getCropPositionCss } from '@/lib/image-position'
import { cn } from '@/lib/utils'

const proseClass =
  'prose prose-lg max-w-none text-slate-600 [&_h1]:text-slate-900 [&_h1]:font-bold [&_h1]:text-3xl [&_h1]:mb-4 [&_h2]:text-slate-900 [&_h2]:font-bold [&_h3]:text-slate-800 [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_a]:text-blue-600 [&_span]:!bg-transparent'

function SectionTitle({ title, defaultTitle }: { title?: string; defaultTitle: string }) {
  const content = title?.trim() || defaultTitle
  if (content.includes('<')) {
    return (
      <div
        className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-snug py-1 [&_span]:!bg-transparent [&_p]:text-3xl [&_p]:md:text-4xl [&_p]:font-bold [&_p]:text-slate-900 [&_p]:mb-0"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }
  return (
    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-snug py-1">
      {content}
    </h2>
  )
}

function FramedImage({
  src,
  alt,
  position,
}: {
  src: string
  alt: string
  position: 'left' | 'right'
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg shadow-xl border-blue-600 max-w-full',
        position === 'right' ? 'border-l-4' : 'border-r-4',
      )}
    >
      <img src={src} alt={alt} className="w-[800px] h-[600px] max-w-full object-cover" />
    </div>
  )
}

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
              <ArrowRight className="mr-2 h-4 w-4" /> Voltar para tratamentos
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
  const comoFuncionaImg = getTreatmentCategoryComoFuncionaImageUrl(category)
  const resultadosImg = getTreatmentCategoryResultadosImageUrl(category)
  const sintomasImg = getTreatmentCategorySintomasImageUrl(category)

  const hasComoFunciona = category.como_funciona_text?.trim()
  const hasResultados = category.resultados_text?.trim()
  const hasSintomas = category.sintomas_text?.trim()
  const hasDetailedContent = category.detailed_content?.trim()
  const hasCta = category.cta_text?.trim()
  const hasPorQueTantas = category.por_que_tantas_content?.trim()
  const hasComparacao = category.comparacao_content?.trim()

  return (
    <LandingLayout settings={settings}>
      <ScrollFadeIn>
        <section className="relative min-h-[60vh] flex items-center overflow-hidden pt-20">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  objectPosition: getCropPositionCss(category.crop_x, category.crop_y),
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700" />
          )}
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
            <div className="max-w-2xl">
              {!category.hide_icon && (
                <Icon className="h-12 w-12 text-white/80 mb-6" strokeWidth={1.5} />
              )}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{category.name}</h1>
              <p className="text-lg md:text-xl text-white/80 mb-8">{category.short_description}</p>
              <Button
                size="lg"
                className="royal-btn-gradient text-white rounded-full px-8"
                onClick={() => navigate('/agendar')}
              >
                {agendarText}
              </Button>
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      <ScrollFadeIn>
        <GlobalBlueBand settings={settings} />
      </ScrollFadeIn>

      {hasDetailedContent && (
        <ScrollFadeIn>
          <section className="py-24 bg-white overflow-visible">
            <div className="max-w-4xl mx-auto px-6 overflow-visible">
              <div
                className={proseClass}
                dangerouslySetInnerHTML={{ __html: category.detailed_content! }}
              />
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {hasComoFunciona && (
        <ScrollFadeIn>
          <section className="py-24 bg-white overflow-visible">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center overflow-visible">
              <div>
                <SectionTitle title={category.como_funciona_title} defaultTitle="Como Funciona" />
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: category.como_funciona_text! }}
                />
              </div>
              {comoFuncionaImg && (
                <FramedImage src={comoFuncionaImg} alt="Como Funciona" position="right" />
              )}
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {category.faixa_azul_frase?.trim() && (
        <section className="w-full royal-cta-gradient py-8 md:py-10">
          <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center gap-6">
            <p className="text-white text-base md:text-lg font-semibold leading-relaxed">
              {category.faixa_azul_frase}
            </p>
            <Button
              size="lg"
              className="bg-[#22C55E] hover:bg-[#1ea34d] text-white rounded-full px-10 py-6 text-lg font-medium shadow-lg transition-all hover:scale-105 border-none"
              onClick={() => navigate('/agendar')}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {agendarText}
            </Button>
          </div>
        </section>
      )}

      {hasResultados && (
        <ScrollFadeIn>
          <section className="py-24 bg-slate-50 overflow-visible">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center overflow-visible">
              {resultadosImg && (
                <FramedImage src={resultadosImg} alt="Resultados" position="left" />
              )}
              <div className={resultadosImg ? 'md:col-span-1' : 'md:col-span-2'}>
                <SectionTitle
                  title={category.resultados_title}
                  defaultTitle="Resultados Respaldados Pela Ciência"
                />
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: category.resultados_text! }}
                />
              </div>
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {hasSintomas && (
        <ScrollFadeIn>
          <section className="py-24 bg-white overflow-visible">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center overflow-visible">
              <div>
                <SectionTitle title={category.sintomas_title} defaultTitle="Sintomas" />
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: category.sintomas_text! }}
                />
              </div>
              {sintomasImg && <FramedImage src={sintomasImg} alt="Sintomas" position="right" />}
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {hasCta && (
        <ScrollFadeIn>
          <section className="py-24 bg-white overflow-visible">
            <div className="max-w-4xl mx-auto px-6 text-center overflow-visible">
              <SectionTitle title={category.cta_title} defaultTitle="" />
              <div
                className={proseClass}
                dangerouslySetInnerHTML={{ __html: category.cta_text! }}
              />
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {hasPorQueTantas && <ScrollFadeIn></ScrollFadeIn>}

      {hasComparacao && <ScrollFadeIn></ScrollFadeIn>}

      {settings && (
        <ScrollFadeIn>
          <HypnotherapyComparisonSection settings={settings} />
        </ScrollFadeIn>
      )}

      {otherCategories.length > 0 && (
        <ScrollFadeIn>
          <section className="py-24 bg-slate-50 overflow-visible">
            <div className="max-w-7xl mx-auto px-6 overflow-visible">
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
      )}

      <ScrollFadeIn>
        <TestimonialsSection customTitle={settings?.testimonials_section_title} />
      </ScrollFadeIn>
    </LandingLayout>
  )
}
