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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sparkles,
  Type,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  className?: string
}

const FONT_FAMILIES = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
]

const FONT_SIZES = [
  { value: '2', label: 'Pequeno' },
  { value: '3', label: 'Normal' },
  { value: '4', label: 'Médio' },
  { value: '5', label: 'Grande' },
  { value: '6', label: 'Maior' },
  { value: '7', label: 'Enorme' },
]

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternal = useRef(false)
  const savedRange = useRef<Range | null>(null)
  const [gradStart, setGradStart] = useState('#3b82f6')
  const [gradEnd, setGradEnd] = useState('#22c55e')
  const [showGradient, setShowGradient] = useState(false)

  useEffect(() => {
    if (editorRef.current && !isInternal.current) {
      editorRef.current.innerHTML = value || ''
    }
    isInternal.current = false
  }, [value])

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
        isInternal.current = true
        onChange(editorRef.current.innerHTML)
      }
      editorRef.current?.focus()
    },
    [onChange],
  )

  const applyGradient = () => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !editorRef.current) return
    const range = sel.getRangeAt(0)
    const span = document.createElement('span')
    span.style.cssText = `background: linear-gradient(135deg, ${gradStart}, ${gradEnd}); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;`
    try {
      span.appendChild(range.extractContents())
      range.insertNode(span)
      isInternal.current = true
      onChange(editorRef.current.innerHTML)
    } catch {
      /* selection spans incompatible nodes */
    }
    sel.removeAllRanges()
    editorRef.current.focus()
  }

  const handleInput = () => {
    if (editorRef.current) {
      isInternal.current = true
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleBlur = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
  }

  const btn = 'h-7 w-7'

  return (
    <div className={cn('rounded-md border border-input overflow-hidden', className)}>
      <div className="flex items-center gap-1 border-b border-input bg-muted/50 p-1.5 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('formatBlock', '<h1>')}
          title="Título 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('formatBlock', '<h2>')}
          title="Título 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('formatBlock', '<h3>')}
          title="Título 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('formatBlock', '<p>')}
          title="Parágrafo"
        >
          <Pilcrow className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('bold')}
          title="Negrito"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('italic')}
          title="Itálico"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('underline')}
          title="Sublinhado"
        >
          <Underline className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <div className="flex items-center gap-1">
          <Type className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            className="h-7 rounded border border-input bg-background text-xs px-1 outline-none cursor-pointer"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                exec('fontName', e.target.value)
                e.target.value = ''
              }
            }}
            title="Fonte"
          >
            <option value="">Fonte</option>
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <select
          className="h-7 rounded border border-input bg-background text-xs px-1 outline-none cursor-pointer"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              exec('fontSize', e.target.value)
              e.target.value = ''
            }
          }}
          title="Tamanho da fonte"
        >
          <option value="">Tamanho</option>
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('justifyLeft')}
          title="Alinhar à esquerda"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('justifyCenter')}
          title="Centralizar"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('justifyRight')}
          title="Alinhar à direita"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btn}
          onClick={() => exec('justifyFull')}
          title="Justificar"
        >
          <AlignJustify className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <label
          className="h-7 w-7 flex items-center justify-center cursor-pointer rounded hover:bg-accent relative"
          title="Cor do texto"
        >
          <Palette className="h-3.5 w-3.5" />
          <input
            type="color"
            className="absolute opacity-0 inset-0 cursor-pointer"
            onChange={(e) => exec('foreColor', e.target.value)}
          />
        </label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(btn, showGradient && 'bg-accent')}
          onClick={() => setShowGradient(!showGradient)}
          title="Texto com gradiente"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
        {showGradient && (
          <div className="flex items-center gap-1 ml-1">
            <input
              type="color"
              value={gradStart}
              onChange={(e) => setGradStart(e.target.value)}
              className="h-7 w-7 rounded border border-input cursor-pointer"
              title="Cor inicial"
            />
            <input
              type="color"
              value={gradEnd}
              onChange={(e) => setGradEnd(e.target.value)}
              className="h-7 w-7 rounded border border-input cursor-pointer"
              title="Cor final"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={applyGradient}
            >
              Aplicar
            </Button>
          </div>
        )}
        <div className="w-px h-5 bg-border mx-1" />
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
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleBlur}
        suppressContentEditableWarning
        className="min-h-[120px] max-h-[300px] overflow-y-auto p-3 text-sm outline-none prose prose-sm max-w-none"
      />
    </div>
  )
}
