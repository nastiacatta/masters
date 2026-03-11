import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import { ExplorerProvider } from '@/lib/explorerStore';
import Sidebar from '@/components/dashboard/Sidebar';

import Overview from '@/pages/Overview';
import MechanismExplorer from '@/pages/MechanismExplorer';
import ExperimentsPage from '@/pages/experiments/ExperimentsPage';
import Comparison from '@/pages/Comparison';
import Appendix from '@/pages/Appendix';

import Validation from '@/pages/validation/Validation';
import ExperimentTopBar from '@/components/dashboard/ExperimentTopBar';

import DGPOverview from '@/pages/dgp/DGPOverview';
import CoreOverview from '@/pages/core/CoreOverview';
import BehaviourOverview from '@/pages/behaviour/BehaviourOverview';

export default function App() {
  return (
    <StoreProvider>
      <ExplorerProvider>
        <BrowserRouter>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
              <Routes>
                {/* Thesis-first routes */}
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/mechanism-explorer" element={<MechanismExplorer />} />
                <Route path="/experiments" element={<ExperimentsPage />} />
                <Route path="/comparison" element={<Comparison />} />
                <Route path="/appendix" element={<Appendix />} />
                <Route path="/appendix/dgp" element={<DGPOverview />} />
                <Route path="/appendix/core" element={<CoreOverview />} />
                <Route path="/appendix/behaviours" element={<BehaviourOverview />} />

                {/* Redirects for legacy routes */}
                <Route path="/walkthrough" element={<Navigate to="/mechanism-explorer" replace />} />
                <Route path="/pipeline" element={<Navigate to="/mechanism-explorer" replace />} />

                {/* Validation (experiments sub-page) */}
                <Route path="/validation" element={
                  <>
                    <ExperimentTopBar />
                    <div className="flex-1 overflow-y-auto">
                      <Validation />
                    </div>
                  </>
                } />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ExplorerProvider>
    </StoreProvider>
  );
}
