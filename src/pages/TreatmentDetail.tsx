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
import { Loader2, ArrowRight } from 'lucide-react'
import { ScrollFadeIn } from '@/components/ScrollFadeIn'
import { GlobalBlueBand } from '@/components/GlobalBlueBand'
import { getCropPositionCss } from '@/lib/image-position'
import { cn } from '@/lib/utils'

const proseClass =
  'prose prose-lg max-w-none text-slate-600 [&_h1]:text-slate-900 [&_h1]:font-bold [&_h1]:text-3xl [&_h1]:mb-4 [&_h2]:text-slate-900 [&_h2]:font-bold [&_h3]:text-slate-800 [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_a]:text-blue-600'

const titleHtmlClass =
  'mb-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-slate-800 [&_p]:text-3xl [&_p]:font-bold [&_p]:text-slate-900 [&_p]:mb-0'

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
  const globalBlueBandText =
    settings?.global_blue_band_text ||
    'A hipnose clínica é uma terapia cientificamente comprovada que acessa o subconsciente para promover mudanças duradouras e profundas.'

  const hasComoFunciona = category.como_funciona_text?.trim()
  const hasResultados = category.resultados_text?.trim()
  const hasSintomas = category.sintomas_text?.trim()
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

      {hasComoFunciona && (
        <ScrollFadeIn>
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div
                  className={titleHtmlClass}
                  dangerouslySetInnerHTML={{
                    __html: category.como_funciona_title || 'Como Funciona',
                  }}
                />
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
        <section className="w-full bg-blue-700 py-5">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-white text-base md:text-lg font-semibold leading-relaxed">
              {category.faixa_azul_frase}
            </p>
          </div>
        </section>
      )}

      {hasResultados && (
        <ScrollFadeIn>
          <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
              {resultadosImg && (
                <FramedImage src={resultadosImg} alt="Resultados" position="left" />
              )}
              <div className={resultadosImg ? 'md:col-span-1' : 'md:col-span-2'}>
                <div
                  className={titleHtmlClass}
                  dangerouslySetInnerHTML={{
                    __html: category.resultados_title || 'Resultados Respaldados Pela Ciência',
                  }}
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
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div
                  className={titleHtmlClass}
                  dangerouslySetInnerHTML={{ __html: category.sintomas_title || 'Sintomas' }}
                />
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

      {otherCategories.length > 0 && (
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
      )}

      <ScrollFadeIn>
        <TestimonialsSection customTitle={settings?.testimonials_section_title} />
      </ScrollFadeIn>

      {hasPorQueTantas && <ScrollFadeIn></ScrollFadeIn>}

      {hasComparacao && <ScrollFadeIn></ScrollFadeIn>}
    </LandingLayout>
  )
}
