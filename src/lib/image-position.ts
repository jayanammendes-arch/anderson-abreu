const CSS_POSITION_MAP: Record<string, string> = {
  top: 'top',
  center: 'center',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'center-left': 'center left',
  'center-right': 'center right',
}

export function getImagePositionCss(value?: string): string {
  if (!value) return 'center'
  return CSS_POSITION_MAP[value] || 'center'
}

export function getCropPositionCss(cropX?: number, cropY?: number): string {
  const x = typeof cropX === 'number' && cropX >= 0 && cropX <= 1 ? cropX : 0.5
  const y = typeof cropY === 'number' && cropY >= 0 && cropY <= 1 ? cropY : 0.5
  return `${x * 100}% ${y * 100}%`
}

export const IMAGE_POSITION_OPTIONS = [
  { value: 'top', label: 'Topo', css: 'top' },
  { value: 'center', label: 'Centro', css: 'center' },
  { value: 'bottom', label: 'Baixo', css: 'bottom' },
  { value: 'left', label: 'Esquerda', css: 'left' },
  { value: 'right', label: 'Direita', css: 'right' },
  { value: 'center-left', label: 'Centro-esquerda', css: 'center left' },
  { value: 'center-right', label: 'Centro-direita', css: 'center right' },
] as const
