import { useState, useEffect, useMemo } from 'react'
import type { RawRecord, FlattenedRecord, VerbatimRecord, TreemapNode, ChildRecord } from '../types/data'

const IRRITANT_TYPE = 'Irritant / Point de rupture'
const APPRECIATED_TYPE = 'Élément apprécié / Coup de cœur'

function getDescription(obj: RawRecord | ChildRecord, ...keys: string[]): string {
  for (const key of keys) {
    const val = (obj as unknown as Record<string, unknown>)[key]
    if (val && typeof val === 'string') return val
  }
  return ''
}

function flattenRecords(records: RawRecord[]): FlattenedRecord[] {
  return records.map((r) => ({
    group: r.group ?? 'Non classé',
    tag: r.tag ?? 'Non classé',
    type: r.type ?? 'Non classé',
    count: r.count ?? 0,
    longDescription: getDescription(r, 'longDescription', 'long_description') || `${r.tag} - ${r.type}`,
  }))
}

function flattenVerbatims(records: RawRecord[]): VerbatimRecord[] {
  const out: VerbatimRecord[] = []
  for (const r of records) {
    const children = r.children ?? []
    const parentDesc = getDescription(r, 'longDescription', 'long_description')
    for (const c of children) {
      const verbatim = getDescription(c, 'long_description', 'longDescription')
      if (verbatim) {
        out.push({
          group: r.group ?? 'Non classé',
          tag: r.tag ?? 'Non classé',
          type: r.type ?? 'Non classé',
          parentDescription: parentDesc,
          verbatim,
          weight: (c as { count?: number }).count ?? 0,
        })
      }
    }
  }
  return out
}

function buildTreemapData(flat: FlattenedRecord[]): TreemapNode[] {
  const byGroup = new Map<string, Map<string, Map<string, number>>>()
  for (const r of flat) {
    if (!byGroup.has(r.group)) byGroup.set(r.group, new Map())
    const byTag = byGroup.get(r.group)!
    if (!byTag.has(r.tag)) byTag.set(r.tag, new Map())
    const byType = byTag.get(r.tag)!
    byType.set(r.type, (byType.get(r.type) ?? 0) + r.count)
  }
  return Array.from(byGroup.entries()).map(([group, byTag]) => ({
    name: group,
    value: Array.from(byTag.values()).reduce((s, m) => s + Array.from(m.values()).reduce((a, b) => a + b, 0), 0),
    children: Array.from(byTag.entries()).map(([tag, byType]) => ({
      name: tag,
      value: Array.from(byType.values()).reduce((a, b) => a + b, 0),
      children: Array.from(byType.entries()).map(([type, count]) => ({ name: type, value: count })),
    })),
  }))
}

export function useData() {
  const [raw, setRaw] = useState<RawRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((data: RawRecord[]) => {
        setRaw(Array.isArray(data) ? data : [])
        setError(null)
      })
      .catch((err) => {
        setError(err?.message ?? 'Erreur de chargement')
        setRaw([])
      })
      .finally(() => setLoading(false))
  }, [])

  const flat = useMemo(() => flattenRecords(raw), [raw])
  const verbatims = useMemo(() => flattenVerbatims(raw), [raw])
  const treemapData = useMemo(() => buildTreemapData(flat), [flat])

  return { raw, flat, verbatims, treemapData, loading, error, IRRITANT_TYPE, APPRECIATED_TYPE }
}
