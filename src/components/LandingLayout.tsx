import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, Instagram, Facebook, Linkedin, Youtube, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlatformSettings } from '@/types'
import { getLogoUrl, applyBrandColor } from '@/services/landing'

const navLinks = [
  { name: 'Início', href: '#home' },
  { name: 'Sobre', href: '#about' },
  { name: 'Serviços', href: '#services' },
  { name: 'Depoimentos', href: '#testimonials' },
  { name: 'Contato', href: '#contact' },
]

function scrollToSection(href: string) {
  const el = document.querySelector(href)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

export function LandingLayout({
  settings,
  children,
}: {
  settings: PlatformSettings | null
  children: ReactNode
}) {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 50)
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isLanding) {
      e.preventDefault()
      setIsMenuOpen(false)
      scrollToSection(href)
    } else {
      setIsMenuOpen(false)
    }
  }

  const logoUrl = settings ? getLogoUrl(settings) : null
  const socialLinks: Array<{ url: string; icon: LucideIcon }> = [
    { url: settings?.instagram_handle || '', icon: Instagram },
    { url: settings?.facebook_url || '', icon: Facebook },
    { url: settings?.linkedin_url || '', icon: Linkedin },
    { url: settings?.youtube_url || '', icon: Youtube },
  ].filter((s) => s.url.trim() !== '')

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-accent selection:text-white">
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
          isScrolled
            ? 'bg-gradient-to-r from-[#0047AB]/95 to-black/95 backdrop-blur-md border-white/10 py-3'
            : 'bg-transparent border-transparent py-5',
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <div className="h-8 w-8 bg-gradient-to-br from-accent to-accent/70 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white leading-none">AA</span>
              </div>
            )}
            <span className="font-bold text-lg tracking-tight hidden sm:block text-white">
              {settings?.company_name || 'Anderson Abreu'}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={isLanding ? link.href : `/${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-white/80 hover:text-accent transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-black rounded-full transition-colors"
              asChild
            >
              <a
                href={isLanding ? '#contact' : '/#contact'}
                onClick={(e) => handleNavClick(e, '#contact')}
              >
                Contato
              </a>
            </Button>
          </div>
          <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

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
              href={isLanding ? link.href : `/${link.href}`}
              onClick={(e) => handleNavClick(e, link.href)}
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

      {children}

      <footer className="bg-gradient-to-r from-[#0047AB] to-black pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div className="max-w-sm">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain mb-4" />
              ) : (
                <div className="text-2xl font-bold text-white mb-4">
                  {settings?.company_name || 'Anderson Abreu'}
                </div>
              )}
              <p className="text-white/60 text-sm leading-relaxed">
                {settings?.hero_subtitle ||
                  'Hipnoterapia, inteligência emocional e mentoria de alta performance.'}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-semibold mb-2">Navegação</h4>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={isLanding ? link.href : `/${link.href}`}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-white/60 hover:text-accent text-sm transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/cursos"
                className="text-white/60 hover:text-accent text-sm transition-colors"
              >
                Cursos
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-semibold mb-2">Acesso</h4>
              <Link
                to="/login"
                className="text-white/60 hover:text-accent text-sm transition-colors"
              >
                Área do Aluno
              </Link>
              <Link
                to="/cursos"
                className="text-white/60 hover:text-accent text-sm transition-colors"
              >
                Cursos Disponíveis
              </Link>
              {socialLinks.length > 0 && (
                <div className="flex gap-3 mt-2">
                  {socialLinks.map((social, i) => {
                    const Icon = social.icon
                    return (
                      <a
                        key={i}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 w-9 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-colors text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    )
                  })}
                </div>
              )}
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
