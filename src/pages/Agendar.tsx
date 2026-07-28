import { useState, useEffect, useRef } from 'react'
import { getPlatformSettingsPublic, submitContact } from '@/services/landing'
import type { PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Calendar,
  Loader2,
  CheckCircle2,
  MessageCircle,
  Phone,
  Mail,
  User,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollFadeIn } from '@/components/ScrollFadeIn'

const DEFAULT_BENEFITS = [
  'Atendimento Presencial',
  'Atendimento Online',
  'Método Exclusivo',
  'Técnica Aprovada Cientificamente',
  'Sessões Individuais e Personalizadas',
  'Ambiente Seguro e Acolhedor',
]

function parseBenefits(raw: unknown): string[] {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
        return parsed.length > 0 ? parsed : DEFAULT_BENEFITS
      }
    } catch {
      /* intentionally ignored */
    }
  }
  if (Array.isArray(raw) && raw.every((v) => typeof v === 'string')) {
    return raw.length > 0 ? raw : DEFAULT_BENEFITS
  }
  return DEFAULT_BENEFITS
}

export default function Agendar() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPlatformSettingsPublic()
      .then((data) => setSettings(data as PlatformSettings | null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const headline = settings?.agendar_headline || 'Agende sua Sessão'
  const subheadline = settings?.agendar_subheadline || 'Resultados em 2 Sessões'
  const benefits = parseBenefits(settings?.agendar_benefits)
  const submitText = settings?.agendar_submit_button_text || 'Enviar'
  const whatsappNumber = (settings?.whatsapp_number || '').replace(/\D/g, '')

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = 'Nome é obrigatório'
    if (!formData.email.trim()) {
      errs.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Email inválido'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await submitContact({
        ...formData,
        message:
          formData.message ||
          `[Agendamento de Sessão] Solicitação de agendamento de sessão de hipnose.`,
      })
      toast.success('Solicitação enviada com sucesso! Entraremos em contato em breve.')
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
      setErrors({})
    } catch {
      toast.error('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      const firstInput = formRef.current?.querySelector('input')
      firstInput?.focus()
    }, 400)
  }

  if (loading) {
    return (
      <LandingLayout settings={settings} darkBg>
        <div className="flex h-screen items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      </LandingLayout>
    )
  }

  return (
    <LandingLayout settings={settings} darkBg>
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden pt-24 pb-16 md:pt-28 md:pb-20 bg-transparent">
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <ScrollFadeIn>
              <div className="text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                  <Calendar className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white/90">
                    Hipnose Clínica & Desenvolvimento Humano
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 drop-shadow-sm text-white">
                  {headline}
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-white/90 mb-8 flex items-center gap-2">
                  <span className="inline-block w-8 h-px bg-white/40" />
                  {subheadline}
                </p>

                <ul className="space-y-3 mb-10">
                  {benefits.map((benefit, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-white/90 text-base sm:text-lg"
                    >
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white/15 border border-white/25">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-4">
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-white font-semibold text-base shadow-lg hover:bg-[#1ebe5b] transition-all duration-200 hover:scale-105"
                    >
                      <MessageCircle className="h-5 w-5" />
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={scrollToForm}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-royal text-white font-semibold text-base shadow-lg hover:bg-royal-hover transition-all duration-200 hover:scale-105"
                  >
                    {settings?.agendar_sessao_text || 'Agendar Sessão'}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </ScrollFadeIn>

            <ScrollFadeIn>
              <div ref={formRef}>
                {submitted ? (
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 text-center shadow-2xl">
                    <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-3">Solicitação Enviada!</h2>
                    <p className="text-white/80 mb-8">
                      Recebemos sua solicitação e entraremos em contato em breve para confirmar seu
                      agendamento.
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      onClick={() => setSubmitted(false)}
                    >
                      Enviar nova solicitação
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-2">Solicite seu Agendamento</h2>
                    <p className="text-white/70 text-sm mb-6">
                      Preencha o formulário e entraremos em contato para agendar sua sessão.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white/90 text-sm font-medium">
                          Nome *
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                          <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                            className={cn(
                              'h-12 pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50',
                              'focus:bg-white/20 focus:border-white/50 rounded-xl',
                              errors.name && 'border-red-400',
                            )}
                            placeholder="Seu nome completo"
                          />
                        </div>
                        {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/90 text-sm font-medium">
                          Email *
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                            className={cn(
                              'h-12 pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50',
                              'focus:bg-white/20 focus:border-white/50 rounded-xl',
                              errors.email && 'border-red-400',
                            )}
                            placeholder="seu@email.com"
                          />
                        </div>
                        {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white/90 text-sm font-medium">
                          Telefone / WhatsApp
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                            className="h-12 pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/50 rounded-xl"
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-white/90 text-sm font-medium">
                          Descrição
                        </Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                          className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/50 rounded-xl resize-none"
                          placeholder="Conte-nos brevemente sobre o que você gostaria de trabalhar na sessão..."
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-12 text-base font-semibold rounded-xl bg-white text-slate-900 hover:bg-white/90 transition-colors duration-200 shadow-md"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...
                          </>
                        ) : (
                          submitText
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}
