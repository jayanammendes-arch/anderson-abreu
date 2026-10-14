import { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import {
  getActiveTestimonials,
  getTestimonialImageUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
} from '@/services/testimonials'
import type { Testimonial } from '@/types'
import { ChevronLeft, ChevronRight, Play, Quote } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

function VideoTestimonial({ testimonial }: { testimonial: Testimonial }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const embedUrl = testimonial.content ? getYouTubeEmbedUrl(testimonial.content) : null
  const ytThumb = testimonial.content ? getYouTubeThumbnail(testimonial.content) : null
  const localImage = getTestimonialImageUrl(testimonial)
  const thumbnailSrc = localImage || ytThumb

  if (isPlaying && embedUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          src={embedUrl}
          title={`Depoimento de ${testimonial.student_name}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          onClick={() => embedUrl && setIsPlaying(true)}
          className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted group"
        >
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={`Depoimento de ${testimonial.student_name}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Play className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 shadow-lg transition-transform group-hover:scale-110">
              <Play className="h-6 w-6 fill-white text-white" />
            </div>
          </div>
        </button>
      </DialogTrigger>
      {embedUrl && (
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={`Depoimento de ${testimonial.student_name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const imageUrl = getTestimonialImageUrl(testimonial)
  const courseName = testimonial.expand?.course?.title

  return (
    <div className="flex flex-col h-full rounded-2xl border border-[#0E1D2F] bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40">
      {testimonial.type === 'video' ? (
        <div className="mb-4">
          <VideoTestimonial testimonial={testimonial} />
        </div>
      ) : (
        <Quote className="h-8 w-8 text-[#C9A15A] mb-3 shrink-0" />
      )}

      {testimonial.type === 'text' && testimonial.content && (
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
          "{testimonial.content}"
        </p>
      )}

      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={testimonial.student_name}
            className="h-10 w-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
            {testimonial.student_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-foreground text-sm truncate">
            {testimonial.student_name}
          </div>
          {courseName && <div className="text-xs text-muted-foreground truncate">{courseName}</div>}
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection({ customTitle }: { customTitle?: string }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 1024px)': { slidesToScroll: 3 },
    },
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    getActiveTestimonials()
      .then(setTestimonials)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    const updateScrollState = () => {
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    setScrollSnaps(emblaApi.scrollSnapList())
    updateScrollState()

    emblaApi.on('select', updateScrollState)
    emblaApi.on('reInit', () => {
      setScrollSnaps(emblaApi.scrollSnapList())
      updateScrollState()
    })

    return () => {
      emblaApi.off('select', updateScrollState)
    }
  }, [emblaApi, testimonials.length])

  if (loading || testimonials.length === 0) return null

  const title = customTitle || 'Depoimentos'
  const showControls = testimonials.length > 1

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0E1D2F]">
      <div className="max-w-7xl mx-auto">
        <h2 className="section-title-serif text-center text-foreground mb-2">{title}</h2>
        <div className="w-20 h-1 bg-primary mx-auto mb-10 rounded-full" />

        <div className="relative">
          {/* Carrossel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-6 py-2">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="min-w-0 shrink-0 grow-0 pl-6 basis-full lg:basis-1/3"
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Botões de seta flutuantes nas laterais (desktop) e centralizados abaixo */}
          {showControls && (
            <>
              {/* Setas flutuantes nas laterais para telas grandes */}
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                aria-label="Depoimentos anteriores"
                className={cn(
                  'hidden xl:flex absolute -left-14 top-1/2 -translate-y-1/2 z-10',
                  'h-11 w-11 items-center justify-center rounded-full',
                  'border border-[#C9A15A]/40 bg-[#1F3552] text-[#C9A15A] shadow-lg',
                  'transition-all duration-200 hover:bg-[#C9A15A] hover:text-[#0E1D2F] hover:border-[#C9A15A] hover:scale-105',
                  'focus:outline-none focus:ring-2 focus:ring-[#C9A15A]',
                  'disabled:opacity-30 disabled:pointer-events-none disabled:hover:scale-100',
                )}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                aria-label="Próximos depoimentos"
                className={cn(
                  'hidden xl:flex absolute -right-14 top-1/2 -translate-y-1/2 z-10',
                  'h-11 w-11 items-center justify-center rounded-full',
                  'border border-[#C9A15A]/40 bg-[#1F3552] text-[#C9A15A] shadow-lg',
                  'transition-all duration-200 hover:bg-[#C9A15A] hover:text-[#0E1D2F] hover:border-[#C9A15A] hover:scale-105',
                  'focus:outline-none focus:ring-2 focus:ring-[#C9A15A]',
                  'disabled:opacity-30 disabled:pointer-events-none disabled:hover:scale-100',
                )}
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Controles de navegação abaixo dos cards (visíveis sempre ou em telas menores) */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollPrev()}
                  disabled={!canScrollPrev}
                  aria-label="Depoimentos anteriores"
                  className={cn(
                    'h-10 w-10 flex items-center justify-center rounded-full',
                    'border border-[#C9A15A]/40 bg-[#1F3552] text-[#C9A15A] shadow-md',
                    'transition-all duration-200 hover:bg-[#C9A15A] hover:text-[#0E1D2F] hover:border-[#C9A15A] active:scale-95',
                    'focus:outline-none focus:ring-2 focus:ring-[#C9A15A]',
                    'disabled:opacity-30 disabled:pointer-events-none',
                  )}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Indicadores de página / paginação */}
                {scrollSnaps.length > 1 && (
                  <div className="flex items-center gap-2">
                    {scrollSnaps.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => emblaApi?.scrollTo(index)}
                        aria-label={`Ir para grupo ${index + 1}`}
                        className={cn(
                          'transition-all duration-300 rounded-full h-2.5',
                          index === selectedIndex
                            ? 'w-8 bg-[#C9A15A]'
                            : 'w-2.5 bg-white/20 hover:bg-[#C9A15A]/50',
                        )}
                      />
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => emblaApi?.scrollNext()}
                  disabled={!canScrollNext}
                  aria-label="Próximos depoimentos"
                  className={cn(
                    'h-10 w-10 flex items-center justify-center rounded-full',
                    'border border-[#C9A15A]/40 bg-[#1F3552] text-[#C9A15A] shadow-md',
                    'transition-all duration-200 hover:bg-[#C9A15A] hover:text-[#0E1D2F] hover:border-[#C9A15A] active:scale-95',
                    'focus:outline-none focus:ring-2 focus:ring-[#C9A15A]',
                    'disabled:opacity-30 disabled:pointer-events-none',
                  )}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
