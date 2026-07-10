import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lock, Clock, PlayCircle, CheckCircle2 } from 'lucide-react'
import type { CourseWithProgress } from '@/types'
import { getThumbnailUrl } from '@/services/courses'

interface CourseCardProps {
  course: CourseWithProgress
  locked?: boolean
}

export function CourseCard({ course, locked = false }: CourseCardProps) {
  const thumb = getThumbnailUrl(course)

  if (locked) {
    return (
      <Card className="group relative overflow-hidden border-border/30 bg-card/50 transition-all duration-300 hover:border-primary/30">
        <div className="aspect-video overflow-hidden relative">
          <img
            src={thumb}
            alt={course.title}
            className="h-full w-full object-cover grayscale opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center border border-white/10">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <Badge className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-md">Em Breve</Badge>
        </div>
        <CardContent className="p-5">
          <CardTitle className="line-clamp-2 text-lg mb-2">{course.title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-glow">
      <Link to={`/dashboard/curso/${course.id}`}>
        <div className="aspect-video overflow-hidden relative">
          <img
            src={thumb}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          {course.totalLessons > 0 && (
            <Badge className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white hover:bg-black/50">
              <Clock className="mr-1 h-3 w-3" /> {course.totalLessons} aulas
            </Badge>
          )}
          {course.progress === 100 && (
            <Badge className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-md">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Concluído
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-5">
        <CardTitle className="line-clamp-2 text-lg mb-4 h-14 leading-tight">
          {course.title}
        </CardTitle>
        {course.totalLessons > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Progresso</span>
              <span className="text-primary">{course.progress}%</span>
            </div>
            <Progress
              value={course.progress}
              className="h-2 bg-secondary"
              indicatorClassName={course.progress === 100 ? 'bg-green-500' : 'bg-primary'}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button
          className="w-full"
          variant={course.progress === 100 ? 'secondary' : 'default'}
          asChild
        >
          <Link to={`/dashboard/curso/${course.id}`}>
            <PlayCircle className="mr-2 h-4 w-4" />
            {course.progress === 100
              ? 'Revisar Conteúdo'
              : course.progress > 0
                ? 'Continuar'
                : 'Começar'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
