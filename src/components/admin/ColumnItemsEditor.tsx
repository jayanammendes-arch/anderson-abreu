import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { IconPicker } from '@/components/admin/IconPicker'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

interface ColumnItem {
  text: string
  icon: string
}

export function ColumnItemsEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  let items: ColumnItem[] = []
  try {
    const parsed = JSON.parse(value || '[]')
    if (Array.isArray(parsed)) items = parsed
  } catch {
    /* empty */
  }

  const update = (newItems: ColumnItem[]) => onChange(JSON.stringify(newItems))
  const addItem = () => update([...items, { text: '', icon: 'sparkles' }])
  const removeItem = (i: number) => update(items.filter((_, idx) => idx !== i))
  const moveUp = (i: number) => {
    if (i === 0) return
    const next = [...items]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    update(next)
  }
  const moveDown = (i: number) => {
    if (i === items.length - 1) return
    const next = [...items]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    update(next)
  }
  const editItem = (i: number, field: keyof ColumnItem, val: string) =>
    update(items.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)))

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const Icon = getTreatmentIcon(item.icon)
        return (
          <div key={i} className="border border-border/50 rounded-lg p-2.5 bg-card/30">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 shrink-0"
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-2" align="start">
                  <IconPicker value={item.icon} onChange={(icon) => editItem(i, 'icon', icon)} />
                </PopoverContent>
              </Popover>
              <Input
                placeholder="Texto do item"
                value={item.text}
                onChange={(e) => editItem(i, 'text', e.target.value)}
                className="flex-1 h-9"
              />
              <div className="flex flex-col gap-0.5 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 w-7 p-0"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 w-7 p-0"
                  onClick={() => moveDown(i)}
                  disabled={i === items.length - 1}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-400 hover:text-red-500 shrink-0"
                onClick={() => removeItem(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
      <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
        <Plus className="mr-2 h-4 w-4" /> Adicionar Item
      </Button>
    </div>
  )
}
