export interface SectionConfigItem {
  id: string
  visible: boolean
}

export const DEFAULT_SECTIONS_CONFIG: SectionConfigItem[] = [
  { id: 'introducao', visible: true },
  { id: 'como_funciona', visible: true },
  { id: 'resultados', visible: true },
  { id: 'sintomas', visible: true },
  { id: 'outros_tratamentos', visible: true },
  { id: 'depoimentos', visible: true },
  { id: 'cta', visible: true },
]

export const SECTION_LABELS: Record<string, string> = {
  introducao: 'Introdução',
  como_funciona: 'Como Funciona',
  resultados: 'Resultados',
  sintomas: 'Sintomas',
  outros_tratamentos: 'Outros Tratamentos',
  depoimentos: 'Depoimentos',
  cta: 'CTA Final',
}

export function getSectionsConfig(config?: SectionConfigItem[] | null): SectionConfigItem[] {
  if (!config || !Array.isArray(config) || config.length === 0) {
    return DEFAULT_SECTIONS_CONFIG.map((s) => ({ ...s }))
  }
  const knownIds = new Set(config.map((s) => s.id))
  const missing = DEFAULT_SECTIONS_CONFIG.filter((s) => !knownIds.has(s.id))
  return [...config, ...missing]
}
