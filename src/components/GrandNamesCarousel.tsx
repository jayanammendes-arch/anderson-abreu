import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { AboutGrandName } from '@/types'
import { getAboutGrandNameImageUrl } from '@/services/about-collections'
import { cn } from '@/lib/utils'

const ITEMS_PER_SLIDE = 3

export function GrandNamesCarousel({ items }: { items: AboutGrandName[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  const slides: AboutGrandName[][] = []
  for (let i = 0; i < items.length; i += ITEMS_PER_SLIDE) {
    slides.push(items.slice(i, i + ITEMS_PER_SLIDE))
  }

  if (slides.length === 0) return null

  return (
    <div className="grand-names-carousel">
      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex">
          {slides.map((slideItems, slideIndex) => (
            <div key={slideIndex} className="flex-[0_0_100%] min-w-0 px-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {slideItems.map((item) => (
                  <div key={item.id} className="text-center group">
                    <div className="overflow-hidden rounded-2xl shadow-lg mb-4 aspect-[4/5] md:aspect-[5/6]">
                      <img
                        src={getAboutGrandNameImageUrl(item) || ''}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="font-semibold text-lg md:text-xl text-slate-900">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {scrollSnaps.length > 1 && (
        <div className="flex justify-center items-center gap-2.5 mt-10">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                'rounded-full transition-all duration-300',
                index === selectedIndex
                  ? 'w-8 h-2.5 bg-slate-900'
                  : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400',
              )}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
