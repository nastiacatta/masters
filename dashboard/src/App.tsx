import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import { ExplorerProvider } from '@/lib/explorerStore';
import Sidebar from '@/components/dashboard/Sidebar';

import LabPage from '@/pages/LabPage';
import MechanismExplorer from '@/pages/MechanismExplorer';
import ExperimentsPage from '@/pages/experiments/ExperimentsPage';
import Validation from '@/pages/validation/Validation';
import ExperimentTopBar from '@/components/dashboard/ExperimentTopBar';

export default function App() {
  return (
    <StoreProvider>
      <ExplorerProvider>
        <BrowserRouter basename="/masters">
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
              <Routes>
                <Route path="/" element={<Navigate to="/lab" replace />} />
                <Route path="/lab" element={<LabPage />} />
                <Route path="/walkthrough" element={<MechanismExplorer />} />
                <Route path="/experiments" element={<ExperimentsPage />} />
                <Route path="/validation" element={
                  <>
                    <ExperimentTopBar />
                    <div className="flex-1 overflow-y-auto">
                      <Validation />
                    </div>
                  </>
                } />
                <Route path="/overview" element={<Navigate to="/lab" replace />} />
                <Route path="/mechanism-explorer" element={<Navigate to="/lab" replace />} />
                <Route path="/pipeline" element={<Navigate to="/lab" replace />} />
                <Route path="/comparison" element={<Navigate to="/lab" replace />} />
                <Route path="/appendix" element={<Navigate to="/lab" replace />} />
                <Route path="/appendix/*" element={<Navigate to="/lab" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ExplorerProvider>
    </StoreProvider>
  );
}
