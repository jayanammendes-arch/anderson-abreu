import { useState, useEffect } from 'react'
import { getFaqs } from '@/services/faqs'
import { getPlatformSettings } from '@/services/admin-settings'
import { useRealtime } from '@/hooks/use-realtime'
import type { FAQ, PlatformSettings } from '@/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LifeBuoy, Mail, MessageCircle, Loader2 } from 'lucide-react'

export default function Faq() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [faqData, settingsData] = await Promise.all([getFaqs(), getPlatformSettings()])
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
  useRealtime('faqs', () => {
    loadData()
  })
  useRealtime('platform_settings', () => {
    loadData()
  })

  const whatsappLink = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`
    : '#'
  const supportEmail = settings?.support_email || 'suporte@andersonabreu.com'

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-4xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
          <LifeBuoy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Central de Ajuda</h1>
        <p className="text-muted-foreground text-lg">
          Como podemos ajudar você hoje? Encontre respostas rápidas abaixo.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : faqs.length === 0 ? (
        <Card className="border-border/50 bg-card/50 shadow-none">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma pergunta frequente encontrada.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 bg-card/50 shadow-none mb-12">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card text-center hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Suporte via WhatsApp</CardTitle>
            <CardDescription>Atendimento de Segunda a Sexta, das 9h às 18h.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                Chamar no WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card text-center hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>E-mail</CardTitle>
            <CardDescription>Respondemos em até 24 horas úteis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" asChild>
              <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
