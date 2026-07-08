import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, Download, FileText, Award } from 'lucide-react'

const purchasedCourses = [
  {
    id: 1,
    title: 'Formação Master em Hipnose Clínica',
    progress: 45,
    image: 'https://img.usecurling.com/p/600/400?q=hypnosis&color=blue',
    modules: 12,
    completedModules: 5,
    status: 'Em andamento',
  },
  {
    id: 2,
    title: 'Auto-Hipnose Terapêutica Aplicada',
    progress: 100,
    image: 'https://img.usecurling.com/p/600/400?q=meditation&color=purple',
    modules: 6,
    completedModules: 6,
    status: 'Concluído',
  },
  {
    id: 3,
    title: 'Mentoria de Alta Performance',
    progress: 12,
    image: 'https://img.usecurling.com/p/600/400?q=success&color=gold',
    modules: 8,
    completedModules: 1,
    status: 'Em andamento',
  },
]

export default function Purchases() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minhas Compras</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seus cursos ativos, baixe materiais e emita seus certificados.
        </p>
      </div>

      <div className="space-y-4">
        {purchasedCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden border-border/50 bg-card hover:border-primary/30 transition-colors"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-64 shrink-0">
                <img
                  src={course.image}
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
                        {course.status}
                      </Badge>
                      <span>
                        {course.completedModules} de {course.modules} módulos concluídos
                      </span>
                    </div>
                  </div>
                  <Button className="shrink-0">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    {course.progress === 100 ? 'Revisar' : 'Continuar'}
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

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="mr-2 h-4 w-4" /> Materiais Extras
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Download className="mr-2 h-4 w-4" /> Baixar Apostila
                    </Button>
                    {course.progress === 100 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-500 border-green-500/30 hover:bg-green-500/10 ml-auto"
                      >
                        <Award className="mr-2 h-4 w-4" /> Emitir Certificado
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
