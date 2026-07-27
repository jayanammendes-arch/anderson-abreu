import { useState, useRef, type KeyboardEvent } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { LifeWheelCategory, LifeWheelQuestion } from '@/types'

interface Props {
  categories: LifeWheelCategory[]
  questions: LifeWheelQuestion[]
  answers: Record<string, number>
  onAnswerChange: (questionId: string, value: number) => void
  onSubmit: () => void
  submitLabel: string
  submitting: boolean
}

function getScoreColor(value: number): string {
  if (value <= 3) return 'bg-red-500 text-white border-red-500'
  if (value <= 7) return 'bg-yellow-500 text-white border-yellow-500'
  return 'bg-green-500 text-white border-green-500'
}

function NumberButtonGroup({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(idx + 1, 10)
      buttonsRef.current[next]?.focus()
      onChange(next)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = Math.max(idx - 1, 0)
      buttonsRef.current[prev]?.focus()
      onChange(prev)
    } else if (e.key === 'Home') {
      e.preventDefault()
      buttonsRef.current[0]?.focus()
      onChange(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      buttonsRef.current[10]?.focus()
      onChange(10)
    }
  }

  return (
    <div role="radiogroup" aria-label="Pontuação" className="flex flex-wrap gap-1.5">
      {Array.from({ length: 11 }, (_, i) => {
        const isSelected = value === i
        return (
          <button
            key={i}
            ref={(el) => {
              buttonsRef.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Pontuação ${i}`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              'h-11 w-11 min-w-[2.75rem] rounded-lg border text-sm font-semibold transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              isSelected
                ? getScoreColor(i)
                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
            )}
          >
            {i}
          </button>
        )
      })}
    </div>
  )
}

export function LifeWheelForm({
  categories,
  questions,
  answers,
  onAnswerChange,
  onSubmit,
  submitLabel,
  submitting,
}: Props) {
  const [expandedCat, setExpandedCat] = useState<string | null>(categories[0]?.id ?? null)

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const catQuestions = questions.filter((q) => q.category === cat.id)
        if (catQuestions.length === 0) return null
        const isOpen = expandedCat === cat.id
        const catAvg =
          catQuestions.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0) / catQuestions.length

        return (
          <div
            key={cat.id}
            className="rounded-xl border border-border/50 overflow-hidden bg-card/30"
          >
            <button
              type="button"
              onClick={() => setExpandedCat(isOpen ? null : cat.id)}
              className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">Média: {catAvg.toFixed(1)}</p>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            {isOpen && (
              <div className="space-y-4 p-4 pt-0">
                {catQuestions.map((q) => (
                  <div key={q.id} className="rounded-lg bg-background/50 p-3">
                    <p className="text-sm font-medium text-foreground">{q.text}</p>
                    {q.explanation && (
                      <p className="mt-1 text-sm text-muted-foreground">{q.explanation}</p>
                    )}
                    <div className="mt-3">
                      <NumberButtonGroup
                        value={answers[q.id] ?? 5}
                        onChange={(v) => onAnswerChange(q.id, v)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
      <Button onClick={onSubmit} disabled={submitting} className="w-full" size="lg">
        {submitting ? 'Salvando...' : submitLabel}
      </Button>
    </div>
  )
}
