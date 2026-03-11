import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import Sidebar from '@/components/dashboard/Sidebar';

import DGPOverview from '@/pages/dgp/DGPOverview';
import DGPExperiments from '@/pages/dgp/DGPExperiments';

import CoreOverview from '@/pages/core/CoreOverview';
import CoreExperiments from '@/pages/core/CoreExperiments';
import RoundTimeline from '@/pages/core/RoundTimeline';
import EffectiveWager from '@/pages/core/EffectiveWager';
import Aggregation from '@/pages/core/Aggregation';
import Settlement from '@/pages/core/Settlement';
import SkillUpdate from '@/pages/core/SkillUpdate';
import Invariants from '@/pages/core/Invariants';

import BehaviourOverview from '@/pages/behaviour/BehaviourOverview';
import BehaviourFamilies from '@/pages/behaviour/BehaviourFamilies';
import BehavioursExperiments from '@/pages/behaviour/BehavioursExperiments';

import Validation from '@/pages/validation/Validation';
import PipelineOverview from '@/pages/PipelineOverview';
import ExperimentTopBar from '@/components/dashboard/ExperimentTopBar';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
            <Routes>
              <Route path="/" element={<PipelineOverview />} />

              {/* DGP */}
              <Route path="/dgp" element={<DGPOverview />} />
              <Route path="/dgp/experiments" element={<DGPExperiments />} />

              {/* Core */}
              <Route path="/core" element={<CoreOverview />} />
              <Route path="/core/effective-wager" element={<EffectiveWager />} />
              <Route path="/core/aggregation" element={<Aggregation />} />
              <Route path="/core/settlement" element={<Settlement />} />
              <Route path="/core/skill" element={<SkillUpdate />} />
              <Route path="/core/invariants" element={<Invariants />} />
              <Route path="/core/experiments" element={<CoreExperiments />} />

              {/* Behaviours */}
              <Route path="/behaviours" element={<BehaviourOverview />} />
              <Route path="/behaviours/families" element={<BehaviourFamilies />} />
              <Route path="/behaviours/experiments" element={<BehavioursExperiments />} />

              {/* Round timeline (core sub-page) */}
              <Route path="/core/timeline" element={<RoundTimeline />} />

              {/* Legacy routes */}
              <Route path="/mechanism" element={<CoreOverview />} />
              <Route path="/mechanism/timeline" element={<RoundTimeline />} />
              <Route path="/mechanism/effective-wager" element={<EffectiveWager />} />
              <Route path="/mechanism/aggregation" element={<Aggregation />} />
              <Route path="/mechanism/settlement" element={<Settlement />} />
              <Route path="/mechanism/skill" element={<SkillUpdate />} />
              <Route path="/mechanism/invariants" element={<Invariants />} />
              <Route path="/validation" element={
                <>
                  <ExperimentTopBar />
                  <div className="flex-1 overflow-y-auto">
                    <Validation />
                  </div>
                </>
              } />
              <Route path="/behaviour" element={<BehaviourOverview />} />
              <Route path="/behaviour/families" element={<BehaviourFamilies />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}
