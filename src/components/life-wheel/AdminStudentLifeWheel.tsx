import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LifeWheelChart, type ChartData } from '@/components/life-wheel/LifeWheelChart'
import { Download, BarChart3, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import {
  getLifeWheelCategories,
  getLifeWheelAssessments,
  downloadLifeWheelPdf,
  downloadLifeWheelComparisonPdf,
} from '@/services/life-wheel'
import type { LifeWheelCategory, LifeWheelAssessment } from '@/types'

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function AdminStudentLifeWheel({ userId }: { userId: string }) {
  const [categories, setCategories] = useState<LifeWheelCategory[]>([])
  const [assessments, setAssessments] = useState<LifeWheelAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [preId, setPreId] = useState('')
  const [postId, setPostId] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [cats, assmts] = await Promise.all([
        getLifeWheelCategories(),
        getLifeWheelAssessments(userId),
      ])
      setCategories(cats)
      setAssessments(assmts)
      setPreId(assmts.find((a) => a.type === 'pre')?.id ?? '')
      setPostId(assmts.find((a) => a.type === 'post')?.id ?? '')
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const buildChartData = useMemo(
    () =>
      (a: LifeWheelAssessment): ChartData[] =>
        categories.map((cat) => ({ category: cat.name, score: a.scores?.[cat.id] ?? 0 })),
    [categories],
  )

  const comparisonData = useMemo((): ChartData[] => {
    const pre = assessments.find((a) => a.id === preId)
    const post = assessments.find((a) => a.id === postId)
    return categories.map((cat) => ({
      category: cat.name,
      pre: pre?.scores?.[cat.id] ?? 0,
      post: post?.scores?.[cat.id] ?? 0,
    }))
  }, [assessments, categories, preId, postId])

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )

  if (assessments.length === 0)
    return <p className="text-sm text-muted-foreground py-4">Nenhuma avaliação realizada.</p>

  const preAssessments = assessments.filter((a) => a.type === 'pre')
  const postAssessments = assessments.filter((a) => a.type === 'post')
  const canCompare = !!(preId && postId)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {assessments.map((a) => {
          const isExpanded = expandedId === a.id
          return (
            <Card key={a.id} className="p-4 space-y-2 bg-card/50 border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      a.type === 'pre' ? 'bg-blue-500/90 text-white' : 'bg-green-500/90 text-white'
                    }
                  >
                    {a.type === 'pre' ? 'Pré' : 'Pós'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(a.date || a.created)}
                  </span>
                </div>
                <span className="font-bold text-primary">
                  {a.scores?.overall_average?.toFixed(1) ?? '0.0'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="mr-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="mr-1 h-4 w-4" />
                  )}
                  Ver Gráfico
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => downloadLifeWheelPdf(a.id)}
                >
                  <Download className="mr-1 h-4 w-4" /> PDF
                </Button>
              </div>
              {isExpanded && <LifeWheelChart data={buildChartData(a)} />}
            </Card>
          )
        })}
      </div>

      {preAssessments.length > 0 && postAssessments.length > 0 && (
        <Card className="p-4 space-y-3 bg-card/50 border-border/50">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Comparação
          </h3>
          <div className="flex gap-4 flex-wrap items-end">
            <div className="space-y-1">
              <label className="text-sm">Pré</label>
              <Select value={preId} onValueChange={setPreId}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {preAssessments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {formatDate(a.date || a.created)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm">Pós</label>
              <Select value={postId} onValueChange={setPostId}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postAssessments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {formatDate(a.date || a.created)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {canCompare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadLifeWheelComparisonPdf(preId, postId)}
              >
                <Download className="mr-1 h-4 w-4" /> PDF Comparativo
              </Button>
            )}
          </div>
          {canCompare && <LifeWheelChart data={comparisonData} showComparison />}
        </Card>
      )}
    </div>
  )
}
