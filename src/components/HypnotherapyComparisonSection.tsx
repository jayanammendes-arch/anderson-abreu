import { getTreatmentIcon } from '@/lib/treatment-icons'
import type { PlatformSettings } from '@/types'

interface ColumnItem {
  text: string
  icon: string
}

function parseItems(value: unknown): ColumnItem[] {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed
    } catch {
      /* empty */
    }
  }
  if (Array.isArray(value)) return value
  return []
}

const DEFAULT_COL1: ColumnItem[] = [
  { text: 'Abordagem natural e não invasiva', icon: 'leaf' },
  { text: 'Atendimento 100% personalizado', icon: 'heart' },
  {
    text: 'Foco em resolver a raiz do problema. Que fica no subconsciente, além da consciência da pessoa.',
    icon: 'brain',
  },
  { text: 'Sessões individuais e acolhedoras', icon: 'hand-heart' },
  {
    text: 'Relaxamento profundo guiado que permite chegar nas causas dos problemas',
    icon: 'waves',
  },
  { text: 'Resultado rápido, eficaz e duradouro', icon: 'zap' },
]

const DEFAULT_COL2: ColumnItem[] = [
  { text: 'Processos geralmente mais extensos', icon: 'clock' },
  { text: 'Abordagem predominantemente padronizada', icon: 'square' },
  { text: 'Foco principal no controle de sintomas', icon: 'bandage' },
  { text: 'Tratamento mais demorado. Entre 3 a 8 anos', icon: 'timer' },
  { text: 'Menor ênfase no relaxamento', icon: 'battery-warning' },
  { text: 'Adaptação gradual e contínua', icon: 'refresh-cw' },
]

export function HypnotherapyComparisonSection({ settings }: { settings: PlatformSettings | null }) {
  const title = settings?.home_section_title || 'Por que tantas pessoas buscam a Hipnoterapia?'
  const subtitle =
    settings?.home_section_subtitle ||
    'Conheça as características que tornam a hipnoterapia uma abordagem diferenciada para o equilíbrio emocional.'
  const parsedCol1 = parseItems(settings?.home_column1_items)
  const parsedCol2 = parseItems(settings?.home_column2_items)
  const col1 = parsedCol1.length > 0 ? parsedCol1 : DEFAULT_COL1
  const col2 = parsedCol2.length > 0 ? parsedCol2 : DEFAULT_COL2
  const footer =
    settings?.home_section_footer ||
    '* As abordagens convencionais são igualmente importantes e complementares. O objetivo não é substituir, mas apresentar uma alternativa natural eficaz.'

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-block w-12 h-1 bg-gradient-to-r from-[#00A3C4] to-[#026aa2] rounded-full mb-6" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed">{subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <div className="relative bg-gradient-to-br from-[#026aa2] to-[#014a75] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#38bdf8] via-[#00A3C4] to-[#38bdf8]" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-semibold mb-8 backdrop-blur-sm">
                <span className="text-[#38bdf8]">✦</span>
                <span>Hipnoterapia Clínica Avançada</span>
              </div>
              <ul className="space-y-5">
                {col1.map((item, idx) => {
                  const Icon = getTreatmentIcon(item.icon)
                  return (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center mt-0.5">
                        <Icon className="w-4 h-4 text-[#7dd3fc]" strokeWidth={2.5} />
                      </div>
                      <span className="text-white/95 text-base md:text-[17px] font-medium leading-snug pt-1.5">
                        {item.text}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <div className="relative bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold mb-8">
                Abordagens Tradicionais
              </div>
              <ul className="space-y-5">
                {col2.map((item, idx) => {
                  const Icon = getTreatmentIcon(item.icon)
                  return (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mt-0.5">
                        <Icon className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                      </div>
                      <span className="text-slate-600 text-base md:text-[17px] font-normal leading-snug pt-1.5">
                        {item.text}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="max-w-3xl bg-[#00A3C4]/5 border-l-4 border-[#00A3C4] rounded-r-xl px-6 py-4">
            <p className="text-xs md:text-sm text-slate-500 italic leading-relaxed text-center">
              {footer}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
