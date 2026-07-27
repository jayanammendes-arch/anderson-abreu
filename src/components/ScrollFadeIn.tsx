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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
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
