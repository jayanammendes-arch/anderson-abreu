import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getTreatmentCategoryBySlug,
  getTreatmentCategories,
  getTreatmentCategoryImageUrl,
  getTreatmentCategoryImageUrls,
  getTreatmentCategorySintomasImageUrl,
} from '@/services/treatment-categories'
import { getPlatformSettingsPublic } from '@/services/landing'
import type { TreatmentCategory, PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { AccordionSection } from '@/components/treatment/AccordionSection'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { getTreatmentDetailConfig, type SectionConfigItem } from '@/lib/treatment-sections'
import { Loader2, ArrowLeft } from 'lucide-react'
import { ScrollFadeIn } from '@/components/ScrollFadeIn'
import { getImagePositionCss } from '@/lib/image-position'

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
  const saibaText = settings?.saiba_mais_text || 'Saiba Mais'
  const accordionEnabled = settings?.treatments_accordion_enabled ?? false
  const comoFuncionaImg = getTreatmentCategoryImageUrls(category, 'como_funciona_images')[0]
  const resultadosImg = getTreatmentCategoryImageUrls(category, 'resultados_images')[0]
  const sintomasImg = getTreatmentCategorySintomasImageUrl(category)

  const sectionsConfig = getTreatmentDetailConfig(
    category.sections_config as SectionConfigItem[] | undefined,
  )

  const renderDynamicSection = (section: SectionConfigItem) => {
    if (!section.visible) return null

    switch (section.id) {
      case 'como_funciona': {
        const hasText = category.como_funciona_text?.trim()
        if (!hasText && !comoFuncionaImg) return null
        return (
          <AccordionSection
            id="como-funciona"
            title={category.como_funciona_title || 'Como Funciona'}
            accordionEnabled={accordionEnabled}
            className="py-24 bg-slate-50"
          >
            {hasText && (
              <div
                className="prose prose-lg max-w-none text-slate-600 [&_h2]:text-slate-900 [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2"
                dangerouslySetInnerHTML={{ __html: category.como_funciona_text! }}
              />
            )}
            {comoFuncionaImg && (
              <img
                src={comoFuncionaImg}
                alt="Como Funciona"
                className="rounded-xl shadow-md w-full h-64 object-cover mt-6"
              />
            )}
          </AccordionSection>
        )
      }
      case 'sintomas': {
        const hasText = category.sintomas_text?.trim()
        if (!hasText) return null
        return (
          <AccordionSection
            title={category.sintomas_title || 'Sintomas'}
            accordionEnabled={accordionEnabled}
            className="py-24 bg-white"
          >
            <div
              className="prose prose-lg max-w-none text-slate-600 [&_h2]:text-slate-900 [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2"
              dangerouslySetInnerHTML={{ __html: category.sintomas_text! }}
            />
          </AccordionSection>
        )
      }
      case 'sintomas_imagem': {
        if (!sintomasImg) return null
        return (
          <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-6">
              <img
                src={sintomasImg}
                alt="Sintomas"
                className="rounded-xl shadow-md w-full h-64 object-cover"
              />
            </div>
          </section>
        )
      }
      case 'resultados': {
        const hasText = category.resultados_text?.trim()
        if (!hasText && !resultadosImg) return null
        return (
          <AccordionSection
            title={category.resultados_title || 'Resultados'}
            accordionEnabled={accordionEnabled}
            className="py-24 bg-slate-50"
          >
            {hasText && (
              <div
                className="prose prose-lg max-w-none text-slate-600 [&_h2]:text-slate-900 [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2"
                dangerouslySetInnerHTML={{ __html: category.resultados_text! }}
              />
            )}
            {resultadosImg && (
              <img
                src={resultadosImg}
                alt="Resultados"
                className="rounded-xl shadow-md w-full h-64 object-cover mt-6"
              />
            )}
          </AccordionSection>
        )
      }
      case 'faixa_destaque': {
        if (!category.faixa_text?.trim()) return null
        return (
          <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">{category.faixa_text}</p>
            </div>
          </section>
        )
      }
      default:
        return null
    }
  }

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
                style={{ objectPosition: getImagePositionCss(category.image_position) }}
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
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="royal-btn-gradient text-white rounded-full px-8"
                  onClick={() => navigate('/agendar')}
                >
                  {agendarText}
                </Button>
                <a href="#como-funciona">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full border-white/30 text-white hover:bg-white/10 hover:text-white"
                  >
                    {saibaText}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      {sectionsConfig.map((section) => (
        <div key={section.id}>{renderDynamicSection(section)}</div>
      ))}

      <ScrollFadeIn>
        <TestimonialsSection customTitle={settings?.testimonials_section_title} />
      </ScrollFadeIn>

      {otherCategories.length > 0 && (
        <ScrollFadeIn>
          <section className="py-24 bg-white">
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
    </LandingLayout>
  )
}
