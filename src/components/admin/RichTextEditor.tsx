import { useRef, useEffect, useCallback } from 'react'
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react'
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

  useEffect(() => {
    if (editorRef.current && !isInternal.current) {
      editorRef.current.innerHTML = value || ''
    }
    isInternal.current = false
  }, [value])

  const exec = useCallback(
    (command: string) => {
      document.execCommand(command, false)
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

  const tools = [
    { icon: Bold, cmd: 'bold' },
    { icon: Italic, cmd: 'italic' },
    { icon: Underline, cmd: 'underline' },
    { icon: List, cmd: 'insertUnorderedList' },
    { icon: ListOrdered, cmd: 'insertOrderedList' },
  ]

  return (
    <div className={cn('rounded-md border border-input overflow-hidden', className)}>
      <div className="flex items-center gap-1 border-b border-input bg-muted/50 p-1.5">
        {tools.map((tool, i) => (
          <div key={tool.cmd}>
            {i === 3 && <div className="w-px h-5 bg-border mx-1" />}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec(tool.cmd)}
            >
              <tool.icon className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        className="min-h-[120px] max-h-[300px] overflow-y-auto p-3 text-sm outline-none prose prose-sm max-w-none"
      />
    </div>
  )
}
