import { Badge } from '@/components/ui/badge'

export function CrmLeadTreatments({ treatments }: { treatments?: string[] }) {
  if (!treatments || !Array.isArray(treatments) || treatments.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum tratamento selecionado.</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {treatments.map((t, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {t}
        </Badge>
      ))}
    </div>
  )
}
