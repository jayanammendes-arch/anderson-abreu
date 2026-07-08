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
  external_buy_url?: string
  short_description?: string
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
}
