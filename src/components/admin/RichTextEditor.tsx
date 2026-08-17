import { useRef, useEffect, useCallback, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Pilcrow,
  Sparkles,
  Eraser,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { GRADIENT_OPTIONS, getActiveGradient } from '@/lib/rte-gradients'
import { renderSectionTitleHtml } from '@/lib/section-title-gradient'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  className?: string
  editorLabel?: string
  /**
   * "content" — Open Sans, branco, line-height 1.6 (preview de conteúdo)
   * "title"   — Playfair Display, 40px, bold, dourado (preview de título de seção)
   */
  variant?: 'content' | 'title'
}

interface ActiveState {
  bold: boolean
  italic: boolean
  underline: boolean
  block: string
  foreColor: string
  gradient: string
}

const DEFAULT_ACTIVE: ActiveState = {
  bold: false,
  italic: false,
  underline: false,
  block: 'p',
  foreColor: '',
  gradient: '',
}

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
  const [active, setActive] = useState<ActiveState>(DEFAULT_ACTIVE)
  const [gradientOpen, setGradientOpen] = useState(false)

  // Para a variante "title", aplicamos o padrão automático de títulos de seção
  // (palavras em branco + última palavra com gradiente dourado, ou todo o título
  // dourado quando for "APROVADO PELA CIÊNCIA") apenas na renderização visual,
  // mantendo o valor original editável em `value`/`onChange`.
  const titlePreviewHtml = variant === 'title' && value ? renderSectionTitleHtml(value) : ''

  useEffect(() => {
    const editor = editorRef.current
    if (editor && value !== lastSetValue.current) {
      editor.innerHTML = value || ''
      lastSetValue.current = value || ''
    }
  }, [value])

  useEffect(() => {
    const updateActive = () => {
      const editor = editorRef.current
      if (!editor) return
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) return
      setActive({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        block: (document.queryCommandValue('formatBlock') || 'p').toLowerCase(),
        foreColor: document.queryCommandValue('foreColor') || '',
        gradient: getActiveGradient(editor),
      })
    }
    document.addEventListener('selectionchange', updateActive)
    return () => document.removeEventListener('selectionchange', updateActive)
  }, [])

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

  const exec = useCallback(
    (command: string, val?: string) => {
      restoreSelection()
      document.execCommand(command, false, val)
      if (editorRef.current) {
        lastSetValue.current = editorRef.current.innerHTML
        onChange(editorRef.current.innerHTML)
      }
      editorRef.current?.focus()
    },
    [onChange],
  )

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
      if (editorRef.current) {
        lastSetValue.current = editorRef.current.innerHTML
        onChange(editorRef.current.innerHTML)
      }
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
    if (editorRef.current) {
      lastSetValue.current = editorRef.current.innerHTML
      onChange(editorRef.current.innerHTML)
    }
    setGradientOpen(false)
    editorRef.current?.focus()
  }, [onChange])

  const handleInput = () => {
    if (editorRef.current) {
      lastSetValue.current = editorRef.current.innerHTML
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleBlur = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
    // Safety net: ensure formData reflects current editor content on blur
    if (editorRef.current) {
      lastSetValue.current = editorRef.current.innerHTML
      onChange(editorRef.current.innerHTML)
    }
  }

  const btn = 'h-7 w-7'
  const activeCls = 'bg-accent text-accent-foreground'
  const divider = <div className="w-px h-5 bg-border mx-1" />
  const groupDivider = <div className="w-px h-6 bg-border/60 mx-1.5" />

  return (
    <div className={cn('rounded-md border border-input overflow-visible', className)}>
      <div className="flex items-center gap-0.5 border-b border-input bg-muted/50 p-1.5 flex-wrap">
        {/* Group 1: Basic formatting — headings, inline styles, lists */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(btn, active.block === 'h1' && activeCls)}
          onClick={() => exec('formatBlock', '<h1>')}
          title="Título 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(btn, active.block === 'h2' && activeCls)}
          onClick={() => exec('formatBlock', '<h2>')}
          title="Título 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(btn, active.block === 'h3' && activeCls)}
          onClick={() => exec('formatBlock', '<h3>')}
          title="Título 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(btn, active.block === 'p' && activeCls)}
          onClick={() => exec('formatBlock', '<p>')}
          title="Parágrafo"
        >
          <Pilcrow className="h-3.5 w-3.5" />
        </Button>
        {divider}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(btn, active.bold && activeCls)}
          onClick={() => exec('bold')}
          title="Negrito"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(btn, active.italic && activeCls)}
          onClick={() => exec('italic')}
          title="Itálico"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(btn, active.underline && activeCls)}
          onClick={() => exec('underline')}
          title="Sublinhado"
        >
          <Underline className="h-3.5 w-3.5" />
        </Button>
        {divider}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('insertUnorderedList')}
          title="Lista com marcadores"
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('insertOrderedList')}
          title="Lista numerada"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>

        {/* Group 2: Colors and gradients */}
        {groupDivider}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(btn, active.foreColor && activeCls)}
              title="Cor do texto"
            >
              <Palette
                className="h-3.5 w-3.5"
                style={active.foreColor ? { color: active.foreColor } : undefined}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-1">
              Cores do texto
            </div>
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
                  className="h-6 w-6 rounded-full border border-white/20 transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => exec('foreColor', '#FFFFFF')}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>Restaurar padrão (Branco)</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
        <Popover open={gradientOpen} onOpenChange={setGradientOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(btn, active.gradient && activeCls)}
              title="Gradiente de texto"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-1">
              Gradientes de texto
            </div>
            <div className="grid grid-cols-2 gap-1">
              {GRADIENT_OPTIONS.map((g) => (
                <button
                  key={g.className}
                  type="button"
                  onClick={() => applyGradient(g.className)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                >
                  <span className="h-4 w-4 rounded shrink-0" style={{ background: g.preview }} />
                  <span className="truncate">{g.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={removeGradient}
                className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors text-muted-foreground"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>Remover gradiente</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {editorLabel && (
        <div className="px-3 py-1 text-xs font-medium text-muted-foreground border-b border-border/50 bg-muted/20">
          {editorLabel}
        </div>
      )}
      {variant === 'title' && (
        <div
          aria-hidden
          className="rte-title-preview min-h-[80px] px-3 py-3 border-b border-input/60 bg-muted/20 overflow-visible [&_span.section-title-gold]:!bg-clip-text"
          dangerouslySetInnerHTML={{ __html: titlePreviewHtml }}
        />
      )}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleBlur}
        suppressContentEditableWarning
        className={cn(
          'rte-content-area min-h-[120px] max-h-[400px] overflow-y-auto p-3 pb-6 outline-none prose prose-sm max-w-none',
          variant === 'title'
            ? 'rte-title-preview min-h-[80px]'
            : variant === 'content'
              ? 'rte-content-preview'
              : 'text-sm leading-relaxed',
        )}
        style={
          variant === 'title'
            ? {
                fontFamily: "'Playfair Display', serif",
                fontSize: '40px',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.2,
              }
            : variant === 'content'
              ? {
                  fontFamily: "'Open Sans', sans-serif",
                  color: '#ffffff',
                  lineHeight: 1.6,
                }
              : undefined
        }
      />
    </div>
  )
}
