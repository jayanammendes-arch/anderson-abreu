import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Flame, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const rankings = [
  {
    id: 1,
    name: 'Ana Silva',
    points: 15420,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2',
    change: 'up',
  },
  {
    id: 2,
    name: 'Carlos Mendes',
    points: 14850,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
    change: 'same',
  },
  {
    id: 3,
    name: 'Juliana Costa',
    points: 14200,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4',
    change: 'down',
  },
  {
    id: 4,
    name: 'Roberto Alves',
    points: 13900,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=5',
    change: 'up',
  },
  {
    id: 5,
    name: 'Mariana Santos',
    points: 13550,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=6',
    change: 'same',
  },
  {
    id: 11,
    name: 'Fernanda Lima',
    points: 10200,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=7',
    change: 'up',
  },
  {
    id: 12,
    name: 'Rodrigo Silva',
    points: 10150,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
    change: 'up',
    isCurrent: true,
  },
  {
    id: 13,
    name: 'Lucas Pereira',
    points: 9800,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=8',
    change: 'down',
  },
]

export default function Ranking() {
  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          Hall da Fama
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Complete aulas, participe da comunidade e suba no ranking. Os melhores ganham benefícios
          exclusivos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-card border-border/50 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="h-24 w-24" />
          </div>
          <CardHeader>
            <CardDescription className="font-medium uppercase tracking-wider">
              Seus Pontos
            </CardDescription>
            <CardTitle className="text-4xl text-primary flex items-center justify-center gap-2">
              <Flame className="h-6 w-6 fill-primary" /> 10.150
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border/50 text-center">
          <CardHeader>
            <CardDescription className="font-medium uppercase tracking-wider">
              Sua Posição
            </CardDescription>
            <CardTitle className="text-4xl">#12</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border/50 text-center">
          <CardHeader>
            <CardDescription className="font-medium uppercase tracking-wider">
              Falta para o Top 10
            </CardDescription>
            <CardTitle className="text-4xl text-muted-foreground">+850 pts</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/50 bg-card overflow-hidden shadow-elevation">
        <div className="p-0">
          {rankings.map((user, index) => {
            const isTop3 = index < 3
            const rankIcon =
              index === 0 ? (
                <Medal className="h-6 w-6 text-yellow-400" />
              ) : index === 1 ? (
                <Medal className="h-6 w-6 text-gray-400" />
              ) : index === 2 ? (
                <Medal className="h-6 w-6 text-amber-600" />
              ) : (
                <span className="text-muted-foreground font-semibold w-6 text-center">
                  {user.id}
                </span>
              )

            return (
              <div
                key={user.id}
                className={cn(
                  'flex items-center gap-4 p-4 sm:p-6 border-b border-border/50 transition-colors hover:bg-white/5',
                  user.isCurrent && 'bg-primary/5 border-l-4 border-l-primary',
                )}
              >
                <div className="w-8 shrink-0 flex justify-center">{rankIcon}</div>

                <Avatar
                  className={cn(
                    'h-12 w-12 border-2',
                    isTop3 ? 'border-primary/50' : 'border-border',
                  )}
                >
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">{user.name}</p>
                    {user.isCurrent && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] h-5 px-1.5">
                        Você
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-primary font-medium">
                    {user.points.toLocaleString()} pts
                  </p>
                </div>

                <div className="hidden sm:flex shrink-0 w-16 justify-end text-muted-foreground">
                  {user.change === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {user.change === 'down' && (
                    <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                  )}
                  {user.change === 'same' && (
                    <div className="h-1 w-4 bg-muted-foreground/50 rounded-full" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="p-4 text-center border-t border-border/50 bg-muted/20">
          <p className="text-sm text-muted-foreground">Ranking atualizado diariamente às 00:00</p>
        </div>
      </Card>
    </div>
  )
}
