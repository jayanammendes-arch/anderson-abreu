import { useState, useEffect } from 'react'
import { Loader2, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getPreHypnosisFormByUserId } from '@/services/pre-hypnosis-forms'
import type { PreHypnosisForm } from '@/types'

const FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  phone: 'Telefone',
  reason: 'Motivo da busca',
  healthInfo: 'Informações de saúde',
  medications: 'Medicamentos',
  expectations: 'Expectativas',
}

export function CrmPreHypnosisForm({ userId }: { userId: string }) {
  const [form, setForm] = useState<PreHypnosisForm | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPreHypnosisFormByUserId(userId)
      .then(setForm)
      .catch(() => setForm(null))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )

  if (!form) return <p className="text-sm text-muted-foreground">Nenhum formulário preenchido.</p>

  const entries = Object.entries(form.responses || {})

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4 text-primary" />
        <Badge variant={form.completed ? 'default' : 'secondary'}>
          {form.completed ? 'Completo' : 'Em andamento'}
        </Badge>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem respostas.</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map(([key, value]) => (
            <div key={key} className="border border-border rounded p-2 text-xs bg-background">
              <span className="font-medium text-foreground">{FIELD_LABELS[key] || key}:</span>
              <p className="text-muted-foreground mt-0.5 whitespace-pre-wrap">{value || '—'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
