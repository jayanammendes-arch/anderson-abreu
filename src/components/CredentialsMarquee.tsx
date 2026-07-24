import { useState, useEffect } from 'react'
import { getCertificationLogos, getCertificationLogoUrl } from '@/services/certification-logos'
import { useRealtime } from '@/hooks/use-realtime'
import type { CertificationLogo } from '@/types'

export function CredentialsMarquee() {
  const [logos, setLogos] = useState<CertificationLogo[]>([])

  const loadData = async () => {
    try {
      const data = await getCertificationLogos()
      setLogos(data as CertificationLogo[])
    } catch {
      setLogos([])
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('certification_logos', () => {
    loadData()
  })

  if (logos.length === 0) return null

  const logoUrls = logos
    .map((logo) => getCertificationLogoUrl(logo))
    .filter((url): url is string => url !== null)

  const minItems = 10
  const minSets = Math.max(1, Math.ceil(minItems / logoUrls.length))
  const baseSet = Array(minSets).fill(logoUrls).flat()
  const doubledUrls = [...baseSet, ...baseSet]

  return (
    <section
      className="credentials-marquee-section w-full overflow-hidden"
      style={{ backgroundColor: '#0a192f' }}
    >
      <div className="credentials-marquee">
        {doubledUrls.map((url, i) => (
          <img
            key={i}
            src={url}
            alt="Credenciais e formações profissionais"
            className="credentials-marquee-item"
            draggable={false}
          />
        ))}
      </div>
    </section>
  )
}
