import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SortableList } from '@/components/admin/SortableList'
import { SECTION_LABELS, getSectionsConfig, type SectionConfigItem } from '@/lib/treatment-sections'

interface SectionCustomizationProps {
  comoFuncionaTitle: string
  resultadosTitle: string
  sintomasTitle: string
  ctaTitle: string
  onTitleChange: (field: string, value: string) => void
  sectionsConfig: SectionConfigItem[] | undefined
  onSectionsConfigChange: (config: SectionConfigItem[]) => void
}

const TITLE_FIELDS = [
  {
    field: 'como_funciona_title',
    label: 'Título da seção "Como Funciona"',
    placeholder: 'Como Funciona',
  },
  { field: 'resultados_title', label: 'Título da seção "Resultados"', placeholder: 'Resultados' },
  { field: 'sintomas_title', label: 'Título da seção "Sintomas"', placeholder: 'Sintomas' },
  { field: 'cta_title', label: 'Título da seção "CTA Final"', placeholder: 'Pronto para começar?' },
] as const

export function SectionCustomization({
  comoFuncionaTitle,
  resultadosTitle,
  sintomasTitle,
  ctaTitle,
  onTitleChange,
  sectionsConfig,
  onSectionsConfigChange,
}: SectionCustomizationProps) {
  const config = getSectionsConfig(sectionsConfig)
  const titleValues: Record<string, string> = {
    como_funciona_title: comoFuncionaTitle,
    resultados_title: resultadosTitle,
    sintomas_title: sintomasTitle,
    cta_title: ctaTitle,
  }

  return (
    <div className="border-t pt-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Personalização das Seções</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Customize os títulos das seções e a ordem em que aparecem na página pública. O conteúdo de
          cada seção vem dos campos de texto rico acima.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TITLE_FIELDS.map(({ field, label, placeholder }) => (
          <div key={field} className="space-y-2">
            <Label>{label}</Label>
            <Input
              value={titleValues[field] || ''}
              onChange={(e) => onTitleChange(field, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Ordem e Visibilidade das Seções</Label>
        <p className="text-xs text-muted-foreground">
          Arraste para reordenar. Desmarque para ocultar uma seção na página pública.
        </p>
        <SortableList
          items={config}
          keyExtractor={(item) => item.id}
          onReorder={(reordered) => onSectionsConfigChange(reordered)}
          renderItem={(item, { dragHandle }) => (
            <div className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-lg">
              {dragHandle}
              <span className="flex-1 font-medium text-sm">
                {SECTION_LABELS[item.id] || item.id}
              </span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.visible}
                  onCheckedChange={(checked) =>
                    onSectionsConfigChange(
                      config.map((s) => (s.id === item.id ? { ...s, visible: checked } : s)),
                    )
                  }
                />
                <span className="text-xs text-muted-foreground w-12">
                  {item.visible ? 'Visível' : 'Oculto'}
                </span>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  )
}
