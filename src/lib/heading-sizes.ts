import type { HeadingLevel, HeadingSizeEntry, HeadingSizes } from '@/types'

export const HEADING_LEVELS: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

/** Tabela padrão (fallback) — h1 32/38, h2 26/30, h3 22/24, h4 18/20, h5 16/18, h6 14/16. */
export const DEFAULT_HEADING_SIZES: HeadingSizes = {
  h1: { mobile: 32, desktop: 38 },
  h2: { mobile: 26, desktop: 30 },
  h3: { mobile: 22, desktop: 24 },
  h4: { mobile: 18, desktop: 20 },
  h5: { mobile: 16, desktop: 18 },
  h6: { mobile: 14, desktop: 16 },
}

/** Normaliza um valor vindo do banco/JSON para o shape completo de HeadingSizes. */
export function normalizeHeadingSizes(raw: unknown): HeadingSizes {
  const base: HeadingSizes = { ...DEFAULT_HEADING_SIZES }
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
  for (const lvl of HEADING_LEVELS) {
    const entry = obj[lvl]
    if (entry && typeof entry === 'object') {
      const e = entry as Record<string, unknown>
      const mobile = Number(e.mobile)
      const desktop = Number(e.desktop)
      if (Number.isFinite(mobile) && mobile > 0) base[lvl].mobile = Math.round(mobile)
      if (Number.isFinite(desktop) && desktop > 0) base[lvl].desktop = Math.round(desktop)
    }
  }
  return base
}

/** Gera o texto CSS (mobile-first + breakpoint desktop) para um conjunto de sizes. */
export function buildHeadingSizesCss(
  sizes: HeadingSizes,
  scopeSelector = '.td-heading-scope',
): string {
  const mobileRules = HEADING_LEVELS.map(
    (lvl) =>
      `${scopeSelector} ${lvl}{font-size:${sizes[lvl].mobile}px!important;line-height:1.2!important;}`,
  ).join('')
  const desktopRules = HEADING_LEVELS.map(
    (lvl) => `${scopeSelector} ${lvl}{font-size:${sizes[lvl].desktop}px!important;}`,
  ).join('')
  return `${mobileRules}@media (min-width:768px){${desktopRules}}`
}

/** Gera o CSS inline (style) para um único heading, já considerando viewport. */
export function headingInlineStyle(
  level: HeadingLevel,
  sizes: HeadingSizes,
  isDesktop: boolean,
): React.CSSProperties {
  const entry: HeadingSizeEntry = sizes[level] || DEFAULT_HEADING_SIZES[level]
  return {
    fontSize: `${isDesktop ? entry.desktop : entry.mobile}px`,
    lineHeight: 1.2,
  }
}
