import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionSectionProps {
  id?: string
  title: string
  accordionEnabled: boolean
  children: ReactNode
  className?: string
}

export function AccordionSection({
  id,
  title,
  accordionEnabled,
  children,
  className,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (!accordionEnabled) {
    return (
      <section id={id} className={className}>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">{title}</h2>
          {children}
        </div>
      </section>
    )
  }

  return (
    <section id={id} className={className}>
      <div className="max-w-4xl mx-auto px-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full py-4 text-left"
        >
          <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
          <ChevronDown
            className={cn(
              'h-6 w-6 text-slate-600 transition-transform duration-300',
              isOpen && 'rotate-180',
            )}
          />
        </button>
        <div
          className={cn(
            'grid transition-all duration-300',
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">{children}</div>
        </div>
      </div>
    </section>
  )
}
