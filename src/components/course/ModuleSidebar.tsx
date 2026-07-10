import { CheckCircle2, Circle, Lock, PlayCircle, FileQuestion } from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { isLessonCompleted } from '@/services/user-progress'
import type { Module, Lesson, UserProgress, Quiz, QuizResult } from '@/types'

interface ModuleSidebarProps {
  modules: Module[]
  lessons: Lesson[]
  progress: UserProgress[]
  quizzes: Quiz[]
  quizResults: QuizResult[]
  selectedLessonId: string
  onSelectLesson: (lessonId: string) => void
  onTakeQuiz: (moduleId: string) => void
}

export function ModuleSidebar({
  modules,
  lessons,
  progress,
  quizzes,
  quizResults,
  selectedLessonId,
  onSelectLesson,
  onTakeQuiz,
}: ModuleSidebarProps) {
  const selectedModule = modules.find((m) =>
    lessons.some((l) => l.id === selectedLessonId && l.module === m.id),
  )
  const defaultExpanded = selectedModule
    ? [selectedModule.id]
    : modules.length > 0
      ? [modules[0].id]
      : []

  const moduleLessons = (modId: string) => lessons.filter((l) => l.module === modId)

  const isModuleUnlocked = (index: number): boolean => {
    if (index === 0) return true
    const prevMod = modules[index - 1]
    const prevLessons = moduleLessons(prevMod.id)
    const allCompleted =
      prevLessons.length > 0 && prevLessons.every((l) => isLessonCompleted(progress, l.id))
    if (!allCompleted) return false
    const quiz = quizzes.find((q) => q.module === prevMod.id)
    if (quiz) return quizResults.some((r) => r.quiz === quiz.id && r.passed)
    return true
  }

  return (
    <Accordion type="multiple" defaultValue={defaultExpanded} className="space-y-2">
      {modules.map((mod, idx) => {
        const unlocked = isModuleUnlocked(idx)
        const modLessons = moduleLessons(mod.id)
        const completedCount = modLessons.filter((l) => isLessonCompleted(progress, l.id)).length
        const allDone = completedCount === modLessons.length && modLessons.length > 0
        const quiz = quizzes.find((q) => q.module === mod.id)
        const quizPassed = quiz ? quizResults.some((r) => r.quiz === quiz.id && r.passed) : false
        const showQuizBtn = allDone && quiz && !quizPassed

        return (
          <AccordionItem key={mod.id} value={mod.id} className="border-border/50 rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline" disabled={!unlocked}>
              <div className="flex items-center gap-2 flex-1">
                {!unlocked ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : allDone ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <PlayCircle className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium text-sm">{mod.title}</span>
                <Badge variant="secondary" className="text-xs ml-auto mr-2">
                  {completedCount}/{modLessons.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pt-2">
                {modLessons.map((lesson) => {
                  const done = isLessonCompleted(progress, lesson.id)
                  const isActive = selectedLessonId === lesson.id
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => unlocked && onSelectLesson(lesson.id)}
                      disabled={!unlocked}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : unlocked
                            ? 'hover:bg-white/5 text-muted-foreground'
                            : 'text-muted-foreground/40 cursor-not-allowed',
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                      ) : !unlocked ? (
                        <Lock className="h-4 w-4 shrink-0" />
                      ) : isActive ? (
                        <PlayCircle className="h-4 w-4 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0" />
                      )}
                      <span className="flex-1 line-clamp-1">{lesson.title}</span>
                      <span
                        className={cn(
                          'text-xs',
                          isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/50',
                        )}
                      >
                        {lesson.duration}
                      </span>
                    </button>
                  )
                })}
                {showQuizBtn && (
                  <button
                    onClick={() => onTakeQuiz(mod.id)}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-amber-500 hover:bg-amber-500/10 transition-colors"
                  >
                    <FileQuestion className="h-4 w-4" /> Fazer Prova do Módulo
                  </button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
