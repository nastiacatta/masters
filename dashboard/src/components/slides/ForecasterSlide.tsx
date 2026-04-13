import SlideWrapper from './SlideWrapper';

export interface ForecasterData {
  name: string;
  type: string;
  description: string;
  strengths: string;
  weaknesses: string;
}

export const FORECASTERS: ForecasterData[] = [
  {
    name: 'Naive (last value)',
    type: 'Baseline',
    description:
      'Uses the most recent observed value as the forecast. Zero computational cost.',
    strengths: 'Performs well when the series is a random walk.',
    weaknesses: 'Cannot capture trends, seasonality, or any temporal structure.',
  },
  {
    name: 'Moving Average (20)',
    type: 'Statistical',
    description:
      'Averages the last 20 observations. Smooths short-term noise.',
    strengths: 'Window size of 20 balances responsiveness with stability.',
    weaknesses: 'Lags behind sudden level shifts and ignores trend.',
  },
  {
    name: 'ARIMA(2,1,1)',
    type: 'Statistical',
    description:
      'Autoregressive integrated moving average with parameters p=2, d=1, q=1. Captures linear temporal dependencies after differencing.',
    strengths: 'Classical statistical time-series model with well-understood theory.',
    weaknesses: 'Assumes linearity; cannot model complex non-linear dynamics.',
  },
  {
    name: 'XGBoost',
    type: 'Machine Learning',
    description:
      'Gradient-boosted decision tree ensemble. Captures non-linear patterns and feature interactions.',
    strengths: 'Trained on lagged features of the target series.',
    weaknesses: 'Requires careful feature engineering; prone to overfitting on small datasets.',
  },
  {
    name: 'Neural Net (MLP)',
    type: 'Machine Learning',
    description:
      'Multi-layer perceptron with one or more hidden layers. Learns non-linear mappings from lagged inputs to forecasts.',
    strengths: 'Most flexible model in the panel.',
    weaknesses: 'Data-hungry; requires more training data to generalise well.',
  },
];

const typeConfig: Record<string, { badge: string; border: string }> = {
  Baseline: {
    badge: 'bg-slate-100 text-slate-700',
    border: 'border-l-slate-400',
  },
  Statistical: {
    badge: 'bg-indigo-100 text-indigo-700',
    border: 'border-l-indigo-500',
  },
  'Machine Learning': {
    badge: 'bg-violet-100 text-violet-700',
    border: 'border-l-violet-500',
  },
};

export default function ForecasterSlide({
  name,
  type,
  description,
  strengths,
  weaknesses,
}: ForecasterData) {
  const cfg = typeConfig[type] ?? {
    badge: 'bg-slate-100 text-slate-700',
    border: 'border-l-slate-400',
  };

  return (
    <SlideWrapper className={`border-l-4 ${cfg.border}`}>
      <div className="flex items-center gap-3">
        <h2 className="text-[15px] font-semibold text-slate-800 flex-1">{name}</h2>
        <span className={`rounded-full px-3 py-0.5 text-[11px] font-semibold ${cfg.badge}`}>
          {type}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-500 leading-relaxed">{description}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Strengths</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{strengths}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-white text-[10px] font-bold">✗</div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Weaknesses</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{weaknesses}</p>
        </div>
      </div>
    </SlideWrapper>
  );
}
