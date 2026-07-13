import { useState, useEffect, useCallback } from 'react'
import { Mail, Trash2, Loader2, Phone, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  adminGetContacts,
  adminDeleteContact,
  type AdminContactSubmission,
} from '@/services/admin-contacts'

export default function AdminContacts() {
  const [contacts, setContacts] = useState<AdminContactSubmission[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const data = await adminGetContacts()
      setContacts(data)
    } catch {
      toast.error('Falha ao carregar mensagens')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      await adminDeleteContact(id)
      setContacts((prev) => prev.filter((c) => c.id !== id))
      toast.success('Mensagem excluída')
    } catch {
      toast.error('Falha ao excluir mensagem')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-white">Mensagens de Contato</h2>
        <span className="text-sm text-muted-foreground">({contacts.length})</span>
      </div>
      {contacts.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma mensagem recebida
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card key={contact.id} className="bg-card/50 border-border/50 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg text-white">{contact.name}</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() => handleDelete(contact.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {contact.email}
                  </a>
                  {contact.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(contact.created).toLocaleString('pt-BR')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contact.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
