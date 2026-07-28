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

export const TREATMENT_DETAIL_SECTIONS = [
  { id: 'detailed_content', label: 'Conteúdo Detalhado' },
  { id: 'como_funciona', label: 'Como Funciona' },
  { id: 'sintomas', label: 'Sintomas' },
  { id: 'sintomas_imagem', label: 'Imagem de Sintomas' },
  { id: 'resultados', label: 'Resultados' },
  { id: 'faixa_destaque', label: 'Faixa de Destaque' },
  { id: 'cta', label: 'CTA Final' },
] as const

export const TREATMENT_DETAIL_SECTION_LABELS: Record<string, string> = {
  detailed_content: 'Conteúdo Detalhado',
  como_funciona: 'Como Funciona',
  sintomas: 'Sintomas',
  sintomas_imagem: 'Imagem de Sintomas',
  resultados: 'Resultados',
  faixa_destaque: 'Faixa de Destaque',
  cta: 'CTA Final',
}

export const DEFAULT_TREATMENT_DETAIL_CONFIG: SectionConfigItem[] = [
  { id: 'detailed_content', visible: true },
  { id: 'como_funciona', visible: true },
  { id: 'sintomas', visible: true },
  { id: 'sintomas_imagem', visible: true },
  { id: 'resultados', visible: true },
  { id: 'faixa_destaque', visible: true },
  { id: 'cta', visible: true },
]

export function getTreatmentDetailConfig(config?: SectionConfigItem[] | null): SectionConfigItem[] {
  if (!config || !Array.isArray(config) || config.length === 0) {
    return DEFAULT_TREATMENT_DETAIL_CONFIG.map((s) => ({ ...s }))
  }
  const knownIds = new Set(TREATMENT_DETAIL_SECTIONS.map((s) => s.id))
  const filtered = config.filter((s) => knownIds.has(s.id))
  const existingIds = new Set(filtered.map((s) => s.id))
  const missing = DEFAULT_TREATMENT_DETAIL_CONFIG.filter((s) => !existingIds.has(s.id))
  return [...filtered, ...missing]
}
