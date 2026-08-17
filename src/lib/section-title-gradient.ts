/**
 * Padrão de títulos de seção:
 * - Todas as palavras em BRANCO, exceto a ÚLTIMA que recebe GRADIENTE DOURADO.
 * - Exceção: quando o texto for exatamente "APROVADO PELA CIÊNCIA", o título
 *   inteiro recebe gradiente dourado.
 *
 * O usuário edita o texto normalmente (string/HTML). Se ele aplicou cores
 * manualmente no editor (cor de texto, <font color>, gradiente rte-gradient ou
 * section-title-gold), o site respeita EXATAMENTE o que ele escolheu e nenhum
 * padrão automático é aplicado. O padrão automático só entra quando o título
 * não possui nenhuma cor personalizada.
 */

/** Classe utilitária do gradiente dourado aplicado ao título. */
export const SECTION_TITLE_GOLD_CLASS = 'section-title-gold'

/** Normaliza texto removendo tags HTML e espaços extras. */
function plainText(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return (tmp.textContent || tmp.innerText || '').trim()
}

/**
 * Verdadeiro quando o título normalizado é exatamente "APROVADO PELA CIÊNCIA".
 */
export function isApprovedByScience(title: string): boolean {
  return plainText(title).toUpperCase() === 'APROVADO PELA CIÊNCIA'
}

/**
 * Detecta se o HTML do título possui qualquer coloração manual aplicada pelo
 * usuário no editor: estilo inline com `color`, atributo `color=` (tag <font>),
 * ou classes de gradiente (`rte-gradient-*`) / `section-title-gold`.
 */
function hasCustomColor(html: string): boolean {
  if (!html) return false
  return (
    /style=["'][^"']*\bcolor\b/i.test(html) ||
    /\bcolor=/i.test(html) ||
    /class=["'][^"']*\b(rte-gradient|section-title-gold)/i.test(html)
  )
}

/**
 * Constrói o HTML de um título aplicando o padrão de gradiente dourado.
 *
 * Regras:
 *  1. "APROVADO PELA CIÊNCIA" → título inteiro com gradiente dourado.
 *  2. Se o título já tiver cores manuais (editor), devolve o HTML original,
 *     respeitando exatamente o que o usuário escolheu.
 *  3. Caso contrário, aplica o padrão automático: palavras em branco + última
 *     palavra com gradiente dourado #D4AF37.
 *
 * @param title Título bruto (HTML ou texto simples).
 * @returns HTML pronto para renderização.
 */
export function renderSectionTitleHtml(title: string): string {
  const text = plainText(title)
  if (!text) return ''

  // Exceção: título inteiro com gradiente dourado.
  if (text.toUpperCase() === 'APROVADO PELA CIÊNCIA') {
    return `<span class="${SECTION_TITLE_GOLD_CLASS}">${escapeHtml(text)}</span>`
  }

  // O usuário pintou cores manualmente no editor: respeitar a escolha.
  if (hasCustomColor(title)) {
    return title
  }

  const lastSpace = text.lastIndexOf(' ')
  if (lastSpace === -1) {
    // Apenas uma palavra: aplica o gradiente nela.
    return `<span class="${SECTION_TITLE_GOLD_CLASS}">${escapeHtml(text)}</span>`
  }

  const white = text.slice(0, lastSpace)
  const gold = text.slice(lastSpace + 1)
  return `${escapeHtml(white)} <span class="${SECTION_TITLE_GOLD_CLASS}">${escapeHtml(gold)}</span>`
}

/** Escapa caracteres HTML para montar o título de forma segura. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
