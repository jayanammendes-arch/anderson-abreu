import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getTreatmentCategoryBySlug,
  getTreatmentCategories,
  getTreatmentCategoryImageUrl,
} from '@/services/treatment-categories'
import { getPlatformSettingsPublic, getAboutPageImageUrl } from '@/services/landing'
import type { TreatmentCategory, PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { ComparisonTable } from '@/components/treatment/ComparisonTable'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { Loader2, ArrowLeft } from 'lucide-react'

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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Tratamento não encontrado</h1>
          <Button asChild>
            <Link to="/#tratamentos">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para tratamentos
            </Link>
          </Button>
        </div>
      </LandingLayout>
    )
  }

  const imageUrl = getTreatmentCategoryImageUrl(category)
  const Icon = getTreatmentIcon(category.icon)
  const otherCategories = allCategories.filter((c) => c.slug !== slug)
  const aboutImage = settings?.about_page_image ? getAboutPageImageUrl(settings) : null
  const agendarText = settings?.agendar_sessao_text || 'Agendar Sessão'
  const stats = [
    { value: `${settings?.stats_students || 500}+`, label: 'Pacientes' },
    { value: `${settings?.stats_years || 10}+`, label: 'Anos' },
    { value: `${settings?.stats_courses || 20}+`, label: 'Cursos' },
    { value: `${settings?.stats_countries || 5}+`, label: 'Países' },
  ]

  return (
    <LandingLayout settings={settings}>
      <section className="relative min-h-[60vh] flex items-center overflow-hidden pt-20">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-2xl">
            <Icon className="h-12 w-12 text-white/80 mb-6" strokeWidth={1.5} />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{category.name}</h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">{category.short_description}</p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-white/90 rounded-full px-8"
                onClick={() => navigate('/agendar')}
              >
                {agendarText}
              </Button>
              <a href="#o-que-e">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  Saiba Mais
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="o-que-e" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">O que é {category.name}</h2>
          <div
            className="prose prose-lg max-w-none text-slate-600 [&_h2]:text-slate-900 [&_h2]:font-bold"
            dangerouslySetInnerHTML={{ __html: category.detailed_content }}
          />
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Como a Hipnose Funciona</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-4">
            Através da hipnose clínica, acessamos o subconsciente para reprogramar padrões mentais
            que mantêm o problema. Em estado de relaxamento profundo, a mente se torna mais
            receptiva a sugestões positivas, permitindo mudanças duradouras no comportamento e nas
            emoções.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            O tratamento é personalizado e respeita o ritmo de cada paciente, garantindo segurança e
            eficácia em todo o processo terapêutico.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Resultados Comprovados</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            A hipnose clínica é reconhecida cientificamente como uma ferramenta terapêutica eficaz,
            com resultados significativos em poucas sessões e mudanças que se mantêm a longo prazo.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '90%', label: 'Taxa de sucesso' },
              { value: '2', label: 'Sessões em média' },
              { value: '10+', label: 'Anos de experiência' },
              { value: '500+', label: 'Pacientes atendidos' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-[#00A3C4] mb-1">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            {aboutImage ? (
              <img
                src={aboutImage}
                alt="Profissional"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
            ) : (
              <div className="rounded-2xl bg-slate-200 w-full h-[400px]" />
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {settings?.about_title || 'Sobre o Profissional'}
            </h2>
            {settings?.about_full_bio ? (
              <div
                className="prose prose-lg text-slate-600 mb-4 max-w-none"
                dangerouslySetInnerHTML={{ __html: settings.about_full_bio }}
              />
            ) : (
              <p className="text-lg text-slate-600 mb-4">
                Especialista em hipnose clínica com mais de uma década transformando vidas.
              </p>
            )}
            {settings?.about_credentials && (
              <p className="text-sm text-slate-500 mb-6">{settings.about_credentials}</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <div key={i}>
                  <span className="text-2xl font-bold text-[#00A3C4]">{s.value}</span>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {category.symptoms_list && (
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Sintomas Comuns</h2>
            <div
              className="prose prose-lg max-w-none text-slate-600 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2"
              dangerouslySetInnerHTML={{ __html: category.symptoms_list }}
            />
          </div>
        </section>
      )}

      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Outros Tratamentos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherCategories.map((cat) => {
              const CatIcon = getTreatmentIcon(cat.icon)
              return (
                <Link
                  key={cat.id}
                  to={`/tratamentos/${cat.slug}`}
                  className="group flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <CatIcon className="h-8 w-8 text-blue-500" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 text-center">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <TestimonialsSection customTitle={settings?.testimonials_section_title} />
      <ComparisonTable />

      <section className="py-24 bg-slate-900">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para começar?</h2>
          <p className="text-white/60 text-lg mb-10">
            Dê o primeiro passo rumo à transformação. Agende sua sessão de hipnose clínica.
          </p>
          <Button
            size="lg"
            className="bg-white text-slate-900 hover:bg-white/90 rounded-full px-10"
            onClick={() => navigate('/agendar')}
          >
            {agendarText}
          </Button>
        </div>
      </section>
    </LandingLayout>
  )
}
