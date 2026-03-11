import { useState } from 'react'
import { useData } from './hooks/useData'
import { Sidebar, type TabId } from './components/Sidebar'
import { ViewGroupes } from './views/ViewGroupes'
import { ViewParcoursClient } from './views/ViewParcoursClient'

function App() {
  const { flat, verbatims, loading, error } = useData()
  const [activeTab, setActiveTab] = useState<TabId>('groupes')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-zinc-500">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-8 py-6 text-rose-400">
          Erreur : {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto p-8">
        {activeTab === 'groupes' && <ViewGroupes flat={flat} verbatims={verbatims} />}
        {activeTab === 'parcours' && <ViewParcoursClient />}
      </main>
    </div>
  )
}

export default App
