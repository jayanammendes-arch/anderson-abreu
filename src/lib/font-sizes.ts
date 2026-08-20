/**
 * Tamanhos de fonte (px) configuráveis por seção no admin de categorias de
 * tratamento. Substitui o antigo sistema de níveis h1–h6 por um modelo simples:
 * cada seção editável tem um tamanho de fonte para o título e outro para o
 * conteúdo, em pixels.
 *
 * O valor é armazenado no banco como um campo JSON `font_sizes` com o shape
 * `FontSizes`. Tudo é opcional — quando ausente, cai nos defaults abaixo.
 */

/** Chaves de cada seção editável que possui tamanho de fonte próprio. */
export type FontSizeSection =
  | 'como_funciona'
  | 'resultados'
  | 'sintomas'
  | 'sintomas_corpo'
  | 'sintomas_mente'
  | 'cta'
  | 'detailed_content'

export interface FontSizeEntry {
  /** Tamanho do título da seção, em px. */
  title: number
  /** Tamanho do conteúdo da seção, em px. */
  content: number
}

export type FontSizes = Partial<Record<FontSizeSection, Partial<FontSizeEntry>>>

/** Tamanhos padrão (fallback) por seção. */
export const DEFAULT_FONT_SIZES: Record<FontSizeSection, FontSizeEntry> = {
  como_funciona: { title: 40, content: 18 },
  resultados: { title: 40, content: 18 },
  sintomas: { title: 40, content: 18 },
  sintomas_corpo: { title: 20, content: 20 },
  sintomas_mente: { title: 20, content: 20 },
  cta: { title: 40, content: 18 },
  detailed_content: { title: 40, content: 15 },
}

export const FONT_SIZE_SECTIONS: FontSizeSection[] = [
  'como_funciona',
  'resultados',
  'sintomas',
  'sintomas_corpo',
  'sintomas_mente',
  'cta',
  'detailed_content',
]

export const FONT_SIZE_SECTION_LABELS: Record<FontSizeSection, string> = {
  como_funciona: 'Como Funciona',
  resultados: 'Resultados',
  sintomas: 'Sintomas',
  sintomas_corpo: 'Sintomas no Corpo',
  sintomas_mente: 'Sintomas na Mente',
  cta: 'CTA',
  detailed_content: 'Conteúdo Detalhado',
}

/** Garante um número válido (>=8) a partir de qualquer entrada. */
function sanitize(n: unknown, fallback: number): number {
  const v = Number(n)
  if (!Number.isFinite(v) || v <= 0) return fallback
  return Math.round(v)
}

/** Normaliza um valor vindo do banco/JSON para o shape completo de FontSizes. */
export function normalizeFontSizes(raw: unknown): Record<FontSizeSection, FontSizeEntry> {
  const base: Record<FontSizeSection, FontSizeEntry> = {
    como_funciona: { ...DEFAULT_FONT_SIZES.como_funciona },
    resultados: { ...DEFAULT_FONT_SIZES.resultados },
    sintomas: { ...DEFAULT_FONT_SIZES.sintomas },
    sintomas_corpo: { ...DEFAULT_FONT_SIZES.sintomas_corpo },
    sintomas_mente: { ...DEFAULT_FONT_SIZES.sintomas_mente },
    cta: { ...DEFAULT_FONT_SIZES.cta },
    detailed_content: { ...DEFAULT_FONT_SIZES.detailed_content },
  }
  if (!raw) return base
  let obj: Record<string, unknown> = {}
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw)
    } catch {
      return base
    }
  } else if (typeof raw === 'object' && raw !== null) {
    obj = raw as Record<string, unknown>
  } else {
    return base
  }
  for (const section of FONT_SIZE_SECTIONS) {
    const entry = obj[section]
    if (entry && typeof entry === 'object') {
      const e = entry as Record<string, unknown>
      if (e.title != null)
        base[section].title = sanitize(e.title, DEFAULT_FONT_SIZES[section].title)
      if (e.content != null)
        base[section].content = sanitize(e.content, DEFAULT_FONT_SIZES[section].content)
    }
  }
  return base
}

/** Gera um objeto de estilos inline (CSSProperties) para uma seção. */
export function sectionFontStyles(
  sizes: Record<FontSizeSection, FontSizeEntry>,
  section: FontSizeSection,
): { title: React.CSSProperties; content: React.CSSProperties } {
  const entry = sizes[section] || DEFAULT_FONT_SIZES[section]
  return {
    title: { fontSize: `${entry.title}px`, lineHeight: 1.2 },
    content: { fontSize: `${entry.content}px`, lineHeight: 1.6 },
  }
}
