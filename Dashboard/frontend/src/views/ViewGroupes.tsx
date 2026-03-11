import { useMemo, useState } from 'react'
import type { FlattenedRecord, VerbatimRecord } from '../types/data'
import { getTypeConfig, TYPE_ORDER } from '../config/typeConfig'

interface ViewGroupesProps {
  flat: FlattenedRecord[]
  verbatims: VerbatimRecord[]
}

const IRRITANT_TYPE = 'Irritant / Point de rupture'

export function ViewGroupes({ flat, verbatims }: ViewGroupesProps) {
  const [selectedType, setSelectedType] = useState<string>(IRRITANT_TYPE)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [treatedIds, setTreatedIds] = useState<Set<string>>(new Set())

  const availableTypes = useMemo(() => {
    const types = new Set(flat.map((r) => r.type))
    return TYPE_ORDER.filter((t) => types.has(t))
  }, [flat])

  const groupsByCount = useMemo(() => {
    const byGroup = new Map<string, number>()
    for (const r of flat.filter((f) => f.type === selectedType)) {
      byGroup.set(r.group, (byGroup.get(r.group) ?? 0) + r.count)
    }
    const sorted = Array.from(byGroup.entries())
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => b.count - a.count)
    const max = sorted[0]?.count ?? 1
    return sorted.map((g) => ({
      ...g,
      widthPercent: Math.max(25, (g.count / max) * 100),
    }))
  }, [flat, selectedType])

  const tagsInGroup = useMemo(() => {
    if (!selectedGroup) return []
    const byTag = new Map<string, number>()
    for (const r of flat.filter((f) => f.group === selectedGroup && f.type === selectedType)) {
      byTag.set(r.tag, (byTag.get(r.tag) ?? 0) + r.count)
    }
    const sorted = Array.from(byTag.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
    const max = sorted[0]?.count ?? 1
    return sorted.map((t) => ({
      ...t,
      widthPercent: Math.max(25, (t.count / max) * 100),
    }))
  }, [flat, selectedGroup, selectedType])

  const verbatimsForTag = useMemo(() => {
    if (!selectedGroup || !selectedTag) return []
    return verbatims
      .filter(
        (v) =>
          v.group === selectedGroup &&
          v.tag === selectedTag &&
          v.type === selectedType
      )
      .sort((a, b) => b.weight - a.weight)
  }, [verbatims, selectedGroup, selectedTag, selectedType])

  const handleGroupClick = (group: string) => {
    setSelectedGroup((prev) => (prev === group ? null : group))
    setSelectedTag(null)
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag))
  }

  const typeConfig = getTypeConfig(selectedType)

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const getBorderOpacity = (widthPercent: number) => 0.08 + (widthPercent / 100) * 0.92

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Avis par type
        </h1>
        <p className="mt-1 text-slate-600">
          Choisissez le type d&apos;avis à afficher, puis sélectionnez un groupe et un tag.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {availableTypes.map((type) => {
            const config = getTypeConfig(type)
            const isSelected = selectedType === type
            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type)
                  setSelectedGroup(null)
                  setSelectedTag(null)
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isSelected
                    ? 'text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
                style={isSelected ? { backgroundColor: config.color } : undefined}
              >
                <span className={isSelected ? 'opacity-90' : 'opacity-70'}>
                  {config.icon}
                </span>
                {config.label}
              </button>
            )
          })}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {/* Colonne 1 : Groupes */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Groupes
          </h2>
          <div className="max-h-[calc(100vh-280px)] space-y-1 overflow-y-auto overflow-x-auto">
            {groupsByCount.map((g) => (
              <button
                key={g.group}
                onClick={() => handleGroupClick(g.group)}
                className="relative block w-full rounded-lg text-left transition hover:opacity-90"
              >
                <div
                  style={{
                    width: `${g.widthPercent}%`,
                    borderLeft: `5px solid ${hexToRgba(typeConfig.color, getBorderOpacity(g.widthPercent))}`,
                  }}
                  className="absolute left-0 top-0 bottom-0 rounded-lg bg-slate-100"
                >
                  {selectedGroup === g.group && (
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: `${typeConfig.color}25` }}
                    />
                  )}
                </div>
                <div className="relative z-10 w-full px-3 py-2.5 text-sm">
                  <span
                    className={selectedGroup === g.group ? 'font-medium' : 'font-medium text-slate-700'}
                    style={selectedGroup === g.group ? { color: typeConfig.color } : undefined}
                  >
                    {g.group}
                  </span>
                  <span className="ml-2 text-slate-500">({g.count.toLocaleString()})</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Colonne 2 : Tags (vide si aucun groupe) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tags
            {selectedGroup && (
              <span className="ml-2 font-normal normal-case" style={{ color: typeConfig.color }}>
                — {selectedGroup}
              </span>
            )}
          </h2>
          {!selectedGroup ? (
            <p className="text-sm text-slate-500">Sélectionnez un groupe</p>
          ) : (
            <div className="max-h-[calc(100vh-280px)] space-y-1 overflow-y-auto overflow-x-auto">
              {tagsInGroup.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => handleTagClick(t.tag)}
                  className="relative block w-full rounded-lg text-left transition hover:opacity-90"
                >
                  <div
                    style={{
                      width: `${t.widthPercent}%`,
                      borderLeft: `5px solid ${hexToRgba(typeConfig.color, getBorderOpacity(t.widthPercent))}`,
                    }}
                    className="absolute left-0 top-0 bottom-0 rounded-lg bg-slate-100"
                  >
                    {selectedTag === t.tag && (
                      <div
                        className="absolute inset-0 rounded-lg"
                        style={{ backgroundColor: `${typeConfig.color}25` }}
                      />
                    )}
                  </div>
                  <div className="relative z-10 w-full px-3 py-2.5 text-sm">
                    <span
                      className={selectedTag === t.tag ? 'font-medium' : 'font-medium text-slate-700'}
                      style={selectedTag === t.tag ? { color: typeConfig.color } : undefined}
                    >
                      {t.tag}
                    </span>
                    <span className="ml-2 text-slate-500">({t.count.toLocaleString()})</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Colonne 3 : Avis (vide si aucun tag) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Avis clients
            {selectedTag && (
              <span className="ml-2 font-normal normal-case" style={{ color: typeConfig.color }}>
                — {selectedTag}
              </span>
            )}
          </h2>
          {!selectedTag ? (
            <p className="text-sm text-slate-500">Sélectionnez un tag</p>
          ) : (
            <div className="max-h-[calc(100vh-280px)] space-y-2 overflow-y-auto">
              {verbatimsForTag.map((v, i) => {
                const itemId = `${selectedGroup}-${selectedTag}-${i}-${v.verbatim.slice(0, 30)}`
                const isTreated = treatedIds.has(itemId)
                const showTraiteButton = selectedType === IRRITANT_TYPE
                return (
                  <div
                    key={i}
                    className="rounded-lg border px-3 py-2.5"
                    style={{
                      borderColor: `${typeConfig.color}30`,
                      backgroundColor: `${typeConfig.color}08`,
                    }}
                  >
                    <p className="text-sm text-slate-800">{v.verbatim}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-xs" style={{ color: typeConfig.color }}>
                        <span>{typeConfig.icon}</span>
                        Poids : {v.weight.toLocaleString()}
                      </p>
                      {showTraiteButton && (
                        <button
                          type="button"
                          onClick={() => {
                            setTreatedIds((prev) => {
                              const next = new Set(prev)
                              if (next.has(itemId)) next.delete(itemId)
                              else next.add(itemId)
                              return next
                            })
                            // TODO: lier à une notification envoyée aux utilisateurs ayant signalé ce problème
                          }}
                          className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                            isTreated
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {isTreated ? 'Traité' : 'Marquer comme traité'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {verbatimsForTag.length === 0 && (
                <p className="text-sm text-slate-500">Aucun avis pour ce tag</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
