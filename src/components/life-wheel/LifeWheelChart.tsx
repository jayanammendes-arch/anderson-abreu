import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'

export interface ChartData {
  category: string
  score: number
  pre?: number
  post?: number
}

export function LifeWheelChart({
  data,
  showComparison,
}: {
  data: ChartData[]
  showComparison?: boolean
}) {
  const config = showComparison
    ? {
        pre: { label: 'Pré-Tratamento', color: '#3b82f6' },
        post: { label: 'Pós-Tratamento', color: '#22c55e' },
      }
    : {
        score: { label: 'Pontuação', color: 'hsl(var(--primary))' },
      }

  return (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-[400px] w-full">
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
        />
        <PolarRadiusAxis
          domain={[0, 10]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--popover-foreground))',
          }}
        />
        {showComparison ? (
          <>
            <Radar
              name="Pré"
              dataKey="pre"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Radar
              name="Pós"
              dataKey="post"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Legend />
          </>
        ) : (
          <Radar
            name="Pontuação"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        )}
      </RadarChart>
    </ChartContainer>
  )
}
