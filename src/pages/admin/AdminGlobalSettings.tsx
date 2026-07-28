import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useFormValidation, type ValidationRule } from '@/hooks/use-form-validation'
import { ValidatedInput } from '@/components/admin/ValidatedInput'
import { FileUploadField } from '@/components/admin/FileUploadField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getFileUrl } from '@/lib/pocketbase/files'
import pb from '@/lib/pocketbase/client'

interface FieldDef {
  key: string
  label: string
  required?: boolean
  type?: 'email' | 'url' | 'boolean' | 'richtext' | 'select'
  placeholder?: string
  options?: Array<{ value: string; label: string }>
}

interface SectionDef {
  title: string
  fields: FieldDef[]
  fileFields?: Array<{ key: string; label: string }>
}

const SECTIONS: SectionDef[] = [
  {
    title: 'Identidade da Marca',
    fields: [
      { key: 'company_name', label: 'Nome da Empresa', required: true },
      {
        key: 'primary_color',
        label: 'Cor Primária',
        placeholder: 'hsl(var(--primary)) ou #000000',
      },
    ],
    fileFields: [{ key: 'logo', label: 'Logo' }],
  },
  {
    title: 'Tela de Login',
    fields: [
      { key: 'login_text', label: 'Texto de Login' },
      {
        key: 'login_gradient',
        label: 'Gradiente de Login',
        placeholder: 'linear-gradient(135deg, #000 0%, #333 100%)',
      },
    ],
    fileFields: [{ key: 'login_image', label: 'Imagem de Login' }],
  },
  {
    title: 'Contato',
    fields: [
      {
        key: 'whatsapp_number',
        label: 'WhatsApp',
        required: true,
        placeholder: '+55 11 99999-9999',
      },
      { key: 'contact_phone', label: 'Telefone', placeholder: '+55 11 3333-3333' },
      {
        key: 'support_email',
        label: 'E-mail de Suporte',
        required: true,
        type: 'email',
        placeholder: 'suporte@exemplo.com',
      },
      { key: 'instagram_handle', label: 'Instagram', placeholder: '@usuario' },
    ],
  },
  {
    title: 'Redes Sociais',
    fields: [
      {
        key: 'facebook_url',
        label: 'Facebook',
        type: 'url',
        placeholder: 'https://facebook.com/...',
      },
      {
        key: 'linkedin_url',
        label: 'LinkedIn',
        type: 'url',
        placeholder: 'https://linkedin.com/...',
      },
      { key: 'youtube_url', label: 'YouTube', type: 'url', placeholder: 'https://youtube.com/...' },
    ],
  },
  {
    title: 'Configurações de Tratamentos',
    fields: [
      {
        key: 'treatments_accordion_enabled',
        label: 'Ativar Acordeão nos Tratamentos',
        type: 'boolean',
      },
    ],
  },
  {
    title: 'Faixa Azul (O que é Hipnose?)',
    fields: [
      { key: 'global_blue_band_title', label: 'Título da Seção', placeholder: 'O que é Hipnose?' },
      { key: 'blue_band_phrase', label: 'Conteúdo (Rich Text)', type: 'richtext' },
      {
        key: 'blue_band_whatsapp_text',
        label: 'Texto do Botão WhatsApp',
        placeholder: 'Fale Conosco',
      },
      { key: 'blue_band_whatsapp_enabled', label: 'Ativar Botão WhatsApp', type: 'boolean' },
    ],
  },
  {
    title: 'Comece sua Jornada',
    fields: [
      { key: 'journey_title', label: 'Título (Rich Text)', type: 'richtext' },
      { key: 'journey_text', label: 'Texto (Rich Text)', type: 'richtext' },
      { key: 'journey_button_text', label: 'Texto do Botão', placeholder: 'Agendar Sessão' },
      { key: 'journey_button_link', label: 'Link do Botão (URL interno)', placeholder: '/agendar' },
      {
        key: 'journey_button_type',
        label: 'Tipo do Botão',
        type: 'select',
        options: [
          { value: 'internal', label: 'Interno (navegação)' },
          { value: 'whatsapp', label: 'WhatsApp' },
        ],
      },
    ],
  },
]

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields)
const ALL_FILE_FIELDS = SECTIONS.flatMap((s) => s.fileFields || [])

export default function AdminGlobalSettings() {
  const [settings, setSettings] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const { errors, validate, clearFieldError } = useFormValidation()
  const { toast } = useToast()

  useEffect(() => {
    pb.collection('platform_settings')
      .getFirstListItem('')
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    clearFieldError(key)
  }

  const handleSave = async () => {
    const rules: ValidationRule[] = ALL_FIELDS.map((f) => ({
      name: f.key,
      value: settings?.[f.key],
      required: f.required,
      type: f.type,
    }))
    if (!validate(rules)) return

    setSaving(true)
    const formData = new FormData()
    ALL_FIELDS.forEach((f) => {
      const val = settings?.[f.key]
      formData.append(f.key, f.type === 'boolean' ? (val ? 'true' : 'false') : val || '')
    })
    ALL_FILE_FIELDS.forEach((f) => {
      if (files[f.key]) formData.append(f.key, files[f.key]!)
    })

    try {
      await pb.collection('platform_settings').update(settings!.id, formData)
      const updated = await pb.collection('platform_settings').getOne(settings!.id)
      setSettings(updated)
      setFiles({})
      toast({ title: 'Configurações salvas com sucesso' })
    } catch {
      toast({ title: 'Erro ao salvar configurações', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const getFileSrc = (key: string) =>
    settings?.[key] ? getFileUrl('platform_settings', settings.id, settings[key]) : null

  const renderField = (field: FieldDef) => {
    if (field.type === 'boolean') {
      return (
        <div key={field.key} className="flex items-center justify-between">
          <Label>{field.label}</Label>
          <Switch
            checked={Boolean(settings?.[field.key])}
            onCheckedChange={(checked) => {
              setSettings((prev) => ({ ...prev, [field.key]: checked }))
              clearFieldError(field.key)
            }}
          />
        </div>
      )
    }

    if (field.type === 'richtext') {
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <RichTextEditor
            value={settings?.[field.key] || ''}
            onChange={(html) => updateField(field.key, html)}
          />
        </div>
      )
    }

    if (field.type === 'select') {
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <Select
            value={settings?.[field.key] || ''}
            onValueChange={(value) => updateField(field.key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }

    return (
      <ValidatedInput
        key={field.key}
        label={field.label}
        required={field.required}
        type={field.type}
        placeholder={field.placeholder}
        value={settings?.[field.key] || ''}
        onChange={(e) => updateField(field.key, e.target.value)}
        error={errors[field.key]}
      />
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações Globais</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as configurações globais da plataforma
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="md:col-span-2">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map(renderField)}
              {section.fileFields?.map((f) => (
                <FileUploadField
                  key={f.key}
                  label={f.label}
                  currentSrc={getFileSrc(f.key)}
                  file={files[f.key]}
                  onChange={(file) => setFiles((prev) => ({ ...prev, [f.key]: file }))}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
