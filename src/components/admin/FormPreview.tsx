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
import { Button } from '@/components/ui/button'
import { getQuestionTypeMeta } from '@/lib/question-types'
import type { FormQuestion, FormConfig } from '@/types'

interface Props {
  questions: FormQuestion[]
  form: Partial<FormConfig>
  headerImageUrl?: string | null
}

export function FormPreview({ questions, form, headerImageUrl }: Props) {
  const themeColor = form.color_theme || '#6366f1'
  return (
    <div className="space-y-4">
      {headerImageUrl ? (
        <div
          className="w-full h-24 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${headerImageUrl})` }}
        />
      ) : (
        <div
          className="w-full h-20 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: themeColor }}
        >
          <h2 className="text-white text-lg font-bold">{form.title || 'Formulário'}</h2>
        </div>
      )}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma pergunta ainda.</p>
        ) : (
          questions.map((q) => <PreviewQuestion key={q.id} question={q} />)
        )}
      </div>
      {questions.length > 0 && (
        <Button disabled style={{ backgroundColor: themeColor }} className="w-full text-white">
          Enviar Formulário
        </Button>
      )}
    </div>
  )
}

function PreviewQuestion({ question: q }: { question: FormQuestion }) {
  const meta = getQuestionTypeMeta(q.question_type)
  const options = (q.options || []).filter(Boolean)
  const scaleMin = q.scale_min ?? 1
  const scaleMax = q.scale_max ?? 5
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {q.question_text || 'Pergunta sem texto'}
        {q.required && <span className="text-red-500"> *</span>}
      </Label>
      {q.description && <p className="text-xs text-muted-foreground">{q.description}</p>}
      {q.question_type === 'short_text' && <Input disabled placeholder="Resposta curta" />}
      {q.question_type === 'paragraph' && (
        <Textarea disabled rows={3} placeholder="Resposta longa" />
      )}
      {q.question_type === 'multiple_choice' && (
        <RadioGroup disabled>
          {options.map((o) => (
            <div key={o} className="flex items-center gap-2">
              <RadioGroupItem value={o} disabled />
              <Label className="font-normal text-sm">{o}</Label>
            </div>
          ))}
          {q.has_other && (
            <div className="flex items-center gap-2">
              <RadioGroupItem value="other" disabled />
              <Input disabled placeholder="Outro" className="h-8" />
            </div>
          )}
        </RadioGroup>
      )}
      {q.question_type === 'checkboxes' && (
        <div className="space-y-2">
          {options.map((o) => (
            <div key={o} className="flex items-center gap-2">
              <Checkbox disabled />
              <Label className="font-normal text-sm">{o}</Label>
            </div>
          ))}
          {q.has_other && (
            <div className="flex items-center gap-2">
              <Checkbox disabled />
              <Input disabled placeholder="Outro" className="h-8" />
            </div>
          )}
        </div>
      )}
      {q.question_type === 'dropdown' && (
        <Select disabled>
          <SelectTrigger disabled>
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
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{q.scale_label_left || scaleMin}</span>
            <span>{q.scale_label_right || scaleMax}</span>
          </div>
          <RadioGroup disabled className="flex gap-3 flex-wrap">
            {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => i + scaleMin).map((n) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <RadioGroupItem value={String(n)} disabled />
                <span className="text-xs">{n}</span>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
      {q.question_type === 'date' && <Input type="date" disabled />}
      {q.question_type === 'time' && <Input type="time" disabled />}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <meta.icon className="h-3 w-3" /> {meta.label}
      </p>
    </div>
  )
}
