IEEE TRANSACTIONS ON POWER SYSTEMS, VOL. 39, NO. 2, MARCH 2024
Adaptive Probabilistic Forecasting of
Electricity (Net-)Load
Joseph de Vilmarest
, Jethro Browell
, Senior Member, IEEE, Matteo Fasiolo
, Yannig Goude
,
and Olivier Wintenberger
Abstract—Electricityload forecasting is a necessary capability
for power system operators and electricity market participants.
Both demand and supply characteristics evolve over time. On the
demand side, unexpected events as well as longer-term changes
in consumption habits affect demand patterns. On the production
side, the increasing penetration of intermittent power generation
signiﬁcantly changes the forecasting needs. We address this chal-
lenge in two ways. First, our setting is adaptive; our models take into
account the most recent observations available to automatically
respond to changes in the underlying process. Second, we consider
probabilistic rather than point forecasting; indeed, uncertainty
quantiﬁcation is required to operate electricity systems efﬁciently
and reliably. Our methodology relies on the Kalman ﬁlter, pre-
viously used successfully for adaptive point load forecasting. The
probabilistic forecasts are obtained by quantile regressions on
the residuals of the point forecasting model. We achieve adaptive
quantile regressions using the online gradient descent; we avoid the
choice of the gradient step size considering multiple learning rates
and aggregation of experts. We apply the method to two data sets:
theregionalnet-loadinGreatBritainandthedemandofsevenlarge
cities in the United States. Adaptive procedures improve forecast
performance substantially in both use cases for both point and
probabilistic forecasting.
Index Terms—Adaptive forecasting, net-load, probabilistic, time
series.
I. INTRODUCTION
F
ORECASTING electricity demand is fundamental in the
process of maintaining supply-demand balance. This per-
manent equilibrium is necessary to maintain a reliable supply of
Manuscript received 6 January 2023; revised 20 April 2023 and 29 June 2023;
accepted 21 August 2023. Date of publication 30 August 2023; date of current
version 21 February 2024. This work was supported by Agence Nationale de
la Recherche (https://anr.fr/). Paper no. TPWRS-00024-2023. (Corresponding
author: Joseph de Vilmarest.)
Joseph de Vilmarest was with the Électricité de France R&D, Sorbonne
Université, 75005 Paris, France. He is now with Viking Conseil, Paris 75007,
France (e-mail: joseph.de-vilmarest@vikingconseil.fr).
Jethro Browell is with the University of Glasgow, G12 8QQ Glasgow, U.K.
(e-mail: jethro.browell@glasgow.ac.uk).
Matteo Fasiolo is with the University of Bristol, BS8 1QU Bristol, U.K.
(e-mail: matteo.fasiolo@bristol.ac.uk).
Yannig Goude is with Électricité de France R&D and with Laboratoire de
Mathématique d’Orsay, Université Paris-Saclay, 91190 Gif-sur-Yvette, France
(e-mail: yannig.goude@edf.fr).
Olivier Wintenberger is with Sorbonne Université, 75005 Paris, France,
and also with Wolfgang Pauli Institut, c/o Fakultät für Mathematik,
Universität
Wien,
Wien,
Austria
(e-mail:
olivier.wintenberger@
sorbonne-universite.fr).
Color versions of one or more ﬁgures in this article are available at
https://doi.org/10.1109/TPWRS.2023.3310280.
Digital Object Identiﬁer 10.1109/TPWRS.2023.3310280
electricity and to avoid damaging infrastructure. As electricity
cannot be stored on a large scale, forecasts are crucial to inform-
ing production planning. This necessity explains why energy
forecasting has gathered so much attention from the time series
and forecasting community [1]. The recent increase in electricity
prices in Europe further emphasizes the importance of demand
forecast quality.
The literature historically focused on point forecasting. How-
ever, the expected value of the load is not sufﬁcient for risk
management. Forecasting models cannot be perfect and there-
fore the production plans cannot match exactly the demand;
therefore, grid operators need to call reserves to maintain the
equilibrium and traders need to hedge their market positions.
It is thus essential to have some information on the distribution
aroundthemeantoschedulethereserveneeded. InGreat Britain,
for instance, reserves are tailored to be sufﬁcient in all but 4
hours per year; this corresponds to the estimation of 99.95%
conﬁdence intervals. The importance of probabilistic forecasts
was highlighted in the last two Global Energy Forecasting Com-
petitions [2], [3]. Indeed, the objective in both competitions was
to forecast certain quantiles, and the submissions were evaluated
through the sum of quantile losses. Also, a recent challenge
called Net Load Forecasting Prize was launched by the U.S.
Department of Energy and EPRI, focusing on probabilistic net
load forecasts [4].
Demand and supply characteristics are both evolving with
time. On the demand side, unexpected events such as the coron-
avirus crisis or the recent increase in electricity prices in Europe
can affect it signiﬁcantly and abruptly [5], [6]. From a longer-
term perspective, the evolution of consumption habits such as
those induced by the expected growth in electric vehicle pene-
tration will change the demand patterns. On the production side,
the increasing penetration of intermittent electricity production
strongly changes the forecasting task. Indeed, controllable pro-
duction units must be employed to meet the difference between
the demand and the intermittent electricity production (mainly
wind and solar energy) [7], denoted by net-load. These changes
in the behavior of the net-load can not be captured by classical
ofﬂine probabilistic methods and motivate the need for adaptive
methods, taking into account observations in a streaming fashion
to improve the forecasting model.
The recent point forecasting literature has highlighted the
improvements yielded by adaptive methods able to learn regime
changes. Adaptation is especially crucial to forecast wind and
solar power, and it has been successfully applied to online
0885-8950 © 2023 IEEE. Personal use is permitted, but republication/redistribution requires IEEE permission.
See https://www.ieee.org/publications/rights/index.html for more information.
Authorized licensed use limited to: Imperial College London. Downloaded on December 02,2025 at 15:08:49 UTC from IEEE Xplore.  Restrictions apply. 

DE VILMAREST et al.: ADAPTIVE PROBABILISTIC FORECASTING OF ELECTRICITY (NET-)LOAD
Fig. 1.
Our two-step procedure starts from explanatory variables, computes
an intermediate mean forecast, and then estimate the quantile forecast. On the
left we describe the ofﬂine model (Section II-A and [21]). Our contributions are
represented by the right diagram, introducing our adaptive model (Sections II-B
to II-C4), in which both steps are adapted.
variable selection [8] and online forecast reconciliation [9].
State-space representations have well captured the recent
changes of pattern due to the coronavirus crisis [10], [11]. While
the majority of recent works have focused on point forecasting,
[12] consider adaptive probabilistic load forecasting based on
hidden Markov models and is found to perform well for a range
of loads; however, this approach relies on Gaussian predictive
distributions which leads to relatively poor calibration (quantile
bias) on the data we consider here. In [13], [14], quantile GAMs
are proposed, as well as variants of GAMLSS (Location Scale
and Shape) in [15], for probabilistic demand forecasting. These
methods relaxtheGaussianassumptionbut arenot adaptive. [16]
propose a mixture model for short term probabilistic forecasting
of individual load demand at different aggregation level, but the
distribution of the data is supposed to be invariant with time.
[17] propose, similarly to [10], a deep neural network proba-
bilistic forecasting method where the features extracted with
a multi-layer RNN-LSTM are mapped to a state-space model
for online adaptation. Their work is limited to time-varying
Gaussian distributions as they use a Gaussian state-space model
to generate density forecasts.
We propose in this article to apply the adaptive framework
to quantile regression for probabilistic forecasting. There has
been scarce work in that direction. We mention the exciting use
of aggregation of experts to obtain an online forecaster [13],
[18]. The principle is to combine various predictions (experts)
with a weighted average where the weights evolve over time.
We exploit the idea of aggregation, but we introduce a more
structural adaptation in the sense the experts themselves are
adaptive.
The methodology employed and our contributions are sum-
marized in Fig. 1. We adopt a two-step procedure. First, we
employ a widely used model class, namely that of Generalized
Additive Models (GAMs), to forecast the expected value of
the variable of interest. This is a non-adaptive model ﬁtted
to several years of training data. We consider a state-space
representation to obtain an adaptive variant, relying on the
Kalman ﬁlter for the inference similarly to [10], [11]. Second,
we focus on forecasting the quantiles of the net-demand. While
the Kalman ﬁlter already models it as a Gaussian, we observe
that this forecast is not always well-calibrated. Therefore, we
use a set of quantile regressions on the residuals of the mean
estimates. We apply the online gradient descent (OGD) to obtain
adaptive quantile regressions. We select the best gradient step
by exploiting an expert aggregation algorithm, Bernstein Online
Aggregation [19]; it means we compute the OGD with several
step sizes (multiple arrows in Fig. 1) and our ﬁnal forecast is
a combination of these forecasts; the quantile loss is optimized
online as proposed by [20].
In Section II we present adaptive methods for probabilistic
forecasting, and we discuss their evaluation in Section III. Then
we apply our approach on two data sets. In Section IV, we
consider the regional net-load in Great Britain, and we extend
the work of [21] to the adaptive setting, also extending the data
set with more recent data (including the coronavirus crisis).
Furthermore,weshowinSectionIV-Dthatadaptivemodelshave
fewer needs for good explanatory variables; indeed, removing
two (difﬁcult to obtain) variables from the model has a lower
impact on the adaptive variant. In Section V, we apply the
methods to the load of seven major cities in the United States
[22]. In the latter application, we predict daily, rather than
half-hourly, data to determine whether our approach works well
at this time granularity.
Our main contributions are :
r a new method based on time-varying quantile regression
with OGD for adaptive probabilistic forecasting of time
series.
r application of these methods to regional net demand in the
UK and urban consumption in the US. Comparison with
state of the art online forecasting methods demonstrates
the interest of this approach.
II. THEORETICAL FRAMEWORK
We aim to forecast a variable of interest yt ∈R given some
explanatory variables xt ∈Rd, d > 0. We formally introduce
the impact of time dependence on our approach. Let Ft =
σ(x1, y1, . . . , xt, yt) be the natural ﬁltration; it models the in-
formation contained in the observations up to time t. We dis-
criminate between two settings represented with two diagrams
in Fig. 1:
r Ofﬂine or Batch (Section II-A): The model is learned on a
training period, for instance on data up to time ntrain. We
estimate L(yt | xt, Fntrain), the conditional distribution of
yt given xt, Fntrain.
r Online or Adaptive (Sections II-B and II-C): The model is
learned sequentially. We estimate L(yt | xt, Ft−1) at each
time t.
A. Ofﬂine Model
Motivated by [21], we decompose our model into two steps.
We forecast the conditional mean with a generalized additive
Authorized licensed use limited to: Imperial College London. Downloaded on December 02,2025 at 15:08:49 UTC from IEEE Xplore.  Restrictions apply. 

IEEE TRANSACTIONS ON POWER SYSTEMS, VOL. 39, NO. 2, MARCH 2024
model (GAM), and then quantile regressions on the GAM
residuals yield quantile forecasts.
1) We model yt as a Gaussian random variable whose mean
is a sum of the effects of the covariates:
yt =
d

j=1
fj(xt,j) + εt,
εt ∼N(0, σ2),
(1)
where the effects f1, . . . fd are either linear or nonlin-
ear. In the latter case, the effects are built using linear
combinations of spline bases [23]. The optimization of
these effects on the training set yields a mean forecast
ˆyt = E[yt | xt, Fntrain].
2) The Gaussian assumption with ﬁxed variance is violated
in practice. Therefore, we ﬁt a set of quantile regressions
[24] on the residuals to predict the distribution around
the mean. We use an intermediate vector of covariates
zt ∈Rd0, d0 > 0 derived from the original vector xt;
depending on the application, zt may contain the GAM
prediction, the GAM effects fj(xt,j)... For any quantile
level q, we deﬁne a vector βq ∈Rd0 via the following
minimization problem:
βq ∈arg min
β∈Rd0
ntrain

t=1
ρq(yt −ˆyt, β⊤zt),
(2)
ρq(y, ˆyq) = (1y<ˆyq −q)(ˆyq −y).
(3)
Then, we predict the quantile for probability level q with
ˆyt + β⊤
q zt. This is justiﬁed by the following well-known
lemma [25].
Lemma 1: Let Y be an integrable real-valued random vari-
able. For any 0 < q < 1 the q-quantile of Y denoted by Yq
satisﬁes Yq ∈arg min E[ρq(Y, Yq)].
This two-step procedure is motivated by computational time
and by the fact that the data is sparse in the tails (sparser than
around the mean) as in [13]. Indeed, we could also use quantile
GAM [14], but it is more time-consuming than simple quantile
regressions. Hence the need to use simple linear adjustments to
correct the (more richly-parametrized) mean GAM. Also, we
explain in the following paragraph that the mean GAM may
be adapted using the Kalman ﬁlter, and that is not the case for
quantile models, for which we adopt a different strategy, see
Section II-C.
The ﬁrst natural adaptive forecaster consists in re-training
the ofﬂine model at each time step. We call this procedure
incremental ofﬂine.
B. Adaptation of Generalized Additive Model
We adapt the GAM as done by [10]. More precisely, we freeze
the nonlinear effects learned on the training set (Section II-A);
with these effects, we deﬁne a new covariate vector f(xt) =
(f 1(xt,1), . . . f d(xt,d), 1)⊤, where f j(xt,j) is the standardized
version of fj(xt,j). Then we consider the linear Gaussian state-
space model:
θt −θt−1 ∼N(0, Q),
(4)
yt −θ⊤
t f(xt) ∼N(0, σ2),
(5)
where Q is the state noise covariance matrix, and σ2 the space
noise variance. In the preceding set of equations, we assume
implicitly that the noises are independent. Estimation in a linear
Gaussian state-space model with known variances has been
optimally solved by [26]:
Theorem
(Kalman
Filter): Provided
that
the
data-
generating process is the state-space model with variances Q
and σ2, and if the prior distribution of θ1 is N(ˆθ1, P1), then
the posterior distribution of the state is a Gaussian whose mean
and covariance matrix have analytical forms. Precisely, we have
θt | Ft−1 ∼N(ˆθt, Pt) with:
Pt|t = Pt −
Ptf(xt)f(xt)⊤Pt
f(xt)⊤Ptf(xt) + σ2 ,
(6)
ˆθt+1 = ˆθt −Pt|t
σ2

f(xt)(ˆθ⊤
t f(xt) −yt)

,
(7)
Pt+1 = Pt|t + Q.
(8)
The unsolved issue of linear Gaussian state-space models
concerns the estimation of its variances Q and σ2. In our setting,
as well as in many applications, the variances are unknown. The
choice of the variances can be seen as a parametrization of a
gradient algorithm. Indeed, f(xt)(ˆθ⊤
t f(xt) −yt) is the gradient
of the quadratic loss with respect to θ; therefore, the update
(7) is a gradient step with a pre-conditioning matrix Pt|t/σ2
which depends crucially on the choice of σ2 and Q. We propose
different settings:
r Static: We set Q = 0 (constant state vector), and σ2 = 1.
This yields a detailed link with the gradient community
[27]; the constant state is equivalent to the i.i.d. assumption
of gradient analyses in the setting Pt|t →0 (annealing step
size).
r Dynamic: The natural approach aims at maximizing the
likelihood; in that vein, we apply an iterative greedy pro-
cedure implemented in the R package viking [28], that
was applied on electricity load forecasting by [10], [11]. It
yields a sparse matrix Q assumed diagonal. In that setting,
the gradient step does not converge to 0. Note that we apply
this procedure to maximize the likelihood on a training set;
therefore the variances σ2 and Q are learned in a batch
fashion, but the underlying model assumes a time-varying
state θt leading to an adaptive ˆθt.
C. Adaptation of the Quantile Forecasts
The novelty of the present approach lies in the adaptation of
probabilistic forecasts. We compare different methods.
1) Gaussian Posterior from Kalman: We ﬁrst recall that the
Kalman ﬁlter does not only yield a mean forecast but already
a probabilistic forecast. Indeed, at each time step t, Theorem 1
yields L(θt | Ft−1) = N(ˆθt, Pt). From the state posterior dis-
tribution and the observation distribution (5), we deduce
L(yt | xt, Ft−1) = N(ˆθ⊤
t f(xt), f(xt)⊤Ptf(xt) + σ2).
(9)
It yields a readily computable probabilistic forecast; for any
quantile level q, denoting by Nq the quantile of the standard
Authorized licensed use limited to: Imperial College London. Downloaded on December 02,2025 at 15:08:49 UTC from IEEE Xplore.  Restrictions apply. 

DE VILMAREST et al.: ADAPTIVE PROBABILISTIC FORECASTING OF ELECTRICITY (NET-)LOAD
normal distribution, we predict the q-quantile of yt as
ˆyt,q = ˆθ⊤
t f(xt) + Nq

f(xt)⊤Ptf(xt) + σ2.
(10)
However, this ﬁrst adaptive forecaster would be an adaptive
variant of the ofﬂine Gaussian distribution on the ofﬂine GAM
residuals, where only the GAM is adapted but the variance of the
Gaussian distribution is still ﬁxed. The quantile regressions were
speciﬁcally introduced because the Gaussian assumption with
ﬁxed variance is violated in practice. We see in the experiments
that this Gaussian forecaster is not always well-calibrated.
2) Quantile Regressions on Kalman Residuals: We then re-
mark that the ofﬂine quantile regressions should work well
in the case where the conditional distribution of the residual
yt −ˆyt given the covariates zt is ﬁxed. The need for adaptive
quantile forecasts is motivated only by changes in the residual
distribution. Yet a critical property of the Kalman ﬁlter is that
the residuals are stationary, provided that the state-space model
is well-speciﬁed. Consequently, the dependence of the Kalman
residuals on the quantile covariates should be more stable than
that of the ofﬂine GAM. Therefore, we combine state-space
adaptation of the GAM and ofﬂine quantile regressions.
3) Online Gradient Descent on the Pinball Loss: We con-
sider an online quantile regression applying online gradient
descent (OGD) on the pinball loss. Precisely, we deﬁned in
Section II-A the ofﬂine quantile regression for the q-quantile
with a vector of covariates zt ∈Rd0, d0 > 0:
βq ∈arg min
β∈Rd0
ntrain

t=1
ρq(yt −ˆyt, β⊤zt).
(11)
Motivated by the gradient interpretation of the Kalman ﬁlter
(Section II-B), we apply the OGD to estimate recursively a
vector βt,q. We start from any β1,q ∈Rd0 and at each step we
update it with a step in the direction opposite to the gradient of
the loss:
βt+1,q = βt,q −α∂ρq(yt −ˆyt, β⊤zt)
∂β

βt,q.
(12)
The gradient step size α is the important parameter, analogous
to the variances that are determining the gradient step in the
gradient interpretation of the Kalman ﬁlter. We use a constant
α in the OGD, and we standardize the covariates zt. Note that
the gradient is not well deﬁned for the singular point yt = ˆyt +
β⊤
t,qzt; we choose to set it to 0 in the remote case that this happens
in practice.
4) Bernstein Online Aggregation to Choose the Step Size: In
order to choose the step size in the previous method, we rely
on aggregation of experts as proposed by [20] and similarly by
[29]. Our procedure is run separately for each quantile level q
using the R package opera [30]. First, we run the OGD with
different possible values (αk)1≤k≤K; at each time t, it yields a
forecast ˆy(k)
t,q for each step size αk. Second, we combine these
forecasts using Bernstein Online Aggregation [19]; the principle
of aggregation is to forecast ˆyt,q = K
k=1 p(k)
t,q ˆy(k)
t,q , where the
weights p(k)
t,q are obtained sequentially. The properties obtained
by the online learning literature guarantee that the total pinball
loss of the aggregation has a small regret compared with the total
pinball loss of the best expert. A similar approach was applied
by [18], where the aggregation weights are estimated jointly
for all quantiles; the authors assume the weights are smoothed
functions of the quantile level and they optimize directly the
CRPS instead of point quantile functions.
D. Computational Complexity of the Methodology
The computations of the Kalman ﬁlter are separated in two.
The estimation of the variances in the dynamic setting is costly
(more costly than a single GAM estimation). However, the
updates detailed in Theorem 1 are very efﬁcient and their compu-
tation on the whole data set is lighter than a single GAM estima-
tion. On the other hand, the cost of the incremental ofﬂine GAM
is much bigger because each day, we have a GAM estimation.
Therefore, the cost of the mean adaptive mean forecast is lower
than that of the incremental ofﬂine GAM, and is concentrated at
the calibration of the variances.
Considering our probabilistic forecasts, note that the OGD
and the BOA algorithm are also obtained with a single pass
on the data, therefore they are much lighter than re-estimating
quantile regressions every day.
Numerical values of computational times are given in the
supplementary material [31].
III. EVALUATION
For both mean and probabilistic forecasting tasks, we evaluate
the forecasts qualitatively as well as quantitatively.
A. Mean Forecast
We evaluate through the root-mean-square-error (RMSE) and
the mean absolute error (MAE), deﬁned on a test set T by
RMSE =

|T |

t∈T (yt −ˆyt)2,
(13)
MAE =
|T |

t∈T |yt −ˆyt|.
(14)
Forecasting the mean of the variable of interest is a way to
minimize the quadratic loss, thus the RMSE is natural. The MAE
is known to be more robust to outliers.
We don’t use the mean absolute percentage error (MAPE)
because in the case of the net-load the variable may be close to
0 or even negative, see Section IV-A. However, our data sets are
composed of different time series to predict and to obtain global
evaluation we use relative metrics. We choose to divide by the
same metric applied to the mean.
Formally, we have N time series (yt,i)t∈T ,1≤i≤N and cor-
responding forecasts (ˆyt,i)t∈T ,1≤i≤N. We estimate the means
yi =
|T |

t∈T yt,i. Our aggregate metrics are deﬁned by
nRMSE =
	



N

1≤i≤N

t∈T (yt,i −ˆyt,i)2

t∈T (yt,i −yi)2 ,
(15)
nMAE = 1
N

1≤i≤N

t∈T |yt,i −ˆyt,i|

t∈T |yt,i −yi| .
(16)
Authorized licensed use limited to: Imperial College London. Downloaded on December 02,2025 at 15:08:49 UTC from IEEE Xplore.  Restrictions apply. 

IEEE TRANSACTIONS ON POWER SYSTEMS, VOL. 39, NO. 2, MARCH 2024
Our normalized metrics may be interpreted as unexplained vari-
ations, in the opposite way of the R-squared.
B. Probabilistic Forecast
There are different ways to evaluate quantile forecasts. How-
ever, a necessary condition for the forecast to be meaningful
is reliability, also known as calibration. A quantile forecast is
reliable if the observed frequency of exceedance coincides with
the quantile level. The forecast of a q-quantile is expected to
be empirically higher than the quantity of interest for a fraction
q of the data set and smaller for a fraction 1 −q. Therefore,
we compare the observed frequencies with the quantiles in
reliability diagrams.
Reliable forecasts may then be ranked by sharpness. Numer-
ical evaluation is obtained by the pinball loss ρq deﬁned by (3).
A way to combine the pinball losses at different quantile levels
is to use the continuous ranked probability score (CRPS) [32],
deﬁned equivalently by the two following expressions:
CRPS(F, y) =

 +∞
−∞
(F(x) −1y≤x)2dx
= 2

0
ρq(y, F −1(q))dq,
(17)
where y is the observation and F the predicted cumulative
distribution function. Remark that for any ﬁnite y we have
ρ0(y, F −1(0)) = ρ1(y, F −1(1)) = 0, therefore the CRPS is not
a good performance indicator for the tail estimation.
We use the discrete approximation of the integral in (17). We
have a set of forecasted quantiles ˆyq1, . . . , ˆyql, and we deﬁne the
RPS as the integral of the piecewise linear function interpolating
0, ρq1(y, ˆyq1), . . . ρql(y, ˆyql), 0 at the points 0, q1, . . . ql, 1. This
yields
RPS ((ˆyq1, . . . , ˆyql), y) =
l

i=1
ρqi(y, ˆyqi)(qi+1 −qi−1), (18)
where we deﬁne q0 = 0, ql+1 = 1. Then we simply use the RPS
averaged over time on a test set.
As for mean evaluation, we then aggregate this metric over the
multiple time series (regions in Section IV, cities in Section V).
We divide by the mean absolute error of the mean, which is also
the CRPS of a Dirac distribution centered at the mean:
nRPS = 1
N

1≤i≤N

t∈T RPS ((ˆyt,i,q1, . . . , ˆyt,i,ql), yt,i)

t∈T |yt,i −yi|
.
(19)
IV. REGIONAL NET-LOAD IN GREAT BRITAIN
We ﬁrst study the data set created by [21]. They studied the
data from 2014 to 2018, and we augment the period to range
from 2014 to 2021 [31], allowing us to integrate the unstable
covid period. We refer to [21] and [33] for more details on the
data set. Due to Brexit, the day-ahead electricity price deﬁnition
changed; we decided to remove this explanatory variable from
the data set.
A. Data Presentation and Ofﬂine Model
We are interested in forecasting the electricity net-load, de-
ﬁned as the difference between electricity consumption and
embedded generation (mostly wind and solar production). We
consider the regional data from Great Britain. Great Britain is
divided into 14 regions called Grid Supply Point Groups. The
time granularity is half an hour and we assume a one-day delay
for data availability: each day at midnight we can update the
model with data up to 24 hours before. We display in Fig. 2
the evolution of the net-load in each region, as well as the daily
proﬁles. We observe different behaviors. In particular, region
P (North Scotland) often has a negative net-load, meaning the
consumption is smaller than the embedded production.
For each region independently, the model designed by [21] to
predict quantiles of the net-load is decomposed into three steps.
First, a GAM is ﬁtted to forecast the mean. Second, a set of
quantile regressions are ﬁtted to the GAM residuals (between
2.5% and 97.5%). Third, extreme quantiles are modeled via a
generalized Pareto distribution. The ﬁrst two match our frame-
work introduced in Section II-A; we apply the same additive
model for the mean, then the same quantile regression.
1) We use the formula of the GAM Point of [21], where
electricity prices are removed. The normalized electricity
net-load is modeled by (1) with the following covariates:
a trend, the time of year, the time of day, the day of the
week, school holidays, a moving average of the net-load
with one-day delay, the temperature at maximum popula-
tion density, a moving average of that temperature, solar
radiation combined with the embedded solar generation
capacity, the wind speed combined with the embedded
wind generation capacity, and the precipitation.
Weather variables are weather forecasts. All nonlinear
effects are built using cubic regression splines.
2) For the quantile regressions, we also use the model of [21]:
the GAM residuals are modeled via linear functions of the
GAM prediction, the squared prediction, the product of so-
lar radiation and embedded solar capacity, the wind speed,
the temperature, as well as of the categorical versions of
the time of day and day of the week. For these two latter
variables, we have an additive constant deﬁned for each
value of the categorical variable.
Note that the GAM and the quantile regressions are not trained
per half an hour; they directly incorporate the time of day as a
covariate.
B. Performances of Mean Forecast
We display the evolution of the error in Fig. 3. We improve the
mean forecast performance in almost all regions and all years
using state-space adaptation, considering the nRMSE, see Fig. 4.
We display the aggregate nRMSE and nMAE in Table I for
different methods and different years. When we compare the
dynamic Kalman ﬁlter to the incremental ofﬂine GAM (model
re-trained each day), we reduce the nRMSE by approximately
4% in 2019, 7% in 2020, and 8% in 2021; furthermore, we have
a much lower computational cost per day. Also, we compare
Authorized licensed use limited to: Imperial College London. Downloaded on December 02,2025 at 15:08:49 UTC from IEEE Xplore.  Restrictions apply. 

DE VILMAREST et al.: ADAPTIVE PROBABILISTIC FORECASTING OF ELECTRICITY (NET-)LOAD
Fig. 2.
On the left: evolution of the net-load of the 14 regions. On the right: daily proﬁles. We observe that in region P (North Scotland) the embedded generation
often exceeds the consumption and the daily proﬁle is close to 0. Also, this high level of renewables implies higher weather-driven volatility, and the net-load does
not have a clear yearly proﬁle as in the other regions.
Fig. 3.
Evolution of the standardized error for the ofﬂine model trained on data up to December 31, 2018 (left), the incremental ofﬂine model trained each day
(middle), and the GAM adapted by the Kalman ﬁlter (right).
Fig. 4.
nRMSE for each region in Great Britain. We compare the ofﬂine GAM to the incremental ofﬂine GAM (trained each day on incremental training data),
the Kalman ﬁlter in the static setting (degenerate covariance matrix of the state noise Q = 0), and the Kalman ﬁlter in the dynamic setting. We divide the test set
in three (2019, 2020 and 2021). For the last two years, we compare also with the GAM re-trained each year: GAM y is the GAM trained with the data up to year
y −1 included.
Authorized licensed use limited to: Imperial College London. Downloaded on December 02,2025 at 15:08:49 UTC from IEEE Xplore.  Restrictions apply. 

IEEE TRANSACTIONS ON POWER SYSTEMS, VOL. 39, NO. 2, MARCH 2024
TABLE I
AGGREGATE METRICS ON THE 14 REGIONS FOR THE DIFFERENT MODELS
Fig. 5.
Reliability diagrams for different methods in 2019 and in 2021.
to a benchmark named adaptive probabilistic load forecasting
(APLF) [12] in Section II of our supplementary material [31].
C. Performances of Quantile Forecast
We display reliability diagrams in Fig. 5. We observe that the
ofﬂine model is not reliable, probably because of the biases in the
mean model. The adaptation of the mean model by the Kalman
ﬁlter yields Gaussian quantiles that are much more reliable.
Reliability is then improved further by the adaptation of the
quantile regressions. Similarly to the evolution of the bias of the
model (Fig. 3), we display in Fig. 6 the evolution of the observed
frequency for a speciﬁc quantile. Our adaptive model has a much
better evolution of calibration in time than the ofﬂine version.
We provide in Table II the RPS averaged on the 14 regions
for the different models. We obtain an important gain in nRPS
by adapting the GAM using the Kalman ﬁlter and keeping an
TABLE II
AGGREGATE NRPS ON THE 14 REGIONS FOR THE DIFFERENT MODELS
ofﬂine quantile regression, even for the stable period (the year
2019). Adapting the quantile regression with an OGD has a
very tenuous difference. The step size of this OGD may be
selected by Bernstein Online Aggregation, combining step sizes
Authorized licensed use limited to: Imperial College London. Downloaded on December 02,2025 at 15:08:49 UTC from IEEE Xplore.  Restrictions apply. 

DE VILMAREST et al.: ADAPTIVE PROBABILISTIC FORECASTING OF ELECTRICITY (NET-)LOAD
Fig. 6.
Evolution of the calibration. We select a speciﬁc time of day (midday) and a quantile level 0.8; we display the observed frequency that the net-load exceeds
the quantile forecast. The 95% conﬁdence interval is based on the assumption that the residuals are iid. We see that for the ofﬂine model (GAM then quantile
regression) the conﬁdence interval is not satisﬁed.
in {10i, −8 ≤i ≤0}. This choice of step size does not only per-
form as well as the best expert as suggested in Section II-C4, but
it outperforms this oracle. Combining both levels of adaptation
yields the best performances.
D. Learning the Embedded Capacities
A remarkable advantage of model adaptation is that it reduces
the need for good explanatory variables, which may be difﬁcult
to obtain. In particular, we show that our Kalman GAM can
learn the embedded generation capacities. That is removing
these variables does not signiﬁcantly change the predictions,
contrary to the ofﬂine method.
More precisely, in the GAM and in the quantile regressions
presented in Section IV-A, we remove the solar and wind gener-
ation capacities. We consider solar radiation only instead of its
product with solar capacity. In the nonlinear GAM effect of the
wind speed, we remove the dependence on the embedded wind
capacity. We thus evaluate removing the capacities in the ofﬂine
model, as well as in the Kalman adaptation of the GAM. The
evolution of the capacities may be captured by the adaptation of
the state coefﬁcient.
We evaluate during 2019 to not include the coronavirus cri-
sis. For mean prediction, removing the capacities increases the
nRMSEoftheofﬂinemethodbymorethan10%, whileitreduces
the nRMSE by 0.4% for the Kalman adaptation of the GAM.
For probabilistic prediction, removing the capacities increases
the nRPS by more than 10% for the ofﬂine model and reduces
it by 0.02% for the ofﬂine quantile regression on the residuals
of GAM Kalman.
V. CITY-WIDE LOAD IN THE UNITED STATES
We test our framework also on US data during the coronavirus
crisis [22]. To demonstrate the generality of the approach, we
consider a very different setting. We forecast the standard load
at a daily granularity and with no delay in data availability. Each
day, we can adapt on the data up to the current day in order to
forecast the next.
Fig. 7.
Weights optimized by BOA for the forecast of region A in Great Britain
at quantile level 0.1.
Fig. 8.
Daily electricity load in Boston (left) and Houston (right). The con-
sumption has two annual peaks in summer and winter in Boston, whereas there
is only a summer peak in Houston.
A. Data Presentation and Ofﬂine Model
The data set covers seven U.S. electricity markets, and the
major city for each one: Boston, Chicago, Houston, Kansas
City, Los Angeles, New York City, Philadelphia. Consider the
city-wide loads shown in Fig. 8 and note that load patterns are
different across cities.
We follow the forecasting structure presented in Section II.
1) The generalized additive model we consider has the fol-
lowing form:
Loadt =

i=1
αi1W eekDayt=i + β1BHt + β2WBt
Authorized licensed use limited to: Imperial College London. Downloaded on December 02,2025 at 15:08:49 UTC from IEEE Xplore.  Restrictions apply. 

IEEE TRANSACTIONS ON POWER SYSTEMS, VOL. 39, NO. 2, MARCH 2024
TABLE III
AGGREGATE METRICS IN THE SEVEN US CITIES
TABLE IV
AGGREGATE NRPS IN THE SEVEN US CITIES
+ β3LoadDt + f1(LoadWt) + f2(t)
+ f3(Tempt) + f4(Humt) + f5(Toyt) + εt,
(20)
where εt is a Gaussian i.i.d. noise and for each day t,
r WeekDayt is the day of the week,
r BHt (respectively WBt) is a Boolean denoting if the day
is a bank holiday (respectively in the winter break),
r LoadDt and LoadWt are lags of the load with a one-day
and one-week delays,
r t is the day (variable growing linearly with time),
r Tempt and Humt are the temperature and humidity,
r Toyt is the time of year (variable growing linearly from 0
on January 1st to 1 on December 31st).
The nonlinear effects f1, f2, f3, f4, f5 are built using thin-
plate splines for the ﬁrst four, and cubic cyclic splines for f5.
2) The quantile regression we ﬁt on the residuals uses as
covariates the effects of the GAM, the mean prediction,
and the square of the mean prediction as in Section IV-A:
zt =
⎛
⎝ˆyt, ˆy2
t ,

i=1
αi1W eekDayt=i, β1BHt, β2WBt,
β3LoadDt, f1(LoadWt), f2(t), f3(Tempt),
f4(Humt), f5(Toyt), 1
⎞
⎠
⊤
.
(21)
B. Evaluation
We display the nRMSE and nMAE aggregated on the seven
cities in Table III.The nRPS is displayed in Table IV.
The best models are still the dynamic setting of the Kalman
ﬁlter for mean forecasting and the combination of Kalman
adaptation of GAM with the adaptive quantile regression for the
probabilistic task. However, the performances are signiﬁcantly
different from the results of Section IV. In particular, adapting
the mean model with Kalman and then applying ofﬂine quantile
regression models behaves poorly. It is crucial to adapt the
quantile models.
VI. CONCLUSION
In this article, we applied an adaptive procedure for proba-
bilistic net-load forecasting. The proposed methodology relies
on several steps: an adaptive mean forecast is obtained by the
Kalman ﬁlter, and adaptive quantile regressions are derived from
Online Gradient Descent. To solve the choice of the step size
in the OGD, the algorithm is estimated with multiple learning
rates and the estimates are combined using Bernstein Online
Aggregation.
Evaluation has been performed based on the electricity net-
load in the fourteen regions of Great Britain, and on electricity
demand in seven major cities in the United States. Online
adaptation of the mean model is always important, yielding
reductions in RMSE of around 10% in all case studies compared
to updating the model periodically. Additional adaptation of
quantile regressions added marginal beneﬁts for regional load
forecasting in GB, but substantial beneﬁts for US cities, reducing
the RPS by over 20%. This may be due to the fact that the
coronavirus crisis has had more impact on daily lives in big
cities. Therefore, in our applications, adaptive methods have
more interest for big cities. Indeed, we also observe a more
substantial gain for region C (London) in the GB data set.
A natural extension would be the adaptation of multivariate
probabilistic forecasts. Previous works have considered adaptive
dependency structures, but how models for marginal distribu-
tions and dependency structures could (and should) be adapted
simultaneously has not been studied. Also, we focused on non-
extreme quantiles and adaptive estimation of extreme values is
an exciting and very challenging topic. A special treatment for
extremes may be useful to reﬁne reliability as well as numerical
performance.
REFERENCES
[1] T.Hong,P.Pinson,Y.Wang,R.Weron,D.Yang,andH.Zareipour,“Energy
forecasting: A review and outlook,” IEEE Open Access J. Power Energy,
vol. 7, pp. 376–388, 2020.
[2] T. Hong, P. Pinson, S. Fan, H. Zareipour, A. Troccoli, and R. J. Hyndman,
“Probabilistic energy forecasting: Global energy forecasting competition
2014 and beyond,” Int. J. Forecasting, vol. 32, no. 3, pp. 896–913, 2016.
[3] T.Hong,J.Xie,andJ.Black,“Globalenergyforecastingcompetition2017:
Hierarchical probabilistic load forecasting,” Int. J. Forecasting, vol. 35,
no. 4, pp. 1389–1399, 2019.
[4] U. S. Department of Energy, “Net load forecasting prize,” 2023. [On-
line]. Available: https://www.energy.gov/eere/solar/american-made-net-
load-forecasting-prize
[5] P. IEA, “Covid-19 impact on electricity,” Int. Energy Agency, Paris,
France, Tech. Rep., 2021. [Online]. Available: https://www.iea.org/
reports/covid-19-impact-on-electricity
[6] P. IEA, “World energy outlook 2022,” Int. Energy Agency, Paris, France,
Tech. Rep., 2022. [Online]. Available: https://www.iea.org/reports/world-
energy-outlook-2022
[7] I. Calero, C. A. Cañizares, K. Bhattacharya, and R. Baldick, “Duck-curve
mitigation in power grids with high penetration of PV generation,” IEEE
Trans. Smart Grid, vol. 13, no. 1, pp. 314–329, Jan. 2022.
Authorized licensed use limited to: Imperial College London. Downloaded on December 02,2025 at 15:08:49 UTC from IEEE Xplore.  Restrictions apply. 

DE VILMAREST et al.: ADAPTIVE PROBABILISTIC FORECASTING OF ELECTRICITY (NET-)LOAD
[8] J. W. Messner and P. Pinson, “Online adaptive lasso estimation in vector
autoregressive models for high dimensional wind power forecasting,” Int.
J. Forecasting, vol. 35, no. 4, pp. 1485–1498, 2019.
[9] C. Di Modica, P. Pinson, and S. B. Taieb, “Online forecast reconciliation
in wind power prediction,” Electric Power Syst. Res., vol. 190, 2021,
Art. no. 106637.
[10] D. Obst, J. de Vilmarest, and Y. Goude, “Adaptive methods for short-term
electricity load forecasting during COVID-19 lockdown in France,” IEEE
Trans. Power Syst., vol. 36, no. 5, pp. 4754–4763, Sep. 2021.
[11] J. de Vilmarest and Y. Goude, “State-space models for online post-COVID
electricity load forecasting competition,” IEEE Open Access J. Power
Energy, vol. 9, pp. 192–201, 2022.
[12] V. Álvarez, S. Mazuelas, and J. A. Lozano, “Probabilistic load forecasting
based on adaptive online learning,” IEEE Trans. Power Syst., vol. 36, no. 4,
pp. 3668–3680, Jul. 2021.
[13] P. Gaillard, Y. Goude, and R. Nedellec, “Additive models and robust
aggregation for GEFCOM2014 probabilistic electric load and electricity
price forecasting,” Int. J. Forecasting, vol. 32, no. 3, pp. 1038–1050, 2016.
[14] M. Fasiolo, S. N. Wood, M. Zaffran, R. Nedellec, and Y. Goude, “Fast
calibrated additive quantile regression,” J. Amer. Stat. Assoc., vol. 116,
no. 535, pp. 1402–1412, Mar. 2020.
[15] C. Gilbert, J. Browell, and B. Stephen, “Probabilistic load forecasting for
the low voltage network: Forecast fusion and daily peaks,” Sustain. Energy,
Grids Netw., vol. 34, 2023, Art. no. 100998.
[16] B. Wang, M. Mazhari, and C. Y. Chung, “A novel hybrid method for
short-term probabilistic load forecasting in distribution networks,” IEEE
Trans. Smart Grid, vol. 13, no. 5, pp. 3650–3661, Sep. 2022.
[17] P. Arora, A. Khosravi, B. K. Panigrahi, and P. N. Suganthan, “Remod-
elling state-space prediction with deep neural networks for probabilistic
load forecasting,” IEEE Trans. Emerg. Topics Comput. Intell., vol. 6,
pp. 628–637, 2022.
[18] J. Berrisch and F. Ziel, “CRPS learning,” J. Econometrics, 2021,
Art. no. 105221. [Online]. Available: https://www.sciencedirect.com/
science/article/abs/pii/S0304407621002724
[19] O. Wintenberger, “Optimal learning with bernstein online aggregation,”
Mach. Learn., vol. 106, no. 1, pp. 119–141, 2017.
[20] M. Zaffran, O. Féron, Y. Goude, J. Josse, and A. Dieuleveut, “Adaptive
conformal predictions for time series,” in Proc. Int. Conf. Mach. Learn.,
2022, pp. 25834–25866.
[21] J. Browell and M. Fasiolo, “Probabilistic forecasting of regional net-load
with conditional extremes and gridded NWP,” IEEE Trans. Smart Grid,
vol. 12, no. 6, pp. 5011–5019, Nov. 2021.
[22] G. Ruan et al., “A cross-domain approach to analyzing the short-run
impact of COVID-19 on the us electricity sector,” Joule, vol. 4, no. 11,
pp. 2322–2337, 2020.
[23] S. N. Wood, Generalized additive models: an introduction with R. Boca
Raton, FL, USA: CRC Press, 2017.
[24] R. Koenker and G. Bassett Jr., “Regression quantiles,” Econometrica: J.
Econometric Soc., vol. 46, no. 1, pp. 33–50, 1978.
[25] R. Koenker and K. F. Hallock, “Quantile regression,” J. Econ. Perspectives,
vol. 15, no. 4, pp. 143–156, 2001.
[26] R. E. Kalman and R. S. Bucy, “New results in linear ﬁltering and prediction
theory,” J. Basic Eng., vol. 83, no. 1, pp. 95–108, 1961.
[27] J. de Vilmarest and O. Wintenberger, “Stochastic online optimization using
kalman recursion,” J. Mach. Learn. Res., vol. 22, pp. 223–1, 2021.
[28] J. de Vilmarest, “Viking: State-Space Models Inference by Kalman or
Viking, R package version 1.0.0,” 2022. [Online]. Available: https://
CRAN.R-project.org/package=viking
[29] T. van Erven, W. M. Koolen, and D. van der Hoeven, “MetaGrad:
Adaptation using multiple learning rates in online learning,” J. Mach.
Learn. Res., vol. 22, no. 161, pp. 1–61, 2021. [Online]. Available: http:
//jmlr.org/papers/v22/20-1444.html
[30] P. Gaillard, Y. Goude, L. Plagne, T. Dubois, and B. Thieurmel, “Opera:
Online Prediction by Expert Aggregation R package version 1.2.0,” 2021.
[Online]. Available: https://CRAN.R-project.org/package=opera
[31] J. de Vilmarest, J. Browell, M. Fasiolo, Y. Goude, and O. Wintenberger,
“Supplementary materials for “adaptive probabilistic forecasting of elec-
tricity (Net-)Load”,” Dec. 2022. [Online]. Available: https://doi.org/10.
5281/zenodo.7849665
[32] T. Gneiting and A. E. Raftery, “Strictly proper scoring rules, prediction,
and estimation,” J. Amer. Stat. Assoc., vol. 102, no. 477, pp. 359–378,
2007.
[33] J. Browell, “Supplementary material for “probabilistic forecasting of
regional net-load with conditional extremes and gridded NWP”,” 2021.
[Online]. Available: https://doi.org/10.5281/zenodo.5031704
Joseph de Vilmarest received the graduation degree
from École Normale Supérieure, Paris, France, in
2019 and the Ph.D. degree in statistics from Sorbonne
Université, Paris, in 2022. He founded Viking Conseil
to develop adaptive methods for time series forecast-
ing, and to apply them in companies that depend
highly on forecasting, especially in the energy sector.
Jethro Browell (Senior Member, IEEE) received the
Ph.D. degree in wind energy systems from the Uni-
versity of Strathclyde, Glasgow, Scotland, in 2015.
He is currently a Senior Lecturer with the School of
Mathematics and Statistics, University of Glasgow,
Glasgow,Scotland.Hisresearchinterestsincludedata
analytics and forecasting with a focus on applications
in the energy sector. Dr. Browell is also the Chair
of IEEE Power & Energy Society Working Group
on Energy Forecasting and Analytics, an Editor of
Sustainable Energy, Grids and Networks, and an
Associate Editor for IEEE ACCESS.
Matteo Fasiolo received the Ph.D. degree in statistics
from the University of Bath, Bath, U.K., in 2016.
He is currently a Senior Lecturer with the Institute
for Statistical Science, University of Bristol, Bristol,
U.K., where he works on developing non-parametric
regression modelling methodology, with a particular
focus on energy-related applications.
Yannig Goude received the Ph.D. degree in statistics
and probability from the Université Paris-Sud Orsay,
Orsay, France, in 2008. He is currently a Senior
Researcher of data science with EDF R&D and an
Associate Professor with Université Paris-Sud Orsay.
His research interests include time series forecast-
ing for electricity markets, time series analysis, non-
parametric models, and aggregation of experts.
Olivier Wintenberger received the Ph.D. degree
from Panthéon-Sorbonne University, Paris, France,
in 2007. He is currently a Professor with Sorbonne
University, Paris, and WPI Fellow with the University
of Vienna, Vienna, Austria. His research interests in-
clude extreme value analysis, time series forecasting,
and online learning. He is an Associate Editor for the
journals Bernoulli, Extremes, and Stochastic Models.
Authorized licensed use limited to: Imperial College London. Downloaded on December 02,2025 at 15:08:49 UTC from IEEE Xplore.  Restrictions apply. 