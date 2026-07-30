import { useAuth } from '@/hooks/use-auth'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function Community() {
  const { canAccessCommunity } = useAuth()

  if (!canAccessCommunity) {
    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comunidade</h1>
          <p className="text-muted-foreground mt-2">Conecte-se com outros alunos.</p>
        </div>
        <div className="mx-auto max-w-md text-center py-16 space-y-4">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-lg font-semibold">Acesso Restrito</p>
          <p className="text-muted-foreground">
            Acesso restrito. A comunidade está disponível apenas para alunos nível Ouro ou superior.
          </p>
          <Button asChild>
            <Link to="/dashboard">Ver cursos disponíveis</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comunidade</h1>
        <p className="text-muted-foreground mt-2">
          Conecte-se com outros alunos, compartilhe conquistas e particante da comunidade.
        </p>
      </div>
      <div className="mx-auto max-w-2xl">
        <CommunityFeed />
      </div>
    </div>
  )
}
