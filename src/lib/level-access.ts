/**
 * Níveis e permissões — Anderson Abreu
 *
 * Regras:
 *  - Sem nivel: usuário recém-cadastrado, sem nenhuma compra. Acesso apenas à FAQ.
 *  - Prata: atribuído exclusivamente por um Administrador. Tem acesso ao "Comece Por Aqui".
 *      Não é promovido automaticamente por compra — o admin mantém o controle.
 *  - Ouro: atribuído automaticamente ao comprar qualquer curso. Vê apenas os cursos que comprou.
 *      Acesso ao "Comece Por Aqui" somente se o admin liberar manualmente (comece_por_aqui_access).
 *  - Diamante: atribuído exclusivamente por um Administrador. Acumula todo o histórico
 *      (cursos comprados como Ouro permanecem acessíveis). Acesso ao "Comece Por Aqui"
 *      somente se o admin liberar manualmente (comece_por_aqui_access).
 */

export type UserLevel = 'Prata' | 'Ouro' | 'Diamante'

/** Valor usado na UI para um usuário sem nível definido (level vazio/ausente). */
export const NO_LEVEL = 'Sem nivel'

const LEVEL_ORDER: Record<string, number> = {
  Prata: 1,
  Ouro: 2,
  Diamante: 3,
}

export function getLevelOrder(level?: string | null): number {
  if (!level) return 0
  return LEVEL_ORDER[level] ?? 0
}

/** Verdadeiro quando o usuário possui um nível atribuído (qualquer um). */
export function hasLevel(level?: string | null): boolean {
  return getLevelOrder(level) > 0
}

/** Verdadeiro para nível Prata. */
export function isPrata(level?: string | null): boolean {
  return level === 'Prata'
}

/** Verdadeiro para nível Ouro. */
export function isOuro(level?: string | null): boolean {
  return level === 'Ouro'
}

/** Verdadeiro para nível Diamante. */
export function isDiamante(level?: string | null): boolean {
  return level === 'Diamante'
}

/**
 * Acesso à Comunidade: disponível para Ouro e Diamante.
 * Usuários sem nível ou Prata não têm acesso.
 */
export function canAccessCommunity(level?: string | null): boolean {
  return getLevelOrder(level) >= LEVEL_ORDER.Ouro
}

/**
 * Acesso ao módulo "Comece Por Aqui":
 *  - Prata: sempre (é o nível que libera o módulo por padrão).
 *  - Ouro / Diamante: somente se o administrador liberou manualmente
 *    (flag comece_por_aqui_access = true).
 *  - Sem nivel: nunca.
 */
export function canAccessComecePorAqui(
  level?: string | null,
  comecePorAquiAccess?: boolean | null,
): boolean {
  if (level === 'Prata') return true
  if (level === 'Ouro' || level === 'Diamante') return !!comecePorAquiAccess
  return false
}

/**
 * Se o toggle de "liberar Comece Por Aqui" deve aparecer para este aluno no
 * painel administrativo. Disponível apenas para Ouro e Diamante (Prata já tem
 * acesso por padrão; Sem nivel não faz sentido até ter um nível).
 */
export function canManuallyReleaseComecePorAqui(level?: string | null): boolean {
  return level === 'Ouro' || level === 'Diamante'
}

/**
 * Acesso a um curso pelo seu `level` (Prata/Ouro/Diamante/all).
 * Regra de visibilidade da lista de cursos pública — independe de compras
 * individuais (user_access), que são verificadas à parte.
 */
export function canAccessCourse(
  courseLevel: string | undefined | null,
  userLevel: string | undefined | null,
): boolean {
  if (!courseLevel || courseLevel === 'all') return true
  return getLevelOrder(userLevel) >= getLevelOrder(courseLevel)
}

/** Rótulo legível para exibição do nível (ou "Sem nivel"). */
export function getLevelLabel(level?: string | null): string {
  if (!level) return NO_LEVEL
  return LEVEL_ORDER[level] ? level : NO_LEVEL
}
