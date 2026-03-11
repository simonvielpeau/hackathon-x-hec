export type TabId = 'accueil' | 'groupes' | 'parcours'

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'groupes', label: 'Groupes' },
    { id: 'parcours', label: 'Parcours client' },
  ]

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4">
      <div className="mb-6">
        <span className="text-xl font-bold text-[#0066FF]">Blumana</span>
        <p className="mt-0.5 text-xs text-slate-500">
          Agents IA experts de vos parcours clients
        </p>
      </div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Navigation
      </h3>
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-[#0066FF]/10 text-[#0066FF]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
