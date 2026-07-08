import { useState, useEffect } from 'react'
import {
  getPlatformSettings,
  updatePlatformSettings,
  createPlatformSettings,
} from '@/services/admin-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PlatformSettings } from '@/types'

export default function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logo, setLogo] = useState<File | null>(null)
  const [loginImage, setLoginImage] = useState<File | null>(null)
  const [form, setForm] = useState({
    company_name: '',
    primary_color: '',
    landing_page_json: '',
    login_text: '',
    login_gradient: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPlatformSettings()
        if (data) {
          setSettings(data)
          setForm({
            company_name: data.company_name || '',
            primary_color: data.primary_color || '',
            landing_page_json: data.landing_page_json
              ? JSON.stringify(data.landing_page_json, null, 2)
              : '',
            login_text: data.login_text || '',
            login_gradient: data.login_gradient || '',
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('company_name', form.company_name)
      fd.append('primary_color', form.primary_color)
      fd.append('login_text', form.login_text)
      fd.append('login_gradient', form.login_gradient)
      try {
        fd.append('landing_page_json', JSON.stringify(JSON.parse(form.landing_page_json)))
      } catch {
        /* intentionally ignored */
      }
      if (logo) fd.append('logo', logo)
      if (loginImage) fd.append('login_image', loginImage)
      if (settings) await updatePlatformSettings(settings.id, fd)
      else await createPlatformSettings(fd)
      toast.success('Configurações salvas!')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-bold">Configurações da Plataforma</h1>
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Empresa</Label>
            <Input
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Cor Primária (hex)</Label>
            <div className="flex gap-2">
              <Input
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                placeholder="#0047AB"
              />
              {form.primary_color && (
                <div
                  className="h-10 w-10 rounded border border-border"
                  style={{ backgroundColor: form.primary_color }}
                />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Login Customização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Imagem de Login</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setLoginImage(e.target.files?.[0] || null)}
            />
          </div>
          <div className="space-y-2">
            <Label>Texto de Login</Label>
            <Input
              value={form.login_text}
              onChange={(e) => setForm({ ...form, login_text: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Gradiente de Login</Label>
            <Input
              value={form.login_gradient}
              onChange={(e) => setForm({ ...form, login_gradient: e.target.value })}
              placeholder="from-blue-900 via-blue-950 to-black"
            />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Landing Page (JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.landing_page_json}
            onChange={(e) => setForm({ ...form, landing_page_json: e.target.value })}
            className="min-h-[200px] font-mono text-sm"
            placeholder='{"sections": [...]}'
          />
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}{' '}
          Salvar
        </Button>
      </div>
    </form>
  )
}
