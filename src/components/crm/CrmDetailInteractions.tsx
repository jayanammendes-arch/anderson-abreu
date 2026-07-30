import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Send } from 'lucide-react'
import { createCrmInteraction } from '@/services/crm'
import type { CrmInteraction } from '@/types'

interface Props {
  leadId: string
  interactions: CrmInteraction[]
  onAdded: (interaction: CrmInteraction) => void
}

export function CrmDetailInteractions({ leadId, interactions, onAdded }: Props) {
  const [type, setType] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const created = await createCrmInteraction({
        lead: leadId,
        type: type || 'Nota',
        content,
      })
      onAdded(created as CrmInteraction)
      setType('')
      setContent('')
      toast.success('Interação registrada!')
    } catch {
      toast.error('Erro ao adicionar interação')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/50">
        <Input
          placeholder="Tipo (ex: Ligação, WhatsApp, Reunião)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-8 text-sm bg-background border-border text-foreground"
        />
        <Textarea
          placeholder="Conteúdo da interação..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="text-sm bg-background border-border text-foreground"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!content.trim() || saving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="mr-2 h-3 w-3" /> Registrar
        </Button>
      </div>
      {interactions.map((i) => (
        <div key={i.id} className="border border-border rounded-lg p-3 text-sm bg-background">
          <div className="flex items-center justify-between mb-1">
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {i.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(i.created).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <p className="text-foreground" dangerouslySetInnerHTML={{ __html: i.content }} />
        </div>
      ))}
    </div>
  )
}
