import { useState, useEffect } from 'react'
import { Loader2, FileText } from 'lucide-react'
import { getPreHypnosisFormByUserId } from '@/services/pre-hypnosis-forms'
import type { PreHypnosisForm } from '@/types'

const FORM_FIELDS: ReadonlyArray<{ key: keyof PreHypnosisForm; label: string }> = [
  { key: 'nome', label: 'Nome' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'motivo_da_busca', label: 'Motivo da busca' },
  { key: 'informacoes_de_saude', label: 'Informações de saúde' },
  { key: 'medicamentos', label: 'Medicamentos' },
  { key: 'expectativas', label: 'Expectativas' },
]

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

  if (!form) return <p className="text-sm text-muted-foreground">Nenhum formulário enviado.</p>

  return (
    <div className="space-y-2 rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Formulário enviado</span>
      </div>
      <div className="space-y-1.5">
        {FORM_FIELDS.map(({ key, label }) => (
          <div key={key} className="border border-border rounded p-2 text-xs bg-background">
            <span className="font-medium text-foreground">{label}:</span>
            <p className="text-muted-foreground mt-0.5 whitespace-pre-wrap">
              {(form[key] as string) || '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
