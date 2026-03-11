import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface FrictionItem {
  label: string
  count: number
  tag: string
}

interface FrictionBarChartProps {
  data: FrictionItem[]
}

export function FrictionBarChart({ data }: FrictionBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-zinc-500">
        Aucun irritant dans la sélection
      </div>
    )
  }

  return (
    <div className="h-80 w-full rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            type="number"
            stroke="#71717a"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={180}
            stroke="#71717a"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            tickFormatter={(v) => (v?.length > 55 ? `${v.slice(0, 52)}…` : v)}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(20,20,26,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fafafa' }}
            formatter={(value) => [(Number(value) || 0).toLocaleString(), 'Volume']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={`hsl(350, 70%, ${55 - i * 3}%)`}
                fillOpacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
