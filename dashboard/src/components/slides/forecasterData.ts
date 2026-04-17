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
