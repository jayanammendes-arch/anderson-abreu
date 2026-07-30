import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import type { FormQuestion } from '@/types'
import { SHUFFLE_TYPES, OTHER_TYPES } from '@/lib/question-types'

interface Props {
  question: FormQuestion
  onChange: (patch: Partial<FormQuestion>) => void
}

export function QuestionOptionsEditor({ question, onChange }: Props) {
  const options = question.options || []
  const showShuffle = SHUFFLE_TYPES.includes(question.question_type)
  const showOther = OTHER_TYPES.includes(question.question_type)

  const move = (i: number, dir: number) => {
    const j = i + dir
    if (j < 0 || j >= options.length) return
    const next = [...options]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange({ options: next })
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs">Opções</Label>
      {options.map((opt, i) => (
        <div key={i} className="flex gap-1 items-center">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => move(i, -1)}
            disabled={i === 0}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => move(i, 1)}
            disabled={i === options.length - 1}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
          <Input
            value={opt}
            onChange={(e) => {
              const n = [...options]
              n[i] = e.target.value
              onChange({ options: n })
            }}
            placeholder={`Opção ${i + 1}`}
            className="h-8"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onChange({ options: options.filter((_, idx) => idx !== i) })}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onChange({ options: [...options, ''] })}
      >
        <Plus className="mr-1 h-3 w-3" /> Adicionar opção
      </Button>
      {showShuffle && (
        <div className="flex items-center gap-2 pt-1">
          <Switch
            checked={question.shuffle_options || false}
            onCheckedChange={(c) => onChange({ shuffle_options: c })}
          />
          <Label className="text-xs">Embaralhar opções</Label>
        </div>
      )}
      {showOther && (
        <div className="flex items-center gap-2">
          <Switch
            checked={question.has_other || false}
            onCheckedChange={(c) => onChange({ has_other: c })}
          />
          <Label className="text-xs">Adicionar opção "Outro"</Label>
        </div>
      )}
    </div>
  )
}
