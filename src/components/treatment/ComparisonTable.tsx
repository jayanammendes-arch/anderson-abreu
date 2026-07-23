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
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          Hipnoterapia vs Tratamento Tradicional
        </h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-4 text-sm font-semibold text-slate-700"></th>
                <th className="text-left p-4 text-sm font-semibold text-[#00A3C4]">Hipnoterapia</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">
                  Tratamento Tradicional
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-4 text-sm font-medium text-slate-700">{row.label}</td>
                  <td className="p-4 text-sm text-slate-600">{row.hypno}</td>
                  <td className="p-4 text-sm text-slate-500">{row.trad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
