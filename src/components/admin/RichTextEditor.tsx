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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  className?: string
}

interface ActiveState {
  bold: boolean
  italic: boolean
  underline: boolean
  block: string
  foreColor: string
}

const DEFAULT_ACTIVE: ActiveState = {
  bold: false,
  italic: false,
  underline: false,
  block: 'p',
  foreColor: '',
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternal = useRef(false)
  const savedRange = useRef<Range | null>(null)
  const [active, setActive] = useState<ActiveState>(DEFAULT_ACTIVE)

  useEffect(() => {
    if (editorRef.current && !isInternal.current) {
      editorRef.current.innerHTML = value || ''
    }
    isInternal.current = false
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
        isInternal.current = true
        onChange(editorRef.current.innerHTML)
      }
      editorRef.current?.focus()
    },
    [onChange],
  )

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
  const activeCls = 'bg-accent text-accent-foreground'

  return (
    <div className={cn('rounded-md border border-input overflow-visible', className)}>
      <div className="flex items-center gap-1 border-b border-input bg-muted/50 p-1.5 flex-wrap">
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
        <div className="w-px h-5 bg-border mx-1" />
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
        <div className="w-px h-5 bg-border mx-1" />
        <label
          className="h-7 w-7 flex items-center justify-center cursor-pointer rounded hover:bg-accent relative"
          title="Cor do texto"
        >
          <Palette
            className="h-3.5 w-3.5"
            style={active.foreColor ? { color: active.foreColor } : undefined}
          />
          <input
            type="color"
            className="absolute opacity-0 inset-0 cursor-pointer"
            onChange={(e) => exec('foreColor', e.target.value)}
          />
        </label>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleBlur}
        suppressContentEditableWarning
        className="rte-content-area min-h-[120px] max-h-[400px] overflow-y-auto p-3 pb-6 text-sm outline-none prose prose-sm max-w-none leading-relaxed"
      />
    </div>
  )
}
