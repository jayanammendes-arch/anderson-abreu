export interface GradientOption {
  className: string
  label: string
  preview: string
}

export const GRADIENT_OPTIONS: GradientOption[] = [
  {
    className: 'rte-gradient-gold',
    label: 'Dourado',
    preview: 'linear-gradient(135deg, #8B7620, #B8960C, #A68A26)',
  },
  {
    className: 'rte-gradient-blue',
    label: 'Azul',
    preview: 'linear-gradient(135deg, #0E1D2F, #1F3552)',
  },
  {
    className: 'rte-gradient-purple',
    label: 'Roxo',
    preview: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  },
  {
    className: 'rte-gradient-green',
    label: 'Verde',
    preview: 'linear-gradient(135deg, #059669, #10b981)',
  },
  {
    className: 'rte-gradient-rose',
    label: 'Rosa',
    preview: 'linear-gradient(135deg, #e11d48, #f43f5e)',
  },
  {
    className: 'rte-gradient-sunset',
    label: 'Pôr do Sol',
    preview: 'linear-gradient(135deg, #f97316, #ec4899)',
  },
  {
    className: 'rte-gradient-ocean',
    label: 'Oceano',
    preview: 'linear-gradient(135deg, #0E1D2F, #1F3552)',
  },
  {
    className: 'rte-gradient-royal',
    label: 'Royal',
    preview: 'linear-gradient(135deg, #0E1D2F, #1F3552)',
  },
]

export function getActiveGradient(editor: HTMLElement | null): string {
  if (!editor) return ''
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return ''
  let node: Node | null = sel.anchorNode
  if (!node || !editor.contains(node)) return ''
  while (node && node !== editor) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      for (const g of GRADIENT_OPTIONS) {
        if (el.classList.contains(g.className)) return g.className
      }
    }
    node = node.parentNode
  }
  return ''
}
