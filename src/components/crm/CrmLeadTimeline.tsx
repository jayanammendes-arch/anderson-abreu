import {
  Phone,
  Globe,
  DollarSign,
  Clock,
  BookOpen,
  Award,
  Radar,
  StickyNote,
  MessageSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type {
  CrmLead,
  CrmInteraction,
  CrmPurchase,
  LifeWheelAssessment,
  LifeWheelCategory,
} from '@/types'
import type { StudentCourseProgress } from '@/services/crm'

interface CrmLeadTimelineProps {
  socialLead: CrmLead | null
  socialInteractions: CrmInteraction[]
  userCreated: string
  courses: StudentCourseProgress[]
  certificates: Array<{ id: string; issue_date?: string; expand?: { course?: { title: string } } }>
  assessments: LifeWheelAssessment[]
  categories: LifeWheelCategory[]
  purchases: CrmPurchase[]
}

interface TimelineEvent {
  date: string
  title: string
  description?: string
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function TimelineSection({
  icon: Icon,
  title,
  color,
  events,
}: {
  icon: typeof Phone
  title: string
  color: string
  events: TimelineEvent[]
}) {
  if (events.length === 0) return null
  return (
    <section>
      <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3">
        <Icon className={`h-4 w-4 ${color}`} />
        {title}
      </h4>
      <div className={`relative pl-6 border-l-2 ${color.replace('text-', 'border-')}/30 space-y-3`}>
        {events.map((event, idx) => (
          <div key={idx} className="relative">
            <div
              className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full ${color.replace('text-', 'bg-')} ring-2 ring-background`}
            />
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(event.date)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CrmLeadTimeline({
  socialLead,
  socialInteractions,
  userCreated,
  courses,
  certificates,
  assessments,
  categories,
  purchases,
}: CrmLeadTimelineProps) {
  const socialEvents: TimelineEvent[] = []
  if (socialLead) {
    socialEvents.push({
      date: socialLead.created,
      title: 'Lead criado no Social Seller',
      description: `Estágio inicial: ${socialLead.stage}`,
    })
    if (socialLead.notes) {
      socialEvents.push({
        date: socialLead.updated || socialLead.created,
        title: 'Nota adicionada',
        description: socialLead.notes,
      })
    }
    for (const interaction of socialInteractions) {
      socialEvents.push({
        date: interaction.created,
        title: `Interação: ${interaction.type || 'Nota'}`,
        description: interaction.content?.replace(/<[^>]*>/g, '').substring(0, 120) || '',
      })
    }
    socialEvents.push({
      date: socialLead.updated || socialLead.created,
      title: `Estágio atual: ${socialLead.stage}`,
    })
  }

  const platformEvents: TimelineEvent[] = []
  if (userCreated) {
    platformEvents.push({
      date: userCreated,
      title: 'Registro na plataforma',
    })
  }
  for (const course of courses) {
    platformEvents.push({
      date: userCreated,
      title: `Curso: ${course.courseTitle}`,
      description: `${course.completedLessons}/${course.totalLessons} aulas — ${course.progress}% concluído`,
    })
  }
  for (const cert of certificates) {
    platformEvents.push({
      date: cert.issue_date || cert.id,
      title: 'Certificado emitido',
      description: cert.expand?.course?.title || '—',
    })
  }
  for (const assessment of assessments) {
    const avg = assessment.scores?.overall_average
    platformEvents.push({
      date: assessment.date || assessment.created,
      title: `Roda da Vida — ${assessment.type === 'pre' ? 'Pré' : 'Pós'}-avaliação`,
      description: avg ? `Média: ${avg.toFixed(1)}` : undefined,
    })
  }

  const purchaseEvents: TimelineEvent[] = purchases.map((p) => ({
    date: p.purchase_date || p.created,
    title: p.expand?.course?.title || p.mentorship_service || 'Compra',
    description: p.amount > 0 ? `R$ ${p.amount.toFixed(2)}` : undefined,
  }))

  return (
    <div className="space-y-6">
      <TimelineSection
        icon={Phone}
        title="📱 Social Seller"
        color="text-blue-500"
        events={socialEvents}
      />
      <TimelineSection
        icon={Globe}
        title="🌐 Plataforma"
        color="text-green-500"
        events={platformEvents}
      />
      <TimelineSection
        icon={DollarSign}
        title="💰 Compras"
        color="text-amber-500"
        events={purchaseEvents}
      />
    </div>
  )
}
