import { useRef, useState, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScrollFadeInProps {
  children: ReactNode
  className?: string
}

export function ScrollFadeIn({ children, className }: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    let fallbackTimer: ReturnType<typeof setTimeout> | undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
          if (fallbackTimer) clearTimeout(fallbackTimer)
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -20px 0px' },
    )
    observer.observe(el)

    // Safety fallback: force visibility after maximum 2 seconds once mounted
    fallbackTimer = setTimeout(() => {
      setVisible(true)
      observer.disconnect()
    }, 2000)

    return () => {
      observer.disconnect()
      if (fallbackTimer) clearTimeout(fallbackTimer)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn('scroll-fade-in', visible && 'scroll-fade-in--visible', className)}
    >
      {children}
    </div>
  )
}
