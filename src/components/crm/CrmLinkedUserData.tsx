import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getLinkedUserData } from '@/services/crm'
import type { CrmPurchase, UserAccess, Certificate, LifeWheelAssessment } from '@/types'

interface CrmLinkedUserDataProps {
  userId: string
  purchases: CrmPurchase[]
}

export function CrmLinkedUserData({ userId, purchases }: CrmLinkedUserDataProps) {
  const [data, setData] = useState<{
    access: UserAccess[]
    certificates: Certificate[]
    assessments: LifeWheelAssessment[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getLinkedUserData(userId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  if (!data) return <p className="text-sm text-gray-500">Não foi possível carregar os dados.</p>

  const Section = ({
    title,
    items,
  }: {
    title: string
    items: { id: string; left: string; right: string }[]
  }) => (
    <div>
      <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
      {items.length === 0 ? (
        <p className="text-gray-400 text-xs">Nenhum registro.</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border border-gray-200 rounded p-2 text-xs bg-white"
            >
              <span className="text-gray-700">{item.left}</span>
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                {item.right}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4 text-sm">
      <Section
        title="Cursos Atribuídos"
        items={data.access.map((a) => ({
          id: a.id,
          left: a.expand?.course?.title || '—',
          right: new Date(a.created).toLocaleDateString('pt-BR'),
        }))}
      />
      <Section
        title="Certificados"
        items={data.certificates.map((c) => ({
          id: c.id,
          left: c.expand?.course?.title || '—',
          right: c.issue_date || '—',
        }))}
      />
      <Section
        title="Roda da Vida"
        items={data.assessments.map((a) => ({
          id: a.id,
          left: a.type === 'pre' ? 'Pré-avaliação' : 'Pós-avaliação',
          right: a.scores?.overall_average?.toFixed(1) || '—',
        }))}
      />
      <Section
        title="Compras (CRM)"
        items={purchases.map((p) => ({
          id: p.id,
          left: p.expand?.course?.title || p.mentorship_service || '—',
          right: p.amount > 0 ? `R$ ${p.amount}` : p.purchase_date || '—',
        }))}
      />
    </div>
  )
}
