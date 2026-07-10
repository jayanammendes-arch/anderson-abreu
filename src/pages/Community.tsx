import { CommunityFeed } from '@/components/community/CommunityFeed'

export default function Community() {
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
