export type TabId = 'groupes' | 'parcours'

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'groupes', label: 'Groupes' },
    { id: 'parcours', label: 'Parcours client' },
  ]

  return (
    <aside className="w-64 shrink-0 border-r border-white/5 bg-black/20 p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Navigation
      </h3>
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
