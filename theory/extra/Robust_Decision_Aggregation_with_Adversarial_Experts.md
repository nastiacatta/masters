Robust Aggregation with Adversarial Experts
Yongkang Guo
yongkang_guo@pku.edu.cn
School of Computer Science, Peking University
Beijing, China
Yuqing Kong∗
yuqing.kong@pku.edu.cn
School of Computer Science, Peking University
Beijing, China
Abstract
We consider a robust aggregation problem in the presence of both
truthful and adversarial experts. The truthful experts will report
their private signals truthfully, while the adversarial experts can
report arbitrarily. We assume experts are marginally symmetric in
the sense that they share the same common prior and marginal pos-
teriors. The rule maker needs to design an aggregator to predict the
true world state from these experts’ reports, without knowledge of
the underlying information structures or adversarial strategies. We
aim to find the optimal aggregator that outputs a forecast minimiz-
ing regret under the worst information structure and adversarial
strategies. The regret is defined by the difference in expected loss
between the aggregator and a benchmark who aggregates optimally
given the information structure and reports of truthful experts.
We focus on binary states and reports. Under L1 loss, we show
that the truncated mean aggregator is optimal. When there are
at most k adversaries, this aggregator discards the k lowest and
highest reported values and averages the remaining ones. For L2
loss, the optimal aggregators are piecewise linear functions. All the
optimalities hold when the ratio of adversaries is bounded above
by a value determined by the experts’ priors and posteriors. The
regret only depends on the ratio of adversaries, not on their total
number. For hard aggregators that output a decision, we prove that
a random version of the truncated mean is optimal for both L1
and L2. This aggregator randomly follows a remaining value after
discarding the 𝑘lowest and highest reported values. We extend the
hard aggregator to multi-state setting. We evaluate our aggregators
numerically in an ensemble learning task. We also obtain negative
results for general adversarial aggregation problems under broader
information structures and report spaces.
CCS Concepts
• Theory of computation →Algorithmic game theory; Algo-
rithmic mechanism design.
Keywords
Robust Aggregation, Adversary, Information Aggregation
∗Corresponding author
Permission to make digital or hard copies of all or part of this work for personal or
classroom use is granted without fee provided that copies are not made or distributed
for profit or commercial advantage and that copies bear this notice and the full citation
on the first page. Copyrights for components of this work owned by others than the
author(s) must be honored. Abstracting with credit is permitted. To copy otherwise, or
republish, to post on servers or to redistribute to lists, requires prior specific permission
and/or a fee. Request permissions from permissions@acm.org.
WWW ’25, Sydney, NSW, Australia
© 2025 Copyright held by the owner/author(s). Publication rights licensed to ACM.
ACM ISBN 979-8-4007-1274-6/25/04
https://doi.org/10.1145/3696410.3714557
ACM Reference Format:
Yongkang Guo and Yuqing Kong. 2025. Robust Aggregation with Adversarial
Experts. In Proceedings of the ACM Web Conference 2025 (WWW ’25), April
28-May 2, 2025, Sydney, NSW, Australia. ACM, New York, NY, USA, 16 pages.
https://doi.org/10.1145/3696410.3714557
Introduction
You are a rule maker tasked with aggregating the scores of five
judges to assign a final score for an athlete’s performance. There is
a crucial twist: some of those scores might be tainted by bribes! The
briber’s motive is unknown, potentially inflating or deflating the
score. You have no clue about the underlying details. How should
you decide the aggregation rules?
Such concerns of aggregating information with adversarial “ex-
perts” also exist in various scenarios. For instance, when the jury
debates, some jurors may be swayed by a bribe to deliver a spe-
cific verdict. When miners are asked to reach a consensus on a
blockchain network, some malicious miners manipulate valida-
tions for personal gain. Furthermore, in ensemble learning, when
combining predictions from multiple models, some models are com-
promised by adversarial actors. Therefore, it is crucial to design
aggregation rules that are robust to adversarial attacks.
Intuitively, the truncated mean, which discards some highest
and lowest scores and averages the remaining scores, seems rea-
sonable and is widely used in practice. But the understanding of its
theoretical effectiveness is limited. A natural question is, is this the
most effective strategy?
To answer this, we need a clear evaluation criterion for aggrega-
tion methods. A common approach is average loss, which calculates
the average difference between the aggregator’s output and the
true state across various cases. Two key elements define a case: the
information structure and the adversarial behavior. The informa-
tion structure is the joint distribution of experts’ private signals
and the true state. However, average loss heavily depends on the
specific set of cases chosen and contradicts the assumption that the
adversarial behavior can be arbitrary.
Another option is the worst-case loss, focusing on the maxi-
mum loss the aggregator obtains under any case. However, if all
experts are completely uninformed, no aggregator can perform
well. Therefore, the worst-case loss cannot differentiate between
aggregators.
Instead, we adopt a robust framework commonly used in online
learning and robust information aggregation [2]. This framework
aims to minimize the aggregator’s “regret” in the worst case. Regret
measures the difference between the aggregator’s performance and
an omniscient aggregator who knows the information structure
and truthful reports.
arXiv:2403.08222v2  [cs.LG]  6 Feb 2025

WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
Yongkang Guo and Yuqing Kong
The framework can be understood as a zero-sum game between
two players. Nature chooses an information structure and adversar-
ial strategy, aiming to maximize the regret. The rule maker picks an
aggregator to minimize the regret. Generally, solving such a min-
imax problem is challenging due to the vast action space. With a
delicate analysis, prior studies proved that among aggregators who
output decisions, the random dictator is optimal without adversar-
ial experts under L1 loss, which implies that the optimal aggregator
that outputs probability is simple averaging [3]. However, this anal-
ysis does not extend to other scenarios, such as L2 loss. We show
that without adversarial experts, the problem under L2 loss lacks a
simple solution.
Paradoxically, introducing adversarial experts does not compli-
cate the problem in some scenarios, it even simplifies it! Regarding
the soft aggregators that output a probability, we discover that with
a bounded proportion of adversaries, the simple truncated mean is
optimal under L1 loss. Furthermore, in the adversarial setting with
L2 loss, we provide a closed-form solution, which is unattainable
in the non-adversarial setting. Both optimal aggregators fall within
the family of piecewise linear functions. For hard aggregators that
output a decision, a random version of the truncated mean is opti-
mal for both L1 and L2 loss. The key insight is that the presence of
at least one adversarial expert guarantees the existence of equilibria
with simple formats, which are easy to construct. These equilibria
enable us to design optimal aggregators with closed-form formulas.
In summary, we introduce a novel setting that considers adver-
sarial experts in robust information aggregation. This framework
enables us to theoretically prove the optimality of the commonly
used truncated mean method under L1 loss and provide optimal
aggregators under L2 loss, which are piecewise linear.
1.1
Summary of Results
Theoretical Results. In the original non-adversarial setting in [3],
each expert will receive and report a binary private signal, either
𝐿(low) or 𝐻(high), indicating the binary world state 𝜔∈{0, 1}.
The experts are marginally symmetric and truthful. That is, they
share the same marginal distribution of signals and will report
their private signals truthfully. However, correlations may exist
between the signals, thus the joint distribution is not determined.
The information structure 𝜃∈Θ is defined by the joint distribution
of private signals and world state.
For instance, in a weather forecasting problem, the world state
represents whether it will rain tomorrow. Private signals are some
evidence that experts obtain through their measurement instru-
ments. Since experts use the same type of instruments, they are
symmetric and have the same level of accuracy. The correlations
depends on where and when they run the instruments.
We extend the above setting to the adversarial setting. In addition
to truthful experts, adversarial experts exist and report arbitrarily
from the signal set {𝐻, 𝐿}. We assume the adversaries can observe
the reports of others and collude. The adversarial strategy is denoted
by 𝜎∈Σ.
The rule maker aims to find the optimal aggregator 𝑓to solve
the minimax problem:
𝑅(Θ, Σ) = inf
𝑓
sup
𝜃∈Θ,𝜎∈Σ
E𝜃[ℓ(𝑓(𝒙),𝜔) −ℓ(𝑜𝑝𝑡𝜃(𝒙𝑇),𝜔)].
We analyze the problem in two contexts: 1) soft: 𝑓’s output is
a forecast in [0, 1]; 2) hard: 𝑓’s output is a decision in {0, 1}. The
aggregator 𝑓can be randomized in the sense that its output is
random. 𝑜𝑝𝑡is the benchmark, which is an omniscient aggrega-
tor that knows the underlying information structure 𝜃of truthful
experts and minimizes the expected loss. 𝒙is the reports of all
experts, 𝒙𝑇is the reports of truthful experts, and ℓis a loss func-
tion. In this paper, we discuss two types of loss function, the L1
loss ℓ1(𝑦,𝜔) = |𝑦−𝜔| and the L2 loss ℓ2(𝑦,𝜔) = (𝑦−𝜔)2. The
benchmark function 𝑜𝑝𝑡should report the maximum likelihood
under L1 loss and the Bayesian posterior under L2 loss. Thus L1
loss is more suitable when we want to output decisions and L2 loss
is preferred for probabilistic forecasts. Suppose there are 𝑛experts
in total and 𝑘= 𝛾𝑛adversarial experts. The theoretical results are
shown in Table 1. The optimal soft aggregators are deterministic,
and illustrated in Figure 1.
Loss Function
Experts Model
Regret†
Closed-form?
L1 Loss
Non-adversarial
𝑐
Yes [3]
Adversarial
𝑐+ 𝑂

𝛾
1−2𝛾

Yes
L2 Loss
Non-adversarial
𝑐+ 𝑂

𝑛

No, 𝑂

𝜖

★
Adversarial
𝑐+ 𝑂

𝛾
(1−2𝛾)2

Yes
† 𝑐is a constant depending on the prior and the posteriors given
signals. 𝛾is the ratio of adversarial experts and 𝑛is the number of
experts.
★
The
complexity
for
computing
the 𝜖-optimal
aggrega-
tor 𝑓𝜖, i.e., max𝜃∈Θ E𝜃[ℓ(𝑓𝜖(𝒙),𝜔) −ℓ(𝑜𝑝𝑡𝜃(𝒙𝑇),𝜔)]
≤
min𝑓max𝜃∈Θ E𝜃[ℓ(𝑓(𝒙),𝜔) −ℓ(𝑜𝑝𝑡𝜃(𝒙𝑇),𝜔)] + 𝜖.
Table 1: Overview of main results.
• L1 Loss Setting
– Adversarial. We prove that under the L1 loss, the opti-
mal soft aggregator is 𝑘-truncated mean, where 𝑘is the
number of adversarial experts. That is, we drop 𝑘lowest
reports and 𝑘highest reports, then average the remaining
reports. Our analysis also reveals that the regret increases
asymptotically linear with adversarial ratio 𝛾for small
𝛾. Moreover, the regret is independent of the number of
experts 𝑛.
• L2 Loss Setting
– Non-adversarial. In this setting, the optimal soft aggre-
gator remains piecewise linear, with separation points at
{1,𝑛−1}. Although we do not obtain the closed-form for
the optimal aggregator, we prove that we can compute the
𝜖-optimal aggregator within 𝑂(1/𝜖) time. Unlike the L1
loss, the regret under the L2 loss increases with 𝑛. Com-
pared to the L1 loss, the aggregator under the L2 loss is
more conservative (i.e., closer to 1/2).

Robust Aggregation with Adversarial Experts
WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
0
0
0.5
Number of Experts Reporting Signal “H”
Output of Aggregators
Optimal Aggregator
Non-adversarial: Optimal Aggregator, L1 loss
Adversarial: Optimal Aggregator, L1 loss
Adversarial: Optimal Aggregator, L2 loss
Non-adversarial: Optimal Aggregator, L2 loss
Figure 1: Illustration of optimal soft aggregators for binary
aggregation.
– Adversarial. We provide a closed-form expression for the
optimal soft aggregator which is a hard sigmoid function
with separation points at {𝑘,𝑛−𝑘} for small 𝛾. The regret
also increases asymptotically linear with parameter 𝛾and
is independent of the number of experts 𝑛. Interestingly,
if we set 𝛾= 0, the formula of the adversarial optimal
aggregator cannot match the non-adversarial optimal ag-
gregator. The reason is when 𝛾> 0, we can construct an
equilibrium (𝑓,𝜃, 𝜎) such that the information structure
𝜃has a zero loss benchmark. But when 𝛾= 0, we can-
not construct an equilibrium (𝑓,𝜃) in the same way. The
worst information structure in the equilibrium may have a
non-zero loss benchmark, which leads to a more complex
optimal aggregator.
We also analyze optimal hard aggregators in Appendix C. For
both L1 and L2 loss, the optimal hard aggregators are random,
whose expectation is 𝑘-truncated mean. We call it 𝑘-ignorance
random dictator. It ignores k lowest-scoring and k highest-scoring
experts, then randomly follows one of the remaining experts. It
echos the results in [3] that the random dictator is optimal for the
non-adversarial setting.
Numerical Results. In Section 6, we empirically evaluate the
above aggregators in an ensemble learning task, which aggre-
gates the outputs of multiple image classifiers. These classifiers
are trained by different subsets of the full training set. We utilize
the cifar-10 datasets [25]. Our experiments show that the theoreti-
cally derived optimal aggregator outperforms traditional methods
like majority vote and averaging, particularly under L2 loss. Under
L1 loss, the majority vote also performs well. The reason can be
that compared to L1 loss, L2 loss penalizes not only being wrong
but also how wrong it is.
Extension. In Section 5, we extend our results to the multi-state
setting. The optimal hard aggregator is similar to the k-truncated
mean. It will drop 𝑘reports for each state and randomly follow a
remaining aggregator.
In Appendix F, we explore a more general model. In detail, we
consider a broader range of information structures and experts’
report space. We show that a small group of adversaries can effec-
tively attack the aggregator. We introduce a metric to estimate the
regret. Intuitively, the metric is the maximum impact 𝑘experts can
make regarding the benchmark aggregator 𝑜𝑝𝑡. This metric allows
us to establish a bound on the minimal regret, with the help of a
regularization parameter of information structures.
Related Work
Robust Information Aggregation. Arieli et al. [2] first propose a
robust paradigm for the information aggregation problem, which
aims to minimize the regret under the worst information structures.
They mainly study the conditional independent setting. There is a
growing number of research on the robust information aggregation
problem. Neyman and Roughgarden [29] also use the robust regret
paradigm under the projective substitutes condition and shows
that averaging is asymptotically optimal. De Oliveira et al. [10]
consider the robust absolute paradigm and prove that we should
pay more attention to the best single information source. Pan et al.
[31] consider the optimal aggregator with second-order information.
Guo et al. [16] provide an algorithmic method to compute the near-
optimal aggregator for the conditional independent information
structure. We consider a different set of information structures,
and more importantly, the existence of adversaries. We also obtain
the exact optimal aggregator with closed forms in the adversarial
setting.
Our paper is most relevant to Arieli et al. [3], which considers
the symmetric agents setting with the same marginal distribution.
They prove the random dictator strategy is optimal under some
mild conditions. We extend their results to different loss functions
and the adversarial setting. Our results show that the optimal hard
aggregator follows a random expert after discarding some values,
which extends the random dictator strategy.
Adversarial Information Aggregation. In the crowdsourcing field,
some works aim to detect unreliable workers based on observed
labels. They mainly consider two kinds of unreliable workers, the
truthful workers but with a high error rate, and the adversarial
workers who will arbitrarily assign labels. One possible approach
is using the “golden standard” tasks, which means managers know
the ground truth [12, 26, 34]. When there are no “golden standard”
tasks, Hovy et al. [20], Jagabathula et al. [21], Kleindessner and
Awasthi [24], Vuurens et al. [36] detect the unreliable workers via
revealed labels under some behavior models such as the Dawid-
Skene model. Other works focus on finding the true labels with
adversarial workers. Steinhardt et al. [35] consider a rating task
with 𝛼𝑛reliable workers, and others are adversarial workers. They
showed that the managers can use a small amount of tasks, which
is not scaled with 𝑛, to determine almost all the high-quality items.
Ma and Olshevsky [27] solve the adversarial crowdsourcing prob-
lem by rank-1 matrix completion with corrupted revealed entries.
Other works also focus on the data poison attacks in crowdsourc-
ing platforms [7, 8, 13, 15, 28, 37]. Unlike crowdsourcing, we do
not assume the existence of many similar tasks and focus on the
one-shot information aggregation task.

WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
Yongkang Guo and Yuqing Kong
Han et al. [17] and Schoenebeck et al. [33] propose a peer predic-
tion mechanism for a hybrid crowd containing both self-interested
agents and adversarial agents. Han et al. [17] focus on the binary
label setting and propose two strictly posterior truthful mecha-
nisms. Schoenebeck et al. [33] prove their mechanism guarantees
truth-telling is a 𝜖-Bayesian Nash equilibrium for self-interested
agents. The focus of our paper is the aggregation step, thus we do
not consider the incentives of non-adversarial agents but assume
they are truth-telling.
Kim and Fey [23] study the voting problem when there are voters
with adversarial preferences. They prove that it is possible that a
minority-preferred candidate almost surely wins the election under
equilibrium strategies. They want to determine when the majority
vote can reveal the true ground truth while we want to find a robust
aggregator for any situation.
Robust Ensemble Learning. Ensemble learning methods lever-
age the power of multiple models to improve prediction accuracy,
similar to how aggregating predictions from a diverse crowd can
produce better forecasts than individual opinions. The earliest work
of ensemble learning can date back to the last century [9]. They aim
to combine different classifiers trained from different categories
into a composite classifier. [32] provides a new algorithm to con-
vert some weak learners to strong learners. The most widely-used
ensemble learning methods include bagging [5], AdaBoost [18], ran-
dom forest [6], random subspace [19], gradient boosting [14]. Dong
et al. [11] provides a comprehensive review of ensemble learning.
The main difference between ensemble learning and information
aggregation is that ensemble learning is a training process and thus
involves multi-round aggregation. Unlike them, our method does
not assume any knowledge about the underlying learning models
and only needs the final outputs of models.
In the robust learning field, there are many works aimed at data
poison attacks to improve the robustness of learning algorithms [4,
22, 38]. In comparison, our adversaries cannot change the training
data, but alter the output of learning models.
Problem Statement
We define {0, 1, · · · ,𝑛} as [𝑛] and Δ𝑋as the set of all possible dis-
tributions over 𝑋. For a distribution 𝑃, 𝑠𝑢𝑝𝑝(𝑃) denotes its support
set.
Suppose the rule maker wants to determine the true state 𝜔from
a binary choice set Ω = {0, 1}. She is uninformed and asks 𝑛experts
for advice. Each expert will receive a signal 𝑠𝑖from a binary space
𝑆= {𝐿, 𝐻} (low, high), indicating that with low (high) probability
the state is 1. Then they will truthfully report 𝐿or 𝐻according to
their signals. The binary signal assumption can be relaxed, as we
can always construct a binary signal structure from a non-binary
structure with the same joint distribution over binary reports [3].
Experts share the same prior 𝜇= Pr[𝜔= 1] and posterior given
signals: 𝑝0 = Pr[𝜔= 1|𝑠𝑖= 𝐿] and 𝑝1 = Pr[𝜔= 1|𝑠𝑖= 𝐻]. We
assume 𝑝0 < 1
2 < 𝑝1, otherwise the signals are not informative (e.g.,
if 𝑝0 < 𝑝1 < 1/2, then any signal is a low signal). We also define
their inverse probabilities 𝑎= Pr[𝑠𝑖= 𝐻|𝜔= 1],𝑏= Pr[𝑠𝑖= 𝐻|𝜔=
0]. The joint distribution of true state and signals 𝜃∈ΔΩ×𝑆𝑛is
drawn from a family Θ. It is also called the information structure.
Since there may exist correlations between the experts’ signals, the
parameters 𝜇,𝑎,𝑏alone are insufficient to determine an information
structure.
In the non-adversarial setting, the experts are truthful when
they report their signals. We could relax this assumption to rational
experts who are revenue maximizers by applying proper incentive
mechanisms. Following Arieli and Babichenko [1], we assume the
experts are anonymous, which can be relaxed due to the symmetry
of experts. Thus the rule maker only sees the number of experts
reporting 𝐻, denoted by 𝑥∈[𝑛]. Then she needs to choose a
randomized aggregator 𝑓: [𝑛] →Δ[0,1], which maps reports to
a (possibly random) belief ∈[0, 1] about being in state 1. We first
focus on randomized soft aggregators and will extend the results
to randomized hard aggregators 𝑓: [𝑛] →Δ{0,1} in Appendix C.
In the adversarial setting, there are 𝑘= 𝛾𝑛adversarial experts
who can arbitrarily report from {𝐿, 𝐻}. We assume they are omni-
scient. That is, they know the true state and reports of other truthful
experts and can collude. They will follow a randomized strategy
𝜎∈Σ : Ω × 𝑆𝑛−𝑘→Δ[𝑘] that maps truthful reports to a (random)
number of additional 𝐻. Suppose the set of truthful experts is 𝑇,
and the set of adversarial experts is 𝐴. We use 𝑥𝑇and 𝑥𝐴to repre-
sent the number of reports 𝐻from truthful and adversarial experts,
respectively.
Robust Aggregation Paradigm. Given the families of information
structures Θ and strategies Σ, the rule maker aims to minimize
the regret compared to the non-adversarial setting in the worst
information structure. That is, the rule maker wants to find the
optimal function 𝑓∗to solve the following minimax problem:
𝑅(Θ, Σ) = inf
𝑓
sup
𝜃∈𝜃,𝜎∈Σ
E𝜃,𝜎[ℓ(𝑓(𝑥),𝜔)] −E𝜃[ℓ(𝑜𝑝𝑡𝜃(𝑥𝑇),𝜔)].
ℓis a loss function regarding the output of the aggregator and the
true state𝜔.𝑜𝑝𝑡𝜃(·) is a benchmark function, outputting the optimal
result given the joint distribution 𝜃and truthful experts’ reports 𝑥𝑇
to minimize the expected loss:𝑜𝑝𝑡𝜃(𝑥𝑇) = arg min𝑔E𝜃[ℓ(𝑔(𝑥𝑇),𝜔)].
In this paper, we consider two commonly used loss function,
L1 loss ℓ1(𝑦,𝜔) = |𝑦−𝜔| and L2 loss ℓ2(𝑦,𝜔) = (𝑦−𝜔)2. L2 loss
will punish the aggregator less when the prediction is closer to the
true state. Thus it encourages a more conservative strategy for the
aggregator to improve the accuracy in the worst case. L1 loss will
encourage a radical strategy to approximate the most possible state.
Our techniques can be extended to any convex loss functions.
For short, we also define
𝑅(𝑓,𝜃, 𝜎) = E𝜃,𝜎[ℓ(𝑓(𝑥),𝜔)] −E𝜃[ℓ(𝑜𝑝𝑡𝜃(𝑥𝑇),𝜔)],
is aggregator 𝑓’s regret on information structure 𝜃and adversarial
strategy 𝜎. 𝑅(𝑓, Θ, Σ) = sup𝜃∈Θ,𝜎∈Σ 𝑅(𝑓,𝜃, 𝜎) is the maximal regret
of aggregator 𝑓among the family Θ, Σ.
Theoretical Results
In this section, we analyze the optimal aggregators under different
settings theoretically. Due to space limitations, all the proofs in this
section are deferred to Appendix B.
4.1
L1 loss
We start from L1 loss. In the non-adversarial setting, Arieli et al.
[3] prove the optimal hard aggregator is the random dictator, i.e.,
randomly and uniformly following an expert. With a step further,

Robust Aggregation with Adversarial Experts
WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
it reveals that simple averaging 𝑓(𝑥) = 𝑥/𝑛is the optimal soft
aggregator.
In the adversarial setting, we prove that the optimal aggregator
is the 𝑘-truncated mean, when the adversary ratio 𝛾= 𝑘/𝑛is upper-
bounded (Theorem 4.2). 𝑘-truncated mean discards 𝑘lowest and 𝑘
highest reports, then outputs the average among left reports.
Definition 4.1 (𝑘-truncated mean). We call 𝑓is 𝑘-truncated
mean if
𝑓(𝑥) =


𝑥≥𝑛−𝑘
0
𝑥≤𝑘
𝑥−𝑘
𝑛−2𝑘
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
(1)
Theorem 4.2. Let ¯𝜇= 1 −𝜇. When
𝛾≤min

𝑎
1 + 𝑎, 1 −𝑏
2 −𝑏,
−¯𝜇𝑏+ 𝜇𝑎
𝜇−¯𝜇𝑏+ 𝜇𝑎,
¯𝜇(1 −𝑏) −𝜇(1 −𝑎)
(1 −𝑏) ¯𝜇+ ¯𝜇−𝜇(1 −𝑎)

, the 𝑘-truncated mean is optimal under the L1 loss. Recall that 𝜇is
the prior, 𝑎= Pr[𝑠𝑖= 𝐻|𝜔= 1] and 𝑏= Pr[𝑠𝑖= 𝐻|𝜔= 0]. Moreover,
the regret is
𝑅(Θ, Σ) = (1 −𝛾) (1 −(1 −𝜇)(1 −𝑏) −𝜇𝑎)
1 −2𝛾
.
Intuitively, when signals are highly informative (𝑎= 𝑃𝑟[𝑠𝑖=
𝐻|𝜔= 1] ≈1 or 𝑏= 𝑃𝑟[𝑠𝑖= 𝐻|𝜔= 0] ≈0), adversaries struggle
to manipulate the majority of experts’ opinions. This resilience to
adversarial attacks results in a less strict bound (𝑎/(1+𝑎), (1−𝑏)/(2−
𝑏) ≈1/2). On the other hand, if the signals are less informative
and distinguishable (𝑃𝑟[𝑠𝑖= 𝐻,𝜔= 1] ≈𝑃𝑟[𝑠𝑖= 𝐻,𝜔= 0] or
𝑃𝑟[𝑠𝑖= 𝐿,𝜔= 1] ≈𝑃𝑟[𝑠𝑖= 𝐿,𝜔= 0]), adversaries can more
easily distort the results, leading to a tighter bound (𝑎𝜇−𝑏¯𝜇≈0 or
𝜇(1 −𝑎) −¯𝜇(1 −𝑏) ≈0).
When 𝛾is sufficiently large, the 𝑘-truncated mean may not be
optimal. Nonetheless, we can infer by the same argument that the
optimal aggregator will be a constant, either 1 or 0. It means that
the aggregator is uninformative regardless of experts’ reports.
Proof Sketch. We prove Theorem 4.2 in two steps.
• Lower Bound: We first construct a bad case, including the
information structure and adversarial strategy 𝜃𝑏, 𝜎𝑏, which
establishes a lower bound 𝑅of the regret for any aggregator.
• Upper Bound: We construct an aggregator—the 𝑘-truncated
mean. On the one hand, it matches the lower bound 𝑅under
the bad case 𝜃𝑏, 𝜎𝑏. On the other hand, we prove that it
possesses some special properties, and therefore, the worst-
case scenario it corresponds to is 𝜃𝑏, 𝜎𝑏. Thus we prove the
optimality of the 𝑘-truncated mean.
If the Number of Adversaries 𝑘is Unknown. To identify the opti-
mal aggregator, it is crucial to know the parameter 𝑘. In practice,
the exact number of adversaries may be unable to know. Instead,
We may only obtain an estimator 𝑘′ of 𝑘. In this case, Lemma 4.3
shows that the regret grows asymptotically linear with the additive
error |𝑘−𝑘′|.
Lemma 4.3. Suppose the number of adversaries is k, then for any
𝑘′, the 𝑘′-truncated mean obtains the regret
𝑅(𝑓𝑘′, Θ, Σ) = 𝑘′ −𝑘+ (𝑛−𝑘) (1 −(1 −𝜇)(1 −𝑏) −𝜇𝑎)
𝑛−2𝑘′
.
4.2
L2 loss
We first show that without some prior knowledge of the information
structure, we cannot obtain non-trivial optimal aggregator. We
then show that with some partial prior knowledge, the optimal
aggregators are non-trivial.
4.2.1
Unknown Prior. In the L1 loss setting, the optimal aggregator
is independent with three parameters we defined before, the prior
𝜇and the marginal report distributions 𝑎,𝑏. However, in the L2
loss setting, the optimal aggregator also depends on these param-
eters. When these parameters are unknown to the rule maker, it
is impossible to obtain any informative aggregator (Lemma 4.4,
Lemma 4.5).
Lemma 4.4. When 𝜇,𝑎,𝑏is unknown, the random guess is op-
timal. Formally, let (Θ𝜇,𝑎,𝑏, Σ𝜇,𝑎,𝑏) includes all information struc-
tures and adversarial strategies with parameters 𝜇,𝑎,𝑏and (Θ, Σ) =
Ð
0≤𝜇≤1,𝑎>𝑏(Θ𝜇,𝑎,𝑏, Σ𝜇,𝑎,𝑏). Then 𝑓∗(𝑥) = 1/2 and 𝑅(Θ, Σ) = 1/4.
It holds for both adversarial and non-adversarial settings.
Lemma 4.5. When 𝜇is known but 𝑎,𝑏is unknown, the prior guess
is optimal. Formally, let (Θ𝑎,𝑏, Σ𝑎,𝑏) includes all information struc-
tures and adversarial strategies with parameters 𝜇,𝑎,𝑏and (Θ, Σ) =
Ð
𝑎>𝑏(Θ𝑎,𝑏, Σ𝑎,𝑏). Then 𝑓∗(𝑥) = 𝜇and 𝑅(Θ, Σ) = 𝜇(1 −𝜇). It holds
for both adversarial and non-adversarial settings.
We will obtain a non-trivial result when all three parameters
are known to the rule maker. In the rest of this section, we assume
𝜇,𝑎,𝑏are known.
4.2.2
Partial Prior Knowledge: Non-adversarial Setting. First, we dis-
cuss the non-adversarial setting. Unfortunately, obtaining a closed-
form expression for the optimal aggregator is infeasible without
solving a high-order polynomial equation. However, we can calcu-
late it efficiently as Theorem 4.6 shows.
Theorem 4.6. There exists an algorithm that costs 𝑂(1/𝜖) to find
the 𝜖-optimal aggregator 𝑓𝜖in the non-adversarial setting. That is,
define the maximal regret of 𝑓, 𝑅(𝑓, Θ) = max𝜃∈Θ E𝜃[ℓ(𝑓(𝑥),𝜔)] −
E𝜃[ℓ(𝑜𝑝𝑡𝜃(𝑥),𝜔)]. 𝑓𝜖is a 𝜖-optimal aggregator if
𝑅(𝑓𝜖, Θ) ≤min
𝑓
𝑅(𝑓, Θ) + 𝜖.
Proof Sketch. The key idea here is to decompose the information
structures into a linear combination of several “basic” information
structures 𝜃1,𝜃2, · · · ,𝜃𝑘with rsupp(𝜃𝑖) ≤4, where rsupp(𝜃) =
𝑠𝑢𝑝𝑝(𝑣1) ∪𝑠𝑢𝑝𝑝(𝑣0) is the support of report sets. That is, there are
at most 4 possible reports in these “basic” information structures.
Using the convexity of the regret function, we can prove that for any
𝑓,𝜃, the regret 𝑅(𝑓,𝜃) will be less than the linear combination of
𝑅(𝑓,𝜃1), · · · , 𝑅(𝑓,𝜃𝑘). Thus we only need to solve the optimization
problem among these “basic” information structures.
We then reduce the set of “basic” information structures to a
constant size, which allows efficient algorithms.
Regret. As we cannot obtain the closed form of the optimal ag-
gregator, we do not know the regret either. However, it is possible
to estimate the regret, as stated in Lemma 4.7. Figure 2 shows an
example of the regret, which is calculated by our algorithm.

WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
Yongkang Guo and Yuqing Kong
Lemma 4.7. Suppose Θ𝑛is the information structure with 𝑛truth-
ful experts. Then the non-adversarial regret 𝑅(Θ𝑛) = 𝑐+ 𝑂(1/𝑛),
where 𝑐is a value related to 𝜇,𝑎,𝑏.
Number of Experts
0.09
0.10
0.11
0.12
0.13
0.14
Regret
Regret of the Non-adversarial Setting, L2 Loss
a=0.75,b=0.25
a=0.75,b=0.4
a=0.6,b=0.25
Figure 2: Illustration for the regret under non-adversarial
setting, L2 loss. We fix 𝜇= 0.5 and vary the number of experts.
The parameters 𝑎,𝑏are shown in the legend.
4.2.3
Partial Prior Knowledge: Adversarial Setting. Now we con-
sider the adversarial setting. Surprisingly, for low adversary ratio
𝛾, the optimal aggregator has a closed form, which is also a hard
sigmoid function with separation points in {𝑘,𝑛−𝑘}. We state the
optimal aggregator and the regret in Theorem 4.8.
Theorem 4.8. When 0 < 𝛾≤min( 𝑎
1+𝑎, 1−𝑏
2−𝑏), the optimal aggre-
gator is
𝑓∗(𝑥) =


𝜇(1 −𝛾)(1 −𝑎)
𝜇(1 −𝛾)(1 −𝑎) + (1 −𝜇)(1 −2𝛾−(1 −𝛾)𝑏)
𝑥≤𝑘
𝜇((1 −𝛾)𝑎−𝛾)
𝜇((1 −𝛾)𝑎−𝛾) + (1 −𝜇)(1 −𝛾)𝑏
𝑥≥𝑛−𝑘
𝑥−𝑘
𝑛−2𝑘(𝑓(𝑛−𝑘) −𝑓(𝑘)) + 𝑓(𝑘)
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
(2)
Moreover, the regret 𝑅(Θ, Σ) is
(−1 + 𝛾)(−1 + 𝜇)𝜇
∗(𝑏(−1 + 𝑏+ 2𝛾−𝑏𝛾) −(−1 + 𝑎+ 𝑏) (𝑏+ 𝑎(−1 + 𝛾) + 𝛾−𝑏𝛾) 𝜇)
/ (𝑏(−1 + 𝛾)(−1 + 𝜇) + 𝑎𝜇−(1 + 𝑎)𝛾𝜇)
/ (−1 + 𝑏(−1 + 𝛾)(−1 + 𝜇) + 𝑎𝜇−𝛾(−2 + 𝜇+ 𝑎𝜇))
Proof Sketch. Similar to Theorem 4.2, we prove this theorem by
directly constructing an equilibrium (𝑓∗,𝜃∗, 𝜎∗). On the one hand,
𝜃∗, 𝜎∗provide a lower bound for the regret. On the other hand, 𝑓∗
is the best response to 𝜃∗, 𝜎∗. In addition, for a special family of
aggregators 𝑓including 𝑓∗, (𝜃∗, 𝜎∗) is their corresponding worst
case. Thus 𝑓∗is optimal.
Discussion. If we simply substitute 𝛾= 0 into the formula in
Theorem 4.8, we can not obtain the optimal aggregator for the non-
adversarial setting as Theorem 4.6 computes. Thus the adversarial
setting has some essential differences from the non-adversarial
setting. We will use an example to show the reason. We first consider
the non-adversarial setting. Suppose there are 5 experts and we
select the average aggregator 𝑓(𝑥) = 𝑥
𝑛. Assume 𝑎= 3
5, 𝑏= 2
5, and
𝜇= 1
2.
Example 4.9 (Examples of the Non-adversarial Setting).
Consider two information structures 𝜃1,𝜃2.
𝜃1 : Pr
𝜃1
[𝑥|𝜔= 1] =
(
1/2
𝑥= 1, 5
0
else
Pr
𝜃1
[𝑥|𝜔= 0] =
(
1/2
𝑥= 0, 4
0
else
𝜃2 : Pr
𝜃2
[𝑥|𝜔= 1] =
(
1/2
𝑥= 1, 5
0
else
Pr
𝜃2
[𝑥|𝜔= 0] =


3/5
𝑥= 0
2/5
𝑥= 5
0
else
In the information structure 𝜃1, the loss of the aggregator is


1 −1
2
+ 1

2
=
25 and the loss of the benchmark is
0. In the information structure 𝜃2, the loss of the aggregator is


1 −1
2
+ 2
5 · 12

= 9
25, which is greater than in 𝜃1. However,
the loss of the aggregator is also greater than in 𝜃1. Notice that the
regret is the difference between the loss of the aggregator and the
loss of the benchmark. Therefore, for the average aggregator, we
cannot easily determine which of 𝜃1 or 𝜃2 has the greater regret.
In fact, the worst information structure corresponding to simple
averaging is a mixture of some information structures. That is why
we need to solve it using an algorithm.
Surprisingly, when we add one adversary, the situation becomes
simpler. We consider the information structure 𝜃1 and adversarial
strategy 𝜎(5) = 𝜎(1) = 0, 𝜎(4) = 𝜎(0) = 1. In this case, we obtain
highest loss of the aggregator while keeping the zero loss bench-
mark. Thus it is easier to determine the worst information structure
in the adversary setting.
Extension: Multi-state Setting
In this section, we extend our model to multi-states: |Ω| = 𝑚> 2.
Experts share the common prior: 𝜇∈ΔΩ. We assume they also
share the same correctness level: 𝑞𝜔= 𝑃𝑟[𝑠𝑖= 𝜔|𝜔], which is the
probability of receiving the private signal 𝜔when the true state
is 𝜔. We do not assume the distribution of the wrong signals they
will receive.
We consider the hard aggregator, where the aggregator also
outputs a state. In this setting, the L1 loss and L2 loss are equivalent,
and the regret depends solely on whether the aggregator predicts
the correct state. We assume the input 𝒙∈𝑅𝑚is the histogram of
the reports, meaning 𝒙(𝜔) denotes the number of experts reporting
the state 𝜔.
In the binary setting, the optimal aggregator removes 𝑘reports
of each state and randomly follows a remaining report. We prove
that, in the multi-state setting, the optimal aggregator is similar
when the adversarial ratio is low as Theorem 5.2 shows.

Robust Aggregation with Adversarial Experts
WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
Definition 5.1 (𝑘-ignorance random dictator). We call 𝑓is
𝑘-ignorance random dictator if
𝑓(𝒙) = 𝜔with probability
𝑡𝑘(𝜔)
Í
𝜔′ 𝑡𝑘(𝜔′) ,
where 𝑡𝑘(𝜔) = max(0, 𝒙(𝜔) −𝑘).
For example, consider three states: L, M, and H. Initially, 10
experts report L, 5 report M, and 2 report H. With 𝑘= 3 adversaries,
we remove 3 reports from each state, leaving 7 L, 2 M, and 0 H.
𝑘-ignorance random dictator would report L with probability 7/9
and M with probability 2/9.
Theorem 5.2. For the multi-state setting, when 𝛾satisfies
• 𝛾< min
 𝑞𝜔
𝑞𝜔+1,
1−𝑞𝜔
𝑚−1−𝑞𝜔, 1
𝑚

for any 𝜔∈Ω.
•
 𝜇(𝜔) + 𝜇(𝜔)𝑞𝜔+ 𝜇(𝜔′)𝑞𝜔′ −𝜇(𝜔′)(𝑚−1) 𝛾
< 𝜇(𝜔)𝑞𝜔−𝜇(𝜔′)𝑞𝜔′ + 𝜇(𝜔′)
for any 𝜔≠𝜔′ ∈Ω.
Then 𝑘-ignorance random dictator is optimal. The regret is
𝑅(Θ, Σ) = 1 −(𝑚−1)𝛾−(1 −𝛾)(Í
𝜔𝜇(𝜔)𝑞𝜔)
1 −𝑚𝛾
.
The proof follows a similar approach to the binary setting. The
main distinction is the construction of the corresponding worst-
case information structures 𝜃∗and adversarial strategies 𝜎∗. We
defer the full proof to Appendix D.
Numerical Experiment
This section evaluates our aggregators in ensemble learning, where
we combine multiple models’ predictions to achieve higher accuracy.
There exist data poisoning attacks [22] in the ensemble learning
process in practice, which corresponds to the adversarial setting.
The theory has already provided the worst-case analysis. The exper-
iment focuses on the average performance with specific adversarial
strategies, which reflect real-world situations and are feasible.
6.1
Setup
We now apply our framework to ensemble learning for image clas-
sification.
• World State 𝜔: it is the true class 𝑦𝑗of the data point 𝑑𝑗.
• Expert 𝑖: it is a black-box machine learning model 𝑀𝑖, which
will take the data point 𝑑𝑗as the input and output a predic-
tion for its class 𝑀𝑖(𝑑𝑗).
• Signal 𝑠𝑖: suppose we have a training dataset D. For each
model 𝑀𝑖, the signal 𝑠𝑖is defined by its training dataset
D𝑖⊂D.
• Report 𝑥𝑖: it is model 𝑀𝑖’s output class. We do not consider
the confidence of models.
• Benchmark Function 𝑜𝑝𝑡: it is defined by the best model
trained using the full dataset D.
In our experiment, we utilized the CIFAR-10 dataset, which com-
prises images across 10 distinct classes. To adapt this multi-class
dataset for our binary signals framework, our task is to determine
whether the image belongs to a special class (e.g. cat) or not. To
ensure the symmetric assumption and keep the diversity of the
models, we train 100 models using a consistent machine learning
backbone according to Page [30]. For each model 𝑀𝑖, we construct
the sub-dataset D𝑖by uniformly sampling 20000 images from the
original training dataset, which contains 50000 images. We train
10 epochs by GPU RTX 3060 and CPU Intel i5-12400. The average
accuracy of models is around 85%.
Estimation For Parameters. To apply our aggregator in Theo-
rem 4.8, we need three important parameters, the prior 𝜇, the prob-
ability 𝑎of the “yes” answer when the true label is “yes”, and the
probability 𝑏of the “yes” answer when the true label is “no”. In
practice, it is impossible to know the true value due to the imper-
fect knowledge of the data distribution. Instead, we can estimate
them by the empirical performance of models in the training set. If
the training set is unbiased samples from the true distribution, the
empirical estimator is also unbiased for these true parameters.
Adversary Models. We test two different kinds of adversarial
strategies. First is the extreme strategy. That is, the adversaries
always report the opposite forecast to the majority of truthful
experts. Second is the random strategy, which will randomly report
“yes” or “no” with equal probability.
Aggregators. We compare our aggregators to two benchmarks:
the majority vote-outputting the answers of the majority of experts;
and the averaging-outputing the ratio of models answering “yes”.
6.2
Results
We evaluated the performance of different aggregators across a
range of adversaries and Figure 3 shows our results for L2 loss.
For the random adversaries, we sample 50 independent groups of
adversarial experts and draw an error bar of standard deviation.
More results are presented in Appendix E. Our piecewise linear
aggregator (Theorem 4.8) outperforms other aggregators in any
situation. Notably, the majority has a close performance to our
aggregator, which means it is a good approximation in the ensem-
ble learning setting. This is mainly due to the high accuracy of
each model. Since each model has accuracy of around 90%, around
90% models will choose the right label in expectation. Even for
large number of adversaries, the majority is still correct. When the
group of adversaries is small, the averaging performs well. How-
ever, when the group becomes large, the effectiveness of averaging
significantly diminishes. Thus averaging is very sensitive to the
number of adversaries.
When the adversaries use the random strategy, all aggregators
generally perform better. In particular, the majority vote will not be
affected by the adversaries in expectation since it will not change
the majority. When the number of adversaries is small, the averag-
ing even outperforms our aggregator, as our aggregator is overly
conservative in this case.
Figure 4 illustrates the accuracy of various aggregation methods.
The benchmark aggregator, which represents the model trained
on the full dataset, achieves approximately 98% accuracy. The k-
Truncated Random Select, a randomized variant of the k-Truncated
Mean, performs similarly to the majority vote, both reaching around
96% accuracy. In contrast, the Random Select, which randomly
follows one model, performs poorly, especially when the number
of adversaries increases.

WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
Yongkang Guo and Yuqing Kong
0
Number of Adversaries
0.02
0.04
0.06
0.08
0.10
Regret
Performance of Aggregators (L2 loss)
Majority Vote
Averaging
Piecewise Linear Aggregator
(a) Extreme Strategy
0
Number of Adversaries
0.0200
0.0225
0.0250
0.0275
0.0300
0.0325
Performance of Aggregators (L2 loss)
Majority Vote
Averaging
Piecewise Linear Aggregator
(b) Random Strategy
Figure 3: The performance of different aggregators under
different adversarial strategies. The x-axis is the number of
adversaries we add. The number of truthful experts is 100.
The y-axis is the regret.
0
Number of Adversaries
0.70
0.75
0.80
0.85
0.90
0.95
1.00
Accuracy
Performance of Aggregators (L1 loss)
Benchmark
Majority Vote
Random Select
k-Truncated Random Select
Figure 4: The accuracy of different aggregators under extreme
strategy. The x-axis is the number of adversaries we added
to experts. The number of truthful experts is 100. The y-axis
is the accuracy.
Conclusion
We analyze the robust aggregation problem under both truthful
and adversarial experts. We show that the optimal aggregator is
piecewise linear across various scenarios. In particular, the trun-
cated mean is optimal for L1 loss. We evaluate our aggregators
by an ensemble learning task. We also extend the truncated mean
aggregator into the multi-state setting. For the general setting with
more flexible information structures and experts’ reports space,
we provide some negative results that the optimal aggregator is
vulnerable to adversarial experts.
For future work, it would be interesting to extend the decision
aggregation into other aggregation setting such as the forecast
aggregation, where the adversarial strategies are more diverse. An-
other possible direction is exploring the performance of the trun-
cated mean in other general information structures, such as the
substitute information structure [29]. Moreover, we wonder what
if we connect behavioral economics by considering other types
of experts, such as experts who only report truthfully with some
probability.
Acknowledgments
This work was supported by NSFC/RGC Joint Research Scheme
under Grant 62261160391 and Grant N_PolyU529/22.
References
[1] Itai Arieli and Yakov Babichenko. 2022. A population’s feasible posterior beliefs.
In Proceedings of the 23rd ACM Conference on Economics and Computation. 326–
327.
[2] Itai Arieli, Yakov Babichenko, and Rann Smorodinsky. 2018. Robust forecast
aggregation. Proceedings of the National Academy of Sciences 115, 52 (2018),
E12135–E12143.
[3] Itai Arieli, Yakov Babichenko, Inbal Talgam-Cohen, and Konstantin Zabarnyi.
2023. Universally Robust Information Aggregation for Binary Decisions. arXiv
preprint arXiv:2302.03667 (2023).
[4] Battista Biggio, Blaine Nelson, and Pavel Laskov. 2012. Poisoning attacks against
support vector machines. arXiv preprint arXiv:1206.6389 (2012).
[5] Leo Breiman. 1996. Bagging predictors. Machine learning 24 (1996), 123–140.
[6] Leo Breiman. 2001. Random forests. Machine learning 45 (2001), 5–32.
[7] Pengpeng Chen, Hailong Sun, and Zhijun Chen. 2021. Data Poisoning Attacks on
Crowdsourcing Learning. In Web and Big Data: 5th International Joint Conference,
APWeb-WAIM 2021, Guangzhou, China, August 23–25, 2021, Proceedings, Part I 5.
Springer, 164–179.
[8] Pengpeng Chen, Yongqiang Yang, Dingqi Yang, Hailong Sun, Zhijun Chen, and
Peng Lin. 2023. Black-box data poisoning attacks on crowdsourcing. In Proceed-
ings of the Thirty-Second International Joint Conference on Artificial Intelligence.
2975–2983.
[9] Belur V Dasarathy and Belur V Sheela. 1979. A composite classifier system design:
Concepts and methodology. Proc. IEEE 67, 5 (1979), 708–713.
[10] Henrique De Oliveira, Yuhta Ishii, and Xiao Lin. 2021. Robust merging of infor-
mation. arXiv preprint arXiv:2106.00088 (2021).
[11] Xibin Dong, Zhiwen Yu, Wenming Cao, Yifan Shi, and Qianli Ma. 2020. A survey
on ensemble learning. Frontiers of Computer Science 14 (2020), 241–258.
[12] Julie S Downs, Mandy B Holbrook, Steve Sheng, and Lorrie Faith Cranor. 2010.
Are your participants gaming the system? Screening Mechanical Turk workers.
In Proceedings of the SIGCHI conference on human factors in computing systems.
2399–2402.
[13] Minghong Fang, Minghao Sun, Qi Li, Neil Zhenqiang Gong, Jin Tian, and Jia
Liu. 2021. Data poisoning attacks and defenses to crowdsourcing systems. In
Proceedings of the web conference 2021. 969–980.
[14] Jerome H Friedman. 2002. Stochastic gradient boosting. Computational statistics
& data analysis 38, 4 (2002), 367–378.
[15] Ujwal Gadiraju, Ricardo Kawase, Stefan Dietze, and Gianluca Demartini. 2015.
Understanding malicious behavior in crowdsourcing platforms: The case of online
surveys. In Proceedings of the 33rd annual ACM conference on human factors in
computing systems. 1631–1640.
[16] Yongkang Guo, Jason D. Hartline, Zhihuan Huang, Yuqing Kong, Anant
Shah, and Fang-Yi Yu. 2024.
Algorithmic Robust Forecast Aggregation.
arXiv:2401.17743 [cs.LG]
[17] Qishen Han, Sikai Ruan, Yuqing Kong, Ao Liu, Farhad Mohsin, and Lirong
Xia. 2021. Truthful information elicitation from hybrid crowds. arXiv preprint
arXiv:2107.10119 (2021).
[18] Trevor Hastie, Saharon Rosset, Ji Zhu, and Hui Zou. 2009. Multi-class adaboost.
Statistics and its Interface 2, 3 (2009), 349–360.
[19] Tin Kam Ho. 1995. Random decision forests. In Proceedings of 3rd international
conference on document analysis and recognition, Vol. 1. IEEE, 278–282.
[20] Dirk Hovy, Taylor Berg-Kirkpatrick, Ashish Vaswani, and Eduard Hovy. 2013.
Learning whom to trust with MACE. In Proceedings of the 2013 Conference of the
North American Chapter of the Association for Computational Linguistics: Human
Language Technologies. 1120–1130.
[21] Srikanth Jagabathula, Lakshminarayanan Subramanian, and Ashwin Venkatara-
man. 2017. Identifying unreliable and adversarial workers in crowdsourced
labeling tasks. The Journal of Machine Learning Research 18, 1 (2017), 3233–3299.
[22] Matthew Jagielski, Alina Oprea, Battista Biggio, Chang Liu, Cristina Nita-Rotaru,
and Bo Li. 2018. Manipulating machine learning: Poisoning attacks and counter-
measures for regression learning. In 2018 IEEE symposium on security and privacy
(SP). IEEE, 19–35.
[23] Jaehoon Kim and Mark Fey. 2007. The swing voter’s curse with adversarial
preferences. Journal of Economic Theory 135, 1 (2007), 236–252.
[24] Matthäus Kleindessner and Pranjal Awasthi. 2018. Crowdsourcing with arbitrary
adversaries. In International Conference on Machine Learning. PMLR, 2708–2717.

Robust Aggregation with Adversarial Experts
WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
[25] Alex Krizhevsky, Geoffrey Hinton, et al. 2009. Learning multiple layers of features
from tiny images. (2009).
[26] John Le, Andy Edmonds, Vaughn Hester, and Lukas Biewald. 2010. Ensuring
quality in crowdsourced search relevance evaluation: The effects of training ques-
tion distribution. In SIGIR 2010 workshop on crowdsourcing for search evaluation,
Vol. 2126. 22–32.
[27] Qianqian Ma and Alex Olshevsky. 2020. Adversarial crowdsourcing through
robust rank-one matrix completion. Advances in Neural Information Processing
Systems 33 (2020), 21841–21852.
[28] Chenglin Miao, Qi Li, Lu Su, Mengdi Huai, Wenjun Jiang, and Jing Gao. 2018.
Attack under disguise: An intelligent data poisoning attack mechanism in crowd-
sourcing. In Proceedings of the 2018 World Wide Web Conference. 13–22.
[29] Eric Neyman and Tim Roughgarden. 2022. Are you smarter than a random
expert? The robust aggregation of substitutable signals. In Proceedings of the 23rd
ACM Conference on Economics and Computation. 990–1012.
[30] David Page. 2018. cifar10-fast. https://github.com/davidcpage/cifar10-fast.
[31] Yuqi Pan, Zhaohua Chen, and Yuqing Kong. 2023. Robust Decision Aggregation
with Second-order Information. arXiv preprint arXiv:2311.14094 (2023).
[32] Robert E Schapire. 1990. The strength of weak learnability. Machine learning 5
(1990), 197–227.
[33] Grant Schoenebeck, Fang-Yi Yu, and Yichi Zhang. 2021. Information elicitation
from rowdy crowds. In Proceedings of the Web Conference 2021. 3974–3986.
[34] Rion Snow, Brendan O’connor, Dan Jurafsky, and Andrew Y Ng. 2008. Cheap and
fast–but is it good? evaluating non-expert annotations for natural language tasks.
In Proceedings of the 2008 conference on empirical methods in natural language
processing. 254–263.
[35] Jacob Steinhardt, Gregory Valiant, and Moses Charikar. 2016. Avoiding imposters
and delinquents: Adversarial crowdsourcing and peer prediction. Advances in
Neural Information Processing Systems 29 (2016).
[36] Jeroen Vuurens, Arjen P de Vries, and Carsten Eickhoff. 2011. How much spam
can you take? an analysis of crowdsourcing results to increase accuracy. In Proc.
ACM SIGIR Workshop on Crowdsourcing for Information Retrieval (CIR’11). 21–26.
[37] Dong Yuan, Guoliang Li, Qi Li, and Yudian Zheng. 2017. Sybil defense in crowd-
sourcing platforms. In Proceedings of the 2017 ACM on Conference on Information
and Knowledge Management. 1529–1538.
[38] Mengchen Zhao, Bo An, Wei Gao, and Teng Zhang. 2017. Efficient label contami-
nation attacks against black-box learning models.. In IJCAI. 3945–3951.
A
Auxiliary Tools
In this section, we first give some useful notations. We define two
important distributions 𝑣1, 𝑣0 ∈Δ[𝑛], which are the distributions
of reports conditioning on the world state: 𝑣1(𝑡) = Pr𝜃,𝜎[𝑥= 𝑡|𝜔=
1], 𝑣0(𝑡) = Pr𝜃,𝜎[𝑥= 𝑡|𝜔= 0]. Notice that 𝑣1, 𝑣0 are related to both
𝜃and 𝜎. Similarly, we define 𝑢1(𝑡) = Pr𝜃[𝑥𝑇= 𝑡|𝜔= 1],𝑢0(𝑡) =
Pr𝜃[𝑥𝑇= 𝑡|𝜔= 0] which are the conditional distributions of truth-
ful experts’ reports. Notice that 𝑢1,𝑢0 ∈Δ[𝑛−𝑘].
The expected loss of the aggregator can be decomposed by 𝑣1, 𝑣0:
E𝜃,𝜎[ℓ(𝑓(𝑥),𝜔)] = 𝜇𝐸𝑥∼𝑣1 [ℓ(𝑓(𝑥))] + (1 −𝜇)𝐸𝑥∼𝑣0 [ℓ(1 −𝑓(𝑥))].
By simple calculation, we can obtain the closed-form of the bench-
mark 𝑜𝑝𝑡𝜃(𝑥) under different loss function ℓ.
L1 loss
𝑜𝑝𝑡𝜃(𝑥𝑇) =
1
𝜇𝑢1(𝑥𝑇) ≥(1 −𝜇)𝑢0(𝑥𝑇)
0
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
The expected loss is 1 −Í
𝑥max(𝜇𝑢1(𝑥), (1 −𝜇)𝑢0(𝑥)).
L2 loss
𝑜𝑝𝑡𝜃(𝑥𝑇) =
𝜇𝑢1(𝑥𝑇)
𝜇𝑢1(𝑥𝑇) + (1 −𝜇)𝑢0(𝑥𝑇) .
The expected loss is Í
𝑥
𝜇(1−𝜇)𝑢1(𝑥)𝑢0(𝑥)
𝜇𝑢1(𝑥)+(1−𝜇)𝑢0(𝑥)
Before considering the optimal aggregator, we first characterize
all feasible information structures. Lemma A.1 fully formalizes the
distribution 𝑢1,𝑢0, i.e., the possible reports of 𝑛−𝑘truthful experts.
Lemma A.1 ([3]). For any distribution 𝑢1,𝑢0 ∈Δ2
[𝑛−𝑘], there
exists an information structure 𝜃such that 𝑢1(𝑡) = Pr𝜃[𝑥𝑇= 𝑡|𝜔=
1],𝑢0(𝑡) = Pr𝜃[𝑥𝑇= 𝑡|𝜔= 0] if an only if E𝑥∼𝑢1 [𝑥] = (𝑛−𝑘)𝑎and
E𝑥∼𝑢0 [𝑥] = (𝑛−𝑘)𝑏.
The following lemma is an extension of Lemma A.1. It shows that
there is also some restriction on the expectation of the distribution
of inputs for adversarial experts and truthful experts.
Lemma A.2. For any information structure 𝜃and adversarial strat-
egy 𝜎, the corresponding 𝑣1, 𝑣0 satisfy (𝑛−𝑘)𝑎≤E𝑥∼𝑣1 [𝑥] ≤
(𝑛−𝑘)𝑎+ 𝑘and (𝑛−𝑘)𝑏≤E𝑥∼𝑣0 [𝑥] ≤(𝑛−𝑘)𝑏+ 𝑘.
Proof. By A.1, E𝑥∼𝑢1 [𝑥] = (𝑛−𝑘)𝑎and E𝑥∼𝑢0 [𝑥] = (𝑛−𝑘)𝑏.
Consider E𝑥∼𝑣1 [𝑥] −E𝑥∼𝑢1 [𝑥], which is the expectation of reports
of adversaries. Since there are at most 𝑘adversaries. Then 0 ≤
E𝑥∼𝑣1 [𝑥] −E𝑥∼𝑢1 [𝑥] ≤𝑘. Thus (𝑛−𝑘)𝑎≤E𝑥∼𝑣1 [𝑥] ≤(𝑛−𝑘)𝑎+𝑘.
Similarly, (𝑛−𝑘)𝑏≤E𝑥∼𝑣0 [𝑥] ≤(𝑛−𝑘)𝑏+ 𝑘.
□
Now we give a useful lemma for our main theorems.
Definition A.3 (A Bad Information Structure). If 𝑘< (𝑛−
𝑘)𝑎, (𝑛−𝑘)𝑏< 𝑛−2𝑘, we define a bad information structure 𝜃𝑏, 𝜎𝑏
such that
Pr
𝜃𝑏
[𝑥= 𝑛−𝑘|𝜔= 1] = (𝑛−𝑘)𝑎−𝑘
𝑛−2𝑘
Pr
𝜃𝑏
[𝑥= 𝑘|𝜔= 1] = 𝑛−𝑘−(𝑛−𝑘)𝑎
𝑛−2𝑘
Pr
𝜃𝑏
[𝑥= 𝑛−2𝑘|𝜔= 0] = (𝑛−𝑘)𝑏
𝑛−2𝑘
Pr
𝜃𝑏
[𝑥= 0|𝜔= 0] = 𝑛−2𝑘−(𝑛−𝑘)𝑏
𝑛−2𝑘
and
𝜎𝑏(𝑥) =
𝑘
𝑥= 0,𝑛−𝑘
0
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
(3)
Lemma A.4. If the aggregator 𝑓satisfies the following conditions:
• non-decreasing
• ℓ(𝑓(𝑥), 0) is convex in [𝑘,𝑛−𝑘]
• ℓ(𝑓(𝑥), 1) is convex in [𝑘,𝑛−𝑘]
• 𝑓(𝑥) is constant in [0,𝑘] and [𝑛−𝑘,𝑘].
Then 𝑅(𝑓, Θ, Σ) = 𝑅(𝑓,𝜃𝑏, 𝜎𝑏).

WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
Yongkang Guo and Yuqing Kong
Proof.
E𝜃,𝜎[ℓ(𝑓)] = 𝜇
∑︁
𝑥
E𝜎[𝑣1(𝑥)ℓ(𝑓(𝑥+ 𝜎(𝑥)), 1)]
+ (1 −𝜇)
∑︁
𝑥
E𝜎[𝑣0(𝑥)ℓ(𝑓(𝑥+ 𝜎(𝑥)), 0)]
≤𝜇
∑︁
𝑥
𝑢1(𝑥)ℓ(𝑓(𝑥), 1) + (1 −𝜇)
∑︁
𝑥
𝑢0(𝑥)ℓ(𝑓(𝑥+ 𝑘), 0)
(𝑓is non-decreasing)
= 𝜇
∑︁
𝑛−𝑘≥𝑥≥𝑘
𝑢1(𝑥)(𝛼(𝑥)𝑘
+ (1 −𝛼(𝑥))(𝑛−𝑘)ℓ(𝑓(𝑥), 1)
+ 𝜇
∑︁
𝑥<𝑘
𝑢1(𝑥)ℓ(𝑓(𝑥), 1)
(𝛼(𝑥) = 𝑛−𝑘−𝑥
𝑛−2𝑘)
+ (1 −𝜇)
∑︁
𝑥≤𝑛−2𝑘
𝑢0(𝑥)(𝛽(𝑥)0
+ (1 −𝛽(𝑥))(𝑛−2𝑘))ℓ(𝑓(𝑥+ 𝑘), 0)
+ (1 −𝜇)
∑︁
𝑥>𝑛−2𝑘
𝑢′
0(𝑥)ℓ(𝑓(𝑥), 0)
(𝛽(𝑥) = 𝑛−2𝑘−𝑥
𝑛−2𝑘)
≤𝜇
∑︁
𝑥∈{𝑘,𝑛−𝑘}
𝑢′
1(𝑥)ℓ(𝑓(𝑥), 1) + 𝜇
∑︁
𝑥<𝑘
𝑢′
1(𝑥)ℓ(𝑓(𝑥), 1)
(ℓ(𝑓(𝑥), 1) is convex in [𝑘,𝑛−𝑘])
+ (1 −𝜇)
∑︁
𝑥∈{0,𝑛−2𝑘}
𝑢′
0(𝑥)ℓ(𝑓(𝑥+ 𝑘), 0)
+ (1 −𝜇)
∑︁
𝑥>𝑛−2𝑘
𝑢′
0(𝑥)ℓ(𝑓(𝑥+ 𝑘), 0)
(ℓ(𝑓(𝑥), 0) is convex in [𝑘,𝑛−𝑘])
where 𝑢′
1(𝑥) = 𝑢1(𝑥) for any 𝑥< 𝑘, 𝑢′
0(𝑥) = 𝑢0(𝑥) for any
𝑥> 𝑛−2𝑘
𝑢′
1(𝑘) =
∑︁
𝑘≤𝑥≤𝑛−𝑘
𝛼(𝑥)𝑢1(𝑥),
𝑢′
1(𝑛−𝑘) =
∑︁
𝑘≤𝑥≤𝑛−𝑘
(1 −𝛼(𝑥))𝑢1(𝑥).
𝑢′
0(0) =
∑︁
0≤𝑥≤𝑛−2𝑘
𝛽(𝑥)𝑢0(𝑥),
𝑢′
1(𝑛−2𝑘) =
∑︁
0≤𝑥≤𝑛−2𝑘
(1 −𝛽(𝑥))𝑢0(𝑥).
By simple calculation we have Í
𝑥𝑢′
1(𝑥) = 1, Í
𝑥𝑥𝑢′
1(𝑥) = (𝑛−
𝑘)𝑎and Í
𝑥𝑢′
0(𝑥) = 1, Í
𝑥𝑥𝑢′
0(𝑥) = (𝑛−𝑘)𝑏.
Now we calculate the maximum of
∑︁
𝑥∈{𝑘,𝑛}
𝑢′
1(𝑥)ℓ(𝑓(𝑥), 1) +
∑︁
𝑥<𝑘
𝑢′
1(𝑥)ℓ(𝑓(𝑥), 1)
subject to
∑︁
𝑥
𝑢′
1(𝑥) = 1
∑︁
𝑥
𝑥𝑢′
1(𝑥) = (𝑛−𝑘)𝑎
Notice that 𝑓(𝑥) is constant when 𝑥≤𝑘. For any 𝑥≤𝑘, we
write 𝛼(𝑥) = 𝑛−𝑥
𝑛−2𝑘, then
𝑢′
1(𝑥)ℓ(𝑓(𝑥), 1) = 𝑢′
1(𝑥)(𝛼(𝑥)ℓ(𝑓(𝑥), 1) + (1 −𝛼(𝑥))ℓ(𝑓(𝑥), 1))
≤𝑢′
1(𝑥)(𝛼(𝑥)ℓ(𝑓(𝑘), 1) + (1 −𝛼(𝑥))ℓ(𝑓(𝑛−𝑘), 1)
(𝑓(𝑥) = 𝑓(𝑘) ≤𝑓(𝑛−𝑘) for 𝑥≤𝑘)
Thus we can replace any 𝑥< 𝑘with the linear combination of
𝑘,𝑛−𝑘until there are only reports 𝑘,𝑛−𝑘left. That is,
∑︁
𝑥∈{𝑘,𝑛−𝑘}
𝑢′
1(𝑥)ℓ(𝑓(𝑥), 1) +
∑︁
𝑥<𝑘
𝑢′
1(𝑥)ℓ(𝑓(𝑥), 1)
≤
∑︁
𝑥={𝑘,𝑛−𝑘}
𝑢′′
1 (𝑥)ℓ(𝑓(𝑥), 1)
where
∑︁
𝑥
𝑢′′
1 (𝑥) = 1
∑︁
𝑥
𝑥𝑢′′
1 (𝑥) = (𝑛−𝑘)𝑎
Similarly, we have
∑︁
𝑥∈{0,𝑛−2𝑘}
𝑢′
0(𝑥)ℓ(𝑓(𝑥), 0) + (1 −𝜇)
∑︁
𝑥>𝑛−𝑘
𝑢′
0(𝑥)ℓ(𝑓(𝑥), 0)
≤
∑︁
𝑥={0,𝑛−2𝑘}
𝑢′′
0 (𝑥)ℓ(𝑓(𝑥), 0)
where
∑︁
𝑥
𝑢′′
0 (𝑥) = 1
∑︁
𝑥
𝑥𝑢′′
0 (𝑥) = (𝑛−𝑘)𝑏
In fact, 𝑢′′
1 ,𝑢′′
0 is the same as 𝜃𝑏. Thus 𝑅(𝑓,𝜃, 𝜎) ≤𝑅(𝑓,𝜃𝑏, 𝜎𝑏)
for any 𝜃, 𝜎, which completes our proof.
□
B
Omitted Proofs in Section 4
B.1
Proof of Theorem 4.2
On the one hand, it is easy to verify that 𝑘-truncated mean satisfies
the condition in Lemma A.4. Thus 𝑅(𝑓∗,𝜃𝑏, 𝜎𝑏) = 𝑅(𝑓∗, Θ, Σ)
On the other hand, we have
Pr
𝜃𝑏,𝜎𝑏
[𝑥|𝜔= 1] =


(𝑛−𝑘)𝑎−𝑘
𝑛−2𝑘
𝑥= 𝑛−𝑘
(𝑛−𝑘)(1 −𝑎)
𝑛−2𝑘
𝑥= 𝑘
0
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
(4)
and
Pr
𝜃𝑏,𝜎𝑏
[𝑥|𝜔= 0] =


(𝑛−𝑘)𝑏
𝑛−2𝑘
𝑥= 𝑛−2𝑘
𝑛−2𝑘−(𝑛−𝑘)𝑏
𝑛−2𝑘
𝑥= 0
0
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
(5)
Since 𝜇𝑢1(𝑛−𝑘) ≥(1 −𝜇)𝑢0(𝑛−2𝑘) and 𝜇𝑢1(𝑘) ≤(1 −𝜇)𝑢0(0),
the 𝑜𝑝𝑡𝜃𝑏,𝜎𝑏(𝑛−𝑘) = 1,𝑜𝑝𝑡𝜃𝑏,𝜎𝑏(𝑘) = 0.
Thus 𝑅(𝑓, Θ, Σ) ≥𝑅(𝑓,𝜃𝑏, 𝜎𝑏) ≥𝑅(𝑓∗,𝜃𝑏, 𝜎𝑏).
Combine these two claims we complete our proof.

Robust Aggregation with Adversarial Experts
WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
B.2
Proof of Lemma 4.3
Proof. On the one hand, by Lemma A.2, (𝑛−𝑘)𝑎≤E𝑥∼𝑣1 [𝑥]
and E𝑥∼𝑣0 [𝑥] ≤(𝑛−𝑘)𝑏+ 𝑘, then
𝑅(𝑓∗
𝑡) = 𝜇(1 −E𝑥∼𝑣1 𝑓∗
𝑡(𝑥)) + (1 −𝜇)E𝑥∼𝑣0 𝑓∗
𝑡(𝑥)
≤𝜇(1 −(𝑛−𝑘)𝑎
𝑛−2𝑘′ ) + (1 −𝜇) (𝑛−𝑘)𝑏+ 𝑘
𝑛−2𝑘′
= 𝑘′ −𝑘+ (𝑛−𝑘) (1 −(1 −𝜇)(1 −𝑏) −𝜇𝑎)
𝑛−2𝑘′
On the other hand, let
Pr
𝜃𝑏,𝜎𝑏
[𝑥|𝜔= 1] =


(𝑛−𝑘)𝑎−𝑘
𝑛−2𝑘
𝑥= 𝑛−𝑘
(𝑛−𝑘)(1 −𝑎)
𝑛−2𝑘
𝑥= 𝑘
0
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
(6)
and
Pr
𝜃𝑏,𝜎𝑏
[𝑥|𝜔= 0] =


(𝑛−𝑘)𝑏
𝑛−2𝑘
𝑥= 𝑛−2𝑘
𝑛−2𝑘−(𝑛−𝑘)𝑏
𝑛−2𝑘
𝑥= 0
0
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
(7)
We have𝑅(𝑓∗
𝑡,𝜃, 𝜎) = 𝑘′−𝑘+(𝑛−𝑘) (1−(1−𝜇) (1−𝑏)−𝜇𝑎)
𝑛−2𝑘′
, which com-
pletes our proof.
□
B.3
Proofs of Lemma 4.4 and Lemma 4.5
Proof of Lemma 4.4. We first consider the non-adversarial set-
ting. On the one hand, since ℓ(1/2) = 1/4, for any 𝜃, 𝜎,
𝑅(𝑓∗,𝜃, 𝜎) ≥Pr
𝜃[𝜔= 1]ℓ(1/2) + Pr
𝜃[𝜔= 0]ℓ(1/2)
= 1/4
Thus 𝑅(𝑓∗, Θ, Σ) = 1/4.
On the other hand, we select𝑥1 = 0,𝑥2 = 1,𝑥3 = 𝑛−1,𝑥4 = 𝑛, and
𝜇= 0.5. Consider the mixture of two information structures with
uniform distribution. In the first one,𝑠𝑢𝑝𝑝(𝑣1) = {𝑥1,𝑥4},𝑠𝑢𝑝𝑝(𝑣0) =
{𝑥2,𝑥3}. In the second one,𝑠𝑢𝑝𝑝(𝑣1) = {𝑥2,𝑥3},𝑠𝑢𝑝𝑝(𝑣0) = {𝑥1,𝑥4}.
Let 𝑏= 2/𝑛, consider a sequence {𝑎𝑡} such that lim𝑡→∞𝑎𝑡= 𝑏and
𝑎𝑡> 𝑏.
By this sequence of parameter 𝑎we construct a sequence of
mixed information structures 𝜃𝑡. We will find that lim𝑡→∞𝑅(𝜃𝑡) =
1/4 since the Bayesian posterior of 𝜃𝑡is 𝑓(𝑥1) = 𝑓(𝑥1) = 𝑓(𝑥3) =
𝑓(𝑥4) = 1/2. Thus 𝑅(𝑓, Θ, Σ) ≥1/4 for any 𝑓.
For the adversarial setting, the random guess will still obtain
regret 1/4. the regret of other aggregators will not decrease. Thus
we complete our proof for both adversarial and non-adversarial
setting.
□
Proof of Lemma 4.5. Similarly, we first consider the non-adversarial
setting. On the one hand,
𝑅(𝑓∗,𝜃, 𝜎) ≥Pr
𝜃[𝜔= 1]ℓ(𝜇) + Pr
𝜃[𝜔= 0]ℓ(1 −𝜇)
= 𝜇(1 −𝜇)
Again, we select 𝑥1 = 0,𝑥2 = 1,𝑥3 = 𝑛−1,𝑥4 = 𝑛. Consider the
mixture of two information structures. In the first one, 𝑠𝑢𝑝𝑝(𝑣1) =
{𝑥1,𝑥4},𝑠𝑢𝑝𝑝(𝑣0) = {𝑥2,𝑥3}. In the second one,𝑠𝑢𝑝𝑝(𝑣1) = {𝑥2,𝑥3},
𝑠𝑢𝑝𝑝(𝑣0) = {𝑥1,𝑥4}. Using the same argument in Lemma 4.4 we
will obtain that for any 𝑓, 𝑅(𝑓,𝜃, 𝜎) ≥𝜇(1 −𝜇). Thus 𝑓∗is the
optimal aggregator.
□
B.4
Proof of Theorem 4.6
We prove this theorem in several steps. First, similar to the flow in
Arieli et al. [2], we do the basic dimension reduction on Θ, which
allows us to consider information structures with at most 4 possible
reports (Lemma B.1).
Lemma B.1. Let Θ4 = {𝜃∈Θ|𝑠𝑢𝑝𝑝(𝑢1) ≤2,𝑠𝑢𝑝𝑝(𝑢0) ≤2}.
Then for any 𝑓, we have 𝑅(𝑓, Θ, Σ) = 𝑅(𝑓, Θ4, Σ).
Proof. Consider the distribution vector 𝑢1, it should satisfy the
following two linear constraints:
∑︁
𝑥
𝑢1(𝑥) = 1
∑︁
𝑥
𝑥𝑢1(𝑥) = 𝑛𝑎
By the basic theorem of linear programming, we can decompose
𝑢1 with a linear combination of some extreme distribution vectors.
That is, there exists 𝑡1, · · · ,𝑡𝑚and 𝜆1, · · · , 𝜆𝑚such that
𝑢1(𝑥) =
∑︁
𝑖
𝜆𝑖𝑡𝑖(𝑥)
∑︁
𝑥
𝑡𝑖(𝑥) = 1
∑︁
𝑥
𝑥𝑡𝑖(𝑥) = 𝑛𝑎
The extreme point here means that 𝑠𝑢𝑝𝑝(𝑡𝑖) ≤2 for any 𝑖. Now
fix 𝑢0, we can create a new information structure 𝜃𝑖by setting the
𝑡𝑖(𝑥) = Pr𝜃𝑖[𝑋= 𝑥|𝜔= 1] and 𝑢0(𝑥) = Pr𝜃𝑖[𝑋= 𝑥|𝜔= 0].
Since the benchmark aggregator 𝑢1(𝑥)𝑢0(𝑥)
𝑢1(𝑥)+𝑢0(𝑥) is concave with
𝑢1(𝑥) given 𝑢0(𝑥), and E𝜃[ℓ(𝑓)] is linear in 𝑢1 given 𝑓. Thus for
any 𝑓,
𝑅(𝑓,𝜃) ≤
∑︁
𝑖
𝜆𝑖𝑅(𝑓,𝜃𝑖) ≤max
𝑖
𝑅(𝑓,𝜃𝑖).
Then following the same argument in 𝑢0 we obtain that we can
decompose 𝑢0 with some extreme vectors with support space less
than 2, which completes our proof for 𝑅(𝑓, Θ) = 𝑅(𝑓, Θ4).
□
However, we still have around  𝑛
 possible information struc-
tures. Furthermore, we show that we can only consider those “ex-
treme information structures” with extreme report support space
(Lemma B.2). “Extreme” here means reports in {0, 1,𝑛−1,𝑛}. Thus
the meaningful information structures are reduced to constant size.
Lemma B.2. Let Θ𝑒= {𝜃∈Θ4|𝑠𝑢𝑝𝑝(𝑢1) ⊂{0, 1,𝑛−1,𝑛},𝑠𝑢𝑝𝑝(𝑢0) ⊂
{0, 1,𝑛−1,𝑛}}. We have 𝑅(Θ, Σ) = 𝑅(Θ𝑒, Σ).

WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
Yongkang Guo and Yuqing Kong
Proof. Consider the optimal aggregator 𝑓∗= arg min𝑓𝑅(𝑓, Θ𝑒).
We extend 𝑓∗by linear interpolation in the non-extreme input:
𝑓(𝑥) =


𝑓∗(𝑥)
𝑥= {0, 1,𝑛−1,𝑛}
𝑓∗(𝑛−1) −𝑓∗(1)
𝑛−2
∗(𝑥−1)
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
(8)
Then for any 2 ≤𝑥≤𝑛−2, we can write 𝑥as linear combination
of 1 and 𝑛−1, 𝑥= 𝛼(𝑥) ∗1 + (1 −𝛼(𝑥)) ∗(𝑛−1) where 𝛼(𝑥) =
𝑛−1−𝑥
𝑛−2
∈[0, 1]. Since both (1 −𝑓(𝑥))2 and 𝑓(𝑥)2 is convex in
[1,𝑛−1],
E𝜃[ℓ(𝑓)]
= 𝜇
∑︁
𝑥
𝑢1(𝑥)(1 −𝑓(𝑥))2 + (1 −𝜇)
∑︁
𝑥
𝑢0(𝑥)𝑓(𝑥)2
≤𝜇
∑︁
𝑥∈{0,1,𝑛−1,𝑛}
𝑢1(𝑥)(1 −𝑓(𝑥))2
+ 𝜇
∑︁
𝑥∉{0,1,𝑛−1,𝑛}
𝑢1(𝑥)

𝛼(𝑥)(1 −𝑓(1))2 + (1 −𝛼(𝑥))(1 −𝑓(𝑛−1))2
+ (1 −𝜇)
∑︁
𝑥∈{0,1,𝑛−1,𝑛}
𝑢0(𝑥)𝑓(𝑥)2
+ (1 −𝜇)
∑︁
𝑥∉{0,1,𝑛−1,𝑛}
𝑢0(𝑥)

𝛼(𝑥)𝑓(1)2 + (1 −𝛼(𝑥))𝑓(𝑛−1)2
(Convexity)
= 𝜇
∑︁
𝑥∈{0,1,𝑛−1,𝑛}
𝑣′
1(𝑥)(1 −𝑓(𝑥))2
+ (1 −𝜇)
∑︁
𝑥∈{0,1,𝑛−1,𝑛}
𝑣′
0(𝑥)𝑓(𝑥)2
where 𝑢′
1(0) = 𝑢1(0),𝑢′
1(𝑛) = 𝑢1(𝑛) and
𝑢′
1(1) = 𝑢1(1) +
∑︁
2≤𝑥≤𝑛−2
𝛼(𝑥)𝑢1(𝑥)
𝑢′
1(𝑛−1) = 𝑢1(1) +
∑︁
2≤𝑥≤𝑛−2
(1 −𝛼(𝑥))𝑢1(𝑥)
Thus we have
∑︁
𝑥
𝑢′
1(𝑥)
= 𝑢′
1(0) + 𝑢′
1(1) + 𝑢′
1(𝑛−1) + 𝑢′
1(𝑛)
= 𝑢1(0) + 𝑢1(1) + 𝑢1(𝑛−1) + 𝑢1(𝑛)
+
∑︁
2≤𝑥≤𝑛−2
𝛼(𝑥)𝑢1(𝑥) + (1 −𝛼)𝑢1(𝑥)
= 𝑢1(0) + 𝑢1(1) + 𝑢1(𝑛−1) + 𝑢1(𝑛) +
∑︁
2≤𝑥≤𝑛−2
𝑢1(𝑥)
= 1
and
∑︁
𝑥
𝑥𝑢′
1(𝑥)
= 𝑢′
1(1) + (𝑛−1)𝑢′
1(𝑛−1) + 𝑛𝑢′
1(𝑛)
= 𝑢1(1) + (𝑛−1)𝑢1(𝑛−1) + 𝑛𝑢1(𝑛)
+
∑︁
2≤𝑥≤𝑛−2
𝛼(𝑥)𝑢1(𝑥) + (1 −𝛼)(𝑛−1)𝑢1(𝑥)
= 𝑢1(0) + 𝑢1(1) + (𝑛−1)𝑢1(𝑛−1) + 𝑛𝑢1(𝑛) +
∑︁
2≤𝑥≤𝑛−2
𝑥𝑢1(𝑥)
= 𝑎
Similarly we have Í
𝑥𝑢′
0(𝑥) = 1, Í
𝑥𝑥𝑢′
0(𝑥) = 𝑏. We can create a
new information structure 𝜃′ by setting𝑢′
1(𝑥) = Pr𝜃𝑖[𝑋= 𝑥|𝜔= 1]
and 𝑢′
0(𝑥) = Pr𝜃𝑖[𝑋= 𝑥|𝜔= 0]. Notice that 𝜃′ ∈Θ𝑒. Thus for any
𝜃∈Θ, we have 𝑅(𝑓,𝜃) ≤𝑅(𝑓,𝜃′). So
𝑅(Θ) = min
𝑓′ 𝑅(𝑓′, Θ) ≤𝑅(𝑓, Θ) ≤𝑅(𝑓, Θ𝑒) = 𝑅(𝑓∗, Θ𝑒) = 𝑅(Θ𝑒)
.
However, since Θ𝑒⊂Θ, 𝑅(Θ𝑒) ≤𝑅(Θ). So we obtain that
𝑅(Θ) = 𝑅(Θ𝑒).
□
Combining these two lemmas we only need to consider informa-
tion structures with at most 4 possible reports and the reports are
in {0, 1,𝑛−1,𝑛}. In addition, 𝑠𝑢𝑝𝑝(𝑢1) ≤2,𝑠𝑢𝑝𝑝(𝑢0) ≤2. There
are at most 16 possible information structures and there exists an
FPTAS for solving the finite number of information structures by
Guo et al. [16].
Lemma B.3 ([16]). Suppose |Θ| = 𝑛, There exists an FPTAS which
can find the 𝜖-optimal aggregator in 𝑂(𝑛/𝜖).
If we apply the FPTAS in Θ𝑒we will find the𝜖-optimal aggregator
in 𝑂(1/𝜖), which completes our proof.
B.5
Proof of Lemma 4.7
Suppose 𝑅𝑛is the regret when the number of experts is 𝑛. We want
to estimate the difference 𝑅𝑛−𝑅𝑛+1. Let
𝑓1 = arg min
𝑓
max
𝜃∈Θ𝑛+1
𝑅(𝑓,𝜃).
As we prove in Lemma B.2, we only need to consider point 0, 1,𝑛−
1,𝑛. Then for any information structure 𝜃1 in Θ𝑛+1, we map it to
another information structure 𝜃2 ∈Θ𝑛by the following rules. If
𝜃1 contains report 0, 1, let 𝜃2 contains report 0, 1; if 𝜃1 contains
report 𝑛or 𝑛+ 1, let 𝜃2 contains report 𝑛or 𝑛−1. Then the joint
distribution is determined by the report space. Now we construct
an aggregator 𝑓2:
𝑓2(𝑥) =
𝑓1(𝑥)
𝑥= 0, 1
𝑓1(𝑥−1)
𝑥= 𝑛,𝑛−1
(9)
Then we have
𝑅(𝑓2,𝜃2) −𝑅(𝑓1,𝜃1) = E𝑥∼𝜃2 [(𝑓(𝑥) −𝑜𝑝𝑡𝜃2 (𝑥))2]
−E𝑥∼𝜃1 [(𝑓(𝑥) −𝑜𝑝𝑡𝜃1 (𝑥))2]
=
∑︁
𝑥
Pr
𝜃2
[𝑥](𝑓(𝑥) −𝑜𝑝𝑡𝜃2 (𝑥))2
−Pr
𝜃1
[𝑥](𝑓(𝑥) −𝑜𝑝𝑡𝜃1 (𝑥))2
≤
∑︁
𝑥




Pr
𝜃2
[𝑥] −Pr
𝜃1
[𝑥]





((𝑓(𝑥) −𝑜𝑝𝑡𝜃2 (𝑥))2 ≤1)
≤𝑂

𝑛(𝑛+ 1)


Robust Aggregation with Adversarial Experts
WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
Thus𝑅(Θ𝑛) ≤𝑅(𝑓2, Θ𝑛+1) ≤𝑅(𝑓1, Θ𝑛)+𝑂

𝑛(𝑛+1)

= 𝑅(Θ𝑛+1)+
𝑂

𝑛(𝑛+1)

.
Add up all 𝑛we have 𝑅(Θ𝑛) ≤Í
𝑘𝑂

𝑘(𝑘+1)

= 𝑐+ 𝑂( 1
𝑛)
B.6
Proof of Theorem 4.8
On the one hand, it is easy to verify that 𝑘-truncated mean satisfies
the condition in Lemma A.4. Thus 𝑅(𝑓∗,𝜃𝑏, 𝜎𝑏) = 𝑅(𝑓∗, Θ, Σ)
On the other hand, we have
Pr
𝜃𝑏,𝜎𝑏
[𝑋= 𝑥|𝜔= 1] =


(𝑛−𝑘)𝑎−𝑘
𝑛−2𝑘
𝑥= 𝑛−𝑘
(𝑛−𝑘)(1 −𝑎)
𝑛−2𝑘
𝑥= 𝑘
0
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
(10)
and
Pr
𝜃𝑏,𝜎𝑏
[𝑋= 𝑥|𝜔= 0] =


(𝑛−𝑘)𝑏
𝑛−2𝑘
𝑥= 𝑛−2𝑘
𝑛−2𝑘−(𝑛−𝑘)𝑏
𝑛−2𝑘
𝑥= 0
0
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
(11)
By simple calculate we find that 𝑜𝑝𝑡𝜃𝑏,𝜎𝑏(𝑥) = Pr𝜃𝑏,𝜎𝑏[𝜔=
1|𝑥] = 𝑓∗.
Thus 𝑅(𝑓, Θ, Σ) ≥𝑅(𝑓,𝜃𝑏, 𝜎𝑏) ≥𝑅(𝑓∗,𝜃𝑏, 𝜎𝑏).
Combine these two claims we complete our proof.
C
Hard Aggregators
In this section, we discuss a special family of aggregators-the
hard aggregators that can randomly output a decision in {0, 1}.
In this case, L1 loss and L2 loss are equivalent. We prove that the
𝑘-ignorance random dictator is optimal. It echos the results in [3]
that the random dictator is optimal for the non-adversarial setting.
Definition C.1 (𝑘-ignorance random dictator). We call 𝑓is
𝑘-ignorance random dictator if
𝑓(𝑥) =


𝑥≥𝑛−𝑘
0
𝑥≤𝑘
𝑟𝑒𝑝𝑜𝑟𝑡1 𝑤𝑖𝑡ℎ𝑝𝑟𝑜𝑏𝑎𝑏𝑖𝑙𝑖𝑡𝑦𝑥−𝑘
𝑛−2𝑘
𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
(12)
Theorem C.2. When 𝛾≤min
 𝑎𝜇−(1−𝜇)𝑏
𝜇+𝑎𝜇−(1−𝜇)𝑏,
𝑎
1+𝑎, 1−𝑏
2−𝑏

, the 𝑘-
ignorance random dictator is optimal for both L1 and L2 loss. Moreover,
the regret
𝑅(Θ, Σ) = 𝜇+ (1 −𝜇)((1 −𝛾)𝑏+ 𝛾) −𝜇(1 −𝛾)𝑎
1 −2𝛾
.
Proof. Notice that for both L1 and L2 loss
ℓ(𝑦,𝜔) =
1
𝑦= 𝜔
0
𝑦≠𝜔
(13)
As the soft aggregators include hard aggregators, we only need to
prove that the 𝑘-ignorance random dictator 𝑓1 has the same regret
as the 𝑘-truncated mean 𝑓2 under L1 loss. In fact,
𝑅(𝑓1, Θ, Σ) =
sup
𝜃∈𝜃,𝜎∈Σ
E𝑓1,𝜃,𝜎[ℓ1(𝑓(𝑥),𝜔)] −E𝜃[ℓ1(𝑜𝑝𝑡𝜃(𝑥𝑇),𝜔)]
=
sup
𝜃∈𝜃,𝜎∈Σ
E𝜃,𝜎(Pr[𝑓1(𝑥) = 1]ℓ1(1,𝜔)
+ Pr[𝑓1(𝑥) = 0]ℓ1(0,𝜔)) −E𝜃[ℓ1(𝑜𝑝𝑡𝜃(𝑥𝑇),𝜔)]
=
sup
𝜃∈𝜃,𝜎∈Σ
E𝜃,𝜎(𝑓2(𝑥)ℓ1(1,𝜔) + (1 −𝑓2(𝑥))ℓ1(0,𝜔))
−E𝜃[ℓ1(𝑜𝑝𝑡𝜃(𝑥𝑇),𝜔)]
=
sup
𝜃∈𝜃,𝜎∈Σ
E𝜃,𝜎ℓ1(𝑓2(𝑥),𝜔) + (1 −𝑓2(𝑥))ℓ1(0,𝜔))
−E𝜃[ℓ1(𝑜𝑝𝑡𝜃(𝑥𝑇),𝜔)]
=𝑅(𝑓2, Θ, Σ)
Thus the 𝑘-ignorance random dictator is optimal.
□
D
Proof of Theorem 5.2
Again we define a bad information structure:
Definition D.1 (A Bad Information Structure). If 𝑛−(𝑚−
1)𝑘> (𝑛−𝑘)𝑞𝜔> 𝑘, we define a bad information structure 𝜃𝑏, 𝜎𝑏
such that
Pr
𝜃𝑏
[𝒙(𝜔) = 𝑛−(𝑚−1)𝑘|𝜔] = (𝑛−𝑘)𝑞𝜔−𝑘
𝑛−𝑚𝑘
Pr
𝜃𝑏
[𝒙(𝜔) = 𝑘|𝜔] = 𝑛−(𝑚−1)𝑘−(𝑛−𝑘)𝑞𝜔
𝑛−𝑚𝑘
For other 𝜔′ ≠𝜔, we ensure that
Pr
𝜃𝑏
[𝒙(𝜔′) + 𝜎(𝜔′) = 𝑘|𝜔] = 1
when 𝑥(𝜔) = 𝑛−(𝑚−1)𝑘.
When 𝑥(𝜔) = 𝑘, there exists 𝜔′ ≠𝜔such that
Pr
𝜃𝑏
[𝒙(𝜔′) + 𝜎(𝜔′) = 𝑛−(𝑚−1)𝑘|𝜔] = 1
and for any other 𝜔′,
Pr
𝜃𝑏
[𝒙(𝜔′) + 𝜎(𝜔′) = 𝑘|𝜔] = 1
First for any information structure that satisfying the correct
probability 𝑞𝜔, the k-ignorance random dictator will obtain loss
𝑅(𝑓, Θ, Σ) = 1 −E𝜔[𝑓(𝒙)|𝜔]
≤1 −E𝜔
𝒙(𝜔) −𝑘
𝑛−𝑚𝑘




𝜔

≤1 −E𝜔
 (𝑛−𝑘)𝑞𝜔−𝑘
𝑛−𝑚𝑘

= 1 −(𝑚−1)𝛾−(1 −𝛾)(Í
𝜔𝜇(𝜔)𝑞𝜔)
1 −𝑚𝛾
.
In particular, for the bad information structure (𝜃𝑏, 𝜎𝑏),
𝑅(𝑓,𝜃𝑏, 𝜎𝑏) = 1 −(𝑚−1)𝛾−(1 −𝛾)(Í
𝜔𝜇(𝜔)𝑞𝜔)
1 −𝑚𝛾
.
On the other hand, for any aggregator 𝑓′, it will at least suffer
the loss
𝑅(𝑓′, Θ, Σ) ≥𝑅(𝑓′,𝜃𝑏, 𝜎𝑏) ≥1 −(𝑚−1)𝛾−(1 −𝛾)(Í
𝜔𝜇(𝜔)𝑞𝜔)
1 −𝑚𝛾
.

WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
Yongkang Guo and Yuqing Kong
The reason is for the bad information structure (𝜃𝑏, 𝜎𝑏), its best
response is the same as the k-ignorance random dictator. Thus we
complete our proof.
E
Numerical Experiment
0
Number of Adversaries
0.05
0.10
0.15
0.20
0.25
0.30
Regret
Performance of Aggregators (L1 loss)
Majority Vote
Averaging
Piecewise Linear Aggregator
(a) Extreme Strategy
0
Number of Adversaries
0.02
0.04
0.06
0.08
0.10
0.12
0.14
0.16
Regret
Performance of Aggregators (L1 loss)
Majority Vote
Averaging
Piecewise Linear Aggregator
(b) Random Strategy
Figure 5: The performance of different aggregators under
different adversarial strategies. The x-axis is the number of
adversaries we added to experts. The number of truthful
experts is 100. The y-axis is the regret.
Figure 5 shows the results under L1 loss. The optimal aggrega-
tor and majority vote have close performance. It also reflects our
discussion that L1 loss will encourage the aggregators to output a
decision, which is beneficial for the majority vote.
F
General Model
In this section, we extend our adversarial information aggregation
problem into a general case. In the general setting, we can capture
a non-binary state space Ω, other families of information structures
Θ, and other kinds of reports 𝑥𝑖such as the posterior forecast
𝑥𝑖= Pr𝜃[𝜔|𝑠𝑖].
F.1
Problem Statement
Suppose the world has a state 𝜔∈Ω, |Ω| = 𝑚. There are 𝑛experts
and each expert 𝑖receives a private signal 𝑠𝑖in a signal space S𝑖.
Let S = S1 × S2 × ... × S𝑛. They are asked to give a report from a
feasible choice set 𝑋according to their private signals. We denote
the joint distribution, or information structure, over the state and
signals by 𝜃∈ΔΩ×S. For simplicity, we denote 𝒙𝑇= (𝑥𝑡)𝑡∈𝑇as
the sub-vector for any vector 𝒙and index set 𝑇.
We assume the experts are either truthful or adversarial. Let
𝑇denote the set of truthful experts who will give their best re-
port truthfully. 𝐴is the set of adversarial experts who will collude
and follow a randomized strategy 𝜎𝐴: S𝐴→Δ𝑋𝑘depending on
their private signals, where 𝑘= 𝛾𝑛is the number of adversarial ex-
perts. The family of all possible strategies is Σ. We assume 𝛾< 1/2
such that there exist at least half truthful experts, otherwise no
aggregators can be effective.
Notice that the ability of adversarial experts can be modeled
by their private signals. For example, the omniscient adversarial
experts can know truthful experts’ signals S𝑅and the world’s true
state 𝜔. The ignorant adversarial experts are non-informative, i.e.
receiving nothing.
The aggregator is an anonymous function 𝑓(·) ∈F which maps
𝒙∈𝑋𝑛to a distribution 𝒚∈ΔΩ over the world state. We de-
fine a loss function ℓ(𝒚,𝜔) : ΔΩ × Ω →𝑅+, indicating the loss
suffered by the aggregator when the aggregator’s predicted distri-
bution of the state is 𝒚and the true state is 𝜔. The expected loss
is E𝜃,𝜎[ℓ(𝑓(𝒙),𝜔)]. We assume ℓis symmetric and convex for any
state, which means we can abbreviate ℓ(𝒚,𝜔) by ℓ(𝑦𝜔). Without
loss of generality, we assume ℓ(0) = 1, ℓ(1) = 0 and ℓ(·) is de-
creasing. In particular, we consider the L1 loss (or absolute loss)
ℓ1(𝑦) = 1 −𝑦and the L2 loss (or square loss), ℓ2(𝑦) = (1 −𝑦)2. We
define a benchmark function, that gives the optimal result given
the joint distribution and truthful experts’ reports:
𝑜𝑝𝑡𝜃(𝒙𝑇) = arg min
𝑓′∈F
E𝜃[ℓ(𝑓′(𝒙𝑇)𝜔)]
to minimize the expected loss.
Under the L1 loss, 𝑜𝑝𝑡𝜃(𝒙𝑇)𝜔= 1(𝜔= arg max𝜔Pr𝜃[𝜔|𝒙𝑇]),
which is the maximum likelihood. Under the L2 loss, 𝑜𝑝𝑡𝜃(𝒙𝑇)𝜔=
Pr𝜃[𝜔|𝒙𝑇], which is the Bayesian posterior.
Regret Robust Paradigm. Given a family of joint distributions
Θ and a family of strategies Σ, a set of aggregators F , we aim to
minimize the expected loss in the worst information structure. That
is, we want to find an optimal function 𝑓∗to solve the following
min-max problem:
𝑅(Θ, Σ) = inf
𝑓∈F
sup
𝜃∈𝜃,𝜎∈Σ
E𝜃,𝜎[ℓ(𝑓(𝒙)𝜔)] −E𝜃[ℓ(𝑜𝑝𝑡𝜃(𝒙𝑇)𝜔)].
Again we define𝑅(𝑓,𝜃, 𝜎) = E𝜃,𝜎[ℓ(𝑓(𝒙)𝜔)]−E𝜃[ℓ(𝑜𝑝𝑡𝜃(𝒙𝑇)𝜔)]
and 𝑅(𝑓, Θ, Σ) = sup𝜃∈Θ,𝜎∈Σ 𝑅(𝑓,𝜃, 𝜎) for short.
F.2
Negative Results For General Model
We first provide an auxiliary lemma to characterize the behavior of
adversaries.
Lemma F.1. Assume Σ𝑝= {𝜎|𝜎∈Σ 𝑎𝑛𝑑𝜎𝑖𝑠𝑎𝑝𝑢𝑟𝑒𝑠𝑡𝑟𝑎𝑡𝑒𝑔𝑦}.
Then 𝑅(𝑓, Θ, Σ) = 𝑅(𝑓, Θ, Σ𝑝) for any 𝑓and Θ.
Proof. On the one hand, Σ𝑝∈Σ, so 𝑅(𝑓,𝜃, Σ) ≥𝑅(𝑓,𝜃, Σ𝑝).
On the other hand, for any 𝑓,𝜃, 𝜎,
𝑅(𝑓,𝜃, 𝜎) = E𝜃E𝜎[ℓ(𝑓(𝒙𝑇, 𝜎(𝒔𝐴)),𝜔)] −E𝜃[ℓ(𝑜𝑝𝑡𝜃(𝒙𝑇)𝜔)]
≤E𝜃[max
𝒙′
𝐴
ℓ(𝑓(𝒙𝑇, 𝒙′
𝐴(𝒔𝐴)),𝜔)] −E𝜃[ℓ(𝑜𝑝𝑡𝜃(𝒙𝑇)𝜔)]
Fix the aggregator 𝑓and distribution 𝜃, we can let 𝜎′(𝒔𝐴) =
arg max𝒙′
𝐴E𝜃[ℓ(𝑓(𝒙𝑇, 𝒙′
𝐴(𝒔𝐴)),𝜔)] (We arbitrarily select one 𝒙′
𝐴
when there is multiple choices). Since 𝜎′ is a pure strategy, 𝜎′ ∈
Σ𝑑. For any 𝜎∈Σ, 𝑅(𝑓,𝜃, 𝜎′) ≥𝑅(𝑓,𝜃, 𝜎). Thus 𝑅(𝑓,𝜃, Σ) ≤
𝑅(𝑓,𝜃, Σ𝑝), which completes our proof.
□
F.3
Extension to Multi-State Case
For the multi-state case: |Ω| > 2, we can also define the sensitive
parameter by enumerating each state:
Definition F.2 (sensitive parameter, multiple). When |Ω| >
2, for any benchmark function 𝑜𝑝𝑡, the sensitive parameter is defined
by
𝑆(𝑜𝑝𝑡,𝑘) =
max
𝜃,𝜃′∈Θ,𝑑(𝒙𝑇,𝒙′
𝑇)≤𝑘,𝜔∈Ω |𝑜𝑝𝑡𝜃(𝒙𝑇)𝜔−𝑜𝑝𝑡𝜃′ (𝒙′
𝑇)𝜔|.

Robust Aggregation with Adversarial Experts
WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
First, we prove that for the general model, aggregators are vulner-
able to adversaries. A direct observation is that fixing the number
of experts 𝑛while increasing the number of adversaries 𝑘will not
decrease the regret 𝑅(Θ, Σ). Since the new adversaries can always
pretend to be truthful experts. In most cases, when 𝛾≈1/2, it is im-
possible to design any informative aggregator since an adversarial
expert can report opposite views to another truthful expert.
One natural question is how many adversaries we need to at-
tack the aggregator. For this question, we provide a negative result.
The following lemma shows that for a large family of information
structures, a few adversaries are enough to fool the aggregator. Sur-
prisingly, the number of adversaries is independent of the number
of truthful experts but grows linearly with the number of states.
In special, in the binary state setting, one adversary is enough to
completely fool the aggregator.
Lemma F.3. Assume the truthful experts are asked to report the
posterior 𝑥𝑖(𝜔) = Pr𝜃[𝜔|𝑠𝑖]. We define the fully informative expert
who always knows the true state and the non-informative expert
who only knows the prior. If Θ includes all information structures
consisting of these two types of experts, then for 𝑘≥𝑚−1, the optimal
aggregator is the uniform prediction. That is, 𝑓∗= ( 1
𝑚, · · · , 1
𝑚) and
𝑅(𝜃, 𝜎) = ℓ( 1
𝑚).
Proof. We select one fully informative expert, which means she
will report a unit vector 𝒆𝑖= (0, · · · , 1, 0, · · · , 0) with 𝑒𝑖= 1 and
𝑒𝑗= 0 for any 𝑗≠𝑖. Other experts are non-informative and will
always report the uniform prior ( 1
𝑚, · · · , 1
𝑚). Then let the 𝑚−1
adversaries report other unit vectors 𝒆𝑗for 𝑖≠𝑗. Other adversaries
also report the uniform prior. In that case, the aggregator will
always see the same reports 𝒙0, and the benchmark can follow
the informative expert and suffer zero loss. Since ℓis convex and
Í
𝜔∈Ω 𝑓(𝒙0)𝜔= 1, then for any 𝑓, 𝑅(𝑓,𝜃, 𝜎) = Í
𝜔∈Ω ℓ(𝑓(𝒙0)𝜔) ≥
ℓ( 1
𝑚). Thus 𝑅(Θ, Σ) ≥ℓ( 1
𝑚).
On the other hand, when 𝑓∗= ( 1
𝑚, · · · , 1
𝑚),
𝑅(𝑓∗,𝜃,𝑔) =
∑︁
𝜔∈Ω
Pr[𝜔]ℓ( 1
𝑚) = ℓ( 1
𝑚)
for any 𝜃, 𝜎. So the uniform prediction is the optimal aggregator
and 𝑅(Θ, Σ) = ℓ( 1
𝑚).
□
The uniform prediction means that we cannot obtain any ad-
ditional information from reports. It is almost impossible in the
non-adversarial setting. We provide a common setting as an exam-
ple.
Example F.4 (Conditionally Independent Setting). Condi-
tionally independent setting Θci means that every expert receives
independent signals conditioning on the world state 𝜔. Formally, for
each 𝜃∈Θci, for all 𝑠𝑖∈S𝑖,𝜔∈Ω = {0, 1}, Pr𝜃[𝑠1, · · · ,𝑠𝑛|𝜔] =
Π𝑖Pr𝜃[𝑠𝑖|𝜔].
Corollary F.5. In the conditionally independent setting, if we
select ℓas the L2 loss, then for any 𝑛and 𝑘≥1, 𝑅= 1/4.
Notice that in the non-adversarial setting, when 𝑛→∞, 𝑅→
1/4 [2], which is a strict condition. However, in the adversarial
setting, we only use one adversary to obtain the same bad regret.
F.4
Estimate the Regret 𝑅(Θ, Σ)
We have provided a negative result when there are enough adversar-
ial experts. In this section, we want to extend our result regarding
the regret to any number of adversarial experts setting. It will give
us a further understanding of the effect of adversaries.
Intuitively, when there exist important experts, it is easier to
disturb the aggregator because adversaries can always imitate an
important expert but hold the opposite view. In other words, the
regret will increase because the DM is non-informative while the
benchmark can predict accurately. Thus we can use the importance
of an expert to bound the regret. The remaining question is, how to
quantify the importance of an expert? We find that the benchmark
function is a proper choice. We state our main result as Theorem F.6.
Theorem F.6. If Θ is 𝛼-regular as defined in Definition F.11, for
L2 loss function ℓ2, there exists a function 𝑆(𝑜𝑝𝑡,𝑘) depending on the
benchmark function 𝑜𝑝𝑡and number of adversaries 𝑘such that
𝑆(𝑜𝑝𝑡,𝑘)2 ≥𝑅(Θ, Σ) ≥𝛼
4 𝑆(𝑜𝑝𝑡,𝑘)2.
The theorem shows that we can only use the benchmark func-
tion to design a metric for the difficulty of adversarial information
aggregation. Now we give the formula of 𝑆(·). First, we define the
distance of reports.
Definition F.7 (distance of reports). For any vector 𝒙, we can
define its histogram function ℎ𝒙(𝑥) = Í
𝑖1(𝑥𝑖= 𝑥). For any pair of
reports 𝒙1, 𝒙2 with the same size, their distance is defined by the total
variation distance between ℎ𝒙1 (𝑥) and ℎ𝒙2 (𝑥).
𝑑(𝒙1, 𝒙2) = 𝑇𝑉𝐷(ℎ𝒙1,ℎ𝒙2) = 1/2
∑︁
𝑥


ℎ𝒙1 (𝑥) −ℎ𝒙1 (𝑥)


 .
If 𝑑(𝒙1, 𝒙2) = 0, we say that 𝒙1 and 𝒙2 are indistinguishable, which
means they only differ in the order of reports. In fact, 𝑑(𝒙1, 𝒙2) is the
minimal number of adversaries needed to make two reports indistin-
guishable. We also denote 𝑑(𝒙) = Í
𝑥ℎ𝒙(𝑥).
Lemma F.8. Suppose the truthful experts will report 𝒙1 ∈𝑋𝑛−𝑘
or 𝒙2 ∈𝑋𝑛−𝑘. If and only if 𝑘≥𝑑(𝒙1, 𝒙2), there exists 𝒙1
𝐴, 𝒙2
𝐴∈𝑋𝑘
such that 𝑑((𝒙1, 𝒙1
𝐴), (𝒙2, 𝒙2
𝐴)) = 0. That is, 𝑑(𝒙1, 𝒙2) is the minimal
number of adversaries needed to ensure the aggregator sees the same
report vector 𝒙in these two cases.
Proof of Lemma F.8. Consider the final report vector 𝒙seen by
the aggregator, we have ℎ𝒙(𝑥) ≥max(ℎ𝒙1 (𝑥),ℎ𝒙2 (𝑥)) for any 𝑥.
Thus to convert 𝒙2 to 𝒙, we need at least
∑︁
𝑥
|ℎ𝒙(𝑥) −ℎ𝒙2 (𝑥)| ≥
∑︁
𝑥
max(ℎ𝒙1 (𝑥) −ℎ𝒙2 (𝑥), 0)
= 1/2
∑︁
𝑥
 |ℎ𝒙1 (𝑥) −ℎ𝒙2 (𝑥)| + ℎ𝒙1 (𝑥) −ℎ𝒙2 (𝑥)
= 1/2
∑︁
𝑥
|ℎ𝒙1 (𝑥) −ℎ𝒙2 (𝑥)|
(Í
𝑥ℎ𝒙1 (𝑥) = Í
𝑥ℎ𝒙2 (𝑥) = 𝑛)
Similarly, to convert 𝒙1 to 𝒙, we need |ℎ𝒙1 (𝑥) −ℎ𝒙2 (𝑥)| adver-
saries, which complete our proof.
□

WWW ’25, April 28-May 2, 2025, Sydney, NSW, Australia
Yongkang Guo and Yuqing Kong
Now we define the sensitive parameter in the binary state case,
where the benchmark function can be represented by a real number.
Intuitively, it measures the greatest change 𝑘experts can make
regarding the benchmark function.
Definition F.9 (sensitive parameter, binary). When |Ω| = 2,
for any benchmark function 𝑜𝑝𝑡, the sensitive parameter is defined
by
𝑆(𝑜𝑝𝑡,𝑘) =
max
𝜃,𝜃′∈Θ,𝑑(𝒙𝑇,𝒙′
𝑇)≤𝑘|𝑜𝑝𝑡𝜃(𝒙𝑇) −𝑜𝑝𝑡𝜃′ (𝒙′
𝑇)|
We define the sensitive parameter in the binary state case. How-
ever, it is easy to generalize it to multi-state cases. We will discuss
it later. Now we prove our main theorem.
Proof of Theorem F.6. First, we construct a naive aggregator
in the binary setting.
Definition F.10 (naive aggregator). We use the average of
the maximum and minimal prediction over all possible situations as
the naive aggregator. Formally, we define 𝑢(𝒙) = max𝜃𝑜𝑝𝑡𝜃(𝒙) and
𝑙(𝒙) = min𝜃𝑜𝑝𝑡𝜃(𝒙) for any 𝒙∈𝑋𝑛−𝑘. The naive aggregator is
𝑓𝑛𝑎(𝒙) = 1/2
max
𝑑(𝒙′)=𝑛−𝑘,𝑑(𝒙,𝒙′)=𝑘𝑢(𝒙′)+1/2
min
𝑑(𝒙′)=𝑛−𝑘,𝑑(𝒙,𝒙′)=𝑘𝑙(𝒙′).
By the definition of 𝑆(𝑜𝑝𝑡,𝑘), for any 𝜃∈Θ, 𝜎∈Σ,
𝑅(𝜃, 𝜎) ≤𝑅(𝑓𝑛𝑎,𝜃, 𝜎)
≤
sup
𝜃∈Θ,𝜎∈Σ
E𝜃,𝜎[ℓ(𝑓𝑛𝑎(𝒙),𝜔)] −E𝜃[ℓ(𝑜𝑝𝑡𝜃(𝒙𝑇),𝜔)]
=
sup
𝜃∈Θ,𝜎∈Σ
E𝜃,𝜎[ℓ(𝑓𝑛𝑎(𝒙),𝜔) −ℓ(𝑜𝑝𝑡𝜃(𝒙𝑇),𝜔)]
≤
max
𝜃∈Θ,𝜎∈Σ ℓ(|𝑓𝑛𝑎(𝒙) −𝑜𝑝𝑡𝜃(𝒙𝑇)|)
≤ℓ(𝑆(𝑜𝑝𝑡,𝑘)/2)
However, The proof fails in the multi-state case since 𝑓𝑛𝑎(𝒙)
is not a distribution, thus illegal in this setting. Instead, we need
another aggregator.
Suppose𝑢(𝒙)𝜔= max𝜃𝑜𝑝𝑡𝜃(𝒙)𝜔. Then it is obvious that Í
𝜔𝑢(𝒙)𝜔≥
Í
𝜔𝑜𝑝𝑡𝜃(𝒙)𝜔= 1. Similarly we have 𝑙(𝒙)𝜔= min𝜃𝑜𝑝𝑡𝜃(𝒙)𝜔and
Í
𝜔𝑙(𝒙)𝜔≤Í
𝜔𝑜𝑝𝑡𝜃(𝒙)𝜔= 1.
Thus for every 𝒙there exists a vector 𝑓′(𝒙) such that for any
𝜔∈Ω, 𝑙(𝒙)𝜔≤𝑓′(𝒙)𝜔≤𝑢(𝒙)𝜔and Í
𝜔𝑓(𝒙)𝜔= 1. We can pick
𝑓′(𝒙) as the aggregator and for any 𝜃∈Θ, 𝜎∈Σ,
𝑅(𝜃, 𝜎) ≤𝑅(𝑓′,𝜃, 𝜎)
≤
sup
𝜃∈Θ,𝜎∈Σ
E𝜃,𝜎[ℓ(𝑓′(𝒙),𝜔)] −E𝜃[ℓ(𝑜𝑝𝑡𝜃(𝒙𝑇),𝜔)]
=
sup
𝜃∈Θ,𝜎∈Σ
E𝜃,𝜎[ℓ(𝑓′(𝒙),𝜔) −ℓ(𝑜𝑝𝑡𝜃(𝒙𝑇),𝜔)]
≤
max
𝜃∈Θ,𝜎∈Σ ℓ(|𝑓′(𝒙) −𝑜𝑝𝑡𝜃(𝒙𝑇)|)
≤ℓ(𝑆(𝑜𝑝𝑡,𝑘))
Now we consider the lower bound of 𝑅(Θ, Σ) (Lemma F.12). A
basic idea is that we can construct a coupling of two information
structures whose reports have a distance smaller than 𝑘. Then the
adversaries can make the coupling indistinguishable. However, if
the probability of the worst case is too small, then their contribu-
tion to the regret is also negligible. Thus we need to constrain the
information structures (Definition F.11).
Definition F.11 (𝛼-regular information structure). An in-
formation structure 𝜃is 𝛼-regular if every possible report vector 𝒙
will appear with probability at least 𝛼:
min
𝒙:Pr𝜃[𝒙]>0 Pr
𝜃[𝒙] > 𝛼.
Lemma F.12. If 𝜃is 𝛼-regular, for any benchmark function 𝑜𝑝𝑡
and L2 loss ℓ2, 𝑅(Θ, Σ) ≥𝛼
4 𝑆(𝑜𝑝𝑡,𝑘)2.
Proof. Fix𝛼, let the maximum of𝑆(𝑜𝑝𝑡,𝑘) is obtained by𝜃,𝜃′, 𝒙𝑇, 𝒙′
𝑇.
We construct an information structure as follows. Suppose the
joint distribution 𝜃′′ is the mixture of 𝜃and 𝜃′ with equal prob-
ability. By the definition of 𝑑(𝒙𝑇, 𝒙′
𝑇), there exists 𝜎′ such that
ℎ𝒙𝑇,𝜎′ (𝒙𝑇) = ℎ𝒙′
𝑇,𝜎′ (𝒙′
𝑇). Then we have
𝑅(𝜃, 𝜎) ≥𝑅(𝜃′′, 𝜎′)
≥min
𝑓
E𝜃′′,𝜎′ [ℓ(𝑓(𝒙),𝜔)] −E𝜃′′ [ℓ(𝑜𝑝𝑡′′
𝜃(𝒙′′
𝑇),𝜔)]
= min
𝑓
E𝜃′′,𝑔′ [(𝑓(𝒙) −𝑜𝑝𝑡𝜃′′ (𝒙′′
𝑇))2]
= 1/2 min
𝑓
Pr
𝜃[𝒙𝑇](𝑓(𝒙) −𝑜𝑝𝑡𝜃(𝒙𝑇))2 + Pr
𝜃′ [𝒙′
𝑇](𝑓(𝒙) −𝑜𝑝𝑡𝜃′ (𝒙′
𝑇))2
≥
Pr𝜃[𝒙𝑇] Pr𝜃′ [𝒙′
𝑇]
2(Pr𝜃[𝒙𝑇] + Pr𝜃′ [𝒙′
𝑇]) (𝑜𝑝𝑡𝜃(𝒙𝑇) −𝑜𝑝𝑡𝜃′ (𝒙′
𝑇))2
≥𝛼
4 𝑆(𝑜𝑝𝑡,𝑘)2
□
Combining the lower bound and upper bound, we infer Theo-
rem F.6.
□