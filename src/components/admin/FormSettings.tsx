import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Loader2 } from 'lucide-react'
import { FileUploadField } from './FileUploadField'

interface FormSettingsProps {
  colorTheme: string
  confirmationMessage: string
  oneSubmissionMessage: string
  headerImagePreview: string | null
  headerImageFile: File | null
  onColorThemeChange: (v: string) => void
  onConfirmationMessageChange: (v: string) => void
  onOneSubmissionMessageChange: (v: string) => void
  onHeaderImageChange: (f: File | null) => void
  onSave: () => void
  saving: boolean
}

export function FormSettings({
  colorTheme,
  confirmationMessage,
  oneSubmissionMessage,
  headerImagePreview,
  headerImageFile,
  onColorThemeChange,
  onConfirmationMessageChange,
  onOneSubmissionMessageChange,
  onHeaderImageChange,
  onSave,
  saving,
}: FormSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Cor do tema</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={colorTheme || '#6366f1'}
            onChange={(e) => onColorThemeChange(e.target.value)}
            className="h-10 w-16 rounded border border-border cursor-pointer"
          />
          <Input
            value={colorTheme || ''}
            onChange={(e) => onColorThemeChange(e.target.value)}
            placeholder="#6366f1"
            className="max-w-xs"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Aplicado ao cabeçalho e botões do formulário
        </p>
      </div>
      <FileUploadField
        label="Imagem de cabeçalho"
        currentSrc={headerImagePreview}
        file={headerImageFile}
        onChange={onHeaderImageChange}
        accept="image/*"
      />
      <div className="space-y-2">
        <Label>Mensagem de confirmação</Label>
        <Textarea
          value={confirmationMessage || ''}
          onChange={(e) => onConfirmationMessageChange(e.target.value)}
          placeholder="Obrigado! Seu formulário foi enviado com sucesso."
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Mensagem de envio único</Label>
        <Textarea
          value={oneSubmissionMessage || ''}
          onChange={(e) => onOneSubmissionMessageChange(e.target.value)}
          placeholder="Você já preencheu este formulário."
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          Exibida quando o usuário já enviou o formulário
        </p>
      </div>
      <Button onClick={onSave} disabled={saving}>
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Salvar Configurações
      </Button>
    </div>
  )
}
