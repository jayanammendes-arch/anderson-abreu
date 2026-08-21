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

export interface ChartData {
  category: string
  score?: number
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
  return (
    <ResponsiveContainer width="100%" height={400}>
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
              stroke="#60a5fa"
              fill="#60a5fa"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Pós"
              dataKey="post"
              stroke="#4ade80"
              fill="#4ade80"
              fillOpacity={0.3}
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
    </ResponsiveContainer>
  )
}
