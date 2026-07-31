import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

interface AboutSectionsConfigProps {
  form: Record<string, any>
  set: (key: string, value: string | boolean) => void
  setAboutHeroImage: (f: File | null) => void
  setAboutJourneyPhoto: (f: File | null) => void
  setAboutFormationsImage: (f: File | null) => void
  setAboutCtaBgImage: (f: File | null) => void
}

function SectionBlock({
  title,
  visible,
  onToggle,
  children,
}: {
  title: string
  visible: boolean
  onToggle: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <div className="pt-4 border-t border-border/50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <Switch checked={visible} onCheckedChange={onToggle} />
          <Label className="text-xs text-muted-foreground">{visible ? 'Visível' : 'Oculto'}</Label>
        </div>
      </div>
      {children}
    </div>
  )
}

function FileInput({
  label,
  onFile,
  helperText,
}: {
  label: string
  onFile: (f: File | null) => void
  helperText?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  )
}

function TextInput({
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

export function AboutSectionsConfig({
  form,
  set,
  setAboutHeroImage,
  setAboutJourneyPhoto,
  setAboutFormationsImage,
  setAboutCtaBgImage,
}: AboutSectionsConfigProps) {
  const parseList = (val: string) => {
    if (!val.startsWith('[')) return val
    try {
      const a = JSON.parse(val)
      return Array.isArray(a) ? a.join('\n') : ''
    } catch {
      return ''
    }
  }

  return (
    <>
      <SectionBlock
        title="1. Banner Hero"
        visible={form.about_hero_visible}
        onToggle={(v) => set('about_hero_visible', v)}
      >
        <FileInput
          label="Imagem de Fundo (Hero)"
          helperText="Recomendado: 1920×800 px"
          onFile={setAboutHeroImage}
        />
        <TextInput
          label="Título"
          value={form.about_hero_title}
          onChange={(v) => set('about_hero_title', v)}
          placeholder="Anderson Abreu"
        />
        <TextInput
          label="Subtítulo"
          value={form.about_hero_subtitle}
          onChange={(v) => set('about_hero_subtitle', v)}
          placeholder="Referência Nacional em Hipnoterapia"
        />
      </SectionBlock>

      <SectionBlock
        title="2. Credenciais e Logos"
        visible={form.about_credentials_visible}
        onToggle={(v) => set('about_credentials_visible', v)}
      >
        <p className="text-sm text-muted-foreground">
          Os logos são gerenciados na aba "Certificações" do painel administrativo.
        </p>
      </SectionBlock>

      <SectionBlock
        title="3. Jornada de Sucesso"
        visible={form.about_journey_visible}
        onToggle={(v) => set('about_journey_visible', v)}
      >
        <TextInput
          label="Título da Seção"
          value={form.about_journey_title}
          onChange={(v) => set('about_journey_title', v)}
          placeholder="Jornada de Sucesso"
        />
        <FileInput
          label="Foto de Perfil"
          helperText="Recomendado: 600×800 px (formato retrato)"
          onFile={setAboutJourneyPhoto}
        />
        <div className="space-y-2">
          <Label>Biografia (conteúdo rich text)</Label>
          <RichTextEditor
            value={form.about_full_bio}
            onChange={(html) => set('about_full_bio', html)}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        title="4. Formações"
        visible={form.about_formations_visible}
        onToggle={(v) => set('about_formations_visible', v)}
      >
        <TextInput
          label="Título da Seção"
          value={form.about_formations_title}
          onChange={(v) => set('about_formations_title', v)}
          placeholder="Formações"
        />
        <div className="space-y-2">
          <Label>Lista de Formações (uma por linha)</Label>
          <Textarea
            value={parseList(form.about_formations_list)}
            onChange={(v) => {
              const a = v.split('\n').filter((l) => l.trim())
              set('about_formations_list', JSON.stringify(a))
            }}
            className="min-h-[100px]"
          />
        </div>
        <FileInput
          label="Imagem Lateral (opcional)"
          helperText="Recomendado: 600×400 px"
          onFile={setAboutFormationsImage}
        />
      </SectionBlock>

      <SectionBlock
        title="5. Com Grandes Nomes da Hipnoterapia"
        visible={form.about_grand_names_visible}
        onToggle={(v) => set('about_grand_names_visible', v)}
      >
        <TextInput
          label="Título da Seção Grandes Nomes"
          value={form.about_grand_names_title}
          onChange={(v) => set('about_grand_names_title', v)}
          placeholder="Com Grandes Nomes da Hipnoterapia"
        />
        <p className="text-sm text-muted-foreground">
          Os itens são gerenciados no{' '}
          <Link to="/admin/sobre-conteudo" className="text-primary hover:underline">
            Conteúdo da Página Sobre
          </Link>
          .
        </p>
      </SectionBlock>

      <SectionBlock
        title="6. Na Mídia"
        visible={form.about_media_visible}
        onToggle={(v) => set('about_media_visible', v)}
      >
        <TextInput
          label="Título da Seção"
          value={form.about_media_title}
          onChange={(v) => set('about_media_title', v)}
          placeholder="Na Mídia"
        />
        <p className="text-sm text-muted-foreground">
          As menções são gerenciadas no{' '}
          <Link to="/admin/sobre-conteudo" className="text-primary hover:underline">
            Conteúdo da Página Sobre
          </Link>
          .
        </p>
      </SectionBlock>

      <SectionBlock
        title="7. Quem Recomenda"
        visible={form.about_recommendations_visible}
        onToggle={(v) => set('about_recommendations_visible', v)}
      >
        <TextInput
          label="Título da Seção"
          value={form.about_recommendations_title}
          onChange={(v) => set('about_recommendations_title', v)}
          placeholder="Quem Recomenda"
        />
        <p className="text-sm text-muted-foreground">
          Os vídeos são gerenciados no{' '}
          <Link to="/admin/sobre-conteudo" className="text-primary hover:underline">
            Conteúdo da Página Sobre
          </Link>
          .
        </p>
      </SectionBlock>

      <SectionBlock
        title="8. Nosso Ambiente"
        visible={form.about_environment_visible}
        onToggle={(v) => set('about_environment_visible', v)}
      >
        <TextInput
          label="Título da Seção"
          value={form.about_environment_title}
          onChange={(v) => set('about_environment_title', v)}
          placeholder="Nosso Ambiente"
        />
        <p className="text-sm text-muted-foreground">
          As imagens são gerenciadas no{' '}
          <Link to="/admin/sobre-conteudo" className="text-primary hover:underline">
            Conteúdo da Página Sobre
          </Link>
          .
        </p>
      </SectionBlock>

      <SectionBlock
        title="9. Banner Call-to-Action"
        visible={form.about_cta_visible}
        onToggle={(v) => set('about_cta_visible', v)}
      >
        <FileInput
          label="Imagem de Fundo (CTA)"
          helperText="Recomendado: 1920×600 px"
          onFile={setAboutCtaBgImage}
        />
        <TextInput
          label="Título"
          value={form.about_cta_title}
          onChange={(v) => set('about_cta_title', v)}
          placeholder="Pronto para transformar sua vida?"
        />
        <TextInput
          label="Subtítulo"
          value={form.about_cta_subtitle}
          onChange={(v) => set('about_cta_subtitle', v)}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Texto do Botão"
            value={form.about_cta_button_text}
            onChange={(v) => set('about_cta_button_text', v)}
            placeholder="Agende sua sessão"
          />
          <TextInput
            label="Link do Botão"
            value={form.about_cta_button_link}
            onChange={(v) => set('about_cta_button_link', v)}
            placeholder="/agendar"
          />
        </div>
      </SectionBlock>
    </>
  )
}
