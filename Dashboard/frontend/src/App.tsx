import { useState } from 'react'
import { useData } from './hooks/useData'
import { Sidebar, type TabId } from './components/Sidebar'
import { ViewAccueil } from './views/ViewAccueil'
import { ViewGroupes } from './views/ViewGroupes'
import { ViewParcoursClient } from './views/ViewParcoursClient'

function App() {
  const { flat, verbatims, loading, error } = useData()
  const [activeTab, setActiveTab] = useState<TabId>('accueil')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0066FF] border-t-transparent" />
          <p className="text-slate-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-red-200 bg-red-50 px-8 py-6 text-red-700">
          Erreur : {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto p-8">
        {activeTab === 'accueil' && (
          <ViewAccueil
            flat={flat}
            onNavigateToView={setActiveTab}
          />
        )}
        {activeTab === 'groupes' && (
          <ViewGroupes flat={flat} verbatims={verbatims} />
        )}
        {activeTab === 'parcours' && (
          <ViewParcoursClient flat={flat} verbatims={verbatims} />
        )}
      </main>
    </div>
  )
}

export default App
