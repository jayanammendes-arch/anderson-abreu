import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import type { FormQuestion, FormSubmission, FormAnswers } from '@/types'

interface Props {
  questions: FormQuestion[]
  submissions: FormSubmission[]
}

export function ResponseStatistics({ questions, submissions }: Props) {
  return (
    <div className="space-y-4">
      {questions.map((q) => {
        const answers = submissions
          .map((s) => (s.answers as FormAnswers)?.[q.id])
          .filter((a) => a !== undefined && a !== null && a !== '')
        return (
          <Card key={q.id} className="bg-card/50 border-border/50">
            <CardContent className="pt-4 space-y-2">
              <Label className="text-sm font-medium">{q.question_text}</Label>
              <p className="text-xs text-muted-foreground">{answers.length} resposta(s)</p>
              <QuestionStats question={q} answers={answers} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function QuestionStats({
  question,
  answers,
}: {
  question: FormQuestion
  answers: (string | string[] | number)[]
}) {
  if (question.question_type === 'linear_scale') {
    const nums = answers.filter((a): a is number => typeof a === 'number')
    const avg = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
    return <p className="text-sm">Média: {avg.toFixed(1)}</p>
  }
  if (['multiple_choice', 'checkboxes', 'dropdown'].includes(question.question_type)) {
    const counts: Record<string, number> = {}
    answers.forEach((a) => {
      const vals = Array.isArray(a) ? a : [String(a)]
      vals.forEach((v) => {
        counts[v] = (counts[v] || 0) + 1
      })
    })
    const total = answers.length || 1
    return (
      <div className="space-y-1">
        {Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([opt, count]) => (
            <div key={opt} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{opt}</span>
                <span>
                  {count} ({Math.round((count / total) * 100)}%)
                </span>
              </div>
              <Progress value={(count / total) * 100} className="h-2" />
            </div>
          ))}
      </div>
    )
  }
  return (
    <div className="space-y-1 max-h-40 overflow-y-auto">
      {answers.map((a, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          {String(a)}
        </p>
      ))}
    </div>
  )
}
