import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCoursesWithProgress, getThumbnailUrl } from '@/services/courses'
import { getUserAccess } from '@/services/user-access'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, Award, Loader2, BookOpen } from 'lucide-react'
import type { CourseWithProgress } from '@/types'

export default function Purchases() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [allCourses, accessRecords] = await Promise.all([
        getCoursesWithProgress(user.id),
        getUserAccess(user.id),
      ])
      const accessCourseIds = new Set(accessRecords.map((a) => a.course))
      setCourses(
        allCourses.filter((c) => {
          if (c.access_type === 'free') return true
          return accessCourseIds.has(c.id)
        }),
      )
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('user_access', () => loadData())
  useRealtime('user_progress', () => loadData())
  useRealtime('courses', () => loadData())

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Compras</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus cursos ativos, baixe materiais e emita seus certificados.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Você ainda não possui cursos.</p>
          <Button asChild>
            <Link to="/dashboard/produtos">Ver cursos disponíveis</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minhas Compras</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seus cursos ativos, baixe materiais e emita seus certificados.
        </p>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden border-border/50 bg-card hover:border-primary/30 transition-colors"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-64 shrink-0">
                <img
                  src={getThumbnailUrl(course)}
                  alt={course.title}
                  className="h-full w-full object-cover aspect-video md:aspect-auto md:h-full"
                />
              </div>
              <CardContent className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge
                        variant={course.progress === 100 ? 'default' : 'secondary'}
                        className={course.progress === 100 ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {course.progress === 100 ? 'Concluído' : 'Em andamento'}
                      </Badge>
                      <span>
                        {course.completedCount} de {course.totalLessons} aulas concluídas
                      </span>
                    </div>
                  </div>
                  <Button className="shrink-0" asChild>
                    <Link to={`/dashboard/curso/${course.id}`}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {course.progress === 100 ? 'Revisar' : 'Continuar'}
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Progresso do Curso</span>
                      <span className="text-primary">{course.progress}%</span>
                    </div>
                    <Progress
                      value={course.progress}
                      className="h-2"
                      indicatorClassName={course.progress === 100 ? 'bg-green-500' : 'bg-primary'}
                    />
                  </div>

                  {course.progress === 100 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-500 border-green-500/30 hover:bg-green-500/10 ml-auto"
                        asChild
                      >
                        <Link to="/dashboard/certificates">
                          <Award className="mr-2 h-4 w-4" /> Emitir Certificado
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
