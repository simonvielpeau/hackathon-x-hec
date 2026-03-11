import { useMemo } from 'react'
import type { FlattenedRecord } from '../types/data'
import { getTypeConfig, TYPE_ORDER } from '../config/typeConfig'
import type { TabId } from '../components/Sidebar'
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

interface ViewAccueilProps {
  flat: FlattenedRecord[]
  onNavigateToView?: (tab: TabId) => void
}

export function ViewAccueil({ flat, onNavigateToView }: ViewAccueilProps) {
  const metrics = useMemo(() => {
    const totalCount = flat.reduce((sum, r) => sum + r.count, 0)
    const groups = new Set(flat.map((r) => r.group))
    const tags = new Set(flat.map((r) => `${r.group}|${r.tag}`))

    const byType = new Map<string, number>()
    for (const r of flat) {
      byType.set(r.type, (byType.get(r.type) ?? 0) + r.count)
    }
    const typeDistribution = TYPE_ORDER.map((type) => ({
      type,
      label: getTypeConfig(type).label,
      count: byType.get(type) ?? 0,
      color: getTypeConfig(type).color,
    })).filter((d) => d.count > 0)

    return {
      totalCount,
      nbGroups: groups.size,
      nbTags: tags.size,
      typeDistribution,
    }
  }, [flat])

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Accueil
        </h1>
        <p className="mt-1 text-slate-600">
          Vue d&apos;ensemble des retours clients et métriques clés.
        </p>
      </header>

      {/* KPIs principaux */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-2xl font-bold text-slate-900">
            {metrics.totalCount.toLocaleString()}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
            Total avis
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-2xl font-bold text-slate-900">
            {metrics.nbGroups}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
            Groupes
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-2xl font-bold text-slate-900">
            {metrics.nbTags}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
            Tags
          </div>
        </div>
      </div>

      {/* Répartition par type */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Répartition par type d&apos;avis
        </h2>
        {metrics.typeDistribution.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.typeDistribution}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={90}
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => [
                    value.toLocaleString(),
                    'Nombre',
                  ]}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {metrics.typeDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            Aucune donnée
          </p>
        )}
      </div>

      {/* Boutons vers les autres vues */}
      {onNavigateToView && (
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => onNavigateToView('groupes')}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm transition hover:border-[#0066FF]/30 hover:bg-[#0066FF]/5 hover:shadow-md"
          >
            <span className="text-2xl">📊</span>
            <div className="text-left">
              <div className="font-semibold text-slate-900">Groupes</div>
              <div className="text-sm text-slate-500">
                Explorer les avis par groupe et tag
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onNavigateToView('parcours')}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm transition hover:border-[#0066FF]/30 hover:bg-[#0066FF]/5 hover:shadow-md"
          >
            <span className="text-2xl">🗺️</span>
            <div className="text-left">
              <div className="font-semibold text-slate-900">Parcours client</div>
              <div className="text-sm text-slate-500">
                Timeline des phases du parcours client
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
