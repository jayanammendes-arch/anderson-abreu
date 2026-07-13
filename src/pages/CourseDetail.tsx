import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCourseDetailData } from '@/services/courses'
import {
  setLessonProgress,
  isLessonCompleted,
  saveVideoPosition,
  getVideoPosition,
} from '@/services/user-progress'
import { hasCourseAccess as checkUserAccess } from '@/services/user-access'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { VideoPlayer } from '@/components/course/VideoPlayer'
import { ModuleSidebar } from '@/components/course/ModuleSidebar'
import { MaterialsList } from '@/components/course/MaterialsList'
import { CommentsSection } from '@/components/course/CommentsSection'
import { QuizPanel } from '@/components/course/QuizPanel'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Radio,
  Lock,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { CourseDetailData } from '@/types'
import { cn } from '@/lib/utils'

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [data, setData] = useState<CourseDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [quizModuleId, setQuizModuleId] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)
  const [cinemaMode, setCinemaMode] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)

  const loadData = useCallback(async () => {
    if (!courseId || !user) return
    try {
      const detail = await getCourseDetailData(courseId, user.id)
      setData(detail)
      const access =
        detail.course.access_type === 'free' || (await checkUserAccess(user.id, courseId))
      setHasAccess(access)
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
      const lessonParam = searchParams.get('lesson')
      const lessonFromParam = lessonParam ? data.lessons.find((l) => l.id === lessonParam) : null
      const firstIncomplete = data.lessons.find((l) => !isLessonCompleted(data.progress, l.id))
      setSelectedLessonId(lessonFromParam?.id || firstIncomplete?.id || data.lessons[0].id)
    }
  }, [data, selectedLessonId, searchParams])

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

  if (!hasAccess) {
    return (
      <div className="text-center py-20 space-y-4">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="text-lg font-semibold">Acesso Restrito</p>
        <p className="text-muted-foreground">Você não tem acesso a este curso.</p>
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
    <div className="mx-auto w-full max-w-[1600px] space-y-6 animate-fade-in px-4 pb-10 sm:px-6">
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

      <div
        className={cn(
          'grid grid-cols-1 gap-6 transition-all duration-300',
          cinemaMode ? 'lg:grid-cols-1' : 'lg:grid-cols-5',
        )}
      >
        <div
          className={cn(
            'space-y-6 transition-all duration-300',
            cinemaMode ? 'lg:col-span-1' : 'lg:col-span-4',
          )}
        >
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
              <div className="aspect-video w-full min-h-[280px] overflow-hidden rounded-xl bg-black shadow-lg border border-border/50 ring-1 ring-border/30 sm:min-h-[400px] lg:min-h-[520px] xl:min-h-[600px]">
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
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {selectedLesson.title}
                    {selectedLesson.is_live && (
                      <Badge className="bg-red-500 text-white gap-1">
                        <Radio className="h-3 w-3" /> AO VIVO
                      </Badge>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{selectedLesson.duration}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCinemaMode(!cinemaMode)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {cinemaMode ? (
                      <Minimize2 className="mr-2 h-4 w-4" />
                    ) : (
                      <Maximize2 className="mr-2 h-4 w-4" />
                    )}
                    {cinemaMode ? 'Sair' : 'Cinema'}
                  </Button>
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

              <MaterialsList lessonId={selectedLesson.id} moduleId={selectedLesson.module} />
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

        {!cinemaMode && (
          <div className="lg:col-span-1">
            <Card className="bg-card/50 border-border/50 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
              {' '}
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
        )}
      </div>
    </div>
  )
}
