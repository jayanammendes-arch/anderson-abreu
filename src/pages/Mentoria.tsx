import { useState, useEffect } from 'react'
import { getPlatformSettingsPublic } from '@/services/landing'
import { getActiveInstagramPosts, getInstagramPostImageUrl } from '@/services/instagram-posts'
import { useRealtime } from '@/hooks/use-realtime'
import type { PlatformSettings, InstagramPost } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { ScrollFadeIn } from '@/components/ScrollFadeIn'
import {
  Loader2,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Instagram,
  ExternalLink,
} from 'lucide-react'

const DEFAULT_BENEFITS = [
  'Acompanhamento personalizado e individual',
  'Estratégias exclusivas de alta performance',
  'Desenvolvimento de inteligência emocional',
  'Planos de ação sob medida para seus objetivos',
  'Acesso direto e suporte contínuo',
  'Resultados mensuráveis e acompanhamento de progresso',
]

function parseBenefits(raw: unknown): string[] {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
        return parsed.length > 0 ? parsed : DEFAULT_BENEFITS
      }
    } catch {
      /* intentionally ignored */
    }
  }
  if (Array.isArray(raw) && raw.every((v) => typeof v === 'string')) {
    return raw.length > 0 ? raw : DEFAULT_BENEFITS
  }
  return DEFAULT_BENEFITS
}

export default function Mentoria() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getPlatformSettingsPublic()
        .then((data) => setSettings(data as PlatformSettings | null))
        .catch(() => {}),
      getActiveInstagramPosts()
        .then((posts) => setInstagramPosts(posts))
        .catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  useRealtime('platform_settings', () => {
    getPlatformSettingsPublic()
      .then((data) => setSettings(data as PlatformSettings | null))
      .catch(() => {})
  })

  useRealtime('instagram_posts', () => {
    getActiveInstagramPosts()
      .then((posts) => setInstagramPosts(posts))
      .catch(() => {})
  })

  const title = settings?.mentorship_title || 'Mentoria de Alta Performance'
  const subtitle =
    settings?.mentorship_subtitle || 'Transforme sua vida e alcance resultados extraordinários'
  const description = settings?.mentorship_description || ''
  const benefits = parseBenefits(settings?.mentorship_benefits)
  const buttonText = settings?.mentorship_button_text || 'Falar sobre a Mentoria'
  const whatsappNumber = (settings?.mentorship_whatsapp_number || '').replace(/\D/g, '')

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Olá! Tenho interesse na mentoria de alta performance e gostaria de saber mais.`,
      )}`
    : null

  // URL do perfil do Instagram (configurado no Admin: instagram_url ou fallback construído com instagram_handle)
  const instagramProfileUrl =
    settings?.instagram_url?.trim() ||
    (settings?.instagram_handle?.trim()
      ? `https://instagram.com/${settings.instagram_handle.trim().replace(/^@/, '')}`
      : 'https://instagram.com')

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
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 royal-gradient-bg" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <ScrollFadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-white/90">Mentoria Exclusiva</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-white drop-shadow-sm">
              {title}
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-white/90 mb-8">{subtitle}</p>
          </ScrollFadeIn>
        </div>
      </section>

      {description && (
        <ScrollFadeIn>
          <section className="py-20 bg-card">
            <div className="max-w-3xl mx-auto px-6">
              <div
                className="prose prose-lg prose-invert max-w-none text-muted-foreground [&_p]:text-muted-foreground [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          </section>
        </ScrollFadeIn>
      )}

      <ScrollFadeIn>
        <section className="py-20 bg-card/50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              O que você recebe
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 border border-primary/40 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </span>
                  <span className="text-lg text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      {/* Seção Acompanhe no Instagram */}
      {instagramPosts.length > 0 && (
        <ScrollFadeIn>
          <section className="py-20 bg-[#1F3552] border-y border-[#0E1D2F] relative overflow-hidden">
            {/* Detalhe de iluminação sutil de fundo */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C9A15A]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E1D2F] border border-[#C9A15A]/40 text-[#C9A15A] text-xs sm:text-sm font-semibold mb-4 shadow-sm">
                  <Instagram className="h-4 w-4 text-[#C9A15A]" />
                  <span>Conteúdo Exclusivo</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Acompanhe no Instagram
                </h2>
                <p className="text-slate-300 text-base sm:text-lg">
                  Fique por dentro de insights diários, bastidores e transformações de alto impacto.
                </p>
              </div>

              {/* Grade de cards de posts: desktop 3 por linha, mobile 2 por linha */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-12">
                {instagramPosts.map((post) => {
                  const imageUrl = getInstagramPostImageUrl(post)
                  return (
                    <a
                      key={post.id}
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={post.caption || 'Ver post no Instagram'}
                      className="group flex flex-col rounded-2xl bg-[#0E1D2F] border-2 border-[#0E1D2F] hover:border-[#C9A15A] transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                      {/* Container da imagem */}
                      <div className="relative aspect-square w-full overflow-hidden bg-[#0A1523]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={post.caption || 'Post do Instagram'}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-500">
                            <Instagram className="h-10 w-10 text-[#C9A15A]/50" />
                          </div>
                        )}

                        {/* Overlay hover */}
                        <div className="absolute inset-0 bg-[#0E1D2F]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 text-white">
                          <Instagram className="h-6 w-6 text-[#C9A15A]" />
                          <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1">
                            Ver no Instagram <ExternalLink className="h-3.5 w-3.5 text-[#C9A15A]" />
                          </span>
                        </div>

                        {/* Badge de Instagram no canto superior direito */}
                        <div className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0E1D2F]/80 backdrop-blur-sm border border-[#C9A15A]/40 flex items-center justify-center text-[#C9A15A] shadow-md group-hover:bg-[#C9A15A] group-hover:text-[#0E1D2F] transition-colors">
                          <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                      </div>

                      {/* Legenda curta com detalhes dourados */}
                      {post.caption && (
                        <div className="p-3 sm:p-4 bg-[#0E1D2F] flex-1 flex flex-col justify-between border-t border-[#1F3552]">
                          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                            {post.caption}
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-[#1F3552]/80 flex items-center justify-between text-[11px] sm:text-xs text-[#C9A15A]">
                            <span className="font-medium">Abrir publicação</span>
                            <ExternalLink className="h-3 w-3 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      )}
                    </a>
                  )
                })}
              </div>

              {/* Botão Seguir no Instagram */}
              <div className="text-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-[#C9A15A] hover:bg-[#b89047] text-[#0E1D2F] font-bold rounded-full px-8 py-6 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 border-none"
                >
                  <a href={instagramProfileUrl} target="_blank" rel="noopener noreferrer">
                    <Instagram className="mr-2 h-5 w-5 text-[#0E1D2F]" />
                    Seguir no Instagram
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </ScrollFadeIn>
      )}

      <ScrollFadeIn>
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 royal-cta-gradient" />
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para transformar sua realidade?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Fale conosco e descubra como a mentoria pode acelerar seus resultados.
            </p>
            {whatsappLink ? (
              <Button
                size="lg"
                asChild
                className="bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-full px-10 py-6 text-lg font-medium shadow-lg transition-all hover:scale-105 border-none"
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {buttonText}
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                disabled
                className="rounded-full px-10 py-6 text-lg font-medium shadow-lg border-none"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {buttonText}
              </Button>
            )}
          </div>
        </section>
      </ScrollFadeIn>
    </LandingLayout>
  )
}
