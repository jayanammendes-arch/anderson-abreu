export interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  category: string
  is_available: boolean
  order: number
  price?: number
  discount_price?: number
  discount_percentage?: number
  external_buy_url?: string
  short_description?: string
  visibility?: 'home' | 'templates' | 'both'
  access_type?: 'free' | 'paid' | 'hypnosis'
  footer_banner?: string
  catchy_title?: string
  public_description?: string
  buy_button_text?: string
  instructor_name?: string
  manual_workload?: number
  certificate_template?: string
  created: string
  updated: string
}

export interface Event {
  id: string
  title: string
  date: string
  description: string
  location: string
  type: 'presencial' | 'online'
  image?: string
  created: string
  updated: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  message: string
  created: string
  updated: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
  created: string
  updated: string
}

export interface LandingPageJson {
  home?: {
    badge?: string
    title?: string
    titleHighlight?: string
    subtitle?: string
    primaryButtonText?: string
    secondaryButtonText?: string
  }
  stats?: Array<{ value: string; label: string }>
}

export interface Module {
  id: string
  course: string
  title: string
  description?: string
  materials?: string[]
  order: number
  created: string
  updated: string
}

export interface Lesson {
  id: string
  module: string
  title: string
  description?: string
  materials?: string[]
  video_url: string
  content: string
  duration: string
  order: number
  is_live?: boolean
  duration_minutes?: number
  created: string
  updated: string
}

export interface UserProgress {
  id: string
  user: string
  lesson: string
  completed: boolean
  video_position?: number
  created: string
  updated: string
}

export interface CourseWithProgress extends Course {
  modules: Module[]
  lessons: Lesson[]
  completedCount: number
  totalLessons: number
  progress: number
}

export interface CourseDetailData {
  course: Course
  modules: Module[]
  lessons: Lesson[]
  progress: UserProgress[]
  quizzes: Quiz[]
  quizResults: QuizResult[]
}

export interface UserAccess {
  id: string
  user: string
  course: string
  created: string
  updated: string
  expand?: { course?: Course }
}

export interface Quiz {
  id: string
  module: string
  title: string
  min_score: number
  is_active?: boolean
  created: string
  updated: string
}

export interface QuizQuestion {
  id: string
  quiz: string
  question: string
  options: string[]
  correct_answer: number
  created: string
  updated: string
}

export interface QuizResult {
  id: string
  user: string
  quiz: string
  score: number
  total: number
  passed: boolean
  created: string
  updated: string
}

export interface LessonMaterial {
  id: string
  lesson: string
  module?: string
  file: string
  label: string
  file_size?: number
  created: string
  updated: string
}

export interface LessonComment {
  id: string
  lesson: string
  user: string
  content: string
  reactions: number
  created: string
  updated: string
  expand?: { user?: { id: string; name: string; avatar: string } }
}

export interface Testimonial {
  id: string
  student_name: string
  type: 'text' | 'video'
  content: string
  student_image: string
  course: string
  is_active: boolean
  order: number
  created: string
  updated: string
  expand?: { course?: Course }
}

export interface CommunityUser {
  id: string
  name: string
  avatar: string
  is_admin: boolean
  bio?: string
  email?: string
  is_patient?: boolean
  is_hypnosis?: boolean
}

export interface CommunityPost {
  id: string
  user: string
  type: 'text' | 'image' | 'video' | 'achievement' | 'testimony'
  content: string
  image: string
  video_url: string
  related_course: string
  is_hidden: boolean
  created: string
  updated: string
  expand?: {
    user?: CommunityUser
    related_course?: Course
  }
}

export interface CommunityInteraction {
  id: string
  post: string
  user: string
  type: 'like' | 'comment'
  comment_text: string
  created: string
  updated: string
  expand?: {
    user?: CommunityUser
  }
}

export interface CommunityFollow {
  id: string
  follower: string
  followed: string
  created: string
  updated: string
}

export interface AppNotification {
  id: string
  user: string
  message: string
  type: string
  read: boolean
  created: string
  updated: string
}

export interface PlatformSettings {
  id: string
  company_name: string
  logo: string
  primary_color: string
  login_image: string
  login_text: string
  login_gradient: string
  whatsapp_number: string
  instagram_handle: string
  facebook_url: string
  linkedin_url: string
  youtube_url: string
  support_email: string
  agenda_highlight_title: string
  about_content: string
  about_image: string
  home_hero_image: string
  hero_title: string
  hero_subtitle: string
  hero_cta_text: string
  about_title: string
  stats_students: number
  stats_years: number
  stats_courses: number
  stats_countries: number
  testimonials_active: boolean
  agenda_intro: string
  agenda_image: string
  courses_title: string
  courses_intro: string
  contact_title: string
  contact_intro: string
  contact_phone: string
  services_title?: string
  services_subtitle?: string
  services_items?: string
  courses_section_title?: string
  courses_section_text?: string
  courses_section_button?: string
  saiba_mais_text?: string
  agendar_sessao_text?: string
  treatments_section_title?: string
  blog_section_title?: string
  testimonials_section_title?: string
  about_intro?: string
  about_full_bio?: string
  about_credentials?: string
  about_page_image?: string
  blog_section_intro?: string
  treatments_section_intro?: string
  agendar_background_image?: string
  agendar_headline?: string
  agendar_subheadline?: string
  agendar_benefits?: string
  agendar_submit_button_text?: string
  credentials_image?: string
  home_credential_name?: string
  home_credential_subtitle?: string
  home_credential_image?: string
  home_credential_list?: string
  home_credential_cta_text?: string
  home_credential_floating_badge_text?: string
  parallax_background_image?: string
  parallax_headline?: string
  parallax_button_text?: string
  parallax_button_link?: string
  faq_section_image?: string
  about_hero_image?: string
  about_hero_title?: string
  about_hero_subtitle?: string
  about_hero_visible?: boolean
  about_credentials_visible?: boolean
  about_journey_title?: string
  about_journey_photo?: string
  about_journey_visible?: boolean
  about_formations_title?: string
  about_formations_list?: string
  about_formations_image?: string
  about_formations_visible?: boolean
  about_grand_names_title?: string
  about_grand_names_visible?: boolean
  about_media_title?: string
  about_media_visible?: boolean
  about_recommendations_title?: string
  about_recommendations_visible?: boolean
  about_environment_title?: string
  about_environment_visible?: boolean
  about_cta_title?: string
  about_cta_subtitle?: string
  about_cta_button_text?: string
  about_cta_button_link?: string
  about_cta_background_image?: string
  about_cta_visible?: boolean
  treatments_accordion_enabled?: boolean
  global_blue_band_title?: string
  global_blue_band_text?: string
  blue_band_phrase?: string
  blue_band_whatsapp_text?: string
  blue_band_whatsapp_enabled?: boolean
  journey_title?: string
  journey_text?: string
  journey_button_text?: string
  journey_button_link?: string
  journey_button_type?: 'whatsapp' | 'internal'
  home_section_title?: string
  home_section_subtitle?: string
  home_column1_items?: string | Array<{ text: string; icon: string }>
  home_column2_items?: string | Array<{ text: string; icon: string }>
  home_section_footer?: string
  created: string
  updated: string
}

export interface Certificate {
  id: string
  user: string
  course: string
  issue_date: string
  workload_at_issue: number
  instructor_at_issue: string
  certificate_file: string
  created: string
  updated: string
  expand?: { course?: Course }
}

export interface Treatment {
  id: string
  name: string
  slug: string
  short_description?: string
  detailed_content: string
  image?: string
  order?: number
  icon?: string
  category?: 'Doenças Mentais' | 'Doenças Emocionais' | 'Doenças Corporais'
  created: string
  updated: string
}

export interface TreatmentCategory {
  id: string
  name: string
  slug: string
  short_description: string
  detailed_content: string
  image?: string
  crop_x?: number
  crop_y?: number
  icon: string
  symptoms_list?: string
  order: number
  is_active?: boolean
  como_funciona_text?: string
  como_funciona_images?: string[]
  como_funciona_title?: string
  resultados_text?: string
  resultados_images?: string[]
  resultados_title?: string
  cta_text?: string
  cta_images?: string[]
  cta_title?: string
  sintomas_title?: string
  faixa_text?: string
  sintomas_text?: string
  sintomas_image?: string
  como_funciona_image?: string
  faixa_azul_frase?: string
  resultados_image?: string
  por_que_tantas_title?: string
  por_que_tantas_content?: string
  comparacao_title?: string
  comparacao_content?: string
  hide_icon?: boolean
  sections_config?: Array<{ id: string; visible: boolean }>
  created: string
  updated: string
}

export interface SiteFAQ {
  id: string
  question: string
  answer: string
  order: number
  is_active: boolean
  created: string
  updated: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  image?: string
  author?: string
  published_at: string
  created: string
  updated: string
}

export interface CertificationLogo {
  id: string
  image: string
  order: number
  created: string
  updated: string
}

export interface AboutGrandName {
  id: string
  image: string
  name: string
  description?: string
  order: number
  created: string
  updated: string
}

export interface AboutMediaMention {
  id: string
  title: string
  description?: string
  link?: string
  image?: string
  video_url?: string
  order: number
  created: string
  updated: string
}

export interface AboutRecommendation {
  id: string
  video_url: string
  description?: string
  order: number
  created: string
  updated: string
}

export interface AboutEnvironmentImage {
  id: string
  image: string
  caption?: string
  order: number
  created: string
  updated: string
}

export interface LifeWheelCategory {
  id: string
  name: string
  icon: string
  color: string
  order: number
  created: string
  updated: string
}

export interface LifeWheelQuestion {
  id: string
  text: string
  explanation: string
  category: string
  order: number
  created: string
  updated: string
  expand?: { category?: LifeWheelCategory }
}

export interface LifeWheelAssessment {
  id: string
  user: string
  type: 'pre' | 'post'
  date: string
  scores: Record<string, number> & { overall_average?: number }
  created: string
  updated: string
}
