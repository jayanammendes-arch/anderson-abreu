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
import { AboutSectionsConfig } from '@/components/admin/AboutSectionsConfig'
import { ColumnItemsEditor } from '@/components/admin/ColumnItemsEditor'
import { Save, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PlatformSettings } from '@/types'
import { getHypnosisInfoImageUrl } from '@/services/landing'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'

interface FormState {
  hero_title: string
  hero_subtitle: string
  hero_cta_text: string
  about_full_bio: string
  stats_students: string
  stats_years: string
  stats_courses: string
  stats_countries: string
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
  parallax_headline: string
  parallax_button_text: string
  parallax_button_link: string
  about_hero_title: string
  about_hero_subtitle: string
  about_hero_visible: boolean
  about_credentials_visible: boolean
  about_journey_title: string
  about_journey_visible: boolean
  about_formations_title: string
  about_formations_list: string
  about_formations_visible: boolean
  about_grand_names_title: string
  about_grand_names_visible: boolean
  about_media_title: string
  about_media_visible: boolean
  about_recommendations_title: string
  about_recommendations_visible: boolean
  about_environment_title: string
  about_environment_visible: boolean
  about_cta_title: string
  about_cta_subtitle: string
  about_cta_button_text: string
  about_cta_button_link: string
  about_cta_visible: boolean
  global_blue_band_title: string
  global_blue_band_text: string
  blue_band_phrase: string
  blue_band_whatsapp_text: string
  blue_band_whatsapp_enabled: boolean
  journey_title: string
  journey_text: string
  journey_button_text: string
  journey_button_link: string
  journey_button_type: string
  home_section_title: string
  home_section_subtitle: string
  home_column1_items: string
  home_column2_items: string
  home_section_footer: string
  show_logo: boolean
  mentorship_title: string
  mentorship_subtitle: string
  mentorship_description: string
  mentorship_benefits: string
  mentorship_button_text: string
  mentorship_whatsapp_number: string
}

const emptyForm: FormState = {
  hero_title: '',
  hero_subtitle: '',
  hero_cta_text: '',
  about_full_bio: '',
  stats_students: '',
  stats_years: '',
  stats_courses: '',
  stats_countries: '',
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
  parallax_headline: '',
  parallax_button_text: '',
  parallax_button_link: '',
  about_hero_title: '',
  about_hero_subtitle: '',
  about_hero_visible: true,
  about_credentials_visible: true,
  about_journey_title: '',
  about_journey_visible: true,
  about_formations_title: '',
  about_formations_list: '[]',
  about_formations_visible: true,
  about_grand_names_title: '',
  about_grand_names_visible: true,
  about_media_title: '',
  about_media_visible: false,
  about_recommendations_title: '',
  about_recommendations_visible: true,
  about_environment_title: '',
  about_environment_visible: true,
  about_cta_title: '',
  about_cta_subtitle: '',
  about_cta_button_text: '',
  about_cta_button_link: '',
  about_cta_visible: true,
  global_blue_band_title: '',
  global_blue_band_text: '',
  blue_band_phrase: '',
  blue_band_whatsapp_text: '',
  blue_band_whatsapp_enabled: false,
  journey_title: '',
  journey_text: '',
  journey_button_text: '',
  journey_button_link: '',
  journey_button_type: 'whatsapp',
  home_section_title: '',
  home_section_subtitle: '',
  home_column1_items: '[]',
  home_column2_items: '[]',
  home_section_footer: '',
  show_logo: true,
  mentorship_title: '',
  mentorship_subtitle: '',
  mentorship_description: '',
  mentorship_benefits: '[]',
  mentorship_button_text: '',
  mentorship_whatsapp_number: '',
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

const PRIMARY_COLOR_PRESETS = [
  { name: 'Azul Médio', value: '#1F3552' },
  { name: 'Azul Escuro', value: '#0E1D2F' },
  { name: 'Dourado', value: '#D4AF37' },
  { name: 'Verde Esmeralda', value: '#10B981' },
  { name: 'Verde Escuro', value: '#065F46' },
  { name: 'Vermelho', value: '#DC2626' },
  { name: 'Roxo', value: '#7C3AED' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Laranja', value: '#EA580C' },
  { name: 'Marrom', value: '#78350F' },
  { name: 'Cinza', value: '#4B5563' },
  { name: 'Preto', value: '#111827' },
  { name: 'Branco', value: '#FFFFFF' },
] as const

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
  const isPreset = (PRIMARY_COLOR_PRESETS as readonly { value: string }[]).some(
    (p) => p.value.toUpperCase() === (value || '').toUpperCase(),
  )
  return (
    <div className="space-y-2">
      <FieldLabel label={label} description={description} />
      <div className="flex flex-wrap items-center gap-2">
        {PRIMARY_COLOR_PRESETS.map((preset) => {
          const selected = (value || '').toUpperCase() === preset.value.toUpperCase()
          return (
            <button
              key={preset.value}
              type="button"
              title={preset.name}
              aria-label={preset.name}
              onClick={() => onChange(preset.value)}
              className={cn(
                'h-9 w-9 rounded-full border-2 transition-transform hover:scale-110',
                selected
                  ? 'border-white ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'border-white/20',
              )}
              style={{ backgroundColor: preset.value }}
            />
          )
        })}
      </div>
      <div className="flex gap-2 items-center pt-1">
        <input
          type="color"
          value={value || '#1F3552'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-border p-1 bg-transparent cursor-pointer shrink-0"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#1F3552" />{' '}
        {!isPreset && value && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">Cor personalizada</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Escolha uma cor padrão acima ou use o seletor para uma cor personalizada.
      </p>
    </div>
  )
}

export default function AdminPageConfig() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [heroImage, setHeroImage] = useState<File | null>(null)
  const [agendaImage, setAgendaImage] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [loginImageFile, setLoginImageFile] = useState<File | null>(null)
  const [agendarBgImage, setAgendarBgImage] = useState<File | null>(null)
  const [homeCredentialImage, setHomeCredentialImage] = useState<File | null>(null)
  const [parallaxBgImage, setParallaxBgImage] = useState<File | null>(null)
  const [aboutHeroImage, setAboutHeroImage] = useState<File | null>(null)
  const [aboutJourneyPhoto, setAboutJourneyPhoto] = useState<File | null>(null)
  const [aboutFormationsImage, setAboutFormationsImage] = useState<File | null>(null)
  const [aboutCtaBgImage, setAboutCtaBgImage] = useState<File | null>(null)
  const [hypnosisInfoImage, setHypnosisInfoImage] = useState<File | null>(null)
  const [removeHypnosisInfoImage, setRemoveHypnosisInfoImage] = useState(false)

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
            about_full_bio: data.about_full_bio || '',
            stats_students: String(data.stats_students || ''),
            stats_years: String(data.stats_years || ''),
            stats_courses: String(data.stats_courses || ''),
            stats_countries: String(data.stats_countries || ''),
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
            parallax_headline: data.parallax_headline || '',
            parallax_button_text: data.parallax_button_text || '',
            parallax_button_link: data.parallax_button_link || '',
            about_hero_title: data.about_hero_title || '',
            about_hero_subtitle: data.about_hero_subtitle || '',
            about_hero_visible: data.about_hero_visible !== false,
            about_credentials_visible: data.about_credentials_visible !== false,
            about_journey_title: data.about_journey_title || '',
            about_journey_visible: data.about_journey_visible !== false,
            about_formations_title: data.about_formations_title || '',
            about_formations_list:
              typeof data.about_formations_list === 'string'
                ? data.about_formations_list
                : JSON.stringify(data.about_formations_list || []),
            about_formations_visible: data.about_formations_visible !== false,
            about_grand_names_title: data.about_grand_names_title || '',
            about_grand_names_visible: data.about_grand_names_visible !== false,
            about_media_title: data.about_media_title || '',
            about_media_visible: data.about_media_visible === true,
            about_recommendations_title: data.about_recommendations_title || '',
            about_recommendations_visible: data.about_recommendations_visible !== false,
            about_environment_title: data.about_environment_title || '',
            about_environment_visible: data.about_environment_visible !== false,
            about_cta_title: data.about_cta_title || '',
            about_cta_subtitle: data.about_cta_subtitle || '',
            about_cta_button_text: data.about_cta_button_text || '',
            about_cta_button_link: data.about_cta_button_link || '',
            about_cta_visible: data.about_cta_visible !== false,
            global_blue_band_title: data.global_blue_band_title || '',
            global_blue_band_text: data.global_blue_band_text || '',
            blue_band_phrase: data.blue_band_phrase || '',
            blue_band_whatsapp_text: data.blue_band_whatsapp_text || '',
            blue_band_whatsapp_enabled: data.blue_band_whatsapp_enabled || false,
            journey_title: data.journey_title || '',
            journey_text: data.journey_text || '',
            journey_button_text: data.journey_button_text || '',
            journey_button_link: data.journey_button_link || '',
            journey_button_type: data.journey_button_type || 'whatsapp',
            home_section_title: data.home_section_title || '',
            home_section_subtitle: data.home_section_subtitle || '',
            home_column1_items:
              typeof data.home_column1_items === 'string'
                ? data.home_column1_items
                : JSON.stringify(data.home_column1_items || []),
            home_column2_items:
              typeof data.home_column2_items === 'string'
                ? data.home_column2_items
                : JSON.stringify(data.home_column2_items || []),
            home_section_footer: data.home_section_footer || '',
            show_logo: data.show_logo !== false,
            mentorship_title: data.mentorship_title || '',
            mentorship_subtitle: data.mentorship_subtitle || '',
            mentorship_description: data.mentorship_description || '',
            mentorship_benefits:
              typeof data.mentorship_benefits === 'string'
                ? data.mentorship_benefits
                : JSON.stringify(data.mentorship_benefits || []),
            mentorship_button_text: data.mentorship_button_text || '',
            mentorship_whatsapp_number: data.mentorship_whatsapp_number || '',
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
      const data: Record<string, any> = { ...form }
      const numberFields = ['stats_students', 'stats_years', 'stats_courses', 'stats_countries']
      numberFields.forEach((field) => {
        data[field] = data[field] === '' ? null : Number(data[field])
      })

      let recordId: string
      if (settings) {
        await updatePlatformSettings(settings.id, data)
        recordId = settings.id
      } else {
        const created = await createPlatformSettings(data)
        recordId = created.id
      }

      const hasFiles =
        heroImage ||
        agendaImage ||
        logoFile ||
        loginImageFile ||
        agendarBgImage ||
        homeCredentialImage ||
        parallaxBgImage ||
        aboutHeroImage ||
        aboutJourneyPhoto ||
        aboutFormationsImage ||
        aboutCtaBgImage ||
        hypnosisInfoImage ||
        removeHypnosisInfoImage

      if (hasFiles) {
        const fd = new FormData()
        if (heroImage) fd.append('home_hero_image', heroImage)
        if (agendaImage) fd.append('agenda_image', agendaImage)
        if (logoFile) fd.append('logo', logoFile)
        if (loginImageFile) fd.append('login_image', loginImageFile)
        if (agendarBgImage) fd.append('agendar_background_image', agendarBgImage)
        if (homeCredentialImage) fd.append('home_credential_image', homeCredentialImage)
        if (parallaxBgImage) fd.append('parallax_background_image', parallaxBgImage)
        if (aboutHeroImage) fd.append('about_hero_image', aboutHeroImage)
        if (aboutJourneyPhoto) fd.append('about_journey_photo', aboutJourneyPhoto)
        if (aboutFormationsImage) fd.append('about_formations_image', aboutFormationsImage)
        if (aboutCtaBgImage) fd.append('about_cta_background_image', aboutCtaBgImage)
        if (hypnosisInfoImage) {
          fd.append('hypnosis_info_image', hypnosisInfoImage)
        } else if (removeHypnosisInfoImage) {
          fd.append('hypnosis_info_image', '')
        }
        await updatePlatformSettings(recordId, fd)
      }

      toast.success('✅ Salvo com sucesso', { duration: 3000 })
      setHypnosisInfoImage(null)
      setRemoveHypnosisInfoImage(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
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
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="mentoria">Mentoria</TabsTrigger>
          <TabsTrigger value="aluno">Aluno</TabsTrigger>
        </TabsList>
        <TabsContent value="geral">
          <Tabs defaultValue="plataforma">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-9">
              <TabsTrigger value="plataforma">Plataforma</TabsTrigger>
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="sobre">Sobre</TabsTrigger>
              <TabsTrigger value="agendar">Agendar</TabsTrigger>
              <TabsTrigger value="tratamentos">Tratamentos</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="depoimentos">Depoimentos</TabsTrigger>
              <TabsTrigger value="parallax">Parallax</TabsTrigger>
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
                  <div className="flex items-center justify-between">
                    <FieldLabel
                      label="Exibir Logo"
                      description="Controla a visibilidade do logo em toda a plataforma"
                    />
                    <Switch
                      checked={form.show_logo}
                      onCheckedChange={(checked) => set('show_logo', checked)}
                    />
                  </div>
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
                  <div className="pt-4 border-t border-border/50 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold">
                        Faixa Azul ("O que é Hipnose?")
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Configurações da seção global de explicação da hipnose exibida na Landing
                        Page e nas páginas de Tratamento.
                      </p>
                    </div>
                    <LabeledInput
                      label="Título da Faixa"
                      description="Título principal exibido na faixa azul"
                      value={form.global_blue_band_title}
                      onChange={(v) => set('global_blue_band_title', v)}
                      placeholder="Ex: O que é Hipnose?"
                    />
                    <div className="space-y-2">
                      <FieldLabel
                        label="Texto Explicativo da Faixa"
                        description="Texto explicativo. Deixe em branco para usar o texto padrão estruturado em 2 parágrafos."
                      />
                      <RichTextEditor
                        value={form.global_blue_band_text}
                        onChange={(html) => set('global_blue_band_text', html)}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel
                        label="Frase da Faixa (Rich Text)"
                        description="Frase editável exibida na faixa azul com formatação rica (fontes, gradientes, alinhamento)"
                      />
                      <RichTextEditor
                        value={form.blue_band_phrase}
                        onChange={(html) => set('blue_band_phrase', html)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="home">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <LabeledInput
                    label="Título do Hero"
                    description="Título principal exibido no topo da página inicial"
                    value={form.hero_title}
                    onChange={(v) => set('hero_title', v)}
                    placeholder="Ex: Hipnose Clínica Avançada"
                  />
                  <LabeledTextarea
                    label="Subtítulo do Hero"
                    description="Texto de apoio exibido abaixo do título principal"
                    value={form.hero_subtitle}
                    onChange={(v) => set('hero_subtitle', v)}
                    placeholder="Ex: Resultados em 2 Sessões"
                  />
                  <LabeledInput
                    label="Texto do Botão CTA do Hero"
                    description="Botão de ação principal da seção hero"
                    value={form.hero_cta_text}
                    onChange={(v) => set('hero_cta_text', v)}
                    placeholder="Ex: Falar com especialista"
                  />
                  <ImageUpload
                    label="Imagem de Fundo do Hero"
                    description="Imagem exibida atrás do título na seção principal"
                    helperText="Recomendado: 1920×800 px (formato paisagem, até 500KB)"
                    onFile={setHeroImage}
                  />
                  <LabeledInput
                    label="Texto do Botão 'Saiba Mais'"
                    description="Botão exibido abaixo da seção de credenciais do especialista"
                    value={form.saiba_mais_text}
                    onChange={(v) => set('saiba_mais_text', v)}
                    placeholder="Ex: Saiba mais"
                  />
                  <LabeledInput
                    label="Texto Global do Botão 'Agendar Sessão'"
                    description="Texto reutilizado em botões de agendamento em toda a página"
                    value={form.agendar_sessao_text}
                    onChange={(v) => set('agendar_sessao_text', v)}
                    placeholder="Ex: Agendar Sessão"
                  />
                  <div className="pt-4 border-t border-border/50">
                    <FieldLabel
                      label="Estatísticas"
                      description="Números exibidos na página de detalhes de tratamentos"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="pt-4 border-t border-border/50 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold">Seção de Duas Colunas</Label>
                      <p className="text-sm text-muted-foreground">
                        Configuração da seção de comparação exibida na página inicial abaixo de "O
                        que é Hipnose Clínica?".
                      </p>
                    </div>
                    {settings && settings.hypnosis_info_image && !removeHypnosisInfoImage && (
                      <div className="space-y-2">
                        <FieldLabel
                          label="Imagem atual — O que é Hipnose Clínica?"
                          description="Imagem exibida ao lado do texto na seção 'O que é Hipnose Clínica?' da página inicial"
                        />
                        <div className="flex items-center gap-3">
                          <img
                            src={getHypnosisInfoImageUrl(settings)!}
                            alt="Imagem atual — O que é Hipnose Clínica?"
                            className="rounded-lg border border-border/50 max-h-32 object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRemoveHypnosisInfoImage(true)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    )}
                    <ImageUpload
                      label="Imagem — O que é Hipnose Clínica?"
                      description="Imagem exibida ao lado do texto na seção 'O que é Hipnose Clínica?' da página inicial"
                      helperText="Recomendado: 600×500 px (formato paisagem, até 500KB)"
                      onFile={(f) => {
                        setHypnosisInfoImage(f)
                        if (f) setRemoveHypnosisInfoImage(false)
                      }}
                    />
                    <LabeledInput
                      label="Título da Seção"
                      value={form.home_section_title}
                      onChange={(v) => set('home_section_title', v)}
                      placeholder="Ex: Por que tantas pessoas buscam a Hipnoterapia?"
                    />
                    <LabeledTextarea
                      label="Subtítulo"
                      value={form.home_section_subtitle}
                      onChange={(v) => set('home_section_subtitle', v)}
                      placeholder="Ex: Conheça as características que tornam a hipnoterapia uma abordagem diferenciada."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Coluna 1 (Hipnoterapia)</Label>
                        <ColumnItemsEditor
                          value={form.home_column1_items}
                          onChange={(v) => set('home_column1_items', v)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Coluna 2 (Abordagens Tradicionais)</Label>
                        <ColumnItemsEditor
                          value={form.home_column2_items}
                          onChange={(v) => set('home_column2_items', v)}
                        />
                      </div>
                    </div>
                    <LabeledInput
                      label="Nota de Rodapé"
                      value={form.home_section_footer}
                      onChange={(v) => set('home_section_footer', v)}
                      placeholder="Ex: * As abordagens convencionais são igualmente importantes..."
                    />
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
                    <div className="space-y-2">
                      <Label>Biografia completa (Página /sobre)</Label>
                      <RichTextEditor
                        value={form.about_full_bio}
                        onChange={(html) => set('about_full_bio', html)}
                      />
                    </div>
                  </div>

                  <AboutSectionsConfig
                    form={form}
                    set={set as (key: string, value: string | boolean) => void}
                    setAboutHeroImage={setAboutHeroImage}
                    setAboutJourneyPhoto={setAboutJourneyPhoto}
                    setAboutFormationsImage={setAboutFormationsImage}
                    setAboutCtaBgImage={setAboutCtaBgImage}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agendar">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <ImageUpload
                    label="Imagem de Fundo da Página"
                    description="Imagem exibida em tela cheia na página de agendamento"
                    helperText="Recomendado: 1920×1080 px (formato paisagem, até 500KB)"
                    onFile={setAgendarBgImage}
                  />
                  <LabeledInput
                    label="Título Principal"
                    description="Headline exibida sobre a imagem de fundo"
                    value={form.agendar_headline}
                    onChange={(v) => set('agendar_headline', v)}
                    placeholder="Ex: Agende sua Sessão"
                  />
                  <LabeledInput
                    label="Subtítulo"
                    description="Texto de destaque abaixo do título principal"
                    value={form.agendar_subheadline}
                    onChange={(v) => set('agendar_subheadline', v)}
                    placeholder="Ex: Resultados em 2 Sessões"
                  />
                  <LabeledTextarea
                    label="Lista de Benefícios"
                    description='Itens exibidos com checkmark. Formato JSON: ["Atendimento Presencial", "Atendimento Online"]'
                    value={form.agendar_benefits}
                    onChange={(v) => set('agendar_benefits', v)}
                  />
                  <LabeledInput
                    label="Texto do Botão de Envio"
                    description="Texto do botão do formulário de agendamento"
                    value={form.agendar_submit_button_text}
                    onChange={(v) => set('agendar_submit_button_text', v)}
                    placeholder="Ex: Enviar"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tratamentos">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <LabeledInput
                    label="Título da Seção de Tratamentos"
                    description="Título exibido acima dos cards de tratamento na página inicial"
                    value={form.treatments_section_title}
                    onChange={(v) => set('treatments_section_title', v)}
                    placeholder="Ex: O que podemos tratar"
                  />
                  <LabeledTextarea
                    label="Texto Introdutório dos Tratamentos"
                    description="Descrição exibida abaixo do título da seção"
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
                    label="Título da Seção de Blog"
                    description="Título exibido no topo da seção de blog e na página /blog"
                    value={form.blog_section_title}
                    onChange={(v) => set('blog_section_title', v)}
                    placeholder="Ex: Blog"
                  />
                  <LabeledTextarea
                    label="Texto Introdutório do Blog"
                    description="Descrição exibida abaixo do título da seção"
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
                    label="Título da Seção de Depoimentos"
                    description="Título exibido no topo da seção de depoimentos na página inicial"
                    value={form.testimonials_section_title}
                    onChange={(v) => set('testimonials_section_title', v)}
                    placeholder="Ex: Depoimentos"
                  />
                  <p className="text-sm text-muted-foreground">
                    Os depoimentos são gerenciados na aba "Depoimentos" do painel admin.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parallax">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Seção Parallax</h3>
                    <p className="text-sm text-muted-foreground">
                      Configurações da seção parallax exibida abaixo de "O que é Hipnose Clínica?"
                      na landing page.
                    </p>
                  </div>
                  <ImageUpload
                    label="Imagem de Fundo do Parallax"
                    description="Imagem fixa com efeito de rolagem na seção parallax"
                    helperText="Recomendado: 1920×1080px a 2400×1600px, WebP ou JPG, até 500KB"
                    onFile={setParallaxBgImage}
                  />
                  <LabeledInput
                    label="Texto Principal do Parallax"
                    description="Frase de destaque exibida sobre a imagem de fundo"
                    value={form.parallax_headline}
                    onChange={(v) => set('parallax_headline', v)}
                    placeholder="Ex: Acredito que você pode mudar e eu posso te ajudar!"
                  />
                  <LabeledInput
                    label="Texto do Botão do Parallax"
                    description="Texto do botão de call-to-action sobre a imagem"
                    value={form.parallax_button_text}
                    onChange={(v) => set('parallax_button_text', v)}
                    placeholder="Ex: Entre em Contato"
                  />
                  <LabeledInput
                    label="Link do Botão do Parallax"
                    description="URL de destino do botão (ex: /agendar ou https://exemplo.com)"
                    value={form.parallax_button_link}
                    onChange={(v) => set('parallax_button_link', v)}
                    placeholder="/agendar"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contato">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="space-y-4 pt-6">
                  <LabeledInput
                    label="Título da Seção de Contato"
                    description="Título exibido no rodapé ou seção de contato"
                    value={form.contact_title}
                    onChange={(v) => set('contact_title', v)}
                    placeholder="Ex: Dê o primeiro passo."
                  />
                  <LabeledTextarea
                    label="Texto Introdutório de Contato"
                    description="Descrição exibida abaixo do título de contato"
                    value={form.contact_intro}
                    onChange={(v) => set('contact_intro', v)}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <LabeledInput
                      label="WhatsApp"
                      description="Número para contato via WhatsApp"
                      value={form.whatsapp_number}
                      onChange={(v) => set('whatsapp_number', v)}
                      placeholder="Ex: 5511999999999"
                    />
                    <LabeledInput
                      label="Telefone de Contato"
                      description="Telefone fixo para contato"
                      value={form.contact_phone}
                      onChange={(v) => set('contact_phone', v)}
                      placeholder="Ex: +55 (11) 99999-9999"
                    />
                    <LabeledInput
                      label="Email de Suporte"
                      description="Email para dúvidas e suporte"
                      value={form.support_email}
                      onChange={(v) => set('support_email', v)}
                      placeholder="Ex: contato@andersonabreu.com"
                    />
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <Label className="text-base font-semibold">Redes Sociais</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <LabeledInput
                        label="Instagram"
                        description="Handle do Instagram (ex: @andersonabreu)"
                        value={form.instagram_handle}
                        onChange={(v) => set('instagram_handle', v)}
                      />
                      <LabeledInput
                        label="Facebook"
                        description="URL da página do Facebook"
                        value={form.facebook_url}
                        onChange={(v) => set('facebook_url', v)}
                      />
                      <LabeledInput
                        label="LinkedIn"
                        description="URL do perfil do LinkedIn"
                        value={form.linkedin_url}
                        onChange={(v) => set('linkedin_url', v)}
                      />
                      <LabeledInput
                        label="YouTube"
                        description="URL do canal do YouTube"
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

        <TabsContent value="mentoria">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Página de Mentoria</h3>
                <p className="text-sm text-muted-foreground">
                  Configure o conteúdo da página pública de mentoria e o número de WhatsApp dedicado
                  para contato sobre o programa de mentoria.
                </p>
              </div>
              <LabeledInput
                label="Título da Página"
                description="Título principal exibido no topo da página de mentoria"
                value={form.mentorship_title}
                onChange={(v) => set('mentorship_title', v)}
                placeholder="Ex: Mentoria de Alta Performance"
              />
              <LabeledInput
                label="Subtítulo"
                description="Texto de destaque exibido abaixo do título"
                value={form.mentorship_subtitle}
                onChange={(v) => set('mentorship_subtitle', v)}
                placeholder="Ex: Transforme sua vida e alcance resultados extraordinários"
              />
              <div className="space-y-2">
                <FieldLabel
                  label="Descrição da Mentoria"
                  description="Texto descritivo sobre o programa de mentoria (formato rich text)"
                />
                <RichTextEditor
                  value={form.mentorship_description}
                  onChange={(html) => set('mentorship_description', html)}
                />
              </div>
              <LabeledTextarea
                label="Benefícios / Diferenciais"
                description='Um item por linha. Cada linha será exibida com um checkmark. Formato JSON também aceito: ["Item 1", "Item 2"]'
                value={
                  form.mentorship_benefits.startsWith('[')
                    ? (() => {
                        try {
                          const arr = JSON.parse(form.mentorship_benefits)
                          return Array.isArray(arr) ? arr.join('\n') : ''
                        } catch {
                          return ''
                        }
                      })()
                    : form.mentorship_benefits
                }
                onChange={(v) => {
                  const arr = v.split('\n').filter((line) => line.trim())
                  set('mentorship_benefits', JSON.stringify(arr))
                }}
              />
              <LabeledInput
                label="Texto do Botão de WhatsApp"
                description="Texto exibido no botão de call-to-action para WhatsApp"
                value={form.mentorship_button_text}
                onChange={(v) => set('mentorship_button_text', v)}
                placeholder="Ex: Falar sobre a Mentoria"
              />
              <LabeledInput
                label="WhatsApp da Mentoria"
                description="Número de WhatsApp dedicado para contato sobre mentoria (independente do WhatsApp geral). Formato: 5511999999999"
                value={form.mentorship_whatsapp_number}
                onChange={(v) => set('mentorship_whatsapp_number', v)}
                placeholder="Ex: 5511999999999"
              />
            </CardContent>
          </Card>
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
