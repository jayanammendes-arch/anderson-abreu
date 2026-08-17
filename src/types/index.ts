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

export interface PlatformSettings {
  id: string
  company_name?: string
  logo?: string
  primary_color?: string
  login_image?: string
  login_text?: string
  login_gradient?: string
  whatsapp_number?: string
  instagram_handle?: string
  support_email?: string
  agenda_highlight_title?: string
  home_hero_image?: string
  hero_title?: string
  hero_subtitle?: string
  hero_cta_text?: string
  stats_students?: number
  stats_years?: number
  stats_courses?: number
  stats_countries?: number
  agenda_intro?: string
  agenda_image?: string
  courses_title?: string
  courses_intro?: string
  contact_title?: string
  contact_intro?: string
  contact_phone?: string
  facebook_url?: string
  linkedin_url?: string
  youtube_url?: string
  courses_section_title?: string
  courses_section_text?: string
  courses_section_button?: string
  saiba_mais_text?: string
  agendar_sessao_text?: string
  treatments_section_title?: string
  treatments_section_intro?: string
  blog_section_title?: string
  blog_section_intro?: string
  testimonials_section_title?: string
  about_full_bio?: string
  agendar_background_image?: string
  agendar_headline?: string
  agendar_subheadline?: string
  agendar_benefits?: string | string[]
  agendar_submit_button_text?: string
  home_credential_name?: string
  home_credential_subtitle?: string
  home_credential_image?: string
  hypnosis_info_image?: string
  home_credential_list?: string | string[]
  home_credential_cta_text?: string
  home_credential_floating_badge_text?: string
  parallax_background_image?: string
  parallax_headline?: string
  parallax_button_text?: string
  parallax_button_link?: string
  faq_section_image?: string
  about_hero_title?: string
  about_hero_subtitle?: string
  about_journey_title?: string
  about_formations_title?: string
  about_grand_names_title?: string
  about_media_title?: string
  about_recommendations_title?: string
  about_environment_title?: string
  about_cta_title?: string
  about_cta_subtitle?: string
  about_cta_button_text?: string
  about_cta_button_link?: string
  about_hero_visible?: boolean
  about_credentials_visible?: boolean
  about_journey_visible?: boolean
  about_formations_visible?: boolean
  about_grand_names_visible?: boolean
  about_media_visible?: boolean
  about_recommendations_visible?: boolean
  about_environment_visible?: boolean
  about_cta_visible?: boolean
  about_hero_image?: string
  about_journey_photo?: string
  about_formations_image?: string
  about_cta_background_image?: string
  about_formations_list?: string | string[]
  treatments_accordion_enabled?: boolean
  global_blue_band_title?: string
  global_blue_band_text?: string
  blue_band_phrase?: string
  blue_band_image?: string
  blue_band_whatsapp_text?: string
  blue_band_whatsapp_enabled?: boolean
  journey_title?: string
  journey_text?: string
  journey_button_text?: string
  journey_button_link?: string
  journey_button_type?: 'whatsapp' | 'internal'
  home_section_title?: string
  home_section_subtitle?: string
  home_column1_items?: string | any[]
  home_column2_items?: string | any[]
  home_section_footer?: string
  show_logo?: boolean
  created?: string
  updated?: string
  mentorship_title?: string
  mentorship_subtitle?: string
  mentorship_description?: string
  mentorship_benefits?: string | string[]
  mentorship_button_text?: string
  mentorship_whatsapp_number?: string
}

export interface AboutGrandName {
  id: string
  image: string
  name: string
  order?: number
  created?: string
  updated?: string
}

export interface AboutMediaMention {
  id: string
  title: string
  description?: string
  link?: string
  image?: string
  video_url?: string
  order?: number
  created?: string
  updated?: string
}

export interface AboutRecommendation {
  id: string
  video_url: string
  description?: string
  order?: number
  created?: string
  updated?: string
}

export interface AboutEnvironmentImage {
  id: string
  image: string
  caption?: string
  order?: number
  created?: string
  updated?: string
}

export interface Course {
  id: string
  title: string
  description?: string
  thumbnail?: string
  category?: string
  is_available?: boolean
  order?: number
  price?: number
  discount_price?: number
  external_buy_url?: string
  short_description?: string
  discount_percentage?: number
  visibility?: 'home' | 'templates' | 'both'
  footer_banner?: string
  catchy_title?: string
  public_description?: string
  buy_button_text?: string
  instructor_name?: string
  manual_workload?: number
  certificate_template?: string
  level?: 'Prata' | 'Ouro' | 'Diamante' | 'all'
  access_type?: 'free' | 'paid'
  created?: string
  updated?: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  image?: string
  author?: string
  published_at?: string
  order?: number
  created?: string
  updated?: string
}

export interface Treatment {
  id: string
  name: string
  slug: string
  short_description?: string
  detailed_content?: string
  image?: string
  order?: number
  created?: string
  updated?: string
  icon?: string
  category?: 'Doenças Mentais' | 'Doenças Emocionais' | 'Doenças Corporais'
}

export interface TreatmentCategory {
  id: string
  name: string
  slug: string
  short_description: string
  detailed_content?: string
  image?: string
  icon?: string
  symptoms_list?: string
  order?: number
  created?: string
  updated?: string
  como_funciona_text?: string
  como_funciona_images?: string[]
  como_funciona_image?: string
  como_funciona_title?: string
  resultados_text?: string
  resultados_images?: string[]
  resultados_image?: string
  resultados_title?: string
  sintomas_text?: string
  sintomas_corpo_text?: string
  sintomas_mente_text?: string
  sintomas_image?: string
  sintomas_title?: string
  cta_text?: string
  cta_images?: string[]
  cta_title?: string
  sections_config?: string | unknown[]
  faixa_text?: string
  faixa_azul_frase?: string
  faixa_azul_subtitulo?: string
  faixa_azul_image?: string
  faixa_azul_whatsapp_enabled?: boolean
  faixa_azul_whatsapp_text?: string
  is_active?: boolean
  hide_icon?: boolean
  crop_x?: number
  crop_y?: number
  por_que_tantas_title?: string
  por_que_tantas_content?: string
  comparacao_title?: string
  comparacao_content?: string
  font_sizes?: FontSizes | string
}

export interface FontSizeEntry {
  title: number
  content: number
}

export type FontSizes = Partial<Record<string, Partial<FontSizeEntry>>>

export interface ContentSnapshot {
  id: string
  record_id: string
  snapshot: string
  user: string
  created: string
  updated: string
  expand?: { user?: { id: string; name: string } }
}
