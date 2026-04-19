International Journal of Forecasting 40 (2024) 1449–1466
Contents lists available at ScienceDirect
International Journal of Forecasting
journal homepage: www.elsevier.com/locate/ijforecast
CRPS-based online learning for nonlinear probabilistic forecast
combination
Dennis van der Meer a, Pierre Pinson b,c,d, Simon Camal a,∗,
Georges Kariniotakis a
a Mines Paris, PSL University, Centre for Processes, Renewable Energy and Energy Systems (PERSEE), 06904, Sophia Antipolis, France
b Imperial College London, Dyson School of Design Engineering, South Kensington Campus, London, SW7 2AZ, United Kingdom
c Technical University of Denmark, Department of Technology, Management and Economics, Akademivej 325, Kgs.
Lyngby, 2800, Denmark
d Halfspace, Borgergade 28, Copenhagen, 1300, Denmark
a r t i c l e
i n f o
Keywords:
Beta-transform
Linear opinion pool
Continuous ranked probability score
Post-processing
Online convex optimization
a b s t r a c t
Forecast combination improves upon the component forecasts. Most often, combina-
tion approaches are restricted to the linear setting only. However, theory shows that
if the component forecasts are neutrally dispersed—a requirement for probabilistic
calibration—linear forecast combination will only increase dispersion and thus lead to
miscalibration. Furthermore, the accuracy of the component forecasts may vary over
time and the combination weights should vary accordingly, necessitating updates as
time progresses. In this paper, we develop an online version of the beta-transformed
linear pool, which theoretically can transform the probabilistic forecasts such that they
are neutrally dispersed. We show that, in the case of stationary synthetic time series,
the performance of the developed method converges to that of the optimal combination
in hindsight. Moreover, in the case of nonstationary real-world time series from a wind
farm in mid-west France, the developed model outperforms the optimal combination in
hindsight.
© 2023 International Institute of Forecasters. Published by Elsevier B.V. All rights reserved.
1. Introduction
The combination of probability distributions issued by
experts has a long history that can be traced back to at
least Stone (1961). The linear opinion pool, as labeled
by Stone (1961), is the convex combination of component
probability distributions. In probabilistic forecasting, fore-
casters aim to maximize the sharpness of the forecasts,
subject to calibration (Gneiting, Balabdaoui, & Raftery,
2007). Calibration refers to the agreement between the
forecasts and observed probabilities. For instance, when
a forecaster predicts daily overcast conditions with 80%
probability, cloudiness should actually occur on 80 of
the 100 days with such conditions. Ensemble forecasts
∗Corresponding author.
E-mail address:
simon.camal@minesparis.psl.eu (S. Camal).
from numerical weather prediction (NWP) models tend to
exhibit underdispersion, which implies that the forecasts
are overconfident (Wilks, 2018). Conversely, probabilistic
forecasts can be overdispersed, which means that the
forecaster is underconfident and issues forecasts with too
much variance. These types of miscalibration can neg-
atively affect decision-making based on such forecasts,
and care needs to be taken to ensure proper calibra-
tion. On this point, Hora (2004) notes that ‘‘there are
theoretical reasons for questioning the use of linear com-
binations of experts’ probabilities. This concern stems
from understanding that well-calibrated experts cannot
be combined without introducing miscalibration’’. Nev-
ertheless, linear forecast combination is commonly used,
especially in combination with batch learning. Following
the above, it is important to note that the context in
this manuscript is different from that of deterministic,
https://doi.org/10.1016/j.ijforecast.2023.12.005
0169-2070/© 2023 International Institute of Forecasters. Published by Elsevier B.V. All rights reserved.

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
or point, forecast combination. In the context of the lat-
ter, the observation that the simple average of experts’
forecasts tends to be more accurate than the optimally
weighted combination is referred to as the ‘‘forecast com-
bination puzzle’’ and is attributed to the combination
variance that is affected by weight estimation (Claeskens,
Magnus, Vasnev, & Wang, 2016).
1.1. Batch learning
Batch learning requires a separate data set that accu-
rately represents the test set to optimize the combination
weights. Consequently, the optimally weighted forecast
combination does not necessarily outperform the best
component forecast if the separate data sets are not com-
parable (e.g., Hall & Mitchell, 2007). Nevertheless, there
is value to optimizing the weights, as shown by Mar-
tin, Loaiza-Maya, Maneesoonthorn, Frazier, and Ramírez-
Hassan (2022), who consistently outperform the naive
forecast combination with equal weights. A notable exam-
ple frequently applied to NWP forecasts is Bayesian model
averaging (BMA), where ensemble members are dressed
with a probability density function (PDF) and weights
optimized using the logarithmic score (Raftery, Gneit-
ing, Balabdaoui, & Polakowski, 2005). In their application,
BMA is an efficient method to calibrate the ensemble
because the ensemble under investigation is underdis-
persed. To reduce overdispersion, Bracale, Carpinelli, and
De Falco (2017) minimize a weighted sum of the con-
tinuous ranked probability score (CRPS) and deviation
from calibration. Similarly, Jose, Grushka-Cockayne, and
Lichtendahl (2014) propose the exterior-trimmed opinion
pool heuristic method that effectively removes expert
forecasts with low and high means or cumulative distri-
bution function (CDF) values. Additionally, they introduce
the interior-trimmed opinion pool that removes expert
forecasts with moderate means or CDF values to increase
the dispersion in case the experts are overconfident.
Averaging probabilities, which is also referred to as
vertical averaging, can be shown to be at least as accurate
in terms of the CRPS as the average CRPS of experts (Lich-
tendahl, Grushka-Cockayne, & Winkler, 2013). Besides av-
eraging probabilities, it is also possible to average quan-
tiles, which can be referred to as horizontal averaging. In
their comparative study, Lichtendahl et al. (2013) show
that the average quantile forecast is always sharper than
the average probability forecast and that the former is
therefore better suited in cases where the component
forecasts are well calibrated. In the area of load forecast-
ing, Wang et al. (2019) linearly combine quantiles and
show that their approach does not always outperform the
component models, although they do not evaluate fore-
cast calibration. In a similar fashion, Bracale, Carpinelli,
and De Falco (2019) minimize the pinball loss to optimally
combine quantile forecasts of photovoltaic (PV) power
and improve accuracy. However, similar to Wang et al.
(2019), the authors do not evaluate the calibration of
the component or combined forecasts. Taylor and Taylor
(2023) forecast cumulative Covid-19 mortality and face
interesting challenges such as a lack of historical forecasts,
and therefore use trimming techniques as well as the sim-
ple average, the median forecast, and weights based on
the inverse quantile score to find that the latter performs
at least as well as the simple average.
Besides trimming and averaging quantiles, one can
apply nonlinear transformations to the linear opinion pool
to improve probabilistic calibration. Gneiting and Ranjan
(2013) describe two such methods, namely the spread-
adjusted linear pool (SLP) and beta-transformed linear
pool (BLP). The SLP adjusts the spread of the compo-
nent forecasts and can consequently mitigate—to a cer-
tain extent—overdispersion caused by linearly combining
calibrated forecasts. Möller and Groß (2020) apply the
SLP to post-processed temperature forecasts issued by
the European Center for Medium-range Weather Fore-
casts (ECMWF) ensemble prediction system and show
that it effectively lowers the CRPS compared to the com-
ponent forecasts. However, a limitation of the SLP is that
the method fails to be flexibly dispersive, which is to
say that it is unable to sufficiently adjust the spread to
produce neutrally dispersed forecasts, especially when
the component forecasts are neutrally dispersed or un-
derdispersed (Gneiting & Ranjan, 2013). In contrast, the
BLP is exchangeably flexibly dispersive, and as such is
able to transform the predictive distributions such that
the second moment of the resulting probability integral
transform (PIT) can attain any value in the open interval
(0, 1/4), with 1/12 indicating neutral dispersion (Gneit-
ing & Ranjan, 2013). Van der Meer, Camal, and Karin-
iotakis (2022) apply both the SLP and BLP to combine
PV power forecasts and show that the SLP outperforms
the BLP. This is caused by a lack of representativeness
of the training data that affects parameter learning more
in the case of the BLP than in the case of the SLP. Fi-
nally, Bassetti, Casarin, and Ravazzolo (2018) develop a
Bayesian nonparametric approach that extends the para-
metric class of calibration functions, i.e., the BLP, using a
possibly unknown number of beta mixtures, which can be
interpreted as a mixture of local combination models.
1.2. Online learning
Nonstationary data, extensive training times for com-
plex machine learning models, and data storage present
challenges in batch learning. To illustrate this further,
consider batch gradient descent. In this method, the ob-
jective is to update the model parameter θ by calculating
the loss gradient ∇L(f (xi, θ), yi) across a training set in-
dexed by i ∈1, . . . , N, which consists of input–output
pairs (xi, yi). The parameter update, after processing a
batch containing N data points, is computed as follows:
θnew = θold −η · 1
N
∑N
i=1 ∇L(f (xi, θold), yi), with η repre-
senting the learning rate. The aforementioned expression
highlights that batch learning necessitates the storage of
all N data points and the consecutive computation of the
gradient N times. Unlike batch learning, online learning
is computationally less expensive and does not require
storing historical data. Moreover, it integrates real-time
data and therefore adapts to trends and seasonalities.
Returning to the example of gradient descent, the on-
line version instead updates θ as soon as a new input–
output pair (xi, yi) becomes available as θnew = θold −η ·
∇L(f (xi, θold), yi). In the context of forecast combination,

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
such real-time adaptation would be relevant when one
of the experts is better at forecasting in a declining mar-
ket rather than a rising one (Winkler, Grushka-Cockayne,
Lichtendahl, & Jose, 2019).
Recent years have seen a stark increase in the number
of publications on online forecast combination. For in-
stance, Thorey, Mallet, and Baudin (2017) consider online
ridge regression and exponentiated gradients to update
weights based on CRPS minimization so as to linearly
combine the ensemble members into a CDF. In a subse-
quent study, Thorey, Chaussin, and Mallet (2018) extend
their research by applying the ML-Poly algorithm intro-
duced by Gaillard, Stoltz, and van Erven (2014) to linearly
combine ensemble members from ECMWF and Metéo
France. This extension demonstrated enhanced perfor-
mance compared to using raw ensembles, although it
should be noted that their forecasts still exhibited un-
derdispersion. In the aforementioned studies, the authors
show that the regret of their algorithm is logarithmic
as a function of time. It is important to note that in
the field of online learning, here used interchangeably
with online convex optimization (OCO), and of which
forecast combination is a subset, the primary objective is
to minimize regret rather than loss. Regret is defined as
the difference in performance between the online player
and the optimal fixed strategy in hindsight (Hazan, 2021).
Instead of combining ensemble members, V’yugin and
Trunov (2019) combine predictive CDFs using Vovk’s ag-
gregating algorithm and show that their method offers a
time-independent upper bound on regret. Zamo, Bel, and
Mestre (2021) modify the objective function to comprise
the CRPS and the Jolliffe–Primo test for rank histogram
flatness to improve calibration of their linearly combined
forecasts. The aforementioned studies concern linear fore-
cast combination, which, as previously discussed, leads to
overdispersion.
Regarding quantile forecasting, Berrisch and Ziel (2021)
observe potential differences in accuracy across various
segments of the experts’ predictive distributions. To ad-
dress this, they propose a linear pointwise combination
algorithm that aggregates quantiles based on CRPS mini-
mization. Their research reveals that this approach yields
a more uniformly distributed loss throughout the predic-
tive distribution. In a related study, Krannichfeldt, Wang,
Zufferey, and Hug (2022) adapt the pinball loss to remain
‘‘passive’’ when the loss is below a threshold but ‘‘aggre-
sively’’ adjusts the weights when a new sample causes the
loss to exceed the threshold. This results in an improved
CRPS and pinball loss, although their method appears
to be outperformed by benchmark models in terms of
calibration.
1.3. Contributions
In some applicative fields like wind power forecasting,
the value of forecast combination was recognized already
20 years ago, with the first operational models based on
spot forecast combination set-up by the Spanish transmis-
sion system operator (see, e.g., Sánchez, 2008). Today, this
is considered a mainstream approach in business prac-
tices in renewable energy forecasting. But when it comes
to probabilistic forecasting, several research challenges
remain. As outlined in the previous sections, the literature
on probabilistic forecast combination—both batch and
online—is expanding rapidly, as expected based on the
popularity of forecasting competitions and developments
in machine learning and expert forecasting (Winkler et al.,
2019). In this work, we extend the beta-transformed
linear pool proposed by Gneiting and Ranjan (2013) to
the online setting to mitigate miscalibration caused by
linear forecast combination. The beta-transformed linear
pool is exchangeably flexibly dispersive, meaning that
there exists a set of parameters that ensures that the
combined forecasts are probabilistically calibrated while
the component forecasts are exchangeable (Gneiting &
Ranjan, 2013). The method that we develop is able to
adapt in nonstationary contexts and is integrated into the
online Newton step (ONS) algorithm that moves in the
direction of an approximate Hessian and the gradient,
the former of which is additionally used to project the
weights back onto the simplex. The CRPS is employed to
guide the learning process, as it is exponentially concave,
an attribute of the CRPS that permits logarithmic regret
when used as a cost function in the ONS algorithm. To
summarize, we contribute to the state of the art of online
probabilistic forecast combination in the following ways:
• We develop a nonlinear and online method to com-
bine probabilistic forecasts that is exchangeably flex-
ibly dispersive.
• The proposed method relies on the CRPS, an expo-
nentially concave function, in conjunction with the
ONS algorithm. This combination permits logarith-
mic regret and accommodates the most comprehen-
sive scenario, wherein experts provide full predictive
distributions.
• We demonstrate the effectiveness of our method
through two simulation studies from the literature
and a real-world wind power forecasting study, and
make the code publicly available to facilitate its up-
take.
The remainder of this work is organized as follows.
Section 2 describes the probabilistic forecast combination
framework, i.e., the linear and beta-transformed linear
pool, as well as the CRPS that is used to guide the learning
process. Next, we introduce online convex optimization,
develop the necessary mathematics, and introduce the
ONS algorithm in Section 3. We present the results of
two simulation studies and a real-world wind power case
study in Section 4 and conclude this work in Section 5.
2. Probabilistic forecast combination framework
In this section, we provide a comprehensive explana-
tion of forecast combination. Initially, we delve into the
concept of linear combination, followed by an exploration
of how the beta distribution is employed to transform
this linear combination. Throughout the remainder of this
work, we consider a total of m experts indexed by j and
denote a predictive distribution by ˆF. Furthermore, we use
lower-case normal font for realizations of scalar variables
and upper case for scalar variables, lower-case bold font
for vectors, and upper-case bold font for matrices.

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
2.1. Classical linear combination
The linear opinion pool is defined as follows (e.g.,
Gneiting & Ranjan, 2013):
ˆF(y) =
m
∑
j=1
wj ˆFj(y).
(1)
We adopt the abbreviations of Gneiting and Ranjan (2013)
in this work. Consequently, in case of equal weights,
i.e., wj = 1/m, we refer to (1) as the ordinary linear pool
(OLP), which was labeled the linear opinion pool by Stone
(1961). In contrast, when the weights are optimized with
respect to a score, we refer to (1) as the traditional linear
pool (TLP). The main motivation to combine forecasts
is to harness the wisdom of the crowd, which is an
effective method in point forecasting due to the exper-
tise and diversity of the crowd (Soll, Mannes, & Larrick,
2012). Instead, linearly combining diverse probabilistic
forecasts further increases the dispersion, which may lead
to calibration issues (Hora, 2004).
2.1.1. Beta-transformed linear pool
To mitigate miscalibration caused by linear combi-
nation, Gneiting and Ranjan (2013) propose a nonlinear
transformation of the linear pool (1) by means of the
beta CDF. The beta-transformed linear pool (BLP) forecast
encapsulates (1) and is defined as follows (Gneiting &
Ranjan, 2013):
ˆFa,b(y) = Ia,b
⎛
⎝
m
∑
j=1
wj ˆFj(y)
⎞
⎠,
(2)
where Ia,b is the regularized incomplete beta function
with shape parameters a and b. Recall that BLP is able
to transform the predictive distributions such that the
second moment of the resulting PIT can attain any value
in the open interval (0, 1/4) with fixed weights and a > 0
and b > 0 (Gneiting & Ranjan, 2013). Note that when
a = b = 1, (2) equals (1). Throughout the remainder of
this work, we abbreviate the linear opinion pool as z =
∑m
j=1 wj ˆFj(y). The regularized incomplete beta function,
also known as the beta CDF, is defined as
Ia,b(z) = Ba,b(z)
Ba,b
,
(3)
where
Ba,b(z) =
∫z
0
ua−1 (1 −u)b−1 du
= Γ (a)za
2 ˜F 1(a, 1 −b; a + 1; z),
(4)
Ba,b =
∫1
0
ua−1 (1 −u)b−1 du
= Γ (a)Γ (b)
Γ (a + b) .
(5)
In the above equations, Ba,b(z) is the incomplete beta
function, Ba,b is the complete beta function, Γ
is the
gamma function, and 2 ˜F 1 is a regularized hypergeometric
function. These identities are useful to derive the gradient
in Section 3.1.
2.2. CRPS-based learning
Strictly proper scoring rules minimize in expectation
under the true model. These rules are therefore recom-
mended for forecast evaluation because they encourage
truth telling from a forecaster (e.g., Gneiting & Raftery,
2007). Conversely, a forecaster may minimize such a rule
to identify the true model in the learning stage. The CRPS
is a strictly proper scoring rule that evaluates the entire
predictive distribution and therefore permits the most
general setting where experts issue complete predictive
distributions. Moreover, the CRPS is exponentially con-
cave in the case of bounded support, which implies that
the score is strongly convex in the direction of the gradi-
ent but not necessarily elsewhere (Hazan, 2021; Korotin,
V’yugin, & Burnaev, 2021). Exponential concavity is an
important attribute of the CRPS because—in combination
with particular online learning methods—it allows for ac-
celerated learning, as clarified in Section 3.2. The CRPS is
defined as follows:
CRPS(ˆFt, yt) =
∫1
0
(
ˆFt (x) −1{x ≥yt}
)2
dx,
(6)
where 1 denotes the indicator function that is 1 when the
condition inside the curly brackets is true. The limits of
the integral are taken to be 0 and 1, respectively, since
the data are normalized. Note that (6) is an instanta-
neous value and that these are averaged over a test set
to rank competing forecasts. Similarly, one can minimize
the expected value of (6) to learn the true parameters
of a forecast model or, as in our case, learn the optimal
combination parameters. Henceforth, we omit the time
index to simplify the notation.
2.3. Distribution-oriented forecast verification
While the CRPS can be used to rank competing fore-
casts, it does not reveal specific types of miscalibration.
The PIT is a common verification tool to visualize the
calibration of probabilistic forecasts and can be computed
as Z
=
ˆF(Y), where ˆF and Y are series of predictive
distributions and observations, respectively. ˆF is said to
be probabilistically calibrated if Y ∼ˆF, which implies that
Z is a standard uniform distribution (Rosenblatt, 1952).
Consequently, the variance of Z is constrained to the
closed interval [0, 1/4] and the distribution is flat when
var(Z) = 1/12.
Nevertheless, a PIT histogram can deviate from flatness
due to randomness induced by a test set of limited length.
To account for randomness, Bröcker and Smith (2007)
propose consistency bands that represent the maximum
estimation uncertainty that can be expected for a test set
of specific length. In other words, as long as the deviation
from flatness remains within the consistency bands, one
cannot reject the hypothesis that the probabilistic fore-
casts are reliable. Herein, we use dotted lines to visualize
the consistency bands.

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
3. Online convex optimization
Online convex optimization (OCO) can be seen as a
game where a player repeatedly makes decisions over
time. At time step t, the player chooses from the n-
dimensional convex decision set xt
⊆
Rn. After the
player’s decision, a convex cost function ft is revealed and
the player incurs a loss ft(xt). The performance of OCO
algorithms is measured in terms of regret, which is de-
fined as the difference in performance between the online
player and the optimal fixed strategy in hindsight. In the
context of online forecast combination, the forecast ag-
gregator is the online player who adapts the aggregation
function based on the most recent performance and who
regrets—in hindsight—not choosing the fixed aggregation
function that optimizes performance. The reason for using
regret is that OCO permits an adversary who can choose
different cost functions as the game progresses. In this
framework, OCO is concerned with algorithms that realize
sublinear regret with increasing test length, implying
that, on average, the algorithms perform as well as the
best strategy in hindsight. For an in-depth treatment of
OCO and its various algorithms, the reader is referred
to Orabona (2019) and Hazan (2021).
Although there are settings in OCO such as Multi-
Armed Bandit, where a player does not have access to the
loss gradient, we focus on gradient-based online learning.
One advantage of gradient-based online learning is that it
generally permits tighter bounds on regret. The properties
of the CRPS described in Section 2.2 make it an attractive
scoring rule in an online learning context as well as for
evaluating forecasts. What follows is the derivation of the
CRPS gradient with respect to the shape parameters of the
beta CDF and the linear combination weights. Afterwards,
we introduce the OCO algorithm that we employ.
3.1. Derivation of the CRPS gradient
Recall that we consider m experts indexed by j. The
vector of weights is subsequently defined as w = (w1, . . . ,
wm)⊤, and the vector of parameters is defined as x =
(
a, b, w⊤)⊤. The gradient of the CRPS with respect to x
is then defined as follows:
∇CRPS(ˆFa,b, y)
=
(∂CRPS
∂a
, ∂CRPS
∂b
, ∂CRPS
∂w1
, . . . , ∂CRPS
∂wm
)⊤
.
(7)
3.1.1. Partial derivative with respect to the weights
In deriving the partial derivatives, we first consider
the linear combination of the component forecasts as it
is encapsulated in the beta-transformed linear pool. This
is relevant because the linear pool can act as a benchmark
for the beta-transformed linear pool.
Linear. The combination weights are contained within
the integral; cf. (6). We therefore use the Leibniz integral
rule for differentiation under the integral sign to derive
the partial derivatives with respect to weights wj, since
they are not integration variables. To improve the numer-
ical properties of the learning process, Pinson and Madsen
(2012) propose a logit transform ˜wj of wj, such that
˜wj = ln
(
wj
1 −wj
)
,
(8)
which constrains wj to the open interval (0, 1). Using the
chain rule, the partial derivative of the CRPS with respect
to wj becomes
∂CRPS
∂wj
= ∂CRPS
∂˜wj
∂˜wj
∂w ,
which means that
∂CRPS
∂˜wj
= ∂CRPS
∂wj
∂wj
∂˜wj
.
Notice that
∂˜wj
∂wj =
wj−w2
j
. We have
∂CRPS
∂wj
=
∫1
0
(
ˆFTLP (x) −1{x ≥y}
) ∂ˆFTLP (x)
∂wj
dx
= 2
∫1
0
ˆFj (x)
(
ˆFTLP (x) −1{x ≥y}
)
dx,
(9)
and therefore
∂CRPS
∂˜wj
= 2 (
wj −w2
j
) ∫1
0
ˆFj (x)
(
ˆFTLP (x) −1{x ≥y}
)
dx.
(10)
Nonlinear. The partial derivative in the nonlinear setting
is similar to (9), except that ˆFTLP (x) is replaced with
ˆFa,b (z). Notice that z appears in the upper limit of the
integral in (4), and we therefore require Leibniz’s integral
rule. We defer the derivation to Appendix A.1 and instead
present the final result below:
∂CRPS
∂˜wj
=
2 (
wj −w2
j
)
Ba,b
×
∫1
0
(
ˆFa,b (z) −1{x ≥y}
)
za−1 (1 −z)b−1 ˆFj(x)dx.
(11)
3.1.2. Partial derivative with respect to shape parameter a
Similarly, shape parameter a is not an integration vari-
able, and we therefore apply the Leibniz integral rule
again. Important to note here is that both a and b are
strictly positive. Similar to weight wj, we apply a change
of variable ˜a =
ln(a) to improve the stability of the
algorithm (Pinson & Madsen, 2012). The partial derivative
with respect to shape parameter a is presented below,
whereas the derivation is deferred to Appendix A.2:
∂CRPS
∂˜a
= 2a
∫1
0
(
ˆFa,b (z) −1{x ≥y}
)
×
(
ˆFa,b(z) (ln(z) −ψ(a) + ψ(a + b))
−Γ (a)Γ (a + b)
Γ (b)
za
3 ˜F 2(a, a, 1 −b; a + 1, a + 1; z)
)
dx,
(12)
where ψ is the digamma function.

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
3.1.3. Partial derivative with respect to shape parameter b
A similar approach to that in the previous section can
be used to derive ∂CRPS/∂b. Furthermore, an identical
change of variable ˜b =
ln(b) is used to improve the
stability of the algorithm. Eq. (13) presents the result,
while the derivation is deferred to Appendix A.3.
∂CRPS
∂˜b
= 2b
∫1
0
(
ˆFa,b (z) −1{x ≥y}
)
×
(Γ (a + b)Γ (b)
Γ (a)
(1 −z)b
3 ˜F 2(b, b, 1 −a; b + 1, b + 1; 1 −z)
+ ˆFb,a(1 −z) (ψ(b) −ψ(a + b) −ln(1 −z))
)
dx.
(13)
3.2. Online Newton step
Several algorithms have been proposed in the field of
online convex optimization that are analogues to well-
known offline algorithms (see, e.g., Hazan, 2021, for an
overview). Online gradient descent (OGD), as described
in Section 1.2, is the analogue to gradient descent, in
which the algorithm moves in the direction of the gra-
dient at every iteration and is therefore a first-order al-
gorithm (Zinkevich, 2003). Despite its simplicity, OGD
is linear in time and achieves sublinear regret in the
worst case and logarithmic regret for strongly convex loss
functions (Hazan, 2021).
One difficulty associated with OGD is the need for
precise tuning of the step size or learning rate to achieve
the desired regret. Additionally, it may be that the re-
quirement of strong convexity is too stringent in practice.
In such instances, it is possible to utilize exp-concave loss
functions that are strongly convex in the direction of the
gradient but not necessarily elsewhere (Hazan, 2021). The
online Newton step (ONS) is an algorithm that guaran-
tees logarithmic regret for exp-concave loss functions and
therefore does not require an adaptive step size (Hazan,
Agarwal, & Kale, 2007). ONS is analogues to the Newton–
Raphson method in that it moves in the direction of
an approximated Hessian and the gradient, i.e., A−1
t ∇t,
yet is based only on first-order information. The oper-
ation A−1
t ∇t can potentially yield a set of weights that
lie beyond the boundaries of the unit simplex. To avoid
constraints, Pinson and Madsen (2012) parameterize the
transition probabilities on the m-dimensional unit sphere.
Instead, we perform a projection onto the unit simplex
with a norm induced by At rather than the Euclidean
norm (Hazan et al., 2007). More details on this projection
are given below.
Recall that we consider m experts, resulting in a weight
vector w ∈Rm and a parameter vector x ∈Rn that
includes the shape parameters of the beta distribution (3).
Algorithm 1 summarizes the ONS algorithm in detail. Note
that γ is a scaling factor of the starting point of the update
step, i.e., A−1
0 , whereas η represents. The step size remains
constant for two reasons: (i) the ONS guarantees logarith-
mic regret for exp-concave losses, and (ii) maintaining a
fixed step size allows the algorithm to adapt effectively
in nonstationary environments, whereas reducing step
sizes could hinder this adaptability. To avoid inverting a
potentially large matrix, Hazan et al. (2007) recommend
Algorithm 1: Online Newton step (Hazan, 2021;
Wintenberger, 2021).
Data: Convex set K, T, x1 ∈K ⊆Rn, parameters
γ , η > 0, A0 = 1/γ 2In, A−1
0
= γ 2In
for t ←1 to T do
Play xt and observe cost ft(xt);
At = At−1 + ∇t∇⊤
t ;
A−1
t
= A−1
t−1 −
A−1
t−1∇t∇⊤
t A−1
t−1
1+∇⊤
t A−1
t−1∇t ;
Newton step: yt+1 = xt −η 1
γ A−1
t ∇t;
vt+1 ∈Rm ⊂yt+1 ∈Rn;
Projection (weights only) with weighted norm
∥· ∥Dt : wt+1 = 1
2 argminw∈K ∥w −vt+1∥2
Dt
end
a recursion step for A−1
t
using the Sherman–Morrisson
formula (Sherman & Morrison, 1950):
A−1
t
= (
At + ∇t∇⊤
t
)−1
= A−1
t−1 −
A−1
t−1∇t∇⊤
t A−1
t−1
1 + ∇⊤
t A−1
t−1∇t
.
(14)
In this work, the weights should sum to 1. Although
not a strict requirement, we additionally ensure that the
weights are positive. Whereas OGD uses a Euclidean pro-
jection step, the ONS requires a generalized projection
onto the unit simplex Λ that is in the vector norm induced
by At, which is a convex program (Hazan et al., 2007).
Nonetheless, the presence of off-diagonal elements within
At introduces complexity to the optimization problem.
Therefore, it is more advantageous to approximate it by
employing Dt = diag (At). Consequently, the generalized
projection onto Λ breaks down into a series of indepen-
dent scalar minimization problems for each component
of w. These can be resolved by solving a piecewise linear
equation through sorting, as described by Held, Wolfe,
and Crowder (1974). Specifically, we want to solve the fol-
lowing convex optimization problem (Hazan et al., 2007):
wt+1 = 1
arg min
w∈K
∥w −vt+1∥2
Dt ,
(15)
where vt+1 ∈Rm comprises only the weights, and ∥vt+1−
w∥2
Dt := (w −vt+1)⊤Dt (w −vt+1). The piecewise linear
equation can be derived by solving a system of linear
equations obtained from the Karush–Kuhn–Tucker (KKT)
optimality conditions (see Appendix B), which results in
the weighted soft-threshold (Wintenberger, 2021):
w∗= D−1
t
SoftThreshold (
Dtvt+1, ν∗)
.
(16)
Algorithm 2 summarizes the aforementioned steps. Note
that in our application, the convex set K ⊆Rn is un-
bounded and open, since the shape parameters a and b are
strictly larger than 0. We therefore forego a regret analysis
and instead empirically show the efficacy of the proposed
method.

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
Algorithm 2: Simplex projection with weighted norm ∥· ∥Dt (Wintenberger, 2021).
Data: w ∈Rm and Dt = diag (At)
if w ∈Λ then
Return w;
else
Sort (dtvt+1)1 ≥. . . ≥(dtvt+1)m;
Find d0 = max
{
1 ≤j ≤m; (dtvt+1)i −
∑d0
i=1 d−1
t,i
(∑d0
i=1 vt+1,i −1
)}
;
Define ν∗=
∑d0
i=1 d−1
t,i
(∑d0
i=1 vt+1,i −1
)
;
Return w∗= D−1
t
SoftThreshold (Dtvt+1, ν∗)
end
4. Results
We illustrate the efficacy of the proposed method
through three case studies. The first two case studies are
based on synthetic data sets adapted from relevant stud-
ies, a time-invariant (Section 4.2.1) and a time-varying
process (Section 4.2.2). The synthetic case studies enable
us to assess the performance of the proposed method
within a controlled environment. To facilitate uptake of
the proposed method, we made the code to generate
the synthetic data and run the experiments available
on GitLab.1 Finally, we apply the proposed method to a
real-world wind power forecast case study in Section 4.3.
4.1. Benchmarks
In order to evaluate the effectiveness of the proposed
online combination method, referred to as BLP, we in-
corporate several benchmark models. The most obvious
benchmarks are the component models that BLP is de-
signed to combine, and these will be elaborated upon in
the respective sections. Furthermore, there are three com-
bination models characterized by fixed weights, meaning
that their weights remain constant throughout the entire
duration. These combination models are the OLP with
equal weights, the TLP* (cf. (1)), and the BLP* (cf. (2)). Note
that the asterisk indicates that the model parameters are
optimized in hindsight, meaning that on average they are
optimal for the testing data set. Finally, we include two
benchmarks based on online learning: (i) the TLP, and (ii)
the CRPS learning approach by Berrisch and Ziel (2021),
available on CRAN,2 with all options set to the default
values and which we refer to as the PFC. Note that the
parameters required by the online learning methods are
updated at every time step.
4.2. Synthetic data
For both synthetic case studies, we initialize the
weights as 1/m and the shape parameters a = b = 1,
which is effectively the ordinary linear pool (OLP). In total,
we run 150 simulations for 11,500 time steps and report
1 https://git.persee.mines-paristech.fr/dennis.van_der_meer/online-
probabilistic-forecast-combination
2 https://cran.r-project.org/web/packages/profoc/index.html
the median as well as the 90% confidence interval of the
parameter estimates. Regarding the hyperparameters of
the ONS algorithm, we perform an exhaustive grid search
for γ and η and select the hyperparameters that minimize
the CRPS. Because of the different nature of the case
studies, these parameter grids are not identical.
4.2.1. Time-invariant process
We adapt a simulation study from Gneiting and Ranjan
(2013), in which the data generating process is the combi-
nation of standard normal random variables X0, X1, X2, X3,
and ϵ without a temporal relation:
Y = X0 + a1X1 + a2X2 + a3X3 + ϵ,
(17)
where ϵ represents an error term. Gneiting and Ran-
jan (2013) note that X0 may represent public informa-
tion, such as weather forecasts from a meteorological
office, while X1, X2, and X3 represent private information
measured by forecasters 1, 2, and 3, respectively. These
experts issue the following probabilistic forecasts:
f1 = N (
X0 + a1X1, 1 + a2
2 + a2
)
,
(18)
f2 = N (
X0 + a2X2, 1 + a2
1 + a2
)
,
(19)
f3 = N (
X0 + a3X3, 1 + a2
1 + a2
)
,
(20)
where a1 = a2 = 1 and a3 = 1.1. Consequently, the
component forecasts are probabilistically calibrated by
design and their linear combination leads to overdisper-
sion (Gneiting & Ranjan, 2013). As mentioned, we com-
pare our method with linear and nonlinear combinations
whose weights are static over time, denoted with an
asterisk. To that end, the parameters are optimized over
the test data by minimizing the logarithmic score, as
in Gneiting and Ranjan (2013).
Simulation
results. Given
the
stationary
and
time-
invariant nature of this case study, the hyperparameter
grid includes low γ values for increased stability, and rel-
atively high η values to learn quickly. Specifically, the grid
comprises the combinations of γ ∈{1/16, 1/21, 1/26,
1/31, 1/36} and η ∈{0.150, 0.175, 0.200, 0.225, 0.250}.
The combination that minimizes the CRPS is γ = 1/26
and η = 0.25.
Fig. 1(a) presents the evolution of the parameters over
time during linear and nonlinear forecast combination.
The shaded area represents the 90% confidence interval

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
Fig. 1. In (a), the evolution of the weights over time organized by linear and nonlinear combination (rows), where the shaded area represents the
90% confidence interval computed over 150 experiments. In (b), the PIT histograms of the experts and combination methods, again with the asterisk
indicating the optimal parameters in hindsight.
associated to the parameter, computed over 150 experi-
ments. When considering linear forecast combination, it
becomes apparent that the third expert typically receives
the highest weight. This pattern is expected because the
third expert consistently provides slightly sharper predic-
tive distributions. The weights of experts 1 and 2 are simi-
lar, which can be explained by the fact that their forecasts
are identical in expectation. We observe a similar pattern
in the case of nonlinear forecast combination. However,
both shape parameters are larger than 1, indicating that
the beta transformation sharpens the predictive distribu-
tions. Crucially, the shape parameters are very similar and
this is expected as their primary purpose is to enhance
sharpness.
Fig. 1(b) presents the PIT histograms for the experts
and the combination methods. Recall that departures
from flatness may arise from a limited-sized test set,
which is why Fig. 1(b) also includes consistency bars. This
figure demonstrates that the experts exhibit the intended
probabilistic calibration, highlighting that the linear com-
bination methods (namely, OLP, TLP, and TLP*) result in
overdispersed forecasts. In contrast, both the online BLP
and the fixed BLP* effectively transform the combined
forecasts to generate calibrated forecasts, whereas the PFC
model tends to be slightly miscalibrated at the outer edge
of the distributions.
Considering the CRPS, Table 1 shows that all combi-
nation methods substantially outperform the component
models. Furthermore, it can be seen that the OLP, TLP,
and TLP* perform quite similarly. BLP and BLP* perform
identically, which is partly attributed to the fact that
the process is time-invariant. In other words, the ONS
algorithm converges to the true weights, which implies
that logarithmic regret is hereby empirically shown. Sur-
prisingly, the PFC underperforms on this synthetic data
set, although it is important to recall that all settings have
been left to their default values.
Finally, we evaluate the computational complexity of
Algorithm 1, which is dominated by the computation of
the integrals (11), (12), and (13). On a 2020 M1 Mac-
Book Pro running R 4.2.2, it takes approximately 10 ms
(per component model), 33 ms, and 44 ms to evalu-
ate the aforementioned integrals, respectively. One iter-
ation of Algorithm 1 requires, on average, 110 ms when
considering three component models.
4.2.2. Time-varying process
We additionally illustrate the efficacy of the proposed
method on a simulation study adapted from Berrisch and
Ziel (2021). Specifically, the data generating process is
defined as
Yt = N (0.15asinh (µt) , 1) ,
(21)
where µt = 0.99µt−1 + ϵt, and ϵt is a standard nor-
mal random variable. In this study, two experts provide
constant probabilistic forecasts:
f1 = N (−1, 1) ,
(22)
f2 = N (3, 4) .
(23)

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
Table 1
Realized CRPS for the component models and combination methods. The results are presented as the mean and standard error of 150 experiments
based on synthetic data adapted from Gneiting and Ranjan (2013). Note that the asterisk indicates a combination method with optimal parameters
in hindsight.
F1
F2
F3
OLP
TLP
TLP*
BLP
BLP*
PFC
1.012 ± 0.725
1.01 ± 0.724
0.978 ± 0.700
0.895 ± 0.553
0.893 ± 0.553
0.894 ± 0.555
0.880 ± 0.618
0.880 ± 0.626
0.931 ± 0.639
Fig. 2. In (a), the evolution of the weights over time organized by linear and nonlinear combination (rows), where the shaded area represents the
90% confidence interval computed over 150 experiments. In (b), the PIT histograms of the experts and combination methods, again with the asterisk
indicating the optimal parameters in hindsight.
Similar to the previous case study, we compare our
method with linear and nonlinear combination methods
whose parameters are optimal in hindsight, learned by
minimizing the logarithmic score over the test set and
indicated by an asterisk.
Simulation results. Here, we select a grid that includes
higher γ values than in the previous case study to in-
crease adaptation speed while retaining the same η val-
ues. Specifically, the grid comprises the combinations of
γ ∈{0.175, 0.200, 0.225, 0.250, 0.275, 0.300, 0.325} and
η ∈{0.150, 0.175, 0.200, 0.225, 0.250}. The combination
that minimizes the CRPS is γ = 0.275 and η = 0.175.
The forecasts by the two experts in this case study
are both biased. However, the first expert does issue
forecasts that are correctly dispersed, whereas the sec-
ond expert issues forecasts that are overdispersed. Con-
sequently, Fig. 2(a) shows that both linear and nonlinear
combination weigh the first expert more than the second.
(Recall that the shaded area represents the 90% confi-
dence interval associated with the parameters.) To opti-
mize the calibration of the resulting combination, the TLP
(the linear combination method) distributes the weights
to include both experts to a degree. In contrast, the BLP
quickly disregards the second expert and instead uses the
shape parameters to modify the predictive distributions.
Note that the shape parameters are quite different from
each other; this is because they have to account for the
bias of the first expert.
Fig. 2(b) reveals the miscalibration of the two experts.
Their miscalibration is such that linearly combining the
forecasts does not result in calibrated forecasts, which
can be expected because of the overdispersion of the
second expert and their opposing biases. Nonlinear com-
bination significantly improves calibration, and the online
method is preferred over the static method (indicated
with an asterisk). Nevertheless, these combined forecasts
are not perfectly calibrated at the edges of the distribu-
tions. In this case study, the PFC generates forecasts that
are closest to perfect calibration, although also here some
deviation can be observed at the edges.
In terms of the CRPS, Table 2 shows that BLP* out-
performs the online method, i.e., the BLP. This is not
entirely unexpected, since the data generating process is
stationary, meaning that the best strategy in hindsight can
be expected to be highly competitive. The PFC method

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
Table 2
Realized CRPS for the component models and combination methods. The results are presented as the mean and standard error of 150 experiments
based on synthetic data adapted from Berrisch and Ziel (2021). Note that the asterisk indicates a combination method with optimal parameters in
hindsight.
F1
F2
OLP
TLP
TLP*
BLP
BLP*
PFC
0.858 ± 0.645
2.07 ± 0.871
0.871 ± 0.283
0.718 ± 0.327
0.741 ± 0.456
0.609 ± 0.446
0.603 ± 0.437
0.588 ± 0.418
outperforms the others, primarily because it combines
quantiles, allowing it to incorporate the strengths of com-
ponent forecasts exhibiting biases in opposing directions.
In terms of linear combination, we observe that the TLP
outperforms the TLP*, indicating that online learning does
benefit linear forecast combination.
4.3. Real-word time series
We apply the proposed combination method on prob-
abilistic power forecasts issued for a wind farm located in
mid-west France. The wind farm has a nominal capacity of
16,000 kW and the data set ranges from 2018-09-30 until
2020-09-30 at 15-min resolution. To flag anomalies, we
use the OpenOA library in Python and linearly interpolate
flagged instances (Perr-Sauer et al., 2021).
For brevity, we consider only 15-min-, 3-h-, 6-h-, and
24-h-ahead forecasts. Especially further into the future,
NWP forecasts are essential. Furthermore, Winkler et al.
(2019) argue that weighted forecast combinations of ex-
perts that are highly correlated can become unstable.
We therefore include forecasts from three NWP mod-
els, namely (i) the High-Resolution Forecast (HRES) from
the European Centre for Medium-Range Weather Fore-
casts (ECMWF), (ii) the Global Forecast System (GFS) from
the National Centers for Environmental Prediction (NCEP),
and (iii) the global Arpège model from Metéo France. The
average of the four NWP grid points closest to the wind
farm, as well as the last observed power and wind speed,
serve as input to three machine learning models that we
describe next.
The last stage before forecast combination is to use
post-processing models to convert the wind-speed fore-
casts into probabilistic wind-power forecasts that are
to be combined. For this, we employ three models: (i)
generalized boosted regression models (GBM), (ii) quan-
tile regression forests (QRF), and (iii) quantile regression
(QR). GBM is a technique where simple models, here
regression trees, are repeatedly combined in a stage-
wise fashion to minimize the prediction loss (Friedman,
2001). In contrast, QRF is based on random forests in
which independent regression trees are fitted on subsets
of the feature space and sample space, making them
easily parallelizable (Meinshausen, 2006). Finally, QR is
a linear model where the pinball loss is minimized to
predict conditional quantiles (Koenker & Bassett, 1978). A
thorough treatment of these models is out of the scope
of this manuscript, and we refer the reader to stan-
dard textbooks such as Hastie, Tibsharani, and Friedman
(2008). Furthermore, it is important to note that the
aim of this study is not to generate the most accurate
component forecasts; rather, the aim is to show the ef-
fectiveness of probabilistic forecast combination with our
Table 3
Combination of γ
and η that minimizes the CRPS for linear and
nonlinear forecast combination, i.e., TLP and BLP, respectively, and for
all forecast horizons.
TLP
BLP
15 min
3 h
6 h
24 h
15 min
3 h
6 h
24 h
γ
0.58
0.46
0.70
0.58
0.22
0.70
0.46
0.22
η
0.58
0.22
0.58
0.34
0.46
0.70
0.70
0.70
proposed method. The aforementioned models were se-
lected because they are well documented and can easily
be used in R or Python. We use the R packages gbm
to implement GBM (Greenwell, Boehmke, Cunningham,
& Developers, 2022), quantregForest to implement
QRF (Meinshausen, 2017), and quantreg to implement
QR (Koenker, 2022). Finally, we use the function contCDF
of the R package ProbCast to convert quantile forecasts
into continuous CDFs with generalized Pareto distribution
tails (Browell, Gilbert, McFadzean, & Tawn, 2022).
We perform an exhaustive grid search to select the
hyperparameters that minimize the CRPS for each ma-
chine learning model. Given that there are in total 216
combinations to be validated,3 we restrict ourselves to
a single forecast horizon (3 h) and a single wind park,
thus resulting in 54 combinations. This strategy can be
motivated by the fact that the post-processing models
are expected to have a similar learning pattern across
horizons, except for perhaps the first forecast horizon. For
hyperparameter validation, we train each model on five
weeks of data and validate on the following three weeks,
which is repeated 12 times in a rolling fashion to cover
the entire first year. Similarly, we perform an exhaustive
grid search to determine the hyperparameters that mini-
mize the CRPS when running the ONS algorithm. Specif-
ically, the grid comprises the combinations of γ = η ∈
{0.10, 0.22, 0.34, 0.46, 0.58, 0.70}. The first four months
of the test set are used to validate the ONS algorithm hy-
perparameters, whereas the remaining eight months are
used to test the selected ONS hyperparameters. Table 3
presents the hyperparameter combinations for the lin-
ear and nonlinear forecast combination methods and the
forecast horizons that minimize the CRPS. It is interesting
to note that the hyperparameters vary as a function of
combination methods and the forecast horizon, indicating
that careful validation is necessary. As before, we compare
the linear and nonlinear combination methods with the
optimal parameters in hindsight; i.e., the parameters are
learned based on out-of-sample test data. These static
models are denoted with an asterisk.
3 Four forecast horizons, one wind park, three data sources, three
forecast models, and six hyperparameter combinations results in 216
combinations.

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
Table 4
Average and standard deviation of the CRPS in percentage of nominal capacity, computed over the entire test set.
The best-performing expert is underlined, whereas the best-performing combination method is in bold. Note that the
asterisk indicates a combination method with optimal parameters in hindsight.
Post-process
model
Horizon
15 min
3 h
6 h
24 h
ECMWF
QRF
2.64 ± 3.17
6.33 ± 6.44
6.70 ± 6.67
7.13 ± 6.80
QR
2.66 ± 3.44
8.62 ± 8.46
10.9 ± 9.69
13.2 ± 12.0
GBM
2.61 ± 3.30
6.67 ± 6.40
6.47 ± 6.55
6.57 ± 6.85
GFS
QRF
2.66 ± 3.15
7.11 ± 7.00
7.75 ± 7.38
8.53 ± 7.89
QR
2.66 ± 3.42
8.61 ± 8.39
10.9 ± 9.65
13.2 ± 11.9
GBM
2.62 ± 3.30
7.34 ± 6.76
7.55 ± 7.12
8.01 ± 7.80
MF
QRF
2.64 ± 3.15
6.52 ± 6.45
6.89 ± 6.64
7.67 ± 7.35
QR
2.66 ± 3.45
8.62 ± 8.45
10.9 ± 9.66
13.1 ± 11.9
GBM
2.62 ± 3.31
6.87 ± 6.34
6.77 ± 6.46
7.13 ± 7.21
Combination
OLP
2.60 ± 3.24
6.83 ± 6.29
7.28 ± 6.20
7.86 ± 6.33
TLP
2.60 ± 3.20
6.26 ± 5.92
6.33 ± 5.84
6.44 ± 5.96
TLP*
2.60 ± 3.22
6.15 ± 5.94
6.21 ± 5.87
6.32 ± 6.15
BLP
2.58 ± 3.28
6.07 ± 6.36
6.00 ± 6.11
6.20 ± 6.07
BLP*
2.58 ± 3.30
6.08 ± 6.22
6.31 ± 6.34
6.33 ± 6.25
PFC
2.58 ± 3.22
5.97 ± 6.00
6.01 ± 5.97
6.24 ± 6.11
4.3.1. Measure-oriented forecast analysis
Table 4 presents forecast results across the entire test
set for all combinations of weather models, static and on-
line combination methods, as well as the post-processing
methods, in terms of the CRPS. In the table, the best-
performing combination of weather model and post-
processing model, i.e., expert, is underlined, while the
best-performing combination method is in bold font. Ta-
ble 4 indicates that there is minimal distinction among
the models for the initial forecast horizon. It is worth
highlighting that, in this case, the standard deviation of
the CRPS surpasses its mean value. An in-depth analysis
(which is not presented here) unveiled the skewness in
the CRPS distribution. Specifically, the 25th percentile
and median CRPS values are considerably lower than the
mean CRPS, and there is a noteworthy maximum value,
approaching approximately 0.76 (varying, depending on
the model).
As expected, Table 4 shows that the CRPS increases
with the forecast horizon, with the largest relative in-
crease occurring from 15 min to 3 h ahead. The rel-
ative increase is especially noticeable for QR, which is
expected, since the linear model fails to represent accu-
rately the nonlinear relationship between wind speed and
wind power. Furthermore, the table shows that weather
forecasts from ECMWF generally result in more accu-
rate wind-power forecasts, whereas weather forecasts
from GFS result in less accurate wind-power forecasts.
Of the combination methods, it can be seen that the
linear static method with optimal parameters in hind-
sight, i.e., the TLP*, achieves a lower CRPS than the online
method, i.e., the TLP. Conversely for nonlinear combina-
tion, the proposed BLP method improves the CRPS by
up to 4.91% compared to the BLP*, indicating that online
learning combined with the additional flexibility of the
beta transformation is a valuable improvement when
dealing with nonstationary time series. Moreover, the
proposed method improves the CRPS by up to 7.26% when
compared to the most accurate expert. In comparison
with the PFC, the difference in the CRPS varies per forecast
horizon and is minimal.
Fig. 3 presents the CRPS as well, except as cumula-
tive and five-day moving averages for the most accurate
expert and the combination methods, and only for the
24-h-ahead horizon. In terms of cumulative average, the
figure shows that the BLP is consistently on par with
the PFC and that together they outperform the other
combination methods, as well as the most accurate ex-
pert. Although the OLP performs worst in this figure, it
is worth noting that it is a competitive method when
compared to the experts (cf. Table 4). Nonetheless, when
examining the moving average, it becomes evident that
adaptive techniques prove beneficial in instances where
one or more experts underperform. This is notably the
case prior to January and around the outset of April.
Particularly during the latter period, it is evident that
the fixed OLP method exhibits significantly poorer per-
formance compared to the top-performing expert, along
with the TLP, PFC, and BLP, with the latter demonstrating
the best performance during this period. Concerning the
period prior to January, it is noteworthy that the BLP
exhibits a considerably superior performance compared
to the other methods, suggesting the important influence
of shape parameters. This aspect is explored further in the
next subsection.
4.3.2. Combination weights
Fig. 4 presents the three-day moving average of the
weights as they evolve throughout the test period, or-
ganized by linear and nonlinear weights, as well as the
shape parameters used by the nonlinear forecast combi-
nation algorithm for the 24-h forecast horizon.
For the case of linear combination, Fig. 4 shows that
expert ECMWF-GBM is generally given the most weight,
which is consistent with the results from Table 4. How-
ever, it is worth highlighting the varying weights assigned
to experts during different periods. Notably, expert GFS-
GBM carries the highest weight during the initial period,

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
Fig. 3. Cumulative average and moving average of the best-performing expert as well as the online combination methods for the 24-h-ahead forecast
horizon.
Fig. 4. Evolution of linear and nonlinear parameters over time, color-coded according to the combination of weather model and post-processing
model for the 24-h forecast horizon.
while expert MF-QRF assumes significant weighting in
the later stages of the test set. Particularly noteworthy
is the fact that GFS-GBM maintains a weight exceed-
ing 0.3 for an extended duration, despite not performing
as competitively across the entire test set (as shown in
Table 4).
When we consider nonlinear combination, as illus-
trated in Fig. 4, it is evident that expert ECMWF-GBM
maintains the highest weighting. However, the remain-
ing experts are allocated substantial weights, with the
exception of those relying on QR as a post-processing
model. Notably, during the last period of the test set, four
experts are assigned weights more than 0.1, while the
shape parameters are close to being identical and larger
than 1. The latter suggests that these experts are overdis-
persed during the final period and that the proposed
algorithm leverages the shape parameters to enhance the
probabilistic calibration, similar to in Section 4.2.1.
4.3.3. Distribution-oriented forecast analysis
Finally, we examine the probabilistic calibration us-
ing PIT histograms, which are presented in Fig. 5. Recall

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
Fig. 5. PIT histograms of the component and combination models, again with the asterisk indicating the optimal combination with static weights.
that deviations from flatness can be due to a test set of
limited size, which is why Fig. 5 additionally presents
the consistency bars. The figure illustrates that the most
accurate expert aligns closely with probabilistic calibra-
tion. Although not shown here, it is worth noting that the
majority of experts exhibit satisfactory calibration in the
central portion of their predictive distributions. However,
all experts do experience slight miscalibration in the outer
regions of their predictive distributions.
As the experts are already approaching probabilistic
calibration, employing linear combination methods such
as the OLP, TLP, and TLP* leads to overdispersed forecasts.
The optimal nonlinear combination in hindsight, the BLP*,
is closest to perfect calibration, again indicating that the
beta transformation is capable of generating competi-
tive forecasts that are calibrated as well. However, the
BLP shows signs of miscalibration at the lower end of
the predictive distributions, suggesting a positive bias—
a characteristic not observed in the predictions of the
experts. This discrepancy can likely be attributed to the
period up to and including April, during which the shape
parameter a exceeds shape parameter b, as depicted in
Fig. 4. In general, setting a > b shifts the predictive dis-
tribution upwards, potentially introducing a positive bias
when the component forecasts are unbiased. One possible
remedy for this issue could involve periodic recalibration
of the hyperparameters of the ONS. It is worth noting
that the benchmark PFC lags in terms of probabilistic
calibration, exhibiting a notable deviation at the lower
end of the predictive distributions.
5. Conclusions
In this study, we expanded the application of the beta-
transformed linear pool to the online setting by deriving
the gradient of the continuous ranked probability score
(CRPS) with respect to the shape parameters of the beta
distribution and the combination weights. We selected
the CRPS because it evaluates the entire predictive dis-
tribution and therefore yields the most general setting,
where experts issue complete predictive distributions. In
addition, the CRPS is exponentially concave, which al-
lows for accelerated learning in combination with the
online Newton step (ONS) algorithm. The motivation for
our approach is that linear combination, which is the
predominant form of forecast combination, always leads
to overdispersed forecasts in cases where the experts
are probabilistically calibrated, which is a requirement in
probabilistic forecasting. In a time-invariant simulation
study using synthetic data, we showed that the proposed
method converges to the optimal combination strategy
in hindsight, meaning that the average regret goes to
zero. In another simulation study with time-varying syn-
thetic data, we showed that the proposed method ap-
proaches the optimal combination strategy in hindsight
but does not achieve zero average regret. Finally, we
employed the proposed method to combine probabilistic
forecasts of nine experts, resulting from all combinations
of three weather models and three post-processing meth-
ods, on a real-world wind power data set. We showed that
the online and offline combination methods, except the
naive version, always perform as well as the best expert.
More importantly, the proposed method outperformed
the most accurate expert by up to 7.26% and the optimal
combination strategy in hindsight by up to 4.91% in terms
of the CRPS, indicating that online learning combined with
the additional flexibility of the beta transformation is a
valuable improvement for nonstationary time series. In all
case studies, we observed that the ONS algorithm, which
uses the derived gradient to update the parameters, is
sensitive to its hyperparameters. Hence, it is important
to validate these carefully to optimize the performance of
the algorithm.
Declaration of competing interest
The authors declare that they have no known com-
peting financial interests or personal relationships that
could have appeared to influence the work reported in
this paper.
Data availability
The code to replicate a single run of the case stud-
ies on synthetic data in Section 4.2 is available on Git-
Lab4 including instructions on how to install the required
packages and perform the run. Specifically, the script
get_started.R installs the required packages and the
script run_sim.R runs four case studies in parallel. To
replicate the results in Section 4.2 one would reiterate the
main code in run_sim.R 150 times, each with a different
seed to randomly generate the synthetic data.
4 https://git.persee.mines-paristech.fr/dennis.van_der_meer/online-
probabilistic-forecast-combination

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
Acknowledgment
The authors acknowledge ECMWF, NCEP and Metéo
France for providing numerical weather predictions. The
present research was carried as part of the Smart4RES
Project (European Union’s Horizon 2020, No. 864337).
The constructive feedback of the reviewers, the associate
editor and the editor in charge of the paper, was greatly
appreciated since allowing to improve the version of the
manuscript submitted originally.
Appendix A. Derivation of the gradient
A.1. Partial derivative with respect to the weights
Recall that we can compute ∂CRPS
∂wj
as follows:
∂CRPS
∂wj
=
∫1
0
(
ˆFa,b (z) −1{x ≥y}
) ∂ˆFa,b (z)
∂wj
dx.
(24)
Also recall that the CDF of the beta distribution is a
quotient where the denominator only depends on a and
b. Therefore, we focus on the incomplete beta function
Ba,b(z). As mentioned, the weights appear in the upper
limit of the integral in (4) as z = ∑m
j=1 wj ˆFj(y), and we
therefore require Leibniz’s integral rule. In general terms,
it is defined as follows:
d
dx
(∫b(x)
a(x)
f (x, t)dt
)
= f (x, b(x)) d
dx
b(x)
−f (x, a(x)) d
dx
a(x) +
∫b(x)
a(x)
∂
∂x
f (x, t)dt.
(25)
Now, we want to find the partial derivative
∂
∂wj , so we
plug (4) into (25):
∂Ba,b(z)
∂wj
=
∂
∂wj
(∫z
0
ua−1 (1 −u)b−1 dt
)
= za−1 (1 −z)b−1
∂
∂wj
z −0a−1 (1 −0)b−1
∂
∂wj
0



=0
+
∫z
0
∂
∂wj
ua−1 (1 −u)b−1 dt



=0
=
⎛
⎝
m
∑
j=1
wj ˆFj(y)
⎞
⎠
a−1 ⎛
⎝1 −
m
∑
j=1
wj ˆFj(y)
⎞
⎠
b−1
ˆFj(y).
(26)
Accordingly, ∂Ia,b(z)/∂wj requires multiplication of (26)
with 1/Ba,b, since the denominator in the latter term is
not affected by the derivative:
∂Ia,b(z)
∂wj
=
Ba,b
za−1 (1 −z)b−1 ˆFj(y).
(27)
Finally, we apply the logit transform (8) to attain the par-
tial derivative of the CRPS with respect to the jth weight
by plugging (27) into (24):
∂CRPS
∂˜wj
=
2 (
wj −w2
j
)
Ba,b
∫
0
(
ˆFa,b (z) −1{x ≥y}
)
za−1 (1 −z)b−1 ˆFj(x)dx.
(28)
A.2. Partial derivative with respect to shape parameter a
The Leibniz integral rule of ∂CRPS/∂a results in
∂CRPS
∂a
=
∫1
0
(
ˆFa,b (z) −1{x ≥y}
) ∂ˆFa,b (z)
∂a
dx.
(29)
Consequently, it is necessary to compute the partial deriva-
tive of (3) with respect to a. Given that the regularized
incomplete beta function is the ratio of the incomplete
beta function and the complete beta function, we use the
quotient rule. First, we compute ∂Ba,b/∂a by applying the
product rule to the final equality in (5):
∂Ba,b
∂a
= ∂
∂a
Γ (a)Γ (b)
Γ (a + b)
= ∂
∂aΓ (a)Γ (b)Γ (a + b)−1.
The partial derivative of Γ (a) with respect to parame-
ter a is
∂
∂aΓ (a) = ∂
∂a
∫∞
0
u(a−1) exp(−u)du
=
∫∞
0
∂
∂a
u(a−1) exp(−u)du
=
∫∞
0
u(a−1) ln(u) exp(−u)du
= ψ(a)Γ (a).
(30)
The partial derivative with respect to a of Γ (a+ b) can be
computed in a similar manner, such that ∂Γ (a + b)/∂a =
ψ(a+b)Γ (a+b). Using this result and (30) in the product
rule we find
∂Ba,b
∂a
= ψ(a)Γ (a)Γ (b)Γ (a + b)−1
−Γ (a)Γ (b)Γ (a + b)−2 ∂
∂aΓ (a + b)
= ψ(a)Γ (a)Γ (b)
Γ (a + b)
−Γ (a)Γ (b)ψ(a + b)
Γ (a + b)
= Γ (a)Γ (b)
Γ (a + b) (ψ(a) −ψ(a + b)) .
(31)
The next step is to compute the partial derivative of
the incomplete beta function in (4):
∂Ba,b(z)
∂a
= ∂
∂a
∫z
0
ua−1(1 −u)b−1du
=
∫z
0
∂
∂a
ua−1(1 −u)b−1du
=
∫z
0
ua−1 ln(u)(1 −u)b−1du.
(32)

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
The partial derivative can be found through integration
by parts and setting v = ln(u) and dw = ua−1(1 −u)b−1,
which gives dv = 1/u and w = ua
2F 1(a, 1−b; a+1; u)/a.
Plugging this in to (32) gives
∫z
0
ln(u)ua−1(1 −u)b−1du
= ln(u)ua
2F 1(a, 1 −b; a + 1; u)
a
−
∫
ua
2F 1(a, 1 −b; a + 1; u)
au
du
⏐⏐⏐⏐
z
0
= 1
a
(
ln(u)ua
2F 1(a, 1 −b; a + 1; u)
−
∫
ua−1
2F 1(a, 1 −b; a + 1; u)du
)⏐⏐⏐⏐
z
0
= 1
a
(
ln(u)ua
2F 1(a, 1 −b; a + 1; u)
−ua
a
3F 2(a, a, 1 −b; a + 1, a + 1; u)
)⏐⏐⏐⏐
z
0
= 1
a
(
ln(u)uaΓ (a + 1) 2 ˜F 1(a, 1 −b; a + 1; u)
−ua
a
3F 2(a, a, 1 −b; a + 1, a + 1; u)
)⏐⏐⏐⏐
z
0
= 1
a
(
ln(u)uaaΓ (a) 2 ˜F 1(a, 1 −b; a + 1; u)
−ua
a
3F 2(a, a, 1 −b; a + 1, a + 1; u)
)⏐⏐⏐⏐
z
0
= 1
a
(
aBa,b(z) ln(z) −za 1
a 3F 2(a, a, 1 −b; a + 1, a + 1; z)
)
= 1
a
(
aBa,b(z) ln(z)
−za 1
a 3 ˜F 2(a, a, 1 −b; a + 1, a + 1; z)Γ (a + 1)Γ (a + 1)
)
= 1
a
(
aBa,b(z) ln(z) −zaaΓ (a)2
3 ˜F 2(a, a, 1 −b; a + 1, a + 1; z)
)
= Ba,b(z) ln(z) −zaΓ (a)2
3 ˜F 2(a, a, 1 −b; a + 1, a + 1; z). (33)
The final step to compute the partial derivative of
the regularized incomplete Beta function with respect to
parameter a is, as mentioned at the beginning of this
section, to use the quotient rule:
∂Ia,b(z)
∂a
=
(
Ba,b(z) ln(z) −zaΓ (a)2
3 ˜F 2(a, a, 1 −b; a + 1, a + 1; z)
)
Γ (a)Γ (b)
Γ (a+b)
(
Γ (a)Γ (b)
Γ (a+b)
)2
−
Γ (a)za
2 ˜F 1(a, 1 −b; a + 1; z) Γ (a)Γ (b)
Γ (a+b) (ψ(a) −ψ(a + b))
(
Γ (a)Γ (b)
Γ (a+b)
)2
= Ba,b(z) ln(z)
Ba,b
−zaΓ (a)2
3 ˜F 2(a, a, 1 −b; a + 1, a + 1; z)
Γ (a)Γ (b)
Γ (a+b)
−Ba,b(z) (ψ(a) −ψ(a + b))
Ba,b
= Ia,b(z) ln(z)
−Γ (a + b)
Γ (a)Γ (b)
zaΓ (a)2
3 ˜F 2(a, a, 1 −b; a + 1, a + 1; z)
−Ia,b(z) (ψ(a) −ψ(a + b))
= Ia,b(z) (ln(z) −ψ(a) + ψ(a + b))
−Γ (a)Γ (a + b)
Γ (b)
za
3 ˜F 2(a, a, 1 −b; a + 1, a + 1; z).
(34)
As mentioned in Section 3.1.2, the change of variable
˜a = ln(a) improves the stability of the algorithm. Given
that ∂a/∂˜a = a and plugging (34) into (29) in combination
with the definition of the beta-transformed linear pool
forecast in (2), we find the partial derivative of the CRPS
with respect to ˜a:
∂CRPS
∂˜a
= a∂CRPS
∂a
= a
∫1
0
(
ˆFa,b (z) −1{x ≥y}
) ∂ˆFa,b (z)
∂a
dx.
= 2a
∫1
0
(
ˆFa,b (z) −1{x ≥y}
)
×
(
ˆFa,b(z) (ln(z) −ψ(a) + ψ(a + b))
−Γ (a)Γ (a + b)
Γ (b)
za
3 ˜F 2(a, a, 1 −b; a + 1, a + 1; z)
)
dx.
(35)
A.3. Partial derivative with respect to shape parameter b
The aim is to derive the following:
∂CRPS
∂b
=
∫1
0
(
ˆFa,b (z) −1{x ≥y}
) ∂ˆFa,b (z)
∂b
dx.
(36)
Since the partial derivative of the gamma function with
respect to b is similar to that in (30), we find that
∂Ba,b
∂b
= Γ (a)Γ (b)
Γ (a + b) (ψ(b) −ψ(a + b))
= Ba,b (ψ(b) −ψ(a + b)) .
(37)
For the partial derivative of the incomplete beta func-
tion with respect to b, we use the following useful prop-
erty:
Ia,b(z) = 1 −Ib,a(1 −z) ⇔Ba,b(z)
Ba,b
= 1 −Bb,a(1 −z)
Ba,b
. (38)
From equality (38) it follows that Ba,b(z) = Ba,b −Bb,a(1 −
z). Considering the definition of the incomplete beta func-
tion in (4), switching a and b is important to attain a
solution that depends predominantly on b. Then,
∂Ba,b(z)
∂b
= ∂Ba,b
∂b
−∂Bb,a(1 −z)
∂b
= Ba,b (ψ(b) −ψ(a + b))
−
∫1−z
0
ln(u)ub−1(1 −u)a−1du.
(39)
Similar to the partial derivative with respect to a, we use
integration by parts and some algebra to find that
∂Ba,b(z)
∂b
= Ba,b (ψ(b) −ψ(a + b))
−1
b
(
ln(u)ub
2F 1(b, 1 −a; b + 1; u)
−
∫
ub−1
2F 1(b, 1 −a; b + 1; u)du
)⏐⏐⏐⏐
1−z
0

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
∂Ia,b(z)
∂b
=
(
Ba,b (ψ(b) −ψ(a + b)) + (1 −z)bΓ (b)2
3 ˜F 2(b, b, 1 −a; b + 1, b + 1; 1 −z) −ln(1 −z)Bb,a(1 −z)
)
Ba,b
B2
a,b
−Ba,b(z)Ba,b (ψ(b) −ψ(a + b))
B2
a,b
= Γ (a + b)Γ (b)
Γ (a)
(1 −z)b
3 ˜F 2(b, b, 1 −a; b + 1, b + 1; 1 −z) −ln(1 −z)Bb,a(1 −z)
Ba,b
+ (ψ(b) −ψ(a + b))
(
Ba,b
Ba,b
−Ba,b(z)
Ba,b
)
= Γ (a + b)Γ (b)
Γ (a)
(1 −z)b
3 ˜F 2(b, b, 1 −a; b + 1, b + 1; 1 −z) + Ib,a(1 −z) (ψ(b) −ψ(a + b) −ln(1 −z)) .
(41)
Box I.
= Ba,b (ψ(b) −ψ(a + b))
−1
b
(
ln(u)ub
2F 1(b, 1 −a; b + 1; u)
−ubbΓ (b)2
3 ˜F 2(b, b, 1 −a; b + 1, b + 1; u)
)⏐⏐⏐
1−z
0
= Ba,b (ψ(b) −ψ(a + b))
+ (1 −z)bΓ (b)2
3 ˜F 2(b, b, 1 −a; b + 1, b + 1; 1 −z)
−ln(1 −z)Bb,a(1 −z).
(40)
Using (37), (40), and the quotient rule, we can compute
the partial derivative of the regularized incomplete beta
function with respect to b (see Box I):
The final step is to plug (41) into (36) in combination
with the change of variable:
∂CRPS
∂˜b
= b∂CRPS
∂b
= b
∫1
0
(
ˆFa,b (z) −1{x ≥y}
) ∂ˆFa,b (z)
∂b
dx.
= 2b
∫1
0
(
ˆFa,b (z) −1{x ≥y}
)
×
(Γ (a + b)Γ (b)
Γ (a)
(1 −z)b
3 ˜F 2(b, b, 1 −a; b + 1, b + 1; 1 −z)
+ ˆFb,a(1 −z) (ψ(b) −ψ(a + b) −ln(1 −z))
)
dx.
(42)
Appendix B. Weighted projection on the simplex
Recall that the projection of the updated weights vt+1
onto Λ with weighted norm ∥· ∥Dt , where Dt = diag (At),
is the following convex optimization problem (Winten-
berger, 2021):
wt+1 = 1
arg min
w∈K
∥w −vt+1∥2
Dt .
(43)
From this, the Lagrangian can be derived:
L(w, λ, ν) = 1
2 (w −vt+1)⊤Dt (w −vt+1)
−
m
∑
j=1
λjwj + ν(b⊤w −1),
(44)
where b = [
1m
]⊤is a vector of ones, λj is a dual variable
associated with the nonnegativity constraint of the jth
component forecast weight, and ν is the dual variable
associated with the equality constraint. The next step is
to compute the gradient:
∇L(w, λ, ν) =
⎛
⎝
Dt (w −vt+1) −λ + νb⊤
−w
b⊤w −1
⎞
⎠.
(45)
Setting the gradient (45) to 0, we find the Karush–Kuhn–
Tucker (KKT) conditions:
⎧
⎨
⎩
w∗= vt+1 −D−1
t
(
ν∗b⊤+ λ∗)
b⊤w∗= 1
w∗
j = 0 or w∗
j > 0 and λ∗= 0,
(46)
which results in the weighted soft-threshold (Winten-
berger, 2021)
w∗= max (
vt+1 −D−1
t ν∗b⊤, 0)
= D−1
t
SoftThreshold (
Dtvt+1, ν∗)
.
(47)
Subsequently, set ∥w∗∥0 = d0 to establish the relation
1 =
d0
∑
i=1
w∗
i =
d0
∑
i=1
D−1
t
SoftThreshold (
Dtvt+1, ν∗)
=
d0
∑
i=1
v∗
t+1,i −
d0
∑
i=1
d−1
t,i ν∗,
(48)
where dt,i is the ith diagonal element of Dt with identical
ordering, which implies that
ν∗=
∑d0
i=1 d−1
t,i
( d0
∑
i=1
vt+1,i −1
)
.
(49)

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
References
Bassetti, F., Casarin, R., & Ravazzolo, F. (2018). Bayesian nonparametric
calibration and combination of predictive distributions. Journal of
the American Statistical Association, 113(522), 675–685. http://dx.doi.
org/10.1080/01621459.2016.1273117.
Berrisch, J., & Ziel, F. (2021). CRPS learning. Journal of Econometrics,
http://dx.doi.org/10.1016/j.jeconom.2021.11.008.
Bracale, A., Carpinelli, G., & De Falco, P. (2017). A probabilistic
competitive ensemble method for short-term photovoltaic power
forecasting. IEEE Transactions on Sustainable Energy, 8(2), 551–560.
http://dx.doi.org/10.1109/TSTE.2016.2610523.
Bracale, A., Carpinelli, G., & De Falco, P. (2019). Developing and com-
paring different strategies for combining probabilistic photovoltaic
power forecasts in an ensemble method. Energies, 12(6), http://dx.
doi.org/10.3390/en12061011.
Bröcker, J., & Smith, L. A. (2007). Increasing the reliability of reliability
diagrams. Weather Forecasting, 22(3), 651–661. http://dx.doi.org/10.
1175/WAF993.1.
Browell, J., Gilbert, C., McFadzean, G., & Tawn, R. (2022). ProbCast.
Zenodo, http://dx.doi.org/10.5281/zenodo.6035270.
Claeskens, G., Magnus, J. R., Vasnev, A. L., & Wang, W. (2016). The
forecast combination puzzle: A simple theoretical explanation.
International Journal of Forecasting, 32(3), 754–762. http://dx.doi.
org/10.1016/j.ijforecast.2015.12.005.
Friedman, J. H. (2001). Greedy function approximation: A gradient
boosting machine.. The Annals of Statistics, 29(5), 1189–1232. http:
//dx.doi.org/10.1214/aos/1013203451.
Gaillard, P., Stoltz, G., & van Erven, T. (2014). A second-order bound
with excess losses. In M. F. Balcan, V. Feldman, & C. Szepesvári
(Eds.), Proceedings of machine learning research: vol. 35, Proceedings
of the 27th conference on learning theory (pp. 176–196). Barcelona,
Spain: PMLR.
Gneiting, T., Balabdaoui, F., & Raftery, A. E. (2007). Probabilistic fore-
casts, calibration and sharpness. Journal of the Royal Statistical
Society. Series B. Statistical Methodology, 69(2), 243–268. http://dx.
doi.org/10.1111/j.1467-9868.2007.00587.x.
Gneiting,
T.,
&
Raftery,
A.
E.
(2007).
Strictly
proper
scoring
rules, prediction, and estimation. Journal of the American Sta-
tistical Association, 102(477), 359–378. http://dx.doi.org/10.1198/
016214506000001437.
Gneiting, T., & Ranjan, R. (2013). Combining predictive distributions.
Electronic Journal of Statistics, 7, 1747–1782. http://dx.doi.org/10.
1214/13-EJS823.
Greenwell, B., Boehmke, B., Cunningham, J., & Developers, G. (2022).
gbm: Generalized boosted regression models. URL https://CRAN.R-
project.org/package=gbm, R package version 2.1.8.1.
Hall, S. G., & Mitchell, J. (2007). Combining density forecasts. Interna-
tional Journal of Forecasting, 23(1), 1–13. http://dx.doi.org/10.1016/
j.ijforecast.2006.08.001.
Hastie, T., Tibsharani, R., & Friedman, J. (2008). The elements of statistical
learning (2nd ed.). Springer Series in Statistics.
Hazan, E. (2021). Introduction to online convex optimization. Cambridge,
Massachusetts: The MIT Press.
Hazan, E., Agarwal, A., & Kale, S. (2007). Logarithmic regret algorithms
for online convex optimization. Machine Learning, 69(2), 169–192.
http://dx.doi.org/10.1007/s10994-007-5016-8.
Held, M., Wolfe, P., & Crowder, H. (1974). Validation of subgradient
optimization. Mathematical Programming, 6, 62–88. http://dx.doi.
org/10.1007/BF01580223.
Hora, S. C. (2004). Probability judgments for continuous quantities:
Linear combinations and calibration. Management Science, 50(5),
597–604. http://dx.doi.org/10.1287/mnsc.1040.0205.
Jose, V. R. R., Grushka-Cockayne, Y., & Lichtendahl, K. C. (2014).
Trimmed opinion pools and the crowd’s calibration problem. Man-
agement Science, 60(2), 463–475. http://dx.doi.org/10.1287/mnsc.
2013.1781.
Koenker, R. (2022). Quantreg: Quantile regression. URL https://CRAN.R-
project.org/package=quantreg, R package version 5.94.
Koenker, R., & Bassett, G. (1978). Regression quantiles. Econometrica,
46(1), 33–50. http://dx.doi.org/10.2307/1913643.
Korotin, A., V’yugin, V., & Burnaev, E. (2021). Mixability of integral
losses: A key to efficient online aggregation of functional and
probabilistic forecasts. Pattern Recognition, 120, Article 108175.
http://dx.doi.org/10.1016/j.patcog.2021.108175.
Krannichfeldt, L. V., Wang, Y., Zufferey, T., & Hug, G. (2022). Online
ensemble approach for probabilistic wind power forecasting. IEEE
Transactions on Sustainable Energy, 13(2), 1221–1233. http://dx.doi.
org/10.1109/TSTE.2021.3124228.
Lichtendahl, K. C., Grushka-Cockayne, Y., & Winkler, R. L. (2013). Is it
better to average probabilities or quantiles? Management Science,
59(7), 1594–1611. http://dx.doi.org/10.1287/mnsc.1120.1667.
Martin, G. M., Loaiza-Maya, R., Maneesoonthorn, W., Frazier, D. T., &
Ramírez-Hassan, A. (2022). Optimal probabilistic forecasts: When
do they work? International Journal of Forecasting, 38(1), 384–406.
http://dx.doi.org/10.1016/j.ijforecast.2021.05.008.
Meinshausen, N. (2006). Quantile regression forests. Journal of Machine
Learning Research, 7(35), 983–999, URL http://jmlr.org/papers/v7/
meinshausen06a.html.
Meinshausen, N. (2017). Quantregforest: Quantile regression forests.
URL https://CRAN.R-project.org/package=quantregForest, R package
version 1.3-7.
Möller, A., & Groß, J. (2020). Probabilistic temperature forecasting with
a heteroscedastic autoregressive ensemble postprocessing model.
Quarterly Journal of the Royal Meteorological Society, 146(726),
211–224. http://dx.doi.org/10.1002/qj.3667.
Orabona, F. (2019). A modern introduction to online learning. http:
//dx.doi.org/10.48550/ARXIV.1912.13213, URL https://arxiv.org/abs/
1912.13213.
Perr-Sauer, J., Optis, M., Fields, J. M., Bodini, N., Lee, J. C., Todd, A.,
et al. (2021). OpenOA: An open-source codebase for operational
analysis of wind farms. Journal of Open Source Software, 6(58), 2171.
http://dx.doi.org/10.21105/joss.02171.
Pinson, P., & Madsen, H. (2012). Adaptive modelling and forecasting
of offshore wind power fluctuations with Markov-switching au-
toregressive models. Journal of Forecasting, 31(4), 281–313. http:
//dx.doi.org/10.1002/for.1194.
Raftery, A. E., Gneiting, T., Balabdaoui, F., & Polakowski, M. (2005).
Using Bayesian model averaging to calibrate forecast ensembles.
Monthly Weather Review, 133(5), 1155–1174. http://dx.doi.org/10.
1175/MWR2906.1.
Rosenblatt, M. (1952). Remarks on a multivariate transformation. The
Annals of Mathematical Statistics, 23(3), 470–472. http://dx.doi.org/
10.1214/aoms/1177729394.
Sánchez, I. (2008). Adaptive combination of forecasts with applica-
tion to wind energy. International Journal of Forecasting, 24(4),
679–693. http://dx.doi.org/10.1016/j.ijforecast.2008.08.008, Energy
Forecasting.
Sherman, J., & Morrison, W. J. (1950). Adjustment of an inverse matrix
corresponding to a change in one element of a given matrix. The
Annals of Mathematical Statistics, 21(1), 124–127. http://dx.doi.org/
10.1214/aoms/1177729893.
Soll, J. B., Mannes, A. E., & Larrick, R. P. (2012). The ‘‘wisdom of crowds’’
effect. In H. Pashler (Ed.), Encyclopedia of mind. Sage Publications.
Stone, M. (1961). The opinion pool. The Annals of Mathematical Statistics,
32(4), 1339–1342. http://dx.doi.org/10.1214/aoms/1177704873.
Taylor, J. W., & Taylor, K. S. (2023). Combining probabilistic forecasts
of COVID-19 mortality in the united states. European Journal of
Operational Research, 304(1), 25–41. http://dx.doi.org/10.1016/j.ejor.
2021.06.044.
Thorey, J., Chaussin, C., & Mallet, V. (2018). Ensemble forecast of
photovoltaic power with online CRPS learning. International Journal
of Forecasting, 34(4), 762–773. http://dx.doi.org/10.1016/j.ijforecast.
2018.05.007.
Thorey, J., Mallet, V., & Baudin, P. (2017). Online learning with the
continuous ranked probability score for ensemble forecasting. Quar-
terly Journal of the Royal Meteorological Society, 143(702), 521–529.
http://dx.doi.org/10.1002/qj.2940.
Van der Meer, D., Camal, S., & Kariniotakis, G. (2022). Generalizing
renewable energy forecasting using automatic feature selection and
combination. In 2022 17th International conference on probabilistic
methods applied to power systems (pp. 1–6). http://dx.doi.org/10.
1109/PMAPS53380.2022.9810647.
V’yugin, V. V., & Trunov, V. G. (2019). Online learning with continuous
ranked probability score. In A. Gammerman, V. Vovk, Z. Luo, &
E. Smirnov (Eds.), Proceedings of machine learning research: vol. 105,
Proceedings of the eighth symposium on conformal and probabilistic
prediction and applications (pp. 163–177). PMLR.

D. van der Meer, P. Pinson, S. Camal et al.
International Journal of Forecasting 40 (2024) 1449–1466
Wang, Y., Zhang, N., Tan, Y., Hong, T., Kirschen, D. S., & Kang, C.
(2019). Combining probabilistic load forecasts. IEEE Transactions on
Smart Grid, 10(4), 3664–3674. http://dx.doi.org/10.1109/TSG.2018.
2833869.
Wilks, D. S. (2018). Chapter 3 - univariate ensemble postprocessing.
In S. Vannitsem, D. S. Wilks, & J. W. Messner (Eds.), Statistical
postprocessing of ensemble forecasts (pp. 49–89). Elsevier, http://dx.
doi.org/10.1016/B978-0-12-812372-0.00003-0.
Winkler, R. L., Grushka-Cockayne, Y., Lichtendahl, K. C., & Jose, V. R.
R. (2019). Probability forecasts and their combination: A research
perspective. Decision Analysis, 16(4), 239–260. http://dx.doi.org/10.
1287/deca.2019.0391.
Wintenberger, O. (2021). Lecture notes in online convex optimiza-
tion. Sorbonne University, http://wintenberger.fr/ens.html. (Online;
Accessed 18 October 2022).
Zamo, M., Bel, L., & Mestre, O. (2021). Sequential aggregation of prob-
abilistic forecasts—Application to wind speed ensemble forecasts.
Journal of the Royal Statistical Society. Series C. Applied Statistics,
70(1), 202–225. http://dx.doi.org/10.1111/rssc.12455.
Zinkevich, M. (2003). Online convex programming and generalized
infinitesimal gradient ascent.. In T. Fawcett, & N. Mishra (Eds.), ICML
(pp. 928–936). AAAI Press.