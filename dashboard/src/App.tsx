import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import { ExplorerProvider } from '@/lib/explorerStore';
import Sidebar from '@/components/dashboard/Sidebar';
import StickyGlossary from '@/components/dashboard/StickyGlossary';

import HomePage from '@/pages/HomePage';
import MechanismPage from '@/pages/MechanismPage';
import ResultsPage from '@/pages/ResultsPage';
import RobustnessPage from '@/pages/RobustnessPage';
import BehaviourPage from '@/pages/BehaviourPage';
import NotesPage from '@/pages/NotesPage';

import LabPage from '@/pages/LabPage';
import ExperimentsPage from '@/pages/experiments/ExperimentsPage';
import SlidesPage from '@/pages/SlidesPage';

export default function App() {
  return (
    <StoreProvider>
      <ExplorerProvider>
        <HashRouter>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
              <Routes>
                {/* Primary routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/behaviour" element={<BehaviourPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/mechanism" element={<MechanismPage />} />
                <Route path="/robustness" element={<RobustnessPage />} />
                <Route path="/slides" element={<SlidesPage />} />

                {/* Appendix: legacy interactive tools */}
                <Route path="/appendix" element={<LabPage />} />
                <Route path="/appendix/experiments" element={<ExperimentsPage />} />

                {/* Legacy redirects */}
                <Route path="/lab" element={<Navigate to="/appendix" replace />} />
                <Route path="/walkthrough" element={<Navigate to="/mechanism" replace />} />
                <Route path="/experiments" element={<Navigate to="/appendix/experiments" replace />} />
                <Route path="/validation" element={<Navigate to="/behaviour" replace />} />
                <Route path="/overview" element={<Navigate to="/" replace />} />
                <Route path="/pipeline" element={<Navigate to="/mechanism" replace />} />
                <Route path="/comparison" element={<Navigate to="/results" replace />} />
                <Route path="/comparisons" element={<Navigate to="/results" replace />} />
                <Route path="/mechanism-explorer" element={<Navigate to="/mechanism" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <StickyGlossary />
        </HashRouter>
      </ExplorerProvider>
    </StoreProvider>
  );
}
