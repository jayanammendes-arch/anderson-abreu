import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getTreatmentCategoryBySlug,
  getTreatmentCategories,
  getTreatmentCategoryImageUrl,
  getTreatmentCategoryComoFuncionaImageUrl,
  getTreatmentCategoryResultadosImageUrl,
  getTreatmentCategorySintomasImageUrl,
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
import { renderSectionTitleHtml } from '@/lib/section-title-gradient'
import { cn } from '@/lib/utils'

const proseClass =
  'prose prose-lg prose-invert max-w-none text-white [&_*]:!font-["Open_Sans",sans-serif] [&_p]:!font-["Open_Sans",sans-serif] [&_p]:!leading-[1.6] [&_p]:!text-white [&_p_*]:!font-["Open_Sans",sans-serif] [&_p_*]:!text-white [&_h1]:!text-white [&_h1]:font-bold [&_h1]:text-3xl [&_h1]:mb-4 [&_h2]:!text-white [&_h2]:font-bold [&_h3]:!text-white [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:!font-["Open_Sans",sans-serif] [&_li]:!leading-[1.6] [&_li]:!text-white [&_li_*]:!font-["Open_Sans",sans-serif] [&_li_*]:!text-white [&_li]:mb-2 [&_strong]:!font-["Open_Sans",sans-serif] [&_strong]:!font-bold [&_b]:!font-["Open_Sans",sans-serif] [&_b]:!font-bold [&_a]:text-primary [&_span:not([class*="rte-gradient"])]:!text-white [&_font]:!text-white [&_font]:!font-["Open_Sans",sans-serif] [&_span]:!bg-transparent [&_font]:!bg-transparent'

function SectionTitle({ title, defaultTitle }: { title?: string; defaultTitle: string }) {
  const content = title?.trim() || defaultTitle
  // Aplica o padrão automático: todas as palavras em branco, exceto a última
  // com gradiente dourado. Exceção: "APROVADO PELA CIÊNCIA" fica inteiro dourado.
  const html = renderSectionTitleHtml(content)
  return (
    <div
      className="section-title-serif text-white mb-6 py-1"
      dangerouslySetInnerHTML={{ __html: html }}
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
  const sintomasImg = getTreatmentCategorySintomasImageUrl(category)
  const faixaAzulImg = getTreatmentCategoryFaixaAzulImageUrl(category)
  const whatsappNumber = (settings?.whatsapp_number || '').replace(/\D/g, '')

  const hasComoFunciona = category.como_funciona_text?.trim()
  const hasResultados = category.resultados_text?.trim()
  const hasSintomasCorpo = category.sintomas_corpo_text?.trim()
  const hasSintomasMente = category.sintomas_mente_text?.trim()
  const hasSintomasText = category.sintomas_text?.trim()
  const hasSintomas = hasSintomasCorpo || hasSintomasMente || hasSintomasText
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
  const sintomasImgLeft = (() => {
    if (!hasSintomas || !sintomasImg) return false
    return imgSectionIdx++ % 2 === 1
  })()

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
                <SectionTitle title={category.como_funciona_title} defaultTitle="Como Funciona" />
                <div
                  className={proseClass}
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
                />
                <div
                  className={proseClass}
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
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 grid md:grid-cols-2 gap-8 lg:gap-12 items-center overflow-visible">
              <div className={cn('w-full', sintomasImgLeft && 'md:order-2')}>
                <SectionTitle title={category.sintomas_title} defaultTitle="Sintomas" />

                {hasSintomasCorpo || hasSintomasMente ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {hasSintomasCorpo && (
                      <div className="bg-[#111622] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col space-y-4">
                        <h3 className="font-['Playfair_Display',serif] text-xl md:text-2xl font-bold text-[#D4AF37] leading-snug">
                          No Corpo (Sinais Físicos)
                        </h3>
                        <div
                          className={proseClass}
                          dangerouslySetInnerHTML={{ __html: category.sintomas_corpo_text! }}
                        />
                      </div>
                    )}

                    {hasSintomasMente && (
                      <div className="bg-[#111622] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col space-y-4">
                        <h3 className="font-['Playfair_Display',serif] text-xl md:text-2xl font-bold text-[#D4AF37] leading-snug">
                          Na Mente e no Comportamento (Sinais Emocionais)
                        </h3>
                        <div
                          className={proseClass}
                          dangerouslySetInnerHTML={{ __html: category.sintomas_mente_text! }}
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                {hasSintomasText && (
                  <div
                    className={cn(
                      'mt-6',
                      (hasSintomasCorpo || hasSintomasMente) && 'pt-6 border-t border-white/10',
                    )}
                  >
                    {(hasSintomasCorpo || hasSintomasMente) && (
                      <h4 className="font-['Playfair_Display',serif] text-lg font-semibold text-[#D4AF37] mb-3">
                        Notas Adicionais
                      </h4>
                    )}
                    <div
                      className={proseClass}
                      dangerouslySetInnerHTML={{ __html: category.sintomas_text! }}
                    />
                  </div>
                )}
              </div>

              {sintomasImg && (
                <div className={cn('w-full', sintomasImgLeft && 'md:order-1')}>
                  <FramedImage
                    src={sintomasImg}
                    alt="Sintomas"
                    position={sintomasImgLeft ? 'left' : 'right'}
                  />
                </div>
              )}
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {hasCta && (
        <ScrollFadeIn>
          <section className="py-24 bg-card overflow-visible">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 text-center overflow-visible">
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
