import { useState } from 'react'
import type { TreatmentCategory } from '@/types'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { getCropPositionCss } from '@/lib/image-position'
import { Monitor, Smartphone, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreviewProps {
  data: Partial<TreatmentCategory>
  imageUrls: {
    main: string | null
    comoFunciona: string | null
    resultados: string | null
    sintomas: string | null
    faixaAzul: string | null
  }
}

const proseClass =
  'prose prose-sm max-w-none text-slate-600 [&_h2]:text-slate-900 [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1 [&_a]:text-blue-600 [&_span]:!bg-transparent'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export function TreatmentCategoryPreview({ data, imageUrls }: PreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const Icon = getTreatmentIcon(data.icon || 'brain')

  return
  null
}
