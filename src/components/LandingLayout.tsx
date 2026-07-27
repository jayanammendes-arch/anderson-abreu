import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, Calendar, ChevronDown, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlatformSettings, Treatment } from '@/types'
import { getLogoUrl, applyBrandColor } from '@/services/landing'
import { getAllTreatments } from '@/services/treatments'
import { TreatmentsDropdown } from '@/components/TreatmentsDropdown'
import { useAuth } from '@/hooks/use-auth'

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
}: {
  settings: PlatformSettings | null
  children: ReactNode
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileTreatmentsOpen, setMobileTreatmentsOpen] = useState(false)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const isLanding = location.pathname === '/'
  const isCursosPage = location.pathname === '/cursos'
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
    if (settings?.primary_color) applyBrandColor(settings.primary_color)
  }, [settings?.primary_color])

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

  const logoUrl = settings ? getLogoUrl(settings) : null
  const agendarText = settings?.agendar_sessao_text || 'Agendar Sessão'
  const handleAreaAlunoClick = () => navigate(areaAlunoHref)

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary selection:text-white">
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-3'
            : 'bg-white/80 backdrop-blur-sm py-5',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
            ) : (
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {settings?.company_name || 'Anderson Abreu'}
              </span>
            )}
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.name === 'Tratamentos' ? (
                <TreatmentsDropdown key={link.name}>Tratamentos</TreatmentsDropdown>
              ) : (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className={cn(
                    'text-sm font-medium px-3 py-2 rounded-md transition-colors',
                    'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
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
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 shadow-sm"
                onClick={handleAreaAlunoClick}
              >
                <GraduationCap className="mr-1.5 h-4 w-4" />
                Área do Aluno
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 shadow-sm"
                onClick={() => navigate('/agendar')}
              >
                <Calendar className="mr-1.5 h-4 w-4" />
                {agendarText}
              </Button>
            )}
          </div>
          <button
            className="lg:hidden p-2 text-slate-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-white transition-transform duration-300 lg:hidden flex flex-col pt-24 px-6',
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
                    className="flex items-center justify-between w-full text-slate-700 hover:text-primary text-left py-3 border-b border-slate-100 transition-colors"
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
                          className="text-slate-600 hover:text-primary text-base text-left py-2.5 border-b border-slate-50 transition-colors"
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
                className="text-slate-700 hover:text-primary text-left py-3 border-b border-slate-100 transition-colors"
              >
                {link.name}
              </button>
            )
          })}
          {isCursosPage ? (
            <Button
              className="mt-6 bg-slate-900 text-white hover:bg-slate-800 rounded-full h-12 text-base"
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
              className="mt-6 bg-slate-900 text-white hover:bg-slate-800 rounded-full h-12 text-base"
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

      {children}

      <footer className="bg-slate-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div className="max-w-sm">
              <span className="text-2xl font-bold text-white">
                {settings?.company_name || 'Anderson Abreu'}
              </span>
              <p className="text-white/50 text-sm leading-relaxed mt-3">
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
                  className="text-white/50 hover:text-white text-sm text-left transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-semibold mb-2">Contato</h4>
              <a
                href={`mailto:${settings?.support_email || 'contato@andersonabreu.com.br'}`}
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                {settings?.support_email || 'contato@andersonabreu.com.br'}
              </a>
              <span className="text-white/50 text-sm">
                {settings?.whatsapp_number || settings?.contact_phone || ''}
              </span>
              <Link
                to="/login"
                className="text-white/50 hover:text-white text-sm transition-colors mt-2"
              >
                Área do Aluno
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} {settings?.company_name || 'Anderson Abreu'}. Todos os
              direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
