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
  const cropCss = getCropPositionCss(data.crop_x, data.crop_y)

  const renderHero = () => (
    <div className="relative w-full overflow-hidden rounded-xl">
      {imageUrls.main ? (
        <img
          src={imageUrls.main}
          alt={data.name || 'Treatment'}
          className={cn('w-full object-cover', viewMode === 'desktop' ? 'h-72' : 'h-48')}
          style={{ objectPosition: cropCss }}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center bg-slate-100',
            viewMode === 'desktop' ? 'h-72' : 'h-48',
          )}
        >
          <Icon className="h-16 w-16 text-slate-300" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 sm:p-6">
        {!data.hide_icon && <Icon className="mb-2 h-8 w-8 text-white" />}
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {data.name || 'Nome da categoria'}
        </h1>
        {data.short_description && (
          <p className="mt-1 text-sm text-white/80">{data.short_description}</p>
        )}
      </div>
    </div>
  )

  const renderSection = (
    title: string | undefined,
    content: string | undefined,
    image: string | null,
    defaultTitle: string,
  ) => {
    if (!content && !image) return null
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">{title || defaultTitle}</h2>
        {image && (
          <img src={image} alt={title || defaultTitle} className="w-full rounded-lg object-cover" />
        )}
        {content && <div className={proseClass} dangerouslySetInnerHTML={{ __html: content }} />}
      </div>
    )
  }

  const renderFaixaAzul = () => {
    if (!data.faixa_text && !data.faixa_azul_frase) return null
    return (
      <div className="rounded-lg bg-blue-600 p-4 text-white sm:p-6">
        {data.faixa_azul_subtitulo && (
          <p className="mb-1 text-sm font-medium text-blue-100">{data.faixa_azul_subtitulo}</p>
        )}
        {data.faixa_azul_frase && (
          <p className="text-lg font-bold">{stripHtml(data.faixa_azul_frase)}</p>
        )}
        {data.faixa_text && (
          <div
            className={cn(proseClass, 'mt-2 text-blue-50')}
            dangerouslySetInnerHTML={{ __html: data.faixa_text }}
          />
        )}
        {data.faixa_azul_whatsapp_enabled && data.faixa_azul_whatsapp_text && (
          <button className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600">
            <MessageCircle className="h-4 w-4" />
            {data.faixa_azul_whatsapp_text}
          </button>
        )}
      </div>
    )
  }

  const renderWhatsAppButton = () => {
    if (!data.faixa_azul_whatsapp_enabled || !data.faixa_azul_whatsapp_text) return null
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">Pré-visualização</span>
        <div className="flex gap-1 rounded-lg border border-slate-200 p-1">
          <button
            onClick={() => setViewMode('desktop')}
            className={cn(
              'flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors',
              viewMode === 'desktop'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900',
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={cn(
              'flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors',
              viewMode === 'mobile'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900',
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>
      </div>

      <div
        className={cn(
          'mx-auto overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
          viewMode === 'mobile' ? 'max-w-sm' : 'max-w-full',
        )}
      >
        {renderHero()}

        <div className={cn('space-y-6 p-4 sm:p-6', viewMode === 'mobile' && 'p-4')}>
          {data.detailed_content && (
            <div
              className={proseClass}
              dangerouslySetInnerHTML={{ __html: data.detailed_content }}
            />
          )}

          {(data.sintomas_corpo_text || data.sintomas_mente_text || data.sintomas_text) && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">
                {data.sintomas_title || 'Sintomas'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.sintomas_corpo_text && (
                  <div className="p-3 bg-slate-900 text-white rounded-lg space-y-1">
                    <h3 className="text-sm font-bold text-[#D4AF37]">No Corpo (Sinais Físicos)</h3>
                    <div
                      className={cn(proseClass, 'text-white [&_*]:!text-white')}
                      dangerouslySetInnerHTML={{ __html: data.sintomas_corpo_text }}
                    />
                  </div>
                )}
                {data.sintomas_mente_text && (
                  <div className="p-3 bg-slate-900 text-white rounded-lg space-y-1">
                    <h3 className="text-sm font-bold text-[#D4AF37]">
                      Na Mente e no Comportamento
                    </h3>
                    <div
                      className={cn(proseClass, 'text-white [&_*]:!text-white')}
                      dangerouslySetInnerHTML={{ __html: data.sintomas_mente_text }}
                    />
                  </div>
                )}
              </div>
              {data.sintomas_text && !data.sintomas_corpo_text && !data.sintomas_mente_text && (
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: data.sintomas_text }}
                />
              )}
            </div>
          )}
          {renderSection(
            data.como_funciona_title,
            data.como_funciona_text,
            imageUrls.comoFunciona,
            'Como Funciona',
          )}
          {renderSection(
            data.resultados_title,
            data.resultados_text,
            imageUrls.resultados,
            'Resultados',
          )}
          {renderSection(data.cta_title, data.cta_text, null, 'Transformação')}

          {data.por_que_tantas_title &&
            (data.por_que_tantas_content || data.por_que_tantas_title) && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">{data.por_que_tantas_title}</h2>
                {data.por_que_tantas_content && (
                  <div
                    className={proseClass}
                    dangerouslySetInnerHTML={{ __html: data.por_que_tantas_content }}
                  />
                )}
              </div>
            )}

          {data.comparacao_title && data.comparacao_content && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">{data.comparacao_title}</h2>
              <div
                className={proseClass}
                dangerouslySetInnerHTML={{ __html: data.comparacao_content }}
              />
            </div>
          )}

          {renderFaixaAzul()}
          {renderWhatsAppButton()}
        </div>
      </div>
    </div>
  )
}
