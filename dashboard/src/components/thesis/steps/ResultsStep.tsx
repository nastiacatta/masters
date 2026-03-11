import type { WalkthroughRoundResult } from '@/lib/types';
import { fmtNum, agentDisplayName } from '@/lib/formatters';

interface ResultsStepProps {
  result: WalkthroughRoundResult | null;
}

export default function ResultsStep({ result }: ResultsStepProps) {
  return (
    <div className="space-y-4">
      {!result && (
        <p className="text-sm text-slate-500">
          Select an experiment and round to see outputs for round <em>t</em>.
        </p>
      )}
      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {result.aggregateForecast != null && (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Aggregate forecast r̂</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.aggregateForecast, 4)}</p>
              </div>
            )}
            {result.realisedOutcome != null && (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Realised outcome y</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.realisedOutcome, 4)}</p>
              </div>
            )}
            {result.score != null && (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Score / loss</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.score, 4)}</p>
              </div>
            )}
            {result.nEff != null && (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">N_eff</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.nEff, 2)}</p>
              </div>
            )}
            {result.gini != null && (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Gini</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.gini, 3)}</p>
              </div>
            )}
          </div>
          {result.payoffs && Object.keys(result.payoffs).length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Payoffs π_i</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(result.payoffs).map(([agent, val]) => (
                  <span key={agent}>{agentDisplayName(agent)}: {fmtNum(val, 2)}</span>
                ))}
              </div>
            </div>
          )}
          {result.wealthChanges && Object.keys(result.wealthChanges).length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Wealth changes</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(result.wealthChanges).map(([agent, val]) => (
                  <span key={agent}>{agentDisplayName(agent)}: {fmtNum(val, 2)}</span>
                ))}
              </div>
            </div>
          )}
          {result.skillWeightChanges && Object.keys(result.skillWeightChanges).length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Skill weight changes (σ for t+1)</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(result.skillWeightChanges).map(([agent, val]) => (
                  <span key={agent}>{agentDisplayName(agent)}: {fmtNum(val, 3)}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
