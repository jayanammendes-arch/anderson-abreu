const ROWS = [
  {
    label: 'Abordagem',
    hypno: 'Trabalha a causa raiz no subconsciente',
    trad: 'Foca em sintomas superficiais',
  },
  { label: 'Tempo médio do tratamento', hypno: '2 a 5 sessões', trad: 'Meses a anos' },
  { label: 'Foco na causa raiz', hypno: 'Sim', trad: 'Parcialmente' },
  { label: 'Efeitos colaterais', hypno: 'Nenhum', trad: 'Possíveis efeitos de medicamentos' },
  { label: 'Resultados duradouros', hypno: 'Sim', trad: 'Depende de uso contínuo' },
]

export function ComparisonTable() {
  return (
    <section className="py-24 bg-[#0E1D2F] text-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Hipnoterapia vs Tratamento Tradicional
        </h2>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left p-4 text-sm font-semibold text-white/80"></th>
                <th className="text-left p-4 text-sm font-semibold text-primary">Hipnoterapia</th>
                <th className="text-left p-4 text-sm font-semibold text-white/50">
                  Tratamento Tradicional
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}>
                  <td className="p-4 text-sm font-medium text-white/90">{row.label}</td>
                  <td className="p-4 text-sm text-primary/90 font-medium">{row.hypno}</td>
                  <td className="p-4 text-sm text-white/60">{row.trad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
