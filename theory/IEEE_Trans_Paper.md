Prediction Markets with Intermittent Contributions
Michael Vitali, Pierre Pinson, Fellow, IEEE
Abstract—Although both data availability and the demand for
accurate forecasts are increasing, collaboration between stake-
holders is often constrained by data ownership and competitive
interests. In contrast to recent proposals within cooperative game-
theoretical frameworks, we place ourselves in a more general
framework, based on prediction markets. There, independent
agents trade forecasts of uncertain future events in exchange for
rewards. We introduce and analyse a prediction market that (i)
accounts for the historical performance of the agents, (ii) adapts
to time-varying conditions, while (iii) permitting agents to enter
and exit the market at will. The proposed design employs robust
regression models to learn the optimal forecasts’ combination
whilst handling missing submissions. Moreover, we introduce
a pay-off allocation mechanism that considers both in-sample
and out-of-sample performance while satisfying several desirable
economic properties. Case-studies using simulated and real-world
data allow demonstrating the effectiveness and adaptability of the
proposed market design.
Index Terms—Online learning, forecast combination, predic-
tion markets, robust regression, renewable energy.
I. INTRODUCTION
Growing concerns about climate change and energy inde-
pendence led to a rapid expansion of solar and wind energy
production. Forecasting plays a crucial role in decision-making
processes, requiring high-quality data and advanced models.
The increase in data availability represents an opportunity
to refine these techniques and increase forecast quality, and
enable companies to increase profits or reduce costs. However,
data ownership issues often hinder progress, as companies
are reluctant to share information and to collaborate due to
competitive interests and security concerns.
A solution to increase collaboration is to give incentives
in exchange for these data. This can be done in different
ways, depending on whether the companies are willing to
share data. If this is the case, different methods have been
proposed for renewable power forecasting in the literature ex-
ploiting spatio-temporal relations. For solar power forecasting,
a model incorporating exogenous data from different sources
was developed [1], while a similar approach has been applied
to both wind and solar power forecasting [2]. In wind power
forecasting, sparse spatio-temporal models were introduced
in [3] and later extended in an online learning context [4].
Furthermore, to avoid the loss of privacy companies could
face, privacy-preserving solutions using distributed learning
methods have been proposed [5], with further advancements
addressing online settings [6, 7]. However, all these solutions
assume that the agents are willing to collaborate to improve
forecasts and that they act rationally and truthfully. This is
not always the case in practice. An alternative approach is
Michael Vitali and Pierre Pinson are with the Dyson School of Design
Engineering, Imperial College London, London, United Kingdom (e-mail:
m.vitali24@imperial.ac.uk; p.pinson@imperial.ac.uk).
to view the problem in a more general framework, through
prediction markets, in which companies choose to share their
individual forecasts and get rewarded for their contribution to
the resulting aggregate forecast.
In this context, prediction markets have been increasingly
studied in the last decade, gaining popularity across fields [8],
with two types of market being proposed: (i) contribution-
based and (ii) “winner takes it all”. The latter was proposed
by [9], where only the best solution is rewarded. However,
this type of market ignores the fact that forecasts other than
the best one can still provide additional information. Instead, a
contribution-based market rewards all the participants based on
the amount of information they brought into the final forecast
(as for the example of [10]).
Nevertheless, existing solutions fail to consider some es-
sential aspects of real-world applications such as: (i) real-time
implementation, (ii) historical contributions of the participants,
and (iii) the ability to accommodate intermittent participation,
meaning that participants may join or exit the market at any
time. The first two challenges can be seen as an online learning
problem, whilst the third one as a missing data problem.
For the latter, the literature has proposed robust variants of
linear regression [11, 12] and online imputation strategies
[13]. In addition, a pay-off allocation mechanism must be
designed to determine how rewards are distributed among
sellers, reflecting the informational value they contribute to
the final forecast. Also in this case, the allocation must reflect
historical contributions rather than only instantaneous perfor-
mance. In the literature, the most widely adopted approach
is the Shapley-value-based allocation [14] (see, for example,
[7]) and online versions of Shapley value calculation have
also been employed for dynamic pay-off distribution [15].
However, these approaches primarily focus on in-sample pay-
offs and fail to account for out-of-sample performance, over-
looking the actual contribution of sellers to genuine forecast
improvements. Finally, any allocation rule must also satisfy
several desirable economic properties to ensure fairness and
stability.
We introduce and analyse a prediction market1 that aims at
tackling the challenges described in the above. Building upon
[10], our market design accommodates different clients and
sellers that interact via a market operator. This results in the
following contributions:
• The market operator optimally combine input forecasts,
while allowing sellers to enter and exit the market at will.
This is done through the use of a robust linear regression
model that is able to predict in presence of missing data.
1Reproducibility
package:
https://github.com/MichaelVitali/prediction
markets

Additionally, this approach is extended, for the first time,
to operate in an online setting.
• A pay-off allocation is proposed accounting for both in-
sample and out-of-sample rewards. For the latter, we use
a scoring function that assesses the accuracy of each
reported forecast and rewards accordingly. Instead, for the
in-sample reward, we use a time-varying Shapley value.
This is done to reward consistency and informational
value provided by the seller over time.
The remainder of the manuscript is organized as follows:
Section II introduces the main concepts of the prediction
market design. Then, Section III describes its methodological
components, from adaptive robust linear regression to pay-off
allocation. It is followed by Section IV, showing different test
cases and corresponding results. Finally, Section V concludes
the paper and offers perspectives for future work.
II. PRELIMINARIES
A. Prediction Markets
Market-based analytics can be broadly categorized into data
markets and information markets, depending on whether the
exchanged good is raw data or derived information. We focus
on prediction markets, a specific subset of information mar-
kets. In prediction markets, participants trade forecasts about
uncertain future events. These markets combine individual
predictions to render a final forecast, communicated to the
buyer. Contributors to prediction markets are rewarded in
proportion to the value their individual forecasts add to the
final forecast. This is done via a mechanism with formal math-
ematical guarantees concerning desirable economic properties
such as budget balance, symmetry, etc.
B. Market Setup
Our market design involves the interaction of multiple
clients and sellers, through a central market operator. In
its most general form, the market deals with nonparametric
probabilistic forecasts, for a continuous variable of interest,
based on a set of quantiles for various nominal levels. We
define the participant roles as follows:
• client ci: individual who requires a forecast for a variable
of interest (i.e., wind power generation at a set of lead
times). The client may or may not already possess their
own forecast; in our setup, we focus on clients without
an available forecast. We further assume that the client
can evaluate the utility Ut derived from a forecast, for
instance in terms of profit gains or cost reductions, which
is used as a basis for payment for forecast improvement.
• seller si: forecaster willing to provide forecasts for the
variable of interest, and in the format required by the
client. We assume that each seller is contracted and
allowed to miss submitting predictions for a maximum
proportion of time, e.g. 10% (which may or may not be
at random). We denote the set of agents participating in
the market as S = {s1, s2, . . . , sn}.
• market operator: central entity responsible for managing
the market through a centralized platform. It enables
clients to post forecasting tasks for a variable of interest,
while allowing sellers to submit their predictions in
response to these tasks. Beyond facilitating this exchange,
the operator is also responsible for producing the final
forecasts, collecting the payment of the clients, and re-
distributing rewards among participating sellers following
a well-defined allocation rule.
For clarity and simplicity, the following sections of this paper
will focus on a setting with a single client interacting with
multiple sellers.
C. Overview of Market Operation
Fig. 1 provides an overview of the market and a high-level
description of the sequential steps for the nominal level τ.
At the start of market operations, the absence of historical
data presents a challenge for initializing both the ensemble
weights and the payoff mechanism. A practical solution is to
initialize the weights w(τ)
t
uniformly across all participating
sellers. In parallel, the Shapley values φc(τ)
t
are initialized to
0. Following this initialization, the process begins with the
market opening a session for a specified task. This session
remains open for a limited time, during which sellers may
submit their forecasts. If the i-th forecast is not submitted, the
model finds the missing information from other forecasters
(see III-B for details). Once the session closes, the market
operator aggregates the submitted forecasts into a combined
prediction and delivers it to the client. After the event occurs,
the client reports the realization yt+1 to the market operator
together with the generated utility Ut. At this stage, the market
operator performs two parallel operations: (1) updating the
model and propagating the new weights forward, and (2)
computing pay-off allocations so that each seller receives
their corresponding reward. In addition, the updated in-sample
values are incorporated into the next model run.
D. Forecast combination
We
define
the
set
of
input
forecasts
as
ˆXt
=
{ ˆX1,t, ˆX2,t, . . . , ˆXn,t} ∈Rn×k×m, from the set of sellers
S, with m the number of quantiles (with different nominal
levels) and k the lead time. The forecast provided by the i-th
seller is ˆXi,t = {ˆxi,t+1|t, . . . , ˆxi,t+k|t}. The market operator
generates the aggregated forecasts as a weighted average of
input forecasts, for each nominal level τ. The weight wi (for
seller si) reflects their relative historical performance.
For simplicity, when describing methodological elements,
we focus on the case k = 1 and a fixed nominal level
τ. The set of input forecasts then reduces to ˆx(τ)
t
=
{ˆx(τ)
1,t+1|t, . . . , ˆx(τ)
n,t+1|t}. The combined forecast is given as a
convex combination of the input forecasts, i.e.,
ˆy(τ)
t+1|t =
n
X
i=1
wiˆx(τ)
i,t+1|t,
n
X
i=1
wi = 1,
wi ≥0
(1)
In our setup, the weights wi’s are non-negative and sum to
one, to improve interpretability. In the general case, such con-
straints are not strictly necessary: weights could be negative
and not sum to one. For a comprehensive overview of the state
of the art with forecast combination, we refer the reader [16].

Market opens 
session
𝑠1,𝑡
𝑠2,𝑡
𝑠𝑛,𝑡
Is the i-th 
forecast 
available?
𝛼𝑖,𝑡= 0
ො𝑥𝑖,𝑡+1|𝑡
(𝜏)
𝛼𝑖,𝑡
= ො𝑥𝑖,𝑡+1|𝑡
(𝜏)
𝛼𝑖,𝑡= 1
ො𝑥𝑖,𝑡+1|𝑡
(𝜏)
𝛼𝑖,𝑡 = 0 
Yes
No
Forecast Combination
Market closes 
session
𝑐𝑖
Pre-event
Event
Post-event
𝑐𝑖
Model Update
In-sample 
allocation
Out-of-sample 
allocation
+
𝑦𝑡+1
𝝋𝑡−1
𝑐(𝜏)
𝒓𝑡
(𝜏)
𝝋𝑡
𝑐(𝜏)
𝒘𝑡+1
(𝜏) , 𝐷𝑡+1
(𝜏)
MO
𝒘𝑡
(𝜏), 𝑫𝑡
(𝜏)
𝑈𝑡
(𝜏) 
Time
Payoff allocation
ො𝑦𝑡+1|𝑡
(𝜏)
Fig. 1: Market design overview
E. Pay-off allocation
A pay-off function is central to the design of a market
mechanism as it distributes the generated utility among the
market players (sellers) according to their performances. For
this reason, it is critical to design a pay-off function that
encourages market participation, whilst reflecting seller’s con-
tributions. The pay-off function is characterized by several
economic properties that can be mathematically proven, such
as budget balance, zero element, etc. Furthermore, the pay-
off function can be divided into in-sample and out-of-sample
pay-off allocation. The former is used to reward forecast
consistency and informational value provided by the sellers in
time, whilst the out-of-sample is used to reward good forecasts.
III. METHODOLOGY
A. Forecast combination
In this work, the forecast combination is performed using a
Linear Regression (LR) model, as introduced in (1). To adapt
to potential changes in market dynamics over time, the method
is extended to an online learning setting, allowing the model
to continuously update and learn the optimal combination of
forecasts (weights) in time. For any quantile τ of interest a
different LR is learned enabling separate learning dynamics
for each level.
The model weights are updated online using online gradient
descent (OGD). To derive the update rule, we first define the
objective function. In this work, since focusing on nonpara-
metric probabilistic forecasting, we employ the quantile loss
(or, pinball loss), defined as
L(τ)(y, ˆy) =
(
(y −ˆy)τ
if y ≥ˆy
(ˆy −y)(1 −τ)
if ˆy > y
(2)
where y is the observation, ˆy is the aggregated forecast, and
τ is the target quantile level. Since the quantile loss is non-
differentiable at zero, we utilize the sub-gradient approach
studied in [17].
Applying the chain rule to the loss function with respect
to an individual weight wi,t, we obtain the following sub-
gradient:
∂L(yt+1, ˆy(τ)
t+1|t)
∂wi,t
=
(
−τ ˆx(τ)
i,t+1|t
if yt+1 ≥ˆy(τ)
t+1|t
(1 −τ)ˆx(τ)
i,t+1|t
if ˆy(τ)
t+1|t > yt+1
(3)
Consequently, the weight vector is updated at each step as
follows
w(τ)
t+1 = ΠH

w(τ)
t
−η∇wL(yt+1, ˆy(τ)
t+1|t)

(4)
where η is the learning rate and ΠH(·) denotes the Euclidean
projection onto the feasible set H defined by the constraints
in (1). Specifically, H is the probability simplex
H =
(
w ∈Rn :
n
X
i=1
wi = 1, wi ≥0
)
(5)
B. Adaptive Robust Linear Regression
The standard linear combination assumes that sellers submit
predictions at every market session. However, this is unrealistic
in real-world scenarios. Thus, to allow sellers to participate
at will, we adopt a robust variant of the linear regression
(LR) model capable of handling missing forecasts. Originally
introduced in [11] and applied in [12], this method learns a
linear correction matrix D(τ) among input forecast, and use
this correction to modify the combination weights when some
input forecasts are unavailable. In essence, the model com-
pensates for the missing information by extracting additional
one from the remaining available forecasts. In this work, we
extend this method to the online learning setting.
We model the availability of the forecasts using a binary
variable αi,t, which takes value 1 if the i-th forecast is
unavailable at time t, and 0 otherwise. The forecast vector
is redefined such that missing values are zeroed out. Using
this, we redefine the forecast vector as
ˆx(τ)
i,t+1|t(αi,t) =
(
ˆx(τ)
i,t+1|t
if αi,t = 0
if αi,t = 1
(6)

The robust forecast combination is then defined as
ˆy(τ)
t+1|t = [θ(τ)(αt)]⊤ˆx(τ)
t
(αt)
= (w(τ) + D(τ)αt)⊤ˆx(τ)
t
(αt)
(7)
Here, w(τ) represents the baseline model when all features
are available, while the element D(τ)
i,j
represents the linear
correction applied to weight w(τ)
i
specifically when the j-th
forecast is missing.
We extend this method to the online learning setting by
deriving update rules for both w and D. The gradient for the
base weights w remains as derived in (3). For the correction
matrix, we derive the gradient with respect to Di,j, which
yields
∂L(yt+1, ˆy(τ)
t+1|t)
∂Di,j;t
=
(
−τ ˆx(τ)
i,t+1|tαj,t
if yt+1 ≥ˆy(τ)
t+1|t
(1 −τ)ˆx(τ)
i,t+1|tαj,t
if ˆy(τ)
t+1|t > yt+1
(8)
Based on these gradients, the parameters are updated itera-
tively
w(τ)
t+1 = ΠH

w(τ)
t
−η∇wL(yt+1, ˆy(τ)
t+1|t)

(9)
D(τ)
t+1 = D(τ)
t
−η∇DL(yt+1, ˆy(τ)
t+1|t)
(10)
with η learning rate. As in the standard case, a projection step
ΠH(·) is applied to satisfy the constraints in (1). From (7)-(10),
it is evident that the updates depend on the forecast availability
vector αt. Specifically, when computing the gradient of the
loss function, we observe that the weights corresponding to
missing forecasts are not updated, whilst the linear correction
matrix is updated only when at least one forecast is missing.
C. Pay-off Allocation
When the client provides the true realization yt, the total
available reward Ut has to be split accordingly to both the
in-sample and out-of-sample allocations. The amount of al-
location allocated to the two is defined by δ. Let’s assume
that the total reward is divide equally for each quantile level
(U (τ)
t
). We have that the reward for the i-th sellers at time t
for the quantile level τ is
r(τ)
i,t = U (τ)
t
[δris(τ)
i,t
+ (1 −δ)roos(τ)
i,t
]
(11)
where ris(τ)
i,t
is the in-sample allocation and roos(τ)
i,t
the out-of-
sample one. Finally, the total reward for each seller is defined
as ri,t = Pm
τ=1 r(τ)
i,t .
1) In-sample allocation: The primary objective of the in-
sample allocation is to reward sellers who consistently con-
tribute valuable information to the market. This problem is
seen as a cooperative game, where the allocation of the total
reward is determined using Shapley values (the definition of
which is available at, e.g., [14]). The marginal contribution of
seller si at time t is defined as
φs(τ)
i,t
=
(
SHAP(τ)
i,t (yt+1, ˆx(τ)
t
, θ(τ)
t
)
if αi,t = 0
otherwise
(12)
If a seller is unavailable at time t, their Shapley value
is set to zero. For the remaining sellers, the Shapley values
are computed using the corrected weights. In doing so, the
method acknowledges that sellers with strong performance
helps mitigate the negative impact of missing forecasts on the
final aggregated prediction giving them higher value.
However, our goal is to reward sellers not only for their
current contributions, but also for the historical informational
value they have provided. To achieve this, we employ an online
variant of the Shapley value, which is updated over time as
φc(τ)
i,t
= λφc(τ)
i,t−1 + (1 −λ)φs(τ)
i,t
(13)
with λ forgetting factor.
Finally, the in-sample reward is calculated as
ris(τ)
i,t
=



max(0,φc(τ)
i,t )
P
j max(0,φc(τ)
j,t )1{αj,t=0} ,
if αi,t = 0
0,
otherwise
(14)
From the above formula, if the recursive value is negative, it
is set to zero. Otherwise, the reward is scaled back considering
only the participating sellers so that P
j ris(τ)
j,t
= 1.
2) Out-of-sample allocation: Differently from the previous
allocation, the out-of-sample allocation is used to reward
sellers for their instantaneous performance. This is performed
using a scoring function
sc(τ)
i,t =



1 −
L(yt+1,ˆx(τ)
i,t+1|t)
P
j L(yt+1,ˆx(τ)
j,t+1|t)1{αj,t=0} ,
if αi,t = 0
0,
otherwise
(15)
where L(yt+1, ˆx(τ)
i,t+1|t) is the loss for the i-th forecast. In
our framework, the quantile loss is used to evaluate the
forecasting accuracy. Similarly to the in-sample allocation, the
score for any missing seller is set to zero, while the scores for
present sellers are computed exclusively based on the subset
of available forecasts.
We have that the out-of-sample reward is defined as
roos(τ)
i,t
=
sc(τ)
i,t
P
j sc(τ)
j,t 1{αj,t=0}
(16)
3) Properties: In our setting, the pay-off allocation function
must satisfy key economic properties to incentivize partic-
ipation, encourage truthful forecasts, and ensure consistent
rewards. We formally define these properties, and sketch the
proof of their validity, in the following.
Budget Balance: This property guarantees that the market
operator redistributes the exact amount of generated utility
among the sellers. For any forecast vector ˆx(τ)
t
and realization
yt+1, we verify this by summing the individual rewards:
X
i
r(τ)
i,t =
X
i
U (τ)
t
h
δris(τ)
i,t
+ (1 −δ)roos(τ)
i,t
i
= U (τ)
t
"
δ
X
i
ris(τ)
i,t
+ (1 −δ)
X
i
roos(τ)
i,t
#
= U (τ)
t
.
(17)
Thus, the sum of distributed payments equals the total utility
generated.
Symmetry (or, interchangeability): Two sellers who provide
identical forecasts must receive identical rewards. Suppose

sellers si and sj provide identical forecasts, then by the
symmetry property of the Shapley value, φc(τ)
i,t
= φc(τ)
j,t . More-
over, identical forecasts yield identical out-of-sample losses,
L(yt+1, ˆx(τ)
i,t+1|t) = L(yt+1, ˆx(τ)
j,t+1|t), implying equal out-of-
sample rewards. Therefore, their final rewards are identical.
Zero-Element (or, dummy agent): Sellers who do not
participate should receive no reward. Indeed, if seller i does
not submit a forecast at time t, we set αi,t = 1. Based on the
reward construction in (14) and (15), this explicitly forces the
reward to zero, satisfying the property for missing forecasts.
Individual Rationality: This guarantees that no seller is
penalized for participating (i.e., pay-offs are non-negative).
As observed in (14)-(16), the reward formulation prevents
negative values for available sellers, and is exactly zero for
unavailable ones. Therefore, ri,t ≥0 holds for all i, t.
Truthfulness (or, incentive compatibility) Sellers maximize
their expected reward only by reporting their true forecasts.
Following the original work on robust linear regression used
for our setting [11], the method can be interpreted as a linear
regression model with d + d2 features. Under this interpre-
tation, we can directly apply the truthfulness proof of [18],
which shows that altering a feature leads to a strictly higher
loss compared to leaving it unaltered. Moreover, it has been
established that for linear models, Shapley values preserve
truthfulness [18]. Consequently, in our case, the in-sample
reward is maximized when the forecast is reported truthfully.
Since any alteration also increases the out-of-sample loss, the
corresponding reward is lower than that obtained under truthful
reporting. Therefore, the overall reward is maximized when the
true forecast is provided.
IV. APPLICATION AND CASE-STUDIES
To demonstrate the proposed market and methods, we begin
by evaluating the forecasting combination algorithms and pay-
off allocation across several examples, starting with two syn-
thetic test cases and concluding with a real-world forecasting
scenario. These case studies are, of course, simplified versions
of what would be implemented in real-world applications.
A. Synthetic Test Cases
To test the methods proposed in the previous sections, we
generated two different environments. First, we implement a
time-invariant process that shows the efficacy of the methods
proposed and their convergence. Then, a time-varying process
is proposed to showcase the ability of the methods to adapt to
changes in the dynamics of the environment.
In both scenarios, we consider a single buyer and three
sellers. Each forecaster is modeled using a Normal distribu-
tion, and the realizations Yt are generated as a combination
of the sellers’ distributions. We refer to the standard linear
regression model using quantile regression as QR, and with
RQR to the robust implementation. To evaluate performance,
we performed a Monte Carlo simulation consisting of 200 in-
dependent experiments, with T = 20000. For all scenarios, the
learning rate of the aggregation method was set to η = 0.01,
the payoff allocation parameter to δ = 0.7, and the forgetting
factor to λ = 0.999.
1) Time-invariant case: The primary goal of this scenario
is to verify that the proposed methods works correctly and
converge to optimal weights over time. Let µi,t and σi,t denote
the mean and standard deviation of the i-th seller at time t.
The seller’s distribution is defined as follows
fi,t ∼N(µi,t; σi,t)
(18)
where µi,t = Ci + αϵi,t, with Ci constant, ϵi,t ∼N(0, 1). In
our setup, we consider three sellers having C1 = 0, C2 = 1
and C3 = 2, α = 0.5, and σ1,t = σ2,t = σ3,t = 1.
Finally, the realizations are generated as follows
Yt ∼N(µt; σt)
(19)
where µt = Pn
i=1 wiµi,t, σt = Pn
i=1 wiσi,t, and w is the
vector of weights to be learned. In our case, the weights are
set to w = [0.1, 0.6, 0.3].
Figure 2 illustrates the convergence behavior of both pro-
posed methods (QR top, RQR bottom) with time horizon
k = 1 and quantile level τ = 0.5. In the RQR case, forecasters
are randomly missing with probability 5%. As expected, both
algorithms converge over time toward the optimal weights
combination.
Fig. 2: Convergence of estimated weights for QR (top) and
RQR (bottom) with k = 1 and τ = 0.5.
Figure 3 shows the pay-off allocation for both methods. We
consider three quantile levels, m = [0.1, 0.5, 0.9], with a total
reward of £100 at each time t equally distributed across levels.
The final reward of the i-th seller is obtained by summing the
rewards for each quantile. As the model weights converge, the
reward trajectories stabilize. In the RQR case (bottom plot),
the total rewards fluctuate more due to missing forecasts.
2) Time-varying case: In this setting, we simulate a dy-
namic environment in which the combination of weights
evolves over time. The goal is to demonstrate that the proposed
methods can detect these changes and adapt accordingly. This
property is crucial, as real-world applications are inherently
dynamic and subject to temporal variation. To do so, we
introduce a periodic coefficient defined as
βt = 1

1 + sin
2πt
T

,
βt ∈[0, 1]
(20)
Using this coefficient, we define the target weight vector as
wtarget
t
= (1 −βt)w(1) + βtw(2)
(21)

Fig. 3: Pay-off allocation for QR (top) and RQR (bottom)
with three quantile levels m = {0.1, 0.5, 0.9} and a total step
reward of £100.
where w(1) and w(2) are two different weight combinations.
The actual weights used at time t are then updated recursively
wt = λwt−1 + (1 −λ)wtarget
t
(22)
Finally, the realizations are generated according to (19).
The results shown in Fig. 4 reports the evolution of the
estimated weights in a dynamic scenario. Both methods are
able to adapt to the evolving environment, with the estimated
weights following the underlying periodic pattern. As ex-
pected, convergence is not exact, but the overall dynamics are
well captured. Also in this case the quantile level considered
is τ = 0.5, and for RQR (bottom) the missing rate is 5%.
Fig. 4: Convergence of estimated weights for QR (top) and
RQR (bottom) with k = 1 and τ = 0.5 in a time-varying
scenario.
B. Performance with Varying Missingness
In this section, we compare the adaptive QR methods
against two benchmark imputation strategies: mean imputa-
tion and last-value imputation. The evaluation focuses on
the model’s tracking performance and how it is affected
by different rates of missingness over time. All results are
presented for the quantile level τ = 0.1.
The performance of the proposed RQR algorithm was
evaluated against two benchmark models, last-impute and
mean-impute. Three different sellers were considered with
weights w1, w2, w3. The evaluation was based on two key
metrics: bias and variance. The results presented in Table I,
calculated excluding the first 5000 steps (to consider the results
after convergence), show that RQR model has lower variance
(∼1.7) compared to the imputation ones (∼2.5). This lower
variance indicates that RQR’s predictions are more stable and
exhibit greater consistency across different samples of data. In
terms of bias, RQR generally achieved superior or comparable
performance. The most significant difference was observed for
w2 and w3, where RQR’s bias was much lower than that of
last-impute, whilst having similar results to mean-impute.
TABLE I: Bias and variance for the proposed RQR and the
two benchmark models (all values are in units of 10−3)
w1
w2
w3
bias
var
bias
var
bias
var
RQR
4.8 ± 3.9
1.7 ± 0.14
−5 ± 6.5
1.7 ± 0.2
0.3 ± 4
1.7 ± 0.16
Last
Impute
5 ± 4.6
2.5 ± 0.2
−35 ± 7
2.5 ± 0.3
−18 ± 6
2.5 ± 0.2
Mean
Impute
7 ± 5
2.5 ± 0.2
−8 ± 9.4
2.5 ± 0.4
−0.3 ± 0.6
2.5 ± 0.2
Fig. 5 illustrates the bias of the RQR method under varying
levels of missingness. The missingness rate ranges from 5%
to 90%, with the constraint that at least one seller is always
present. The results indicate that, at low missingness rates,
the model exhibits an average bias close to zero. As the miss-
ingness rate increases, the bias also rises, which is expected
since the model becomes less capable of learning the optimal
combination and compensating through the linear correction.
In terms of variance, however, the differences are minimal,
indicating that the model maintains consistent performance
even under high missingness conditions.
Fig. 5: Bias with varying missingness rate ranging from 5%
to 90%.
C. Real-world Forecasting Problem
We demonstrate the proposed market framework through
a wind energy forecasting case study. The analysis focuses

on day-ahead probabilistic power forecasting for an offshore
wind farm located in Belgium. The power production data are
obtained from the open data portal of the Belgian Electricity
System Operator, Elia Group [19]. The wind farm has a
nominal installed capacity of 2,262.1 MW, and the dataset
covers the period from 2024-01-01 to 2025-12-31 at a 15
min resolution. As sellers instead, we include forecasts from
three NWP models, namely (i) the High-Resolution Fore-
cast (HRES) from the European Centre for Medium-Range
Weather Forecasts (ECMWF) [20], (ii) the Global Forecast
System (GFS) from the National Oceanic and Atmospheric
Administration (NOAA) [21], and (iii) the ICON-EU from
Deutscher Wetterdienst (DWD) [22]. For each NWP dataset,
we consider a grid surrounding the wind farm location. These
spatial features are subsequently transformed using Principal
Component Analysis (PCA) in order to obtain a reduced set of
uncorrelated predictors. The resulting pre-processed features
are then used to train three different probabilistic forecasting
models for each NWP source. Specifically, we employ (i)
Extreme Gradient Boosting (XGBoost), (ii) Quantile Regres-
sion Forests (QRF), and (iii) a Multi-Layer Perceptron (MLP).
Since three models are fitted for each of the three NWP
datasets, this results in a total of nine probabilistic forecasts
that are subsequently considered as input to the market. It is
worth emphasizing that the primary objective of this study is
not to develop the most accurate individual forecasting models,
but rather to demonstrate the effectiveness of the proposed
market framework.
Moreover, the individual forecasting models were trained
exclusively on data from 2024. Then, the cross-validation and
testing of the online prediction market were performed on
data from 2025. To improve convergence and reduce gradi-
ent variance when adapting market weights across multiple
lead times, we implemented a mini-batch strategy for the
online gradient updates, averaging the loss across each batch.
Specifically, to determine the best learning rate and batch
size for the online prediction market, cross-validation was
performed on the first two months of 2025 (January and
February). We conducted a grid search over the learning
rates η ∈{0.2, 0.1, 0.05, 0.01, 0.005} and batch percentages
b ∈{0.05, 0.1, 0.2, 0.5, 1.0}. The optimal hyperparameters for
the market mechanism were identified as 0.1 for both the
learning rate and the batch size percentage. Final testing was
then performed on the remaining ten months of 2025, where
the initial two-month cross-validation timeframe was utilized
as a burn-in period to initialize the online mechanism.
Finally, to assess the robustness of the results, we conduct
a Monte Carlo simulation consisting of 100 independent
experiments. The reported performance metrics correspond to
the average results over these runs.
Table II shows the quantile loss achieved by all consid-
ered methods across the different nominal levels. Overall,
models trained using weather forecasts from ECMWF exhibit
superior predictive performance compared the others. Of the
combination method, QR delivers the best overall performance
and serves as an oracle benchmark, as it assumes full in-
formation availability. This result confirms that combining
forecasts based on heterogeneous information sources leads
TABLE II: Quantile loss for different nominal levels and
methods.
Model
Quantile
0.1
0.5
0.9
ECMWF
QRF
37.76
86.68
45.78
MLP
37.18
85.45
41.05
XGB
36.19
82.38
43.92
NOAA
QRF
41.11
100.42
52.24
MLP
40.13
96.98
49.14
XGB
38.66
95.96
50.79
DWD
QRF
40.14
96.40
49.59
MLP
38.13
90.36
44.48
XGB
38.43
91.55
48.12
Combination
QR
34.01
76.84
36.72
RQR - 5%
34.79
81.55
39.07
RQR - 10%
35.59
84.81
40.34
RQR - 20%
37.43
91.44
45.25
to improved probabilistic accuracy. The main objective of this
work, however, is to design a method that remains effective
in the presence of missing data. In this respect, the proposed
RQR approach demonstrates strong robustness. Even with 5%
missingness, RQR achieves quantile loss values that remain
very close to the oracle QR benchmark, while still improving
upon the best individual weather-based model. This shows that
the method is capable of efficiently exploiting the available
information and mitigating the negative impact of partial data
unavailability. Finally, as expected, the quantile loss increases
monotonically with the missingness rate.
May
Jul
Sep
Nov
QR
RQR
ECMWF_XGB
Time Step
Moving Average Loss
Instantaneous Loss
Avg Quantile Loss
Fig. 6: Moving average and instantaneous loss of the best-
performing expert as well as the online combination methods.
Fig. 6 illustrates the instantaneous loss (bottom panel)
and seven-day moving average loss (top panel) for the most
accurate individual expert (ECMWF-XGB) alongside the com-
bination methods. While the instantaneous loss highlights the
high daily volatility of the predictions, it shows that the oracle
(QR) and RQR (with 5% missingness) generally mitigate the
most severe error spikes compared to the single expert. The
advantages of these adaptive combination techniques become
particularly evident when examining the moving average loss.

Here, RQR demonstrates robust predictive capability, consis-
tently maintaining a lower moving average loss than the single
best forecaster. It becomes clear that adaptive techniques prove
highly beneficial in instances where one or more experts un-
derperform; this is notably visible after November, where the
moving average loss of the single expert spikes significantly
above the combination methods.
0.1
0.2
0.1
0.2
0.3
May
Jul
Sep
Nov
0.1
0.2
0.3
ECMWF_NN
NOAA_NN
DWD_NN
ECMWF_XGB
NOAA_XGB
DWD_XGB
ECMWF_QRF
NOAA_QRF
DWD_QRF
Time Step
Weights for Quantile 0.1
Weights for Quantile 0.5
Weights for Quantile 0.9
Weights
Fig. 7: The evolution of weights for each quantile level over
time for the RQR model.
Figure 7 displays the seven-day moving average of the
combination weights for each quantile level over the test
period. Overall, the largest and most stable weights are as-
signed to ECMWF-MLP and ECMWF-XGB across all nom-
inal levels, which is consistent with the results in Table II.
Interestingly, the DWD-MLP expert exhibits a distinct time-
varying behavior. For the lower quantile level (0.1), its weight
increases noticeably during the second half of the test period.
Moreover, between June and September, DWD-MLP attains
the highest weight for both the median (0.5) and upper (0.9)
quantiles. This occurs despite its overall performance being
less competitive when evaluated across the entire test set.
May
Jul
Sep
Nov
ECMWF_NN
NOAA_NN
DWD_NN
ECMWF_XGB
NOAA_XGB
DWD_XGB
ECMWF_QRF
NOAA_QRF
DWD_QRF
Time Step
Moving Average Reward
Instantaneous Reward
Rewards (£)
Fig. 8: Moving average and instantaneous rewards for all
market participants considering the RQR method.
Fig. 8 illustrates the total reward distribution across all
forecasters. Because the reward calculation prioritizes the
Shapley value over instantaneous error, the dynamics explicitly
emphasize models that yield the most distinct predictive value.
Notably, the MLP and XGB models trained on ECMWF
data accumulate the highest sustained rewards over time. This
demonstrates their ability to consistently deliver substantial
unique information while maintaining strong temporal accu-
racy (see Table I). Additionally, the reward for the DWD-
MLP model exhibits a clear upward trend that mirrors the
shifts observed in the weight distributions. This growth is
likely driven by a concurrent improvement in both the model’s
accuracy and the unique informational value it contributes to
the aggregated forecast.
Finally, Table III details the monthly reward distribution
among the nine market participants, supporting the trends
observed in the moving average plots. Overall, the ECMWF-
MLP and ECMWF-XGB models consistently achieve the
highest monthly rewards. The temporal dynamics also reveal
distinct performance shifts over the year: notably, DWD-MLP
demonstrates a strong upward trend, while ECMWF-QRF
exhibits a downward trend.
V. CONCLUSIONS
The growing availability of data offers unprecedented op-
portunities to advance forecasting models and improve the
integration of renewable energy generation. Yet, competitive
interests and concerns over data privacy often prevent stake-
holders from sharing information. There, we proposed a new
prediction market platform that enables communication among
stakeholders while incentivizing participation through rewards.
Our market design considers many real-world application
challenges and demonstrates how those can be solved. Several
challenges remain open. E.g., the market can be extended to a
fully dynamic setting, where the market allows a dynamic set
of participants over time. And, alternative pay-off allocation
mechanisms beyond Shapley value should be explored to
reduce computational complexity and enhance scalability.
REFERENCES
[1] R. Bessa, A. Trindade, C. S. Silva, and V. Miranda,
“Probabilistic solar power forecasting in smart grids
using distributed information,” International Journal of
Electrical Power & Energy Systems, vol. 72, pp. 16–23,
2015.
[2] J. R. Andrade and R. J. Bessa, “Improving renewable
energy forecasting with a grid of numerical weather
predictions,” IEEE Transactions on Sustainable Energy,
vol. 8, no. 4, pp. 1571–1580, 2017.
[3] J. Dowell and P. Pinson, “Very-short-term probabilistic
wind power forecasts by sparse vector autoregression,”
IEEE Transactions on Smart Grid, vol. 7, no. 2, pp. 763–
770, 2016.
[4] J. W. Messner and P. Pinson, “Online adaptive lasso
estimation in vector autoregressive models for high
dimensional wind power forecasting,” Int. Journal of
Forecasting, vol. 35, no. 4, pp. 1485–1498, 2019.

TABLE III: Monthly rewards for different methods (March - December 2025).
Model
Mar
Apr
May
Jun
Jul
Aug
Sep
Oct
Nov
Dec
ECMWF
QRF
467.70
485.00
485.86
439.90
413.26
383.76
332.02
316.13
308.12
335.02
MLP
415.65
451.01
478.22
487.03
517.99
530.06
548.49
589.32
558.59
489.87
XGB
422.05
448.96
471.86
454.84
470.98
466.49
499.70
531.54
516.31
461.82
NOAA
QRF
368.29
343.47
338.99
296.48
288.74
273.87
235.84
219.48
196.40
187.65
MLP
255.22
235.80
240.33
248.33
277.19
287.12
269.54
278.29
240.93
215.59
XGB
276.59
255.17
259.37
247.07
255.78
249.98
226.54
215.95
191.80
183.76
DWD
QRF
268.66
251.36
245.26
205.96
204.48
197.92
178.36
179.07
176.04
197.97
MLP
258.68
259.30
283.65
335.58
391.14
425.74
439.86
487.21
456.57
409.87
XGB
263.21
254.76
260.77
249.57
247.54
236.76
211.56
209.04
202.87
212.30
[5] L. Cavalcante, R. J. Bessa, M. Reis, and J. Browell,
“Lasso vector autoregression structures for very short-
term wind power forecasting,” Wind Energy, vol. 20,
no. 4, pp. 657–675, 2017.
[6] B. Sommer, P. Pinson, J. W. Messner, and D. Obst,
“Online distributed learning in wind power forecasting,”
International Journal of Forecasting, vol. 37, no. 1, pp.
205–223, 2021.
[7] C. Gonc¸alves, R. J. Bessa, and P. Pinson, “Privacy-
preserving distributed learning for renewable energy
forecasting,” IEEE Transactions on Sustainable Energy,
vol. 12, no. 3, pp. 1777–1787, 2021.
[8] C. Horn, M. Ohneberg, B. Ivens, and A. Brem, “Pre-
diction markets: A literature review 2014,” Journal of
Prediction Markets, vol. 8, pp. 89–126, 2014.
[9] J. Witkowski, R. Freeman, J. W. Vaughan, D. M. Pen-
nock, and A. Krause, “Incentive-compatible forecasting
competitions,” Management Science, vol. 69, no. 3, p.
1354–1374, 2022.
[10] A. A. Raja, P. Pinson, J. Kazempour, and S. Grammatico,
“A market for trading forecasts: A wagering mechanism,”
International Journal of Forecasting, vol. 40, no. 1, pp.
142–159, 2024.
[11] D. Bertsimas, A. Delarue, and J. Pauphilet, “Adaptive
optimization for prediction with missing data,” Machine
Learning, vol. 114, 2025, art. no. 124.
[12] A. Stratigakos and P. Andrianesis, “Learning data-
driven uncertainty set partitions for robust and adaptive
energy forecasting with missing data,” 2025. [Online].
Available: https://arxiv.org/abs/2503.20410
[13] C. F. Grønvald, “Online regression markets with varying
feature space,” Master’s thesis, Technical University of
Denmark, 2024.
[14] L. S. Shapley et al., “A value for n-person games,”
Contributions Theory Games, vol. 2, no. 28, p. 307–317,
1953.
[15] A. A. Raja and S. Grammatico, “Online coalitional
games for real-time payoff distribution with applications
to energy markets,” IEEE Transactions on Energy Mar-
kets, Policy and Regulation, vol. 1, no. 2, pp. 97–106,
2023.
[16] X. Wang, R. J. Hyndman, F. Li, and Y. Kang, “Forecast
combinations: An over 50-year review,” International
Journal of Forecasting, vol. 39, no. 4, pp. 1518–1547,
2023.
[17] Y. Shen, D. Xia, and W.-X. Zhou, “Online quantile
regression,” 2025. [Online]. Available: https://arxiv.org/
abs/2402.04602
[18] T. Falconer, J. Kazempour, and P. Pinson, “Bayesian
regression markets,” Journal of Machine Learning Re-
search, vol. 25, no. 180, p. 1–38, 2024.
[19] Elia,
“Wind
power
production
estimation
and
forecast
on
belgian
grid.”
[Online].
Avail-
able:
https://opendata.elia.be/explore/dataset/ods031/
table/?sort=datetime&refine.offshoreonshore=Offshore
[20] European Centre for Medium-Range Weather Forecasts,
“Ecmwf
ifs
high-resolution
operational
forecasts,”
2016. [Online]. Available: https://rda.ucar.edu/datasets/
d113001/
[21] National Centers for Environmental Prediction, National
Weather Service, NOAA, U.S. Department of Commerce,
“Ncep gfs 0.25 degree global forecast grids historical
archive,” 2015. [Online]. Available: https://rda.ucar.edu/
datasets/d084001/
[22] G. Z¨angl, D. Reinert, P. R´ıpodas, and M. Baldauf, “The
icon (icosahedral non-hydrostatic) modelling framework
of dwd and mpi-m: Description of the non-hydrostatic
dynamical core,” Quarterly Journal of the Royal Meteo-
rological Society, vol. 141, no. 687, pp. 563–579, 2015.
