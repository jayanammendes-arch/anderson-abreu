import type { PlatformSettings } from '@/types'

interface GlobalBlueBandProps {
  settings?: PlatformSettings | null
  className?: string
}

export function GlobalBlueBand({ settings, className = '' }: GlobalBlueBandProps) {
  const title = settings?.global_blue_band_title?.trim() || 'O que é Hipnose?'
  const customText = settings?.global_blue_band_text?.trim()

  const isHtml = customText ? /<[a-z][\s\S]*>/i.test(customText) : false

  return (
    <section className={`w-full bg-[#0B1D3A] text-white py-12 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">{title}</h2>

        {customText ? (
          isHtml ? (
            <div
              className="prose prose-invert max-w-none text-slate-200 text-base md:text-lg leading-relaxed space-y-4 [&_p]:text-slate-200 [&_strong]:text-white [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: customText }}
            />
          ) : (
            <div className="text-slate-200 text-base md:text-lg leading-relaxed space-y-4 max-w-6xl">
              {customText.split(/\n\n+/).map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          )
        ) : (
          <div className="text-slate-200 text-base md:text-lg leading-relaxed space-y-4 max-w-6xl">
            <p>
              A hipnose é uma técnica segura e natural que utiliza um estado de foco e relaxamento
              profundo para acessar padrões emocionais, crenças e comportamentos que muitas vezes
              atuam de forma <strong className="font-semibold text-white">inconsciente</strong>.
              Durante todo o processo, você permanece{' '}
              <strong className="font-semibold text-white">consciente e no controle</strong>.
            </p>
            <p>
              Enquanto muitas abordagens trabalham apenas os sintomas, a hipnose busca identificar e
              ressignificar as causas emocionais por trás deles, promovendo{' '}
              <strong className="font-semibold text-white">
                mudanças mais profundas e duradouras
              </strong>
              . É uma ferramenta poderosa para quem deseja superar bloqueios, tratar a ansiedade e
              desenvolver uma relação mais saudável consigo mesmo.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
