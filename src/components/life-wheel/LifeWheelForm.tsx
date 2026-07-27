import { useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
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
  const [expandedQ, setExpandedQ] = useState<string | null>(null)

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
                {catQuestions.map((q) => {
                  const isQExpanded = expandedQ === q.id
                  return (
                    <div key={q.id} className="rounded-lg bg-background/50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground flex-1">{q.text}</p>
                        <button
                          type="button"
                          onClick={() => setExpandedQ(isQExpanded ? null : q.id)}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </div>
                      {isQExpanded && q.explanation && (
                        <p className="mt-2 text-xs text-muted-foreground italic">{q.explanation}</p>
                      )}
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-4">0</span>
                        <Slider
                          value={[answers[q.id] ?? 5]}
                          min={0}
                          max={10}
                          step={1}
                          onValueChange={(v) => onAnswerChange(q.id, v[0])}
                          className="flex-1"
                        />
                        <span
                          className={cn(
                            'text-sm font-bold w-8 text-center rounded px-1 py-0.5',
                            (answers[q.id] ?? 5) >= 7
                              ? 'text-green-500 bg-green-500/10'
                              : (answers[q.id] ?? 5) >= 4
                                ? 'text-yellow-500 bg-yellow-500/10'
                                : 'text-red-500 bg-red-500/10',
                          )}
                        >
                          {answers[q.id] ?? 5}
                        </span>
                      </div>
                    </div>
                  )
                })}
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
