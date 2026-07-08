import { Card, CardContent } from '@/components/ui/card'
import { Award, Lock } from 'lucide-react'

export default function Certificates() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certificados</h1>
        <p className="mt-2 text-muted-foreground">
          Seus certificados de conclusão de cursos aparecerão aqui.
        </p>
      </div>

      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Award className="h-10 w-10 text-gold" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Em breve</h2>
          <p className="max-w-md text-muted-foreground">
            Estamos trabalhando na emissão automática de certificados. Quando você concluir um
            curso, seu certificado estará disponível aqui para download.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Certificados serão gerados ao concluir 100% do curso</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
