import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { ArrowLeft, Save, Loader2, Lock } from 'lucide-react'
import {
  CRM_STAGES,
  getCrmLeadById,
  getCrmInteractions,
  getCrmPurchases,
  updateCrmLeadStage,
  updateCrmLeadNotes,
  updateCrmLeadField,
  getStudentCoursesWithProgress,
  getStudentMentorship,
  getCounterpartLead,
  type StudentCourseProgress,
  type StudentMentorship,
} from '@/services/crm'
import { getLifeWheelCategories, getLifeWheelAssessments } from '@/services/life-wheel'
import { getCertificates } from '@/services/certificates'
import { CrmDetailInteractions } from '@/components/crm/CrmDetailInteractions'
import { CrmPreHypnosisForm } from '@/components/crm/CrmPreHypnosisForm'
import { CrmLeadTreatments } from '@/components/crm/CrmLeadTreatments'
import { CrmDetailLifeWheel } from '@/components/crm/CrmDetailLifeWheel'
import { CrmLinkedUserData } from '@/components/crm/CrmLinkedUserData'
import { CrmLeadTimeline } from '@/components/crm/CrmLeadTimeline'
import type {
  CrmLead,
  CrmInteraction,
  CrmPurchase,
  LifeWheelAssessment,
  LifeWheelCategory,
} from '@/types'

export default function CrmLeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<CrmLead | null>(null)
  const [interactions, setInteractions] = useState<CrmInteraction[]>([])
  const [purchases, setPurchases] = useState<CrmPurchase[]>([])
  const [courses, setCourses] = useState<StudentCourseProgress[]>([])
  const [mentorship, setMentorship] = useState<StudentMentorship | null>(null)
  const [assessments, setAssessments] = useState<LifeWheelAssessment[]>([])
  const [categories, setCategories] = useState<LifeWheelCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [stage, setStage] = useState('')
  const [phone, setPhone] = useState('')
  const [instagram, setInstagram] = useState('')
  const [saving, setSaving] = useState(false)
  const [socialLead, setSocialLead] = useState<CrmLead | null>(null)
  const [socialInteractions, setSocialInteractions] = useState<CrmInteraction[]>([])
  const [certificates, setCertificates] = useState<any[]>([])

  useEffect(() => {
    if (!leadId) return
    setLoading(true)
    getCrmLeadById(leadId)
      .then(async (l) => {
        setLead(l)
        setNotes(l.notes || '')
        setStage(l.stage)
        setPhone(l.phone || '')
        setInstagram(l.instagram_handle || '')
        const [ints, purs, cats] = await Promise.all([
          getCrmInteractions(l.id).catch(() => []),
          getCrmPurchases(l.id).catch(() => []),
          getLifeWheelCategories().catch(() => []),
        ])
        setInteractions(ints as CrmInteraction[])
        setPurchases(purs as CrmPurchase[])
        setCategories(cats as LifeWheelCategory[])
        if (l.linked_user) {
          const [crs, ment, assmts, counterpart, certs] = await Promise.all([
            getStudentCoursesWithProgress(l.linked_user).catch(() => []),
            getStudentMentorship(l.id).catch(() => null),
            getLifeWheelAssessments(l.linked_user).catch(() => []),
            getCounterpartLead(l.linked_user, l.id).catch(() => null),
            getCertificates(l.linked_user).catch(() => []),
          ])
          setCourses(crs)
          setMentorship(ment)
          setAssessments(assmts as LifeWheelAssessment[])
          setSocialLead(counterpart)
          setCertificates(certs)
          if (counterpart) {
            const sInts = await getCrmInteractions(counterpart.id).catch(() => [])
            setSocialInteractions(sInts as CrmInteraction[])
          }
        }
      })
      .catch(() => toast.error('Lead não encontrado'))
      .finally(() => setLoading(false))
  }, [leadId])

  const isReadOnly = lead?.source === 'site'

  const handleSaveNotes = async () => {
    if (!lead) return
    setSaving(true)
    try {
      await updateCrmLeadNotes(lead.id, notes)
      toast.success('Notas salvas!')
    } catch {
      toast.error('Erro ao salvar notas')
    } finally {
      setSaving(false)
    }
  }
  const handleStageChange = async (s: string) => {
    if (!lead) return
    setStage(s)
    try {
      await updateCrmLeadStage(lead.id, s)
    } catch {
      toast.error('Erro ao alterar estágio')
    }
  }
  const handleSaveContact = async () => {
    if (!lead) return
    setSaving(true)
    try {
      await updateCrmLeadField(lead.id, { phone, instagram_handle: instagram })
      toast.success('Contato salvo!')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  if (!lead) return null

  return (
    <div className="space-y-6 max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/admin/crm')}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para CRM
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{lead.name}</h1>
        <p className="text-sm text-muted-foreground">{lead.email}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            {lead.source === 'site' ? 'Site' : 'Social Seller'}
          </Badge>
          {lead.linked_user && (
            <Badge variant="outline" className="text-primary border-primary/50">
              Usuário vinculado
            </Badge>
          )}
          {isReadOnly && (
            <Badge variant="outline" className="text-muted-foreground border-border gap-1">
              <Lock className="h-3 w-3" /> Dados sincronizados
            </Badge>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Telefone</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isReadOnly}
            className="mt-1 bg-background border-border text-foreground disabled:bg-muted"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Instagram</Label>
          <Input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            disabled={isReadOnly}
            className="mt-1 bg-background border-border text-foreground disabled:bg-muted"
          />
        </div>
      </div>
      {!isReadOnly && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSaveContact}
          disabled={saving}
          className="border-border text-foreground hover:bg-muted"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}{' '}
          Salvar contato
        </Button>
      )}
      <div>
        <Label className="text-xs text-muted-foreground">Estágio</Label>
        <Select value={stage} onValueChange={handleStageChange}>
          <SelectTrigger className="mt-1 bg-background border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CRM_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Notas</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-1 bg-background border-border text-foreground"
        />
        <Button
          size="sm"
          onClick={handleSaveNotes}
          disabled={saving}
          className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}{' '}
          Salvar Notas
        </Button>
      </div>
      {lead.linked_user && (
        <>
          <section>
            <h3 className="font-semibold text-foreground mb-2">Formulário Pré-Hipnose</h3>
            <CrmPreHypnosisForm userId={lead.linked_user} />
          </section>
          <section>
            <h3 className="font-semibold text-foreground mb-2">Tratamentos de Interesse</h3>
            <CrmLeadTreatments treatments={lead.treatments} />
          </section>
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
            <CrmDetailLifeWheel assessments={assessments} categories={categories} />
          </section>
          <section>
            <h3 className="font-semibold text-foreground mb-2">Dados Vinculados</h3>
            <CrmLinkedUserData userId={lead.linked_user} purchases={purchases} />
          </section>
        </>
      )}
      {socialLead && (
        <section>
          <h3 className="font-semibold text-foreground mb-3">Linha do Tempo da Jornada</h3>
          <CrmLeadTimeline
            socialLead={socialLead}
            socialInteractions={socialInteractions}
            userCreated={
              lead.expand?.linked_user?.created || (lead as any).expand?.linked_user?.created || ''
            }
            courses={courses}
            certificates={certificates}
            assessments={assessments}
            categories={categories}
            purchases={purchases}
          />
        </section>
      )}
      <section>
        <h3 className="font-semibold text-foreground mb-2">Interações</h3>
        <CrmDetailInteractions
          leadId={lead.id}
          interactions={interactions}
          onAdded={(i) => setInteractions((prev) => [i, ...prev])}
        />
      </section>
    </div>
  )
}
