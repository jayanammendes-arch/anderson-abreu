import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { getTreatmentCategories } from '@/services/treatment-categories'

interface Props {
  values: string[]
  onChange: (v: string[]) => void
}

export function TreatmentMultiSelect({ values, onChange }: Props) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTreatmentCategories()
      .then((cats) => setCategories(cats.map((c) => ({ id: c.id, name: c.name }))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = (name: string) => {
    if (values.includes(name)) onChange(values.filter((v) => v !== name))
    else onChange([...values, name])
  }

  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando tratamentos...
      </div>
    )

  return (
    <div className="space-y-2">
      <Label className="text-foreground">Tratamentos de Interesse</Label>
      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-border rounded p-2 bg-background">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2">
            <Checkbox
              checked={values.includes(cat.name)}
              onCheckedChange={() => toggle(cat.name)}
            />
            <span className="text-sm text-foreground">{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
