# Theoretical References & Sources

## Forecast Evaluation Methodology

### Prequential (Predictive Sequential) Evaluation

- **Dawid, A.P. (1984).** "Present position and potential developments: Some personal views — statistical theory — the prequential approach." *Journal of the Royal Statistical Society: Series A (General)*, 147(2), 278–290.
  - Introduced the prequential framework: each observation is first used for testing, then for training. Theoretically correct for evaluating any sequential/online learner because every prediction is genuinely out-of-sample.

- **Gama, J., Sebastião, R., & Rodrigues, P.P. (2013).** "On evaluating stream learning algorithms." *Machine Learning*, 90(3), 317–346. https://doi.org/10.1007/s10994-012-5320-9
  - Proved that for stationary data and consistent learners, the prequential error converges to the Bayes error. Recommended prequential evaluation with forgetting mechanisms (fading factor or sliding window) for non-stationary data streams.

### Rolling Origin & Out-of-Sample Testing

- **Tashman, L.J. (2000).** "Out-of-sample tests of forecasting accuracy: An analysis and review." *International Journal of Forecasting*, 16(4), 437–450. https://doi.org/10.1016/S0169-2070(00)00065-0
  - Foundational reference recommending rolling-origin evaluations with multiple test periods over single fixed-origin holdout. Showed that single-split holdout is unreliable and that multiple test periods produce more robust estimates.

### Empirical Comparison of Evaluation Methods

- **Cerqueira, V., Torgo, L., & Soares, C. (2020).** "Evaluating time series forecasting models: an empirical study on performance estimation methods." *Machine Learning*, 109, 1997–2028. https://doi.org/10.1007/s10994-020-05910-7
  - Most comprehensive empirical comparison: 11 evaluation methods across 174 real-world time series. Key findings:
    - **Stationary series** → Blocked cross-validation (CV-Bl) is best.
    - **Non-stationary series** → Repeated Holdout (Rep-Holdout) is significantly better than all alternatives.
    - Single fixed-origin holdout was consistently among the worst estimators.
    - Sample size does not significantly affect which method is best.

### Time Series Cross-Validation (Textbook Reference)

- **Hyndman, R.J. & Athanasopoulos, G. (2021).** *Forecasting: Principles and Practice*, 3rd edition. OTexts. https://otexts.com/fpp3/tscv.html
  - Standard forecasting textbook. Recommends time series cross-validation via rolling forecasting origin. States: "A good way to choose the best forecasting model is to find the model with the smallest RMSE computed using time series cross-validation."

## Scoring Rules

- **Gneiting, T. & Raftery, A.E. (2007).** "Strictly proper scoring rules, prediction, and estimation." *Journal of the American Statistical Association*, 102(477), 359–378. https://doi.org/10.1198/016214506000001437
  - Established that CRPS (Continuous Ranked Probability Score) is a strictly proper scoring rule — the forecaster maximizes expected score only by reporting their true belief. This guarantees the evaluation metric incentivizes honest probabilistic forecasting.

## Statistical Testing

- **Diebold, F.X. & Mariano, R.S. (1995).** "Comparing predictive accuracy." *Journal of Business & Economic Statistics*, 13(3), 253–263. https://doi.org/10.1198/073500102753410444
  - Standard test for whether two forecast methods differ significantly in predictive accuracy. Works with any loss function (not just MSE), handles serially correlated and non-Gaussian forecast errors.

## Online Learning & Prediction with Expert Advice

- **Cesa-Bianchi, N. & Lugosi, G. (2006).** *Prediction, Learning, and Games.* Cambridge University Press. http://cesa-bianchi.di.unimi.it/predbook/
  - Foundational textbook on online learning and prediction with expert advice. Provides the theoretical framework for evaluating sequential aggregation mechanisms via cumulative regret — the difference between the learner's cumulative loss and the best expert's cumulative loss in hindsight.

## Forecast Combination

- **Bates, J.M. & Granger, C.W.J. (1969).** "The combination of forecasts." *Journal of the Operational Research Society*, 20(4), 451–468.
  - Seminal paper establishing that combining forecasts from multiple models typically outperforms individual models. Introduced inverse-variance weighting (weights proportional to 1/variance of past errors).

- **Timmermann, A. (2006).** "Forecast combinations." In *Handbook of Economic Forecasting*, Vol. 1, 135–196. Elsevier.
  - Comprehensive survey of forecast combination methods. Documents the "forecast combination puzzle" — simple equal weighting often outperforms theoretically optimal combination schemes in practice, likely due to estimation error in weights.

## Cross-Validation for Time Series

- **Bergmeir, C., Hyndman, R.J., & Koo, B. (2018).** "A note on the validity of cross-validation for evaluating autoregressive time series prediction." *Computational Statistics & Data Analysis*, 120, 70–83.
  - Showed that standard cross-validation can be valid for stationary time series when the model is correctly specified. However, for non-stationary series, out-of-sample methods remain preferred.

- **Bergmeir, C. & Benítez, J.M. (2012).** "On the use of cross-validation for time series predictor evaluation." *Information Sciences*, 191, 192–213.
  - Demonstrated that blocked cross-validation yields more accurate estimates than simple holdout for stationary time series forecasting tasks.


## XGBoost / Gradient Boosted Trees for Energy Forecasting

- **Hybrid Renewable Energy Forecasting and Trading Competition (2024).** "The forecasting track reaffirms the competitiveness of popular gradient boosted tree algorithms for day-ahead wind and solar power forecasting, though other methods also yielded strong results, with performance in all cases highly dependent on implementation." https://arxiv.org/html/2507.01579v1
  - Key finding: GBT models are competitive for day-ahead horizons but implementation details (feature engineering, training window, retraining frequency) matter more than model choice.

- **Cerqueira, V., Torgo, L., & Soares, C. (2019).** "Machine learning vs statistical methods for time series forecasting: Size matters." *arXiv:1909.13316*.
  - Found that ML methods (including XGBoost) tend to outperform statistical methods on larger datasets, but the advantage diminishes on small samples. For short-horizon forecasting on highly autocorrelated series, simple methods remain competitive.

- **Mashlakov, A. et al. (2021).** "Assessing the performance of deep learning models for multivariate probabilistic energy forecasting." *Applied Energy*, 285, 116405.
  - Demonstrated that for probabilistic energy forecasting (quantile/CRPS evaluation), model architecture matters less than proper uncertainty quantification. Native quantile regression outperforms residual bootstrap approaches.

## Persistence Baseline Strength

- **Makridakis, S., Spiliotis, E., & Assimakopoulos, V. (2018).** "The M4 Competition: Results, findings, conclusion and way forward." *International Journal of Forecasting*, 34(4), 802–808.
  - The M4 competition showed that simple methods (including Naive/persistence) remain extremely competitive at short horizons. ML methods only consistently outperform at longer horizons or with sufficient training data.

- **Hyndman, R.J. & Koehler, A.B. (2006).** "Another look at measures of forecast accuracy." *International Journal of Forecasting*, 22(4), 679–688.
  - Introduced MASE (Mean Absolute Scaled Error) which scales errors relative to the naive forecast, acknowledging that persistence is the natural benchmark for time series forecasting.
