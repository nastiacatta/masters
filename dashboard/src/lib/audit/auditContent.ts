/**
 * Static content for the Model Performance Audit feature.
 *
 * All thesis-specific textual content — literature references, model
 * annotations, theory-vs-practice comparisons, and improvement
 * recommendations — lives here as structured TypeScript constants.
 */

import type { LiteratureRef, TheoryVsPracticeRow, Recommendation } from './auditTypes';

// ── Literature References ──────────────────────────────────────────────────

export const LITERATURE_REFS: LiteratureRef[] = [
  {
    id: 'lambert-2008',
    category: 'mechanism_design',
    authors: 'Lambert (2008)',
    title: 'Self-financed wagering mechanisms for probabilistic forecasting',
    keyFinding:
      'Agents wager on their own forecasts; the mechanism is self-financed and incentive-compatible under a proper scoring rule, rewarding calibrated probabilistic reports.',
    empiricalConnection:
      'The dashboard mechanism implements Lambert\'s wagering framework with CRPS-based settlement. Empirical results confirm self-financing: total payouts equal total deposits each round.',
  },
  {
    id: 'raja-pinson-2022',
    category: 'mechanism_design',
    authors: 'Raja & Pinson (2022)',
    title: 'Energy forecasting extension of wagering mechanisms',
    keyFinding:
      'Extends Lambert\'s framework to energy forecasting with quantile-based settlement, showing that wagering mechanisms can aggregate wind power forecasts while maintaining incentive compatibility.',
    empiricalConnection:
      'The Elia wind dataset evaluation directly follows Raja & Pinson\'s energy forecasting setting. Under strictly-causal normalisation (May 2026 audit), the mechanism achieves −7.0% CRPS vs uniform on this dataset; Raja\'s history-free variant is −1.5%.',
  },
  {
    id: 'ranjan-gneiting-2010',
    category: 'linear_pool',
    authors: 'Ranjan & Gneiting (2010)',
    title: 'Combining probability forecasts',
    keyFinding:
      'Any nontrivial weighted average (linear pool) of individually calibrated probabilistic forecasts is necessarily uncalibrated. The combined forecast is overdispersed in the centre and underdispersed in the tails.',
    empiricalConnection:
      'The calibration reliability diagram shows exactly this pattern: central quantiles (0.25–0.75) are well-calibrated but tail quantiles (0.1, 0.9) show systematic miscalibration, confirming Ranjan & Gneiting\'s theoretical prediction.',
  },
  {
    id: 'cesa-bianchi-lugosi-2006',
    category: 'online_learning',
    authors: 'Cesa-Bianchi & Lugosi (2006)',
    title: 'Prediction, Learning, and Games',
    keyFinding:
      'The Multiplicative Weights Update (MWU) framework achieves O(√(T log N)) regret against the best expert in hindsight, providing a theoretical upper bound on cumulative loss relative to the oracle.',
    empiricalConnection:
      'The EWMA skill layer uses a fixed learning rate (ρ=0.5) rather than the decreasing rate required for optimal regret. The 23% gap between mechanism and oracle CRPS suggests room for improvement via proper MWU implementation.',
  },
  {
    id: 'vitali-ogd',
    category: 'alternative_aggregation',
    authors: 'Vitali et al.',
    title: 'Online gradient descent for quantile forecast aggregation',
    keyFinding:
      'Per-quantile OGD weighting learns separate weight vectors for each quantile level, allowing the aggregation to adapt to forecasters that excel at different parts of the distribution.',
    empiricalConnection:
      'Under strictly-causal normalisation, Vitali OGD achieves −18.0% CRPS improvement vs uniform on Elia wind baselines, compared to the mechanism\'s −7.0%. The ~11-percentage-point gap represents the cost of using a single weight vector across all quantiles.',
  },
  {
    id: 'berrisch-ziel-2024',
    category: 'model_improvement',
    authors: 'Berrisch & Ziel (2024)',
    title: 'NABQR: Neural Adaptive Basis for Quantile Regression',
    keyFinding:
      'NABQR uses neural networks to adaptively learn basis functions for quantile regression, achieving state-of-the-art performance on wind power forecasting benchmarks with better uncertainty quantification than fixed-basis methods.',
    empiricalConnection:
      'XGBoost\'s moderate performance (ranked 4th of 7) suggests that its fixed lag features miss nonlinear quantile structure. NABQR-style adaptive quantile regression could improve XGBoost\'s contribution to the ensemble.',
  },
  {
    id: 'neyman-2024',
    category: 'collusion',
    authors: 'Neyman et al. (2024)',
    title: 'Collusion-proof scoring and prediction market rules',
    keyFinding:
      'Standard proper scoring rules are vulnerable to collusion: agents can coordinate to inflate scores. Collusion-proof rules exist but require modified settlement that penalises correlated reports.',
    empiricalConnection:
      'The robustness experiments show that collusion strategies can extract value from the mechanism. Implementing collusion-proof scoring would close this vulnerability at the cost of slightly reduced individual incentives.',
  },
  {
    id: 'bassetti-2024',
    category: 'alternative_aggregation',
    authors: 'Bassetti et al. (2024)',
    title: 'Kernel-embedded probabilistic forecast pooling',
    keyFinding:
      'Embedding forecasts in a reproducing kernel Hilbert space before pooling preserves calibration properties that the linear pool destroys, offering a theoretically grounded alternative to simple weighted averaging.',
    empiricalConnection:
      'The linear pool\'s tail miscalibration (confirmed by Ranjan & Gneiting) could potentially be addressed by kernel-embedded pooling, which operates in a richer function space than simple linear combination.',
  },
];

// ── Theory vs Practice ─────────────────────────────────────────────────────

export const THEORY_VS_PRACTICE: TheoryVsPracticeRow[] = [
  {
    theoreticalPrediction:
      'Linear pool of calibrated forecasts is necessarily uncalibrated (Ranjan & Gneiting 2010)',
    empiricalObservation:
      'Calibration diagram shows central quantiles (0.25–0.75) well-calibrated but tail quantiles (0.1, 0.9) systematically miscalibrated with coverage gaps of 3–5%',
    source: 'Ranjan & Gneiting (2010)',
    supported: true,
  },
  {
    theoreticalPrediction:
      'MWU achieves O(√(T log N)) regret; fixed learning rate EWMA does not guarantee sublinear regret',
    empiricalObservation:
      'Mechanism CRPS (0.0448) is 23% above oracle (0.0344), and the gap does not close over 17,344 rounds — consistent with linear rather than sublinear regret accumulation',
    source: 'Cesa-Bianchi & Lugosi (2006)',
    supported: true,
  },
  {
    theoreticalPrediction:
      'Per-quantile weighting should outperform single-weight aggregation when forecasters have heterogeneous quantile skill',
    empiricalObservation:
      'On Elia wind (post-audit), Vitali OGD (per-quantile) achieves −18.0% vs uniform while the mechanism (single-weight) achieves −7.0%, an ~11-percentage-point gap confirming the benefit of per-quantile adaptation',
    source: 'Vitali et al.',
    supported: true,
  },
  {
    theoreticalPrediction:
      'Self-financed wagering mechanisms are incentive-compatible: truthful reporting maximises expected payoff',
    empiricalObservation:
      'Robustness experiments confirm that strategic deviations (biased, noisy, manipulative reports) consistently reduce agent payoffs relative to truthful reporting under the CRPS-based settlement',
    source: 'Lambert (2008)',
    supported: true,
  },
  {
    theoreticalPrediction:
      'Aggressive EWMA parameters (high γ, high ρ) differentiate skill faster but may overreact to noise',
    empiricalObservation:
      'Tuned ρ = 0.5 gives an effective averaging window of ~2 rounds, making the induced skill-estimate noise (~0.02) an order of magnitude larger than the true CRPS differences between the top forecasters (~0.002). XGBoost\'s sigma trajectory flips rank with ARIMA and Naive dozens of times over 17,344 rounds, preventing the mechanism from concentrating weight on the best model.',
    source: 'Mechanism design analysis (this thesis)',
    supported: true,
  },
  {
    theoreticalPrediction:
      'The Lambert skill-gate aggregation cannot beat best_single when the best forecaster is only marginally better than the crowded middle pack',
    empiricalObservation:
      'On Elia wind, XGBoost (best) has mean CRPS 0.0304 and ARIMA (2nd) has 0.0346 — only 13% apart. The mechanism weights XGBoost at 16.7% (barely above uniform 14.3%). To reach best_single (0.0308), the mechanism would need to concentrate ~80% of weight on XGBoost, which the skill-gate g(σ)=λ+(1-λ)σ^η cannot do unless σ values diverge by much more than the underlying CRPS permits.',
    source: 'Skill-gate sensitivity analysis',
    supported: true,
  },
];

// ── Model Annotations ──────────────────────────────────────────────────────

export interface ModelAnnotation {
  forecaster: string;
  strengths: string;
  weaknesses: string;
  theoryNote: string;
}

export const MODEL_ANNOTATIONS: ModelAnnotation[] = [
  {
    forecaster: 'Naive',
    strengths:
      'Exploits strong hourly autocorrelation in wind power. Zero-parameter model that is hard to beat at short horizons when the process is persistent.',
    weaknesses:
      'Cannot capture regime transitions, diurnal patterns, or weather-front arrivals. Performance degrades sharply during rapid wind changes.',
    theoryNote:
      'The persistence forecast is the optimal 1-step predictor for a random walk. Wind power at 1-hour resolution has autocorrelation > 0.95, making Naive a strong baseline.',
  },
  {
    forecaster: 'EWMA(5)',
    strengths:
      'Smooths recent observations with exponential decay, adapting faster than Naive to gradual level shifts. Low computational cost.',
    weaknesses:
      'Fixed span (5 hours) is a compromise — too short for stable periods, too long for abrupt changes. No distributional forecast without additional quantile estimation.',
    theoryNote:
      'EWMA is the optimal filter for an IMA(1,1) process. The span parameter controls the bias-variance tradeoff in tracking the local level.',
  },
  {
    forecaster: 'ARIMA(2,1,1)',
    strengths:
      'Captures short-range autocorrelation structure with a parsimonious parametric model. Differencing handles non-stationarity in the level.',
    weaknesses:
      'Linear model cannot capture nonlinear wind dynamics. Fixed order may be misspecified during regime changes. Quantile forecasts assume Gaussian residuals.',
    theoryNote:
      'ARIMA models are optimal for linear Gaussian processes. Wind power is bounded [0,1] and exhibits nonlinear saturation effects that violate the Gaussian assumption.',
  },
  {
    forecaster: 'XGBoost',
    strengths:
      'Captures nonlinear lag dependencies and interaction effects. Can learn regime-dependent patterns from historical features.',
    weaknesses:
      'Rolling window retraining (168 hours) limits the effective training set. Quantile regression via pinball loss can produce crossing quantiles. Moderate rank (4th of 7) suggests features are insufficient.',
    theoryNote:
      'Gradient-boosted trees excel when the feature space contains informative nonlinear interactions. At 1-hour-ahead, autocorrelation dominates and lag features add limited value beyond what Naive captures.',
  },
  {
    forecaster: 'Neural Net',
    strengths:
      'Universal function approximator that can learn complex temporal patterns. Flexible architecture adaptable to different forecast horizons.',
    weaknesses:
      'Requires careful regularisation to avoid overfitting on the rolling window. Training instability can produce inconsistent quantile estimates across retraining cycles.',
    theoryNote:
      'Neural networks have high model capacity but require sufficient data diversity. The 168-hour rolling window provides ~7 days of training data, which may be insufficient for stable learning.',
  },
  {
    forecaster: 'Theta',
    strengths:
      'Decomposes the series into trend and seasonal components. Robust to outliers through its decomposition approach. Computationally efficient.',
    weaknesses:
      'Assumes a specific decomposition structure that may not match wind power dynamics. Limited ability to capture abrupt regime changes.',
    theoryNote:
      'The Theta method won the M3 competition by combining simple exponential smoothing with a linear trend extrapolation. Its success relies on the series having a stable trend-cycle decomposition.',
  },
  {
    forecaster: 'Ensemble',
    strengths:
      'Equal-weight combination of all individual forecasters. Benefits from forecast diversity — errors partially cancel across models with different biases.',
    weaknesses:
      'Equal weighting ignores skill differences. Cannot adapt to regime-dependent forecaster quality. Performance bounded by the average of individual models.',
    theoryNote:
      'The "forecast combination puzzle" (Timmermann 2006) shows that equal-weight ensembles often outperform optimally-weighted combinations due to estimation error in the weights. This ensemble serves as a strong baseline.',
  },
];

// ── XGBoost Improvement Suggestions ────────────────────────────────────────

export interface XGBoostSuggestion {
  id: string;
  title: string;
  description: string;
  reference?: string;
}

export const XGBOOST_SUGGESTIONS: XGBoostSuggestion[] = [
  {
    id: 'xgb-conformal',
    title: 'Conformal prediction wrappers',
    description:
      'Wrap XGBoost point forecasts with conformal prediction intervals to produce distribution-free quantile estimates with finite-sample coverage guarantees. This addresses the crossing-quantile problem inherent in separate pinball loss optimisation.',
    reference: 'Vovk et al. (2005), Romano et al. (2019)',
  },
  {
    id: 'xgb-nabqr',
    title: 'NABQR adaptive quantile regression',
    description:
      'Replace fixed lag features with neural adaptive basis functions (NABQR) that learn the optimal feature representation for each quantile level. This could capture quantile-specific nonlinearities that uniform features miss.',
    reference: 'Berrisch & Ziel (2024)',
  },
  {
    id: 'xgb-window',
    title: 'Longer or expanding training windows',
    description:
      'Increase the rolling window from 168 hours (1 week) to 720 hours (1 month) or use an expanding window with sample weighting. The current window may be too short for XGBoost to learn stable nonlinear patterns.',
  },
  {
    id: 'xgb-features',
    title: 'Calendar and weather features',
    description:
      'Add hour-of-day, day-of-week, and month indicators as categorical features. If NWP (numerical weather prediction) data is available, include wind speed and direction forecasts as exogenous regressors.',
  },
];

// ── Improvement Recommendations ────────────────────────────────────────────

export const RECOMMENDATIONS: Recommendation[] = [
  // ── Model-level (3 items) ──
  {
    id: 'rec-model-conformal',
    category: 'model',
    priority: 'high',
    title: 'Conformal prediction wrappers for XGBoost and Neural Net',
    description:
      'Wrap point-forecast models with conformal prediction to produce distribution-free quantile estimates with finite-sample coverage guarantees. Addresses crossing-quantile issues in separate pinball loss optimisation.',
    evidence: 'XGBoost and Neural Net rank 4th and 5th; their quantile calibration is the weakest among the seven forecasters.',
    crpsEstimate: 'Estimated 5–10% CRPS reduction for wrapped models',
  },
  {
    id: 'rec-model-window',
    category: 'model',
    priority: 'medium',
    title: 'Longer rolling windows or expanding windows for retraining',
    description:
      'Increase the rolling window from 168 hours to 720 hours or use an expanding window with exponential sample weighting. Short windows limit the effective training set for complex models.',
    evidence: 'XGBoost\'s moderate performance suggests insufficient training data for stable nonlinear pattern learning.',
  },
  {
    id: 'rec-model-gbqr',
    category: 'model',
    priority: 'medium',
    title: 'Add gradient-boosted quantile regression as an 8th forecaster',
    description:
      'Train a dedicated quantile regression forest or LightGBM quantile model with richer features (calendar, lagged quantiles, rolling statistics). Increases ensemble diversity.',
    evidence: 'Current forecaster pool lacks a dedicated nonparametric quantile model.',
  },
  // ── Skill estimation (3 items) ──
  {
    id: 'rec-skill-mwu',
    category: 'skill',
    priority: 'high',
    title: 'Replace EWMA with Multiplicative Weights Update (MWU)',
    description:
      'MWU with a decreasing learning rate achieves O(√(T log N)) regret against the best expert. The current fixed-rate EWMA does not guarantee sublinear regret, contributing to the 23% oracle gap.',
    evidence: 'Based on Cesa-Bianchi & Lugosi (2006). The mechanism–oracle gap of 23% does not close over 17,344 rounds.',
    crpsEstimate: 'Theoretical: closes up to 23% of the oracle gap over long horizons',
  },
  {
    id: 'rec-skill-perquantile',
    category: 'skill',
    priority: 'high',
    title: 'Per-quantile skill tracking instead of aggregate CRPS-based skill',
    description:
      'Track separate skill estimates for each quantile level (τ = 0.1, 0.25, 0.5, 0.75, 0.9). Forecasters that excel at tail quantiles can receive higher weight where it matters most.',
    evidence: 'Vitali OGD\'s 21-percentage-point advantage over the mechanism comes entirely from per-quantile adaptation.',
    crpsEstimate: 'Estimated 10–15% additional CRPS improvement based on Vitali OGD gap',
  },
  {
    id: 'rec-skill-adaptive-lr',
    category: 'skill',
    priority: 'low',
    title: 'Adaptive learning rate (decreasing ρ) for convergence guarantees',
    description:
      'Use ρ_t = ρ_0 / √t instead of fixed ρ = 0.5. This ensures the skill estimates converge to the true quality ordering while maintaining responsiveness in early rounds.',
    evidence: 'Fixed ρ causes sigma trajectories to exhibit persistent oscillations rather than converging.',
  },
  // ── Aggregation (3 items) ──
  {
    id: 'rec-agg-vitali',
    category: 'aggregation',
    priority: 'high',
    title: 'Switch to Vitali OGD per-quantile weighting',
    description:
      'Replace the single-weight linear pool with per-quantile OGD that learns separate weight vectors for each τ. This is the single highest-impact change available.',
    evidence: 'Based on baselines.json: Vitali OGD achieves −18.0% vs uniform compared to mechanism\'s −7.0% on Elia wind (post-audit, strictly-causal normalisation).',
    crpsEstimate: '~11 percentage points additional improvement vs uniform on wind',
  },
  {
    id: 'rec-agg-recalibration',
    category: 'aggregation',
    priority: 'medium',
    title: 'Apply empirical recalibration transform to linear pool output',
    description:
      'Post-process the linear pool\'s CDF with a learned recalibration function (e.g., isotonic regression on PIT values) to correct the systematic tail miscalibration predicted by Ranjan & Gneiting.',
    evidence: 'Calibration diagram shows 3–5% coverage gaps at tail quantiles (0.1, 0.9).',
    crpsEstimate: 'Estimated 2–5% CRPS reduction from improved calibration',
  },
  {
    id: 'rec-agg-quasiarith',
    category: 'aggregation',
    priority: 'low',
    title: 'Quasi-arithmetic pooling with proper scoring rule',
    description:
      'Use a generalised mean (e.g., logarithmic or power mean) instead of the arithmetic mean for combining quantile forecasts. Quasi-arithmetic pools can preserve calibration under certain conditions.',
    evidence: 'Theoretical result: quasi-arithmetic pools derived from proper scoring rules have better calibration properties than linear pools.',
  },
  // ── Economic mechanism (2 items) ──
  {
    id: 'rec-econ-perquantile-settlement',
    category: 'economic',
    priority: 'medium',
    title: 'Per-quantile settlement to incentivise calibration at all levels',
    description:
      'Settle wagers separately at each quantile level rather than using aggregate CRPS. This creates direct incentives for forecasters to be well-calibrated at every τ, not just on average.',
    evidence: 'Current CRPS-based settlement averages over quantiles, allowing forecasters to sacrifice tail accuracy for centre accuracy.',
  },
  {
    id: 'rec-econ-collusion-proof',
    category: 'economic',
    priority: 'medium',
    title: 'Collusion-proof scoring rules',
    description:
      'Replace the standard proper scoring rule with a collusion-proof variant that penalises correlated reports. This closes the vulnerability identified in robustness experiments where colluding agents extract value.',
    evidence: 'Neyman et al. (2024) provide constructive collusion-proof rules. Robustness experiments confirm collusion vulnerability.',
  },
];
