import type { PlatformSettings } from '@/types'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { getBlueBandImageUrl } from '@/services/landing'

interface GlobalBlueBandProps {
  settings?: PlatformSettings | null
  className?: string
}

export function GlobalBlueBand({ settings, className = '' }: GlobalBlueBandProps) {
  const title = settings?.global_blue_band_title?.trim() || 'O que é Hipnose?'
  const phrase = settings?.blue_band_phrase?.trim()
  const customText = settings?.global_blue_band_text?.trim()
  const whatsappEnabled = settings?.blue_band_whatsapp_enabled
  const whatsappText = settings?.blue_band_whatsapp_text?.trim() || 'Fale Conosco'
  const whatsappNumber = (settings?.whatsapp_number || '').replace(/\D/g, '')
  const bgImageUrl = settings ? getBlueBandImageUrl(settings) : null

  const proseClass =
    'prose prose-invert max-w-none text-white text-base md:text-lg leading-[1.6] space-y-4 [&_p]:!text-white [&_p]:!leading-[1.6] [&_li]:!text-white [&_li]:!leading-[1.6] [&_strong]:!text-white [&_strong]:!font-bold [&_b]:!text-white [&_b]:!font-bold [&_font]:!text-white'

  const sectionStyle = bgImageUrl
    ? {
        backgroundImage: `url(${bgImageUrl})`,
        backgroundAttachment: 'fixed' as const,
        backgroundPosition: 'center' as const,
        backgroundRepeat: 'no-repeat' as const,
        backgroundSize: 'cover' as const,
        minHeight: '320px',
      }
    : undefined

  return (
    <section
      className={`relative w-full overflow-hidden bg-[#0A0D14] text-white py-8 md:py-10 ${className}`}
      style={sectionStyle}
    >
      {bgImageUrl && <div className="absolute inset-0 bg-[#0A0D14]/70" />}
      <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">{title}</h2>

        {phrase ? (
          <div className={proseClass} dangerouslySetInnerHTML={{ __html: phrase }} />
        ) : customText ? (
          <div className={proseClass} dangerouslySetInnerHTML={{ __html: customText }} />
        ) : null}

        {whatsappEnabled && whatsappNumber && (
          <div className="mt-8">
            <Button
              size="lg"
              className="bg-[#25D366] hover:bg-[#1eb558] text-white rounded-full px-8 py-6 text-lg font-medium shadow-lg transition-all hover:scale-105 border-none"
              asChild
            >
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                {whatsappText}
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
