import { useState } from 'react'
import './App.css'
import SearchByScripture from './components/lib-ui/SearchByScripture';
import Spinner from './components/lib-ui/Spinner';
import { SettingsSelector } from './components/lib-ui/SettingsSelector';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar';
import { AppSidebar } from './components/lib-ui/AppSidebar';
import { ScriptureSearchProvider } from './components/lib-ui/ScriptureSearchContext';


function App() {

  const [loading, setLoading] = useState(false)
  return (

  <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties
    }
  >
  <ScriptureSearchProvider setLoading={setLoading}>
    <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 bg-background px-4">
          <h2 className="text-5xl font-semibold">Sermon Gallery</h2>
        </header>
        <SettingsSelector />
        <div className="card">
          {loading && <div className='flex justify-center'><Spinner /></div>}
          <SearchByScripture />
        </div>
      </SidebarInset>
    </ScriptureSearchProvider>
  </SidebarProvider>
  )
}

export default App
