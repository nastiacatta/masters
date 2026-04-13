import SlideWrapper from './SlideWrapper';

/* ── Data ───────────────────────────────────────────────────── */

const FAMILIES = [
  { name: 'Participation', icon: '🎯', desc: 'When and whether agents submit forecasts', color: 'bg-sky-100 text-sky-700' },
  { name: 'Information', icon: '🧠', desc: 'How agents form beliefs — signal quality, bias, calibration', color: 'bg-blue-100 text-blue-700' },
  { name: 'Reporting', icon: '📝', desc: 'What agents report — truthful belief or distorted', color: 'bg-violet-100 text-violet-700' },
  { name: 'Staking', icon: '💰', desc: 'How much agents wager — bankroll management', color: 'bg-teal-100 text-teal-700' },
  { name: 'Objectives', icon: '🎯', desc: 'What agents optimise — expected value, utility, reputation', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Identity', icon: '👤', desc: 'Whether agents split into multiple accounts', color: 'bg-amber-100 text-amber-700' },
  { name: 'Learning', icon: '📈', desc: 'How agents adapt strategy over time', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Adversarial', icon: '⚔️', desc: 'Attacks optimised against the mechanism rules', color: 'bg-red-100 text-red-700' },
  { name: 'Operational', icon: '⚙️', desc: 'Real-world frictions — latency, errors, automation', color: 'bg-slate-100 text-slate-700' },
];

interface ThreatPreset {
  label: string;
  delta: string;
}

interface ThreatTier {
  tier: string;
  emoji: string;
  rule: string;
  border: string;
  bg: string;
  text: string;
  presets: ThreatPreset[];
}

const THREAT_TIERS: ThreatTier[] = [
  {
    tier: 'CRITICAL', emoji: '🔴', rule: 'Δ > 10%',
    border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-700',
    presets: [
      { label: 'Bursty', delta: '+934%' },
      { label: 'Rep. gamer', delta: '+28%' },
      { label: 'Sandbagger', delta: '+22%' },
      { label: 'Noisy reporter', delta: '+18%' },
      { label: 'Bias', delta: '+17%' },
      { label: 'Kelly sizing', delta: '+14%' },
      { label: 'Miscalibrated', delta: '+13%' },
      { label: 'Sybil', delta: '+10%' },
    ],
  },
  {
    tier: 'MODERATE', emoji: '🟠', rule: '2–10%',
    border: 'border-l-orange-400', bg: 'bg-orange-50', text: 'text-orange-700',
    presets: [
      { label: 'Collusion', delta: '+8%' },
      { label: 'Arbitrageur', delta: '+5%' },
    ],
  },
  {
    tier: 'MILD', emoji: '🟡', rule: '0.5–2%',
    border: 'border-l-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700',
    presets: [
      { label: 'Rep. reset', delta: '+1.3%' },
      { label: 'Risk-averse', delta: '+1.3%' },
      { label: 'Manipulator', delta: '+1.1%' },
    ],
  },
  {
    tier: 'NEGLIGIBLE', emoji: '⚪', rule: '|Δ| ≤ 0.5%',
    border: 'border-l-slate-300', bg: 'bg-slate-50', text: 'text-slate-600',
    presets: [
      { label: 'Budget', delta: '+0.5%' },
      { label: 'Evader', delta: '+0.3%' },
      { label: 'Baseline', delta: '0%' },
    ],
  },
  {
    tier: 'BENEFICIAL', emoji: '🟢', rule: 'Δ < −0.5%',
    border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700',
    presets: [
      { label: 'House-money', delta: '−1.1%' },
      { label: 'Latency exploit', delta: '−2.9%' },
    ],
  },
];

const INSIGHTS = [
  {
    title: 'Participation dominates accuracy',
    detail: 'Bursty at 54% participation degrades CRPS by 934%. Missing agents = missing information.',
    verdict: 'bad' as const,
  },
  {
    title: 'Quantile distortions are the real threat',
    detail: 'Reporting attacks (+28%, +22%, +18%, +17%) are far more damaging than point-forecast manipulation (+1.1%).',
    verdict: 'bad' as const,
  },
  {
    title: 'Point-forecast attacks are contained',
    detail: 'The skill gate downweights manipulators within ~7 rounds. EWMA half-life ≈ 4.6 rounds.',
    verdict: 'good' as const,
  },
  {
    title: 'Multi-agent coordination amplifies',
    detail: 'Sybil +10%, Collusion +8%. Coordinated behaviour exceeds what the skill gate absorbs alone.',
    verdict: 'neutral' as const,
  },
  {
    title: 'Staking strategy has mixed effects',
    detail: 'Kelly +14% (hurts), House-money −1.1% (helps), Budget +0.5% (negligible).',
    verdict: 'neutral' as const,
  },
  {
    title: 'Latency exploitation is beneficial',
    detail: 'Partial outcome info (−2.9%) actually improves the aggregate for everyone.',
    verdict: 'good' as const,
  },
];

const VERDICT_STYLES = {
  good: { border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  neutral: { border: 'border-l-amber-400', bg: 'bg-amber-50', text: 'text-amber-600' },
  bad: { border: 'border-l-red-400', bg: 'bg-red-50', text: 'text-red-600' },
};

/* ── Slide 1: Architecture & Taxonomy ───────────────────────── */

export function BehaviourArchitectureSlide() {
  return (
    <SlideWrapper>
      <div className="-mx-10 -mt-10 mb-6 h-1.5 rounded-t-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500" />

      <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700">
        Behaviour Analysis
      </span>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        Two-Block Architecture
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-2xl">
        The mechanism is split into two independent blocks. Block A (the core) is a pure state machine
        that sees only observable actions — never motives. Block B (agent behaviour) produces those
        actions from hidden attributes. This separation lets us test any behaviour without touching
        the settlement logic.
      </p>

      {/* Architecture diagram */}
      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        {/* Block B */}
        <div className="flex-1 rounded-xl border-2 border-violet-300 bg-violet-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-200 text-xs font-bold text-violet-800">B</span>
            <span className="text-sm font-semibold text-violet-800">Agent Policies</span>
          </div>
          <p className="text-xs text-violet-600 leading-relaxed">
            Each agent is a policy π that maps hidden attributes (skill, risk aversion, bias, budget)
            and platform state to an action per round.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['skill', 'CRRA γ', 'bias', 'budget', 'identity'].map(attr => (
              <span key={attr} className="rounded-full bg-violet-200 px-2 py-0.5 text-[10px] font-medium text-violet-700">{attr}</span>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <div className="text-[10px] font-medium text-slate-500">Behaviour Contract</div>
          <div className="flex items-center gap-1">
            <span className="text-xs">→</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono">(participate, report, deposit)</span>
            <span className="text-xs">→</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs">←</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono">(wealth, σ, r̂, round)</span>
            <span className="text-xs">←</span>
          </div>
          <div className="text-[10px] font-medium text-slate-500">Platform State</div>
        </div>

        {/* Block A */}
        <div className="flex-1 rounded-xl border-2 border-teal-300 bg-teal-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-200 text-xs font-bold text-teal-800">A</span>
            <span className="text-sm font-semibold text-teal-800">Core Mechanism</span>
          </div>
          <p className="text-xs text-teal-600 leading-relaxed">
            Deterministic state machine: scoring rule → aggregation → settlement → skill update.
            Consumes only observable actions.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['CRPS scoring', 'weighted agg.', 'EWMA σ', 'settlement'].map(step => (
              <span key={step} className="rounded-full bg-teal-200 px-2 py-0.5 text-[10px] font-medium text-teal-700">{step}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 9 Families grid */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">9 Behaviour Families (46 items)</h3>
        <div className="grid grid-cols-3 gap-2">
          {FAMILIES.map(f => (
            <div key={f.name} className={`rounded-lg ${f.color} px-3 py-2`}>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{f.icon}</span>
                <span className="text-xs font-semibold">{f.name}</span>
              </div>
              <p className="text-[10px] mt-0.5 opacity-80">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideWrapper>
  );
}

/* ── Slide 2: Experiment Setup ──────────────────────────────── */

export function BehaviourExperimentSlide() {
  return (
    <SlideWrapper>
      <div className="-mx-10 -mt-10 mb-6 h-1.5 rounded-t-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500" />

      <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700">
        Behaviour Analysis
      </span>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        Experiment Design
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-2xl">
        We test 18 behaviour presets against a truthful baseline using paired comparison:
        same seed, same DGP, only the behaviour changes. This isolates the causal effect
        of each strategic behaviour on mechanism performance.
      </p>

      {/* Setup parameters */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Rounds', value: '300', sub: 'per simulation' },
          { label: 'Agents', value: '6', sub: 'per run' },
          { label: 'Seed', value: '42', sub: 'deterministic' },
          { label: 'Presets', value: '18', sub: 'vs baseline' },
        ].map(m => (
          <div key={m.label} className="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
            <p className="text-xs font-medium text-slate-500">{m.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{m.value}</p>
            <p className="text-[10px] text-slate-400">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Key metrics explained */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Metrics tracked per simulation</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              metric: 'CRPS (Continuous Ranked Probability Score)',
              desc: 'Measures forecast error — lower is better. The primary accuracy metric. Δ CRPS vs baseline quantifies how much each behaviour degrades (or improves) the aggregate.',
              icon: '📊',
            },
            {
              metric: 'N_eff (Effective number of signals)',
              desc: 'How many independent forecasters effectively contribute. Computed as 1/HHI of weights. Drops when one agent dominates or agents are correlated.',
              icon: '👥',
            },
            {
              metric: 'Gini coefficient',
              desc: 'Wealth concentration across agents. 0 = perfectly equal, 1 = one agent has everything. Tracks whether the mechanism creates unfair wealth concentration.',
              icon: '⚖️',
            },
            {
              metric: 'σ (Skill estimate via EWMA)',
              desc: 'Online skill estimate updated each round: L_t = (1−ρ)L_{t-1} + ρ·ℓ_t. The skill gate g(σ) = λ + (1−λ)σ^η modulates each agent\'s effective wager.',
              icon: '🎯',
            },
          ].map(m => (
            <div key={m.metric} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-1">
                <span>{m.icon}</span>
                <span className="text-xs font-semibold text-slate-800">{m.metric}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How comparison works */}
      <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-xs font-semibold text-indigo-800 mb-1">Paired comparison method</p>
        <p className="text-[11px] text-indigo-600 leading-relaxed">
          Each preset is run with the exact same random seed and data-generating process as the baseline.
          The only variable that changes is the agent behaviour. This means Δ CRPS directly measures
          the causal impact of that behaviour on aggregate forecast quality.
        </p>
      </div>
    </SlideWrapper>
  );
}

/* ── Slide 3: Threat Classification ─────────────────────────── */

export function BehaviourThreatSlide() {
  return (
    <SlideWrapper>
      <div className="-mx-10 -mt-10 mb-6 h-1.5 rounded-t-2xl bg-gradient-to-r from-red-500 to-orange-500" />

      <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700">
        Behaviour Analysis
      </span>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        Threat Classification
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-2xl">
        All 18 behaviour presets ranked by their impact on aggregate forecast error (Δ CRPS vs truthful baseline).
        300 rounds, 6 agents, seed 42.
      </p>

      <div className="mt-5 space-y-2.5">
        {THREAT_TIERS.map(tier => (
          <div key={tier.tier} className={`rounded-xl border border-slate-200 border-l-4 ${tier.border} ${tier.bg} p-3.5`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">{tier.emoji}</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${tier.text}`}>{tier.tier}</span>
              <span className="text-[10px] text-slate-400 ml-1">({tier.rule})</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {tier.presets.map(p => (
                <div key={p.label} className="flex items-baseline gap-1.5 text-xs">
                  <span className={`font-semibold ${tier.text}`}>{p.label}</span>
                  <span className="font-mono font-semibold text-slate-600">{p.delta}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}

/* ── Slide 4: Key Insights ──────────────────────────────────── */

export function BehaviourInsightsSlide() {
  return (
    <SlideWrapper gradient="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <div className="-mx-10 -mt-10 mb-6 h-1.5 rounded-t-2xl bg-gradient-to-r from-violet-400 to-fuchsia-400" />

      <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/70">
        Behaviour Analysis
      </span>
      <h2 className="mt-2 text-2xl font-bold text-white">
        Structural Insights
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400 max-w-2xl">
        Six key findings from testing 18 strategic behaviours against the Skill × Stake mechanism.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {INSIGHTS.map((ins, i) => {
          const s = VERDICT_STYLES[ins.verdict];
          return (
            <div key={i} className={`rounded-xl border-l-4 ${s.border} ${s.bg} p-4 ring-1 ring-slate-200/50`}>
              <div className={`text-xs font-bold ${s.text} mb-1`}>{ins.title}</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{ins.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Thesis verdict */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Thesis Verdict</p>
        <p className="text-sm text-white/90 leading-relaxed">
          The mechanism is <span className="font-semibold text-emerald-400">partially robust</span> to
          strategic behaviour. Point-forecast attacks are well-contained by the skill gate (~7-round detection).
          However, <span className="font-semibold text-red-400">quantile-level distortions propagate</span> to
          aggregate CRPS because the skill layer downweights slowly when distortion affects all quantile levels
          simultaneously. The <span className="font-semibold text-amber-400">dominant vulnerability is participation</span>:
          missing agents directly reduce aggregate quality and cannot be compensated.
        </p>
      </div>
    </SlideWrapper>
  );
}
