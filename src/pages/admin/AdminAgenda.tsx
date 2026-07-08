import { useState, useEffect } from 'react'
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventImageUrl,
} from '@/services/landing'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2, Save, X, Image as ImageIcon } from 'lucide-react'

const emptyEvent: Partial<Event> = {
  title: '',
  date: new Date().toISOString().slice(0, 16),
  description: '',
  location: '',
  type: 'presencial',
}

export default function AdminAgenda() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Event>>(emptyEvent)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const loadEvents = async () => {
    setIsLoading(true)
    try {
      setEvents(await getEvents())
    } catch {
      toast.error('Erro ao carregar eventos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', formData.title || '')
      fd.append('date', formData.date || '')
      fd.append('description', formData.description || '')
      fd.append('location', formData.location || '')
      fd.append('type', formData.type || 'presencial')
      if (imageFile) fd.append('image', imageFile)

      if (formData.id) {
        await updateEvent(formData.id, fd)
        toast.success('Evento atualizado!')
      } else {
        await createEvent(fd)
        toast.success('Evento criado!')
      }
      setIsEditing(false)
      setImageFile(null)
      loadEvents()
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este evento?')) return
    try {
      await deleteEvent(id)
      toast.success('Evento excluído!')
      loadEvents()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const handleEdit = (event: Event) => {
    setFormData({ ...event, date: new Date(event.date).toISOString().slice(0, 16) })
    setImageFile(null)
    setIsEditing(true)
  }

  const handleNew = () => {
    setFormData(emptyEvent)
    setImageFile(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setImageFile(null)
  }

  const previewUrl = imageFile
    ? URL.createObjectURL(imageFile)
    : formData.id && formData.image
      ? getEventImageUrl({ id: formData.id, image: formData.image })
      : null

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>{formData.id ? 'Editar Evento' : 'Novo Evento'}</CardTitle>
          </CardHeader>
          <CardContent>
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
                />
              </div>
              <div className="space-y-2">
                <Label>Imagem do Evento</Label>
                {previewUrl && (
                  <div className="mb-2 overflow-hidden rounded-lg border border-border/50">
                    <img src={previewUrl} alt="Preview" className="h-40 w-full object-cover" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">JPG, PNG ou WebP. Máximo 5MB.</p>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-24"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}{' '}
                  Salvar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Gerenciamento de eventos</p>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum evento cadastrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => {
            const imageUrl = getEventImageUrl(event)
            return (
              <Card
                key={event.id}
                className="flex items-center gap-4 p-4 bg-card/50 border-border/50"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={event.title}
                    className="h-16 w-24 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
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
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
