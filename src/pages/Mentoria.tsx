import { useState, useEffect } from 'react'
import { getPlatformSettingsPublic } from '@/services/landing'
import { useRealtime } from '@/hooks/use-realtime'
import type { PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { ScrollFadeIn } from '@/components/ScrollFadeIn'
import { Loader2, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlatformSettingsPublic()
      .then((data) => setSettings(data as PlatformSettings | null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useRealtime('platform_settings', () => {
    getPlatformSettingsPublic()
      .then((data) => setSettings(data as PlatformSettings | null))
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
