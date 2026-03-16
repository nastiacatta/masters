import { Link } from 'react-router-dom';
import { SEM } from '@/lib/tokens';
import MathBlock from '@/components/dashboard/MathBlock';

function ClaimCard({
  number,
  title,
  body,
  link,
  color,
}: {
  number: number;
  title: string;
  body: string;
  link: string;
  color: string;
}) {
  return (
    <Link
      to={link}
      className="group block rounded-2xl border-2 p-6 transition-all hover:shadow-lg"
      style={{ borderColor: color + '40', background: color + '08' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: color + '20', color }}
        >
          {number}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{body}</p>
          <span className="inline-block mt-3 text-xs font-medium transition-colors" style={{ color }}>
            Explore evidence →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
        Adaptive Skill and Stake in Forecast Markets
      </h1>
      <p className="text-lg text-slate-500 mt-4 max-w-2xl leading-relaxed">
        A wagering mechanism where submitted stake does not count equally.
        It is filtered through online skill learned from past forecast performance.
      </p>

      <div className="mt-6 flex items-center gap-3 flex-wrap">
        <MathBlock
          inline
          latex="m_{i,t} = b_{i,t}\bigl(\lambda + (1-\lambda)\,\sigma_{i,t}\bigr)"
        />
        <span className="text-xs text-slate-400">effective wager = deposit × skill gate</span>
      </div>

      <div className="mt-10 grid gap-4">
        <ClaimCard
          number={1}
          title="The mechanism is coherent"
          body="Deposits, effective wagers, aggregation, refunds, and payouts are jointly defined and satisfy the core accounting checks: budget balance, cashflow identity, bounded profit, and correct exclusion of absent agents."
          link="/mechanism"
          color={SEM.wager.main}
        />
        <ClaimCard
          number={2}
          title="Online skill weighting changes influence allocation"
          body="Skill weighting reduces the damage from noisy stake and improves over stake-only weighting, but equal weighting remains a strong benchmark. The skill layer helps most clearly by attenuating noisy deposits, not by uniformly beating all baselines."
          link="/results"
          color={SEM.skill.main}
        />
      </div>

      <div className="mt-10 rounded-xl bg-slate-50 border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Where to start</h3>
        <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <Link to="/mechanism" className="rounded-lg bg-white border border-slate-200 px-3 py-2.5 hover:border-slate-300 transition-colors">
            <span className="font-semibold text-slate-800">Mechanism</span>
            <p className="mt-1 leading-relaxed">See how one round works — inputs, wager, aggregate, settlement.</p>
          </Link>
          <Link to="/results" className="rounded-lg bg-white border border-slate-200 px-3 py-2.5 hover:border-slate-300 transition-colors">
            <span className="font-semibold text-slate-800">Results</span>
            <p className="mt-1 leading-relaxed">Compare forecast quality across weighting rules and deposit policies.</p>
          </Link>
          <Link to="/robustness" className="rounded-lg bg-white border border-slate-200 px-3 py-2.5 hover:border-slate-300 transition-colors">
            <span className="font-semibold text-slate-800">Robustness</span>
            <p className="mt-1 leading-relaxed">Intermittency, sybil attacks, parameter sensitivity, calibration.</p>
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}
