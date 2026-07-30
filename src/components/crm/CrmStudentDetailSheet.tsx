import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Send, Download, BarChart3 } from 'lucide-react'
import {
  getStudentCoursesWithProgress,
  getStudentMentorship,
  getCrmInteractions,
  createCrmInteraction,
  type SiteLeadSummary,
  type StudentCourseProgress,
  type StudentMentorship,
} from '@/services/crm'
import {
  getLifeWheelCategories,
  getLifeWheelAssessments,
  downloadLifeWheelPdf,
  downloadLifeWheelComparisonPdf,
} from '@/services/life-wheel'
import { LifeWheelChart, type ChartData } from '@/components/life-wheel/LifeWheelChart'
import type { LifeWheelAssessment, LifeWheelCategory, CrmInteraction } from '@/types'

interface Props {
  lead: SiteLeadSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function CrmStudentDetailSheet({ lead, open, onOpenChange }: Props) {
  const [courses, setCourses] = useState<StudentCourseProgress[]>([])
  const [mentorship, setMentorship] = useState<StudentMentorship | null>(null)
  const [assessments, setAssessments] = useState<LifeWheelAssessment[]>([])
  const [categories, setCategories] = useState<LifeWheelCategory[]>([])
  const [interactions, setInteractions] = useState<CrmInteraction[]>([])
  const [loading, setLoading] = useState(false)
  const [newType, setNewType] = useState('')
  const [newContent, setNewContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [preId, setPreId] = useState('')
  const [postId, setPostId] = useState('')

  useEffect(() => {
    if (!lead) return
    setLoading(true)
    const userId = lead.linked_user
    Promise.all([
      userId ? getStudentCoursesWithProgress(userId).catch(() => []) : Promise.resolve([]),
      getStudentMentorship(lead.id).catch(() => null),
      userId ? getLifeWheelAssessments(userId).catch(() => []) : Promise.resolve([]),
      getLifeWheelCategories().catch(() => []),
      getCrmInteractions(lead.id).catch(() => []),
    ])
      .then(([c, m, a, cats, i]) => {
        setCourses(c)
        setMentorship(m)
        setAssessments(a as LifeWheelAssessment[])
        setCategories(cats as LifeWheelCategory[])
        setInteractions(i as CrmInteraction[])
        const preItems = (a as LifeWheelAssessment[]).filter((x) => x.type === 'pre')
        const postItems = (a as LifeWheelAssessment[]).filter((x) => x.type === 'post')
        setPreId(preItems[0]?.id ?? '')
        setPostId(postItems[0]?.id ?? '')
      })
      .finally(() => setLoading(false))
  }, [lead])

  const comparisonData = useMemo((): ChartData[] => {
    const pre = assessments.find((a) => a.id === preId)
    const post = assessments.find((a) => a.id === postId)
    return categories.map((cat) => ({
      category: cat.name,
      pre: pre?.scores?.[cat.id] ?? 0,
      post: post?.scores?.[cat.id] ?? 0,
    }))
  }, [assessments, categories, preId, postId])

  const preAssessments = assessments.filter((a) => a.type === 'pre')
  const postAssessments = assessments.filter((a) => a.type === 'post')
  const canCompare = !!(preId && postId)

  const handleAddInteraction = async () => {
    if (!lead || !newContent.trim()) return
    setSaving(true)
    try {
      const created = await createCrmInteraction({
        lead: lead.id,
        type: newType || 'Reunião',
        content: newContent,
      })
      setInteractions((prev) => [created as CrmInteraction, ...prev])
      setNewType('')
      setNewContent('')
      toast.success('Interação registrada!')
    } catch {
      toast.error('Erro ao adicionar interação')
    } finally {
      setSaving(false)
    }
  }

  if (!lead) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-card">
        <SheetHeader>
          <SheetTitle className="text-xl text-foreground">{lead.name}</SheetTitle>
          <SheetDescription className="text-muted-foreground">{lead.email}</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            <section>
              <h3 className="font-semibold text-foreground mb-2">Cursos &amp; Progresso</h3>
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum curso adquirido</p>
              ) : (
                <div className="space-y-2">
                  {courses.map((c) => (
                    <div key={c.id} className="border border-border rounded-lg p-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{c.courseTitle}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.completedLessons}/{c.totalLessons} aulas
                        </span>
                      </div>
                      <Progress value={c.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {c.progress}% concluído
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Mentoria</h3>
              {mentorship ? (
                <div className="border border-border rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground">{mentorship.service}</p>
                  {mentorship.purchaseDate && (
                    <p className="text-xs text-muted-foreground">
                      Data: {new Date(mentorship.purchaseDate).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma mentoria</p>
              )}
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Roda da Vida</h3>
              {assessments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma avaliação realizada</p>
              ) : (
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
                        <span className="text-xs text-muted-foreground">
                          {formatDate(a.date || a.created)}
                        </span>
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
                        <div className="space-y-1 flex-1 min-w-[140px]">
                          <label className="text-xs text-muted-foreground">Avaliação Pós</label>
                          <Select value={postId} onValueChange={setPostId}>
                            <SelectTrigger className="bg-background border-border text-foreground">
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
                      </div>

                      {canCompare && (
                        <>
                          <div className="w-full">
                            <LifeWheelChart data={comparisonData} showComparison />
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {preId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  downloadLifeWheelPdf(preId).catch(() =>
                                    toast.error('Erro ao baixar PDF'),
                                  )
                                }
                              >
                                <Download className="mr-1 h-3 w-3" /> PDF Pré
                              </Button>
                            )}
                            {postId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  downloadLifeWheelPdf(postId).catch(() =>
                                    toast.error('Erro ao baixar PDF'),
                                  )
                                }
                              >
                                <Download className="mr-1 h-3 w-3" /> PDF Pós
                              </Button>
                            )}
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
              )}
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Reuniões &amp; Estratégias</h3>
              <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/50">
                <Input
                  placeholder="Tipo (ex: Reunião, Estratégia)"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="h-8 text-sm bg-background border-border text-foreground"
                />
                <Textarea
                  placeholder="Notas da reunião..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={2}
                  className="text-sm bg-background border-border text-foreground"
                />
                <Button
                  size="sm"
                  onClick={handleAddInteraction}
                  disabled={!newContent.trim() || saving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="mr-2 h-3 w-3" /> Registrar
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {interactions.map((i) => (
                  <div
                    key={i.id}
                    className="border border-border rounded-lg p-3 text-sm bg-background"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        {i.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(i.created).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p
                      className="text-foreground"
                      dangerouslySetInnerHTML={{ __html: i.content }}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
