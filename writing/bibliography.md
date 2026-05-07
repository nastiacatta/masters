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

### Chen et al. 2014

```bibtex
@inproceedings{chen2014gaming,
  title     = {Gaming prediction markets: Equilibrium strategies with a
               market maker},
  author    = {Chen, Yiling and Dimitrov, Stanko and Sami, Rahul and
               Reeves, Daniel M. and Pennock, David M. and Hanson, Robin
               and Fortnow, Lance and Gonen, Rica},
  booktitle = {Proceedings of the 14th ACM Conference on Economic and
               Computation (EC '13)},
  year      = {2014}
}
```

- Used in: Chapter 6.7 (arbitrage analysis).
- What we take: the single-round arbitrage-interval result for
  weighted-score wagering mechanisms. [PENDING] verify year and venue
  against theory/ PDFs.

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
  trade sharpness for calibration; our 9% sharpness cost is on the
  theoretical floor.

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

- Bergmeir, Hyndman, Koo 2018 — time-series CV validity.
- Bergmeir, Benítez 2012 — blocked CV for stationary TS.
- Mashlakov et al. 2021 — deep learning probabilistic energy
  forecasting.
- Johnstone 2007 — asymmetric Kilgour–Gerchak (background for
  Lambert).
- Kilgour, Gerchak 2004 — KG scoring rules (background for Lambert).
- Savage 1971 — strict propriety characterisation (background).
- Gneiting, Katzfuss 2014 — probabilistic forecasting review.
