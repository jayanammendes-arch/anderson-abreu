import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FormQuestion } from '@/types'

interface Props {
  question: FormQuestion
  answer?: string | string[] | number
  otherValue?: string
  onAnswer: (val: string | string[] | number) => void
  onOtherChange: (val: string) => void
}

function shuffleArray<T>(arr: T[]): T[] {
  const n = [...arr]
  for (let i = n.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[n[i], n[j]] = [n[j], n[i]]
  }
  return n
}

export function FormQuestionInput({
  question: q,
  answer,
  otherValue = '',
  onAnswer,
  onOtherChange,
}: Props) {
  const rawOpts = (q.options || []).filter(Boolean)
  const options = q.shuffle_options ? shuffleArray(rawOpts) : rawOpts
  const scaleMin = q.scale_min ?? 1
  const scaleMax = q.scale_max ?? 5
  const isOtherSelected = q.has_other && !!answer && !options.includes(String(answer))

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {q.question_text}
        {q.required && <span className="text-red-500"> *</span>}
      </Label>
      {q.description && <p className="text-xs text-muted-foreground">{q.description}</p>}
      {q.question_type === 'short_text' && (
        <Input value={String(answer || '')} onChange={(e) => onAnswer(e.target.value)} />
      )}
      {q.question_type === 'paragraph' && (
        <Textarea
          value={String(answer || '')}
          onChange={(e) => onAnswer(e.target.value)}
          rows={3}
        />
      )}
      {q.question_type === 'multiple_choice' && (
        <RadioGroup
          value={isOtherSelected ? '__other__' : String(answer || '')}
          onValueChange={(v) => {
            if (v === '__other__') onAnswer(otherValue)
            else {
              onAnswer(v)
              onOtherChange('')
            }
          }}
        >
          {options.map((o) => (
            <div key={o} className="flex items-center gap-2">
              <RadioGroupItem value={o} id={`${q.id}-${o}`} />
              <Label htmlFor={`${q.id}-${o}`} className="font-normal cursor-pointer text-sm">
                {o}
              </Label>
            </div>
          ))}
          {q.has_other && (
            <div className="flex items-center gap-2">
              <RadioGroupItem value="__other__" id={`${q.id}-other`} />
              <Input
                value={otherValue}
                onChange={(e) => {
                  onOtherChange(e.target.value)
                  onAnswer(e.target.value)
                }}
                placeholder="Outro"
                className="h-8 flex-1"
              />
            </div>
          )}
        </RadioGroup>
      )}
      {q.question_type === 'checkboxes' && (
        <div className="space-y-2">
          {options.map((o) => {
            const checked = Array.isArray(answer) && answer.includes(o)
            return (
              <div key={o} className="flex items-center gap-2">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => {
                    const cur = Array.isArray(answer) ? [...answer] : []
                    if (c) onAnswer([...cur, o])
                    else onAnswer(cur.filter((x) => x !== o))
                  }}
                />
                <Label className="font-normal cursor-pointer text-sm">{o}</Label>
              </div>
            )
          })}
          {q.has_other && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={!!otherValue}
                onCheckedChange={(c) => {
                  if (!c) {
                    onOtherChange('')
                    const cur = Array.isArray(answer) ? answer.filter((x) => x !== otherValue) : []
                    onAnswer(cur)
                  }
                }}
              />
              <Input
                value={otherValue}
                onChange={(e) => {
                  const v = e.target.value
                  const cur = Array.isArray(answer) ? answer.filter((x) => x !== otherValue) : []
                  onOtherChange(v)
                  onAnswer(v ? [...cur, v] : cur)
                }}
                placeholder="Outro"
                className="h-8 flex-1"
              />
            </div>
          )}
        </div>
      )}
      {q.question_type === 'dropdown' && (
        <Select value={answer ? String(answer) : undefined} onValueChange={onAnswer}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {q.question_type === 'linear_scale' && (
        <div className="space-y-2">
          <RadioGroup
            value={answer != null ? String(answer) : ''}
            onValueChange={(v) => onAnswer(Number(v))}
            className="flex gap-3 flex-wrap"
          >
            {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => i + scaleMin).map((n) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <RadioGroupItem value={String(n)} id={`${q.id}-${n}`} />
                <span className="text-xs">{n}</span>
              </div>
            ))}
          </RadioGroup>
          {(q.scale_label_left || q.scale_label_right) && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{q.scale_label_left}</span>
              <span>{q.scale_label_right}</span>
            </div>
          )}
        </div>
      )}
      {q.question_type === 'date' && (
        <Input
          type="date"
          value={String(answer || '')}
          onChange={(e) => onAnswer(e.target.value)}
        />
      )}
      {q.question_type === 'time' && (
        <Input
          type="time"
          value={String(answer || '')}
          onChange={(e) => onAnswer(e.target.value)}
        />
      )}
    </div>
  )
}
