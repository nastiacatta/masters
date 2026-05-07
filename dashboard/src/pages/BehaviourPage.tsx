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
import PageShell from '@/components/dashboard/PageShell';
import PageHeader from '@/components/dashboard/PageHeader';

// ── 11-tab structure ───────────────────────────────────────────────────────

type Tab =
  | 'Overview' | 'Participation' | 'Information' | 'Reporting' | 'Staking'
  | 'Objectives' | 'Identity' | 'Learning' | 'Adversarial' | 'Operational' | 'Sensitivity';

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
    <PageShell width="wide">
        <PageHeader
          hero
          eyebrow="Step 3 · Stress tests"
          title="Robustness"
          subtitle="Stress-tests of the mechanism under diverse agent behaviours, strategic attacks, and parameter shifts. Eighteen behaviour presets are compared against a truthful baseline using paired runs, same underlying outcomes and seeds, so every reported difference comes from the behaviour alone."
        />

        <div
          className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 leading-relaxed"
          style={{ marginTop: 8 }}
        >
          <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider mb-1.5">
            Why synthetic data here, when the forecasting chapter uses real Elia data?
          </div>
          <p>
            Adversarial agents make <em>decisions</em> — whether to participate, which account to
            play from, how much to stake, how far to pull the aggregate. Real-world time series
            (Elia wind, Elia imbalance) can&apos;t generate those decisions: the forecaster panel
            (XGBoost, ARIMA, MLP, etc.) is passive and has no strategy layer. To test sybil-
            proofness, collusion, or manipulation you need three things real data can&apos;t give
            you — a <strong>paired counterfactual</strong> (&ldquo;what if the attacker had been
            honest?&rdquo;), a <strong>ground-truth label</strong> of which accounts belong to
            whom, and <strong>controlled stake and arrival choices</strong>. Every attack below
            is therefore run on the same synthetic DGP and paired seeds, so the only thing moving
            is the attacker. The honest-forecaster results on Elia wind/electricity live in the
            Results and Validation pages.
          </p>
        </div>

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
    </PageShell>
    </EquationProvider>
    </FigureProvider>
  );
}
