import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TAXONOMY_ITEMS } from '@/lib/behaviour/taxonomyData';
import { useBehaviourSimulations } from '@/hooks/useBehaviourSimulations';
import { FigureProvider } from '@/contexts/FigureContext';
import { EquationProvider } from '@/contexts/EquationContext';
import TabBar from '@/components/dashboard/TabBar';

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

/** Display order: core tabs first, then extended. */
const DISPLAY_TABS: Tab[] = [...CORE_TABS, ...EXTENDED_TABS];

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
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 pt-12 pb-20 space-y-12">
        <header>
          <p
            className="eyebrow mb-3"
            style={{ color: 'var(--navy)' }}
          >
            Step 3 &middot; Stress tests
          </p>
          <h1
            className="font-serif tracking-tight"
            style={{
              fontSize: 'clamp(32px, 4vw, 42px)',
              lineHeight: 1.15,
              fontWeight: 600,
              color: 'var(--ink)',
            }}
          >
            Robustness
          </h1>
          <p
            className="font-serif mt-4"
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: 'var(--ink-muted)',
              maxWidth: 820,
            }}
          >
            Stress-tests of the mechanism under diverse agent behaviours, strategic attacks, and parameter
            shifts. Eighteen behaviour presets are compared against a truthful baseline using paired runs,
            same underlying outcomes and seeds, so every reported difference comes from the behaviour alone.
          </p>
        </header>

        {/* ── Tab bar with experiment/taxonomy indicators ─────────────── */}
        <TabBar
          tabs={DISPLAY_TABS}
          activeTab={tab}
          onTabChange={(t) => setTab(t as Tab)}
          experimentTabs={EXPERIMENT_TABS}
          groupBreaks={[CORE_TABS.length]}
          progressLabel={`Tab ${DISPLAY_TABS.indexOf(tab) + 1} of ${DISPLAY_TABS.length}: ${tab}`}
        />

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
