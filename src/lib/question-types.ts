import {
  Type,
  AlignLeft,
  List,
  CheckSquare,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  Clock,
  type LucideIcon,
} from 'lucide-react'

export interface QuestionTypeMeta {
  value: string
  label: string
  icon: LucideIcon
}

export const QUESTION_TYPES: QuestionTypeMeta[] = [
  { value: 'short_text', label: 'Texto curto', icon: Type },
  { value: 'paragraph', label: 'Parágrafo', icon: AlignLeft },
  { value: 'multiple_choice', label: 'Escolha única', icon: List },
  { value: 'checkboxes', label: 'Múltipla escolha', icon: CheckSquare },
  { value: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { value: 'linear_scale', label: 'Escala linear', icon: SlidersHorizontal },
  { value: 'date', label: 'Data', icon: Calendar },
  { value: 'time', label: 'Hora', icon: Clock },
]

export const OPTIONS_TYPES = ['multiple_choice', 'checkboxes', 'dropdown']
export const SCALE_TYPES = ['linear_scale']
export const OTHER_TYPES = ['multiple_choice', 'checkboxes']
export const SHUFFLE_TYPES = ['multiple_choice', 'checkboxes', 'dropdown']

export function getQuestionTypeMeta(type: string): QuestionTypeMeta {
  return QUESTION_TYPES.find((t) => t.value === type) || QUESTION_TYPES[0]
}
