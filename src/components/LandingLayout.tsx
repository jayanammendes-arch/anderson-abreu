import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, Calendar, ChevronDown, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlatformSettings, Treatment } from '@/types'
import {
  getLogoUrl,
  applyBrandColor,
  getPlatformSettingsPublic,
  shouldShowLogo,
} from '@/services/landing'
import { getAllTreatments } from '@/services/treatments'
import { TreatmentsDropdown } from '@/components/TreatmentsDropdown'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

const navLinks = [
  { name: 'Home', href: '/', type: 'route' as const },
  { name: 'Sobre', href: '/sobre', type: 'route' as const },
  { name: 'Tratamentos', href: '/#tratamentos', type: 'scroll' as const },
  { name: 'Hipnoterapia', href: '/agendar', type: 'route' as const },
  { name: 'Depoimentos', href: '/#depoimentos', type: 'scroll' as const },
  { name: 'Blog', href: '/blog', type: 'route' as const },
  { name: 'Cursos', href: '/cursos', type: 'route' as const },
]

function scrollToSection(href: string) {
  let elapsed = 0
  const interval = setInterval(() => {
    const el = document.querySelector(href)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
      clearInterval(interval)
    } else {
      elapsed += 100
      if (elapsed >= 5000) {
        clearInterval(interval)
      }
    }
  }, 100)
}

export function LandingLayout({
  settings,
  children,
  darkBg,
}: {
  settings: PlatformSettings | null
  children: ReactNode
  darkBg?: boolean
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileTreatmentsOpen, setMobileTreatmentsOpen] = useState(false)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [currentSettings, setCurrentSettings] = useState(settings)

  const isLanding = location.pathname === '/'
  const isCursosPage = location.pathname === '/cursos'
  const isAgendarPage = location.pathname === '/agendar'
  const isDarkPage = darkBg ?? isAgendarPage
  const areaAlunoHref = isAuthenticated ? '/dashboard' : '/login'

  useEffect(() => {
    getAllTreatments()
      .then(setTreatments)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setMobileTreatmentsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (settings?.primary_color) applyBrandColor(settings.primary_color)
  }, [settings?.primary_color])

  useEffect(() => {
    setCurrentSettings(settings)
  }, [settings])

  useRealtime('platform_settings', () => {
    getPlatformSettingsPublic()
      .then(setCurrentSettings)
      .catch(() => {})
  })

  useEffect(() => {
    if (isLanding && window.location.hash) {
      setTimeout(() => scrollToSection(window.location.hash), 100)
    }
  }, [isLanding])

  const handleNavClick = (link: (typeof navLinks)[0]) => {
    setIsMenuOpen(false)
    if (link.name === 'Tratamentos') {
      if (isLanding) {
        scrollToSection('#tratamentos')
      } else {
        navigate('/#tratamentos')
      }
      return
    }
    if (link.type === 'route') {
      navigate(link.href)
    } else if (link.type === 'scroll') {
      if (isLanding) {
        scrollToSection(link.href.replace('/', ''))
      } else {
        navigate(link.href)
      }
    }
  }

  const logoUrl =
    currentSettings && shouldShowLogo(currentSettings) ? getLogoUrl(currentSettings) : null
  const brandGradientImage =
    settings?.login_gradient ||
    (settings?.primary_color
      ? `linear-gradient(135deg, ${settings.primary_color}, ${isDarkPage ? '#C59A2A' : '#8B7420'})`
      : isDarkPage
        ? 'linear-gradient(135deg, #D4AF37, #C59A2A)'
        : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--royal-blue-hover)))')
  const agendarText = settings?.agendar_sessao_text || 'Agendar Sessão'
  const handleAreaAlunoClick = () => navigate(areaAlunoHref)

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col justify-between font-sans selection:bg-primary selection:text-primary-foreground transition-colors duration-300',
        isDarkPage ? 'royal-gradient-bg text-white' : 'bg-background text-foreground',
      )}
    >
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? isDarkPage
              ? 'bg-[#020412]/90 backdrop-blur-md shadow-sm border-b border-white/10 py-3'
              : 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border py-3'
            : isDarkPage
              ? 'bg-transparent py-5'
              : 'bg-background/80 backdrop-blur-sm py-5',
        )}
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-9 w-auto object-contain flex-shrink-0" />
            )}
            <span
              className="text-xl font-bold tracking-tight brand-gradient-text"
              style={{ backgroundImage: brandGradientImage }}
            >
              {settings?.company_name || 'Anderson Abreu'}
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.name === 'Tratamentos' ? (
                <TreatmentsDropdown key={link.name} isDark={isDarkPage}>
                  Tratamentos
                </TreatmentsDropdown>
              ) : (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className={cn(
                    'text-sm font-medium px-3 py-2 rounded-md transition-colors',
                    isDarkPage
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
                  )}
                >
                  {link.name}
                </button>
              ),
            )}
          </nav>
          <div className="hidden lg:flex items-center">
            {isCursosPage ? (
              <Button
                size="sm"
                className="royal-btn-gradient text-white rounded-full px-6 shadow-sm hover:opacity-90"
                onClick={handleAreaAlunoClick}
              >
                <GraduationCap className="mr-1.5 h-4 w-4" />
                Área do Aluno
              </Button>
            ) : (
              <Button
                size="sm"
                className="royal-btn-gradient text-white rounded-full px-6 shadow-sm"
                onClick={() => navigate('/agendar')}
              >
                <Calendar className="mr-1.5 h-4 w-4" />
                {agendarText}
              </Button>
            )}
          </div>
          <button
            className={cn('lg:hidden p-2', isDarkPage ? 'text-white' : 'text-foreground')}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-40 transition-transform duration-300 lg:hidden flex flex-col pt-24 px-6',
          isDarkPage ? 'bg-[#020412] text-white' : 'bg-background text-foreground',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <nav className="flex flex-col gap-2 text-lg font-medium">
          {navLinks.map((link) => {
            if (link.name === 'Tratamentos') {
              return (
                <div key={link.name}>
                  <button
                    onClick={() => setMobileTreatmentsOpen(!mobileTreatmentsOpen)}
                    className={cn(
                      'flex items-center justify-between w-full text-left py-3 border-b transition-colors',
                      isDarkPage
                        ? 'text-white/90 border-white/10 hover:text-white'
                        : 'text-muted-foreground border-border hover:text-foreground',
                    )}
                  >
                    Tratamentos
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 transition-transform duration-200',
                        mobileTreatmentsOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  {mobileTreatmentsOpen && (
                    <div className="flex flex-col gap-0 pl-4 pb-2 animate-fade-in">
                      {treatments.map((treatment) => (
                        <Link
                          key={treatment.id}
                          to={`/tratamentos/${treatment.slug}`}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            'text-base text-left py-2.5 border-b transition-colors',
                            isDarkPage
                              ? 'text-white/70 border-white/5 hover:text-white'
                              : 'text-muted-foreground border-border hover:text-foreground',
                          )}
                        >
                          {treatment.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            return (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className={cn(
                  'text-left py-3 border-b transition-colors',
                  isDarkPage
                    ? 'text-white/90 border-white/10 hover:text-white'
                    : 'text-muted-foreground border-border hover:text-foreground',
                )}
              >
                {link.name}
              </button>
            )
          })}
          {isCursosPage ? (
            <Button
              className="mt-6 royal-btn-gradient text-white hover:opacity-90 rounded-full h-12 text-base"
              onClick={() => {
                setIsMenuOpen(false)
                navigate(areaAlunoHref)
              }}
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Área do Aluno
            </Button>
          ) : (
            <Button
              className="mt-6 royal-btn-gradient text-white rounded-full h-12 text-base"
              onClick={() => {
                setIsMenuOpen(false)
                navigate('/agendar')
              }}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {agendarText}
            </Button>
          )}
        </nav>
      </div>

      <main className="flex-1 w-full">{children}</main>

      <footer
        className={cn(
          'text-white pt-16 pb-8 transition-colors duration-300 border-none',
          isDarkPage ? 'bg-transparent' : 'royal-footer-gradient',
        )}
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div className="max-w-sm">
              <span className="text-2xl font-bold text-white">
                {settings?.company_name || 'Anderson Abreu'}
              </span>
              <p className="text-white/60 text-sm leading-relaxed mt-3">
                {settings?.hero_subtitle ||
                  'Hipnoterapia clínica, inteligência emocional e mentoria de alta performance.'}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-semibold mb-2">Navegação</h4>
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className="text-white/60 hover:text-white text-sm text-left transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-semibold mb-2">Contato</h4>
              <a
                href={`mailto:${settings?.support_email || 'contato@andersonabreu.com.br'}`}
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                {settings?.support_email || 'contato@andersonabreu.com.br'}
              </a>
              <span className="text-white/60 text-sm">
                {settings?.whatsapp_number || settings?.contact_phone || ''}
              </span>
              <Link
                to="/login"
                className="text-white/60 hover:text-white text-sm transition-colors mt-2"
              >
                Área do Aluno
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} {settings?.company_name || 'Anderson Abreu'}. Todos os
              direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
