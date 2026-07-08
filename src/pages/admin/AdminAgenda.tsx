import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/services/landing'
import type { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, ArrowLeft, Loader2, Save, X } from 'lucide-react'

export default function AdminAgenda() {
  const { isAuthenticated, loading } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    date: new Date().toISOString().slice(0, 16),
    description: '',
    location: '',
    type: 'presencial',
  })
  const [isSaving, setIsSaving] = useState(false)

  const loadEvents = async () => {
    setIsLoadingEvents(true)
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      toast.error('Erro ao carregar eventos')
    } finally {
      setIsLoadingEvents(false)
    }
  }

  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadEvents()
    }
  }, [isAuthenticated, loading])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (formData.id) {
        await updateEvent(formData.id, formData)
        toast.success('Evento atualizado com sucesso!')
      } else {
        await createEvent(formData)
        toast.success('Evento criado com sucesso!')
      }
      setIsEditing(false)
      loadEvents()
    } catch (err) {
      toast.error('Erro ao salvar evento')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return
    try {
      await deleteEvent(id)
      toast.success('Evento excluído!')
      loadEvents()
    } catch (err) {
      toast.error('Erro ao excluir evento')
    }
  }

  const handleEdit = (event: Event) => {
    // Format date string for the datetime-local input (YYYY-MM-DDThh:mm)
    const d = new Date(event.date)
    const formattedDate = d.toISOString().slice(0, 16)

    setFormData({ ...event, date: formattedDate })
    setIsEditing(true)
  }

  const handleNew = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().slice(0, 16),
      description: '',
      location: '',
      type: 'presencial',
    })
    setIsEditing(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Admin: Agenda</h1>
            <p className="text-sm text-muted-foreground">Gerenciamento de eventos</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" /> Novo Evento
          </Button>
        )}
      </header>

      <main className="container mx-auto px-6 py-8">
        {isEditing ? (
          <div className="max-w-2xl mx-auto bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-6">
              {formData.id ? 'Editar Evento' : 'Novo Evento'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data e Hora</Label>
                  <Input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, type: v as 'presencial' | 'online' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Local / Link</Label>
                <Input
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Av Paulista, 1000 ou link do Zoom"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição Curta</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-24"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-card border rounded-lg overflow-hidden">
            {isLoadingEvents ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                Nenhum evento cadastrado.
              </div>
            ) : (
              <div className="divide-y">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className="text-sm text-muted-foreground flex gap-3 mt-1">
                        <span>{new Date(event.date).toLocaleString('pt-BR')}</span>
                        <span>•</span>
                        <span className="capitalize">{event.type}</span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{event.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
