import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, Lock, Star, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const purchasedCourses = [
  {
    id: 1,
    title: 'Formação Master em Hipnose Clínica',
    progress: 45,
    image: 'https://img.usecurling.com/p/600/400?q=hypnosis&color=blue',
    lastAccessed: 'Há 2 dias',
  },
  {
    id: 2,
    title: 'Auto-Hipnose Terapêutica Aplicada',
    progress: 100,
    image: 'https://img.usecurling.com/p/600/400?q=meditation&color=purple',
    lastAccessed: 'Há 1 semana',
  },
  {
    id: 3,
    title: 'Mentoria de Alta Performance',
    progress: 12,
    image: 'https://img.usecurling.com/p/600/400?q=success&color=gold',
    lastAccessed: 'Hoje',
  },
]

const lockedCourses = [
  {
    id: 4,
    title: 'Formação em PNL 2.0',
    description: 'Domine a Programação Neurolinguística.',
    price: 'R$ 997,00',
    discount: '30% OFF',
    image: 'https://img.usecurling.com/p/600/800?q=brain&color=black',
  },
  {
    id: 5,
    title: 'Constelação Familiar Sistêmica',
    description: 'Cure feridas ancestrais.',
    price: 'R$ 1.497,00',
    discount: 'Premium',
    image: 'https://img.usecurling.com/p/600/800?q=family&color=gray',
  },
  {
    id: 6,
    title: 'Inteligência Emocional Pro',
    description: 'Gestão de emoções avançada.',
    price: 'R$ 697,00',
    image: 'https://img.usecurling.com/p/600/800?q=emotions&color=black',
  },
  {
    id: 7,
    title: 'Hipnose de Palco e Entretenimento',
    description: 'Aprenda os segredos dos shows.',
    price: 'R$ 497,00',
    image: 'https://img.usecurling.com/p/600/800?q=stage&color=gray',
  },
]

export default function Index() {
  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 sm:p-12 border border-white/5 shadow-elevation">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Olá, Rodrigo! <br className="hidden sm:block" />
            <span className="text-gradient-gold">Vamos continuar sua jornada?</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Você tem 2 aulas pendentes na Formação Master. Aproveite o momento para evoluir.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="shadow-glow group">
              <PlayCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Retomar Aula Atual
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10"
              asChild
            >
              <Link to="/ranking">Ver meu Ranking</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Meus Cursos */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Meus Cursos</h2>
            <p className="text-sm text-muted-foreground">Continue de onde parou.</p>
          </div>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary hover:bg-primary/10"
            asChild
          >
            <Link to="/compras">Ver todos</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {purchasedCourses.map((course) => (
            <Card
              key={course.id}
              className="group overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
            >
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <Badge className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white hover:bg-black/50">
                  <Clock className="mr-1 h-3 w-3" /> {course.lastAccessed}
                </Badge>
              </div>
              <CardContent className="p-5">
                <CardTitle className="line-clamp-2 text-lg mb-4 h-14 leading-tight">
                  {course.title}
                </CardTitle>
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
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <Button
                  className="w-full"
                  variant={course.progress === 100 ? 'secondary' : 'default'}
                >
                  {course.progress === 100 ? 'Revisar Conteúdo' : 'Continuar'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Vitrine de Cursos */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Star className="h-6 w-6 text-primary fill-primary" />
              Recomendados para você
            </h2>
            <p className="text-sm text-muted-foreground">
              Desbloqueie novos níveis de conhecimento.
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary hover:bg-primary/10"
            asChild
          >
            <Link to="/produtos">Ver loja completa</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {lockedCourses.map((course) => (
            <Card
              key={course.id}
              className="group relative overflow-hidden border-border/30 bg-card/50 transition-all duration-300 hover:border-primary/30"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-full w-full object-cover grayscale opacity-50 transition-all duration-500 group-hover:scale-105 group-hover:grayscale-[50%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                {/* Lock Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-xl group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors">
                    <Lock className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {course.discount && (
                  <Badge className="absolute top-3 right-3 bg-red-500/90 hover:bg-red-500 backdrop-blur-md">
                    {course.discount}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="absolute top-3 left-3 bg-black/50 backdrop-blur-md border-primary/50 text-primary"
                >
                  Apenas Alunos
                </Badge>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 pt-12 bg-gradient-to-t from-background to-transparent">
                <CardTitle className="line-clamp-2 text-md mb-2">{course.title}</CardTitle>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-white">{course.price}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/10 hover:bg-primary hover:text-primary-foreground"
                  >
                    Saiba mais
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
