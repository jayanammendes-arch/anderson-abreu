import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCourseDetailData } from '@/services/courses'
import { getThumbnailUrl } from '@/services/courses'
import { setLessonProgress, isLessonCompleted } from '@/services/user-progress'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { CourseDetailData } from '@/types'
import { cn } from '@/lib/utils'

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuth()
  const [data, setData] = useState<CourseDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLessonId, setSelectedLessonId] = useState<string>('')
  const [toggling, setToggling] = useState(false)

  const loadData = useCallback(async () => {
    if (!courseId || !user) return
    try {
      const detail = await getCourseDetailData(courseId, user.id)
      setData(detail)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [courseId, user])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('user_progress', () => {
    loadData()
  })
  useRealtime('lessons', () => {
    loadData()
  })

  useEffect(() => {
    if (data && data.lessons.length > 0 && !selectedLessonId) {
      const firstIncomplete = data.lessons.find((l) => !isLessonCompleted(data.progress, l.id))
      setSelectedLessonId(firstIncomplete?.id || data.lessons[0].id)
    }
  }, [data, selectedLessonId])

  const handleToggleComplete = async () => {
    if (!user || !selectedLessonId) return
    setToggling(true)
    const completed = data ? !isLessonCompleted(data.progress, selectedLessonId) : false
    await setLessonProgress(user.id, selectedLessonId, completed)
    setToggling(false)
    loadData()
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Curso não encontrado.</p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
    )
  }

  const { course, modules, lessons, progress } = data
  const selectedLesson = lessons.find((l) => l.id === selectedLessonId)
  const completedCount = lessons.filter((l) => isLessonCompleted(progress, l.id)).length
  const progressPercent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0
  const currentIndex = lessons.findIndex((l) => l.id === selectedLessonId)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
  const isCompleted = selectedLesson ? isLessonCompleted(progress, selectedLesson.id) : false

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
        </div>
        <div className="w-full sm:w-64 space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">Progresso do curso</span>
            <span className="text-primary">{progressPercent}%</span>
          </div>
          <Progress
            value={progressPercent}
            className="h-2 bg-secondary"
            indicatorClassName={progressPercent === 100 ? 'bg-green-500' : 'bg-primary'}
          />
          <p className="text-xs text-muted-foreground">
            {completedCount} de {lessons.length} aulas concluídas
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit bg-card/50 border-border/50">
          <CardContent className="p-4 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Conteúdo do curso
            </h2>
            {modules.map((module) => (
              <div key={module.id} className="space-y-1">
                <p className="text-sm font-medium py-2">{module.title}</p>
                {lessons
                  .filter((l) => l.module === module.id)
                  .map((lesson) => {
                    const done = isLessonCompleted(progress, lesson.id)
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                          selectedLessonId === lesson.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-white/5 text-muted-foreground',
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0" />
                        )}
                        <span className="flex-1 line-clamp-1">{lesson.title}</span>
                        <span
                          className={cn(
                            'text-xs',
                            selectedLessonId === lesson.id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground/50',
                          )}
                        >
                          {lesson.duration}
                        </span>
                      </button>
                    )
                  })}
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-4">
          {selectedLesson && (
            <>
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black border border-border/50">
                {selectedLesson.video_url ? (
                  <iframe
                    src={selectedLesson.video_url}
                    className="h-full w-full"
                    title={selectedLesson.title}
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <PlayCircle className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedLesson.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selectedLesson.duration}</p>
                </div>
                <Button
                  onClick={handleToggleComplete}
                  disabled={toggling}
                  variant={isCompleted ? 'secondary' : 'default'}
                  className="shrink-0"
                >
                  {toggling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  ) : (
                    <Circle className="mr-2 h-4 w-4" />
                  )}
                  {isCompleted ? 'Concluído' : 'Marcar como Concluído'}
                </Button>
              </div>
              {selectedLesson.content && (
                <div
                  className="max-w-none text-sm leading-relaxed text-muted-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_p]:mb-3 [&_li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                />
              )}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && setSelectedLessonId(prevLesson.id)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && setSelectedLessonId(nextLesson.id)}
                >
                  Próxima <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
