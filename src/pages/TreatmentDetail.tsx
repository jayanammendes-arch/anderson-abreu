import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTreatmentBySlug, getTreatmentImageUrl } from '@/services/treatments'
import { getPlatformSettingsPublic } from '@/services/landing'
import type { Treatment, PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react'

export default function TreatmentDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [treatment, setTreatment] = useState<Treatment | null>(null)
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      getTreatmentBySlug(slug).catch(() => null),
      getPlatformSettingsPublic().catch(() => null),
    ]).then(([data, settingsData]) => {
      setTreatment(data as Treatment | null)
      setSettings(settingsData as PlatformSettings | null)
      setLoading(false)
    })
  }, [slug])

  const agendarText = settings?.agendar_sessao_text || 'Agendar Sessão'
  const imageUrl = treatment ? getTreatmentImageUrl(treatment) : null

  if (loading) {
    return (
      <LandingLayout settings={settings}>
        <div className="flex h-screen items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LandingLayout>
    )
  }

  if (!treatment) {
    return (
      <LandingLayout settings={settings}>
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 px-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Tratamento não encontrado</h1>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o início
            </Link>
          </Button>
        </div>
      </LandingLayout>
    )
  }

  return (
    <LandingLayout settings={settings}>
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-8 text-slate-500 hover:text-slate-900"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          {imageUrl && (
            <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-10 bg-slate-100">
              <img src={imageUrl} alt={treatment.name} className="h-full w-full object-cover" />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{treatment.name}</h1>
          {treatment.short_description && (
            <p className="text-xl text-slate-500 mb-8 leading-relaxed">
              {treatment.short_description}
            </p>
          )}

          <div
            className="prose prose-lg max-w-none text-slate-700
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-4
              [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-3
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
              [&_li]:mb-2"
            dangerouslySetInnerHTML={{ __html: treatment.detailed_content }}
          />

          <div className="mt-12 border-t border-slate-200 pt-8">
            <div className="bg-slate-50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Interessado neste tratamento?
              </h3>
              <p className="text-slate-500 mb-6">
                Agende uma sessão e inicie seu processo de transformação.
              </p>
              <Button
                size="lg"
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8"
                onClick={() => navigate('/agendar')}
              >
                <Calendar className="mr-2 h-5 w-5" />
                {agendarText}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}
