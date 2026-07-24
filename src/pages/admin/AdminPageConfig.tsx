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
  about_intro: string
  about_full_bio: string
  about_credentials: string
  stats_students: string
  stats_years: string
  stats_courses: string
  stats_countries: string
  testimonials_active: boolean
  testimonials_section_title: string
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
  saiba_mais_text: string
  agendar_sessao_text: string
  treatments_section_title: string
  treatments_section_intro: string
  blog_section_title: string
  blog_section_intro: string
  agendar_headline: string
  agendar_subheadline: string
  agendar_benefits: string
  agendar_submit_button_text: string
  home_credential_name: string
  home_credential_subtitle: string
  home_credential_list: string
  home_credential_cta_text: string
  home_credential_floating_badge_text: string
}

const emptyForm: FormState = {
  hero_title: '',
  hero_subtitle: '',
  hero_cta_text: '',
  about_title: '',
  about_content: '',
  about_intro: '',
  about_full_bio: '',
  about_credentials: '',
  stats_students: '',
  stats_years: '',
  stats_courses: '',
  stats_countries: '',
  testimonials_active: true,
  testimonials_section_title: '',
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
  saiba_mais_text: '',
  agendar_sessao_text: '',
  treatments_section_title: '',
  treatments_section_intro: '',
  blog_section_title: '',
  blog_section_intro: '',
  agendar_headline: '',
  agendar_subheadline: '',
  agendar_benefits: '[]',
  agendar_submit_button_text: '',
  home_credential_name: '',
  home_credential_subtitle: '',
  home_credential_list: '[]',
  home_credential_cta_text: '',
  home_credential_floating_badge_text: '',
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
  helperText,
  onFile,
}: {
  label: string
  description?: string
  helperText?: string
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
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
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
  const [aboutPageImage, setAboutPageImage] = useState<File | null>(null)
  const [agendaImage, setAgendaImage] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [loginImageFile, setLoginImageFile] = useState<File | null>(null)
  const [agendarBgImage, setAgendarBgImage] = useState<File | null>(null)
  const [homeCredentialImage, setHomeCredentialImage] = useState<File | null>(null)
  const [credentialsImage, setCredentialsImage] = useState<File | null>(null)

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
            about_intro: data.about_intro || '',
            about_full_bio: data.about_full_bio || '',
            about_credentials: data.about_credentials || '',
            stats_students: String(data.stats_students || ''),
            stats_years: String(data.stats_years || ''),
            stats_courses: String(data.stats_courses || ''),
            stats_countries: String(data.stats_countries || ''),
            testimonials_active: data.testimonials_active !== false,
            testimonials_section_title: data.testimonials_section_title || '',
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
            saiba_mais_text: data.saiba_mais_text || '',
            agendar_sessao_text: data.agendar_sessao_text || '',
            treatments_section_title: data.treatments_section_title || '',
            treatments_section_intro: data.treatments_section_intro || '',
            blog_section_title: data.blog_section_title || '',
            blog_section_intro: data.blog_section_intro || '',
            agendar_headline: data.agendar_headline || '',
            agendar_subheadline: data.agendar_subheadline || '',
            agendar_benefits:
              typeof data.agendar_benefits === 'string'
                ? data.agendar_benefits
                : JSON.stringify(data.agendar_benefits || []),
            agendar_submit_button_text: data.agendar_submit_button_text || '',
            home_credential_name: data.home_credential_name || '',
            home_credential_subtitle: data.home_credential_subtitle || '',
            home_credential_list:
              typeof data.home_credential_list === 'string'
                ? data.home_credential_list
                : JSON.stringify(data.home_credential_list || []),
            home_credential_cta_text: data.home_credential_cta_text || '',
            home_credential_floating_badge_text: data.home_credential_floating_badge_text || '',
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
      Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)))
      if (heroImage) fd.append('home_hero_image', heroImage)
      if (aboutImage) fd.append('about_image', aboutImage)
      if (aboutPageImage) fd.append('about_page_image', aboutPageImage)
      if (agendaImage) fd.append('agenda_image', agendaImage)
      if (logoFile) fd.append('logo', logoFile)
      if (loginImageFile) fd.append('login_image', loginImageFile)
      if (agendarBgImage) fd.append('agendar_background_image', agendarBgImage)
      if (homeCredentialImage) fd.append('home_credential_image', homeCredentialImage)
      if (credentialsImage) fd.append('credentials_image', credentialsImage)
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
      <Tabs defaultValue="geral">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="aluno">Aluno</TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <Tabs defaultValue="plataforma">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-9">
              <TabsTrigger value="plataforma">Plataforma</TabsTrigger>
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="servicos">Serviços</TabsTrigger>
              <TabsTrigger value="sobre">Sobre</TabsTrigger>
              <TabsTrigger value="agendar">Agendar</TabsTrigger>
              <TabsTrigger value="tratamentos">Tratamentos</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="depoimentos">Depoimentos</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
            </TabsList>

            <TabsContent value="plataforma">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <LabeledInput
                    label="Nome da Empresa"
                    value={form.company_name}
                    onChange={(v) => set('company_name', v)}
                    placeholder="Anderson Abreu"
                  />
                  <ImageUpload
                    label="Logo da Plataforma"
                    helperText="Recomendado: 200×60 px (PNG com fundo transparente)"
                    onFile={setLogoFile}
                  />
                  <ColorInput
                    label="Cor Principal"
                    value={form.primary_color}
                    onChange={(v) => set('primary_color', v)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="servicos">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <LabeledInput
                    label="Título da seção de serviços"
                    value={form.services_title}
                    onChange={(v) => set('services_title', v)}
                    placeholder="Ex: Como funciona?"
                  />
                  <LabeledTextarea
                    label="Subtítulo da seção"
                    value={form.services_subtitle}
                    onChange={(v) => set('services_subtitle', v)}
                  />
                  <div className="space-y-2">
                    <FieldLabel
                      label="Itens de Serviço"
                      description="Adicione os cards que aparecerão na seção"
                    />
                    <ServicesItemsEditor
                      value={form.services_items}
                      onChange={(v: string) => set('services_items', v)}
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
                    label="Texto do botão CTA"
                    description="Texto do botão principal do hero (ex: Agendar Sessão)"
                    value={form.hero_cta_text}
                    onChange={(v) => set('hero_cta_text', v)}
                  />
                  <LabeledInput
                    label="Texto do botão Agendar"
                    description="Texto global do botão de agendamento"
                    value={form.agendar_sessao_text}
                    onChange={(v) => set('agendar_sessao_text', v)}
                  />
                  <LabeledInput
                    label="Texto do botão Saiba Mais"
                    value={form.saiba_mais_text}
                    onChange={(v) => set('saiba_mais_text', v)}
                  />
                  <ImageUpload
                    label="Imagem do hero"
                    helperText="Recomendado: 1920×800 px (formato paisagem)"
                    onFile={setHeroImage}
                  />
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sobre">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold">Seção de Credenciais (Home)</h3>
                    <p className="text-sm text-muted-foreground">
                      Configurações da seção de credenciais exibida na home page abaixo do carrossel
                      de logos.
                    </p>
                  </div>
                  <LabeledInput
                    label="Nome do Especialista"
                    value={form.home_credential_name}
                    onChange={(v) => set('home_credential_name', v)}
                    placeholder="Anderson Abreu"
                  />
                  <LabeledInput
                    label="Subtítulo"
                    value={form.home_credential_subtitle}
                    onChange={(v) => set('home_credential_subtitle', v)}
                    placeholder="Hipnoterapeuta e Professor de Hipnose"
                  />
                  <LabeledTextarea
                    label="Lista de Credenciais (uma por linha)"
                    description="Cada linha será exibida com um checkmark azul"
                    value={
                      form.home_credential_list.startsWith('[')
                        ? (() => {
                            try {
                              const arr = JSON.parse(form.home_credential_list)
                              return Array.isArray(arr) ? arr.join('\n') : ''
                            } catch {
                              return ''
                            }
                          })()
                        : form.home_credential_list
                    }
                    onChange={(v) => {
                      const arr = v.split('\n').filter((line) => line.trim())
                      set('home_credential_list', JSON.stringify(arr))
                    }}
                  />
                  <LabeledInput
                    label="Texto do Botão (CTA)"
                    value={form.home_credential_cta_text}
                    onChange={(v) => set('home_credential_cta_text', v)}
                    placeholder="Conheça Mais"
                  />
                  <LabeledInput
                    label="Texto do Badge Flutuante"
                    value={form.home_credential_floating_badge_text}
                    onChange={(v) => set('home_credential_floating_badge_text', v)}
                    placeholder="+8 Certificações Internacionais"
                  />
                  <ImageUpload
                    label="Foto do Especialista"
                    description="Imagem exibida na coluna direita da seção"
                    helperText="Recomendado: 600×700 px (formato retrato vertical)"
                    onFile={setHomeCredentialImage}
                  />
                  <div className="pt-4 border-t border-border/50 space-y-4">
                    <h3 className="text-base font-semibold">Página /sobre</h3>
                    <LabeledInput
                      label="Título da seção"
                      value={form.about_title}
                      onChange={(v) => set('about_title', v)}
                    />
                    <LabeledInput
                      label="Introdução curta"
                      description="Texto curto exibido na landing page"
                      value={form.about_intro}
                      onChange={(v) => set('about_intro', v)}
                    />
                    <div className="space-y-2">
                      <Label>Conteúdo da seção (Landing)</Label>
                      <RichTextEditor
                        value={form.about_content}
                        onChange={(html) => set('about_content', html)}
                      />
                    </div>
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <Label>Biografia completa (Página /sobre)</Label>
                      <RichTextEditor
                        value={form.about_full_bio}
                        onChange={(html) => set('about_full_bio', html)}
                      />
                    </div>
                    <LabeledInput
                      label="Credenciais"
                      value={form.about_credentials}
                      onChange={(v) => set('about_credentials', v)}
                    />
                    <ImageUpload
                      label="Imagem da seção (Landing)"
                      helperText="Recomendado: 800×600 px (formato paisagem)"
                      onFile={setAboutImage}
                    />
                    <ImageUpload
                      label="Imagem da página Sobre"
                      helperText="Recomendado: 800×600 px (formato paisagem)"
                      onFile={setAboutPageImage}
                    />
                    <ImageUpload
                      label="Imagem de Credenciais"
                      helperText="Recomendado: 800×600 px (formato paisagem)"
                      onFile={setCredentialsImage}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agendar">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <LabeledInput
                    label="Headline"
                    description="Título principal da página de agendamento"
                    value={form.agendar_headline}
                    onChange={(v) => set('agendar_headline', v)}
                    placeholder="Agende sua Sessão"
                  />
                  <LabeledInput
                    label="Subheadline"
                    description="Texto de destaque abaixo da headline"
                    value={form.agendar_subheadline}
                    onChange={(v) => set('agendar_subheadline', v)}
                    placeholder="Resultados em 2 Sessões"
                  />
                  <LabeledTextarea
                    label="Lista de Benefícios (JSON)"
                    description='Array de strings, ex: ["Atendimento Presencial", "Atendimento Online"]'
                    value={form.agendar_benefits}
                    onChange={(v) => set('agendar_benefits', v)}
                  />
                  <LabeledInput
                    label="Texto do Botão de Envio"
                    value={form.agendar_submit_button_text}
                    onChange={(v) => set('agendar_submit_button_text', v)}
                    placeholder="Enviar"
                  />
                  <ImageUpload
                    label="Imagem de Fundo"
                    description="Imagem de fundo da página de agendamento"
                    helperText="Recomendado: 1920×1080 px (formato paisagem)"
                    onFile={setAgendarBgImage}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tratamentos">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <LabeledInput
                    label="Título da seção"
                    value={form.treatments_section_title}
                    onChange={(v) => set('treatments_section_title', v)}
                    placeholder="O que podemos tratar"
                  />
                  <LabeledTextarea
                    label="Texto introdutório"
                    value={form.treatments_section_intro}
                    onChange={(v) => set('treatments_section_intro', v)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Os tratamentos são gerenciados na aba "Tratamentos" do painel admin.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blog">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <LabeledInput
                    label="Título da seção"
                    value={form.blog_section_title}
                    onChange={(v) => set('blog_section_title', v)}
                    placeholder="Blog"
                  />
                  <LabeledTextarea
                    label="Texto introdutório"
                    value={form.blog_section_intro}
                    onChange={(v) => set('blog_section_intro', v)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Os posts são gerenciados na aba "Blog" do painel admin.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="depoimentos">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <LabeledInput
                    label="Título da seção"
                    value={form.testimonials_section_title}
                    onChange={(v) => set('testimonials_section_title', v)}
                    placeholder="Depoimentos"
                  />
                  <div className="flex items-center gap-3 pt-2">
                    <Switch
                      checked={form.testimonials_active}
                      onCheckedChange={(v) => set('testimonials_active', v)}
                    />
                    <Label>Ativar/Desativar Seção de Depoimentos</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Os depoimentos são gerenciados na aba "Depoimentos" do painel admin.
                  </p>
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
                  <div className="pt-4 border-t border-border/50">
                    <Label className="text-base font-semibold">Redes Sociais</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <LabeledInput
                        label="Instagram"
                        value={form.instagram_handle}
                        onChange={(v) => set('instagram_handle', v)}
                      />
                      <LabeledInput
                        label="Facebook"
                        value={form.facebook_url}
                        onChange={(v) => set('facebook_url', v)}
                      />
                      <LabeledInput
                        label="LinkedIn"
                        value={form.linkedin_url}
                        onChange={(v) => set('linkedin_url', v)}
                      />
                      <LabeledInput
                        label="YouTube"
                        value={form.youtube_url}
                        onChange={(v) => set('youtube_url', v)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="aluno">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Página de Login do Aluno</h3>
                <p className="text-sm text-muted-foreground">
                  Configure a aparência da página de acesso dos alunos.
                </p>
              </div>
              <ImageUpload
                label="Imagem de Fundo (Login)"
                helperText="Recomendado: 1920×1080 px (formato paisagem)"
                onFile={setLoginImageFile}
              />
              <LabeledInput
                label="Texto de Boas-vindas (Login)"
                value={form.login_text}
                onChange={(v) => set('login_text', v)}
              />
              <LabeledInput
                label="Gradiente Visual (Login)"
                value={form.login_gradient}
                onChange={(v) => set('login_gradient', v)}
              />
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Os templates de certificado são configurados individualmente por curso, na aba
                  "Cursos" do painel administrativo.
                </p>
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
          )}
          Salvar
        </Button>
      </div>
    </form>
  )
}
