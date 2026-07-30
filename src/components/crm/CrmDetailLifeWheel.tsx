import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LifeWheelChart, type ChartData } from '@/components/life-wheel/LifeWheelChart'
import { Download, BarChart3 } from 'lucide-react'
import { downloadLifeWheelPdf, downloadLifeWheelComparisonPdf } from '@/services/life-wheel'
import type { LifeWheelAssessment, LifeWheelCategory } from '@/types'

interface Props {
  assessments: LifeWheelAssessment[]
  categories: LifeWheelCategory[]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function CrmDetailLifeWheel({ assessments, categories }: Props) {
  const preAssessments = assessments.filter((a) => a.type === 'pre')
  const postAssessments = assessments.filter((a) => a.type === 'post')
  const [preId, setPreId] = useState(preAssessments[0]?.id ?? '')
  const [postId, setPostId] = useState(postAssessments[0]?.id ?? '')

  const comparisonData = useMemo((): ChartData[] => {
    const pre = assessments.find((a) => a.id === preId)
    const post = assessments.find((a) => a.id === postId)
    return categories.map((cat) => ({
      category: cat.name,
      pre: pre?.scores?.[cat.id] ?? 0,
      post: post?.scores?.[cat.id] ?? 0,
    }))
  }, [assessments, categories, preId, postId])

  const canCompare = !!(preId && postId)

  if (assessments.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma avaliação realizada</p>
  }

  return (
    <div className="space-y-3">
      {assessments.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between border border-border rounded-lg p-3"
        >
          <div className="flex items-center gap-2">
            <Badge
              className={
                a.type === 'pre'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground'
              }
            >
              {a.type === 'pre' ? 'Pré' : 'Pós'}
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDate(a.date || a.created)}</span>
            <span className="text-xs text-muted-foreground">
              Média: {a.scores?.overall_average?.toFixed(1) || '—'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadLifeWheelPdf(a.id).catch(() => toast.error('Erro ao baixar PDF'))
            }
          >
            <Download className="mr-1 h-3 w-3" /> PDF
          </Button>
        </div>
      ))}
      {preAssessments.length > 0 && postAssessments.length > 0 && (
        <div className="border border-border rounded-lg p-3 space-y-3 bg-muted/30">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Comparação Pré x Pós
          </h4>
          <div className="flex gap-3 flex-wrap">
            <div className="space-y-1 flex-1 min-w-[140px]">
              <label className="text-xs text-muted-foreground">Avaliação Pré</label>
              <Select value={preId} onValueChange={setPreId}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {preAssessments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      Pré — {formatDate(a.date || a.created)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-[140px]">
              <label className="text-xs text-muted-foreground">Avaliação Pós</label>
              <Select value={postId} onValueChange={setPostId}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postAssessments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      Pós — {formatDate(a.date || a.created)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {canCompare && (
            <>
              <LifeWheelChart data={comparisonData} showComparison />
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadLifeWheelPdf(preId).catch(() => toast.error('Erro ao baixar PDF'))
                  }
                >
                  <Download className="mr-1 h-3 w-3" /> PDF Pré
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadLifeWheelPdf(postId).catch(() => toast.error('Erro ao baixar PDF'))
                  }
                >
                  <Download className="mr-1 h-3 w-3" /> PDF Pós
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadLifeWheelComparisonPdf(preId, postId).catch(() =>
                      toast.error('Erro ao baixar PDF comparativo'),
                    )
                  }
                >
                  <BarChart3 className="mr-1 h-3 w-3" /> PDF Comparativo
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
