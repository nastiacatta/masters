import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import Sidebar from '@/components/dashboard/Sidebar';
import Overview from '@/pages/Overview';
import RoundReplay from '@/pages/RoundReplay';
import Behaviour from '@/pages/Behaviour';
import Diagnostics from '@/pages/Diagnostics';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-slate-50">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/replay" element={<RoundReplay />} />
              <Route path="/behaviour" element={<Behaviour />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}
