import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getEvents,
  getPublicCourses,
  submitContact,
  getPlatformSettingsPublic,
  getHomeHeroImageUrl,
  getAboutImageUrl,
  getAgendaImageUrl,
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
  ExternalLink,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Phone,
  Mail,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TestimonialsSection } from '@/components/TestimonialsSection'

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Sobre', href: '#about' },
  { name: 'Agenda', href: '#agenda' },
  { name: 'Cursos Online', href: '#courses' },
  { name: 'Fale Conosco', href: '#contact' },
]

const DEFAULT_ABOUT_ITEMS = [
  'Mentoria ao vivo e orientações direto com especialistas',
  'A única instituição com estrutura para estágio virtual',
  'Certificações reconhecidas para atuação profissional',
]

const formatStatValue = (num: number) => {
  if (num >= 1000) return `+${Math.floor(num / 1000)}k`
  return `+${num}`
}

export default function Landing() {
  const { isAuthenticated, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const [events, setEvents] = useState<Event[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await submitContact(formData)
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.')
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setIsMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const heroImageUrl =
    (settings?.home_hero_image && getHomeHeroImageUrl(settings)) ||
    'https://img.usecurling.com/p/800/800?q=confident%20professional%20speaker&dpr=2'

  const aboutImageUrl =
    (settings?.about_image && getAboutImageUrl(settings)) ||
    'https://img.usecurling.com/p/600/700?q=modern%20therapy%20office&color=gray'

  const agendaImageUrl = (settings?.agenda_image && getAgendaImageUrl(settings)) || null

  const stats = [
    { value: formatStatValue(settings?.stats_students || 5000), label: 'Alunos Formados' },
    { value: formatStatValue(settings?.stats_years || 10), label: 'Anos de História' },
    { value: formatStatValue(settings?.stats_courses || 7), label: 'Cursos' },
    { value: formatStatValue(settings?.stats_countries || 7), label: 'Países Alcançados' },
  ]

  const showTestimonials = settings?.testimonials_active !== false

  const contactPhone = settings?.contact_phone || '+55 (11) 99999-9999'
  const contactEmail = settings?.support_email || 'contato@andersonabreu.com.br'
  const contactWhatsapp = settings?.whatsapp_number || contactPhone

  const socialLinks = [
    { url: settings?.instagram_handle || '', icon: Instagram, label: 'Instagram' },
    { url: settings?.facebook_url || '', icon: Facebook, label: 'Facebook' },
    { url: settings?.linkedin_url || '', icon: Linkedin, label: 'LinkedIn' },
    { url: settings?.youtube_url || '', icon: Youtube, label: 'YouTube' },
  ].filter((s) => s.url.trim() !== '')

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-accent selection:text-white">
      {/* Header */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
          isScrolled
            ? 'bg-gradient-to-r from-[#0047AB]/95 to-black/95 backdrop-blur-md border-white/10 py-3'
            : 'bg-transparent border-transparent py-5',
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link
            to="/"
            onClick={(e) => scrollToSection(e, '#home')}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 bg-gradient-to-br from-accent to-accent/70 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white leading-none">AA</span>
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block text-white">
              Anderson Abreu
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-sm font-medium text-white/80 hover:text-accent transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button
              asChild
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-black rounded-full transition-colors"
            >
              <Link to="/login">Área do Aluno</Link>
            </Button>
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-gradient-to-r from-[#0047AB]/95 to-black/95 backdrop-blur-xl transition-transform duration-300 md:hidden flex flex-col pt-24 px-6',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <nav className="flex flex-col gap-6 text-xl font-medium">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className="text-white hover:text-accent transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="h-px bg-white/10 w-full my-4" />
          <Button asChild className="w-full bg-accent text-black hover:bg-accent/90 h-12 text-lg">
            <Link to="/login">Área do Aluno</Link>
          </Button>
        </nav>
      </div>

      {/* Hero */}
      <section
        id="home"
        className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-r from-[#0047AB] via-[#003a6e] to-black"
      >
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-[#0047AB]/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-accent/30 text-accent text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Inscrições abertas para a nova turma
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight text-white">
                {settings?.hero_title || 'Transforme sua mente.'}
                <br />
                <span className="text-accent">Alcance alta performance.</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-xl">
                {settings?.hero_subtitle ||
                  'Hipnose clínica, inteligência emocional e mentoria de alta performance para quem deseja romper limites, superar bloqueios e alcançar resultados extraordinários na vida pessoal e profissional.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-accent text-black hover:bg-accent/90 font-bold px-8"
                  asChild
                >
                  <a href="#courses" onClick={(e) => scrollToSection(e, '#courses')}>
                    {settings?.hero_cta_text || 'Conheça nossos cursos'}{' '}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  asChild
                >
                  <a href="#about" onClick={(e) => scrollToSection(e, '#about')}>
                    Nossa metodologia
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-8 border-t border-white/10">
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

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0047AB]/30 to-transparent rounded-3xl transform rotate-3 scale-105" />
              <img
                src={heroImageUrl}
                alt="Anderson Abreu Mentoria"
                className="relative rounded-3xl object-cover shadow-2xl grayscale border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Transition strip */}
      <div className="h-24 bg-gradient-to-b from-black via-[#0047AB]/10 to-white" />

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
                  Sede presencial em Tucuruvi, São Paulo. Uma estrutura completa para seu
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
                <div className="space-y-6 text-slate-600 text-lg">
                  <p>
                    Fundado pelo especialista Anderson Abreu, o instituto tem a missão de formar
                    profissionais e indivíduos capacitados com o melhor ensino e prática da
                    hipnoterapia e desenvolvimento humano.
                  </p>
                  <p>
                    Nossa metodologia desenvolve o processo de aprendizado de uma maneira fácil e
                    direta, com laboratório de práticas ao vivo e acompanhamento próximo. Somos
                    pioneiros em utilizar tecnologia imersiva nos treinamentos para garantir que
                    você absorva 100% do conteúdo.
                  </p>
                  <ul className="space-y-3 mt-8">
                    {DEFAULT_ABOUT_ITEMS.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-800 font-medium">
                        <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showTestimonials && <TestimonialsSection />}

      {/* Agenda */}
      <section
        id="agenda"
        className="py-24 bg-slate-50 relative overflow-hidden"
        style={
          agendaImageUrl
            ? {
                backgroundImage: `url(${agendaImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {agendaImageUrl && <div className="absolute inset-0 bg-white/85" />}
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-wider uppercase text-accent mb-3">
              Eventos e Turmas
            </h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-6">
              {settings?.agenda_highlight_title || 'Agenda de Treinamentos'}
            </h3>
            <p className="text-slate-600 text-lg">
              {settings?.agenda_intro ||
                'Participe de nossos eventos presenciais e online. Garanta sua vaga com antecedência.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 group"
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
                      <div className="text-xs text-slate-400 uppercase tracking-wider">
                        {new Date(event.date).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h4>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2">{event.description}</p>

                  <div className="flex items-center gap-4 text-sm text-slate-700 mb-6">
                    <div className="flex items-center gap-1.5">
                      {event.type === 'presencial' ? (
                        <MapPin className="h-4 w-4 text-accent" />
                      ) : (
                        <Video className="h-4 w-4 text-accent" />
                      )}
                      <span className="capitalize">{event.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-400">•</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-accent text-black hover:bg-accent/90 transition-colors"
                    asChild
                  >
                    <a href="#contact">Garantir Vaga</a>
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

      {/* Courses */}
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.length > 0 ? (
              courses.map((course) => (
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
                    {course.discount_price &&
                      course.price &&
                      course.discount_price < course.price && (
                        <div className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          Oferta Especial
                        </div>
                      )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                      {course.title}
                    </h4>
                    <p className="text-slate-600 text-sm mb-6 flex-1">
                      {course.short_description ||
                        course.description ||
                        'Aprenda os conceitos fundamentais com especialistas.'}
                    </p>

                    <div className="flex items-end justify-between mb-6">
                      <div>
                        {course.discount_price ? (
                          <>
                            <div className="text-sm text-slate-400 line-through">
                              R$ {course.price?.toFixed(2)}
                            </div>
                            <div className="text-2xl font-bold text-accent">
                              R$ {course.discount_price?.toFixed(2)}
                            </div>
                          </>
                        ) : (
                          <div className="text-2xl font-bold text-accent">
                            R$ {course.price?.toFixed(2) || 'Consulte'}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-accent hover:bg-accent/90 text-black transition-colors"
                      asChild
                    >
                      {course.external_buy_url ? (
                        <a href={course.external_buy_url} target="_blank" rel="noopener noreferrer">
                          Comprar <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      ) : (
                        <Link to="/login">Tenho Interesse</Link>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500">
                Nenhum curso disponível no momento.
              </div>
            )}
          </div>
        </div>
      </section>

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
                  'Estamos prontos para tirar suas dúvidas e orientar você na melhor escolha para sua carreira e desenvolvimento pessoal.'}
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">WhatsApp / Telefone</div>
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

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Endereço</div>
                    <div className="text-lg font-medium text-slate-900">
                      Av. Tucuruvi, 123 - São Paulo, SP
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="h-10 w-10 rounded-full bg-accent/10 hover:bg-accent hover:text-white flex items-center justify-center transition-colors text-accent"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
              <h4 className="text-2xl font-bold text-slate-900 mb-6">Envie sua mensagem</h4>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Seu nome completo"
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-12"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Seu e-mail"
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-12"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="Telefone / WhatsApp"
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-12"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Como podemos ajudar?"
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 min-h-[120px]"
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    required
                  />
                </div>
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

      {/* Footer */}
      <footer className="py-8 bg-gradient-to-r from-[#0047AB] to-black text-center">
        <div className="container mx-auto px-6">
          <p className="text-white/80 text-sm">
            © {new Date().getFullYear()} Anderson Abreu. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
