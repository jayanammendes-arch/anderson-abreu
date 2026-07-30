import { useState, useEffect } from 'react'
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
  getLifeWheelAssessments,
  downloadLifeWheelPdf,
  downloadLifeWheelComparisonPdf,
} from '@/services/life-wheel'
import type { LifeWheelAssessment, CrmInteraction } from '@/types'

interface Props {
  lead: SiteLeadSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CrmStudentDetailSheet({ lead, open, onOpenChange }: Props) {
  const [courses, setCourses] = useState<StudentCourseProgress[]>([])
  const [mentorship, setMentorship] = useState<StudentMentorship | null>(null)
  const [assessments, setAssessments] = useState<LifeWheelAssessment[]>([])
  const [interactions, setInteractions] = useState<CrmInteraction[]>([])
  const [loading, setLoading] = useState(false)
  const [newType, setNewType] = useState('')
  const [newContent, setNewContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!lead) return
    setLoading(true)
    const userId = lead.linked_user
    Promise.all([
      userId ? getStudentCoursesWithProgress(userId).catch(() => []) : Promise.resolve([]),
      getStudentMentorship(lead.id).catch(() => null),
      userId ? getLifeWheelAssessments(userId).catch(() => []) : Promise.resolve([]),
      getCrmInteractions(lead.id).catch(() => []),
    ])
      .then(([c, m, a, i]) => {
        setCourses(c)
        setMentorship(m)
        setAssessments(a as LifeWheelAssessment[])
        setInteractions(i as CrmInteraction[])
      })
      .finally(() => setLoading(false))
  }, [lead])

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

  const preAssessment = assessments.find((a) => a.type === 'pre')
  const postAssessment = assessments.find((a) => a.type === 'post')
  const canCompare = !!(preAssessment && postAssessment)

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
                <div className="space-y-2">
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
                          {new Date(a.date || a.created).toLocaleDateString('pt-BR')}
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
                  {canCompare && preAssessment && postAssessment && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        downloadLifeWheelComparisonPdf(preAssessment.id, postAssessment.id).catch(
                          () => toast.error('Erro ao baixar PDF comparativo'),
                        )
                      }
                    >
                      <BarChart3 className="mr-2 h-4 w-4" /> Comparar Evolução
                    </Button>
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
