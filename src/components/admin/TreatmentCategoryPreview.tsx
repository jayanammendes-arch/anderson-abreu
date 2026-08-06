import { useState } from 'react'
import type { TreatmentCategory } from '@/types'
import { getTreatmentIcon } from '@/lib/treatment-icons'
import { getCropPositionCss } from '@/lib/image-position'
import { Monitor, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreviewProps {
  data: Partial<TreatmentCategory>
  imageUrls: {
    main: string | null
    comoFunciona: string | null
    resultados: string | null
    sintomas: string | null
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">Preview</span>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setViewMode('desktop')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'desktop' ? 'bg-background shadow-sm' : 'text-muted-foreground',
            )}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'mobile' ? 'bg-background shadow-sm' : 'text-muted-foreground',
            )}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        className={cn(
          'flex-1 overflow-y-auto rounded-lg border bg-white',
          viewMode === 'mobile' ? 'max-w-[375px] mx-auto' : '',
        )}
      >
        <div className="relative h-36 overflow-hidden">
          {imageUrls.main ? (
            <>
              <img
                src={imageUrls.main}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: getCropPositionCss(data.crop_x, data.crop_y) }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700" />
          )}
          <div className="relative z-10 p-4">
            {!data.hide_icon && <Icon className="h-6 w-6 text-white/80 mb-2" strokeWidth={1.5} />}
            <h1 className="text-xl font-bold text-white">{data.name || 'Sem título'}</h1>
            <p className="text-sm text-white/80">{data.short_description || ''}</p>
          </div>
        </div>

        {data.detailed_content?.trim() && (
          <div className="p-4">
            <div
              className={proseClass}
              dangerouslySetInnerHTML={{ __html: data.detailed_content }}
            />
          </div>
        )}

        {data.como_funciona_text?.trim() && (
          <div className="p-4 grid grid-cols-2 gap-4 items-start">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {stripHtml(data.como_funciona_title || '') || 'Como Funciona'}
              </h2>
              <div
                className={proseClass}
                dangerouslySetInnerHTML={{ __html: data.como_funciona_text }}
              />
            </div>
            {imageUrls.comoFunciona && (
              <img
                src={imageUrls.comoFunciona}
                alt="Como Funciona"
                className="w-full h-28 object-cover rounded-lg"
              />
            )}
          </div>
        )}

        {data.faixa_azul_frase?.trim() && (
          <div className="bg-[#0B1D3A] py-3 px-4 text-center">
            <p className="text-white text-sm font-semibold">{data.faixa_azul_frase}</p>
          </div>
        )}

        {data.resultados_text?.trim() && (
          <div className="p-4 bg-slate-50 grid grid-cols-2 gap-4 items-start">
            {imageUrls.resultados && (
              <img
                src={imageUrls.resultados}
                alt="Resultados"
                className="w-full h-28 object-cover rounded-lg"
              />
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {stripHtml(data.resultados_title || '') || 'Resultados'}
              </h2>
              <div
                className={proseClass}
                dangerouslySetInnerHTML={{ __html: data.resultados_text }}
              />
            </div>
          </div>
        )}

        {data.sintomas_text?.trim() && (
          <div className="p-4 grid grid-cols-2 gap-4 items-start">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {stripHtml(data.sintomas_title || '') || 'Sintomas'}
              </h2>
              <div
                className={proseClass}
                dangerouslySetInnerHTML={{ __html: data.sintomas_text }}
              />
            </div>
            {imageUrls.sintomas && (
              <img
                src={imageUrls.sintomas}
                alt="Sintomas"
                className="w-full h-28 object-cover rounded-lg"
              />
            )}
          </div>
        )}

        {data.cta_text?.trim() && (
          <div className="p-4 text-center">
            {data.cta_title?.trim() && (
              <h2 className="text-lg font-bold text-slate-900 mb-2">{stripHtml(data.cta_title)}</h2>
            )}
            <div className={proseClass} dangerouslySetInnerHTML={{ __html: data.cta_text }} />
          </div>
        )}
      </div>
    </div>
  )
}
