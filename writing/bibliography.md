# Bibliography

Single authoritative bibliography for the thesis. BibTeX-ready entries,
ordered by section usage. Superseded `docs/references_sources.md` as the
central list.

Convention for every entry:
- Full citation.
- DOI / arXiv link.
- One-line "used where" note pointing at the writing/ chapter that
  cites it.
- One-line "what we take" note.

---

## A. Self-financed wagering and mechanism design

### Lambert et al. 2008

```bibtex
@inproceedings{lambert2008selffinanced,
  title     = {Self-financed wagering mechanisms for forecasting},
  author    = {Lambert, Nicolas S. and Langford, John and Wortman
               Vaughan, Jennifer and Chen, Yiling and Reeves, Daniel
               and Shoham, Yoav and Pennock, David M.},
  booktitle = {Proceedings of the 9th ACM conference on Electronic
               commerce (EC '08)},
  year      = {2008},
  pages     = {170--179},
  doi       = {10.1145/1386790.1386820}
}
```

- Used in: Chapters 2, 3, 5.1, 6.
- What we take: seven-axiom characterisation, uniqueness of the
  weighted-score mechanism, sybil-proofness for identical reports with
  conserved total wager, the payout formula
  Π_i = m_i(1 + s_i − Σ_j s_j m_j / Σ_j m_j).
- Primary source: `theory/lambert_Selffinanced.md`.

### Lambert, Pennock, Shoham 2008

```bibtex
@inproceedings{lambert2008eliciting,
  title     = {Eliciting Properties of Probability Distributions},
  author    = {Lambert, Nicolas S. and Pennock, David M. and Shoham, Yoav},
  booktitle = {Proceedings of the 9th ACM conference on Electronic
               commerce (EC '08)},
  year      = {2008},
  doi       = {10.1145/1386790.1386813}
}
```

- Used in: Chapter 2 (elicitability framework), Chapter 3 (distribution
  properties).
- What we take: the elicitability of distribution properties and the
  technical machinery Lambert 2008 uses to prove uniqueness.

### Raja, Pinson, Kazempour, Grammatico 2024

```bibtex
@article{raja2024wagering,
  title   = {A market for trading forecasts: A wagering mechanism},
  author  = {Raja, Aitazaz Ali and Pinson, Pierre and Kazempour, Jalal
             and Grammatico, Sergio},
  journal = {International Journal of Forecasting},
  volume  = {40},
  number  = {1},
  pages   = {142--159},
  year    = {2024},
  doi     = {10.1016/j.ijforecast.2023.01.007}
}
```

- Used in: Chapters 2, 3, 6.
- What we take: the quantile extension of Lambert to continuous
  outcomes; the buyer–seller framing.
- Primary source: `theory/Pierre_wagering.md`.

### Chen, Devanur, Pennock, Vaughan 2014

```bibtex
@inproceedings{chen2014arbitrage,
  title     = {Removing arbitrage from wagering mechanisms},
  author    = {Chen, Yiling and Devanur, Nikhil R. and Pennock,
               David M. and Vaughan, Jennifer Wortman},
  booktitle = {Proceedings of the 15th ACM Conference on Economics
               and Computation (EC '14)},
  year      = {2014},
  pages     = {377--394},
  doi       = {10.1145/2600057.2602876}
}
```

- Used in: Chapters 2, 3.3 (arbitrage), 6.7, 8.3 (arbitrage-seeking
  adversary), 8.5 (sybil-arbitrage), 8.7 (informed coalition).
- What we take: the arbitrage-interval characterisation for weighted
  score wagering mechanisms (Thm 3.3), the no-arbitrage wagering
  family (NAWMs, §4--5), and the sybilproofness of the $f$-NAWM
  subclass (Thm 5.8). Our `ArbitrageSeekingBehaviour` implements
  Thm 3.3 for the MAE analogue; our `CoordinatedGroupBehaviour`
  implements the Chun-Shachter coalition variant.
- Primary source: `theory/arbitrage.md`.

### Chun, Shachter 2011

```bibtex
@article{chun2011cooperating,
  title   = {Strictly proper mechanisms with cooperating players},
  author  = {Chun, So Yeon and Shachter, Ross D.},
  journal = {arXiv preprint arXiv:1202.3710},
  year    = {2011},
  url     = {https://arxiv.org/abs/1202.3710}
}
```

- Used in: Chapter 8.6 (coordinated-group coalition attack), 8.7
  (informed coalition).
- What we take: the coalition-report formula
  $p_C = \sum_{i\in C}(w_i/W_C) p_i$ which provides riskless arbitrage
  when members disagree; used as the theoretical basis for
  `CoordinatedGroupBehaviour` in weighted-mean mode.

### Dimitrov, Sami 2008

```bibtex
@inproceedings{dimitrov2008nonmyopic,
  title     = {Non-myopic strategies in prediction markets},
  author    = {Dimitrov, Stanko and Sami, Rahul},
  booktitle = {Proceedings of the 9th ACM conference on Electronic
               commerce (EC '08)},
  year      = {2008},
  pages     = {200--209}
}
```

- Used in: Chapter 2 (adversary catalogue context), Chapter 8.9
  (strategic reporter).
- What we take: the original observation that in a repeated
  prediction-market setting, rational non-myopic forecasters can
  "bluff" -- report off-belief values to mislead competitors before
  correcting -- and that a discount factor can be used to blunt the
  incentive. Relevant to the strategic-influence / strategic-reporter
  attack archetypes, where the attacker accepts near-term score loss
  in exchange for an aggregate shift that feeds an off-mechanism
  objective.

### Chen, Wortman Vaughan 2010

```bibtex
@inproceedings{chen2010new,
  title     = {A new understanding of prediction markets via no-regret
               learning},
  author    = {Chen, Yiling and Wortman Vaughan, Jennifer},
  booktitle = {Proceedings of the 11th ACM conference on Electronic
               commerce (EC '10)},
  year      = {2010},
  pages     = {189--198}
}
```

- Used in: Chapter 2 (background).
- What we take: the equivalence between market scoring rules and
  online no-regret algorithms, which motivates our EWMA skill layer
  as a bounded-regret estimator on a stationary panel.

### Hardt, Jagadeesan, Mendler-Dünner 2023

```bibtex
@inproceedings{hardt2023performative,
  title     = {Performative Prediction: Past and Future},
  author    = {Hardt, Moritz and Jagadeesan, Meena and
               Mendler-D{\"u}nner, Celestine},
  year      = {2023},
  url       = {https://arxiv.org/abs/2309.05015}
}
```

- Used in: Chapter 8.9 (strategic reporting discussion).
- What we take: the framing that forecasts can influence outcomes
  (performative setting). In our robustness analysis this would
  amplify the strategic-reporter threat because shifting the aggregate
  $\hat r$ can also shift the outcome $y$ that scores the attacker,
  creating a fixed-point problem. We do not model this directly but
  cite it as a real-world extension.

### Treutlein 2023

```bibtex
@article{treutlein2023performative,
  title   = {Incentivizing honest performative predictions with
             proper scoring rules},
  author  = {Treutlein, Johannes},
  journal = {arXiv preprint arXiv:2305.17601},
  year    = {2023},
  url     = {https://arxiv.org/abs/2305.17601}
}
```

- Used in: Chapter 2, Chapter 8.9.
- What we take: bounds on how inaccurate expected-score-maximising
  reports are when predictions are performative, and the observation
  that fixed-point solutions exist for bounded-influence binary
  outcomes but not for richer outcome spaces. Relevant framing for
  the strategic-reporter attack.

### Witkowski, Freeman, Wortman Vaughan, Pennock, Krause 2018

```bibtex
@inproceedings{witkowski2018forecasting,
  title     = {Incentive-Compatible Forecasting Competitions},
  author    = {Witkowski, Jens and Freeman, Rupert and Wortman
               Vaughan, Jennifer and Pennock, David M. and Krause,
               Andreas},
  booktitle = {Proceedings of the 32nd AAAI Conference on Artificial
               Intelligence (AAAI '18)},
  year      = {2018},
  url       = {https://arxiv.org/abs/2101.01816}
}
```

- Used in: Chapter 2 (forecasting competition context), Chapter 8.13
  (robustness headline).
- What we take: the impossibility result for winner-take-all
  forecasting competitions (forecasters have incentive to report
  extreme beliefs to maximise the probability of winning), and the
  ELF mechanism as a truthful alternative. Explains why the Lambert
  self-financed framing is not the same as a forecasting tournament
  and why our mechanism's budget-balance property is structurally
  different from a competition prize.

### Freeman, Pennock, Reeves, Wortman Vaughan 2017

```bibtex
@inproceedings{freeman2017peer,
  title     = {Crowdsourced Outcome Determination in Prediction
               Markets},
  author    = {Freeman, Rupert and Pennock, David M. and Reeves,
               Daniel M. and Wortman Vaughan, Jennifer},
  booktitle = {Proceedings of the 31st AAAI Conference on Artificial
               Intelligence (AAAI '17)},
  year      = {2017}
}
```

- Used in: Chapter 2 (peer-prediction arbiter context).
- What we take: the peer-prediction mechanism that incentivises
  truthful arbitration via market fees, relevant for the outcome
  determination step. We do not use peer-prediction directly; we cite
  it to pre-empt the natural reviewer question of whether our
  settlement could be made adversarially robust by a peer-prediction
  verifier.

### Feldman, Chuang 2004

```bibtex
@inproceedings{feldman2004freeriding,
  title     = {Free-Riding and Whitewashing in Peer-to-Peer Systems},
  author    = {Feldman, Michal and Chuang, John},
  booktitle = {Proceedings of the ACM SIGCOMM workshop on Practice and
               Theory of Incentives in Networked Systems (PINS '04)},
  year      = {2004},
  pages     = {228--235},
  doi       = {10.1145/1016527.1016539}
}
```

- Used in: Chapter 2 (adversary catalogue), Chapter 8.11 (reputation
  reset attack).
- What we take: the "whitewashing" threat model -- opportunistic
  users abandoning a degraded reputation and re-entering with a fresh
  identity to escape past losses. Our
  `ReputationResetBehaviour` implements this attack. Feldman and
  Chuang's main recommendation -- impose a penalty on every newcomer
  -- is roughly what our κ > 0 staleness decay and non-unit σ_init
  prior jointly achieve.

### Johnstone 2007

```bibtex
@article{johnstone2007economic,
  title   = {Economic Darwinism: Who has the Best Probabilities?},
  author  = {Johnstone, David},
  journal = {Theory and Decision},
  volume  = {62},
  number  = {1},
  pages   = {47--96},
  year    = {2007},
  doi     = {10.1007/s11238-006-9013-3}
}
```

- Used in: Chapter 8.5 (insider-advantage threat model).
- What we take: the framing that under a repeated wagering setting,
  a forecaster with superior information accumulates wealth at a
  predictable rate determined by Kullback–Leibler divergence between
  her belief and the market's belief. Motivates our
  `privileged_information` behaviour, where the "private edge" is a
  low-variance lagged signal rather than a hard leak.

## B. Online learning for forecast combination

### Vitali, Pinson 2025

```bibtex
@article{vitali2025intermittent,
  title   = {Prediction Markets with Intermittent Contributions},
  author  = {Vitali, Michael and Pinson, Pierre},
  journal = {arXiv preprint arXiv:2510.13385},
  year    = {2025},
  url     = {https://arxiv.org/abs/2510.13385}
}
```

- Used in: Chapters 2, 5.2 (baseline comparison).
- What we take: the online learning with intermittency framing and the
  OGD reference aggregator. Our `onlinev2/src/onlinev2/mechanism/
  michael_port.py` is a direct port.
- Primary source: `theory/intermittentcontributions_michael.md`.

### Cesa-Bianchi, Lugosi 2006

```bibtex
@book{cesabianchi2006prediction,
  title     = {Prediction, Learning, and Games},
  author    = {Cesa-Bianchi, Nicol{\`o} and Lugosi, G{\'a}bor},
  publisher = {Cambridge University Press},
  year      = {2006},
  isbn      = {978-0-521-84108-5}
}
```

- Used in: Chapter 2 (regret framework).
- What we take: the regret-against-best-expert framing we use to
  interpret the `best_single` row in `comparison.json`.

### Bates, Granger 1969

```bibtex
@article{bates1969combination,
  title   = {The Combination of Forecasts},
  author  = {Bates, J. M. and Granger, C. W. J.},
  journal = {Journal of the Operational Research Society},
  volume  = {20},
  number  = {4},
  pages   = {451--468},
  year    = {1969}
}
```

- Used in: Chapter 2 (forecast combination baseline),
  Chapter 5.2 (inverse-variance reference).
- What we take: the inverse-variance weighting benchmark. Our
  `inverse_variance` method is exactly this rule with rolling variance
  estimates.

### Robbins, Monro 1951

```bibtex
@article{robbins1951stochastic,
  title   = {A stochastic approximation method},
  author  = {Robbins, Herbert and Monro, Sutton},
  journal = {Annals of Mathematical Statistics},
  volume  = {22},
  number  = {3},
  pages   = {400--407},
  year    = {1951},
  doi     = {10.1214/aoms/1177729586}
}
```

- Used in: Chapter 3.4 (EWMA consistency).
- What we take: the foundational stochastic-approximation result
  underpinning our claim that σ_i is a consistent estimator of an
  agent's long-run reliability under stationary losses.

### Benveniste, Métivier, Priouret 1990

```bibtex
@book{benveniste1990adaptive,
  title     = {Adaptive Algorithms and Stochastic Approximations},
  author    = {Benveniste, Albert and M{\'e}tivier, Michel and Priouret,
               Pierre},
  publisher = {Springer-Verlag},
  year      = {1990}
}
```

- Used in: Chapter 3.4.
- What we take: the tracking-error bound for EWMA-style recursive
  estimators under non-stationarity (O(ρ · drift) tracking error at
  learning rate ρ).

### Kelly 1956

```bibtex
@article{kelly1956new,
  title   = {A New Interpretation of Information Rate},
  author  = {Kelly, J. L.},
  journal = {Bell System Technical Journal},
  volume  = {35},
  number  = {4},
  pages   = {917--926},
  year    = {1956},
  doi     = {10.1002/j.1538-7305.1956.tb03809.x}
}
```

- Used in: Chapter 3.1 (bankroll-fraction deposit policy).
- What we take: the log-optimal growth criterion that motivates a
  confidence-scaled fractional-stake policy. Our bankroll policy with
  `f_stake · W · c_i` is a heuristic deterministic analogue in
  probit-space of precision.

### Steinwart, Christmann 2011

```bibtex
@article{steinwart2011estimating,
  title   = {Estimating conditional quantiles with the help of the
             pinball loss},
  author  = {Steinwart, Ingo and Christmann, Andreas},
  journal = {Bernoulli},
  volume  = {17},
  number  = {1},
  pages   = {211--225},
  year    = {2011},
  url     = {https://arxiv.org/abs/1102.2101}
}
```

- Used in: Chapter 3.1 (pinball loss consistency), Chapter 4.
- What we take: the formal statement that pinball loss is strictly
  consistent for the τ-quantile functional under mild conditions,
  which is the elicitability result underlying our per-round
  truthfulness argument when forecasters report quantile grids.

### Timmermann 2006

```bibtex
@incollection{timmermann2006forecast,
  title     = {Forecast Combinations},
  author    = {Timmermann, Allan},
  booktitle = {Handbook of Economic Forecasting},
  volume    = {1},
  pages     = {135--196},
  year      = {2006},
  publisher = {Elsevier}
}
```

- Used in: Chapters 2, 5.2, 7 (discussion of equal-weights
  robustness).
- What we take: the forecast combination puzzle. Equal weights
  often beat theoretically optimal combinations in practice.

## C. Scoring rules and probabilistic forecast evaluation

### Gneiting, Raftery 2007

```bibtex
@article{gneiting2007strictly,
  title   = {Strictly Proper Scoring Rules, Prediction, and Estimation},
  author  = {Gneiting, Tilmann and Raftery, Adrian E.},
  journal = {Journal of the American Statistical Association},
  volume  = {102},
  number  = {477},
  pages   = {359--378},
  year    = {2007},
  doi     = {10.1198/016214506000001437}
}
```

- Used in: Chapters 2, 3, 4, 5, 7.
- What we take: CRPS and pinball loss are strictly proper; the
  truthfulness carries over from Lambert's discrete case.

### Gneiting, Balabdaoui, Raftery 2007

```bibtex
@article{gneiting2007probabilistic,
  title   = {Probabilistic forecasts, calibration and sharpness},
  author  = {Gneiting, Tilmann and Balabdaoui, Fadoua and Raftery,
             Adrian E.},
  journal = {Journal of the Royal Statistical Society: Series B},
  volume  = {69},
  number  = {2},
  pages   = {243--268},
  year    = {2007},
  doi     = {10.1111/j.1467-9868.2007.00587.x}
}
```

- Used in: Chapter 5.3 (recalibration).
- What we take: calibration-sharpness principle. Recalibration must
  trade sharpness for calibration; our 11% sharpness cost is just past
  the theoretical floor (ratio 0.891 < 0.9 bound).

### Ranjan, Gneiting 2010

```bibtex
@article{ranjan2010combining,
  title   = {Combining probability forecasts},
  author  = {Ranjan, Roopesh and Gneiting, Tilmann},
  journal = {Journal of the Royal Statistical Society: Series B},
  volume  = {72},
  number  = {1},
  pages   = {71--91},
  year    = {2010},
  doi     = {10.1111/j.1467-9868.2009.00726.x}
}
```

- Used in: Chapter 5.3 (why the aggregate is miscalibrated).
- What we take: the impossibility result — any non-trivial linear
  combination of distinct calibrated forecasts is uncalibrated and
  lacks sharpness. This is the theoretical reason our mechanism's
  aggregate needs the recalibration layer.

### Gneiting, Ranjan 2013

```bibtex
@article{gneiting2013combining,
  title   = {Combining Predictive Distributions},
  author  = {Gneiting, Tilmann and Ranjan, Roopesh},
  journal = {arXiv preprint arXiv:1106.1638},
  year    = {2013},
  url     = {https://arxiv.org/abs/1106.1638}
}
```

- Used in: Chapter 5.3, Chapter 8 (future work).
- What we take: the Beta-transformed linear pool (BLP) as a parametric
  alternative to isotonic recalibration. Listed as future work.

### Kuleshov, Fenner, Ermon 2018

```bibtex
@inproceedings{kuleshov2018accurate,
  title     = {Accurate Uncertainties for Deep Learning Using Calibrated
               Regression},
  author    = {Kuleshov, Volodymyr and Fenner, Nathan and Ermon, Stefano},
  booktitle = {Proceedings of the 35th International Conference on
               Machine Learning (ICML)},
  year      = {2018},
  url       = {https://arxiv.org/abs/1807.00263}
}
```

- Used in: Chapter 5.3.
- What we take: the isotonic post-processor. Our recalibration layer is
  a rolling-buffer version of the method in §3.1 of the paper.

### Deshpande, Kuleshov 2023/2025

```bibtex
@inproceedings{deshpande2023calibrated,
  title     = {Calibrated Regression Against An Adversary Without
               Regret},
  author    = {Deshpande, Shachi and Kuleshov, Volodymyr},
  year      = {2023},
  note      = {arXiv:2302.12196; published in Proceedings of the
               Conference on Uncertainty in Artificial Intelligence
               (UAI), PMLR v286, 2025},
  url       = {https://arxiv.org/abs/2302.12196}
}
```

- Used in: Chapter 5.3 / §7.6 (why rolling buffer over fixed held-out
  fit).
- What we take: the adversarial/online-regret extension of the KFE
  procedure. It motivates why a rolling-buffer design is safer than a
  fixed held-out fit under potential non-stationarity, at the cost of
  finite-horizon rather than asymptotic calibration guarantees.

### Dawid 1984

```bibtex
@article{dawid1984prequential,
  title   = {Present Position and Potential Developments: Some Personal
             Views Statistical Theory the Prequential Approach},
  author  = {Dawid, A. Philip},
  journal = {Journal of the Royal Statistical Society: Series A
             (General)},
  volume  = {147},
  number  = {2},
  pages   = {278--290},
  year    = {1984}
}
```

- Used in: Chapter 4 (evaluation methodology), Chapter 5.3.
- What we take: the prequential framework. Every observation is first
  used for testing then for training. Motivates our rolling-buffer
  recalibrator.

## D. Time-series forecasting evaluation

### Tashman 2000

```bibtex
@article{tashman2000outofsample,
  title   = {Out-of-sample tests of forecasting accuracy: An analysis
             and review},
  author  = {Tashman, Leonard J.},
  journal = {International Journal of Forecasting},
  volume  = {16},
  number  = {4},
  pages   = {437--450},
  year    = {2000},
  doi     = {10.1016/S0169-2070(00)00065-0}
}
```

### Gama, Sebastião, Rodrigues 2013

```bibtex
@article{gama2013stream,
  title   = {On evaluating stream learning algorithms},
  author  = {Gama, Jo{\~a}o and Sebasti{\~a}o, Raquel and Rodrigues,
             Pedro P.},
  journal = {Machine Learning},
  volume  = {90},
  number  = {3},
  pages   = {317--346},
  year    = {2013},
  doi     = {10.1007/s10994-012-5320-9}
}
```

### Cerqueira, Torgo, Soares 2020

```bibtex
@article{cerqueira2020evaluating,
  title   = {Evaluating time series forecasting models: an empirical
             study on performance estimation methods},
  author  = {Cerqueira, Vitor and Torgo, Luis and Soares, Carlos},
  journal = {Machine Learning},
  volume  = {109},
  pages   = {1997--2028},
  year    = {2020},
  doi     = {10.1007/s10994-020-05910-7}
}
```

### Diebold, Mariano 1995

```bibtex
@article{diebold1995comparing,
  title   = {Comparing predictive accuracy},
  author  = {Diebold, Francis X. and Mariano, Roberto S.},
  journal = {Journal of Business and Economic Statistics},
  volume  = {13},
  number  = {3},
  pages   = {253--263},
  year    = {1995},
  doi     = {10.1198/073500102753410444}
}
```

- Used in: Chapter 4.6, Chapter 5.2 (mechanism vs uniform).
- What we take: the DM statistic for paired forecast comparison. HAC
  standard errors.

### Hyndman, Athanasopoulos 2021

```bibtex
@book{hyndman2021forecasting,
  title     = {Forecasting: Principles and Practice},
  author    = {Hyndman, Rob J. and Athanasopoulos, George},
  edition   = {3rd},
  publisher = {OTexts},
  year      = {2021},
  url       = {https://otexts.com/fpp3/}
}
```

### Bergmeir, Hyndman, Koo 2018

```bibtex
@article{bergmeir2018note,
  title   = {A note on the validity of cross-validation for
             evaluating autoregressive time series prediction},
  author  = {Bergmeir, Christoph and Hyndman, Rob J. and Koo, Bonsoo},
  journal = {Computational Statistics \& Data Analysis},
  volume  = {120},
  pages   = {70--83},
  year    = {2018},
  doi     = {10.1016/j.csda.2017.11.003}
}
```

- Used in: Chapter 4.3 (forecaster training protocol).
- What we take: justification for using expanding-window
  cross-validation with an embargo / gap between train and
  validation for hyperparameter tuning on autoregressive time-series
  models (XGBoost, MLP). The paper shows that standard k-fold CV can
  be valid for purely autoregressive forecasting models, and that
  expanding-window CV with a gap is the safe default when
  autocorrelation in residuals is suspected.

## E. Forecasters used in the panel

### Assimakopoulos, Nikolopoulos 2000 (Theta method)

```bibtex
@article{assimakopoulos2000theta,
  title   = {The theta model: a decomposition approach to forecasting},
  author  = {Assimakopoulos, Vassilis and Nikolopoulos, Konstantinos},
  journal = {International Journal of Forecasting},
  volume  = {16},
  number  = {4},
  pages   = {521--530},
  year    = {2000}
}
```

### Chen, Guestrin 2016 (XGBoost)

```bibtex
@inproceedings{chen2016xgboost,
  title     = {XGBoost: A Scalable Tree Boosting System},
  author    = {Chen, Tianqi and Guestrin, Carlos},
  booktitle = {Proceedings of the 22nd ACM SIGKDD International
               Conference on Knowledge Discovery and Data Mining},
  year      = {2016},
  doi       = {10.1145/2939672.2939785}
}
```

### M4 Competition

```bibtex
@article{makridakis2018m4,
  title   = {The M4 Competition: Results, findings, conclusion and way
             forward},
  author  = {Makridakis, Spyros and Spiliotis, Evangelos and
             Assimakopoulos, Vassilios},
  journal = {International Journal of Forecasting},
  volume  = {34},
  number  = {4},
  pages   = {802--808},
  year    = {2018}
}
```

## F. Datasets

### Elia open data

Elia Group, the Belgian transmission system operator, publishes
open wind-power and electricity-imbalance data at
https://www.elia.be/en/grid-data. The 2024–2025 slice used here is
committed as `data/elia_offshore_wind_2024_2025.csv`.

[PENDING] Confirm attribution text required by the Elia terms of use.

## Still to add (placeholders)

- Bergmeir, Benítez 2012 — blocked CV for stationary TS.
- Mashlakov et al. 2021 — deep learning probabilistic energy
  forecasting.
- Kilgour, Gerchak 2004 — KG scoring rules (background for Lambert).
- Savage 1971 — strict propriety characterisation (background).
- Gneiting, Katzfuss 2014 — probabilistic forecasting review.
