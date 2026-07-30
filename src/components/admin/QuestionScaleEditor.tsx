import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FormQuestion } from '@/types'

interface Props {
  question: FormQuestion
  onChange: (patch: Partial<FormQuestion>) => void
}

export function QuestionScaleEditor({ question, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Mínimo</Label>
        <Input
          type="number"
          value={question.scale_min ?? 1}
          onChange={(e) => onChange({ scale_min: Number(e.target.value) })}
          className="h-8"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Máximo</Label>
        <Input
          type="number"
          value={question.scale_max ?? 5}
          onChange={(e) => onChange({ scale_max: Number(e.target.value) })}
          className="h-8"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Rótulo (esquerda)</Label>
        <Input
          value={question.scale_label_left || ''}
          onChange={(e) => onChange({ scale_label_left: e.target.value })}
          className="h-8"
          placeholder="Ex: Baixo"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Rótulo (direita)</Label>
        <Input
          value={question.scale_label_right || ''}
          onChange={(e) => onChange({ scale_label_right: e.target.value })}
          className="h-8"
          placeholder="Ex: Alto"
        />
      </div>
    </div>
  )
}
