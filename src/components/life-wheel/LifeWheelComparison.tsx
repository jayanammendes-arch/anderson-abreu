import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LifeWheelChart, type ChartData } from '@/components/life-wheel/LifeWheelChart'
import { Download } from 'lucide-react'
import type { LifeWheelCategory, LifeWheelAssessment } from '@/types'

interface Props {
  assessments: LifeWheelAssessment[]
  categories: LifeWheelCategory[]
  onDownloadComparison: (id1: string, id2: string) => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function LifeWheelComparison({ assessments, categories, onDownloadComparison }: Props) {
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

  const canCompare = !!(preId && postId && preId !== postId)

  if (preAssessments.length === 0 || postAssessments.length === 0) return null

  return (
    <Card className="p-6 space-y-4 bg-card/50 border-border/50">
      <h2 className="text-xl font-semibold">Comparação de Avaliações</h2>
      <div className="flex gap-4 flex-wrap items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium">Avaliação Pré</label>
          <Select value={preId} onValueChange={setPreId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Selecione..." />
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
        <div className="space-y-1">
          <label className="text-sm font-medium">Avaliação Pós</label>
          <Select value={postId} onValueChange={setPostId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Selecione..." />
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
        {canCompare && (
          <Button variant="outline" onClick={() => onDownloadComparison(preId, postId)}>
            <Download className="mr-2 h-4 w-4" /> Baixar PDF Comparativo
          </Button>
        )}
      </div>
      {canCompare && <LifeWheelChart data={comparisonData} showComparison />}
    </Card>
  )
}
