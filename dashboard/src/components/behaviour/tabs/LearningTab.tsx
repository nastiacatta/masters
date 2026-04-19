import MathBlock from '@/components/dashboard/MathBlock';

export default function LearningTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-indigo-900">Why learning is treated separately</h3>
        <p className="text-sm text-indigo-800 leading-relaxed">
          Learning creates a unique challenge because <em>both</em> the mechanism and the agents can adapt over time.
          This tab distinguishes two fundamentally different types of learning in the system.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <h4 className="text-sm font-semibold text-slate-800">Mechanism-side learning</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The EWMA skill update <em>is</em> the mechanism&apos;s learning rule. Each round, it observes forecast
            quality via CRPS scoring and updates the loss estimate L<sub>i,t</sub>, which maps to a skill weight
            σ<sub>i</sub>. This is fully specified and requires no agent cooperation. The learning rate ρ controls
            how quickly the mechanism adapts: higher ρ means faster response to recent performance but more noise.
          </p>
          <MathBlock accent label="Mechanism learning" latex="L_{i,t} = (1-\\rho)L_{i,t-1} + \\rho\\,\\ell_{i,t}" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <h4 className="text-sm font-semibold text-slate-800">Agent-side learning</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Agents who adjust their strategy based on past profits create a feedback loop: the mechanism
            updates σ based on agent behaviour, and agents update behaviour based on σ and payoffs. This
            is structurally different from other behaviour families because it requires modelling the
            agent&apos;s internal optimisation process, not just their observable actions.
          </p>
          <div className="rounded-lg bg-violet-50 border border-violet-100 p-3 text-xs text-violet-700">
            Examples: reinforcement learning (adjust reports based on reward signal), rule learning
            (discover the scoring rule and optimise against it), exploration vs exploitation (balance
            trying new strategies vs exploiting known ones).
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
        <h4 className="text-sm font-semibold text-slate-800">The key question</h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Does the mechanism remain robust when agents learn to game it? If an agent discovers that
          hedging toward 0.5 reduces variance, the EWMA detects the resulting accuracy drop and
          lowers σ. But if an agent learns to <em>improve</em> their forecasts (genuine learning),
          the mechanism rewards this with higher σ. The design is incentive-compatible with genuine
          improvement but penalises strategic manipulation, the same property that makes it robust
          to the adversarial attacks tested in other tabs.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed mt-1">
          Full agent-side learning simulations (RL agents, bandit algorithms, gradient-based adaptation)
          are a separate research direction and not included in the current behaviour comparison table.
        </p>
      </div>

      {/* taxonomy notes for the 3 items */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-700">Taxonomy items in this family</div>
        <p>• <strong>Reinforcement from profits</strong> - Agents adjust strategy based on payoff history. The mechanism&apos;s EWMA already performs this function on the mechanism side.</p>
        <p>• <strong>Rule learning</strong> - Agents discover the scoring rule structure and optimise against it. Proper scoring rules are designed to make truthful reporting optimal even when the rule is known.</p>
        <p>• <strong>Exploration vs exploitation</strong> - Agents balance trying new strategies vs exploiting known ones. This creates non-stationary behaviour that the EWMA must track.</p>
      </div>
    </div>
  );
}
