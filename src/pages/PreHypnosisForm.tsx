import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getPreHypnosisForm, createPreHypnosisForm } from '@/services/pre-hypnosis-forms'
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
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [motivoDaBusca, setMotivoDaBusca] = useState('')
  const [informacoesSaude, setInformacoesSaude] = useState('')
  const [medicamentos, setMedicamentos] = useState('')
  const [expectativas, setExpectativas] = useState('')

  useEffect(() => {
    if (!user) return
    getPreHypnosisForm(user.id)
      .then((form) => {
        if (form) setExisting(form)
        else setNome(user.name || '')
      })
      .finally(() => setLoading(false))
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await createPreHypnosisForm({
        user: user.id,
        nome,
        telefone,
        motivo_da_busca: motivoDaBusca,
        informacoes_de_saude: informacoesSaude,
        medicamentos,
        expectativas,
      })
      toast.success('Formulário enviado com sucesso!')
      navigate('/dashboard/comece-por-aqui')
    } catch {
      toast.error('Erro ao enviar formulário')
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

  if (existing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/comece-por-aqui')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formulário Pré-Hipnose</h1>
          <p className="text-muted-foreground mt-2">
            Seu formulário foi enviado e não pode mais ser editado.
          </p>
        </div>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Formulário preenchido</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Nome completo</Label>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {existing.nome || '—'}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Telefone</Label>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {existing.telefone || '—'}
                </p>
              </div>
            </div>
            <ReadOnlyField label="Motivo da busca por hipnose" value={existing.motivo_da_busca} />
            <ReadOnlyField
              label="Informações de saúde relevantes"
              value={existing.informacoes_de_saude}
            />
            <ReadOnlyField label="Medicamentos em uso" value={existing.medicamentos} />
            <ReadOnlyField label="Expectativas com o tratamento" value={existing.expectativas} />
          </CardContent>
        </Card>
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
          Preencha este formulário para iniciarmos seu processo. Após o envio, o formulário não
          poderá ser editado.
        </p>
      </div>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo da busca por hipnose *</Label>
              <Textarea
                id="motivo"
                value={motivoDaBusca}
                onChange={(e) => setMotivoDaBusca(e.target.value)}
                required
                rows={3}
                placeholder="Descreva o que a levou a buscar a hipnose..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saude">Informações de saúde relevantes *</Label>
              <Textarea
                id="saude"
                value={informacoesSaude}
                onChange={(e) => setInformacoesSaude(e.target.value)}
                required
                rows={3}
                placeholder="Condições de saúde, tratamentos em andamento..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicamentos">Medicamentos em uso *</Label>
              <Input
                id="medicamentos"
                value={medicamentos}
                onChange={(e) => setMedicamentos(e.target.value)}
                required
                placeholder="Liste os medicamentos, se houver"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectativas">Expectativas com o tratamento *</Label>
              <Textarea
                id="expectativas"
                value={expectativas}
                onChange={(e) => setExpectativas(e.target.value)}
                required
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
              Enviar Formulário
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="text-sm text-foreground whitespace-pre-wrap">{value || '—'}</p>
    </div>
  )
}
