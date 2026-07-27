import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, BarChart3 } from 'lucide-react'
import type { LifeWheelCategory, LifeWheelAssessment } from '@/types'
import type { ChartData } from '@/components/life-wheel/LifeWheelChart'

interface Props {
  assessment: LifeWheelAssessment
  categories: LifeWheelCategory[]
  chartData: ChartData[]
  onViewChart: () => void
  onDownloadPdf: () => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function LifeWheelAssessmentCard({
  assessment,
  categories,
  chartData,
  onViewChart,
  onDownloadPdf,
}: Props) {
  const isPre = assessment.type === 'pre'
  const overall = assessment.scores?.overall_average ?? 0
  const dateStr = formatDate(assessment.date || assessment.created)

  return (
    <Card className="p-5 space-y-3 bg-card/50 border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={isPre ? 'bg-blue-500/90 text-white' : 'bg-green-500/90 text-white'}>
            {isPre ? 'Pré' : 'Pós'}
          </Badge>
          <span className="text-sm text-muted-foreground">{dateStr}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Média</div>
          <div className="text-lg font-bold text-primary">{overall.toFixed(1)}</div>
        </div>
      </div>

      <div className="space-y-1">
        {categories.slice(0, 5).map((cat) => {
          const score = assessment.scores?.[cat.id] ?? 0
          return (
            <div key={cat.id} className="flex items-center gap-2">
              <span className="text-xs">{cat.icon}</span>
              <span className="text-xs text-muted-foreground flex-1 truncate">{cat.name}</span>
              <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(score / 10) * 100}%`, backgroundColor: cat.color }}
                />
              </div>
              <span className="text-xs font-semibold w-8 text-right">{score.toFixed(1)}</span>
            </div>
          )
        })}
        {categories.length > 5 && (
          <p className="text-xs text-muted-foreground pt-1">+{categories.length - 5} categorias</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onViewChart}>
          <BarChart3 className="mr-1 h-4 w-4" /> Ver Gráfico
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onDownloadPdf}>
          <Download className="mr-1 h-4 w-4" /> Baixar PDF
        </Button>
      </div>
    </Card>
  )
}
