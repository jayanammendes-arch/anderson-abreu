import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { adminNavItems } from '@/lib/admin-nav'

export default function AdminConfigHub() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Central de Gerenciamento da Plataforma</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie cursos, alunos, configurações e agenda da plataforma Anderson Abreu
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminNavItems.map((item) => (
          <Link key={item.href} to={item.href} className="group">
            <Card className="bg-card/50 border-border/50 transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 h-full">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-amber-500/10 group-hover:text-amber-400">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-amber-400">
                    {item.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
