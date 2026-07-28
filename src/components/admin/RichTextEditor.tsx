import { useRef, useEffect, useCallback } from 'react'
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

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternal = useRef(false)
  const savedRange = useRef<Range | null>(null)

  useEffect(() => {
    if (editorRef.current && !isInternal.current) {
      editorRef.current.innerHTML = value || ''
    }
    isInternal.current = false
  }, [value])

  const exec = useCallback(
    (command: string, val?: string) => {
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

  const fontSizes = [
    { value: '2', label: 'Pequeno' },
    { value: '3', label: 'Normal' },
    { value: '4', label: 'Médio' },
    { value: '5', label: 'Grande' },
    { value: '6', label: 'Maior' },
    { value: '7', label: 'Enorme' },
  ]

  const btnClass = 'h-7 w-7'

  return (
    <div className={cn('rounded-md border border-input overflow-hidden', className)}>
      <div className="flex items-center gap-1 border-b border-input bg-muted/50 p-1.5 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => exec('formatBlock', '<h1>')}
          title="Título 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => exec('formatBlock', '<h2>')}
          title="Título 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => exec('formatBlock', '<h3>')}
          title="Título 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass}
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
          className={btnClass}
          onClick={() => exec('bold')}
          title="Negrito"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => exec('italic')}
          title="Itálico"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => exec('underline')}
          title="Sublinhado"
        >
          <Underline className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
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
          {fontSizes.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
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
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => exec('insertUnorderedList')}
          title="Lista com marcadores"
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass}
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
