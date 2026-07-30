import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  getPreHypnosisForm,
  createPreHypnosisForm,
  updatePreHypnosisForm,
} from '@/services/pre-hypnosis-forms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, CheckCircle2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { PreHypnosisForm as PreHypnosisFormType } from '@/types'

export default function PreHypnosisForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [existing, setExisting] = useState<PreHypnosisFormType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [reason, setReason] = useState('')
  const [healthInfo, setHealthInfo] = useState('')
  const [medications, setMedications] = useState('')
  const [expectations, setExpectations] = useState('')

  useEffect(() => {
    if (!user) return
    getPreHypnosisForm(user.id)
      .then((form) => {
        if (form) {
          setExisting(form)
          const r = form.responses || {}
          setName(r.name || user.name || '')
          setPhone(r.phone || user.phone || '')
          setReason(r.reason || '')
          setHealthInfo(r.healthInfo || '')
          setMedications(r.medications || '')
          setExpectations(r.expectations || '')
        } else {
          setName(user.name || '')
          setPhone(user.phone || '')
        }
      })
      .finally(() => setLoading(false))
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const responses = { name, phone, reason, healthInfo, medications, expectations }
    try {
      if (existing) {
        await updatePreHypnosisForm(existing.id, { responses, completed: true })
      } else {
        await createPreHypnosisForm({ user: user.id, responses, completed: true })
      }
      toast.success('Formulário salvo com sucesso!')
      navigate('/dashboard/comece-por-aqui')
    } catch {
      toast.error('Erro ao salvar formulário')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-10">
      <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/comece-por-aqui')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Formulário Pré-Hipnose</h1>
        <p className="text-muted-foreground mt-2">
          Preencha este formulário para iniciarmos seu processo.
        </p>
      </div>
      {existing?.completed && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" /> Formulário já preenchido. Você pode atualizar as
          informações.
        </div>
      )}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da busca por hipnose *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
                placeholder="Descreva o que a levou a buscar a hipnose..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="healthInfo">Informações de saúde relevantes</Label>
              <Textarea
                id="healthInfo"
                value={healthInfo}
                onChange={(e) => setHealthInfo(e.target.value)}
                rows={3}
                placeholder="Condições de saúde, tratamentos em andamento..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medications">Medicamentos em uso</Label>
              <Input
                id="medications"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="Liste os medicamentos, se houver"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectations">Expectativas com o tratamento</Label>
              <Textarea
                id="expectations"
                value={expectations}
                onChange={(e) => setExpectations(e.target.value)}
                rows={2}
                placeholder="O que você espera alcançar..."
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Formulário
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
