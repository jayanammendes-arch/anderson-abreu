import { useState, useEffect } from 'react'
import { getPlatformSettingsPublic, submitContact } from '@/services/landing'
import type { PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Calendar, Loader2, CheckCircle2 } from 'lucide-react'

export default function Agendar() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  useEffect(() => {
    getPlatformSettingsPublic()
      .then((data) => setSettings(data as PlatformSettings | null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await submitContact({
        ...formData,
        message: `[Agendamento de Sessão] ${formData.message || 'Solicitação de agendamento de sessão de hipnose.'}`,
      })
      toast.success('Solicitação enviada com sucesso! Entraremos em contato em breve.')
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch {
      toast.error('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

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
      <section className="pt-32 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {settings?.agendar_sessao_text || 'Agendar Sessão'}
            </h1>
            <p className="text-lg text-slate-500">
              Preencha o formulário abaixo e entraremos em contato para agendar sua sessão de
              hipnose clínica.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Solicitação Enviada!</h2>
              <p className="text-slate-500 mb-8">
                Recebemos sua solicitação e entraremos em contato em breve para confirmar seu
                agendamento.
              </p>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setSubmitted(false)}
              >
                Enviar nova solicitação
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-slate-200 rounded-2xl p-8 space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="h-12"
                  placeholder="Seu nome"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="h-12"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                  <Input
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    className="h-12"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem (opcional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                  className="min-h-[120px]"
                  placeholder="Conte-nos brevemente sobre o que você gostaria de trabalhar na sessão..."
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 h-12 text-lg rounded-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...
                  </>
                ) : (
                  'Enviar Solicitação'
                )}
              </Button>
            </form>
          )}
        </div>
      </section>
    </LandingLayout>
  )
}
