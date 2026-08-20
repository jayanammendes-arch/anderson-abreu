import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getTreatmentCategoryBySlug,
  getTreatmentCategories,
  getTreatmentCategoryImageUrl,
  getTreatmentCategoryComoFuncionaImageUrl,
  getTreatmentCategoryResultadosImageUrl,
  getTreatmentCategoryFaixaAzulImageUrl,
} from '@/services/treatment-categories'
import { getPlatformSettingsPublic } from '@/services/landing'
import type { TreatmentCategory, PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { Loader2, ArrowRight, MessageCircle } from 'lucide-react'
import { ScrollFadeIn } from '@/components/ScrollFadeIn'
import { GlobalBlueBand } from '@/components/GlobalBlueBand'
import { HypnotherapyComparisonSection } from '@/components/HypnotherapyComparisonSection'
import { getCropPositionCss } from '@/lib/image-position'
import { normalizeFontSizes, type FontSizeSection } from '@/lib/font-sizes'
import { cn } from '@/lib/utils'

// Prose com overrides genéricos (cor, fonte, listas). Os tamanhos de fonte
// agora são aplicados inline por seção a partir dos valores de `font_sizes`
// configurados no admin, em vez do CSS global forçado de h1–h6.
const proseClass =
  'prose prose-lg prose-invert max-w-none text-white [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_strong]:!font-bold [&_b]:!font-bold [&_a]:text-primary [&_span]:!bg-transparent [&_font]:!bg-transparent'

function SectionTitle({
  title,
  defaultTitle,
  size,
}: {
  title?: string
  defaultTitle: string
  size?: number
}) {
  const content = title?.trim() || defaultTitle
  // Renderiza EXATAMENTE o HTML do título salvo no banco, sem nenhum
  // pós-processamento de cores. Cores/gradientes aplicados manualmente no
  // editor (RichTextEditor) são respeitados; ausência de cor => branco (padrão).
  return (
    <div
      className="section-title-serif text-white mb-6 py-3 leading-[1.35]"
      style={{
        overflow: 'visible',
        fontSize: size ? `${size}px` : undefined,
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
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
  if (!src) return null
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl shadow-xl border-primary max-w-full',
        position === 'right' ? 'border-l-4' : 'border-r-4',
      )}
    >
      <img src={src} alt={alt} className="w-full h-[400px] md:h-[600px] max-w-full object-cover" />
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

  // Tamanhos de fonte (px) por seção, configurados no admin. Cada seção
  // editável tem um tamanho para título e outro para conteúdo, aplicados inline.
  const fontSizes = useMemo(() => normalizeFontSizes(category?.font_sizes), [category?.font_sizes])

  const sizeFor = (section: FontSizeSection) => fontSizes[section]

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
          <h1 className="text-3xl font-bold text-white mb-4">Tratamento não encontrado</h1>
          <Button asChild className="royal-btn-gradient text-white">
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
  const faixaAzulImg = getTreatmentCategoryFaixaAzulImageUrl(category)
  const whatsappNumber = (settings?.whatsapp_number || '').replace(/\D/g, '')

  const hasComoFunciona = category.como_funciona_text?.trim()
  const hasResultados = category.resultados_text?.trim()
  const hasSintomasCorpo = category.sintomas_corpo_text?.trim()
  const hasSintomasMente = category.sintomas_mente_text?.trim()
  const hasSintomas = hasSintomasCorpo || hasSintomasMente
  const hasDetailedContent = category.detailed_content?.trim()
  const hasCta = category.cta_text?.trim()
  const hasPorQueTantas = category.por_que_tantas_content?.trim()
  const hasComparacao = category.comparacao_content?.trim()

  let imgSectionIdx = 0
  const comoFuncionaImgLeft = (() => {
    if (!hasComoFunciona || !comoFuncionaImg) return false
    return imgSectionIdx++ % 2 === 1
  })()
  const resultadosImgLeft = (() => {
    if (!hasResultados || !resultadosImg) return false
    return imgSectionIdx++ % 2 === 1
  })()

  const detailedStyles = sizeFor('detailed_content')
  const comoFuncionaStyles = sizeFor('como_funciona')
  const resultadosStyles = sizeFor('resultados')
  const sintomasStyles = sizeFor('sintomas')
  const sintomasCorpoStyles = sizeFor('sintomas_corpo')
  const sintomasMenteStyles = sizeFor('sintomas_mente')
  const ctaStyles = sizeFor('cta')

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
            <div className="absolute inset-0 bg-gradient-to-br from-background to-card" />
          )}
          <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-20">
            <div className="max-w-2xl">
              {!category.hide_icon && (
                <Icon className="h-12 w-12 text-primary mb-6" strokeWidth={1.5} />
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
          <section className="py-24 bg-card overflow-visible">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 overflow-visible">
              <div
                className={proseClass}
                style={{ fontSize: `${detailedStyles.content}px` }}
                dangerouslySetInnerHTML={{ __html: category.detailed_content! }}
              />
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {hasComoFunciona && (
        <ScrollFadeIn>
          <section className="py-24 bg-card overflow-visible">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 grid md:grid-cols-2 gap-8 lg:gap-12 items-center overflow-visible">
              <div className={cn(comoFuncionaImgLeft && 'md:order-2')}>
                <SectionTitle
                  title={category.como_funciona_title}
                  defaultTitle="Como Funciona"
                  size={comoFuncionaStyles.title}
                />
                <div
                  className={proseClass}
                  style={{ fontSize: `${comoFuncionaStyles.content}px` }}
                  dangerouslySetInnerHTML={{ __html: category.como_funciona_text! }}
                />
              </div>
              {comoFuncionaImg && (
                <div className={cn(comoFuncionaImgLeft && 'md:order-1')}>
                  <FramedImage
                    src={comoFuncionaImg}
                    alt="Como Funciona"
                    position={comoFuncionaImgLeft ? 'left' : 'right'}
                  />
                </div>
              )}
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {(category.faixa_azul_frase?.trim() ||
        faixaAzulImg ||
        category.faixa_azul_whatsapp_enabled) && (
        <section
          className="relative w-full overflow-hidden"
          style={
            faixaAzulImg
              ? {
                  backgroundImage: `url(${faixaAzulImg})`,
                  backgroundAttachment: 'fixed',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  minHeight: '320px',
                }
              : undefined
          }
        >
          {!faixaAzulImg && <div className="absolute inset-0 bg-[#0B1D3A]" />}
          {faixaAzulImg && <div className="absolute inset-0 bg-[#0B1D3A]/70" />}
          <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24 flex flex-col items-center gap-8">
            {category.faixa_azul_frase?.trim() && (
              <p className="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-center max-w-4xl">
                {category.faixa_azul_frase}
              </p>
            )}
            {category.faixa_azul_subtitulo?.trim() && (
              <p className="text-white/80 text-base md:text-lg lg:text-xl font-medium leading-relaxed text-center max-w-3xl">
                {category.faixa_azul_subtitulo}
              </p>
            )}
            {category.faixa_azul_whatsapp_enabled && whatsappNumber && (
              <Button
                size="lg"
                className="bg-[#25D366] hover:bg-[#1eb558] text-white rounded-full px-10 py-6 text-lg font-medium shadow-lg transition-all hover:scale-105 border-none"
                asChild
              >
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {category.faixa_azul_whatsapp_text || 'Fale Conosco'}
                </a>
              </Button>
            )}
          </div>
        </section>
      )}

      {hasResultados && (
        <ScrollFadeIn>
          <section className="py-24 bg-card/50 overflow-visible">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 grid md:grid-cols-2 gap-8 lg:gap-12 items-center overflow-visible">
              <div
                className={cn(
                  resultadosImg ? 'md:col-span-1' : 'md:col-span-2',
                  resultadosImgLeft && 'md:order-2',
                )}
              >
                <SectionTitle
                  title={category.resultados_title}
                  defaultTitle="Resultados Respaldados Pela Ciência"
                  size={resultadosStyles.title}
                />
                <div
                  className={proseClass}
                  style={{ fontSize: `${resultadosStyles.content}px` }}
                  dangerouslySetInnerHTML={{ __html: category.resultados_text! }}
                />
              </div>
              {resultadosImg && (
                <div className={cn(resultadosImgLeft && 'md:order-1')}>
                  <FramedImage
                    src={resultadosImg}
                    alt="Resultados"
                    position={resultadosImgLeft ? 'left' : 'right'}
                  />
                </div>
              )}
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {hasSintomas && (
        <ScrollFadeIn>
          <section className="py-24 bg-card overflow-visible">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 overflow-visible">
              {/* Título centralizado acima dos dois quadros */}
              <div className="text-center mb-8 md:mb-12">
                <SectionTitle
                  title={category.sintomas_title}
                  defaultTitle="Sintomas"
                  size={sintomasStyles.title}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-stretch overflow-visible">
                {/* Sinais Físicos */}
                {hasSintomasCorpo ? (
                  <div className="bg-[#111622] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col space-y-4">
                    <h3 className="text-xl md:text-2xl font-bold leading-snug">Sinais Físicos</h3>
                    <div
                      className={proseClass}
                      style={{ fontSize: `${sintomasCorpoStyles.content}px` }}
                      dangerouslySetInnerHTML={{ __html: category.sintomas_corpo_text! }}
                    />
                  </div>
                ) : (
                  <div className="hidden md:block" aria-hidden />
                )}

                {/* Sinais Emocionais */}
                {hasSintomasMente ? (
                  <div className="bg-[#111622] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col space-y-4">
                    <h3 className="text-xl md:text-2xl font-bold leading-snug">
                      Sinais Emocionais
                    </h3>
                    <div
                      className={proseClass}
                      style={{ fontSize: `${sintomasMenteStyles.content}px` }}
                      dangerouslySetInnerHTML={{ __html: category.sintomas_mente_text! }}
                    />
                  </div>
                ) : (
                  <div className="hidden md:block" aria-hidden />
                )}
              </div>
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {hasCta && (
        <ScrollFadeIn>
          <section className="py-24 bg-card overflow-visible">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 text-center overflow-visible">
              <SectionTitle title={category.cta_title} defaultTitle="" size={ctaStyles.title} />
              <div
                className={proseClass}
                style={{ fontSize: `${ctaStyles.content}px` }}
                dangerouslySetInnerHTML={{ __html: category.cta_text! }}
              />
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {hasPorQueTantas && (
        <ScrollFadeIn>
          <section className="py-24 bg-card overflow-visible">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 overflow-visible">
              <SectionTitle
                title={category.por_que_tantas_title}
                defaultTitle=""
                size={detailedStyles.title}
              />
              <div
                className={proseClass}
                dangerouslySetInnerHTML={{ __html: category.por_que_tantas_content! }}
              />
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {hasComparacao && (
        <ScrollFadeIn>
          <section className="py-24 bg-card/50 overflow-visible">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 overflow-visible">
              <SectionTitle
                title={category.comparacao_title}
                defaultTitle=""
                size={detailedStyles.title}
              />
              <div
                className={proseClass}
                dangerouslySetInnerHTML={{ __html: category.comparacao_content! }}
              />
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {settings && (
        <ScrollFadeIn>
          <HypnotherapyComparisonSection settings={settings} />
        </ScrollFadeIn>
      )}

      {otherCategories.length > 0 && (
        <ScrollFadeIn>
          <section className="py-24 bg-card/50 overflow-visible">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 overflow-visible">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Outros Tratamentos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherCategories.map((cat) => {
                  const CatIcon = getTreatmentIcon(cat.icon)
                  return (
                    <Link
                      key={cat.id}
                      to={`/tratamentos/${cat.slug}`}
                      className="group flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all shadow-md"
                    >
                      <CatIcon className="h-8 w-8 text-primary" strokeWidth={1.5} />
                      <span className="text-sm font-medium text-white/80 group-hover:text-primary text-center">
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
