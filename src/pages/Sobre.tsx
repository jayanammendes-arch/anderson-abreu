import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getPlatformSettingsPublic,
  getAboutPageImageUrl,
  getAboutImageUrl,
} from '@/services/landing'
import { useRealtime } from '@/hooks/use-realtime'
import type { PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowRight, Loader2, Award, BookOpen, Users } from 'lucide-react'

export default function Sobre() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const data = await getPlatformSettingsPublic().catch(() => null)
    setSettings(data as PlatformSettings | null)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('platform_settings', () => loadData())

  const aboutImage = settings?.about_page_image
    ? getAboutPageImageUrl(settings)
    : settings?.about_image
      ? getAboutImageUrl(settings)
      : 'https://img.usecurling.com/p/600/800?q=hypnotherapist%20portrait&color=gray'

  const agendarText = settings?.agendar_sessao_text || 'Agendar Sessão'
  const stats = [
    { value: `+${settings?.stats_students || 5000}`, label: 'Alunos Formados', icon: Users },
    { value: `+${settings?.stats_years || 10}`, label: 'Anos de Experiência', icon: Award },
    { value: `+${settings?.stats_courses || 7}`, label: 'Cursos', icon: BookOpen },
  ]

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
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-sm font-semibold tracking-wider uppercase text-primary mb-4 block">
                Sobre
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                {settings?.about_title || 'Anderson Abreu'}
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                {settings?.about_intro ||
                  'Especialista em hipnose clínica e desenvolvimento humano, com mais de uma década transformando vidas.'}
              </p>
              {settings?.about_full_bio ? (
                <div
                  className="prose prose-lg max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: settings.about_full_bio }}
                />
              ) : settings?.about_content ? (
                <div
                  className="prose prose-lg max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: settings.about_content }}
                />
              ) : (
                <p className="text-lg text-slate-600 leading-relaxed">
                  Fundado pelo especialista Anderson Abreu, o instituto tem a missão de formar
                  profissionais capacitados com o melhor ensino da hipnoterapia e desenvolvimento
                  humano. Nossa metodologia combina laboratório de práticas ao vivo e tecnologia
                  imersiva para garantir absorção completa do conteúdo.
                </p>
              )}
              {settings?.about_credentials && (
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Credenciais</p>
                  <p className="text-sm text-slate-500">{settings.about_credentials}</p>
                </div>
              )}
              <Button
                size="lg"
                className="mt-8 bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8"
                onClick={() => navigate('/agendar')}
              >
                <Calendar className="mr-2 h-5 w-5" />
                {agendarText}
              </Button>
            </div>
            <div className="sticky top-24">
              <img
                src={aboutImage}
                alt="Anderson Abreu"
                className="rounded-2xl shadow-xl object-cover w-full h-[600px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className="text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}
