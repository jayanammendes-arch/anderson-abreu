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
  order: number
  created: string
  updated: string
}

export interface Lesson {
  id: string
  module: string
  title: string
  video_url: string
  content: string
  duration: string
  order: number
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
  landing_page_json: LandingPageJson | null
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
  created: string
  updated: string
}
