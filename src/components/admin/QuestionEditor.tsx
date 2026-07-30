import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Loader2, Trash2, Copy } from 'lucide-react'
import { QUESTION_TYPES, OPTIONS_TYPES, SCALE_TYPES } from '@/lib/question-types'
import { QuestionOptionsEditor } from './QuestionOptionsEditor'
import { QuestionScaleEditor } from './QuestionScaleEditor'
import type { FormQuestion } from '@/types'
import type { ReactNode } from 'react'

interface Props {
  question: FormQuestion
  onChange: (patch: Partial<FormQuestion>) => void
  onSave: () => void
  onDelete: () => void
  onDuplicate: () => void
  saving?: boolean
  dragHandle?: ReactNode
}

export function QuestionEditor({
  question,
  onChange,
  onSave,
  onDelete,
  onDuplicate,
  saving,
  dragHandle,
}: Props) {
  const showOptions = OPTIONS_TYPES.includes(question.question_type)
  const showScale = SCALE_TYPES.includes(question.question_type)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
      {dragHandle}
      <div className="space-y-1 md:col-span-2">
        <Label className="text-xs">Pergunta *</Label>
        <Input
          value={question.question_text}
          onChange={(e) => onChange({ question_text: e.target.value })}
          placeholder="Digite a pergunta"
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label className="text-xs">Descrição (opcional)</Label>
        <Input
          value={question.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Texto de ajuda"
          className="h-8"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Tipo</Label>
        <Select
          value={question.question_type}
          onValueChange={(v) => onChange({ question_type: v as FormQuestion['question_type'] })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                <span className="flex items-center gap-2">
                  <t.icon className="h-3 w-3" /> {t.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end gap-2 pb-1">
        <Switch checked={question.required} onCheckedChange={(c) => onChange({ required: c })} />
        <Label className="text-xs">Obrigatória</Label>
      </div>
      {showOptions && (
        <div className="md:col-span-2">
          <QuestionOptionsEditor question={question} onChange={onChange} />
        </div>
      )}
      {showScale && (
        <div className="md:col-span-2">
          <QuestionScaleEditor question={question} onChange={onChange} />
        </div>
      )}
      <div className="md:col-span-2 flex items-center justify-between pt-1">
        <Button type="button" size="sm" variant="ghost" onClick={onDuplicate}>
          <Copy className="mr-1 h-3 w-3" /> Duplicar
        </Button>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={onSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Save className="mr-1 h-3 w-3" />
            )}
            Salvar
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  )
}
