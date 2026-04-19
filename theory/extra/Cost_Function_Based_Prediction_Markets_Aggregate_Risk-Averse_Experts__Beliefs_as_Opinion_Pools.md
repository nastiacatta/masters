BROWN UNIVERSITY
DEPARTMENT OF COMPUTER SCIENCE
SC.B. IN COMPUTER SCIENCE-ECONOMICS
Cost Function Based Prediction Markets Aggregate
Risk-Averse Experts’ Beliefs as Opinion Pools
Author:
JACK CIABATON
Advisor:
AMY GREENWALD
Reader:
JACK FANNING
May 2022

Abstract
Prediction markets are a type of market which are used to aggregate prob-
abilistic beliefs of agents over the outcome of an event. At a high-level, in a
prediction market, agents trade securities whose payoffs are tied to the outcome
of some future event. Empirical evidence shows that the probability of an event
occurring is proportional to the price of the security associated with that secu-
rity. In this thesis, we focus on a certain type of prediction market called the cost
function based prediction market, in which agents purchase or sell shares of a se-
curity according to a cost function, which states how much it costs to buy or sell a
share of that security. We show that cost function based prediction markets aggre-
gate risk-averse experts’ beliefs about the fair number of net shares that should
be bought or sold in the market in the same way as a more traditional method
of belief aggregation, called an opinion pool. We also present an equivalence
between cost function based prediction markets and another kind of prediction
market called market scoring rules, and through this correspondence, we present
a new characterization of a class of opinion pools called quasi-arithmetic opinion
pools.

Introduction
Given an uncertain binary future event and a group of experts with informed opinions about the outcome of
this event, how can we aggregate these beliefs together into a single probability? If you know the true beliefs of
each expert, then you can use something called an opinion pool (or forecast aggregator) [9], which maps a vector of
probabilities to a single aggregated probability. However, what do you do if these experts aren’t willing to truthfully
give away their private information for free?
In this case, you can set up a prediction market [15], which allows these experts to sequentially trade a security
whose value is tied to the outcome of the event. If the experts are risk-neutral and maximize their expected payoff,
then the outcome of a prediction market does not achieve our goal, since the value of the security is only based on the
most recent expert to participate in the market. However, if the experts are risk-averse and maximize their expected
payoffs, then certain types of prediction markets achieves their goal of having the value of the security equal to an
opinion pool of all of the experts who traded in the prediction market [5].
One way to set up a prediction market is to use a market scoring rule (MSR) [12], where each expert is assigned
a score based on their reported belief and the realized outcome of the event, and then the compensation of any expert
is equal to their score minus the previous market participant’s score. Another way to organize a prediction market is
to allow experts to buy or sell shares of a security that are each equal to $0 or $1, depending on whether the event
happens or not. In this setting, the cost of buying or selling shares is based on a cost function [6], which maps a
number of total market shares outstanding to a cost.
It is known that a market scoring rule will aggregate risk averse experts’ beliefs into an opinion pool of those
beliefs [5]. In this paper, we prove that the same holds for cost functions; that is, that they also aggregate risk averse
experts’ beliefs into an opinion pool. We do this by taking advantage of a correspondence between a large class of
market scoring rules and a large class of cost functions [1], which is that for each market scoring rule, its convex dual
is some cost function, and vice versa.
We also introduce an alternative characterization for the class of quasi-arithmetic opinion pools [18], which, to
our knowledge, has not been observed before. We do this by showing that the set of all opinion pools that arise from
market scoring rules whose corresponding cost functions yield the most basic opinion pool, the linear opinion pool,
is exactly the set of all quasi-arithmetic opinion pools.
1.1
Related Work
In the field of belief aggregation, opinion pools were originally presented by Genest and Zidek [9] as a math-
ematical tool to combine multiple probability distributions into a single one; the version that we use in this paper
is closer to the formulation of opinion pools by Dietrich and List [7], which is an aggregator that satisfies a set of
reasonable axioms.
On the other hand, belief elicitation through scoring rules is a relatively old field with lots of contributors. The
quadratic scoring rule was originally introduced by Brier [4], the logarithmic scoring rule was introduced by Good
[11], while a general theory of proper scoring rules and Savage representation was formulated by Savage [21].
Quasi-arithmetic opinion pools were introduced by Neyman and Roughgarden [18] as an extension of quasi-
arithmetic means, a concept discovered simultaneously by Kolmogorov [14] and Nagumo [17], also building on the
work of Aczel [2] to include weights as an input. Neyman and Roughgarden introduced the formula to define quasi-
arithmetic opinion pools as well as 3 natural settings that define them as solutions to certain problems; in this paper,
we introduce another setting where the set of quasi-arithmetic pools is exactly the solution set to a specific problem,

namely the problem of which opinion pools that arise from market scoring rules are equivalent to the linear opinion
pool from a cost function.
The use of prediction markets is a newer topic, and they have been shown to be an effective way to aggregate
opinions together (Wolfers and Zitzewitz [23]). Agents with various trading models have been shown to create a
competitive market equilibrium that is the outcome of an opinion pool of those agents’ beliefs (Beygelzimer et al.
[3], Millin et al. [16], Hu and Storkey [13], and Storkey et al. [22]). Those models looked into prices in equilibrium,
while Chakraborty and Sanmay [5] developed theory around how prices evolve in prediction markets, specifically in
market scoring rules for agents with general utility functions.
Cost functions acting as a prediction market was introduced by Chen and Pennock [6]. The correspondence
between market scoring rules and cost functions was outlined in Abernathy et. al. [1] using ideas of convex duality
originally created by Rockafellar [19]. We try to extend some of the results from Chakraborty and Sanmay to cost
functions, making use of the correspondence detailed by Abernathy et. al.
1.2
Notation
We use bold uppercase letters to denote matrices (e.g., X), bold lowercase letters to denote vectors (e.g., p),
bold uppercase letters to denote vector-valued random variables (e.g., Γ), lowercase letters to denote scalar quantities,
(e.g., x), and uppercase letters to denote scalar-valued random variables (e.g., X).
We denote the ith row vector of a matrix (e.g., x) by the corresponding bold lowercase letter with subscript i
(e.g., xi). Similarly, we denote the jth entry of a vector (e.g., p or xi) by the corresponding Roman lowercase letter
with subscript j (e.g., pj or xij).
We denote functions by a letter determined by the value of the function e.g., f if the mapping is scalar valued
and f if the mapping is vector valued.
We denote the set of integers {1, . . . , n} by [n], the set of natural numbers by N, the set of real numbers by
R. We denote the postive and strictly positive elements of a set by a + and ++ subscript respectively, e.g., R+ and
R++.
Utility Functions
In this paper, we assume that an agent always tries to maximize their expected utility when acting in a market.
We further assume that their utility depends only on their own wealth.
Mathematically, we say that an agent acting in a market has utility u that is a continuous function of their wealth
c, where c ∈[cmin, ∞] denotes their ex post wealth, or their net compensation after they act in a market. The constant
cmin ∈[−∞, 0] is the minimum acceptable level of wealth for our agent, i.e., a negative value above it is a tolerable
level of debt, while a value below it implies −∞utility.
The simplest utility function is u(c) = c, and an agent with this utility function is called risk-neutral. This is
because an agent with this utility function is just trying to maximize their expected compensation, which means that
they are indifferent between taking risks and not. We illustrate this in the following example:
Example 2.1. A risk-neutral agent acting in a market has 2 choices; they can either get a guaranteed $5 profit, or they
can have a 50% chance to get a $10 profit and a 50% chance to get a $0 profit. Their expected utility if they take the
guaranteed profit is u($5) = 5, and their expected utility if they take the riskier option is (0.5)u($10)+(0.5)u($0) =

5. A risk-neutral agent is indifferent between these two options, even though one is riskier than the other, because
they both have the same expected value.
We call an agent risk-averse if their utility function u is increasing in their wealth (except perhaps at ∞, where
it must be non-decreasing) and has a negative second derivative (expect perhaps at ∞, where it can be 0). This model
is thought to represent most attitudes towards money; getting more money usually makes someone happier, but each
subsequent unit of currency earned does not make one as happy as the previous unit of currency earned (i.e., there are
usually diminishing returns to money). The term risk-averse reflects how agents with this kind of utility function will
prefer a guaranteed profit over a risky one if they have the same expected value, as shown in the following example:
Example 2.2. A risk-averse agent with utility function u(c) = ln(c + 1) acting in a market has 2 choices; they can
either get a guaranteed $5 profit, or they can have a 50% chance to get a $10 profit and a 50% chance to get a $0
profit. Their expected utility if they take the guaranteed profit is u($5) = ln($5 + $1) = ln($6) = 1.79, and their
expected utility if they take the riskier option is (0.5)u($10 + $1) + (0.5)u($0 + $1) = (0.5) ln($11) + (0.5) ln($1) =
1.20. Therefore, this agent prefers the guaranteed profit over the risky one, even though they both have the same
expected payoff of $5.
Scoring Rules
In this section, we define what a scoring rule is and how one can be applied to binary events. We introduce
the class of proper scoring rules, which have the property that agents who are being paid out according to them and
aim to maximize their expected risk-neutral utility report their true beliefs. We present the two most popular scoring
rules, and then we define the expected reward function of a scoring rule.
3.1
Introduction to Scoring Rules
A scoring rule s : [0, 1] →{0, 1} × R maps a reported probability p that an event will happen to a tuple
(s1(p), s0(p)), which represents an agent’s compensation if outcome 1 (the event occurs) and outcome 0 (the event
does not occur) happen, respectively.
We define an agent’s expected score to be that agent’s expected value of a scoring rule s that takes as input the
agent’s report p when that agent has true probability π, or:
Ej∼π[sj(p)] = πs1(p) + (1 −π)s0(p)
(1)
A scoring rule s is called (strictly) proper if an expert’s expected score is (strictly) maximized by reporting their
belief that the event will happen truthfully. In other words, if s is proper, then for an agent with true belief π ∈[0, 1]:
π ∈arg max
p∈[0,1]
[Ej∼π[sj(p)]]
(2)
for all other beliefs p, with equality (only) for p = π.
A scoring rule s is called regular if sj(·) is real-valued, except possibly that s0(1) or s1(0), or both, could be
−∞.

3.2
Popular Proper Scoring Rules
We now introduce the two most popular proper scoring rules to use in truthful elicitation, which are Brier’s
quadratic scoring rule [4] and the logarithmic scoring rule [11].
One very common proper scoring rule is the quadratic scoring rule:
squad
(p) := 2p −(p2 + (1 −p)2)
(3)
squad
0
(p) := 2(1 −p) −(p2 + (1 −p)2)
(4)
This scoring rule is an affine transformation (i.e., it differs only by scaling and a constant) of the scoring rule s1(p) =
(1 −p)2, s1(p) = p2. Therefore, the quadratic scoring rule can be thought of as penalizing experts by the squared
distance from their report p and the true outcome of the event.
Another popular scoring rule is the logarithmic scoring rule, which is given by:
slog
1 (p) := b ln p
(5)
slog
0 (p) := b ln(1 −p),
(6)
where b > 0 is a free parameter. The most standard form of the logarithmic scoring rule takes b = 1.
Example 3.1. Let’s assume that an expert reports p = 0.8, which means that the event has an 80% chance of having
outcome 1 and a 100% - 80% = 20% chance of having outcome 2. If outcome 1 happens, then their score according
to the quadratic scoring rule would be:
squad
(0.8) = 2(0.8) −(0.82 + 0.22) = 1.6 −0.68 = 0.92.
(7)
If outcome 0 happens, then their score according to the quadratic scoring rule would be:
squad
0
(0.8) = 2(1 −0.8) −(0.82 + 0.22) = 0.4 −0.68 = −0.28.
(8)
If outcome 1 happens, then their score according to the logarithmic scoring rule with parameter b = 1 would be:
slog
1 (0.8) = ln(0.8) ≈−0.22.
(9)
If outcome 0 happens, then their score according to the logarithmic scoring rule with parameter b = 1 would be:
slog
0 (0.8) = ln(1 −0.8) ≈−1.61.
(10)
For both scoring rules, the expert’s score is higher when outcome 1 happened, since they reported that outcome 1
had a higher chance of occurring than outcome 0.
3.3
Savage Representation
The expected reward function of a scoring rule is equal to the expected score that an expert with belief p who
reports that same probability p earns when being scored using a scoring rule s.

Formally, we define the expected reward function G for a scoring rule s to be:
G(p) := Ej∼p[sp(j)] = ps1(p) + (1 −p)s0(p).
(11)
This representation of s is known as the Savage representation of s. If s is strictly proper, then G will be a
strictly convex function, and in fact, there is a 1-to-1 correspondence between regular strictly proper scoring rules
and strictly convex functions using the Savage representation [10]. This means that you can go the other way: given
any strictly convex function G, you can derive its corresponding scoring rule s by taking:
sj(p) = G(p) + g(p)(j −p),
(12)
where g is the derivative of G.
The Savage representation of the quadratic scoring rule is:
Gquad(p) = p2 + (1 −p)2.
(13)
The Savage representation of the logarithmic scoring rule is:
Glog(p) = p ln p + (1 −p) ln(1 −p).
(14)
Example 3.2. Let’s assume that an agent reports a probability of p = 0.3, and they are scored using the logarithmic
scoring rule. Their expected score would be:
Glog(0.3) = 0.3 ln 0.3 + (1 −0.3) ln(1 −0.3) = −0.61.
(15)
We can draw this point on the expected reward function curve, which is a convex function:
So, our agent’s expected score if they report 0.3 is about -0.61. If they were to report something else, like 0.6, then
by Equation (12), then their expected score would be:
Ej∼0.3[slog
j (0.6)] = Ej∼0.3[Glog(0.6) + glog(0.6)(j −0.6)]
(16)
= (0.3)Glog(0.6) + glog(0.6)(1 −0.6) + (1 −0.3)Glog(0.6) + glog(0.6)(0 −0.6)
(17)

= Glog(0.6) + glog(0.6)(0.3 −0.6) = −0.8.
(18)
First, since the log scoring rule is a proper scoring rule, we expect that our agent’s expected score of reporting 0.3
when their belief is 0.3 is greater than their expected score of reporting 0.6 when their belief is 0.3, and we confirm
that since −0.61 > −0.8. Also, looking at Equation (18), we can see that our agent’s expected score when they
believe 0.3 and report 0.6 is equal to the expected reward function evaluated at 0.6, plus the product of the derivative
of the expected reward function at 0.6 and the distance between 0.6 and 0.3. We can represent this graphically:
If we start at the point (0.6, -0.67), which is Glog(0.6), and then we travel on the purple line, which is the derivative
of the expected reward function at 0.6, to where the x-value is 0.3, we arrive at exactly -0.8, the expected reward for
reporting 0.6 when our agent’s belief is 0.3.
Opinion Pools
Now that we have developed the foundations of scoring rules, which can be used to elicit agents’ true beliefs
about an event occurring, we now introduce the opinion pool, which is a way to aggregate together multiple agents’
reported beliefs into a single probability. We set up our model for opinion pools and also introduce the axioms that
define them, and then we present a lemma describing how to iteratively combine together opinion pools of two beliefs,
one at a time to create a larger opinion pool. We then focus on a smaller class of opinion pools called quasi-arithmetic
opinion pools, which relates back to scoring rules, and we prove a novel lemma about combining quasi-arithmetic
opinion pools iteratively, analogous to the aforementioned lemma about aggregating multiple beliefs, to form an
opinion pool.
4.1
Introduction to Opinion Pools
Our model of an opinion pool is as follows:
• We have n experts who can forecast the outcome of a binary event.

• Each expert i has a weight wi that represents the importance of that expert. We assume that Pn
i=1 wi = 1.
• Each expert i has a report pi that dictates the probability they claim the event will happen.
• An opinion pool combines together the reports and weights of all experts to create an aggregated probability
ˆp of the event occurring, doing so in a way that satisfies three axioms [8]:
1. Unanimity: If all experts agree, the aggregate also agrees with them.
2. Boundedness: The aggregate is bounded by the extremes of the experts’ beliefs.
3. Monotonicity: If one expert changes her opinion in a particular direction while all other experts’ opinions
remain unaltered, then the aggregate changes in the same direction.
The two most common opinion pools are the linear opinion pool and logarithmic opinion pool. The linear
opinion pool aggregates as follows:
LinOP(p1, ..., pn) =
n
X
i=1
wipi ,
(19)
and the logarithmic opinion pool as follows:
LogOP(p1, . . . , pn) =
Qn
i=1 pwi
i
Qn
i=1 pwi
i + Qn
i=1(1 −pi)wi .
(20)
Example 4.1. If we have three experts with reports p1 = 0.2, p2 = 0.3, and p3 = 0.5 and weights w1 = 0.5, w2 =
0.25, and w3 = 0.25, then the linear opinion pool would give an aggregated probability of:
LinOP(0.2, 0.3, 0.5) = (0.5)(0.2) + (0.25)(0.3) + (0.25)(0.5) = 0.3.
(21)
The logarithmic opinion pool would aggregate these same values and weights as:
LogOP(0.2, 0.3, 0.5) =
0.20.50.30.250.50.25
0.20.50.30.250.50.25 + (1 −0.2)0.5(1 −0.3)0.25(1 −0.5)0.25 = 0.288.
(22)
We can also combine together opinion pools on iterated outputs, which will be useful later.
Lemma 4.2. [Combining Opinion Pools] [5] For a two-outcome scenario, if f2(p1, p2) and fn−1(p′
1, p′
2, . . . , p′
n−1) are
valid opinion pools for two probabilistic beliefs p1, p2 and n −1 probabilistic reports p′
1, p′
2, . . . , p′
n−1, respectively,
then f(p1, p2, . . . , pn) = f2(fn−1(p1, p2, . . . , pn−1), pn) is also a valid opinion pool for n reports.
4.2
Quasi-Arithmetic (QA) Pooling
We now introduce a class of opinion pools that are each associated with a scoring rule.
Given a scoring rule s, quasi-arithmetic (QA) pooling with respect to s, given expected reward function
G(p) = ps1(p) + (1 −p)s0(p) with the derivative of that expected reward g(p) = G′(p), is the aggregate probability
p∗such that:
g(p∗) =
n
X
i=1
wig(pi).
(23)

In other words, to aggregate reports from a set of agents, you would calculate each agent’s derivative of the
expected reward function, you would take a weighted average of them, and then you would report the probability
whose own derivative of the expected reward function is equal to that weighted average.
Some motivation for why QA pools are a useful tool is that the two most popular opinion pools, the linear and
logarithmic opinion pools, are equal to the QA pool with respect to the two most popular scoring rules, the quadratic
and logarithmic scoring rules, respectively.
Lemma 4.3 (Linear OP = QA Pool w.r.t Quadratic Scoring Rule). The QA pool with respect to the quadratic scoring
rule is the linear opinion pool.
Proof. Since Gquad(p) = p2 + (1 −p)2, we calculate that its derivative is gquad(p) = 2p −2(1 −p) = 4p −2. This
means that the QA pool with respect to the quadratic scoring rule is the p∗that satisfies:
4p∗−2 =
n
X
i=1
wi(4pi −2)
(24)
= 4
n
X
i=1
wipi −2
n
X
i=1
wi
(25)
= 4
n
X
i=1
wipi −2(1)
(26)
Therefore,
p∗=
n
X
i=1
wipi.
(27)
However, this is exactly the definition of the linear opinion pool.
Lemma 4.4 (Log OP = QA Pool w.r.t Log Scoring Rule). The QA pool with respect to the logarithmic scoring rule
is the logarithmic opinion pool.
Proof. Since Glog(p) = p ln(p)+(1−p) ln(1−p), we calculate that its derivative is glog(p) = ln(p)+1−ln(1−p)−1 =
ln

p
1−p

. This means that the QA pool with respect to the logarithmic scoring rule is the p∗that satisfies:
ln

p∗
1 −p∗

=
n
X
i=1
wi ln

pi
1 −pi

(28)
Equivalently,
p∗
1 −p∗= e
Pn
i=1 wi ln

pi
1−pi

(29)
=
n
Y
i=1
e
wi ln

pi
1−pi

(30)
=
n
Y
i=1

pi
1 −pi
wi
.
(31)
Rearranging the above equation gives us:
p∗
n
Y
i=1
(1 −pi)wi = (1 −p∗)
n
Y
i=1
pwi
i
(32)

p∗
 n
Y
i=1
pwi
i +
n
Y
i=1
(1 −pi)wi
!
=
n
Y
i=1
pwi
i
(33)
p∗=
Qn
i=1 pwi
i
Qn
i=1 pwi
i + Qn
i=1(1 −pi)wi .
(34)
However, this is exactly the definition of the logarithmic opinion pool.
In addition to being able to combine opinion pools to get a larger opinion pool (see Lemma 4.2), combining
outputs of a QA pool using the same QA pool over and over is equivalent to taking a single QA pool of all inputs,
which will also be useful later on.
Lemma 4.5 (Combining QA Opinion Pools). Given a QA pool with underlying expected reward function G with
derivative g and inputs p0, π1, ..., πn, if for all 1 ≤i ≤n, pi is the QA pool of pi−1 and πi with weights (1 −wi)
and wi, respectively, then pn is a QA pool with underlying expected reward function G of p0, π1, . . . , πn with weights
α0 = Qn
i=1(1 −wi) and αi = wi
Qn
j=i+1(1 −wj) for 1 ≤i ≤n.
Proof. We prove this using induction on n.
For our base case, we can see that g(p1) = (1 −w1)g(p0) + w1g(π1) by Equation (23). Therefore, this matches
our resulting QA pool when there is a single expert.
For our inductive step, we assume that pn−1 is a QA pool with underlying expected reward function G of
p0, π1, ..., πn−1, with weights α0 = Qn−1
i=1 (1 −wi) and αi = wi
Qn−1
j=i+1(1 −wj) for 1 ≤i ≤n −1.
We also assume that pn is a QA pool with the same underlying scoring rule and expected reward function G of
pn−1 and πn with weights (1 −wn) and wn, respectively. This means that:
g(pn) = (1 −wn)g(pn−1) + wng(πn).
(35)
Plugging in our expression for g(pn−1) guaranteed by our inductive hypothesis gives us:
g(pn) = (1 −wn)
" n−1
Y
i=1
(1 −wi)
!
g(p0) +
n−1
X
i=1
 
wi
 n−1
Y
j=i+1
(1 −wj)
!
g(πi)
!#
+ wng(πn)
(36)
=
 n
Y
i=1
(1 −wi)
!
g(p0) +
n
X
i=1
 
wi
 n−1
Y
j=i+1
(1 −wj)
!
g(πi)
!
+ wng(πn)
(37)
=
 n
Y
i=1
(1 −wi)
!
g(p0) +
n
X
i=1
 
wi
 
n
Y
j=i+1
(1 −wj)
!
g(πi)
!
.
(38)
Market Scoring Rules (MSRs)
In this section, we present the market scoring rule, which a type of prediction market that utilizes a scoring rule.
We then show that risk-averse agents report something between the current market fair value and their own personal
belief when acting in a market scoring rule. We finish the section by introducing an equivalence between risk-averse
agents acting in a market scoring rule and opinion pools, and then we present two examples of agents with particular
utility functions whose actions will converge to popular opinion pools when they participate in a market scoring rule
made from the logarithmic scoring rule.

5.1
Introduction to Market Scoring Rules
We now introduce a prediction market, which is a way to try to elicit information from experts by providing
them with an incentive to report information that accurately reflects their beliefs. This prediction market is called
a market scoring rule (MSR), and in it, a principal initiates the process of information elicitation by choosing a
scoring rule s and making a baseline report p0. Then, the principal elicits publicly declared reports pi sequentially
from n agents. After all reports are gathered and the event happens, agent i receives ex post compensation cx(pi, pi−1)
from the principal, where x is the realized outcome of the event, and cx is the difference between scores between
agent i and their predecessor:
cx(pi, pi−1) = sx(pi) −sx(pi−1),
x ∈{0, 1}.
(39)
If each agent is risk-neutral and myopic (assuming every interaction with the principal is their last), then the
prediction market is still incentive compatible if the underlying scoring rule is strictly proper. Another nice property
of this prediction market is that the loss of the principal is equal to sx(pn) −sx(p0), which is upper-bounded by
sx(1x) −sx(p0), where 1x is the report of x happening with a probability of 1. For example, with the logarithmic
scoring rule and initial report p0 = 1
2, we can calculate that b ln 2 is the upper-bound for loss by the principal.
A market scoring rule can be interpreted as trading Arrow-Debreu securities (securities that have a payout of 1
if outcome 1 happens and a payout of 0 if outcome 0 happens) on the result of the event. To do this, we interpret
the most recent reported probability pi as a fair price for one of these Arrow-Debreu security. This means that the
starting price is p0, and the price after agent i interacts with the market is their report pi. If agent i is risk-neutral and
the underlying scoring rule is strictly proper, then pi should be equal to their true belief πi. This is because the part of
their compensation that they can impact is just their score from the scoring rule, and a risk-neutral agent maximizes
their expected score by being truthful when a scoring rule is strictly proper.
Note that a MSR with risk-neutral agents is not particularly useful in aggregating information, since the market
price will jump to each agent’s individual belief immediately after that agent interacts with the market. In that way,
the market retains no "memory" of past interactions, and the market price at any time only reflects the beliefs of a
single agent.
We now define a well-behaved market scoring rule, which means that the underlying scoring rule has certain
desirable properties. These properties will very soon allow us to create an equivalence between opinion pools and
well-behaved market scoring rules with certain kinds of agents.
Definition 5.1 (Well-behaved MSR). [5] We call a market scoring rule well-behaved if the underlying scoring rule is
regular and strictly proper, and the associated expected reward function G(·) is continuous and thrice differentiable,
with 0 < G′′(p) < ∞and |G′′′(p)| < ∞, for 0 < p < 1.
5.2
MSR Behavior for Risk-Averse Agents
In addition to each agent i having a subjective belief πi = Pr(x = 1), they also will now have a continuous
utility function of wealth ui(c), as described in the earlier section on agent utility functions.
If an agent is risk-averse, then there are bounds for how they can change the market price; they will always
move the current market price pi somewhere between the previous price pi−1 and their own belief πi:
Lemma 5.2 (Price Bounds). [5] If |cmin
i
| < ∞, then there exist upper and lower bounds, pmin
i
∈[0, pi−1] and
pmax ∈[pi−1, 1], respectively, on the feasible values of the price pi to which agent i can drive the market, regardless
of their belief πi. These values are pmin
i
= s−1
1 (cmin
i
+ s1(pi−1)) and pmax
i
= s−1
0 (cmin
i
+ s0(pi−1)).

With all of this in mind, we observe that an agent who is utility-maximizing will report:
pi = arg max
p∈[0,1]
[πiui(c1(p, pi−1)) + (1 −πi)ui(c0(p, pi−1))] ,
(40)
since this maximizes their expected utility.
Example 5.3 (Risk-Neutral Agents). Consider a market scoring rule with the quadratic scoring rule as the under-
lying scoring rule. Let’s assume that we have 1 agent interacting with the market, with belief π1 = 0.6 and with
utility function of wealth u1(c) = c, i.e. the agent is risk-neutral. The initialization of the market by the principal is
p0 = 0.5.
If the agent reports p1, then they will receive expected utility of:
π1u1(c1(p1, p0)) + (1 −π1)u1(c1(p1, p0))
(41)
= (0.6)(squad
(p1) −squad
(0.5)) + (1 −0.6)(squad
0
(p1) −squad
0
(0.5))
(42)
= (0.6)(squad
(p1) −0.5) + (0.4)(squad
0
(p1) −0.5)
(43)
= (0.6)squad
(p1) + (0.4)squad
0
(p1) −0.5
(44)
= Ej∼π1[squad
j
] −0.5.
(45)
Since agent 1’s utility is just equal to their expected score from the quadratic scoring rule minus a constant, and the
quadratic scoring rule is strictly proper, then we know that agent 1 maximizes their utility by reporting their truthful
belief, which would be p1 = π1 = 0.6. As stated above, agent 1 moves the market price to their exact belief.
Example 5.4 (Risk-Averse Agents). Consider a market scoring rule with the quadratic scoring rule as the underlying
scoring rule. Let’s assume that we have 1 agent interacting with the market, with belief π1 = 0.6 and with utility
function of wealth u1(c) = ln(c + 1), which means that the agent is risk-averse. The initialization of the market by
the principal is p0 = 0.5.
If the agent reports p1, then they will receive expected utility of:
π1u1(c1(p1, p0)) + (1 −π1)u1(c1(p1, p0))
(46)
= (0.6) ln(squad
(p1) −squad
(0.5) + 1) + (1 −0.6) ln(squad
0
(p1) −squad
0
(0.5) + 1)
(47)
= (0.6) ln(squad
(p1) −0.5 + 1) + (0.4) ln(squad
0
(p1) −0.5 + 1)
(48)
= (0.6) ln((2p1 −(p2
1 + (1 −p2
1)) + 0.5) + (0.4) ln((2(1 −p1) −(p2
1 + (1 −p2
1)) + 0.5).
(49)
By taking the derivative of the above statement and setting it equal to 0, we can find that the optimal price p1 for
agent 1 to report is p1 = 0.55. So, in this setting, our agent moves the market price to about halfway between the
previous market price, 0.5, and their belief, 0.6.

The observation of agents maximizing their expected utility according to eq. (40) leads to the following theorem:
Theorem 5.5 (MSR With risk-averse agents yields an opinion pool). [5] If a well-behaved market scoring rule for an
Arrow-Debreu security with a starting instantaneous price p0 ∈(0, 1) trades with a sequence of n myopic agents with
subjective probabilities π1, . . . , πn ∈(0, 1) and risk-averse utility functions of wealth u1, . . . , un, then the updated
market price pi after every trading episode i ∈[n] is equivalent to a valid opinion pool for the market’s initial
baseline report p0 and the subjective probabilities π1, . . . , πi of all agents who have traded up to (and including) that
episode.
This gives us a bigger picture about how MSRs work. We already knew that MSRs, by design, elicit subjective
probabilities from risk-neutral agents in an incentive compatible manner. However, the above theorem also shows
that, in general, MSRs elicit an opinion pool of agents’ beliefs when they interact with risk-averse agents.
5.3
LMSR as LogOP for Constant Absolute Risk Aversion (CARA) Utility
We introduce a special case of choosing a scoring rule an utility functions that converge to a particularly nice
opinion pool, namely the logarithmic opinion pool.
Theorem 5.6. [5] If myopic agent i, having a subjective belief πi ∈(0, 1) and a risk-averse utility function ui, trades
with a logarithmic market scoring rule (LMSR) market with parameter b and current instantaneous price pi−1, then
the market’s updated price pi is identical to a logarithmic opinion pool between the current price and the agent’s
subjective belief, i.e.,
pi =
παi
i p1−αi
i−1
παi
i p1−αi
i−1 + (1 −πi)αi(1 −pi−1)1−αi ,
(50)
if and only if agent i’s utility function is of the form
ui(c) = τi(1 −e
−c
τi ),
c ∈R ∪{−∞, ∞},
constant τi ∈(0, ∞)
(51)
the aggregation weight being given by αi =
τi/b
1+τi/b.
Note that ui(c) = τi(1−e
−c
τi ) is the standard formulation of constant absolute risk aversion (CARA) utility with
risk tolerance τi.
5.4
LMSR as LinOP for an Atypical Utility with Decreasing Absolute Risk Aversion
We introduce another special case of choosing a scoring rule an utility functions that converge to another nice
opinion pool, this time the linear opinion pool.
Theorem 5.7. [5] If myopic agent i, having a subjective belief πi ∈(0, 1) and a risk-averse utility function ui, trades
with a logarithmic market scoring rule (LMSR) market with parameter b and current instantaneous price pi−1, then
the market’s updated price pi is identical to a linear opinion pool between the current price and the agent’s subjective
belief, i.e.,
pi = βiπi + (1 −βi)pi−1 ,
(52)
if and only if agent i’s utility function is of the form
ui(c) = ln(e(c+Bi)/b −1),
c ≥−Bi ,
(53)
where Bi > 0 represents agent i’s budget, and with the aggregation weight being given by βi = 1 −e−Bi/b.

Convex Duality
We now introduce some ideas of convex duality in order to eventually arrive at another equivalent mechanism
to a market scoring rule. We start by introducing the definition of a convex conjugate.
For any convex function f : Rn →[−∞, ∞], the convex conjugate f ∗of f is defined as:
f ∗(a) := sup
x∈Rn a · x −f(x).
(54)
Note that for continuous functions, the above supremum is equivalent to a maximum. The convex conjugate will
always be a convex function, since it is the epigraph (i.e. the set of points lying on or above) of an affine function.
Also, for any lower semicontinuous and proper function (such as all continuous functions) f, it is true that (f ∗)∗= f
([20]).
In particular, consider the convex conjugate of a continuous, strictly convex function G, which acts on a variable
p. This function has some convex conjugate G∗, and we also know that the convex conjugate of G∗is G itself. For
reasons that will become apparent in the next section, let’s call this convex conjugate G∗= C, which will act on a
variable we will call θ.
When we have this G and C that are convex conjugates to each other, it is true that G′(p) = θ if and only if
C′(θ) = p [20]. When this is the case, we say that p and θ are conjugate points.
Example 6.1. Consider the continuous, strictly convex function G(p) = p2 + (1 −p)2. Calculating its convex
conjugate G∗= C yields the function C(θ) = 1
8θ2 + 1
2θ −1
2.
Let’s look at the point on the graph of G where p = 0.6. We know that G′(0.6) = 0.4, so we would say that
p = 0.6 and θ = 0.4 are conjugate points.
To verify this, we calculate that C′(0.4) = 0.6.
So, we now know that there is a simple relationship between the derivative of G and the derivative of its convex
conjugate C. We now introduce a lemma describing how we can calculate C itself from G.
Lemma 6.2 (Convex Conjugate Relation). If G is a strictly convex function and C is its convex conjugate, p is an
input to G, and θ is an input to C, with p and θ being conjugate points, then C(θ) = G′(p) · p −G(p).
Proof. When p and θ are conjugate points, we know that G′(p) = θ and C′(θ) = p.
C(θ) = max
a∈R (θ · a −G(a))
(55)
p = C′(θ) = arg max
a∈R
(θ · a −G(a))
(56)
C(θ) = θ · p −G(p) = G′(p) · p −G(p).
(57)
Example 6.3. Consider the same setup as example 6.1, where G(p) = p2 + (1 −p)2, whose convex conjugate is
C(θ) = 1
8θ2 + 1
2θ −1
2.
We already know that p = 0.6 and θ = 0.4 are conjugate points. So, let’s try to graphically interpret the formula
C(θ) = G′(p) · p −G(p).

In the graph, G(p) is the red curve and C(θ) is the blue curve. We can rewrite the equation C(θ) = G′(p) · p −G(p)
as −C(θ) = G(p) + G′(p) · (−p). Graphically, this is saying that to find the orange height on the left, which is the
negative of C(θ), we start at the green point G(p) on the graph of G. We then travel along the purple line, which is
the tangent to G at the point p, for a distance of −p, which will take us to the y-axis. This will decrease our y-value
by the vertical purple amount, taking us to the point (0, 0.28) on the y-axis. This means that C(θ) = −0.28, which
we can verify by plugging θ = 0.4 into our cost formula directly.
Cost Model and Equivalence to MSR
Here, we introduce another type of prediction market, called a cost function based prediction market (or just
cost function, for short). Using the tools of convex duality developed in the previous section, we show how cost
functions are the convex duals of market scoring rules by equating their compensations. Finally, we run through
some examples of specific cost functions that are equivalent to common market scoring rules.
7.1
Introduction to Cost-Based MSRs
We now present a model that we will show is equivalent to a (belief-based) MSR. We call this a cost function,
and it is based on trading securities that have an payoff of 1 if outcome 1 happens and a payoff of 0 if outcome 0
happens. We start with a convex function C : R →R, and we say that if the total number of shares that have been
bought so far in a market is θ, then the price of buying the next share is C(θ + 1) −C(θ). Similarly, the price of
short-selling the next share is C(θ −1) −C(θ). If we were to decrease the number of shares we purchase to a value
of ϵ that is arbitrarily close to 0, then the cost of those ϵ shares would be C(θ + ϵ) −C(θ), which is a per-share cost
of C(θ+ϵ)−C(θ)
ϵ
. As we let this limit approach zero, the per-share cost of a security approaches dC/dθ, and therefore this

is the current instantaneous “market-price,” or fair probability that our Arrow-Debreu security, which in this case is
just a share, has an outcome of 1.
Like the MSR, at each step in our cost function, agent i will come into the market, which previously had a total
number of outstanding market shares θi−1, and they will purchase/sell θi −θi−1 shares, moving the current number
of market shares outstanding to θi.
Now, our equivalence comes from realizing that our expected reward function G and our function C are convex
conjugates. This is because pi and C′(θi) both represent the current price of a share in the market. This also means
that when C′(θi) = pi, we know that pi and θi are conjugate points.
By applying lemma 6.2, we can rewrite our scoring rule s as:
sj(p) = G(p) + g(p)(j −p)
(58)
= G(p) −g(p) · p + g(p) · j
(59)
= −C(θ) + θ · j .
(60)
So, we can equate our payouts between the two settings as:
sj(pi) −sj(pi−1) = −C(θi) + θi · j + C(θi−1) −θi−1 · j = (θi −θi−1)j −(C(θi) −C(θi−1)).
(61)
The left side is the compensation in the belief-based MSR setting, and the right side is the payout (how much you
change the shares times the event) minus how much you have to pay in the cost function setting, which is also the
compensation in the cost function setting.
This means that any agent that wants to maximize their payout in one setting also wants to maximize their
payout in the other setting, and any agent that wants to maximize an expected utility function of their payout in one
setting wants to maximize that same expected utility function of their payout in the other setting. In other words, a
utility-maximizing agent will act the same in both of these prediction markets, regardless of their utility function.
7.2
Common Cost Functions
For the LMSR with parameter b, the equivalent convex conjugate cost function is C(θ) = b ln(e
θ
b + 1). This
cost curve looks a lot like y = x for high share values and y = 0 for low share values, reflecting that a lot of shares
correspond to a price around 1 and a few shares correspond to a price around 0, and that the number of shares can
vary from negative infinity to positive infinity.
For the quadratic market scoring rule (QMSR), which is the MSR with underlying scoring rule equal to the
quadratic scoring rule, the equivalent cost function is C(θ) = 1
8θ2 + 1
2θ −1
2. For this cost function, since we know
that our price is always between 0 and 1, and our price is the derivative of this cost function, our cost function will
always have values of θ between −2 and 2.
Cost Function Equivalence to Pooling
By now we have shown that 1. every cost function is equivalent to some belief-based MSR, and 2. every tra-
ditional belief-based MSR with risk-averse agents is equivalent to some pooling method. Thus, we can chain these
equivalences together to show that a cost function with risk-averse agents is equivalent to some pooling method.

Theorem 8.1 (Cost Function with risk-averse agents yields an opinion pool (Implied Prices)). If a cost-based market
scoring rule C(θ), whose convex conjugate is a well-behaved regular MSR, for an Arrow-Debreu security with
starting shares θ0 trades with a sequence of n myopic agents with subjective probabilities π1, . . . , πn ∈(0, 1) and
risk-averse utility functions of wealth u1, . . . , un, then the updated implied market price pi =
dC(θi)
dθi
after every
trading episode i ∈[n] is equivalent to a valid opinion pool for the market’s initial baseline price dC(θ0)
dθ0
and the
subjective probabilities π1, . . . , πi of all agents who have traded up to (and including) that episode.
Example 8.2. Consider the cost-based MSR defined by scoring rule C(θ) = b ln(e
θ
b + 1) with agents using CARA
utility functions, which are of the form
ui(c) = τi(1 −e
−c
τi ),
c ∈R ∪{−∞, ∞},
constant τi ∈(0, ∞) .
Then by using theorem 5.6 as an intermediate step, we know that the instantaneous price dC(θi)
dθi
after bidder i partici-
pates in the market is identical to a logarithmic opinion pool between the original market price dC(θ0)
dθ0
and the beliefs
of agents 1 through i, with the aggregation weight at each step being given by αi =
τi/b
1+τi/b, for all i ∈[n].
8.1
Another Equivalence
Instead of thinking of the implied prices given a cost function as being an opinion pool of the experts’ beliefs,
we can turn this entire setting into a share-based market, where instead of experts having private beliefs about a
future event, they have beliefs about the number of shares that are fair for them. For example, if an agent is acting
in a cost function defined by the function C(θ) = ln(eθ + 1), instead of that agent having private information that is
π = 0.6, they could have private information of their "fair number of shares" being t = 0.41. These pieces of private
information are equivalent in this market, since 0.41 shares of contracts purchased is equivalent to an implied price
of C′(0.41) = 0.6. When an agent’s private information is of this form, we get another equivalence, namely that the
total number of shares in a cost-based MSR is equivalent to an “opinion pool” of the experts’ beliefs defined by their
fair shares. However, this new “opinion pool” is no longer bounded between 0 and 1, so we will give it a new name
to not confuse it with the traditional opinion pool, which outputs a value between 0 and 1.
Definition 8.3 (Unbounded Opinion Pool). An unbounded opinion pool is an opinion pool whose inputs and aggre-
gate are not necessarily in the range [0, 1], and are instead in the set R.
A nice property of an unbounded opinion pool is that if all of its inputs are bounded, then any unbounded opinion
pool on those inputs is just equivalent to a regular opinion pool on those inputs.
Lemma 8.4 (Unbounded-Bounded Opinion Pool Equivalence). Given n experts with beliefs πi and weights wi, if
each of the experts’ beliefs in an unbounded opinion pool are bounded, i.e. ∃πmin, πmax ∈R such that πmin ≤πi ≤
πmax for each expert i, then the unbounded opinion pool on beliefs π1, . . . , πn ∈R and weights w1, . . . , wn using
aggregation rule ˆp is equivalent to the bounded opinion pool on beliefs
π1−πmin
πmax−πmin, . . . ,
πn−πmin
πmax−πmin ∈[0, 1] and weights
w1, . . . , wn using aggregation rule p∗(π1, ..., πn) = ˆp ((πmax −πmin)π1 + πmin, ..., (πmax −πmin)πn + πmin).

Proof.
p∗
 π1 −πmin
πmax −πmin
, ..., πn −πmin
πmax −πmin

(62)
= ˆp

(πmax −πmin)
 π1 −πmin
πmax −πmin

+ πmin, ..., (πmax −πmin)
 πn −πmin
πmax −πmin

+ πmin

(63)
= ˆp (π1 −πmin + πmin, ..., πn −πmin + πmin)
(64)
= ˆp (π1, ..., πn) .
(65)
In a similar way to how the implied prices in a cost function with risk-averse agents is equivalent to an opinion
pool on agents’ beliefs, we can also show that the market number of shares in a cost function with risk-averse agents
is equivalent to an opinion pool on agents’ fair quantity of shares.
Theorem 8.5 (Cost Function with risk-averse agents yields an opinion pool (Shares)). If a well-behaved cost function
C(θ) for an Arrow-Debreu security with starting shares θ0 trades with a sequence of n myopic agents with subjective
fair shares t1, . . . , tn ∈R and risk-averse utility functions of wealth u1, . . . , un, then the updated market shares θi
after every trading episode i ∈1, . . . , n is equivalent to a valid unbounded opinion pool for the market’s initial
baseline number of shares θ0 and the subjective fair shares t1, . . . , ti of all agents who have traded up to (and
including) that episode.
Proof. First, we will prove that the updated market shares θi after expert i comes is an opinion pool between the
previous market shares θi−1 and the current expert’s subjective fair shares ti. Then, we will invoke lemma 4.2 to
conclude that θi is really an opinion pool of the initial baseline number of shares θ0 and the subjective fair shares of
all experts from 1 to i.
First, note that expected-utility maximizing agent i will report θ that maximizes:
πiui(c1(θ, θi−1)) + (1 −πi)ui(c0(θ, θi−1)).
(66)
Plugging in πi = C′(ti) and cx(θi, θi−1) = (θi −θi−1)x −(C(θi) −C(θi−1) gives us that i: will maximize:
C′(ti)ui(θi −θi−1 −(C(θi) −C(θi−1)) + (1 −C′(ti))ui(−(C(θi) −C(θi−1))).
(67)
Differentiating and setting this equal to 0 gives us:
C′(ti)u′
i(θi −θi−1 −(C(θi) −C(θi−1))(1 −C′(θi)) + (1 −C′(ti))u′
i(−(C(θi) −C(θi−1)))(−C′(θi)) = 0.
(68)
C′(ti)u′
i(θi −θi−1 −(C(θi) −C(θi−1)) −C′(ti)u′
i(θi −θi−1 −(C(θi) −C(θi−1))C′(θi)
(69)
+u′
i(−(C(θi) −C(θi−1)))(−C′(θi)) −C′(ti)u′
i(−(C(θi) −C(θi−1)))(−C′(θi)) = 0.
C′(θi)(C′(ti)u′
i(θi −θi−1 −(C(θi) −C(θi−1)) + (1 −C′(ti))u′
i(−(C(θi) −C(θi−1))))
(70)

= C′(ti)u′
i(θi −θi−1 −(C(θi) −C(θi−1))
C′(θi) =
C′(ti)u′
i(θi −θi−1 −(C(θi) −C(θi−1))
C′(ti)u′
i(θi −θi−1 −(C(θi) −C(θi−1)) + (1 −C′(ti))u′
i(−(C(θi) −C(θi−1)))
(71)
C′(θi) =
C′(ti)u′
i(c1(θi, θi−1))
C′(ti)u′
i(c1(θi, θi−1)) + (1 −C′(ti))u′
i(c0(θi, θi−1)))
(72)
θi = (C′)−1

C′(ti)u′
i(c1(θi, θi−1))
C′(ti)u′
i(c1(θi, θi−1)) + (1 −C′(ti))u′
i(c0(θi, θi−1)))

(73)
Let’s plug in the equivalent market scoring rule to this cost-function based prediction market, using C′(θi) =
pi, C′(ti) = πi, C′(θi−1) = pi−1, and cx(θi, θi−1) = cx(pi, pi−1):
pi =
πiu′
i(c1(pi, pi−1))
πiu′
i(c1(pi, pi−1)) + (1 −πi)u′
i(c0(pi, pi−1)).
(74)
However, we already know for market scoring rules, pi is an opinion pool of pi−1 and πi. So, this means that we
know the following three things:
• (Unanimity) If pi−1 = πi, then pi = pi−1.
• (Boundedness) min{pi−1, πi} ≤pi ≤max{pi−1, πi}.
• (Monotonicity) pi increases monotonically as pi−1 increases and πi is held constant, and pi also increases
monotonically as pi−1 is held constant and πi increases.
Knowing this, let’s show that these three axioms also hold for our cost function.
(Unanimity) If θi−1 = ti, then it must be true that C′(θi−1) = ti. In the price space, this means that pi−1 = πi,
which by our unaminity axiom in the price space, tells us that pi = pi−1. However, this means that C′(θi) = C′(θi−1).
And, since C is strictly convex, we know that C′ is strictly monotone, which means that θi = θi−1.
(Boundedness) In the price space, we know by our boundedness axiom that that min{pi−1, πi} ≤pi ≤max{pi−1, πi}.
Converting these to our shares space equivalents gives us min{C′(θi−1), C′(ti)} ≤C′(θi) ≤max{C′(θi−1), C′(ti)}.
Again, we can use the fact that C′ is monotone to conclude that min{θi−1, ti} ≤θi ≤max{θi−1, ti}.
(Monotonicity) What happens to θi as θi−1 increases and ti stays the same? Since C′ is monotone, this means
that C′(θi−1) increases and C′(ti) stays the same, which in the price space means that pi−1 increases and πi stays the
same. However, by our monotonicity axiom in the price space, this means that pi increases. Back in the share space,
this implies that C′(πi) increases, and since C′ is monotone, this means that πi increases. This same exact argument
can be used to show that as θi−1 stays the same and ti increases, θi increases, just by switching θi−1 and ti.
Finally, we invoke lemma 4.2 to determine that θi is an opinion pool of θ0 and ti for i ∈[n].

QA Pool Result
Observing the formula that defines a QA pool and thinking of that formula in cost space, we can get a nice
equivalence that shows how, assuming risk-averse agents, a large class of regular MSRs are equivalent to a linear
opinion pool when viewed as a cost-based MSR acting on agents’ fair number of shares. This large class is the class
of quasi-arithmetic opinion pools; thus, this is another characterization of QA opinion pools.
Theorem 9.1. [QA Pools Are Linear Pools In Share Space] If a well-behaved market scoring rule for an Arrow-
Debreu security with a starting instantaneous price p0 ∈(0, 1) trades with a sequence of n myopic agents with
subjective probabilities π1, . . . , πn ∈(0, 1) and risk-averse utility functions of wealth u1, . . . , un, then the resulting
opinion pool for the updated market price pn in terms of the market’s initial baseline report p0 and subjective
probabilities π1, . . . , πn ends up being a QA pool whose underlying scoring rule has expected reward function G that
has weights w0, w1, . . . , wn if and only if the equivalent cost-based MSR with the same agents and corresponding
cost function C(θ) is equivalent to a linear opinion pool on the market’s initial number of shares θ0 = G′(p0) and
the agents’ fair number of shares t1 = G′(π1), . . . , tn = G′(πn) with weights w0, w1, . . . , wn.
Proof. Sufficiency: We know that a QA pool with underlying expected reward function G satisfies (1). Plugging in
g = G′, p∗= pn, and input probabilities p0, π1, . . . , πn gives us:
G′(pn) = w0G′(p0) +
n
X
i=1
wiG′(πi).
(75)
Plugging in G′(p0) = θ0 and G′(πi) = ti for 1 ≤i ≤n, we get:
θn = w0θ0 +
n
X
i=1
witn.
(76)
However, this is exactly the linear opinion pool with weights w0, w1, . . . , wn and inputs θ0, t1, . . . , tn.
Necessity: If the cost-based MSR is a linear pool, then we know:
θn = w0θ0 +
n
X
i=1
witn.
(77)
Now, since using convex duality, G′(p0) = θ0 and G′(πi) = ti for i ∈[n], we can plug this in to get:
G′(pn) = w0G′(p0) +
n
X
i=1
wiG′(πi).
(78)
However, this is exactly the definition of a QA pool with an underlying scoring rule whose expected reward function
is G.
We can use the above theorem to show that both of the examples that we have presented thus far, one that
aggregates beliefs into a logarithmic pool and one that aggregates beliefs into a linear pool, both aggregate fair shares
into the linear pool.
Corollary 9.2. If myopic agent i, having a subjective belief πi ∈(0, 1) and a CARA utility function ui as described
in theorem 5.6, trades with the cost function corresponding to the LMSR market, which is defined by
C(θ) = b ln(eθ/b + 1) with parameter b and initial number of shares θ0, then the resulting number of shares θn is
equivalent to a linear opinion pool on θ0, t1 = G′
log(π1), . . . , tn = G′
log(πn) with weights w0 = Qn
i=1(1 −αi) and
wi = αi
Qn
j=i+1(1 −αi)

, with the intermediate aggregation weights being given by αi =
τi/b
1+τi/b.

Proof. By theorem 5.6, we know that this setup in the price space yields the logarithmic opinion pool, which is the
QA pool using the log scoring rule. In that theorem, each market price is a logarithmic opinion pool of the previous
price and the current agent’s belief, so we can apply lemma 4.5 to conclude that each market price is a logarithmic
opinion pool of the original market price and all of the agents’ beliefs, with the given weights per the theorem. Then,
we can apply theorem 9.1 to conclude that in the share space, the resulting opinion pool is the linear opinion pool
with those same weights.
Corollary 9.3. If myopic agent i, having a subjective belief πi ∈(0, 1) and a CARA risk-averse utility function ui
defined by:
ui(c) = ln(e(c+Bi)/b −1),
c ≥−Bi,
constant Bi > 0
(79)
trades with the cost-based market scoring rule corresponding to the LMSR market, which is defined by
C(θ) = b ln(eθ/b + 1) with parameter b and initial number of shares θ0, then the resulting number of shares θn is
equivalent to a linear opinion pool on θ0, t1 = G′
log(π1), . . . , tn = G′
log(πn) with weights w0 = Qn
i=1(1 −βi) and
wi = βi
Qn
j=i+1(1 −βi)

, with the intermediate aggregation weights being given by βi = 1 −e−Bi/b.
Proof. By theorem 5.7, we know that this setup in the price space yields the linear opinion pool, which is the QA
pool using the quadratic scoring rule. In that theorem, each market price is a linear opinion pool of the previous price
and the current agent’s belief, so we can apply lemma 4.5 to conclude that each market price is a linear opinion pool
of the original market price and all of the agents’ beliefs, with the given weights per the theorem. Then, we can apply
theorem 9.1 to conclude that in the share space, the resulting opinion pool is the linear opinion pool with those same
weights.
Discussion and Future Work
We have detailed how a popular type of prediction market, the cost function, aggregates both risk averse agents’
implied beliefs and their fair quantities of shares in the same way that an opinion pool does. We have also shown that
those cost functions that aggregate risk averse agents’ fair shares according to the linear opinion pool are the same
cost functions that aggregate those agents’ implied beliefs according to any QA pool, giving another definition for
the QA pool.
A next step would be identifying the conditions under which a cost function acting on risk-averse agents is
equivalent to any given opinion pool for both their implied prices and their fair number of shares. Also, now that we
know that a cost function on risk averse agents that converges to the linear pool for shares converges to a QA pool
for implied prices, and vice versa, one could investigate what sort of opinion pools for implied prices correspond
with other popular opinion pools for shares. For example, if a cost function pools shares according to the logarithmic
opinion pool, how does it pool implied prices?

Acknowledgements
First and foremost, I want to give a massive thank you to my research and thesis advisor, Professor Amy
Greenwald, who has been a huge positive influence during my time at Brown. Not only was she the person who
originally convinced me to participate in research at Brown, but she has been so supportive of me every step of the
way and has dedicated countless hours to mentoring me in research and more. I couldn’t have done any of this
without her.
I also want to thank Professor Greenwald’s PhD student Denizalp Goktas, who has served as my mentor through-
out this research project and others. Deni has taught me so much in the fields of algorithmic game theory and
mechanism design, and he has given me invaluable aid through this whole journey.
I want to thank Professor Jack Fanning for helping to get me even more interested in game theory as my
professor.
Finally, I want to thank all of my friends and family for supporting me throughout this process and always being
there for me.

References
[1]
Jacob Abernathy, Yiling Chen, and Jennifer W. Vaughan. “Efficient Market Making via Convex Optimization,
and a Connection to Online Learning”. In: ACM TEAC (2012).
[2]
J Aczel. “On Mean Values”. In: Bull. Amer. Math. Soc. (1948).
[3]
Alina Beygelzimer, John Langford, and David M. Pennock. “Learning performance of prediction markets with
Kelly bettors”. In: Proc. AAMAS (2012).
[4]
Glenn W. Brier. “Verification of forecasts expressed in terms of probability”. In: Monthly Weather Review
(1950).
[5]
Mithun Chakraborty and Sanmay Das. “Market Scoring Rules Act As Opinion Pools For Risk-Averse Agents”.
In: Advances in Neural Information Processing Systems 28 (2015).
[6]
Yiling Chen and David M. Pennock. “A utility framework for bounded-loss market makers”. In: Proceedings
of the 23rd Conference on Uncertainty in Artificial Intelligence (2007).
[7]
Franz Dietrich and Christian List. “Probabilistic Opinion Pooling”. In: Oxford Handbook of Philosophy and
Probability (2014).
[8]
Ashutosh Garg et al. “Generalized Opinion Pooling”. In: Proc. 8th Intl. Symp. on Artificial Intelligence and
Mathematics (2004), pp. 79–86.
[9]
Christian Genest and James V. Zidek. “Combining Probability Distributions: A Critique and an Annotated
Bibliography”. In: Statistical Science (1986).
[10]
Tilmann Gneiting and Adrian E. Reftery. “Strictly Proper Scoring Rules, Prediction, and Estimation”. In:
Journal of the American Statistical Association (2007).
[11]
I. J. Good. “Rational Decisions”. In: Journal of the Royal Statistical Society. Series B (Methodological) (1952).
[12]
Robin D. Hanson. “Combinatorial information market design”. In: Information Systems Frontiers (2003).
[13]
Jinli Hu and Amos J. Storkey. “Multi-period trading prediction markets with connections to machine learning”.
In: Proc. ICML (2014).
[14]
A. N. Kolmogorov. “Sur la notion de la moyenne”. In: (1930).
[15]
Bettina Kuon. “Typical Trading Behavior in the German Election Markets 1990”. In: (1991).
[16]
Jono Millin, Krzysztof Geras, and Amos J. Storkey. “Isoelastic agents and wealth updates in machine learning
markets”. In: Proc. ICML (2012).
[17]
Mitio Nagumo. “Uber eine Klasse der Mittelwerte”. In: Japanese journal of mathematics: transactions and
abstracts (1930).
[18]
Eric Neyman and Tim Roughgarden. “From Proper Scoring Rules to Max-Min Optimal Forecast Aggrega-
tion”. In: Proceedings of the 22nd ACM Conference on Economics and Computation (2021).
[19]
Tyrrell R. Rockafellar. “Convex analysis”. In: Princeton Univ Press (1970).
[20]
Tyrrell R. Rockafellar and Roger J-B Wets. “Variational Analysis”. In: Springer, Berlin, Heidelberg, 1997,
pp. 474–480. ISBN: 978-3-642-02431-3.

[21]
Leonard J. Savage. “Elicitation of Personal Probabilities and Expectations”. In: Journal of the American Sta-
tistical Association (1971).
[22]
Amos J. Storkey, Zhanxing Zhu, and Jinli Hu. “Aggregation under bias: Renyi divergence aggregation and its
implementation via machine learning markets”. In: Machine Learning and Knowledge Discovery in Databases
(2015).
[23]
Justin Wolfers and Eric Zitzewitz. “Prediction Markets”. In: J. Econ. Perspectives (2004).