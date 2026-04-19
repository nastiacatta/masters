import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TAXONOMY_ITEMS } from '@/lib/behaviour/taxonomyData';
import { useBehaviourSimulations } from '@/hooks/useBehaviourSimulations';
import { FigureProvider } from '@/contexts/FigureContext';
import { EquationProvider } from '@/contexts/EquationContext';

// ── Tab components ─────────────────────────────────────────────────────────
import OverviewTab from '@/components/behaviour/tabs/OverviewTab';
import ParticipationTab from '@/components/behaviour/tabs/ParticipationTab';
import InformationTab from '@/components/behaviour/tabs/InformationTab';
import AdversarialTab from '@/components/behaviour/tabs/AdversarialTab';
import ReportingTab from '@/components/behaviour/tabs/ReportingTab';
import SensitivityTab from '@/components/behaviour/tabs/SensitivityTab';
import StakingTab from '@/components/behaviour/tabs/StakingTab';
import ObjectivesTab from '@/components/behaviour/tabs/ObjectivesTab';
import IdentityTab from '@/components/behaviour/tabs/IdentityTab';
import LearningTab from '@/components/behaviour/tabs/LearningTab';
import OperationalTab from '@/components/behaviour/tabs/OperationalTab';

// ── 11-tab structure ───────────────────────────────────────────────────────

const TABS = [
  'Overview', 'Participation', 'Information', 'Reporting', 'Staking',
  'Objectives', 'Identity', 'Learning', 'Adversarial', 'Operational', 'Sensitivity',
] as const;
type Tab = (typeof TABS)[number];

/** Core tabs with experiment-backed content. */
const CORE_TABS: Tab[] = ['Overview', 'Participation', 'Information', 'Reporting', 'Adversarial', 'Sensitivity'];
/** Extended tabs — in-browser simulations. */
const EXTENDED_TABS: Tab[] = ['Staking', 'Objectives', 'Identity', 'Learning', 'Operational'];

/** Tabs that have experiment-backed content (not just taxonomy placeholders). */
const EXPERIMENT_TABS = new Set<string>(
  TAXONOMY_ITEMS
    .filter((item) => item.status === 'experiment' && item.tab)
    .map((item) => item.tab!),
);
// Overview and Sensitivity are always experiment-backed
EXPERIMENT_TABS.add('Overview');
EXPERIMENT_TABS.add('Sensitivity');

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function BehaviourPage() {
  const [tab, setTab] = useState<Tab>('Overview');

  // ── All simulations via custom hook ────────────────────────────────────
  const sims = useBehaviourSimulations();
  const { baseline, pipelines, summary: behaviourSummary, familyImpact, sweep } = sims;

  return (
    <FigureProvider>
    <EquationProvider>
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Robustness</h1>
          <p className="text-sm text-slate-500 mt-1">
            Testing mechanism resilience under diverse agent behaviours, strategic attacks, and parameter sensitivity.
            18 behaviour presets tested against the truthful baseline using paired comparison.
          </p>
        </header>

        {/* ── Tab bar with experiment/taxonomy indicators ─────────────── */}
        <div className="flex items-center gap-0">
          <div className="flex gap-0 border-b border-slate-200 overflow-x-auto flex-1">
            {CORE_TABS.map(t => {
              const hasExperiment = EXPERIMENT_TABS.has(t);
              return (
                <button key={t} onClick={() => setTab(t)}
                  className={`relative px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  <span className="flex items-center gap-1.5">
                    {t}
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${hasExperiment ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </span>
                </button>
              );
            })}
            <span className="inline-block w-px bg-slate-300 mx-1 self-stretch" />
            {EXTENDED_TABS.map(t => {
              const hasExperiment = EXPERIMENT_TABS.has(t);
              return (
                <button key={t} onClick={() => setTab(t)}
                  className={`relative px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  <span className="flex items-center gap-1.5">
                    {t}
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${hasExperiment ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </span>
                </button>
              );
            })}
          </div>
          <span className="ml-auto flex-shrink-0 whitespace-nowrap pl-4 pr-1 text-slate-400" style={{ fontSize: '11px' }}>
            Tab {TABS.indexOf(tab) + 1} of {TABS.length}: {tab}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.15 }}>
            {tab === 'Overview' && <OverviewTab summary={behaviourSummary} familyImpact={familyImpact} setTab={setTab} />}
            {tab === 'Participation' && <ParticipationTab bursty={pipelines.bursty} baseline={baseline} />}
            {tab === 'Information' && <InformationTab biased={pipelines.biased} miscalibrated={pipelines.miscalibrated} baseline={baseline} />}
            {tab === 'Adversarial' && <AdversarialTab manipulator={pipelines.manipulator} arbitrageur={pipelines.arbitrageur} sybil={pipelines.sybil} collusion={pipelines.collusion} repReset={pipelines.reputation_reset} evader={pipelines.evader} baseline={baseline} />}
            {tab === 'Reporting' && <ReportingTab riskAverse={pipelines.risk_averse} noisyReporter={pipelines.noisy_reporter} reputationGamer={pipelines.reputation_gamer} sandbagger={pipelines.sandbagger} baseline={baseline} />}
            {tab === 'Sensitivity' && <SensitivityTab data={sweep} />}
            {tab === 'Staking' && <StakingTab budgetConstrained={pipelines.budget_constrained} houseMoney={pipelines.house_money} kellySizer={pipelines.kelly_sizer} baseline={baseline} />}
            {tab === 'Objectives' && <ObjectivesTab riskAverse={pipelines.risk_averse} baseline={baseline} />}
            {tab === 'Identity' && <IdentityTab sybil={pipelines.sybil} collusion={pipelines.collusion} repReset={pipelines.reputation_reset} baseline={baseline} />}
            {tab === 'Learning' && <LearningTab />}
            {tab === 'Operational' && <OperationalTab latencyExploiter={pipelines.latency_exploiter} baseline={baseline} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    </EquationProvider>
    </FigureProvider>
  );
}
