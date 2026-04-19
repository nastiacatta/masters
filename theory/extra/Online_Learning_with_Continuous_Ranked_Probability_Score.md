Proceedings of Machine Learning Research 105:1–15, 2019 Conformal and Probabilistic Prediction and Applications
Online Learning with Continuous Ranked Probability Score
Vladimir V. V’yugin
vyugin@iitp.ru
Institute for Information Transmission Problems
Skolkovo Institute of Science and Technology
Moscow, Russia
Vladimir G. Trunov
trunov@iitp.ru
Institute for Information Transmission Problems
Moscow, Russia
Editor: Alex Gammerman, Vladimir Vovk, Zhiyuan Luo and Evgueni Smirnov
Abstract
Probabilistic forecasts in the form of probability distributions over future events have be-
come popular in several ﬁelds of statistical science. The dissimilarity between a probability
forecast and an outcome is measured by a loss function (scoring rule). Popular example of
scoring rule for continuous outcomes is the continuous ranked probability score (CRPS).
We consider the case where several competing methods produce online predictions in the
form of probability distribution functions. In this paper, the problem of combining prob-
abilistic forecasts is considered in the prediction with expert advice framework. We show
that CRPS is a mixable loss function and then the time-independent upper bound for the
regret of the Vovk’s Aggregating Algorithm using CRPS as a loss function can be obtained.
We present the results of numerical experiments illustrating the proposed methods.
Keywords: On-line learning, Prediction with Expert Advice, Aggregating Algorithm,
Probabilistic prediction, Continuous Ranked Probability Score, CRPS, Mixability
1. Introduction
Probabilistic forecasts in the form of probability distributions over future events have be-
come popular in several ﬁelds including meteorology, hydrology, economics, and demography
(see discussion in Jordan et al. 2018). Probabilistic predictions are used in the theory of
conformal predictions, where a predictive distribution that is valid under a nonparametric
assumption can be assigned to any forecasting algorithm (see Vovk et al. 2019).
The dissimilarity between a probability forecast and an outcome is measured by a loss
function (scoring rule). Popular examples of scoring rules for continuous outcomes include
the logarithmic score and the continuous ranked probability score. The logarithmic score
(Good 1952) is deﬁned as LogS(F, y) = −log(F(y)), where F is a probability distribution
function, is a proper scoring rule relative to the class of probability distributions with
densities. The continuous ranked probability score (CRPS) is deﬁned as
CRPS(F, y) =
Z
(F(u) −1u≥y)2du,
where F(u) is a probability distribution function, and y is an outcome – a real number.
Also, 1u≥y = 1 if u ≥y and it is 0 otherwise (see Epstein (1969)).
c⃝2019 V.V. V’yugin & V.G. Trunov.

Online Learning with Continuous Ranked Probability Score
We consider the case where several competing methods produce online predictions in
the form of probability distribution functions. These predictions can lead to large or small
losses. Our task is to combine these forecasts into one optimal forecast, which will lead to
the smallest possible loss in the framework of the available past information.
We solve this problem in the prediction with expert advice (PEA) framework. We con-
sider the game-theoretic on-line learning model in which a learner (aggregating) algorithm
has to combine predictions from a set of N experts (see e.g. Littlestone and Warmuth
1994, Freund and Schapire 1997, Vovk 1990, Vovk 1998,
Cesa-Bianchi and Lugosi 2006
among others).
In contrast to the standard PEA approach, we consider the case where each expert
presents probability distribution functions rather than a point prediction.
The learner
presents his forecast also in a form of probability distribution function computed using the
experts’ probabilistic predictions.
The quality of the experts’ and of the learner’s predictions is measured by the contin-
uous ranked probability score as a loss function. At each time step t any expert issues a
probability distribution as a forecast. The aggregating algorithm combines these forecasts
into one aggregated forecast, which is a probability distribution function. The eﬀectiveness
of the aggregating algorithm on any time interval [1, T] is measured by the regret which is
the diﬀerence between the cumulated loss of the aggregating algorithm and the cumulated
loss of the best expert.
There are a lot of papers on probabilistic predictions and on CRPS scoring rule (some
of them are Brier 1950, Br¨ocker et al. 2007, Br¨ocker et al. 2008, Br¨ocker 2012, Epstein
(1969), Jordan et al. 2018, Raftery et al. 2005). Most of them referred to the ensemble
interpretation models. In particular,
Br¨ocker (2012) established a relation between the
CRPS score and the quantile score with non-uniform levels.
In some cases, experts use for their predictions probability distributions functions (data
models) which are deﬁned explicitly in an analytic form. In this paper, we propose the rules
for aggregation of such the probability distributions functions. We present the formulas
for direct calculation of the aggregated probability distribution function given probability
distribution functions presented by the experts.
The proposed rules can be applied both in the case of analytical models and in the case
when empirical distribution functions (ensemble forecasts) are used.
Thorey et al. (2017) used the online ridge regression and online exponentiated gra-
dient method for aggregating probabilistic forecasts with the CRPS as a loss function.
They pointed that in this case the theoretical guarantees (upper bounds) for the regret are
O(log T) for ridge regression and O(
√
T ln N) for online exponentiated gradient descent,
where N is the number of the experts and T is the length of time interval.
In this paper we obtain a more tight upper bound of the regret for a special case when the
outcomes and the probability distributions are located in a ﬁnite interval [a, b] of real line.
We show that the loss function CRPS(F, y) is mixable in sense of Vovk (1998) and apply
the Vovk’s Aggregating Algorithm to obtain the time-independent upper bound b−a
2 ln N
for the regret.1
1. The complete deﬁnitions are given in Section 2.

Online Learning with Continuous Ranked Probability Score
In PEA approach the learning process is represented as a game. The experts and the
learner observe past real outcomes generated online by some adversarial mechanism (called
nature) and present their forecasts. After that, a current outcome is revealed by the nature.
The validity of the forecasts of the experts and of the learner is measured using CRPS
score and the Vovk (1998) Aggregating Algorithm.
In Section 2 some details of these
methods are presented.
In Section 3 we prove that the CRPS function is mixable and and then all machinery
of the Vovk’s Aggregating Algorithm can be applied. The proof is based on the method
of prediction of packs by Adamskiy et al. (2017).
We present a method for computing
the aggregated probability distribution function given the probability distribution functions
presented by the experts and prove a time-independent bound for the regret of the proposed
algorithm.
We demonstrate the eﬀectiveness of the proposed methods in Section 4, where the results
of numerical experiments are presented.
2. Preliminaries
In this section we present the main deﬁnitions and the auxiliary results of the theory of
prediction with expert advice, namely, learning with mixable loss functions.
Online learning. Let a set of outcomes Ωand a set Γ of forecasts (decision space) be
given.2 We consider the learning with a loss function λ(f, y), where f ∈Γ and y ∈Ω.
Let also a set E of experts be given. For simplicity we assume that E = {1, . . . , N}. The
following game of prediction with expert advice is considered. At any round t = 1, 2, . . .
each expert i ∈E presents a forecast fi,t ∈Γ, then the learner presents its forecast ft ∈Γ,
after that, an outcome yt ∈Ωwill be revealed. Each expert i suﬀers the loss λ(fi,t, yt) and
the learner suﬀers the loss λ(ft, yt), see Protocol 1 below.
Protocol 1
FOR t = 1, . . . , T
1. Receive the experts’ predictions fi,t, where 1 ≤i ≤N.
2. Present the learner’s forecast ft.
3. Observe the true outcome yt and compute the losses λ(fi,t, yt) of the experts and the loss
λ(ft, yt) of the learner.
ENDFOR
Let HT =
TP
t=1
λ(ft, yt) be the cumulated loss of the learner and Li
T =
TP
t=1
λ(fi,t, yt) be the
cumulated loss of an expert i. The diﬀerence Ri
T = HT −Li
T is called regret with respect
to an expert i and RT = HT −mini Li
T is the regret with respect to the best expert. The
goal of the learner is to minimize the regret.
Aggregating Algorithm (AA). The Vovk’s Aggregating algorithm (Vovk 1990, Vovk
1998) is the base algorithm for computing the learner predictions. This algorithm starting
2. In general, these sets can be of arbitrary nature. We will specify them when necessary.

Online Learning with Continuous Ranked Probability Score
from the initial weights wi,1 (usually wi,1 = 1
N for all i) assign weights wi,t for the experts
i ∈E using the weights update rule:
wi,t+1 = wi,te−ηλ(fi,t,yt) for t = 1, 2, . . . ,
(1)
where η > 0 is a learning rate. The normalized weights are deﬁned
w∗
i,t =
wi,t
NP
j=1
wj,t
.
(2)
The main tool of AA is a superprediction function
gt(y) = −1
η ln
N
X
i=1
e−ηλ(fi,t,y)w∗
i,t.
(3)
We consider probability distributions p = (p1, . . . , pN) on the set E of the experts:
NP
i=1
pi = 1
and pi ≥0 for all i.
By Vovk (1998) a loss function is called η-mixable if for any probability distribution
p = (p1, . . . , pN) on the set E of experts and for any predictions c = (c1, . . . , cN) of the
experts there exists a forecast f such that
λ(f, y) ≤g(y) for all y,
(4)
where
g(y) = −1
η ln
N
X
i=1
e−ηλ(ci,y)pi.
(5)
We ﬁx some rule for calculating a forecast f and write f = Subst(c, p). The function Subst
is called the substitution function.
As follows from (4) and (5) if a loss function λ(f, y) is η-mixable then the loss function
cλ(f, y) is η
c-mixable for any c > 0.
Regret analysis for AA. Assume that a loss function λ(f, y) is η-mixable. Let w∗
t =
(w∗
1,t, . . . , w∗
N,t) be the normalized weights and ft = (f1,t, . . . , fN,t) be the experts’ forecasts
at step t. Deﬁne in Protocol 1 the learner’s forecast ft = Subst(ft, w∗
t ). By (4) λ(ft, yt) ≤
gt(yt) for all t, where gt(y) is deﬁned by (3).
Let HT =
TP
t=1
λ(ft, yt) be the cumulated loss of the learner and Li
T =
TP
t=1
λ(fi,t, yt) be
the cumulated loss of an expert i. Deﬁne Wt =
NP
i=1
wi,t. By deﬁnition gt(yt) = −1
η ln Wt+1
Wt ,
where W1 = 1. By the weight update rule (1) we obtain wi,t+1 = 1
N e−ηLi
t.
By telescoping, we obtain the time-independent bound
HT ≤
T
X
t=1
gt(yt) = −1
η ln WT+1 ≤Li
T + ln N
η
(6)

Online Learning with Continuous Ranked Probability Score
for any expert i. Therefore, there is a strategy for the learner that guarantees RT ≤ln N
η
for all T.
Exponential concave loss functions. Assume that the set of all forecasts form a
linear space. In this case, the mixability is a generalization of the notion of the exponential
concavity. A loss function λ(f, y) is called η-exponential concave if for each ω the function
exp(−ηλ(f, y)) is concave by f for any y (see Cesa-Bianchi and Lugosi (2006)). For ex-
ponential concave loss function the inequality λ(f, y) ≤g(y) holds for all y by deﬁnition,
where
f =
N
X
i=1
pici,
(7)
p1, . . . , pN is a probability distribution on the set of experts, and c1, . . . , cN are theirs
forecasts.
For exponential concave loss function and the game deﬁned by Protocol 1, where the
learner’s forecast is computed by (7), we also have the time-independent bound (6) for the
regret.
Square loss function. The important special case is Ω= {0, 1} and Γ = [0, 1]. The
square loss function λ(γ, ω) = (γ −ω)2 is η-mixable loss function for any 0 < η ≤2, where
γ ∈[0, 1] and ω ∈{0, 1}.3 In this case, at any step t, the corresponding forecast ft (in
Protocol 1) can be deﬁned as
ft = Subst(ft, w∗
t ) = 1
2 −1
2η ln
NP
i=1
w∗
i,te−ηλ(fi,t,0)
NP
i=1
w∗
i,te−ηλ(fi,t,1)
,
(8)
where ft = (f1,t, . . . , fN,t) is the vector of the experts’ forecasts and w∗
t = (w∗
1,t, . . . , w∗
N,t)
is the vector of theirs normalized weights deﬁned by (1) and (2). We refer the reader for
details to Vovk (1990), Vovk (1998), and Vovk (2001).
The square loss function λ(f, ω) = (f −ω)2, where ω ∈{0, 1} and f ∈[0, 1], is η-
exponential concave for any 0 < η ≤1
2 (see Cesa-Bianchi and Lugosi 2006).
Vector-valued predictions. Adamskiy et al. (2017) generalizes the AA for the case of
d-dimensional forecasts, where d is a positive integer. Let an η-mixable loss function λ(f, y)
be given, where η > 0, f ∈Γ and y ∈Ω. Let f = (f1, . . . , fd) ∈Γd be a d-dimensional
forecast and y = (y1, . . . , yd) ∈Ωd be a d-dimensional outcome.
The generalized loss
function is deﬁned λ(f, y) =
dP
s=1
λ(fs, ys); we call λ(f, y) its source function.
The corresponding (generalized) game can be presented by Protocol 1 where at each
step t the experts and the learner present d-dimensional forecasts: at any round t = 1, 2, . . .
each expert i ∈{1, . . . , N} presents a vector of forecasts fi,t = (f1
i,t, . . . , fd
i,t) and the learner
presents a vector of forecasts ft = (f1
t , . . . , fd
t ).
After that, a vector yt = (y1
t , . . . , yd
t )
of outcomes will be revealed and the experts and the learner suﬀer losses λ(fi,t, yt) =
dP
s=1
λ(fs
i,t, ys
t) and λ(ft, yt) =
dP
s=1
λ(fs
t , ys
t ).
3. In what follows ωt denotes a binary outcome.

Online Learning with Continuous Ranked Probability Score
Adamskiy et al. (2017) proved that the generalized game for AA is mixable. We rewrite
this result for completeness of presentation.
Lemma 1 The generalized loss function λ(f, y) is
η
d-mixable if the source loss function
λ(f, y) is η-mixable.
Proof.
Let the forecasts ci = (c1
i , . . . , cd
i ) of the experts 1 ≤i ≤N and a probability
distribution p = (p1, . . . , pN) on the set of the experts be given.
Since the loss function λ(f, y) is η-mixable, we can apply the aggregation rule to each sth
column es = (cs
1, . . . , cs
N) of coordinates separately: deﬁne fs = Subst(es, p) for 1 ≤s ≤d.
Rewrite the inequality (4):
e−ηλ(fs,y ≥
N
X
i=1
e−ηλ(cs
i ,y)pi for all y
(9)
for 1 ≤s ≤d.
Let y = (y1, . . . , yd) be a vector of outcomes.
Multiplying the inequalities (9) for
s = 1, . . . , d and y = ys, we obtain
e−η Pd
s=1 λ(fs,ys) ≥
d
Y
s=1
N
X
i=1
e−ηλ(cs
i ,ys)pi
(10)
for all y = (y1, . . . , yd).
The generalized H¨older inequality says that
∥F1F2 · · · Fd∥r ≤∥F1∥q1∥F2∥q2 · · · ∥Fd∥qd,
where 1
q1 +· · ·+ 1
qd = 1
r, qs ∈(0, +∞) and Fs ∈Lqs for 1 ≤s ≤d. Let qs = 1 for all 1 ≤s ≤d,
then r = 1/d. Let Fi,s = e−ηλ(cs
i ,ys) for s = 1, . . . , d and ∥Fs∥1 = Ei∼p[Fi,s] =
NP
i=1
Fi,spi.
Then
e−η 1
d
Pd
s=1 λ(fs,ys) ≥
N
X
i=1
e
−η 1
d
d
P
s=1
λ(cs
i ,ys)
pi.
or, equivalently,
e−η
d λ(f,y) ≥
N
X
i=1
e−η
d λ(ci,y)pi
(11)
for all y = (y1, . . . , yd), where f = (f1, . . . , fd).
The inequality (11) means that the generalized loss function λ(f, y) is η
d-mixable. QED
By (1) the weights update rule for generalized loss function in Protocol 1 is
wi,t+1 = wi,te−η
d λ(fi,t,yt) for t = 1, 2, . . . ,
where η > 0 is a learning rate for the source function.
The normalized weights w∗
t =
(w∗
i,t, . . . , w∗
i,t) are deﬁned by (2). The learner forecast ft = (f1
t , . . . , fd
t ) an any round t is
deﬁned: fs
t = Subst(es
t, w∗
t ) for each s = 1, . . . , d, where es
t = (fs
1,t, . . . , fs
N,t).

Online Learning with Continuous Ranked Probability Score
3. Aggregation of probability forecasts
Let in Protocol 1 the set of outcomes be an interval Ω= [a, b] of the real line for some a < b
and the set of forecasts Γ be a set of all probability distribution functions F : [a, b] →[0, 1].4
The quality of the prediction F in view of the actual outcome y is often measured by
the continuous ranked probability score (loss function)
CRPS(F, y) =
Z b
a
(F(u) −1u≥y)2du,
(12)
where 1 stands for the indicator function (Epstein (1969), Matheson and Winkler 1976 and
so on).
The CRPS score measures the diﬀerence between the forecast F and a perfect forecast
1u≥y which puts all mass on the veriﬁcation y. The lowest possible value 0 is attained when
F is concentrated at y, and in all other cases CRPS(F, y) will be positive.
We consider a game of prediction with expert advice, where the forecasts of the experts
and of the learner are probability distribution functions. At any step t of the game each
expert i ∈{1, . . . , N} presents its forecast – a probability distribution function F i
t (u) and
the learner presents its forecast Ft(u).5 After an outcome yt ∈[a, b] be revealed and the
experts and the learner suﬀer losses CRPS(F i
t , yt) and CRPS(Ft, yt). The corresponding
game of probabilistic prediction is deﬁned by the following protocol:
Protocol 2
FOR t = 1, . . . , T
1. Receive the experts’ predictions – the probability distribution functions F i
t (u) for 1 ≤i ≤N.
2. Present the learner’s forecast – the probability distribution function Ft(u):
3. Observe the true outcome yt and compute the scores
CRPS(F i
t , yt) =
R b
a (F i
t (u) −1u≥yt)2du of the experts 1 ≤i ≤N
and the score
CRPS(Ft, yt) =
R b
a (Ft(u) −1u≥yt)2du of the learner.
ENDFOR
The goal of the learner is to predict such that independently of which outcomes are
revealed and the experts’ predictions are presented its cumulated loss LT =
TP
t=1
CRPS(Ft, yt)
is asymptotically less than the loss Li
T =
TP
t=1
CRPS(F i
t , yt) of the best expert i up to some
regret and LT −mini Li
T = o(T) as T →∞.
First, we show that CRPS loss function (and the corresponding game) is mixable.
4. A probability distribution function is a non-decreasing function F(y) deﬁned on this interval such that
F(a) = 0 and F(b) = 1. Also, it is left-continuous and has the right limit at each point.
5.
For simplicity of presentation we consider the case where the set of the experts is ﬁnite. In case of
inﬁnite E, the sums by i should be replaced by integrals with respect to the corresponding probability
distributions on the set of experts. In this case the choice of initial weights on the set of the experts is
a non-trivial problem.

Online Learning with Continuous Ranked Probability Score
Theorem 2
The continuous ranked probability score CRPS(F, y) is
b−a-mixable loss func-
tion.
The corresponding learner’s forecast F(u) given the forecasts F i(u) of the experts
1 ≤i ≤N and a probability distribution p = (p1, . . . , pN) on the set of all experts can be
computed by the rule 6
F(u) = 1
2 −1
4 ln
PN
i=1 pie−2(F i(u))2
PN
i=1 pie−2(1−F i(u))2 ,
(13)
Proof. We approximate any probability distribution function F(y) by the piecewise-constant
functions Ld(y), where d = 1, 2, . . . .
Any such function Ld is deﬁned by the points
z0, z1, z2, . . . , zd and the values f0 = F(z0), f1 = F(z1), f2 = F(z2), . . . , fd = F(zd),
where a = z0 < z1 < z2 < · · · < zd = b and 0 = f0 ≤f1 ≤f2 < · · · ≤fd = 1. By deﬁnition
Ld(y) = f1 for z0 ≤y < z1, Ld(y) = f2 for z1 ≤y < z2, . . . , L(y) = fd for zd−1 ≤y < zd.
Also, assume that zi+1 −zi = ∆for all 0 ≤i < d. By deﬁnition ∆= b−a
d .
We have
|CRPS(F, y) −CRPS(Ld, y)| ≤
Z y
a
(L2
d(u) −F 2(u))du +
Z b
y
((1 −F 2(u))2 −(1 −Ld(u))2)du ≤2∆
(14)
for any y, since each integral is bounded by ∆. Also, we take into account that by deﬁnition
F(u) ≤Ld(u) for all u.
Deﬁne an auxiliary representation of y – a binary variable ωs
y = 1zs≥y ∈{0, 1} for
1 ≤s ≤d and ωy = (ω1
y, . . . , ωd
y).
Consider any y ∈[a, b]. Easy to see that for each 1 ≤s ≤d the uniform measure of all
u ∈[zs−1, zs] such that 1zs≥y ̸= 1u≥y is less or equal to ∆if y ∈[zs−1, zs] and 1zs≥y = 1u≥y
for all u ∈[zs−1, zs] otherwise. Since 0 ≤fs ≤1 for all s, this implies that





CRPS(Ld, y) −∆
d
X
s=1
(fs −ωs
y)2





 ≤2∆
(15)
for all y. Let us study the generalized loss function
λ(f, ω) = ∆
d
X
s=1
(fs −ωs)2,
(16)
where f = (f1, . . . , fd), ω = (ω1, . . . , ωd) and ωs ∈{0, 1} for 1 ≤s ≤d.
The key observation is that the deterioration of the learning rate for the generalized loss
function (it gets divided by the dimension d of vector-valued forecasts) is exactly oﬀset by
the decrease in the weight of each component of the vector-valued prediction as the grid-size
decreases.
Since the square loss function λ(f, ω) = (γ −ω)2 is 2-mixable, where f ∈[0, 1] and
ω ∈{0, 1}, by results of Section 2 the corresponding generalized loss function Pd
s=1(fs−ωs)2
6. Easy to verify that F(u) is a probability distribution function.

Online Learning with Continuous Ranked Probability Score
is 2
d-mixable and then the loss function (16) is
d∆=
b−a-mixable independently of that grid-
size is used.
Let F i(u) be the probability distribution functions presented by the experts 1 ≤i ≤N
and fi = (f1
i , . . . , fd
i ), where fs
i = F i(zs) for 1 ≤s ≤d. By (11)
e−
(b−a)λ(f,ω) ≥
N
X
i=1
e−
b−aλ(fi,ω)pi
(17)
for each ω ∈{0, 1}d (including ω = ωy for any y ∈[a, b]), where the forecast f = (f1, . . . , fd)
can be deﬁned as
fs = 1
2 −1
4 ln
PN
i=1 pie−2(fs
i )2
PN
i=1 pie−2(1−fs
i )2
(18)
for each 1 ≤s ≤d.
By letting the grid-size ∆→0 (or, equivalently, d →∞) in (15), (17), where ω = ωy,
and in (14), we obtain for any y ∈[a, b],
e−
(b−a)CRPS(F,y) ≥
N
X
i=1
e−
b−aCRPS(F i,y)pi,
(19)
where F(u) is the limit form of (18) deﬁned by
F(u) = 1
2 −1
4 ln
PN
i=1 pie−2(F i(u))2
PN
i=1 pie−2(1−F i(u))2
for each u ∈[a, b].
The inequality (19) means that the loss function CRPS(F, y) is
b−a-mixable. QED
Let us specify the protocol 2 of the game with probabilistic predictions.
Protocol 3
Deﬁne wi,1 = 1
N for 1 ≤i ≤N.
FOR t = 1, . . . , T
1. Receive the expert predictions – the probability distribution functions F i
t (u), where 1 ≤i ≤N.
2. Present the learner forecast – the probability distribution function Ft(u):
Ft(u) = 1
2 −1
4 ln
PN
i=1 wi,te−2(F i
t (u))2
PN
i=1 wi,te−2(1−F i
t (u))2 .
(20)
3. Observe the true outcome yt and compute the score
CRPS(F i
t , yt) =
R b
a (F i
t (u) −1u≥yt)2du for the experts 1 ≤i ≤N
and the score
CRPS(Ft, yt) =
R b
a (Ft(u) −1u≥yt)2du for the learner.
4. Update the weights of the experts 1 ≤i ≤N
wi,t+1 = wi,te−
b−a CRPS(F i
t ,yt)
(21)

Online Learning with Continuous Ranked Probability Score
ENDFOR
The performance bound of algorithm deﬁned by Protocol 3 is presented in the following
theorem.
Theorem 3
For any i
T
X
t=1
CRPS(Ft, yt) ≤
T
X
t=1
CRPS(F i
t , yt) + b −a
ln N
(22)
for each T.
Proof. The bound (22) is a direct corollary of the regret analysis of Section 2 and the bound
(6). QED
The square loss function is also η-exponential concave for 0 < η ≤1
2 (see Cesa-Bianchi
and Lugosi (2006)). In this case (20) can be replaced with
Ft(u) =
N
X
i=1
w∗
i,tF i
t (u),
(23)
where w∗
i,t =
wi,t
N
P
j=1
wj,t
are normalized weights. The corresponding weights are computing
recursively
wi,t+1 = wi,te−
2(b−a)CRPS(F i
t ,yt).
(24)
Using results of Adamskiy et al. (2017) (presented in Section 2), we conclude that in this
case the bound (22) can be replaced with
T
X
t=1
CRPS(Ft, yt) ≤
T
X
t=1
CRPS(F i
t , yt) + 2(b −a) ln N.
The proof is similar to the proof of Theorem 3.
4. Experiments
The proposed rules (20) and (21) can be used in the case when the probability distributions
presented by the experts are given in the closed form (i.e., distributions given by analytical
formulas). For this case, numerical methods can be used to calculate the integrals (CRPS)
with any degree of accuracy given in advance.
The proposed methods are closely related to the so called ensemble forecasting (Thorey
et al. (2017)). In practice, the output of physical process models usually not probabilities,
but rather ensembles. Ensemble forecasts are based on a set of the expert’s models. Each
model may have its own physical formulation, numerical formulation and input data. An
ensemble is a collection of model trajectories, generated using diﬀerent initial conditions of
model equations.

Online Learning with Continuous Ranked Probability Score
Consequently, the individual ensemble members represent likely scenarios of the future
physical system development, consistent with the currently available incomplete informa-
tion. The ensembles can be transformed into empirical probability distribution (or density)
functions. Once the ensembles have been converted to probabilities, they are amenable to
evaluation with probabilistic scoring rules like CRPS. (See discussion on evaluating ensem-
bles in meteorology Br¨ocker (2012), Thorey et al. (2017)). When an uniform grid is used,
instead of Protocol 3, you can use Protocol 3a given below.
The game with the vector-valued forecasts. We consider the game presented in
Protocol 3 as a “limit” of a sequence of games with piecewise-constant distribution functions
as the forecasts (vector-valued forecasts).
Protocol 3a
Deﬁne wi,1 =
N for 1 ≤i ≤N and and ﬁx some grid-points z0, z1, . . . , zd in the interval [a, b],
∆= zs −zs−1 for all 1 ≤s ≤d.
FOR t = 1, . . . , T
1. Receive the vectors fi,t = (f 1
i,t, . . . f d
i,t) of the forecasts presented by the experts 1 ≤i ≤N.
2. Compute the aggregated forecast ft = (f 1
t , . . . , f d
t ) of the learner, where f s
t is deﬁned by (8),
namely,
f s
t = 1
2 −1
4 ln
PN
i=1 wi,te−2(f s
i,t)2
PN
i=1 wi,te−2(1−f s
i,t)2
for 1 ≤s ≤d.
3. Observe the true outcome yt and compute the losses λ(fi,t, ωyt) = ∆Pd
s=1(f s
i,t −ωs
yt)2 of
the experts 1 ≤i ≤N, and the loss λ(ft, ωyt) = ∆Pd
s=1(f s
t −ωs
yt)2 of the learner, where
ωyt = (ω1
yt, . . . , ωd
yt) and ωs
yt = 1zs≥yt.
4. Update the weights of the experts 1 ≤i ≤N
wi,t+1 = wi,te−
b−a λ(fi,t,ωyt).
ENDFOR
Using the analysis of Section 2, we obtain by (6) time-independent and grid-independent
bound for the regret
T
X
t=1
λ(ft, ωyt) ≤
T
X
t=1
λ(fi,t, ωyt) + b −a
ln N
(25)
for any i. Letting the grid-size d to inﬁnity (or ∆→0), we obtain the inequality (22) for
the limit quantities.
Results of experiments. In this section we present the results of experiments which
were performed on synthetic data.
The initial data was obtained by sampling from a
mixture of the three distinct probability distributions with the triangular densities. The
time interval is made up of several segments of the same length, and the weights of the
components of the mixture depend on time. We use two methods of mixing. By Method

Online Learning with Continuous Ranked Probability Score
1, only one generating probability distribution is a leader at each segment (i.e. its weight
is equal to one). By Method 2, the weights of the mixture components vary smoothly over
time (as shown in section B of Figure 1).
There are three experts i = 1, 2, 3, each of which assumes that the time series under
study is obtained as a result of sampling from the probability distribution with the ﬁxed
triangular density with given peak and base. Each expert evaluates the similarity of the
testing point of the series with its distribution using CRPS score.
We compare two rules of aggregations of the experts’ forecasts: Vovk’s AA (20) and the
weighted average (23).
In these experiments, we have used Fixed Share modiﬁcation (see Herbster and Warmuth
1998) of Protocol 3 and of its approximation – Protocol 3a, where we replace the rule (21)
with the two-level scheme
wµ
i,t =
wi,te−
b−aCRPS(F i
t ,yt)
NP
j=1
wj,te−
b−aCRPS(F j
t ,yt)
,
wi,t+1 = α
N + (1 −α)wµ
i,t,
where 0 < α < 1. We do the same for the rule (24). We set α = 0.001 in our experiments.7
Figure 1 shows the main stages of data generating (Method 1 – left, Method 2 - right)
and the results of aggregation of the experts models. Section A of the ﬁgure shows the
realizations of the trajectories of the three data generating distributions. The diagram in
Section B displays the actual relative weights that were used for mixing of the probability
distributions. Section C shows the result of sampling from the mixture distribution. The
diagram of Sections D and E show the weights of the experts assigned by the corresponding
Fixed Share algorithm in the online aggregating process using rules (20) and (23).
Figure 2 shows the cumulated losses of the experts and the cumulated losses of the
aggregating algorithm for both data generating methods (Method 1 – left, Method 2 -
right) and for both methods of computing the aggregated forecasts – by the rule (20) and
by the rule (23).
We note an advantage of rule (20) over the rule (23) in the case of
data generating Method 1, in which there is a rapid change in leadership of the generating
experts.
Figure 3 shows in 3D format the empirical distribution functions obtained online by
Protocol 3 for both data generating methods and the rule (20).
5. Conclusion
In this paper, the problem of aggregating the probabilistic forecasts is considered. In this
case, a popular example of proper scoring rule for continuous outcomes is the continuous
ranked probability score CRPS.
We present the theoretical analysis of the continuous ranked probability score CRPS
in the prediction with expert advice framework and illustrate these results with computer
experiments.
7.
In this case, using a suitable choice of the parameter α, we can obtain a bound O((k + 1) ln(TN)) for
the regret of the corresponding algorithm, where k is the number of swithing in the compound experts.

Online Learning with Continuous Ranked Probability Score
Figure 1: The stages of numerical experiments and the results of experts’ aggregation for two
data generation methods (Method 1 – left, Method 2 - right). (A) – realizations of the
trajectories for the three data generating distributions; (B) – weights of the distributions
assigned by the data generating method; (C) – sequence sampled from the distributions
deﬁned by Method 1 and Method 2; (D) – weights of the experts assigned online by the
AA using the rule (21) and Fixed Share update; (E) – weights of the experts assigned
online using the rule (24) and Fixed Share.
Figure 2: The cumulated losses of the experts (lines 1-3) and of the aggregating algorithm for both
data generating methods (Method 1 – left, Method 2 - right) and for both methods of
computing aggregated forecasts: line 4 – for the rule (23) and line 5 – for the rule (20).
We note an advantage of rule (20) over rule (23) in the case of data generating Method
1, in which there is a rapid change in leadership of the data generating distributions.
We have proved that the CRPS loss function is mixable and and then all machinery of the
Vovk’s Aggregating Algorithm can be applied. The proof is an application of prediction of
packs by Adamskiy et al. (2017): the probability distribution function can be approximated

Online Learning with Continuous Ranked Probability Score
Figure 3: Empirical distribution functions obtained online as a result of aggregation of the distri-
butions of three experts by the rule (20) for both data generating methods.
by a piecewise-constant function and further the method of aggregation of the generalized
square loss function have been used.
Basing on mixability of CRPS, we propose two methods for calculating the predictions
using the Vovk (1998) Aggregating Algorithm and simple mixture of the experts’ forecasts.
The time-independent upper bounds for the regret were obtained for both methods.
The obvious disadvantage of these results is that they are valid only for the outcomes
and distribution functions localized in ﬁnite intervals of the real line. It will be interesting
to modify the algorithm and obtain regret bounds for unbounded outcomes. Also, does the
learning rate
b−a is optimal is an open question.
We present the results of numerical experiments based on the proposed methods and
algorithms. These results show that two methods of computing forecasts lead to similar
empirical cumulative losses while the rule (20) results in four times less regret bound than
(23). We note a signiﬁcantly best performance of method (20) over method (23) in the case
where there is a rapid change in leadership of generating experts.
Acknowledgement
The authors are grateful to Vladimir Vovk and Yuri Kalnishkan for useful discussions that
led to improving the presentation of the results.
References
D. Adamskiy, T. Bellotti, R. Dzhamtyrova, Y. Kalnishkan. Aggregating Algorithm for Pre-
diction of Packs. Machine Learning, https://link.springer.com/article/10.1007/
s10994-018-5769-2 (arXiv:1710.08114 [cs.LG]).
G.W. Brier. Veriﬁcation of forecasts expressed in terms of probabilities. Mon. Weather Rev.,
78: 1–3, 1950.

Online Learning with Continuous Ranked Probability Score
J. Br¨ocker, L.A. Smith. Scoring probabilistic forecasts: The importance of being proper.
Weather and Forecasting, 22: 382–388, 2007.
J. Br¨ocker, L.A. Smith. From ensemble forecasts to predictive distribution functions. Tellus
A, 60: 663–678, 2008.
J. Br¨ocker. Evaluating raw ensembles with the continuous ranked probability score. Q. J.
R. Meteorol. Soc., 138: 1611–1617, July 2012 B.
N. Cesa-Bianchi, G. Lugosi. Prediction, Learning, and Games, Cambridge University Press,
2006.
E.S. Epstein. A scoring system for probability forecasts of ranked categories. J. Appl. Me-
teorol. Climatol., 8: 985–987, 1969.
Y. Freund, R.E. Schapire. A Decision-Theoretic Generalization of On-Line Learning and an
Application to Boosting. Journal of Computer and System Sciences, 55: 119–139, 1997.
I.J. Good. Rational Decisions. Journal of the Royal Statistical Society B, 14(1): 107–114,
1952. https://www.jstor.org/stable/2984087
M. Herbster, M. Warmuth. Tracking the best expert. Machine Learning, 32(2): 151–178,
1998.
A. Jordan, F. Kr¨uger, S. Lerch. Evaluating Probabilistic Forecasts with scoring Rules,
arXiv:1709.04743
N. Littlestone, M. Warmuth. The weighted majority algorithm. Information and Computa-
tion, 108: 212–261, 1994.
J.E. Matheson, R.L. Winkler. Scoring Rules for Continuous Probability Distributions. Man-
agement Science, 22(10): 1087-1096, 1976. doi:10.1287/mnsc.22.10.1087
A.E. Raftery, T. Gneiting, F. Balabdaoui, M. Polakowski. Using Bayesian model averaging
to calibrate forecast ensembles. Mon. Weather Rev., 133: 1155–1174, 2005.
J. Thorey, V. Mallet and P. Baudin. Online learning with the Continuous Ranked Probabil-
ity Score for ensemble forecasting. Quarterly Journal of the Royal Meteorological Society,
143: 521-529, January 2017 A DOI:10.1002/qj.2940
V. Vovk, Aggregating strategies. In M. Fulk and J. Case, editors, Proceedings of the 3rd
Annual Workshop on Computational Learning Theory, 371–383. San Mateo, CA, Morgan
Kaufmann, 1990.
V. Vovk, A game of prediction with expert advice. Journal of Computer and System Sci-
ences, 56(2): 153–173, 1998.
V. Vovk. Competitive on-line statistics. International Statistical Review, 69: 213–248, 2001.
V. Vovk, J. Shen, V. Manokhin, Min-ge Xie. Nonparametric predictive distributions based
on conformal prediction. Machine Learning, 108(3): 445-474, 2019. https://doi.org/
10.1007/s10994-018-5755-8