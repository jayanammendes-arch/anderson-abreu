import React, { useRef, useEffect, useCallback, useState } from 'react'
import {
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Plus,
  Sparkles,
  Eraser,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { GRADIENT_OPTIONS, getActiveGradient } from '@/lib/rte-gradients'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  className?: string
  editorLabel?: string
  /**
   * "content" — Open Sans, 18px starting point
   * "title"   — Playfair Display, 40px, bold, starting point
   */
  variant?: 'content' | 'title'
}

interface ActiveState {
  bold: boolean
  italic: boolean
  underline: boolean
  strikethrough: boolean
  align: 'left' | 'center' | 'right' | 'justify'
  foreColor: string
  gradient: string
  fontFamily: string
  fontSize: number
}

const FONT_FAMILIES = [
  { label: 'Open Sans', value: "'Open Sans', sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
]

export function RichTextEditor({
  value,
  onChange,
  className,
  editorLabel,
  variant,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const lastSetValue = useRef<string>('')
  const savedRange = useRef<Range | null>(null)
  // True while the font size input is focused (user is typing a value in it).
  // While focused, selectionchange must NOT overwrite fontSizeInput from the DOM,
  // otherwise the value the user just typed is replaced by the cursor's font size.
  const fontSizeInputFocused = useRef<boolean>(false)
  // One-shot guard set right after a font size is applied via the toolbar. The
  // apply moves focus to the editor (blurring the input) and then a selectionchange
  // fires whose anchor often lands just outside the freshly-created span, reading
  // the default size. That next sync must be skipped so the typed value survives.
  const skipNextFontSizeSync = useRef<boolean>(false)

  // Default font size depending on variant
  const defaultFontSize = variant === 'title' ? 40 : 18
  const defaultFontFamily =
    variant === 'title' ? "'Playfair Display', serif" : "'Open Sans', sans-serif"

  const [active, setActive] = useState<ActiveState>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    align: 'left',
    foreColor: '',
    gradient: '',
    fontFamily: defaultFontFamily,
    fontSize: defaultFontSize,
  })

  const [gradientOpen, setGradientOpen] = useState(false)
  const [fontSizeInput, setFontSizeInput] = useState<string>(defaultFontSize.toString())

  useEffect(() => {
    const editor = editorRef.current
    if (editor && value !== lastSetValue.current) {
      editor.innerHTML = value || ''
      lastSetValue.current = value || ''
    }
  }, [value])

  // Helper to extract styled font size or family from selection anchor.
  // Faz o walker a partir do anchorNode até o editor lendo estilos inline; se
  // nada for encontrado (seleção no editor vazio ou cursor em texto sem span),
  // cai no getComputedStyle do próprio editor (default) — assim o campo nunca
  // aparece "zerado".
  const updateActiveState = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) return

    let currentFontSize = defaultFontSize
    let currentFontFamily = defaultFontFamily
    let currentAlign: 'left' | 'center' | 'right' | 'justify' = 'left'

    let foundInlineSize = false
    let foundInlineFamily = false

    let node: Node | null = sel.anchorNode
    while (node && node !== editor) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        if (!foundInlineSize && el.style.fontSize) {
          const parsed = parseInt(el.style.fontSize, 10)
          if (!isNaN(parsed)) {
            currentFontSize = parsed
            foundInlineSize = true
          }
        }
        if (!foundInlineFamily && el.style.fontFamily) {
          currentFontFamily = el.style.fontFamily
          foundInlineFamily = true
        }
        if (el.style.textAlign) {
          const alignVal = el.style.textAlign.toLowerCase()
          if (['left', 'center', 'right', 'justify'].includes(alignVal)) {
            currentAlign = alignVal as any
          }
        }
      }
      node = node.parentNode
    }

    // Fallback: se nenhum estilo inline foi encontrado, lemos o estilo
    // computado do editor (que carrega os defaults do variant) para que o
    // input de tamanho/família mostre o valor real em vez de ficar vazio.
    if (!foundInlineSize) {
      const computed = window.getComputedStyle(editor).fontSize
      const parsed = parseInt(computed, 10)
      if (!isNaN(parsed)) currentFontSize = parsed
    }
    if (!foundInlineFamily) {
      const computed = window.getComputedStyle(editor).fontFamily
      if (computed) currentFontFamily = computed
    }

    // Also check queryCommandState/Value for align
    if (document.queryCommandState('justifyCenter')) currentAlign = 'center'
    else if (document.queryCommandState('justifyRight')) currentAlign = 'right'
    else if (document.queryCommandState('justifyFull')) currentAlign = 'justify'
    else if (document.queryCommandState('justifyLeft')) currentAlign = 'left'

    setActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikethrough'),
      align: currentAlign,
      foreColor: document.queryCommandValue('foreColor') || '',
      gradient: getActiveGradient(editor),
      fontFamily: currentFontFamily,
      fontSize: currentFontSize,
    })
    // Only sync the input from the DOM when the user is NOT actively typing in it
    // and we are not in the suppression window right after a toolbar apply.
    if (!fontSizeInputFocused.current && !skipNextFontSizeSync.current) {
      setFontSizeInput(currentFontSize.toString())
    } else if (skipNextFontSizeSync.current) {
      skipNextFontSizeSync.current = false
    }
  }, [defaultFontSize, defaultFontFamily])

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveState)
    return () => document.removeEventListener('selectionchange', updateActiveState)
  }, [updateActiveState])

  const saveCurrentSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
  }

  const restoreSelection = () => {
    if (savedRange.current && editorRef.current) {
      editorRef.current.focus()
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        try {
          sel.addRange(savedRange.current)
        } catch {
          savedRange.current = null
        }
      }
    }
  }

  const notifyChange = () => {
    if (editorRef.current) {
      lastSetValue.current = editorRef.current.innerHTML
      onChange(editorRef.current.innerHTML)
    }
  }

  const exec = useCallback(
    (command: string, val?: string) => {
      restoreSelection()
      document.execCommand(command, false, val)
      notifyChange()
      editorRef.current?.focus()
    },
    [onChange],
  )

  // Custom inline style wrapper for Font Size and Font Family
  const applyCustomSpanStyle = useCallback(
    (styleProp: 'fontSize' | 'fontFamily', styleValue: string) => {
      restoreSelection()
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return

      const range = sel.getRangeAt(0)
      if (range.collapsed) {
        // If no text selected, focus back
        editorRef.current?.focus()
        return
      }

      const span = document.createElement('span')
      span.style[styleProp] = styleValue

      try {
        range.surroundContents(span)
      } catch {
        const contents = range.extractContents()
        span.appendChild(contents)
        range.insertNode(span)
      }

      notifyChange()
      editorRef.current?.focus()
    },
    [onChange],
  )

  const FONT_SIZE_MIN = 5
  const FONT_SIZE_MAX = 200

  const clampFontSize = (size: number) => Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, size))

  /**
   * Aplica o tamanho da fonte à seleção salva no editor SEM roubar o foco do
   * input (diferente do applyCustomSpanStyle, que move o foco para o editor).
   * Usado a cada tecla digitada no campo de tamanho, para que o tamanho reaja
   * imediatamente enquanto o usuário continua digitando. Atualiza a seleção
   * salva para envolver o span recém-criado; se a seleção já envolve um span
   * de font-size criado pela tecla anterior, atualiza o valor in-place em vez
   * de aninhar spans.
   */
  const applyFontSizeToSavedRange = (size: number) => {
    const range = savedRange.current
    if (!range || range.collapsed) return

    const ancestor = range.commonAncestorContainer
    if (
      ancestor.nodeType === Node.ELEMENT_NODE &&
      (ancestor as HTMLElement).tagName === 'SPAN' &&
      (ancestor as HTMLElement).style.fontSize
    ) {
      ;(ancestor as HTMLElement).style.fontSize = `${size}px`
      notifyChange()
      return
    }

    const span = document.createElement('span')
    span.style.fontSize = `${size}px`
    try {
      range.surroundContents(span)
    } catch {
      const contents = range.extractContents()
      span.appendChild(contents)
      range.insertNode(span)
    }

    const newRange = document.createRange()
    newRange.selectNodeContents(span)
    savedRange.current = newRange
    notifyChange()
  }

  const handleFontSizeChange = (newSize: number) => {
    const clamped = clampFontSize(newSize)
    setFontSizeInput(clamped.toString())
    setActive((prev) => ({ ...prev, fontSize: clamped }))
    // After applying, a selectionchange fires that may read a stale/adjacent
    // size; suppress the next DOM-driven input sync so the value survives.
    skipNextFontSizeSync.current = true

    // Se há uma seleção de texto salva, aplicamos o tamanho a ela preservando o
    // foco (sem roubar do input) e re-selecionamos o span estilizado, de modo
    // que cliques consecutivos em +/- continuem ajustando o MESMO trecho —
    // igual ao comportamento do Canva.
    if (savedRange.current && !savedRange.current.collapsed) {
      applyFontSizeToSavedRange(clamped)
      const sel = window.getSelection()
      if (sel && savedRange.current) {
        sel.removeAllRanges()
        try {
          sel.addRange(savedRange.current)
        } catch {
          /* noop */
        }
      }
      return
    }

    // Cursor colapsado (sem seleção): tenta expandir para o bloco de texto
    // atual (a "palavra"/linha onde o cursor está) para que +/- tenha efeito
    // visível mesmo sem o usuário ter selecionado nada previamente.
    const editor = editorRef.current
    if (editor) {
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
        let n: Node | null = sel.anchorNode
        while (n && n !== editor) {
          if (n.nodeType === Node.ELEMENT_NODE) {
            const r = document.createRange()
            try {
              r.selectNodeContents(n)
              savedRange.current = r
              applyFontSizeToSavedRange(clamped)
              const sel2 = window.getSelection()
              if (sel2 && savedRange.current) {
                sel2.removeAllRanges()
                try {
                  sel2.addRange(savedRange.current)
                } catch {
                  /* noop */
                }
              }
              return
            } catch {
              /* noop */
            }
          }
          n = n.parentNode
        }
      }
    }
    // Último recurso: aplica via applyCustomSpanStyle (que move o foco p/ o editor).
    applyCustomSpanStyle('fontSize', `${clamped}px`)
  }

  const handleFontFamilyChange = (val: string) => {
    setActive((prev) => ({ ...prev, fontFamily: val }))
    // Mesma lógica do handleFontSizeChange: se há seleção salva, aplica ao
    // trecho e re-seleciona, preservando o foco (comportamento Canva-like).
    if (savedRange.current && !savedRange.current.collapsed) {
      const range = savedRange.current
      const ancestor = range.commonAncestorContainer
      if (ancestor.nodeType === Node.ELEMENT_NODE && (ancestor as HTMLElement).tagName === 'SPAN') {
        ;(ancestor as HTMLElement).style.fontFamily = val
        notifyChange()
        return
      }
      const span = document.createElement('span')
      span.style.fontFamily = val
      try {
        range.surroundContents(span)
      } catch {
        const contents = range.extractContents()
        span.appendChild(contents)
        range.insertNode(span)
      }
      const newRange = document.createRange()
      newRange.selectNodeContents(span)
      savedRange.current = newRange
      notifyChange()
      const sel = window.getSelection()
      if (sel && savedRange.current) {
        sel.removeAllRanges()
        try {
          sel.addRange(savedRange.current)
        } catch {
          /* noop */
        }
      }
      return
    }
    applyCustomSpanStyle('fontFamily', val)
  }

  const handleCaseToggle = () => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return

    const range = sel.getRangeAt(0)
    const container = document.createElement('div')
    container.appendChild(range.cloneContents())
    const currentText = container.textContent || ''

    if (!currentText) return

    // Check if fully uppercase -> convert to lowercase, else uppercase
    const isUpper =
      currentText === currentText.toUpperCase() && currentText !== currentText.toLowerCase()
    const transformedText = isUpper ? currentText.toLowerCase() : currentText.toUpperCase()

    // Replace selection contents with transformed text
    range.deleteContents()
    const textNode = document.createTextNode(transformedText)
    range.insertNode(textNode)

    // Select the newly inserted text
    const newRange = document.createRange()
    newRange.selectNode(textNode)
    sel.removeAllRanges()
    sel.addRange(newRange)
    savedRange.current = newRange.cloneRange()

    notifyChange()
    editorRef.current?.focus()
  }

  const applyGradient = useCallback(
    (gradientClass: string) => {
      restoreSelection()
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return
      const range = sel.getRangeAt(0)
      if (range.collapsed) return
      const span = document.createElement('span')
      span.className = gradientClass
      try {
        range.surroundContents(span)
      } catch {
        const contents = range.extractContents()
        span.appendChild(contents)
        range.insertNode(span)
      }
      notifyChange()
      setGradientOpen(false)
      editorRef.current?.focus()
    },
    [onChange],
  )

  const removeGradient = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    let node: Node | null = sel.anchorNode
    const editor = editorRef.current
    if (!editor) return
    while (node && node !== editor) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        if (GRADIENT_OPTIONS.some((g) => el.classList.contains(g.className))) {
          const parent = el.parentNode
          if (parent) {
            while (el.firstChild) parent.insertBefore(el.firstChild, el)
            parent.removeChild(el)
          }
          break
        }
      }
      node = node.parentNode
    }
    notifyChange()
    setGradientOpen(false)
    editorRef.current?.focus()
  }, [onChange])

  const handleInput = () => {
    notifyChange()
  }

  const handleBlur = () => {
    saveCurrentSelection()
    notifyChange()
  }

  const handleMouseDownToolbar = (e: React.MouseEvent) => {
    // Keep selection alive when clicking buttons in toolbar
    const target = e.target as HTMLElement
    if (target.tagName !== 'INPUT') {
      saveCurrentSelection()
    }
  }

  // Get font family standard label for select trigger
  const selectedFontObj =
    FONT_FAMILIES.find(
      (f) =>
        f.value === active.fontFamily || f.value.includes(active.fontFamily.replace(/['"]/g, '')),
    ) || FONT_FAMILIES[0]

  return (
    <div
      className={cn('rounded-xl border border-[#27272a] bg-[#121214] overflow-visible', className)}
    >
      {/* CANVA STYLE TOOLBAR */}
      <div
        className="flex items-center gap-1.5 p-1.5 bg-[#18181b] border-b border-[#27272a] rounded-t-xl overflow-x-auto select-none no-scrollbar"
        onMouseDown={handleMouseDownToolbar}
      >
        {/* 1. FONT FAMILY DROPDOWN */}
        <Select value={selectedFontObj.value} onValueChange={(val) => handleFontFamilyChange(val)}>
          <SelectTrigger
            className="h-8 w-[130px] sm:w-[145px] bg-[#27272a]/60 border-[#3f3f46] text-white text-xs font-medium rounded-lg px-2.5 focus:ring-1 focus:ring-purple-500 hover:bg-[#27272a] transition-colors shrink-0"
            onFocus={saveCurrentSelection}
          >
            <SelectValue>{selectedFontObj.label}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#18181b] border-[#27272a] text-white">
            {FONT_FAMILIES.map((font) => (
              <SelectItem
                key={font.value}
                value={font.value}
                className="text-xs hover:bg-[#27272a] focus:bg-[#27272a] cursor-pointer"
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 2. FONT SIZE CONTROLLER (- NUM +) */}
        <div className="flex items-center bg-[#27272a]/60 border border-[#3f3f46] rounded-lg h-8 px-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-300 hover:text-white hover:bg-[#3f3f46]/60 rounded-md p-0"
            onClick={() => handleFontSizeChange(active.fontSize - 1)}
            title="Diminuir tamanho da fonte"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <input
            type="number"
            value={fontSizeInput}
            onFocus={() => {
              fontSizeInputFocused.current = true
              saveCurrentSelection()
            }}
            onChange={(e) => {
              const raw = e.target.value
              // Permite campo vazio enquanto o usuário apaga para digitar um novo valor.
              if (raw === '') {
                setFontSizeInput('')
                return
              }
              const parsed = parseInt(raw, 10)
              if (isNaN(parsed)) return
              const clamped = clampFontSize(parsed)
              setFontSizeInput(String(clamped))
              setActive((prev) => ({ ...prev, fontSize: clamped }))
              skipNextFontSizeSync.current = true
              applyFontSizeToSavedRange(clamped)
            }}
            onBlur={() => {
              fontSizeInputFocused.current = false
              const val = parseInt(fontSizeInput, 10)
              if (!isNaN(val)) handleFontSizeChange(val)
              else setFontSizeInput(active.fontSize.toString())
            }}
            className="w-9 h-6 bg-transparent text-center text-xs font-semibold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-300 hover:text-white hover:bg-[#3f3f46]/60 rounded-md p-0"
            onClick={() => handleFontSizeChange(active.fontSize + 1)}
            title="Aumentar tamanho da fonte"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* 3. COLOR PICKER (A with rainbow underline) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-lg relative hover:bg-[#27272a] text-white shrink-0',
                active.foreColor && 'bg-[#27272a]',
              )}
              title="Cor do texto"
              onMouseDown={saveCurrentSelection}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="font-serif font-bold text-sm leading-none">A</span>
                <div
                  className="w-3.5 h-[3px] rounded-full mt-0.5"
                  style={{
                    background:
                      active.foreColor ||
                      'linear-gradient(to right, #ef4444, #eab308, #3b82f6, #a855f7)',
                  }}
                />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 bg-[#18181b] border-[#27272a]" align="start">
            <div className="text-xs font-semibold text-zinc-400 mb-2 px-1">Cores do texto</div>
            <div className="grid grid-cols-7 gap-1.5">
              {[
                { name: 'Azul Royal', value: '#0047AB' },
                { name: 'Azul Escuro', value: '#0B1D3A' },
                { name: 'Azul Céu', value: '#0EA5E9' },
                { name: 'Dourado', value: '#C59A2A' },
                { name: 'Verde Esmeralda', value: '#10B981' },
                { name: 'Verde Escuro', value: '#065F46' },
                { name: 'Vermelho', value: '#DC2626' },
                { name: 'Roxo', value: '#7C3AED' },
                { name: 'Rosa', value: '#EC4899' },
                { name: 'Laranja', value: '#EA580C' },
                { name: 'Marrom', value: '#78350F' },
                { name: 'Cinza', value: '#4B5563' },
                { name: 'Preto', value: '#111827' },
                { name: 'Branco', value: '#FFFFFF' },
              ].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => exec('foreColor', c.value)}
                  className="h-6 w-6 rounded-full border border-white/20 transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-[#27272a] flex items-center justify-between">
              <button
                type="button"
                onClick={() => exec('foreColor', '#FFFFFF')}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>Restaurar padrão (Branco)</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* 4. GRADIENT PICKER (Sparkles) */}
        <Popover open={gradientOpen} onOpenChange={setGradientOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-lg hover:bg-[#27272a] text-white shrink-0',
                active.gradient && 'bg-[#6366f1]/30 text-purple-300',
              )}
              title="Gradiente de texto"
              onMouseDown={saveCurrentSelection}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 bg-[#18181b] border-[#27272a]" align="start">
            <div className="text-xs font-semibold text-zinc-400 mb-2 px-1">Gradientes de texto</div>
            <div className="grid grid-cols-2 gap-1">
              {GRADIENT_OPTIONS.map((g) => (
                <button
                  key={g.className}
                  type="button"
                  onClick={() => applyGradient(g.className)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-[#27272a] text-white transition-colors"
                >
                  <span className="h-4 w-4 rounded shrink-0" style={{ background: g.preview }} />
                  <span className="truncate">{g.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-[#27272a]">
              <button
                type="button"
                onClick={removeGradient}
                className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs hover:bg-[#27272a] transition-colors text-zinc-400 hover:text-white"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>Remover gradiente</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* 5. INLINE FORMATTING BUTTONS (B, I, U, S, aA) */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg font-bold text-sm text-zinc-300 hover:text-white hover:bg-[#27272a]',
              active.bold &&
                'bg-[#6366f1]/30 text-purple-300 hover:bg-[#6366f1]/40 hover:text-purple-200',
            )}
            onClick={() => exec('bold')}
            title="Negrito"
          >
            B
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg italic text-sm text-zinc-300 hover:text-white hover:bg-[#27272a]',
              active.italic &&
                'bg-[#6366f1]/30 text-purple-300 hover:bg-[#6366f1]/40 hover:text-purple-200',
            )}
            onClick={() => exec('italic')}
            title="Itálico"
          >
            I
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg underline text-sm text-zinc-300 hover:text-white hover:bg-[#27272a]',
              active.underline &&
                'bg-[#6366f1]/30 text-purple-300 hover:bg-[#6366f1]/40 hover:text-purple-200',
            )}
            onClick={() => exec('underline')}
            title="Sublinhado"
          >
            U
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg text-zinc-300 hover:text-white hover:bg-[#27272a]',
              active.strikethrough &&
                'bg-[#6366f1]/30 text-purple-300 hover:bg-[#6366f1]/40 hover:text-purple-200',
            )}
            onClick={() => exec('strikethrough')}
            title="Tachado"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#27272a]"
            onClick={handleCaseToggle}
            title="Alternar maiúsculas/minúsculas (aA)"
          >
            <span className="font-sans">aA</span>
          </Button>
        </div>

        {/* 6. TEXT ALIGNMENT POPPER OR BUTTONS */}
        <div className="flex items-center gap-0.5 shrink-0 border-l border-[#27272a] pl-1.5 ml-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg text-zinc-300 hover:text-white hover:bg-[#27272a]',
              active.align === 'left' && 'bg-[#27272a] text-white',
            )}
            onClick={() => exec('justifyLeft')}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg text-zinc-300 hover:text-white hover:bg-[#27272a]',
              active.align === 'center' && 'bg-[#27272a] text-white',
            )}
            onClick={() => exec('justifyCenter')}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg text-zinc-300 hover:text-white hover:bg-[#27272a]',
              active.align === 'right' && 'bg-[#27272a] text-white',
            )}
            onClick={() => exec('justifyRight')}
            title="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg text-zinc-300 hover:text-white hover:bg-[#27272a]',
              active.align === 'justify' && 'bg-[#27272a] text-white',
            )}
            onClick={() => exec('justifyFull')}
            title="Justificar"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {editorLabel && (
        <div className="px-3 py-1 text-xs font-medium text-zinc-400 border-b border-[#27272a] bg-[#18181b]/50">
          {editorLabel}
        </div>
      )}

      {/* CONTENT EDITABLE AREA */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleBlur}
        suppressContentEditableWarning
        className={cn(
          'rte-content-area min-h-[120px] max-h-[400px] overflow-y-auto p-4 outline-none text-white leading-relaxed',
          variant === 'title'
            ? 'rte-title-preview min-h-[80px]'
            : variant === 'content'
              ? 'rte-content-preview'
              : 'text-sm',
        )}
        style={{
          fontFamily: defaultFontFamily,
          fontSize: `${defaultFontSize}px`,
        }}
      />
    </div>
  )
}
