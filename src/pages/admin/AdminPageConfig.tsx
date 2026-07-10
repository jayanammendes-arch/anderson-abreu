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
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PlatformSettings } from '@/types'

interface FormState {
  hero_title: string
  hero_subtitle: string
  hero_cta_text: string
  about_title: string
  about_content: string
  stats_students: string
  stats_years: string
  stats_courses: string
  stats_countries: string
  testimonials_active: boolean
  agenda_highlight_title: string
  agenda_intro: string
  courses_title: string
  courses_intro: string
  contact_title: string
  contact_intro: string
  support_email: string
  whatsapp_number: string
  contact_phone: string
}

const emptyForm: FormState = {
  hero_title: '',
  hero_subtitle: '',
  hero_cta_text: '',
  about_title: '',
  about_content: '',
  stats_students: '',
  stats_years: '',
  stats_courses: '',
  stats_countries: '',
  testimonials_active: true,
  agenda_highlight_title: '',
  agenda_intro: '',
  courses_title: '',
  courses_intro: '',
  contact_title: '',
  contact_intro: '',
  support_email: '',
  whatsapp_number: '',
  contact_phone: '',
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function LabeledTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px]"
      />
    </div>
  )
}

function ImageUpload({ label, onFile }: { label: string; onFile: (f: File | null) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
    </div>
  )
}

export default function AdminPageConfig() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [heroImage, setHeroImage] = useState<File | null>(null)
  const [aboutImage, setAboutImage] = useState<File | null>(null)
  const [agendaImage, setAgendaImage] = useState<File | null>(null)

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((p) => ({ ...p, [key]: value }))

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPlatformSettings()
        if (data) {
          setSettings(data)
          setForm({
            hero_title: data.hero_title || '',
            hero_subtitle: data.hero_subtitle || '',
            hero_cta_text: data.hero_cta_text || '',
            about_title: data.about_title || '',
            about_content: data.about_content || '',
            stats_students: String(data.stats_students || ''),
            stats_years: String(data.stats_years || ''),
            stats_courses: String(data.stats_courses || ''),
            stats_countries: String(data.stats_countries || ''),
            testimonials_active: data.testimonials_active !== false,
            agenda_highlight_title: data.agenda_highlight_title || '',
            agenda_intro: data.agenda_intro || '',
            courses_title: data.courses_title || '',
            courses_intro: data.courses_intro || '',
            contact_title: data.contact_title || '',
            contact_intro: data.contact_intro || '',
            support_email: data.support_email || '',
            whatsapp_number: data.whatsapp_number || '',
            contact_phone: data.contact_phone || '',
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
      fd.append('hero_title', form.hero_title)
      fd.append('hero_subtitle', form.hero_subtitle)
      fd.append('hero_cta_text', form.hero_cta_text)
      fd.append('about_title', form.about_title)
      fd.append('about_content', form.about_content)
      fd.append('stats_students', String(form.stats_students || 0))
      fd.append('stats_years', String(form.stats_years || 0))
      fd.append('stats_courses', String(form.stats_courses || 0))
      fd.append('stats_countries', String(form.stats_countries || 0))
      fd.append('testimonials_active', String(form.testimonials_active))
      fd.append('agenda_highlight_title', form.agenda_highlight_title)
      fd.append('agenda_intro', form.agenda_intro)
      fd.append('courses_title', form.courses_title)
      fd.append('courses_intro', form.courses_intro)
      fd.append('contact_title', form.contact_title)
      fd.append('contact_intro', form.contact_intro)
      fd.append('support_email', form.support_email)
      fd.append('whatsapp_number', form.whatsapp_number)
      fd.append('contact_phone', form.contact_phone)
      if (heroImage) fd.append('home_hero_image', heroImage)
      if (aboutImage) fd.append('about_image', aboutImage)
      if (agendaImage) fd.append('agenda_image', agendaImage)
      if (settings) await updatePlatformSettings(settings.id, fd)
      else await createPlatformSettings(fd)
      toast.success('Configurações de páginas salvas!')
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
    <form onSubmit={handleSave} className="space-y-6 animate-fade-in max-w-4xl">
      <h1 className="text-2xl font-bold">Configuração de Páginas Principais</h1>
      <Tabs defaultValue="home">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="sobre">Sobre</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="cursos">Cursos</TabsTrigger>
          <TabsTrigger value="contato">Fale Conosco</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <LabeledInput
                label="Título principal do hero"
                value={form.hero_title}
                onChange={(v) => set('hero_title', v)}
              />
              <LabeledTextarea
                label="Subtítulo do hero"
                value={form.hero_subtitle}
                onChange={(v) => set('hero_subtitle', v)}
              />
              <LabeledInput
                label="Texto do botão de call-to-action"
                value={form.hero_cta_text}
                onChange={(v) => set('hero_cta_text', v)}
              />
              <ImageUpload label="Imagem do hero" onFile={setHeroImage} />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Alunos formados</Label>
                  <Input
                    type="number"
                    value={form.stats_students}
                    onChange={(e) => set('stats_students', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Anos de história</Label>
                  <Input
                    type="number"
                    value={form.stats_years}
                    onChange={(e) => set('stats_years', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cursos</Label>
                  <Input
                    type="number"
                    value={form.stats_courses}
                    onChange={(e) => set('stats_courses', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Países</Label>
                  <Input
                    type="number"
                    value={form.stats_countries}
                    onChange={(e) => set('stats_countries', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={form.testimonials_active}
                  onCheckedChange={(v) => set('testimonials_active', v)}
                />
                <Label>Ativar/Desativar Seção de Depoimentos</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sobre">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <LabeledInput
                label="Título da seção"
                value={form.about_title}
                onChange={(v) => set('about_title', v)}
              />
              <div className="space-y-2">
                <Label>Texto descritivo</Label>
                <RichTextEditor
                  value={form.about_content}
                  onChange={(html) => set('about_content', html)}
                />
              </div>
              <ImageUpload label="Imagem da seção" onFile={setAboutImage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <LabeledInput
                label="Título da seção"
                value={form.agenda_highlight_title}
                onChange={(v) => set('agenda_highlight_title', v)}
              />
              <LabeledTextarea
                label="Texto introdutório"
                value={form.agenda_intro}
                onChange={(v) => set('agenda_intro', v)}
              />
              <ImageUpload label="Imagem de fundo ou banner" onFile={setAgendaImage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cursos">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <LabeledInput
                label="Título da seção"
                value={form.courses_title}
                onChange={(v) => set('courses_title', v)}
              />
              <LabeledTextarea
                label="Texto introdutório"
                value={form.courses_intro}
                onChange={(v) => set('courses_intro', v)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contato">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <LabeledInput
                label="Título da seção"
                value={form.contact_title}
                onChange={(v) => set('contact_title', v)}
              />
              <LabeledTextarea
                label="Texto introdutório"
                value={form.contact_intro}
                onChange={(v) => set('contact_intro', v)}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LabeledInput
                  label="Email de Suporte"
                  value={form.support_email}
                  onChange={(v) => set('support_email', v)}
                />
                <LabeledInput
                  label="WhatsApp"
                  value={form.whatsapp_number}
                  onChange={(v) => set('whatsapp_number', v)}
                />
                <LabeledInput
                  label="Telefone"
                  value={form.contact_phone}
                  onChange={(v) => set('contact_phone', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
