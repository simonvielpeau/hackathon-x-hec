import { ResponsiveContainer, Treemap, Tooltip } from 'recharts'
import type { TreemapNode } from '../types/data'

interface TreemapChartProps {
  data: TreemapNode[] | Array<Record<string, unknown>>
}

const COLOR_PANEL = ['#6366f1', '#818cf8', '#a5b4fc', '#8b5cf6', '#a78bfa']

export function TreemapChart({ data }: TreemapChartProps) {
  return (
    <div className="h-[420px] w-full rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data as never}
          dataKey="value"
          stroke="rgba(255,255,255,0.08)"
          fill="#6366f1"
          colorPanel={COLOR_PANEL}
          content={(props) => {
            const { x, y, width, height, name, value } = props as {
              x?: number
              y?: number
              width?: number
              height?: number
              name?: string
              value?: number
            }
            if (width == null || height == null || width < 4 || height < 4) return <g />
            const fontSize = Math.min(11, width / 10, height / 3)
            return (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill="currentColor"
                  fillOpacity={0.35}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={1}
                />
                <text
                  x={(x ?? 0) + (width ?? 0) / 2}
                  y={(y ?? 0) + (height ?? 0) / 2 - fontSize / 2}
                  textAnchor="middle"
                  fill="white"
                  fontSize={fontSize}
                  fontWeight={500}
                >
                  {name && name.length > 22 ? `${name.slice(0, 20)}…` : name}
                </text>
                <text
                  x={(x ?? 0) + (width ?? 0) / 2}
                  y={(y ?? 0) + (height ?? 0) / 2 + fontSize}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.75)"
                  fontSize={fontSize - 1}
                >
                  {value != null ? value.toLocaleString() : ''}
                </text>
              </g>
            )
          }}
        >
          <Tooltip
            contentStyle={{
              background: 'rgba(20,20,26,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
            formatter={(value) => [(Number(value) || 0).toLocaleString(), 'Volume']}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
}
