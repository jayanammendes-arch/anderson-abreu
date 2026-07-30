export type UserLevel = 'Prata' | 'Ouro' | 'Diamante'

export interface PreHypnosisForm {
  id: string
  user: string
  nome: string
  telefone: string
  motivo_da_busca: string
  informacoes_de_saude: string
  medicamentos: string
  expectativas: string
  created: string
  updated: string
}

export interface CrmLead {
  id: string
  name: string
  email: string
  phone: string
  instagram_handle: string
  stage: string
  source?: 'site' | 'social'
  notes: string
  linked_user: string
  treatments?: string[]
  created: string
  updated: string
  expand?: {
    linked_user?: {
      id: string
      name: string
      email: string
      phone?: string
      birth_date?: string
      instagram_handle?: string
      level?: string
    }
  }
}

export interface CrmInteraction {
  id: string
  lead: string
  user: string
  type: string
  content: string
  created: string
  updated: string
  expand?: { user?: { id: string; name: string } }
}

export interface CrmPurchase {
  id: string
  lead: string
  user: string
  course: string
  mentorship_service: string
  purchase_date: string
  amount: number
  created: string
  updated: string
  expand?: { course?: Course; user?: { id: string; name: string } }
}

export interface OnboardingStep {
  id?: string
  type: 'form' | 'life_wheel' | 'lesson' | 'audio'
  label: string
  courseId?: string
  lessonId?: string
  form_id?: string
}

export interface OnboardingConfig {
  id: string
  cover_image: string
  title: string
  subtitle: string
  steps: OnboardingStep[]
  is_active: boolean
  created: string
  updated: string
}

export type FormQuestionType =
  | 'short_text'
  | 'paragraph'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'linear_scale'
  | 'date'
  | 'time'

export interface FormConfig {
  id: string
  title: string
  description: string
  is_active: boolean
  color_theme: string
  header_image: string
  confirmation_message: string
  one_submission_message: string
  created: string
  updated: string
}

export interface FormQuestion {
  id: string
  form: string
  question_text: string
  question_type: FormQuestionType
  options: string[] | null
  order: number
  required: boolean
  description: string
  shuffle_options: boolean
  scale_min: number
  scale_max: number
  scale_label_left: string
  scale_label_right: string
  has_other: boolean
  created: string
  updated: string
}

export type FormAnswers = Record<string, string | string[] | number>

export interface FormSubmission {
  id: string
  user: string
  form: string
  answers: FormAnswers
  created: string
  updated: string
  expand?: { form?: FormConfig }
}
