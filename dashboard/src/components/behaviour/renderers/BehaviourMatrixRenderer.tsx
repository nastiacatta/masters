import ChartCard from '@/components/dashboard/ChartCard';
import MetricCard from '@/components/dashboard/MetricCard';
import { fmtNum, scenarioLabel } from '@/lib/formatters';
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from 'recharts';
import type { RendererProps } from './types';

const PALETTE = ['#2563eb', '#7c3aed', '#0d9488'];

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

export default function BehaviourMatrixRenderer({ data, header }: RendererProps) {
  const rows = data.behaviourScenarios.map((row) => ({
    ...row,
    label: scenarioLabel(row.scenario),
  }));

  if (rows.length === 0) {
    return (
      <div className="space-y-6 p-6">
        {header}
        <EmptyState message="No behaviour matrix data found." />
      </div>
    );
  }

  const bestProfit = Math.max(...rows.map((d) => d.totalProfit));
  const worstGini = Math.max(...rows.map((d) => d.finalGini));
  const bestNeff = Math.max(...rows.map((d) => d.finalNEff));

  return (
    <div className="space-y-6 p-6">
      {header}

      <CardGrid>
        <MetricCard label="Scenarios" value={String(rows.length)} subtitle="Behaviour families tested" />
        <MetricCard label="Best total profit" value={fmtNum(bestProfit, 2)} subtitle="Across scenarios" accent />
        <MetricCard label="Worst final Gini" value={fmtNum(worstGini, 3)} subtitle="Wealth concentration ceiling" />
        <MetricCard label="Best final N_eff" value={fmtNum(bestNeff, 1)} subtitle="Effective participation" />
      </CardGrid>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Total profit by scenario" subtitle="Skill × stake fixed, behaviour varied">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
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
                <Scatter data={rows} fill={PALETTE[1]} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Mean round profit" subtitle="Per-scenario average">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
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
