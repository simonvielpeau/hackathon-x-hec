import { useMemo, useState } from 'react'
import type { FlattenedRecord, VerbatimRecord } from '../types/data'

const IRRITANT_TYPE = 'Irritant / Point de rupture'

interface ViewGroupesProps {
  flat: FlattenedRecord[]
  verbatims: VerbatimRecord[]
}

export function ViewGroupes({ flat, verbatims }: ViewGroupesProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const groupsByIrritants = useMemo(() => {
    const byGroup = new Map<string, { volume: number; irritants: number }>()
    for (const r of flat) {
      const cur = byGroup.get(r.group) ?? { volume: 0, irritants: 0 }
      cur.volume += r.count
      if (r.type === IRRITANT_TYPE) cur.irritants += r.count
      byGroup.set(r.group, cur)
    }
    const sorted = Array.from(byGroup.entries())
      .map(([group, v]) => ({ group, ...v }))
      .sort((a, b) => b.irritants - a.irritants)
    const max = sorted[0]?.irritants ?? 1
    return sorted.map((g) => ({
      ...g,
      widthPercent: Math.max(25, (g.irritants / max) * 100),
    }))
  }, [flat])

  const tagsInGroup = useMemo(() => {
    if (!selectedGroup) return []
    const byTag = new Map<string, { volume: number; irritants: number }>()
    for (const r of flat.filter((f) => f.group === selectedGroup)) {
      const cur = byTag.get(r.tag) ?? { volume: 0, irritants: 0 }
      cur.volume += r.count
      if (r.type === IRRITANT_TYPE) cur.irritants += r.count
      byTag.set(r.tag, cur)
    }
    const sorted = Array.from(byTag.entries())
      .map(([tag, v]) => ({ tag, ...v }))
      .sort((a, b) => b.irritants - a.irritants)
    const max = sorted[0]?.irritants ?? 1
    return sorted.map((t) => ({
      ...t,
      widthPercent: Math.max(25, (t.irritants / max) * 100),
    }))
  }, [flat, selectedGroup])

  const verbatimsForTag = useMemo(() => {
    if (!selectedGroup || !selectedTag) return []
    return verbatims
      .filter(
        (v) =>
          v.group === selectedGroup &&
          v.tag === selectedTag &&
          v.type === IRRITANT_TYPE
      )
      .sort((a, b) => b.weight - a.weight)
  }, [verbatims, selectedGroup, selectedTag])

  const handleGroupClick = (group: string) => {
    setSelectedGroup(group)
    setSelectedTag(null)
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Groupes — Problèmes à traiter
        </h1>
        <p className="mt-1 text-zinc-500">
          Sélectionnez un groupe puis un tag pour explorer les avis.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {/* Colonne 1 : Groupes */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Groupes
          </h2>
          <div className="max-h-[calc(100vh-280px)] space-y-1 overflow-y-auto overflow-x-auto">
            {groupsByIrritants.map((g) => (
              <button
                key={g.group}
                onClick={() => handleGroupClick(g.group)}
                className="relative block w-full rounded-lg text-left transition hover:opacity-90"
              >
                <div
                  style={{ width: `${g.widthPercent}%` }}
                  className={`absolute left-0 top-0 bottom-0 rounded-lg ${
                    selectedGroup === g.group
                      ? 'bg-rose-500/25 ring-1 ring-rose-500/40'
                      : 'bg-white/10'
                  }`}
                />
                <div className="relative z-10 w-full px-3 py-2.5 text-sm">
                  <span className={selectedGroup === g.group ? 'font-medium text-rose-400' : 'font-medium text-zinc-300'}>
                    {g.group}
                  </span>
                  <span className="ml-2 text-zinc-500">({g.irritants.toLocaleString()})</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Colonne 2 : Tags (vide si aucun groupe) */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Tags
          </h2>
          {!selectedGroup ? (
            <p className="text-sm text-zinc-600">Sélectionnez un groupe</p>
          ) : (
            <div className="max-h-[calc(100vh-280px)] space-y-1 overflow-y-auto overflow-x-auto">
              {tagsInGroup.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => handleTagClick(t.tag)}
                  className="relative block w-full rounded-lg text-left transition hover:opacity-90"
                >
                  <div
                    style={{ width: `${t.widthPercent}%` }}
                    className={`absolute left-0 top-0 bottom-0 rounded-lg ${
                      selectedTag === t.tag
                        ? 'bg-rose-500/25 ring-1 ring-rose-500/40'
                        : 'bg-white/10'
                    }`}
                  />
                  <div className="relative z-10 w-full px-3 py-2.5 text-sm">
                    <span className={selectedTag === t.tag ? 'font-medium text-rose-400' : 'font-medium text-zinc-300'}>
                      {t.tag}
                    </span>
                    <span className="ml-2 text-zinc-500">({t.irritants.toLocaleString()})</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Colonne 3 : Avis (vide si aucun tag) */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Avis
          </h2>
          {!selectedTag ? (
            <p className="text-sm text-zinc-600">Sélectionnez un tag</p>
          ) : (
            <div className="max-h-[calc(100vh-280px)] space-y-2 overflow-y-auto">
              {verbatimsForTag.map((v, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                >
                  <p className="text-sm text-white">{v.verbatim}</p>
                  <p className="mt-1 text-xs text-indigo-400">Poids : {v.weight.toLocaleString()}</p>
                </div>
              ))}
              {verbatimsForTag.length === 0 && (
                <p className="text-sm text-zinc-600">Aucun avis pour ce tag</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
