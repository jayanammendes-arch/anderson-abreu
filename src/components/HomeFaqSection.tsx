import { useEffect, useState } from 'react'
import { getActiveSiteFaqs } from '@/services/site-faqs'
import { getPlatformSettingsPublic, getFaqSectionImageUrl } from '@/services/landing'
import { useRealtime } from '@/hooks/use-realtime'
import type { SiteFAQ, PlatformSettings } from '@/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle } from 'lucide-react'

export function HomeFaqSection() {
  const [faqs, setFaqs] = useState<SiteFAQ[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [faqData, settingsData] = await Promise.all([
        getActiveSiteFaqs(),
        getPlatformSettingsPublic().catch(() => null),
      ])
      setFaqs(faqData)
      setSettings(settingsData as PlatformSettings | null)
    } catch {
      setFaqs([])
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

  useRealtime('platform_settings', () => {
    loadData()
  })

  if (!loading && faqs.length === 0) return null

  const faqImageUrl = settings ? getFaqSectionImageUrl(settings) : null

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00A3C4]/10">
                <HelpCircle className="h-5 w-5 text-[#00A3C4]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Perguntas Frequentes
              </h2>
            </div>
            <div className="w-20 h-1 bg-[#00A3C4] mb-8 rounded-full" />

            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.id || index}
                  value={`faq-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-5 shadow-sm transition-colors hover:border-slate-300 data-[state=open]:border-[#00A3C4]/40 data-[state=open]:bg-white"
                >
                  <AccordionTrigger className="text-left font-semibold text-slate-900 text-base hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                    <div
                      className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative overflow-hidden rounded-2xl shadow-xl h-[300px] md:h-[520px]">
              {faqImageUrl ? (
                <img
                  src={faqImageUrl}
                  alt="Ilustração de tranquilidade e suporte"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00A3C4]/20 via-[#00A3C4]/10 to-slate-100">
                  <HelpCircle className="h-24 w-24 text-[#00A3C4]/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#00A3C4]/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
