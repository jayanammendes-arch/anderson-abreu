import { useState, useEffect } from 'react'
import {
  getPlatformSettings,
  updatePlatformSettings,
  createPlatformSettings,
} from '@/services/admin-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PlatformSettings } from '@/types'

export function SupportSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    whatsapp_number: '',
    support_email: '',
    about_content: '',
  })
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPlatformSettings()
        if (data) {
          setSettings(data)
          setForm({
            whatsapp_number: data.whatsapp_number || '',
            support_email: data.support_email || '',
            about_content: (data as any).about_content || '',
          })
        }
      } catch {
        toast.error('Erro ao carregar configurações')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const validateEmail = (email: string) => {
    if (!email) return ''
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email) ? '' : 'Email inválido'
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateEmail(form.support_email)
    if (err) {
      setEmailError(err)
      return
    }
    setEmailError('')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('whatsapp_number', form.whatsapp_number)
      fd.append('support_email', form.support_email)
      fd.append('about_content', form.about_content)
      if (settings) await updatePlatformSettings(settings.id, fd)
      else await createPlatformSettings(fd)
      toast.success('Configurações de suporte salvas!')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Configurações de Suporte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                placeholder="+55 (11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label>Email de Suporte</Label>
              <Input
                type="email"
                value={form.support_email}
                onChange={(e) => setForm({ ...form, support_email: e.target.value })}
                placeholder="suporte@example.com"
              />
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Conteúdo abaixo da Central de Ajuda</Label>
            <RichTextEditor
              value={form.about_content}
              onChange={(html) => setForm({ ...form, about_content: html })}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
