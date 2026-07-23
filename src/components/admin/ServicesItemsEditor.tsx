import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

interface ServiceItem {
  title: string
  description: string
  icon: string
}

const ICON_OPTIONS = [
  'brain',
  'heart',
  'target',
  'graduation-cap',
  'sparkles',
  'zap',
  'shield',
  'leaf',
]

export function ServicesItemsEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  let items: ServiceItem[] = []
  try {
    const parsed = JSON.parse(value || '[]')
    if (Array.isArray(parsed)) items = parsed
  } catch {
    /* empty */
  }

  const update = (newItems: ServiceItem[]) => onChange(JSON.stringify(newItems))
  const addItem = () => update([...items, { title: '', description: '', icon: 'sparkles' }])
  const removeItem = (i: number) => update(items.filter((_, idx) => idx !== i))
  const editItem = (i: number, field: keyof ServiceItem, val: string) =>
    update(items.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)))

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="border border-border/50 rounded-lg p-4 space-y-3 bg-card/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Item {i + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(i)}
              className="text-red-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Título do serviço"
            value={item.title}
            onChange={(e) => editItem(i, 'title', e.target.value)}
          />
          <Textarea
            placeholder="Descrição do serviço"
            value={item.description}
            onChange={(e) => editItem(i, 'description', e.target.value)}
            className="min-h-[60px]"
          />
          <select
            value={item.icon}
            onChange={(e) => editItem(i, 'icon', e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {ICON_OPTIONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addItem} className="w-full">
        <Plus className="mr-2 h-4 w-4" /> Adicionar Item
      </Button>
    </div>
  )
}
