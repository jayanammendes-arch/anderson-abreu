import { Link } from 'react-router-dom'
import { BookOpen, Users, Palette, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const modules = [
  {
    title: 'Cursos',
    description: 'Gerenciar cursos, módulos e aulas da plataforma',
    href: '/admin/cursos',
    icon: BookOpen,
  },
  {
    title: 'Alunos',
    description: 'Gerenciar alunos e acessos aos cursos',
    href: '/admin/alunos',
    icon: Users,
  },
  {
    title: 'Configurações da Plataforma',
    description: 'Branding, logo, cores e textos de login',
    href: '/admin/plataforma',
    icon: Palette,
  },
  {
    title: 'Agenda',
    description: 'Gerenciar eventos e agenda da plataforma',
    href: '/admin/agenda',
    icon: Calendar,
  },
]

export default function AdminConfigHub() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Central de gerenciamento da plataforma Anderson Abreu
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((mod) => (
          <Link key={mod.href} to={mod.href} className="group">
            <Card className="bg-card/50 border-border/50 transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-amber-500/10 group-hover:text-amber-400">
                  <mod.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-amber-400">
                    {mod.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
