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
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import type { FormQuestion } from '@/types'

interface QuestionEditorProps {
  question: FormQuestion
  onChange: (patch: Partial<FormQuestion>) => void
  onSave: () => void
  onDelete: () => void
  saving?: boolean
}

export function QuestionEditor({
  question,
  onChange,
  onSave,
  onDelete,
  saving,
}: QuestionEditorProps) {
  const options = question.options || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
      <div className="space-y-1">
        <Label className="text-xs">Texto da Pergunta</Label>
        <Input
          value={question.question_text}
          onChange={(e) => onChange({ question_text: e.target.value })}
          placeholder="Digite a pergunta"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Tipo</Label>
        <Select
          value={question.question_type}
          onValueChange={(v) => onChange({ question_type: v as FormQuestion['question_type'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open_text">Texto Livre</SelectItem>
            <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {question.question_type === 'multiple_choice' && (
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs">Alternativas</Label>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={opt}
                onChange={(e) => {
                  const next = [...options]
                  next[i] = e.target.value
                  onChange({ options: next })
                }}
                placeholder={`Alternativa ${i + 1}`}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => onChange({ options: options.filter((_, idx) => idx !== i) })}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChange({ options: [...options, ''] })}
          >
            <Plus className="mr-1 h-4 w-4" /> Adicionar Alternativa
          </Button>
        </div>
      )}
      <div className="md:col-span-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={question.required} onCheckedChange={(c) => onChange({ required: c })} />
          <Label className="text-xs">Obrigatória</Label>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={onSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Salvar
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  )
}
