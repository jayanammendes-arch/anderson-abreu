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
import { ServicesItemsEditor } from '@/components/admin/ServicesItemsEditor'
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
  instagram_handle: string
  facebook_url: string
  linkedin_url: string
  youtube_url: string
  company_name: string
  primary_color: string
  login_text: string
  login_gradient: string
  services_title: string
  services_subtitle: string
  services_items: string
  courses_section_title: string
  courses_section_text: string
  courses_section_button: string
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
  instagram_handle: '',
  facebook_url: '',
  linkedin_url: '',
  youtube_url: '',
  company_name: '',
  primary_color: '',
  login_text: '',
  login_gradient: '',
  services_title: '',
  services_subtitle: '',
  services_items: '[]',
  courses_section_title: '',
  courses_section_text: '',
  courses_section_button: '',
}

function FieldLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
  )
}

function LabeledInput({
  label,
  description,
  value,
  onChange,
  placeholder,
}: {
  label: string
  description?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} description={description} />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function LabeledTextarea({
  label,
  description,
  value,
  onChange,
  placeholder,
}: {
  label: string
  description?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} description={description} />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px]"
      />
    </div>
  )
}

function ImageUpload({
  label,
  description,
  onFile,
}: {
  label: string
  description?: string
  onFile: (f: File | null) => void
}) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} description={description} />
      <Input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
    </div>
  )
}

function ColorInput({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} description={description} />
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value || '#0047AB'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded border border-border cursor-pointer bg-transparent"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#0047AB" />
      </div>
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
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [loginImageFile, setLoginImageFile] = useState<File | null>(null)

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
            instagram_handle: data.instagram_handle || '',
            facebook_url: data.facebook_url || '',
            linkedin_url: data.linkedin_url || '',
            youtube_url: data.youtube_url || '',
            company_name: data.company_name || '',
            primary_color: data.primary_color || '',
            login_text: data.login_text || '',
            login_gradient: data.login_gradient || '',
            services_title: data.services_title || '',
            services_subtitle: data.services_subtitle || '',
            services_items:
              typeof data.services_items === 'string'
                ? data.services_items
                : JSON.stringify(data.services_items || []),
            courses_section_title: data.courses_section_title || '',
            courses_section_text: data.courses_section_text || '',
            courses_section_button: data.courses_section_button || '',
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
      fd.append('instagram_handle', form.instagram_handle)
      fd.append('facebook_url', form.facebook_url)
      fd.append('linkedin_url', form.linkedin_url)
      fd.append('youtube_url', form.youtube_url)
      fd.append('company_name', form.company_name)
      fd.append('primary_color', form.primary_color)
      fd.append('login_text', form.login_text)
      fd.append('login_gradient', form.login_gradient)
      fd.append('services_title', form.services_title)
      fd.append('services_subtitle', form.services_subtitle)
      fd.append('services_items', form.services_items)
      fd.append('courses_section_title', form.courses_section_title)
      fd.append('courses_section_text', form.courses_section_text)
      fd.append('courses_section_button', form.courses_section_button)
      if (heroImage) fd.append('home_hero_image', heroImage)
      if (aboutImage) fd.append('about_image', aboutImage)
      if (agendaImage) fd.append('agenda_image', agendaImage)
      if (logoFile) fd.append('logo', logoFile)
      if (loginImageFile) fd.append('login_image', loginImageFile)
      if (settings) await updatePlatformSettings(settings.id, fd)
      else await createPlatformSettings(fd)
      toast.success('Configurações salvas com sucesso!')
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7">
          <TabsTrigger value="plataforma">Plataforma</TabsTrigger>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="sobre">Sobre</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="cursos">Cursos</TabsTrigger>
          <TabsTrigger value="contato">Fale Conosco</TabsTrigger>
        </TabsList>

        <TabsContent value="plataforma">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <LabeledInput
                label="Nome da Empresa"
                description="Define o nome que aparece no título da aba do navegador e no rodapé."
                value={form.company_name}
                onChange={(v) => set('company_name', v)}
                placeholder="Anderson Abreu"
              />
              <ImageUpload
                label="Logo da Plataforma"
                description="Sua logomarca principal. Recomendado: PNG com fundo transparente."
                onFile={setLogoFile}
              />
              <ColorInput
                label="Cor Principal"
                description="Esta cor será aplicada automaticamente em botões, ícones e destaques em todo o site."
                value={form.primary_color}
                onChange={(v) => set('primary_color', v)}
              />
              <div className="pt-4 border-t border-border/50 space-y-4">
                <ImageUpload
                  label="Imagem de Fundo (Login)"
                  description="Imagem que aparece ao lado do formulário de acesso para seus alunos."
                  onFile={setLoginImageFile}
                />
                <LabeledInput
                  label="Texto de Boas-vindas (Login)"
                  description="Mensagem personalizada que aparece na tela de login."
                  value={form.login_text}
                  onChange={(v) => set('login_text', v)}
                  placeholder="Hipnose, inteligência emocional e mentoria de alta performance"
                />
                <LabeledInput
                  label="Gradiente Visual (Login)"
                  description="Configuração de cores para o efeito visual da tela de login (CSS Gradient)."
                  value={form.login_gradient}
                  onChange={(v) => set('login_gradient', v)}
                  placeholder="linear-gradient(to bottom, #1e3a8a, #172554, #000000)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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

        <TabsContent value="servicos">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <LabeledInput
                label="Título da seção"
                value={form.services_title}
                onChange={(v) => set('services_title', v)}
                placeholder="Soluções em Hipnoterapia"
              />
              <LabeledTextarea
                label="Subtítulo da seção"
                value={form.services_subtitle}
                onChange={(v) => set('services_subtitle', v)}
                placeholder="Transforme sua vida com nossos serviços especializados"
              />
              <div className="space-y-2">
                <FieldLabel
                  label="Itens de Serviços"
                  description="Adicione, edite ou remova itens exibidos na seção de serviços da landing page."
                />
                <ServicesItemsEditor
                  value={form.services_items}
                  onChange={(v) => set('services_items', v)}
                />
              </div>
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
                label="Título da seção (Landing)"
                description="Título exibido na seção de cursos da página inicial."
                value={form.courses_title}
                onChange={(v) => set('courses_title', v)}
              />
              <LabeledTextarea
                label="Texto introdutório (Landing)"
                value={form.courses_intro}
                onChange={(v) => set('courses_intro', v)}
              />
              <div className="pt-4 border-t border-border/50 space-y-4">
                <LabeledInput
                  label="Título da página /cursos"
                  description="Título principal da página dedicada aos cursos."
                  value={form.courses_section_title}
                  onChange={(v) => set('courses_section_title', v)}
                  placeholder="Cursos Disponíveis"
                />
                <LabeledTextarea
                  label="Texto da página /cursos"
                  value={form.courses_section_text}
                  onChange={(v) => set('courses_section_text', v)}
                  placeholder="Conheça nossos cursos e formações em hipnoterapia."
                />
                <LabeledInput
                  label="Texto do botão"
                  description="Texto do botão que leva à página de cursos na landing."
                  value={form.courses_section_button}
                  onChange={(v) => set('courses_section_button', v)}
                  placeholder="Ver Cursos"
                />
              </div>
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
                  placeholder="contato@andersonabreu.com.br"
                />
                <LabeledInput
                  label="WhatsApp"
                  value={form.whatsapp_number}
                  onChange={(v) => set('whatsapp_number', v)}
                  placeholder="+55 (11) 99999-9999"
                />
                <LabeledInput
                  label="Telefone"
                  value={form.contact_phone}
                  onChange={(v) => set('contact_phone', v)}
                  placeholder="+55 (11) 99999-9999"
                />
              </div>
              <div className="pt-4 border-t border-border/50">
                <Label className="text-base font-semibold">Redes Sociais</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione os links das suas redes sociais. Deixe em branco para ocultar o ícone na
                  página inicial.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabeledInput
                    label="Link do Instagram"
                    value={form.instagram_handle}
                    onChange={(v) => set('instagram_handle', v)}
                    placeholder="https://instagram.com/andersonabreu"
                  />
                  <LabeledInput
                    label="Link do Facebook"
                    value={form.facebook_url}
                    onChange={(v) => set('facebook_url', v)}
                    placeholder="https://facebook.com/andersonabreu"
                  />
                  <LabeledInput
                    label="Link do LinkedIn"
                    value={form.linkedin_url}
                    onChange={(v) => set('linkedin_url', v)}
                    placeholder="https://linkedin.com/in/andersonabreu"
                  />
                  <LabeledInput
                    label="Link do YouTube"
                    value={form.youtube_url}
                    onChange={(v) => set('youtube_url', v)}
                    placeholder="https://youtube.com/@andersonabreu"
                  />
                </div>
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
