import { getCredentialsImageUrl } from '@/services/landing'
import type { PlatformSettings } from '@/types'

const PLACEHOLDER_IMAGE =
  'https://img.usecurling.com/p/1200/200?q=professional%20certifications%20logos'

export function CredentialsMarquee({ settings }: { settings: PlatformSettings | null }) {
  const credentialsUrl = settings ? getCredentialsImageUrl(settings) : null
  const imageUrl = credentialsUrl || PLACEHOLDER_IMAGE

  return (
    <section className="credentials-marquee-section w-full overflow-hidden bg-white border-y border-slate-100">
      <div className="credentials-marquee">
        <img
          src={imageUrl}
          alt="Credenciais e formações profissionais"
          className="credentials-marquee-item"
          draggable={false}
        />
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="credentials-marquee-item"
          draggable={false}
        />
      </div>
    </section>
  )
}
