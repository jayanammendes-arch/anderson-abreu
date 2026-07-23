import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getEvents,
  getPublicCourses,
  submitContact,
  getPlatformSettingsPublic,
  getHomeHeroImageUrl,
  getAboutImageUrl,
} from '@/services/landing'
import { getThumbnailUrl } from '@/services/courses'
import type { Event, Course, PlatformSettings } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Calendar,
  MapPin,
  Video,
  ArrowRight,
  Phone,
  Mail,
  Brain,
  Heart,
  Target,
  GraduationCap,
  Sparkles,
  Zap,
  Shield,
  Leaf,
  type LucideIcon,
} from 'lucide-react'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { LandingLayout } from '@/components/LandingLayout'

interface ServiceItem {
  title: string
  description: string
  icon: string
}

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  heart: Heart,
  target: Target,
  'graduation-cap': GraduationCap,
  sparkles: Sparkles,
  zap: Zap,
  shield: Shield,
  leaf: Leaf,
}

function scrollToSection(href: string) {
  const el = document.querySelector(href)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

const formatStatValue = (num: number) => (num >= 1000 ? `+${Math.floor(num / 1000)}k` : `+${num}`)

export default function Landing() {
  const [events, setEvents] = useState<Event[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    const [eventsData, coursesData, settingsData] = await Promise.all([
      getEvents().catch(() => []),
      getPublicCourses().catch(() => []),
      getPlatformSettingsPublic().catch(() => null),
    ])
    setEvents(eventsData as Event[])
    setCourses(coursesData as Course[])
    setSettings(settingsData as PlatformSettings | null)
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('platform_settings', () => {
    loadData()
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await submitContact(formData)
      toast.success('Mensagem enviada com sucesso! Entraremos em contato.')
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch {
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const heroImageUrl = (settings?.home_hero_image && getHomeHeroImageUrl(settings)) || null
  const aboutImageUrl =
    (settings?.about_image && getAboutImageUrl(settings)) ||
    'https://img.usecurling.com/p/600/700?q=modern%20therapy%20office&color=gray'

  const servicesItems: ServiceItem[] = (() => {
    const raw = (settings as any)?.services_items
    if (Array.isArray(raw)) return raw
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw)
      } catch {
        return []
      }
    }
    return [
      {
        title: 'Hipnose Clínica',
        description: 'Tratamento de fobias, ansiedade, traumas e bloqueios emocionais.',
        icon: 'brain',
      },
      {
        title: 'Inteligência Emocional',
        description: 'Desenvolvimento de autoconhecimento e gestão emocional.',
        icon: 'heart',
      },
      {
        title: 'Mentoria de Performance',
        description: 'Acompanhamento personalizado para resultados extraordinários.',
        icon: 'target',
      },
      {
        title: 'Formação Profissional',
        description: 'Cursos com certificação reconhecida em hipnoterapia.',
        icon: 'graduation-cap',
      },
    ]
  })()

  const stats = [
    {
      value: formatStatValue(settings?.stats_students || 5000),
      label: 'Alunos Formados',
    },
    {
      value: formatStatValue(settings?.stats_years || 10),
      label: 'Anos de História',
    },
    { value: formatStatValue(settings?.stats_courses || 7), label: 'Cursos' },
    {
      value: formatStatValue(settings?.stats_countries || 7),
      label: 'Países',
    },
  ]

  const showTestimonials = settings?.testimonials_active !== false
  const contactWhatsapp =
    settings?.whatsapp_number || settings?.contact_phone || '+55 (11) 99999-9999'
  const contactEmail = settings?.support_email || 'contato@andersonabreu.com.br'

  return (
    <LandingLayout settings={settings}>
      {/* Hero */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {heroImageUrl ? (
          <>
            <img
              src={heroImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0047AB] via-[#003a6e] to-black" />
        )}
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 container mx-auto px-6 text-center pt-20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight text-white max-w-4xl mx-auto">
            {settings?.hero_title || 'Hipnoterapia que transforma vidas'}
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-2xl mx-auto">
            {settings?.hero_subtitle ||
              'Hipnose clínica, inteligência emocional e mentoria de alta performance para quem deseja romper limites e alcançar resultados extraordinários.'}
          </p>
          <Button
            size="lg"
            className="bg-accent text-black hover:bg-accent/90 font-bold px-10"
            asChild
          >
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#contact')
              }}
            >
              {settings?.hero_cta_text || 'Agende sua sessão'}
            </a>
          </Button>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 pt-8 border-t border-white/10 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src={aboutImageUrl}
                alt="Instituto Anderson Abreu"
                className="rounded-2xl shadow-xl object-cover w-full h-[500px]"
              />
              <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-[#0047AB] to-[#003380] text-white p-8 rounded-2xl shadow-2xl max-w-xs hidden sm:block">
                <h4 className="font-bold text-xl mb-2 text-accent">Localização</h4>
                <p className="text-white/80">
                  Sede presencial em Tucuruvi, São Paulo. Estrutura completa para seu
                  desenvolvimento.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase text-accent mb-3">
                Nossa Metodologia
              </h2>
              <h3 className="text-4xl font-bold mb-6 text-slate-900 leading-tight">
                {settings?.about_title || 'Muito além da teoria. Uma imersão na prática.'}
              </h3>
              {settings?.about_content ? (
                <div
                  className="prose prose-lg max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: settings.about_content }}
                />
              ) : (
                <div className="space-y-4 text-slate-600 text-lg">
                  <p>
                    Fundado pelo especialista Anderson Abreu, o instituto tem a missão de formar
                    profissionais capacitados com o melhor ensino da hipnoterapia e desenvolvimento
                    humano.
                  </p>
                  <p>
                    Nossa metodologia combina laboratório de práticas ao vivo e tecnologia imersiva
                    para garantir absorção completa do conteúdo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-wider uppercase text-accent mb-3">
              Serviços
            </h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-6">
              {settings?.services_title || 'Soluções em Hipnoterapia'}
            </h3>
            <p className="text-slate-600 text-lg">
              {settings?.services_subtitle ||
                'Transforme sua vida com nossos serviços especializados'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicesItems.map((item, i) => {
              const Icon = iconMap[item.icon] || Sparkles
              return (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 group"
                >
                  <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                    <Icon className="h-7 w-7 text-accent" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-wider uppercase text-accent mb-3">
              Ensino a Distância
            </h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-6">
              {settings?.courses_title || 'Cursos Online'}
            </h3>
            <p className="text-slate-600 text-lg">
              {settings?.courses_intro ||
                'Aprenda no seu ritmo, com metodologia comprovada e acesso imediato.'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 flex flex-col"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-200">
                  <img
                    src={getThumbnailUrl(course)}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                    {course.title}
                  </h4>
                  <p className="text-slate-600 text-sm mb-4 flex-1">
                    {course.short_description || course.description}
                  </p>
                  {course.access_type === 'free' ? (
                    <div className="text-2xl font-bold text-accent">Gratuito</div>
                  ) : course.price ? (
                    <div className="text-2xl font-bold text-accent">
                      R$ {(course.discount_price || course.price).toFixed(2)}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button
              size="lg"
              className="bg-accent text-black hover:bg-accent/90 font-bold px-10"
              asChild
            >
              <Link to="/cursos">
                {settings?.courses_section_button || 'Ver Cursos'}{' '}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Agenda */}
      <section id="agenda" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-wider uppercase text-accent mb-3">
              Eventos e Turmas
            </h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-6">
              {settings?.agenda_highlight_title || 'Agenda de Treinamentos'}
            </h3>
            <p className="text-slate-600 text-lg">
              {settings?.agenda_intro || 'Participe de nossos eventos presenciais e online.'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm text-accent font-medium">
                        {new Date(event.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(event.date).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h4>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-700 mb-4">
                    <div className="flex items-center gap-1.5">
                      {event.type === 'presencial' ? (
                        <MapPin className="h-4 w-4 text-accent" />
                      ) : (
                        <Video className="h-4 w-4 text-accent" />
                      )}
                      <span className="capitalize">{event.type}</span>
                    </div>
                    <span className="truncate">{event.location}</span>
                  </div>
                  <Button className="w-full bg-accent text-black hover:bg-accent/90" asChild>
                    <a
                      href="#contact"
                      onClick={(e) => {
                        e.preventDefault()
                        scrollToSection('#contact')
                      }}
                    >
                      Garantir Vaga
                    </a>
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500">
                Nenhum evento agendado no momento.
              </div>
            )}
          </div>
        </div>
      </section>

      {showTestimonials && <TestimonialsSection />}

      {/* Contact */}
      <section id="contact" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase text-accent mb-3">
                Fale Conosco
              </h2>
              <h3 className="text-4xl font-bold text-slate-900 mb-6">
                {settings?.contact_title || 'Dê o primeiro passo.'}
              </h3>
              <p className="text-slate-600 text-lg mb-10">
                {settings?.contact_intro ||
                  'Estamos prontos para tirar suas dúvidas e orientar você.'}
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">WhatsApp</div>
                    <div className="text-lg font-medium text-slate-900">{contactWhatsapp}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">E-mail</div>
                    <div className="text-lg font-medium text-slate-900">{contactEmail}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
              <h4 className="text-2xl font-bold text-slate-900 mb-6">Envie sua mensagem</h4>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <Input
                  placeholder="Seu nome completo"
                  className="bg-slate-50 border-slate-200 h-12"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Seu e-mail"
                    className="bg-slate-50 border-slate-200 h-12"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="Telefone / WhatsApp"
                    className="bg-slate-50 border-slate-200 h-12"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <Textarea
                  placeholder="Como podemos ajudar?"
                  className="bg-slate-50 border-slate-200 min-h-[120px]"
                  value={formData.message}
                  onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent text-black hover:bg-accent/90 h-12 font-bold text-lg"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}
