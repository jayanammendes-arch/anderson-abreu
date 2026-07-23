import { useState, useEffect } from 'react'
import { getActiveSiteFaqs } from '@/services/site-faqs'
import { getPlatformSettings } from '@/services/admin-settings'
import { useRealtime } from '@/hooks/use-realtime'
import type { SiteFAQ, PlatformSettings } from '@/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { LifeBuoy, Loader2, Mail, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PublicFaq() {
  const [faqs, setFaqs] = useState<SiteFAQ[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [faqData, settingsData] = await Promise.all([
        getActiveSiteFaqs(),
        getPlatformSettings(),
      ])
      setFaqs(faqData)
      setSettings(settingsData)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('site_faqs', () => {
    loadData()
  })

  const whatsappLink = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`
    : '#'
  const supportEmail = settings?.support_email || 'suporte@andersonabreu.com'

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
            <LifeBuoy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Perguntas Frequentes</h1>
          <p className="text-muted-foreground text-lg">
            Encontre respostas rápidas para as dúvidas mais comuns.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : faqs.length === 0 ? (
          <Card className="border-border/50 bg-card/50 shadow-none">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma pergunta frequente disponível no momento.
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 bg-card/50 shadow-none">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.id || index}
                    value={`item-${index}`}
                    className="border-border/50"
                  >
                    <AccordionTrigger className="text-left font-medium text-lg hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                      <div
                        className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {settings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {settings.whatsapp_number && (
              <Card className="border-border/50 bg-card text-center hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Atendimento de Segunda a Sexta, das 9h às 18h.
                  </p>
                  <Button className="w-full" variant="outline" asChild>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      Chamar no WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
            {settings.support_email && (
              <Card className="border-border/50 bg-card text-center hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">E-mail</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Respondemos em até 24 horas úteis.
                  </p>
                  <Button className="w-full" variant="outline" asChild>
                    <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
