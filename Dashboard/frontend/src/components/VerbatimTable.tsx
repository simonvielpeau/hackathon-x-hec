import { useMemo, useState } from 'react'
import type { VerbatimRecord } from '../types/data'

interface VerbatimTableProps {
  data: VerbatimRecord[]
}

export function VerbatimTable({ data }: VerbatimTableProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(
      (r) =>
        r.verbatim.toLowerCase().includes(q) ||
        r.parentDescription.toLowerCase().includes(q) ||
        r.tag.toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q)
    )
  }, [data, search])

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="border-b border-white/5 p-4">
        <input
          type="text"
          placeholder="Rechercher dans les descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
        />
      </div>
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-zinc-900/95 text-xs font-medium uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Tag</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Description parent</th>
              <th className="px-4 py-3">Verbatim</th>
              <th className="px-4 py-3 text-right">Poids</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.slice(0, 200).map((r, i) => (
              <tr
                key={i}
                className="transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3 text-zinc-300">{r.group}</td>
                <td className="px-4 py-3 text-zinc-300">{r.tag}</td>
                <td className="px-4 py-3 text-zinc-400">{r.type}</td>
                <td className="max-w-[200px] px-4 py-3 text-zinc-400 truncate" title={r.parentDescription}>
                  {r.parentDescription}
                </td>
                <td className="max-w-[300px] px-4 py-3 text-white" title={r.verbatim}>
                  {r.verbatim}
                </td>
                <td className="px-4 py-3 text-right font-medium text-indigo-400">
                  {r.weight.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > 200 && (
        <div className="border-t border-white/5 px-4 py-2 text-xs text-zinc-500">
          Affichage des 200 premiers résultats sur {filtered.length}
        </div>
      )}
    </div>
  )
}
