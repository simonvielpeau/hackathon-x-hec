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

  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="flex h-full w-full">
        {TYPE_ORDER.map((type) => {
          const weight = distribution[type] ?? 0
          const pct = (weight / total) * 100
          if (weight <= 0) return null
          const config = getTypeConfig(type)
          return (
            <div
              key={type}
              title={`${config.label}: ${weight.toLocaleString()}`}
              style={{
                width: `${pct}%`,
                backgroundColor: config.color,
              }}
              className="h-full transition-all"
            />
          )
        })}
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

const PHASE_COLORS = [
  '#0066FF', // Bleu Blumana - Anticipation
  '#0EA5E9', // Approche
  '#10B981', // Cœur (vert - jeu)
  '#F59E0B', // Divertissement (ambre)
  '#8B5CF6', // Séjour (violet)
  '#64748B', // Conclusion (slate)
]

export function ViewParcoursClient({ flat = [], verbatims = [] }: ViewParcoursClientProps) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<{ group: string; tag: string } | null>(null)

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
      .filter((v) => v.group === selectedTag.group && v.tag === selectedTag.tag)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
  }, [verbatims, selectedTag])

  const getTagCount = (groupLabel: string, tag: string) => {
    const key = `${groupLabel}|${tag}`
    return tagCounts.get(key) ?? 0
  }

  const getGroupTotalCount = (group: ParcoursGroup) => {
    return group.tags.reduce(
      (sum, tag) => sum + getTagCount(group.label, tag),
      0
    )
  }

  const getPhaseTotalCount = (groups: ParcoursGroup[]) => {
    return groups.reduce((sum, g) => sum + getGroupTotalCount(g), 0)
  }

  const getTypeDistribution = (
    items: { label: string; tags: string[] }[]
  ): Record<string, number> => {
    const dist: Record<string, number> = {}
    for (const item of items) {
      for (const tag of item.tags) {
        const key = `${item.label}|${tag}`
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
      </header>

      <div className="flex min-w-0 flex-col gap-6">
          {/* Ligne 1 : Phases principales */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ligne 1 — Phases principales
            </h2>
            <div className="flex min-w-0 w-full items-center gap-1">
              {PARCOURS_PHASES.map((phase, index) => {
                const color = PHASE_COLORS[index % PHASE_COLORS.length]
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
                    <div className="flex min-w-0 flex-1 flex-col">
                      <button
                        type="button"
                        onClick={() => handlePhaseClick(phase.id)}
                        className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                          isSelected
                            ? 'text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                        style={isSelected ? { backgroundColor: color } : undefined}
                      >
                        <span className="block truncate font-semibold" title={phase.label}>
                          {phase.label}
                        </span>
                        {totalCount > 0 && (
                          <span
                            className={`text-xs ${isSelected ? 'opacity-90' : 'text-slate-500'}`}
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
                <span
                  className="ml-2 font-normal normal-case"
                  style={{
                    color:
                      PHASE_COLORS[
                        PARCOURS_PHASES.findIndex((p) => p.id === selectedPhase) %
                          PHASE_COLORS.length
                      ],
                  }}
                >
                  ({selectedPhaseData.label})
                </span>
              </h2>
              <div className="flex min-w-0 w-full items-center gap-1">
                {selectedPhaseData.groups.map((group, index) => {
                  const phaseColor =
                    PHASE_COLORS[
                      PARCOURS_PHASES.findIndex((p) => p.id === selectedPhase) %
                        PHASE_COLORS.length
                    ]
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
                      <div className="flex min-w-0 flex-1 flex-col">
                        <button
                          type="button"
                          onClick={() => handleGroupClick(group.id)}
                          className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition ${
                            isSelected
                              ? 'border-transparent text-white shadow-md'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: phaseColor }
                              : undefined
                          }
                        >
                          <span className="block truncate font-semibold" title={group.label}>
                            {group.label}
                          </span>
                          {groupCount > 0 && (
                            <span
                              className={`text-xs ${isSelected ? 'opacity-90' : 'text-slate-500'}`}
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
                <span
                  className="ml-2 font-normal normal-case"
                  style={{
                    color:
                      PHASE_COLORS[
                        PARCOURS_PHASES.findIndex((p) => p.id === selectedPhase) %
                          PHASE_COLORS.length
                      ],
                  }}
                >
                  ({selectedGroupData.label})
                </span>
              </h2>
              <div className="grid min-w-0 w-full grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                {selectedGroupData.tags.map((tag) => {
                  const phaseColor =
                    selectedPhase
                      ? PHASE_COLORS[
                          PARCOURS_PHASES.findIndex((p) => p.id === selectedPhase) %
                            PHASE_COLORS.length
                        ]
                      : '#64748B'
                  const count = getTagCount(selectedGroupData.label, tag)
                  const isSelected =
                    selectedTag?.group === selectedGroupData.label &&
                    selectedTag?.tag === tag
                  const tagDistribution = getTypeDistribution([
                    { label: selectedGroupData.label, tags: [tag] },
                  ])
                  return (
                    <div key={tag} className="flex min-w-0 flex-col">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTag((prev) =>
                            prev?.group === selectedGroupData.label &&
                            prev?.tag === tag
                              ? null
                              : { group: selectedGroupData.label, tag }
                          )
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                          isSelected
                            ? 'border-transparent text-white shadow-md'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: phaseColor }
                            : undefined
                        }
                      >
                        <span className="block truncate font-medium" title={tag}>
                          {tag}
                        </span>
                        {count > 0 && (
                          <span
                            className={`text-xs ${isSelected ? 'opacity-90' : 'text-slate-500'}`}
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
