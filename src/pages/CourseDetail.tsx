import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCourseDetailData } from '@/services/courses'
import {
  setLessonProgress,
  isLessonCompleted,
  saveVideoPosition,
  getVideoPosition,
} from '@/services/user-progress'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { VideoPlayer } from '@/components/course/VideoPlayer'
import { ModuleSidebar } from '@/components/course/ModuleSidebar'
import { MaterialsList } from '@/components/course/MaterialsList'
import { CommentsSection } from '@/components/course/CommentsSection'
import { QuizPanel } from '@/components/course/QuizPanel'
import { ArrowLeft, CheckCircle2, Circle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { CourseDetailData } from '@/types'
import { cn } from '@/lib/utils'

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuth()
  const [data, setData] = useState<CourseDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [quizModuleId, setQuizModuleId] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)

  const loadData = useCallback(async () => {
    if (!courseId || !user) return
    try {
      setData(await getCourseDetailData(courseId, user.id))
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [courseId, user])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('user_progress', () => loadData())
  useRealtime('lessons', () => loadData())
  useRealtime('modules', () => loadData())

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

  const handleNearComplete = async () => {
    if (!user || !selectedLessonId || !data) return
    if (isLessonCompleted(data.progress, selectedLessonId)) return
    await setLessonProgress(user.id, selectedLessonId, true)
    loadData()
  }

  const handleProgressSave = (currentTime: number) => {
    if (!user || !selectedLessonId) return
    saveVideoPosition(user.id, selectedLessonId, currentTime).catch(() => {})
  }

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId)
    setQuizModuleId(null)
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
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
    )
  }

  const { course, modules, lessons, progress, quizzes, quizResults } = data
  const selectedLesson = lessons.find((l) => l.id === selectedLessonId)
  const completedCount = lessons.filter((l) => isLessonCompleted(progress, l.id)).length
  const progressPercent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0
  const currentIndex = lessons.findIndex((l) => l.id === selectedLessonId)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
  const isCompleted = selectedLesson ? isLessonCompleted(progress, selectedLesson.id) : false
  const videoPosition = selectedLesson ? getVideoPosition(progress, selectedLesson.id) : 0
  const resumePosition = isCompleted ? 0 : videoPosition

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {quizModuleId ? (
            <QuizPanel
              moduleId={quizModuleId}
              onQuizComplete={() => {
                setQuizModuleId(null)
                loadData()
              }}
            />
          ) : selectedLesson ? (
            <>
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg border border-border/50">
                <VideoPlayer
                  key={selectedLesson.id}
                  videoUrl={selectedLesson.video_url}
                  title={selectedLesson.title}
                  initialPosition={resumePosition}
                  onProgressSave={handleProgressSave}
                  onNearComplete={handleNearComplete}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedLesson.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selectedLesson.duration}</p>
                </div>
                <Button
                  onClick={handleToggleComplete}
                  disabled={toggling}
                  className={cn(
                    'shrink-0',
                    isCompleted
                      ? 'bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25'
                      : 'bg-green-600 text-white hover:bg-green-700',
                  )}
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
                <div className="rounded-xl border border-border/50 p-5 bg-card/50">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Conteúdo da Aula
                  </h3>
                  <div
                    className="max-w-none text-sm leading-relaxed text-muted-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_p]:mb-3 [&_li]:mb-1"
                    dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                  />
                </div>
              )}

              <MaterialsList lessonId={selectedLesson.id} />
              <CommentsSection lessonId={selectedLesson.id} />

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && handleSelectLesson(prevLesson.id)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && handleSelectLesson(nextLesson.id)}
                >
                  Próxima <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-border/50 bg-card/50">
              <p className="text-muted-foreground">Selecione uma aula para começar</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-card/50 border-border/50 sticky top-6">
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Conteúdo do curso
              </h2>
              <ModuleSidebar
                modules={modules}
                lessons={lessons}
                progress={progress}
                quizzes={quizzes}
                quizResults={quizResults}
                selectedLessonId={selectedLessonId}
                onSelectLesson={handleSelectLesson}
                onTakeQuiz={setQuizModuleId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
