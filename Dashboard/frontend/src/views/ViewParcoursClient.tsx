import { useState, useMemo } from 'react'
import type { FlattenedRecord, VerbatimRecord } from '../types/data'
import { PARCOURS_PHASES } from '../config/parcoursClient'
import type { ParcoursGroup } from '../config/parcoursClient'
import { getTypeConfig, TYPE_ORDER } from '../config/typeConfig'

interface ViewParcoursClientProps {
  flat?: FlattenedRecord[]
  verbatims?: VerbatimRecord[]
}

function TypeDistributionBar({
  distribution,
}: {
  distribution: Record<string, number>
}) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0)
  if (total === 0) return null

  const segments = TYPE_ORDER.filter((type) => (distribution[type] ?? 0) > 0).map(
    (type) => {
      const weight = distribution[type] ?? 0
      const pct = (weight / total) * 100
      const config = getTypeConfig(type)
      return { type, pct, config }
    }
  )

  return (
    <div className="mt-2 h-3.5 w-full overflow-hidden rounded-md bg-slate-100">
      <div className="flex h-full w-full">
        {segments.map(({ type, pct, config }) => (
          <div
            key={type}
            title={`${config.label}: ${(distribution[type] ?? 0).toLocaleString()}`}
            style={{
              width: `${pct}%`,
              backgroundColor: config.color,
            }}
            className="h-full transition-all"
          />
        ))}
      </div>
    </div>
  )
}

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0 text-slate-300"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const SELECTED_CARD_COLOR = '#475569' // slate-600

export function ViewParcoursClient({ flat = [], verbatims = [] }: ViewParcoursClientProps) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<{
    group: string
    tag: string
    dataGroup: string
  } | null>(null)

  const selectedPhaseData = useMemo(
    () => PARCOURS_PHASES.find((p) => p.id === selectedPhase) ?? null,
    [selectedPhase]
  )

  const selectedGroupData = useMemo(
    () =>
      selectedPhaseData?.groups.find((g) => g.id === selectedGroup) ?? null,
    [selectedPhaseData, selectedGroup]
  )

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of flat) {
      const key = `${r.group}|${r.tag}`
      counts.set(key, (counts.get(key) ?? 0) + r.count)
    }
    return counts
  }, [flat])

  const typeWeightsByGroupTag = useMemo(() => {
    const map = new Map<string, Record<string, number>>()
    for (const v of verbatims) {
      const key = `${v.group}|${v.tag}`
      const existing = map.get(key) ?? {}
      existing[v.type] = (existing[v.type] ?? 0) + v.weight
      map.set(key, existing)
    }
    return map
  }, [verbatims])

  const verbatimsForTag = useMemo(() => {
    if (!selectedTag) return []
    return verbatims
      .filter(
        (v) =>
          v.group === selectedTag.dataGroup && v.tag === selectedTag.tag
      )
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
  }, [verbatims, selectedTag])

  const getTagCount = (group: ParcoursGroup, tag: string) => {
    const dataGroup = getDataGroup(group)
    const key = `${dataGroup}|${tag}`
    return tagCounts.get(key) ?? 0
  }

  const getGroupTotalCount = (group: ParcoursGroup) => {
    return group.tags.reduce(
      (sum, tag) => sum + getTagCount(group, tag),
      0
    )
  }

  const getPhaseTotalCount = (groups: ParcoursGroup[]) => {
    return groups.reduce((sum, g) => sum + getGroupTotalCount(g), 0)
  }

  const getDataGroup = (group: ParcoursGroup) => group.dataGroup ?? group.label

  const getTypeDistribution = (
    items: ParcoursGroup[]
  ): Record<string, number> => {
    const dist: Record<string, number> = {}
    for (const item of items) {
      const dataGroup = getDataGroup(item)
      for (const tag of item.tags) {
        const key = `${dataGroup}|${tag}`
        const byType = typeWeightsByGroupTag.get(key)
        if (byType) {
          for (const [type, weight] of Object.entries(byType)) {
            dist[type] = (dist[type] ?? 0) + weight
          }
        }
      }
    }
    return dist
  }

  const handlePhaseClick = (phaseId: string) => {
    setSelectedPhase((prev) => (prev === phaseId ? null : phaseId))
    setSelectedGroup(null)
    setSelectedTag(null)
  }

  const handleGroupClick = (groupId: string) => {
    setSelectedGroup((prev) => (prev === groupId ? null : groupId))
    setSelectedTag(null)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Parcours client
        </h1>
        <p className="mt-1 text-slate-600">
          Sélectionnez une phase, puis un groupe, puis un tag pour explorer le parcours.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Répartition des avis
          </span>
          {TYPE_ORDER.map((type) => {
            const config = getTypeConfig(type)
            return (
              <span
                key={type}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-sm border border-slate-200"
                  style={{ backgroundColor: config.color }}
                />
                {config.label}
              </span>
            )
          })}
        </div>
      </header>

      <div className="flex min-w-0 flex-col gap-6">
          {/* Ligne 1 : Phases principales */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ligne 1 — Phases principales
            </h2>
            <div className="flex min-w-0 w-full items-stretch gap-1">
              {PARCOURS_PHASES.map((phase, index) => {
                const isSelected = selectedPhase === phase.id
                const totalCount = getPhaseTotalCount(phase.groups)
                const phaseDistribution = getTypeDistribution(phase.groups)
                return (
                  <div
                    key={phase.id}
                    className="flex min-w-0 flex-1 items-center gap-1"
                  >
                    {index > 0 && (
                      <span className="flex shrink-0 px-0.5">
                        <ArrowIcon />
                      </span>
                    )}
                    <div className="flex min-h-[5.5rem] min-w-0 flex-1 flex-col">
                      <button
                        type="button"
                        onClick={() => handlePhaseClick(phase.id)}
                        className={`flex w-full flex-1 flex-col rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                          isSelected
                            ? 'text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                        style={isSelected ? { backgroundColor: SELECTED_CARD_COLOR } : undefined}
                      >
                        <span className="line-clamp-2 font-semibold leading-tight" title={phase.label}>
                          {phase.label}
                        </span>
                        {totalCount > 0 && (
                          <span
                            className={`mt-1 text-xs ${isSelected ? 'opacity-90' : 'text-slate-500'}`}
                          >
                            {totalCount.toLocaleString()} avis
                          </span>
                        )}
                      </button>
                      <TypeDistributionBar distribution={phaseDistribution} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ligne 2 : Groupes (visible uniquement si une phase est sélectionnée) */}
          {selectedPhaseData ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ligne 2 — Groupes
                <span className="ml-2 font-normal normal-case text-slate-600">
                  ({selectedPhaseData.label})
                </span>
              </h2>
              <div className="flex min-w-0 w-full items-stretch gap-1">
                {selectedPhaseData.groups.map((group, index) => {
                  const isSelected = selectedGroup === group.id
                  const groupCount = getGroupTotalCount(group)
                  const groupDistribution = getTypeDistribution([group])
                  return (
                    <div
                      key={group.id}
                      className="flex min-w-0 flex-1 items-center gap-1"
                    >
                      {index > 0 && (
                        <span className="flex shrink-0 px-0.5">
                          <ArrowIcon />
                        </span>
                      )}
                      <div className="flex min-h-[5.5rem] min-w-0 flex-1 flex-col">
                        <button
                          type="button"
                          onClick={() => handleGroupClick(group.id)}
                          className={`flex w-full flex-1 flex-col rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition ${
                            isSelected
                              ? 'border-transparent text-white shadow-md'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: SELECTED_CARD_COLOR }
                              : undefined
                          }
                        >
                          <span className="line-clamp-2 font-semibold leading-tight" title={group.label}>
                            {group.label}
                          </span>
                          {groupCount > 0 && (
                            <span
                              className={`mt-1 text-xs ${isSelected ? 'opacity-90' : 'text-slate-500'}`}
                            >
                              {groupCount.toLocaleString()} avis
                            </span>
                          )}
                        </button>
                        <TypeDistributionBar distribution={groupDistribution} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
              <p className="text-center text-sm text-slate-500">
                Sélectionnez une phase principale pour afficher les groupes
              </p>
            </div>
          )}

          {/* Ligne 3 : Tags (visible uniquement si un groupe est sélectionné) */}
          {selectedGroupData ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ligne 3 — Tags
                <span className="ml-2 font-normal normal-case text-slate-600">
                  ({selectedGroupData.label})
                </span>
              </h2>
              <div className="grid min-w-0 w-full grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                {selectedGroupData.tags.map((tag) => {
                  const count = getTagCount(selectedGroupData, tag)
                  const isSelected =
                    selectedTag?.group === selectedGroupData.label &&
                    selectedTag?.tag === tag
                  const tagDistribution = getTypeDistribution([
                    { ...selectedGroupData, tags: [tag] },
                  ])
                  return (
                    <div key={tag} className="flex min-h-[5.5rem] min-w-0 flex-col">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTag((prev) =>
                            prev?.group === selectedGroupData.label &&
                            prev?.tag === tag
                              ? null
                              : {
                                  group: selectedGroupData.label,
                                  tag,
                                  dataGroup: getDataGroup(selectedGroupData),
                                }
                          )
                        }
                        className={`flex w-full flex-1 flex-col rounded-lg border px-3 py-2 text-left text-sm transition ${
                          isSelected
                            ? 'border-transparent text-white shadow-md'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: SELECTED_CARD_COLOR }
                            : undefined
                        }
                      >
                        <span className="line-clamp-2 font-medium leading-tight" title={tag}>
                          {tag}
                        </span>
                        {count > 0 && (
                          <span
                            className={`mt-1 text-xs ${isSelected ? 'opacity-90' : 'text-slate-500'}`}
                          >
                            {count.toLocaleString()} avis
                          </span>
                        )}
                      </button>
                      <TypeDistributionBar distribution={tagDistribution} />
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            selectedPhaseData && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
                <p className="text-center text-sm text-slate-500">
                  Sélectionnez un groupe pour afficher les tags
                </p>
              </div>
            )
          )}

          {/* Ligne 4 : Avis (visible uniquement si un tag est sélectionné) */}
          {selectedTag ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ligne 4 — Avis
                <span className="ml-2 font-normal normal-case text-slate-700">
                  ({selectedTag.tag} — {selectedTag.group})
                </span>
              </h2>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {verbatimsForTag.length > 0 ? (
                  verbatimsForTag.map((v, i) => {
                    const config = getTypeConfig(v.type)
                    return (
                      <div
                        key={i}
                        className="rounded-lg border px-3 py-2 text-sm"
                        style={{
                          borderColor: `${config.color}30`,
                          backgroundColor: `${config.color}08`,
                        }}
                      >
                        <p className="text-slate-800">{v.verbatim}</p>
                        <p
                          className="mt-1 flex items-center gap-1 text-xs"
                          style={{ color: config.color }}
                        >
                          {config.icon} Poids : {v.weight.toLocaleString()}
                        </p>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-slate-500">Aucun avis pour ce tag</p>
                )}
              </div>
            </div>
          ) : (
            selectedGroupData && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
                <p className="text-center text-sm text-slate-500">
                  Sélectionnez un tag pour afficher les avis
                </p>
              </div>
            )
          )}
        </div>
    </div>
  )
}
