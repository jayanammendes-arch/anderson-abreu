import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getPlatformSettingsPublic,
  getAboutHeroImageUrl,
  getAboutJourneyPhotoUrl,
  getAboutFormationsImageUrl,
  getAboutCtaBackgroundImageUrl,
} from '@/services/landing'
import {
  getAboutGrandNames,
  getAboutMediaMentions,
  getAboutRecommendations,
  getAboutEnvironmentImages,
  getAboutEnvironmentImageUrl,
} from '@/services/about-collections'
import type {
  PlatformSettings,
  AboutGrandName,
  AboutMediaMention,
  AboutRecommendation,
  AboutEnvironmentImage,
} from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { CredentialsMarquee } from '@/components/CredentialsMarquee'
import { GrandNamesCarousel } from '@/components/GrandNamesCarousel'
import { VideoEmbed } from '@/components/community/VideoEmbed'
import { ScrollFadeIn } from '@/components/ScrollFadeIn'
import { Check, Loader2 } from 'lucide-react'

export default function Sobre() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [grandNames, setGrandNames] = useState<AboutGrandName[]>([])
  const [mediaMentions, setMediaMentions] = useState<AboutMediaMention[]>([])
  const [recommendations, setRecommendations] = useState<AboutRecommendation[]>([])
  const [envImages, setEnvImages] = useState<AboutEnvironmentImage[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const [s, gn, mm, rec, env] = await Promise.all([
      getPlatformSettingsPublic().catch(() => null),
      getAboutGrandNames().catch(() => []),
      getAboutMediaMentions().catch(() => []),
      getAboutRecommendations().catch(() => []),
      getAboutEnvironmentImages().catch(() => []),
    ])
    setSettings(s as PlatformSettings | null)
    setGrandNames(gn as AboutGrandName[])
    setMediaMentions(mm as AboutMediaMention[])
    setRecommendations(rec as AboutRecommendation[])
    setEnvImages(env as AboutEnvironmentImage[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('platform_settings', () => loadData())
  useRealtime('about_grand_names', () => loadData())
  useRealtime('about_media_mentions', () => loadData())
  useRealtime('about_recommendations', () => loadData())
  useRealtime('about_environment_images', () => loadData())

  const heroImage = settings ? getAboutHeroImageUrl(settings) : null
  const journeyPhoto = settings ? getAboutJourneyPhotoUrl(settings) : null
  const formationsImage = settings ? getAboutFormationsImageUrl(settings) : null
  const ctaBg = settings ? getAboutCtaBackgroundImageUrl(settings) : null

  let formations: string[] = []
  if (settings?.about_formations_list) {
    try {
      const parsed =
        typeof settings.about_formations_list === 'string'
          ? JSON.parse(settings.about_formations_list)
          : settings.about_formations_list
      if (Array.isArray(parsed)) {
        formations = parsed
          .map((item: unknown) => {
            if (typeof item === 'string') return item
            if (item && typeof item === 'object' && 'text' in item) {
              return String((item as { text: unknown }).text)
            }
            return ''
          })
          .filter((s: string) => s.trim())
      }
    } catch {
      formations = []
    }
  }

  const ctaLink = settings?.about_cta_button_link || '/agendar'
  const ctaText = settings?.about_cta_button_text || 'Agende sua sessão'

  if (loading) {
    return (
      <LandingLayout settings={settings}>
        <div className="flex h-screen items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LandingLayout>
    )
  }

  return (
    <LandingLayout settings={settings}>
      {settings?.about_hero_visible !== false && (
        <ScrollFadeIn>
          <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
            {heroImage ? (
              <>
                <img
                  src={heroImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
              </>
            ) : (
              <div className="absolute inset-0 royal-gradient-bg" />
            )}
            <div className="relative z-10 text-center px-6 py-20">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {settings?.about_hero_title || 'Anderson Abreu'}
              </h1>
              <p className="text-xl md:text-2xl text-white/80">
                {settings?.about_hero_subtitle || 'Referência Nacional em Hipnoterapia'}
              </p>
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {settings?.about_journey_visible !== false && (
        <ScrollFadeIn>
          <section className="py-20 bg-card">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                {settings?.about_journey_title || 'Jornada de Sucesso'}
              </h2>
              <div className="grid md:grid-cols-2 gap-12 items-start">
                <div>
                  <img
                    src={
                      journeyPhoto ||
                      'https://img.usecurling.com/p/600/800?q=hypnotherapist%20portrait&color=gray'
                    }
                    alt="Anderson Abreu"
                    className="rounded-2xl shadow-xl w-full h-[400px] md:h-[500px] object-cover border border-white/10"
                  />
                </div>
                <div>
                  {settings?.about_full_bio ? (
                    <div
                      className="prose prose-lg prose-invert max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: settings.about_full_bio }}
                    />
                  ) : (
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Especialista em hipnose clínica e desenvolvimento humano, com mais de uma
                      década transformando vidas.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {settings?.about_formations_visible !== false && (
        <ScrollFadeIn>
          <section className="py-20 bg-card/50">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                {settings?.about_formations_title || 'Formações'}
              </h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <ul className="space-y-4">
                    {formations.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                          <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                        </span>
                        <span className="text-lg text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {formationsImage && (
                  <div>
                    <img
                      src={formationsImage}
                      alt=""
                      className="rounded-2xl shadow-xl w-full h-[400px] object-cover border border-white/10"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {settings?.about_credentials_visible !== false && (
        <ScrollFadeIn>
          <CredentialsMarquee />
        </ScrollFadeIn>
      )}

      {settings?.about_grand_names_visible !== false && grandNames.length > 0 && (
        <ScrollFadeIn>
          <section className="py-20 bg-card">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                {settings?.about_grand_names_title?.trim() || 'Com Grandes Nomes da Hipnoterapia'}
              </h2>
              <GrandNamesCarousel items={grandNames} />
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {settings?.about_media_visible !== false && mediaMentions.length > 0 && (
        <ScrollFadeIn>
          <section className="py-20 bg-card/50">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                {settings?.about_media_title || 'Na Mídia'}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {mediaMentions.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/5 border border-white/10 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm"
                  >
                    {item.video_url && <VideoEmbed url={item.video_url} />}
                    <div className="p-6">
                      <h3 className="font-bold text-white mb-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-white/70">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {settings?.about_recommendations_visible !== false && recommendations.length > 0 && (
        <ScrollFadeIn>
          <section className="py-20 bg-card">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                {settings?.about_recommendations_title || 'Quem Recomenda'}
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {recommendations.map((item) => (
                  <div key={item.id} className="space-y-3">
                    <VideoEmbed url={item.video_url} />
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {settings?.about_environment_visible !== false && envImages.length > 0 && (
        <ScrollFadeIn>
          <section className="py-20 bg-card/50">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                {(() => {
                  const title = settings?.about_environment_title || 'Nosso Ambiente'
                  const parts = title.split(/(Ambiente)/i)
                  return parts.map((part, i) =>
                    part.toLowerCase() === 'ambiente' ? (
                      <span key={i} className="text-primary">
                        {part}
                      </span>
                    ) : (
                      <span key={i}>{part}</span>
                    ),
                  )
                })()}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {envImages.map((item, idx) => {
                  const fallbackImages = [
                    'https://img.usecurling.com/p/600/800?q=clinic%20reception',
                    'https://img.usecurling.com/p/600/800?q=treatment%20room%20therapy',
                    'https://img.usecurling.com/p/600/800?q=certificates%20wall',
                    'https://img.usecurling.com/p/600/800?q=therapy%20armchair',
                  ]
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl overflow-hidden shadow-md border border-white/10 bg-white/5"
                    >
                      <img
                        src={
                          getAboutEnvironmentImageUrl(item) ||
                          fallbackImages[idx % fallbackImages.length]
                        }
                        alt={item.caption || ''}
                        className="w-full h-72 object-cover rounded-2xl"
                      />
                      {item.caption && (
                        <p className="text-sm text-center text-muted-foreground mt-2 px-2 pb-1">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {settings?.about_cta_visible !== false && (
        <ScrollFadeIn>
          <section className="relative py-24 overflow-hidden">
            {ctaBg ? (
              <>
                <img src={ctaBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#020412]/80 via-[#0a1a5e]/80 to-[#0e2575]" />{' '}
              </>
            ) : (
              <div className="absolute inset-0 royal-cta-gradient" />
            )}
            <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {settings?.about_cta_title || 'Pronto para transformar sua vida?'}
              </h2>
              <p className="text-lg text-white/80 mb-8">
                {settings?.about_cta_subtitle ||
                  'Agende sua sessão e dê o primeiro passo rumo ao bem-estar.'}
              </p>
              <Button
                size="lg"
                className="royal-btn-gradient text-white rounded-full px-10 py-6 text-lg font-medium shadow-lg transition-all hover:scale-105 border-none"
                asChild
              >
                {ctaLink.startsWith('/') ? (
                  <Link to={ctaLink}>{ctaText}</Link>
                ) : (
                  <a href={ctaLink} target="_blank" rel="noopener noreferrer">
                    {ctaText}
                  </a>
                )}
              </Button>
            </div>
          </section>
        </ScrollFadeIn>
      )}
    </LandingLayout>
  )
}
