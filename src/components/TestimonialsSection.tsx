import { useEffect, useState } from 'react'
import {
  getActiveTestimonials,
  getTestimonialImageUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
} from '@/services/testimonials'
import type { Testimonial } from '@/types'
import { Play, Quote } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

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
          className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 group"
        >
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={`Depoimento de ${testimonial.student_name}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200">
              <Play className="h-10 w-10 text-slate-400" />
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
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300">
      {testimonial.type === 'video' ? (
        <div className="mb-4">
          <VideoTestimonial testimonial={testimonial} />
        </div>
      ) : (
        <Quote className="h-8 w-8 text-primary/30 mb-3" />
      )}

      {testimonial.type === 'text' && testimonial.content && (
        <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
          "{testimonial.content}"
        </p>
      )}

      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={testimonial.student_name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            {testimonial.student_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 text-sm truncate">
            {testimonial.student_name}
          </div>
          {courseName && <div className="text-xs text-slate-400 truncate">{courseName}</div>}
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection({ customTitle }: { customTitle?: string }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveTestimonials()
      .then(setTestimonials)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading || testimonials.length === 0) return null

  const title = customTitle || 'Depoimentos'

  return
  null
}
