import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import Sidebar from '@/components/dashboard/Sidebar';

import CoreOverview from '@/pages/core/CoreOverview';
import RoundTimeline from '@/pages/core/RoundTimeline';
import EffectiveWager from '@/pages/core/EffectiveWager';
import Aggregation from '@/pages/core/Aggregation';
import Settlement from '@/pages/core/Settlement';
import SkillUpdate from '@/pages/core/SkillUpdate';
import Invariants from '@/pages/core/Invariants';

import BehaviourOverview from '@/pages/behaviour/BehaviourOverview';
import BehaviourFamilies from '@/pages/behaviour/BehaviourFamilies';

import Validation from '@/pages/validation/Validation';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-slate-50">
            <Routes>
              <Route path="/" element={<Navigate to="/core" replace />} />

              {/* Core mechanism */}
              <Route path="/core" element={<CoreOverview />} />
              <Route path="/core/timeline" element={<RoundTimeline />} />
              <Route path="/core/effective-wager" element={<EffectiveWager />} />
              <Route path="/core/aggregation" element={<Aggregation />} />
              <Route path="/core/settlement" element={<Settlement />} />
              <Route path="/core/skill" element={<SkillUpdate />} />
              <Route path="/core/invariants" element={<Invariants />} />

              {/* User behaviour */}
              <Route path="/behaviour" element={<BehaviourOverview />} />
              <Route path="/behaviour/families" element={<BehaviourFamilies />} />

              {/* Validation */}
              <Route path="/validation" element={<Validation />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}
