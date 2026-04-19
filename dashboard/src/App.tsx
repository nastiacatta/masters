import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import { ExplorerProvider } from '@/lib/explorerStore';
import Sidebar from '@/components/dashboard/Sidebar';
import StickyGlossary from '@/components/dashboard/StickyGlossary';

import HomePage from '@/pages/HomePage';
import MechanismPage from '@/pages/MechanismPage';
import ResultsPage from '@/pages/ResultsPage';
import BehaviourPage from '@/pages/BehaviourPage';
import NotesPage from '@/pages/NotesPage';
import PresentationPage from '@/pages/PresentationPage';

import LabPage from '@/pages/LabPage';
import ExperimentsPage from '@/pages/experiments/ExperimentsPage';

/** Scroll to top on route change and add a subtle fade transition. */
function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="flex-1 overflow-hidden flex flex-col animate-in fade-in duration-150">
      {children}
    </div>
  );
}


export default function App() {
  return (
    <StoreProvider>
      <ExplorerProvider>
        <HashRouter>
          <Routes>
            {/* Full-screen presentation mode — no sidebar */}
            <Route path="/slides" element={<PresentationPage />} />
            <Route path="/presentation" element={<Navigate to="/slides" replace />} />

            {/* Main app with sidebar */}
            <Route path="*" element={<MainLayout />} />
          </Routes>
        </HashRouter>
      </ExplorerProvider>
    </StoreProvider>
  );
}

function MainLayout() {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
          <PageTransition>
            <Routes>
              {/* Thesis flow */}
              <Route path="/" element={<HomePage />} />
              <Route path="/evidence" element={<ResultsPage />} />
              <Route path="/robustness" element={<BehaviourPage />} />

              {/* Reference */}
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/explorer" element={<MechanismPage />} />

              {/* Legacy interactive tools */}
              <Route path="/appendix" element={<LabPage />} />
              <Route path="/appendix/experiments" element={<ExperimentsPage />} />

              {/* Redirects — all old routes point to new locations */}
              <Route path="/results" element={<Navigate to="/evidence" replace />} />
              <Route path="/behaviour" element={<Navigate to="/robustness" replace />} />
              <Route path="/mechanism" element={<Navigate to="/explorer" replace />} />
              <Route path="/presentation" element={<Navigate to="/slides" replace />} />
              <Route path="/lab" element={<Navigate to="/appendix" replace />} />
              <Route path="/walkthrough" element={<Navigate to="/explorer" replace />} />
              <Route path="/experiments" element={<Navigate to="/appendix/experiments" replace />} />
              <Route path="/validation" element={<Navigate to="/robustness" replace />} />
              <Route path="/overview" element={<Navigate to="/" replace />} />
              <Route path="/pipeline" element={<Navigate to="/explorer" replace />} />
              <Route path="/comparison" element={<Navigate to="/evidence" replace />} />
              <Route path="/comparisons" element={<Navigate to="/evidence" replace />} />
              <Route path="/mechanism-explorer" element={<Navigate to="/explorer" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PageTransition>
        </main>
      </div>
      <StickyGlossary />
    </>
  );
}
