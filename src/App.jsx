import { useState, Suspense, lazy } from 'react';
import { AppShell } from '@mantine/core';
import Header from './components/layout/Header';
import { MapProvider } from './context/MapContext';
import { DataProvider } from './context/DataContext';
import DefaultFallback from './components/DefaultFallback';

const Sidebar = lazy(() => import('./components/layout/Sidebar'));
const MapView = lazy(() => import('./components/map/MapView'));
const DataPanel = lazy(() => import('./components/data/DataPanel'));

function App() {
  const [sidebarOpened, setSidebarOpened] = useState(true);
  const [dataPanelOpened, setDataPanelOpened] = useState(false);

  return (
    <DataProvider>
      <MapProvider>
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 300,
            breakpoint: 'sm',
            collapsed: { desktop: !sidebarOpened },
          }}
          aside={{
            width: 400,
            breakpoint: 'md',
            collapsed: { desktop: !dataPanelOpened },
          }}
          padding="0"
        >
          <AppShell.Header>
            <Header
              sidebarOpened={sidebarOpened}
              onToggleSidebar={() => setSidebarOpened(!sidebarOpened)}
              dataPanelOpened={dataPanelOpened}
              onToggleDataPanel={() => setDataPanelOpened(!dataPanelOpened)}
            />
          </AppShell.Header>

          <Suspense fallback={<DefaultFallback className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />}>
            <AppShell.Navbar className={`${sidebarOpened ? 'block' : 'hidden'} h-full z-40`}>
              <Sidebar />
            </AppShell.Navbar>

            <AppShell.Main>
              <MapView />
            </AppShell.Main>

            <AppShell.Aside className={`${dataPanelOpened ? 'block' : 'hidden'} h-full z-40`}>
              <DataPanel />
            </AppShell.Aside>
          </Suspense>
        </AppShell>
      </MapProvider>
    </DataProvider>
  );
}

export default App;