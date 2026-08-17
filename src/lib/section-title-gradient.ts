/**
 * Padrão de títulos de seção:
 * - Todas as palavras em BRANCO, exceto a ÚLTIMA que recebe GRADIENTE DOURADO.
 * - Exceção: quando o texto for exatamente "APROVADO PELA CIÊNCIA", o título
 *   inteiro recebe gradiente dourado.
 *
 * O usuário edita o texto normalmente (string/HTML); o padrão é aplicado
 * automaticamente na renderização por esta função utilitária.
 */

/** Classe utilitária do gradiente dourado aplicado ao título. */
export const SECTION_TITLE_GOLD_CLASS = 'section-title-gold'

/** Normaliza texto removendo tags HTML e espaços extras. */
function plainText(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return (tmp.textContent || tmp.innerText || '').trim()
}

/** Verdadeiro quando o título normalizado é exatamente "APROVADO PELA CIÊNCIA". */
export function isApprovedByScience(title: string): boolean {
  return plainText(title).toUpperCase() === 'APROVADO PELA CIÊNCIA'
}

/**
 * Constrói o HTML de um título aplicando o padrão de gradiente dourado.
 *
 * @param title Título bruto (HTML ou texto simples).
 * @returns HTML com a última palavra (ou todo o título, na exceção)
 *          envolvida por um <span class="section-title-gold">.
 */
export function renderSectionTitleHtml(title: string): string {
  const text = plainText(title)
  if (!text) return ''

  // Exceção: título inteiro com gradiente dourado.
  if (text.toUpperCase() === 'APROVADO PELA CIÊNCIA') {
    return `<span class="${SECTION_TITLE_GOLD_CLASS}">${escapeHtml(text)}</span>`
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
