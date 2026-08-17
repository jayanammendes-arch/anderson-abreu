export interface SnapshotFieldDef {
  key: string
  label: string
  type: 'text' | 'richtext' | 'boolean' | 'number' | 'image' | 'json'
}

export const SNAPSHOT_FIELDS: SnapshotFieldDef[] = [
  { key: 'name', label: 'Nome', type: 'text' },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'short_description', label: 'Descrição Curta', type: 'text' },
  { key: 'detailed_content', label: 'Conteúdo Detalhado', type: 'richtext' },
  { key: 'icon', label: 'Ícone', type: 'text' },
  { key: 'image', label: 'Imagem Principal', type: 'image' },
  { key: 'order', label: 'Ordem', type: 'number' },
  { key: 'is_active', label: 'Ativo', type: 'boolean' },
  { key: 'hide_icon', label: 'Ocultar Ícone', type: 'boolean' },
  { key: 'crop_x', label: 'Crop X', type: 'number' },
  { key: 'crop_y', label: 'Crop Y', type: 'number' },
  { key: 'como_funciona_title', label: 'Título: Como Funciona', type: 'text' },
  { key: 'como_funciona_text', label: 'Conteúdo: Como Funciona', type: 'richtext' },
  { key: 'como_funciona_image', label: 'Imagem: Como Funciona', type: 'image' },
  { key: 'faixa_azul_frase', label: 'Frase da Faixa Azul', type: 'text' },
  { key: 'faixa_azul_subtitulo', label: 'Subtítulo da Faixa Azul', type: 'text' },
  { key: 'faixa_text', label: 'Texto da Faixa', type: 'text' },
  { key: 'resultados_title', label: 'Título: Resultados', type: 'text' },
  { key: 'resultados_text', label: 'Conteúdo: Resultados', type: 'richtext' },
  { key: 'resultados_image', label: 'Imagem: Resultados', type: 'image' },
  { key: 'sintomas_title', label: 'Título: Sintomas', type: 'text' },
  { key: 'sintomas_text', label: 'Conteúdo: Sintomas (Geral / Antigo)', type: 'richtext' },
  { key: 'sintomas_corpo_text', label: 'Sintomas no Corpo', type: 'richtext' },
  { key: 'sintomas_mente_text', label: 'Sintomas na Mente/Comportamento', type: 'richtext' },
  { key: 'sintomas_image', label: 'Imagem: Sintomas', type: 'image' },
  { key: 'cta_title', label: 'Título: CTA', type: 'text' },
  { key: 'cta_text', label: 'Conteúdo: CTA', type: 'richtext' },
  { key: 'por_que_tantas_title', label: 'Título: Por Que Tantas', type: 'text' },
  { key: 'por_que_tantas_content', label: 'Conteúdo: Por Que Tantas', type: 'richtext' },
  { key: 'comparacao_title', label: 'Título: Comparação', type: 'text' },
  { key: 'comparacao_content', label: 'Conteúdo: Comparação', type: 'richtext' },
  { key: 'symptoms_list', label: 'Lista de Sintomas', type: 'richtext' },
  { key: 'sections_config', label: 'Configuração de Seções', type: 'json' },
  { key: 'font_sizes', label: 'Tamanhos de Fonte (px)', type: 'json' },
]

export const RESTOREABLE_FIELD_NAMES = SNAPSHOT_FIELDS.map((f) => f.key)
