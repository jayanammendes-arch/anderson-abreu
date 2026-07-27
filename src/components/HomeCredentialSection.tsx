import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { getHomeCredentialImageUrl } from '@/services/landing'
import type { PlatformSettings } from '@/types'

interface HomeCredentialSectionProps {
  settings: PlatformSettings | null
}

export function HomeCredentialSection({ settings }: HomeCredentialSectionProps) {
  const name = settings?.home_credential_name || 'Anderson Abreu'
  const subtitle = settings?.home_credential_subtitle || 'Hipnoterapeuta e Professor de Hipnose'
  const ctaText = settings?.home_credential_cta_text || 'Saiba mais'

  let credentials: string[] = []
  if (settings?.home_credential_list) {
    try {
      const parsed =
        typeof settings.home_credential_list === 'string'
          ? JSON.parse(settings.home_credential_list)
          : settings.home_credential_list
      if (Array.isArray(parsed)) {
        credentials = parsed.filter((item: unknown) => typeof item === 'string' && item.trim())
      }
    } catch {
      credentials = []
    }
  }

  const imageUrl = settings ? getHomeCredentialImageUrl(settings) : null

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
              {name}
            </h2>
            {subtitle && (
              <p className="text-lg md:text-xl text-primary font-medium mb-8">{subtitle}</p>
            )}
            {credentials.length > 0 && (
              <ul className="space-y-3 mb-8">
                {credentials.map((cred, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
                      <Check className="h-4 w-4 text-blue-600" strokeWidth={3} />
                    </span>
                    <span className="text-base md:text-lg text-slate-700 leading-relaxed">
                      {cred}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 bg-[#22C55E] hover:bg-[#20a854] text-white border-none"
            >
              <Link to="/sobre">{ctaText}</Link>
            </Button>
          </div>

          <div className="order-1 md:order-2 relative">
            <div className="relative h-[400px] md:h-[680px] w-full rounded-2xl overflow-hidden shadow-xl bg-slate-100">
              {imageUrl ? (
                <img src={imageUrl} alt={name} className="w-full h-full object-cover object-top" />
              ) : (
                <img
                  src="https://img.usecurling.com/p/600/700?q=professional%20therapist&color=gray"
                  alt={name}
                  className="w-full h-full object-cover object-top"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
