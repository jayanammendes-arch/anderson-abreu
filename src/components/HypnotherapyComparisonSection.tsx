import { Check, X } from 'lucide-react'

export function HypnotherapyComparisonSection() {
  const hypnoItems = [
    'Abordagem natural e não invasiva',
    'Atendimento 100% personalizado',
    'Foco em resolver a raiz do problema. Que fica no subconsciente, além da consciência da pessoa.',
    'Sessões individuais e acolhedoras',
    'Relaxamento profundo guiado que permite chegar nas causas dos problemas',
    'Resultado rápido, eficaz e duradouro',
  ]

  const traditionalItems = [
    'Processos geralmente mais extensos',
    'Abordagem predominantemente padronizada',
    'Foco principal no controle de sintomas',
    'Tratamento mais demorado. Entre 3 a 8 anos',
    'Menor ênfase no relaxamento',
    'Adaptação gradual e contínua',
  ]

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Por que tantas pessoas buscam a <span className="text-[#00A3C4]">Hipnoterapia</span>?
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Conheça as características que tornam a hipnoterapia uma abordagem diferenciada para o
            equilíbrio emocional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Advanced Hypnotherapy Card */}
          <div className="bg-[#026aa2] text-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-sm">
                <span>✦</span>
                <span>Hipnoterapia Clínica Avançada</span>
              </div>

              <ul className="space-y-5">
                {hypnoItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3.5">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#38bdf8] text-[#026aa2] flex items-center justify-center mt-0.5 shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-white text-base md:text-[17px] font-medium leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Traditional Approaches Card */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-200/80 text-slate-800 text-sm font-semibold mb-8">
                Abordagens Tradicionais
              </div>

              <ul className="space-y-5">
                {traditionalItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3.5">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#b91c1c] text-white flex items-center justify-center mt-0.5 shadow-sm">
                      <X className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-slate-700 text-base md:text-[17px] font-normal leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/60">
              <p className="text-xs text-slate-500 italic leading-relaxed">
                * As abordagens convencionais são igualmente importantes e complementares. O
                objetivo não é substituir, mas apresentar uma alternativa natural eficaz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
