import PageHeader from '@/components/dashboard/PageHeader';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricCard from '@/components/dashboard/MetricCard';
import { useStore } from '@/lib/store';
import { useExperimentData } from '@/lib/useExperimentData';
import { fmtNum, fmtPct, scenarioLabel } from '@/lib/formatters';
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from 'recharts';

const PALETTE = ['#2563eb', '#7c3aed', '#0d9488', '#10b981', '#ef4444', '#06b6d4'];

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
      {message}
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export default function Behaviour() {
  const { selectedExperiment } = useStore();
  const {
    summary,
    behaviourScenarios,
    preferenceStressData,
    intermittencyStressData,
    arbitrageScanData,
    detectionAdaptationData,
    collusionStressData,
    insiderAdvantageData,
    washActivityData,
    strategicReportingData,
    identityAttackData,
    driftAdaptationData,
    stakePolicyData,
    loading,
  } = useExperimentData();

  if (!selectedExperiment) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Behaviour experiments"
          description="Select a behaviour experiment from the left panel."
        />
      </div>
    );
  }

  if (selectedExperiment.block !== 'behaviour') {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Behaviour experiments"
          description="Select a behaviour-block experiment to see participation, preference, arbitrage, and manipulation diagnostics."
        />
        <EmptyState message="The current selection is not a behaviour experiment." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title={selectedExperiment.displayName}
          description={selectedExperiment.description}
        />
        <EmptyState message="Loading behaviour outputs…" />
      </div>
    );
  }

  const expName = selectedExperiment.name;

  const header = (
    <PageHeader
      title={selectedExperiment.displayName}
      description={selectedExperiment.description}
    />
  );

  if (expName === 'behaviour_matrix') {
    const data = behaviourScenarios.map((row) => ({
      ...row,
      label: scenarioLabel(row.scenario),
    }));

    if (data.length === 0) {
      return (
        <div className="space-y-6 p-6">
          {header}
          <EmptyState message="No behaviour matrix data found." />
        </div>
      );
    }

    const bestProfit = Math.max(...data.map((d) => d.totalProfit));
    const worstGini = Math.max(...data.map((d) => d.finalGini));
    const bestNeff = Math.max(...data.map((d) => d.finalNEff));

    return (
      <div className="space-y-6 p-6">
        {header}

        <CardGrid>
          <MetricCard label="Scenarios" value={String(data.length)} subtitle="Behaviour families tested" />
          <MetricCard label="Best total profit" value={fmtNum(bestProfit, 2)} subtitle="Across scenarios" accent />
          <MetricCard label="Worst final Gini" value={fmtNum(worstGini, 3)} subtitle="Wealth concentration ceiling" />
          <MetricCard label="Best final N_eff" value={fmtNum(bestNeff, 1)} subtitle="Effective participation" />
        </CardGrid>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Total profit by scenario" subtitle="Skill × stake fixed, behaviour varied">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" angle={-20} textAnchor="end" height={90} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalProfit" fill={PALETTE[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Concentration versus effective participation" subtitle="Lower Gini and higher N_eff are preferable">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="finalGini" name="Final Gini" />
                  <YAxis type="number" dataKey="finalNEff" name="Final N_eff" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={data} fill={PALETTE[1]} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <ChartCard title="Mean round profit" subtitle="Per-scenario average">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" angle={-20} textAnchor="end" height={90} interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="meanRoundProfit" fill={PALETTE[2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    );
  }

  if (expName === 'preference_stress_test') {
    const data = preferenceStressData.map((row) => ({
      ...row,
      label: scenarioLabel(row.scenario),
    }));

    if (data.length === 0) {
      return (
        <div className="space-y-6 p-6">
          {header}
          <EmptyState message="No preference stress data found." />
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        {header}

        <CardGrid>
          <MetricCard label="Truthfulness gap" value={fmtNum(data[0]?.totalProfit - (data[1]?.totalProfit ?? 0), 2)} subtitle="Truthful minus hedged profit" />
          <MetricCard label="Truthful Gini" value={fmtNum(data.find((d) => d.scenario === 'truthful')?.finalGini, 3)} subtitle="Concentration under truthful reports" />
          <MetricCard label="Hedged Gini" value={fmtNum(data.find((d) => d.scenario === 'hedged')?.finalGini, 3)} subtitle="Concentration under risk aversion" />
          <MetricCard label="Summary Gini" value={fmtNum(summary?.finalGini, 3)} subtitle="From summary.json" />
        </CardGrid>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Total profit" subtitle="Truthful versus hedged">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalProfit" fill={PALETTE[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Final Gini" subtitle="Preference-sensitive concentration effect">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="finalGini" fill={PALETTE[3]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    );
  }

  if (expName === 'intermittency_stress_test') {
    const data = intermittencyStressData.map((row) => ({
      ...row,
      label: scenarioLabel(row.mode),
    }));

    if (data.length === 0) {
      return (
        <div className="space-y-6 p-6">
          {header}
          <EmptyState message="No intermittency stress data found." />
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        {header}

        <CardGrid>
          <MetricCard label="Highest participation" value={fmtPct(Math.max(...data.map((d) => d.participationRate)))} subtitle="Across participation regimes" />
          <MetricCard label="Lowest participation" value={fmtPct(Math.min(...data.map((d) => d.participationRate)))} subtitle="Across participation regimes" />
          <MetricCard label="Best N_eff" value={fmtNum(Math.max(...data.map((d) => d.finalNEff)), 1)} subtitle="Effective active base" />
          <MetricCard label="Mean N_t" value={fmtNum(summary?.meanNt, 2)} subtitle="From summary.json" />
        </CardGrid>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Participation rate by regime" subtitle="IID, bursty, edge-threshold, avoid-skill-decay">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" angle={-15} textAnchor="end" height={70} interval={0} />
                  <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                  <Tooltip formatter={(v: unknown) => (typeof v === 'number' ? fmtPct(v) : String(v ?? ''))} />
                  <Bar dataKey="participationRate" fill={PALETTE[2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Final N_eff by regime" subtitle="Influence concentration under missingness">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" angle={-15} textAnchor="end" height={70} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="finalNEff" fill={PALETTE[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    );
  }

  if (expName === 'arbitrage_scan') {
    const data = arbitrageScanData;

    if (data.length === 0) {
      return (
        <div className="space-y-6 p-6">
          {header}
          <EmptyState message="No arbitrage scan data found." />
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        {header}

        <CardGrid>
          <MetricCard label="Best arb profit" value={fmtNum(Math.max(...data.map((d) => d.arbTotalProfit)), 2)} subtitle="Across λ values" />
          <MetricCard label="Best arb wealth" value={fmtNum(Math.max(...data.map((d) => d.arbFinalWealth)), 2)} subtitle="Final wealth ceiling" />
          <MetricCard label="Most arb rounds" value={String(Math.max(...data.map((d) => d.arbitrageFoundRounds)))} subtitle="Detected opportunities" />
          <MetricCard label="Rows" value={String(data.length)} subtitle="Grid points in the scan" />
        </CardGrid>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Arbitrage profit against λ" subtitle="Where skill × stake becomes exploitable">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="lam" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="arbTotalProfit" stroke={PALETTE[4]} strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Arbitrage rounds found" subtitle="Frequency of profitable opportunities">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="lam" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="arbitrageFoundRounds" stroke={PALETTE[1]} strokeWidth={2} dot />
                  <Line type="monotone" dataKey="arbFinalWealth" stroke={PALETTE[0]} strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    );
  }

  if (expName === 'detection_adaptation') {
    const data = detectionAdaptationData.map((row) => ({
      ...row,
      label: scenarioLabel(row.attacker),
    }));

    if (data.length === 0) {
      return (
        <div className="space-y-6 p-6">
          {header}
          <EmptyState message="No detection-adaptation data found." />
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        {header}

        <CardGrid>
          <MetricCard label="Fixed manipulator profit" value={fmtNum(data.find((d) => d.attacker === 'fixed_manipulator')?.totalProfit, 2)} subtitle="Baseline attacker" />
          <MetricCard label="Adaptive evader profit" value={fmtNum(data.find((d) => d.attacker === 'adaptive_evader')?.totalProfit, 2)} subtitle="Detector-aware attacker" />
          <MetricCard label="Fixed manipulator wealth" value={fmtNum(data.find((d) => d.attacker === 'fixed_manipulator')?.finalWealth, 2)} subtitle="Post-attack wealth" />
          <MetricCard label="Adaptive evader wealth" value={fmtNum(data.find((d) => d.attacker === 'adaptive_evader')?.finalWealth, 2)} subtitle="Post-attack wealth" />
        </CardGrid>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Attacker total profit" subtitle="Fixed manipulator versus adaptive evader">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalProfit" fill={PALETTE[4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Attacker final wealth" subtitle="Economic survival after manipulation">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="finalWealth" fill={PALETTE[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    );
  }

  const genericBarData = (data: { scenario?: string; identity?: string; belief?: string; staking?: string; finalGini?: number; totalProfit?: number }[], _labelKey: string) =>
    data.map((row) => ({ ...row, label: scenarioLabel(row.scenario ?? row.identity ?? row.belief ?? row.staking ?? '') }));

  if (expName === 'collusion_stress') {
    const data = genericBarData(collusionStressData, 'scenario');
    if (data.length === 0) return <div className="space-y-6 p-6">{header}<EmptyState message="No collusion stress data." /></div>;
    return (
      <div className="space-y-6 p-6">
        {header}
        <CardGrid>
          <MetricCard label="Scenarios" value={String(data.length)} />
          <MetricCard label="Collusion Gini" value={fmtNum(data.find((d) => d.scenario === 'collusion')?.finalGini, 3)} />
        </CardGrid>
        <ChartCard title="Total profit by scenario">
          <div className="h-80"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip /><Bar dataKey="totalProfit" fill={PALETTE[0]} /></BarChart>
          </ResponsiveContainer></div>
        </ChartCard>
      </div>
    );
  }

  if (expName === 'insider_advantage') {
    const data = genericBarData(insiderAdvantageData, 'scenario');
    if (data.length === 0) return <div className="space-y-6 p-6">{header}<EmptyState message="No insider advantage data." /></div>;
    return (
      <div className="space-y-6 p-6">
        {header}
        <ChartCard title="Insider profit by scenario">
          <div className="h-80"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip /><Bar dataKey="insiderProfit" fill={PALETTE[4]} /></BarChart>
          </ResponsiveContainer></div>
        </ChartCard>
      </div>
    );
  }

  if (expName === 'wash_activity_gaming') {
    const data = genericBarData(washActivityData, 'scenario');
    if (data.length === 0) return <div className="space-y-6 p-6">{header}<EmptyState message="No wash activity data." /></div>;
    return (
      <div className="space-y-6 p-6">
        {header}
        <ChartCard title="Total activity by scenario">
          <div className="h-80"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip /><Bar dataKey="totalActivity" fill={PALETTE[2]} /></BarChart>
          </ResponsiveContainer></div>
        </ChartCard>
      </div>
    );
  }

  if (expName === 'strategic_reporting') {
    const data = genericBarData(strategicReportingData, 'scenario');
    if (data.length === 0) return <div className="space-y-6 p-6">{header}<EmptyState message="No strategic reporting data." /></div>;
    return (
      <div className="space-y-6 p-6">
        {header}
        <ChartCard title="Mean aggregate error by scenario">
          <div className="h-80"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip /><Bar dataKey="meanAggError" fill={PALETTE[3]} /></BarChart>
          </ResponsiveContainer></div>
        </ChartCard>
      </div>
    );
  }

  if (expName === 'identity_attack_matrix') {
    const data = genericBarData(identityAttackData, 'identity');
    if (data.length === 0) return <div className="space-y-6 p-6">{header}<EmptyState message="No identity attack data." /></div>;
    return (
      <div className="space-y-6 p-6">
        {header}
        <ChartCard title="Total profit by identity">
          <div className="h-80"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" angle={-15} /><YAxis /><Tooltip /><Bar dataKey="totalProfit" fill={PALETTE[1]} /></BarChart>
          </ResponsiveContainer></div>
        </ChartCard>
      </div>
    );
  }

  if (expName === 'drift_adaptation') {
    const data = genericBarData(driftAdaptationData, 'belief');
    if (data.length === 0) return <div className="space-y-6 p-6">{header}<EmptyState message="No drift adaptation data." /></div>;
    return (
      <div className="space-y-6 p-6">
        {header}
        <ChartCard title="Mean MAE by belief model">
          <div className="h-80"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip /><Bar dataKey="meanMae" fill={PALETTE[0]} /></BarChart>
          </ResponsiveContainer></div>
        </ChartCard>
      </div>
    );
  }

  if (expName === 'stake_policy_matrix') {
    const data = genericBarData(stakePolicyData, 'staking');
    if (data.length === 0) return <div className="space-y-6 p-6">{header}<EmptyState message="No stake policy data." /></div>;
    return (
      <div className="space-y-6 p-6">
        {header}
        <ChartCard title="Total profit by staking policy">
          <div className="h-80"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" angle={-15} /><YAxis /><Tooltip /><Bar dataKey="totalProfit" fill={PALETTE[1]} /></BarChart>
          </ResponsiveContainer></div>
        </ChartCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {header}
      <EmptyState message="Select a behaviour experiment to view its outputs." />
    </div>
  );
}
