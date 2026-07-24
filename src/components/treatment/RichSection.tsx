interface RichSectionProps {
  title: string
  html?: string
  images?: string[]
  className?: string
}

export function RichSection({ title, html, images, className }: RichSectionProps) {
  const hasText = html && html.trim().length > 0
  const hasImages = images && images.length > 0

  if (!hasText && !hasImages) return null

  return (
    <section className={className}>
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">{title}</h2>
        {hasText && (
          <div
            className="prose prose-lg max-w-none text-slate-600 [&_h2]:text-slate-900 [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
        {hasImages && (
          <div className={`grid gap-4 mt-8 ${gridClass(images.length)}`}>
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${title} - imagem ${i + 1}`}
                className="rounded-xl shadow-md w-full h-64 object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function gridClass(count: number): string {
  if (count >= 3) return 'grid-cols-1 md:grid-cols-3'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1'
}
