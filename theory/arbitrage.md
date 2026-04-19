Removing Arbitrage from Wagering Mechanisms
YILING CHEN, Harvard University
NIKHIL R. DEVANUR, Microsoft Research
DAVID M. PENNOCK, Microsoft Research
JENNIFER WORTMAN VAUGHAN, Microsoft Research
We observe that Lambert et al.’s [2008] family of weighted score wagering mechanisms admit arbitrage:
participants can extract a guaranteed positive payoﬀ by betting on any prediction within a certain range.
In essence, participants leave free money on the table when they “agree to disagree,” and as a result,
rewards don’t necessarily go to the most informed and accurate participants. This observation suggests
that when participants have immutable beliefs, it may be possible to design alternative mechanisms in
which the center can make a proﬁt by removing this arbitrage opportunity without sacriﬁcing incentive
properties such as individual rationality, incentive compatibility, and sybilproofness. We introduce a new
family of wagering mechanisms called no-arbitrage wagering mechanisms that retain many of the positive
properties of weighted score wagering mechanisms, but with the arbitrage opportunity removed. We show
several structural results about the class of mechanisms that satisfy no-arbitrage in conjunction with other
properties, and provide examples of no-arbitrage wagering mechanisms with interesting properties.
Categories and Subject Descriptors: J.4 [Social and Behavioral Sciences ]: Economics
Additional Key Words and Phrases: Wagering mechanisms; immutable beliefs; no arbitrage; scoring rules
1. INTRODUCTION
Betting markets of various forms, including stock exchanges [Grossman 1976], futures
and options markets [Roll 1984], sports betting markets [Gandar et al. 1999], race-
track pari-mutuel systems [Thaler and Ziemba 1988; Plott et al. 1997], and modern
prediction markets [Forsythe and Lundholm 1990; Forsythe et al. 1991; Berg et al.
2001; Wolfers and Zitzewitz 2004], have demonstrated their ability to incentivize par-
ticipants to reveal their information about underlying events. Market prices have a
history of equaling or beating other forecasts of events in domains from politics to
product launches.
However, betting markets can induce complicated strategic play and obfuscate
individual-level information. While the dynamics of betting markets may facilitate in-
formation aggregation [Ostrovsky 2012], it has been shown, both theoretically [Allen
and Gale 1992; Kumar and Seppi 1992; Chakraborty and Yilmaz 2004; Chen et al.
2010; Gao et al. 2013] and empirically [Hansen et al. 2001], that market participants
may misrepresent their private information to mislead other participants and proﬁt
Authors’ addresses: Y. Chen, Harvard School of Engineering and Applied Sciences, 33 Oxford Street, Cam-
bridge, MA, 02138; N. R. Devanur, 1 Microsoft Way, Redmond WA 98052; D. M. Pennock and J. W. Vaughan,
Microsoft Research, New York City, 641 Avenue of the Americas, 7th Floor, New York, NY 10011.
This work was partially supported by the NSF under grant CCF-0953516. Any opinions, ﬁndings, conclu-
sions, or recommendations expressed here are those of the authors alone.
Part of this work was done while Y. Chen was a Visiting Researcher at Microsoft Research, New York City.
Permission to make digital or hard copies of all or part of this work for personal or classroom use is granted
without fee provided that copies are not made or distributed for proﬁt or commercial advantage and that
copies bear this notice and the full citation on the ﬁrst page. Copyrights for components of this work owned
by others than ACM must be honored. Abstracting with credit is permitted. To copy otherwise, or repub-
lish, to post on servers or to redistribute to lists, requires prior speciﬁc permission and/or a fee. Request
permissions from permissions@acm.org.
EC’14, June 8–12, 2014, Stanford, CA, USA. ACM 978-1-4503-2565-3/14/06 ...$15.00.
Copyright is held by the owner/author(s). Publication rights licensed to ACM.
http://dx.doi.org/10.1145/2600057.2602876
later. If the price is too high, some traders will opt out, revealing nothing. Others may
not reveal their full information due to budget constraints.
In many settings, a one-shot interaction is preferable to a continuous market. Par-
ticipants have a simple, truthful dominant strategy and the center does not need to
wait for equilibrium. The center obtains all participants’ private beliefs and can then
post-process the beliefs in one or more ways. For example, the average or weighted av-
erage of private beliefs can provide a robust prediction, with accuracy improving in the
number and diversity of individual beliefs [Jacobs 1995; Surowiecki 2004; Chen et al.
2005; Dani et al. 2006; Page 2007; Ungar et al. 2012]. Researchers have developed
one-shot betting mechanisms with various theoretical properties [Kilgour and Ger-
chak 2004; Johnstone 2007; Lambert et al. 2008, 2014]. In particular, Lambert et al.
[2008] proposed a class of weighted score wagering mechanisms (WSWMs), where each
participant makes a prediction about an uncertain event and wagers some amount of
money. The total amount wagered is redistributed among the participants after the
event outcome is revealed. These mechanisms satisfy a set of desirable properties, in-
cluding (1) budget balance: the sum of participants’ payoffs is zero and the center does
not need to subsidize the betting; (2) individual rationality: each participant prefers
participating to not participating; (3) incentive compatibility: each participant maxi-
mizes his expected payoff by predicting his true belief, and (4) sybilproofness: no par-
ticipant can beneﬁt from splitting his wager and participating under multiple identi-
ties. Conversely, Lambert et al. [2008] showed that any one-shot wagering mechanism
satisfying this set of properties must be a WSWM.
Kilgour and Gerchak [2004], Johnstone [2007], and Lambert et al. [2008, 2014]
designed their mechanisms for participants with immutable beliefs. While Bayesian
agents sharing a common prior can never “agree to disagree”, immutable agents per-
sist in their disagreement, never wavering from their prior beliefs even upon observing
other players’ actions. Both extremes are abstractions, but the latter matches reality
more closely—disagreement is rampant on trading and wagering platforms of all types.
The immutable beliefs model does not suffer from the perverse conclusions of the no-
trade theorem [Milgrom and Stokey 1982] that rational risk-neutral participants won’t
engage in any zero-sum wager. As a concrete example of a scenario in which the as-
sumption of immutable beliefs is reasonable, consider an online ad exchange that en-
gages companies like BlueKai, who possess a large amount of behavioral data, to bet on
an arriving user’s conversion rate for each of several competing ads. In order to inform
ad placement, betting must happen in milliseconds and companies will use machine
learning algorithms to form their predictions. In this setting, one-shot mechanisms
seem all but necessary—a continuous market would be too slow for the exchange and
too complex for strategic automated traders.
In this paper, we continue focusing on one-shot betting mechanisms for participants
with immutable beliefs. We show that, in the WSWMs, participants leave free money
on the table whenever they disagree. In other words, there exist arbitrage opportuni-
ties in the WSWMs — a participant can obtain a guaranteed positive payoff by betting
on any prediction within certain range. This observation suggests that when partici-
pants have immutable beliefs, the center may be able to design mechanisms to make a
proﬁt by exploiting the arbitrage opportunities without sacriﬁcing incentive properties
such as individual rationality, incentive compatibility, and sybilproofness. This paper
designs and analyzes such arbitrage-free wagering mechanisms.
Our main contributions are the following:
(1) We characterize the arbitrage opportunities in the WSWMs and deﬁne the arbi-
trage interval (Theorem 3.3).
(2) We show that this arbitrage property is not unique to the WSWMs and provide a
sufﬁcient condition for it to exist (Theorem 3.4).
(3) We propose a new class of mechanisms called no-arbitrage wagering mechanisms
(NAWMs) (Deﬁnition 4.2) that are arbitrage-free, individually rational, incentive
compatible, and anonymous, and give sufﬁcient conditions for these mechanisms to
be weakly budget balanced (i.e., the center always breaks even or proﬁts, Theorem
4.4) and neutral (i.e., it is invariant to relabeling outcomes, Theorem 4.6).
(4) For a subclass of NAWMs with payoff functions of a particular functional form
(Deﬁnition 5.1), we characterize the necessary and sufﬁcient conditions for these
mechanisms to be weakly budget balanced and neutral (Theorem 5.3), and prove
that these mechanisms are sybilproof (Theorem 5.8).
(5) We provide speciﬁc examples of such mechanisms with certain interesting prop-
erties. For instance, we give a mechanism that makes the same proﬁt for all out-
comes, which can be interpreted as spreading the proﬁt equally over all outcomes
or maximizing the minimum proﬁt. We give another mechanism that has the prop-
erty that if everyone predicts that outcome 0 is more likely than outcome 1, and
outcome 0 occurs, then the mechanism is exactly budget balanced (Theorem 5.6).
In some sense, the center doesn’t make a proﬁt when all agents “correctly” predict
the outcome.
Due to lack of space, some proofs are omitted. They appear in the full version of the
paper available on the authors’ websites.
1.1. Other Related Work
Proper scoring rules have been widely studied for one-shot information elicitation from
individuals [Brier 1950; Good 1952; Winkler 1969; Savage 1971; Matheson and Win-
kler 1976; Gneiting and Raftery 2007]. Using a proper scoring rule, the center inter-
acts with each individual independently and in general needs to pay the individu-
als for their predictions. Proper scoring rules are the building blocks for the budget-
balanced mechanisms of Kilgour and Gerchak [2004], Johnstone [2007], and Lambert
et al. [2008, 2014], as well as for our no-arbitrage wagering mechanisms in this paper.
We discuss some basics of proper scoring rules in Section 2.3.
In addition to the WSWMs, thecompetitive scoring rules [Kilgour and Gerchak 2004]
and the parimutuel Kelly probability scoring rule [Johnstone 2007] are also one-shot
budget-balanced betting mechanisms. The competitive scoring rules are incentive com-
patible but require that all participants wager the same amount of money. While the
parimutuel Kelly probability scoring rule can account for different wagers, it loses in-
centive compatibility.
In spirit, our observation that there are arbitrage opportunities in the WSWMs is
analogous to the results of Chun and Shachter [2011]. They showed that when a group
of agents is facing a proper scoring rule or participating in a WSWM, they can make
an identical prediction and as a coalition obtain a total payoff that is higher than the
total payoff they can obtain when each is predicting according to their true beliefs.
Their results have the same intuition as ours that participants with immutable beliefs
leave free money on the table. In this work, we provide a precise characterization of
the arbitrage opportunities in the WSWMs and propose new mechanisms to eliminate
the arbitrage and make a proﬁt.
2. PRELIMINARIES
In this section, we introduce preliminaries that are essential for our later analysis.
Section 2.1 describes the model that was introduced by Lambert et al. [2008] that this
paper adopts. In Section 2.2, we deﬁne a set of desirable properties for wagering mech-
anisms. In Section 2.3, we discuss basics of proper scoring rules that are necessary for
understanding prior results and our results on wagering mechanisms, and describe the
WSWMs. Finally, in Section 2.4, we introduce an (f,µ)-norm function which is used
throughout the paper.
2.1. Wagering Mechanisms
A center is interested in eliciting information on a given random variable X taking
value in{0, 1}. For example, the random variable could represent the outcome of the
Super Bowl or whether a user will click on an ad if shown. We focus on binary random
variables for this paper because they are common for betting mechanisms and they
simplify the analysis, allowing for better insights and intuitions. However, many of
our results naturally generalize to any ﬁnite discrete random variable.
Consider any ﬁnite set of agents, denoted N ={1, 2,...,n }. Each agent i forms a
subjective belief pi about the realization of X, where pi is the probability that agent i
assigns toX = 1 and hence 1−pi is his belief onX = 0. We use p to denote the beliefs
of all agents and p−i the beliefs of all agents except agent i. We make no assumption
about how agents form their beliefs, and only assume that their beliefs are immutable.
The center uses a wagering mechanism to elicit the private beliefs of agents. In a
wagering mechanism, each agent makes a prediction ˆpi∈ [0, 1] and wagers some non-
negative amount of money wi ∈ R+, where R+ is the set of non-negative reals. We
use ˆp and w to represent the predictions and wagers of all agents and ˆp−i and w−i to
represent the predictions and wagers of all agents except agent i. After the outcome
of the random experiment, x∈{ 0, 1}, is revealed, the mechanism determines the net
payoff of each agent, Πi(ˆp, w,x ) ∈ R, with Πi(ˆp, w,x ) = 0 whenever wi = 0 .1 We
emphasize that in this paper we will always talk about the net payoff of an agent,
that is, the payment received by the agent minus his wager, although all wagering
mechanisms can be equivalently deﬁned by describing just the payments that agents
receive. It is natural to require that an agent cannot lose more than his wager, that is,
Πi(ˆp, w,x )≥−wi for all ˆp∈ [0, 1]n, w∈ Rn
+, andx∈{ 0, 1}.
The wagers of agents are decided up-front before they participate in the mecha-
nism. For example, an agent may allocate a budget, which depends on his conﬁdence
about his information, for wagering on the random experiment. We further assume
that agents are risk neutral and maximize the expected net payoff with respect to
their belief. Risk neutrality is often observed when the wager of an agent is relatively
small with respect to his wealth [Ali 1977].
2.2. Properties of Wagering Mechanisms
Designers of wagering mechanisms often want their mechanisms to satisfy some desir-
able properties. We introduce and deﬁne the set of properties that we consider in this
paper below. The ﬁrst six properties are satisﬁed by all WSWMs [Lambert et al. 2008],
which we review in the next subsection; some, but not all, also obey neutrality. We use
X∼ p to represent that the random variable X follows a distribution P (X = 1) = p
and P(X = 0) = 1−p.
(a ) Anonymity: The identities of agents do not affect their net payoff in the mecha-
nism. Formally, for any permutationσ ofN ,
Πi(p1,...,p n,w 1,...,w n,x ) = Πσ−1(i)(pσ(1),...,p σ(n),wσ(1),...,w σ(n),x ),
∀i∈N , p∈ [0, 1]n, w∈ Rn
+, andx∈{ 0, 1}.
1Strictly speaking, the net payoffΠi also depends on the total number of agents who participate,n. We omit
this dependency in our notation as it is clear in the context.
(b ) Budget balance : The mechanism does not make or lose money. That is, ∀ p ∈
[0, 1]n, w∈ Rn
+, andx∈{ 0, 1},
∑
i∈N
Πi(p, w,x ) = 0.
(b’) Weak budget balance : The mechanism does not lose money but can (optionally)
make a proﬁt. That is,∀ p∈ [0, 1]n, w∈ Rn
+, andx∈{ 0, 1},
∑
i∈N
Πi(p, w,x )≤ 0.
(c ) Individual rationality: Every agent prefers participating in the mechanism to not
participating. Formally,∀i∈N ,pi∈ [0, 1], andwi∈ R+, there exists some ˆpi∈ [0, 1]
such that for all ˆp−i∈ [0, 1]n−1, and w−i∈ Rn−1
+ ,
EX∼pi[Πi(ˆpi, ˆp−i),wi, w−i,X )]≥ 0.
(d ) Incentive compatibility: Every agent strictly maximizes his expected net payoff
by predicting his true belief. Formally,∀i∈N ,pi∈ [0, 1], ˆpi∈ [0, 1], ˆp−i∈ [0, 1]n−1,
and w∈ Rn
+,
EX∼pi[Πi(pi, ˆp−i, w,X )]≥EX∼pi[Πi(ˆpi, ˆp−i, w,X )],
and the inequality is strict whenpi̸= ˆpi.
(e ) Normality:2 If from agenti’s perspective the prediction of another agentj improves,
then agenti’s expected net payoff decreases. Formally,∀i̸=j andi,j ∈N ,pi∈ [0, 1],
ˆp ∈ [0, 1]n, and w ∈ Rn
+, deﬁne another prediction vector ˆp′ where ˆp′
j = pi and
ˆp′
k = ˆpk for allk∈N andk̸=j. Then,
EX∼pi[Πi(ˆp, w,X )]≥EX∼pi[Πi(ˆp′, w,X )].
The inequality is strict when ˆpj̸=pi.
(f ) Sybilproofness:3 It is not beneﬁcial for any agent to create fake identities and
participate in the mechanism under these identities. Formally,∀i∈N , integerk >
1,pi∈ [0, 1], ˆp−i∈ [0, 1]n−1,wi∈ R+ and w−i∈ Rn−1
+ , if agent i participates under
k identities andpij andwij are thej-th identity’s prediction and wager respectively,
where ∑k
j=1wij =wi andpij∈ [0, 1],∀j, 1≤j≤k, there exists a ˆpi∈ [0, 1] such that
EX∼pi[Πi(ˆpi, ˆp−i,wi, w−i,X )]≥
k∑
j=1
EX∼pi[Πij(pi1,...,p ik, ˆp−i,wi1,...,w ik, w−i,X )].
(g ) Neutrality: The net payoff of any agent is invariant under relabeling of the out-
comes. Formally,∀i∈N , p∈ [0, 1]n, w∈ Rn
+ andx∈{ 0, 1},
Πi(p, w,x ) = Πi(1− p, w, 1−x),
where 1− p is a vector with elements 1−pi, i∈N .
2Lambert et al. [2008] deﬁne an alternative notion of normality: if an agent’s expected net payoff increases
according to a belief p, the expected net payoff of each other player according to this belief decreases. The
property we deﬁne here is used in Lambert et al. [2014].
3This deﬁnition is weaker than the deﬁnition given in Lambert et al. [2008] which requires that an agent
receives exactly the same payoff if he splits or merges a bet.
2.3. Proper Scoring Rules and Weighted Score Wagering Mechanisms
Existing wagering mechanisms [Kilgour and Gerchak 2004; Johnstone 2007; Lambert
et al. 2008, 2014] use proper scoring rules as building blocks. Before introducing the
WSWMs, we ﬁrst deﬁne proper scoring rules and discuss their properties.
2.3.1. Proper Scoring Rules. Scoring rules are developed to reward individuals for their
predictions on a random variable. They are deﬁned for any discrete or continuous ran-
dom variable. But for consistency with our settings, we introduce them for binary ran-
dom variables. A scoring rule s(p,x ) maps a prediction and an outcome to a value in
R∪{−∞} . Here p represents an individual’s prediction on the probability of outcome
1. For notational convenience, we usesx(p) to denotes(p,x ). In order to avoid an indi-
vidual’s expected score going to−∞, a regularity condition is often required. A scoring
rule is regular if it takes value −∞ only if the prediction for the corresponding out-
come is 0. For binary outcomes, this means that it is only possible fors1(0) ands0(1) to
have value−∞. A strictly proper scoring rule, as deﬁned below, strictly incentivizes a
risk-neutral individual to predict according to his true belief.
Deﬁnition 2.1. A regular scoring rule s is strictly proper if and only if for all p,q ∈
[0, 1] andp̸=q,EX∼p[sX(p)]>E X∼p[sX(q)].
A widely used strictly proper scoring rule is the Brier scoring rule [Brier 1950]:
sB
x (p) = 1− (p−x)2, (1)
forx∈{ 0, 1}.
Strictly proper scoring rules are closely related to strictly convex functions. In fact,
Savage [1971] and Gneiting and Raftery [2007] characterized all scoring rules in terms
of subdifferentials of convex functions. The version for binary random variables is
stated below.
THEOREM 2.2. (Savage [1971] and Gneiting and Raftery [2007]) Every strictly
proper scoring rules can be represented as
sx(p) =G(p) + (x−p)G′(p), ∀x∈{ 0, 1}
for some strictly convex function G, where G′(p) is a subgradient of G at p. Moreover,
G(p) =EX∼p[sX(p)].
It is easy to show thats1(p) monotonically increases ands0(p) monotonically decreases
withp ifs is strictly proper and differentiable.
COROLLARY 2.3. If a strictly proper scoring rule sx(p) is differentiable for all x∈
{0, 1}, then s1(p) is a strictly increasing function of p ands0(p) is a strictly decreasing
function ofp.
2.3.2. Weighted Score Wagering Mechanisms. Equipped with an understanding of proper
scoring rules, we are ready to deﬁne weighted score wagering mechanisms. A weighted
score wagering mechanism uses a strictly proper scoring rule s. A participant’s net
payoff in the mechanism depends on how his score compares with the wager-weighted
average score of all agents. LetWA denote the total wager of participants in setA. The
net payoff function of weighted score wagering mechanisms is deﬁned as follows.
Deﬁnition 2.4. A weighted score wagering mechanism (WSWM)with strictly proper
scoring rules, wheresx(p)∈ [0, 1]∀p∈ [0, 1] andx∈{ 0, 1}, determines the net payoffs
of participants according to function
ΠWS
i (p, w,x ) =wi

sx(pi)−
∑
j∈N
wj
WN
sx(pj)


= wiWN\{i}
WN

sx(pi)−
∑
j∈N\{i}
wj
WN\{i}
sx(pj)

. (2)
The proper scoring rules used in WSWMs are restricted to have range[0, 1]. This guar-
antees that no agent can lose more than what he wagers in the mechanism, that is,
ΠWS
i (p, w,x )≥− wi. We also often assume that s is differentiable; in such cases we
refer to the mechanism as differentiable WSWMs.
WSWMs have been shown to satisfy anonymity, budget balance, individual rational-
ity, incentive compatibility, normality, and a stronger version of sybilproofness [Lam-
bert et al. 2008]. 4 Lambert et al. [2008] also proved that the WSWMs are the unique
set of mechanisms that satisfy the above six properties as well as another homogeneity
property, which requires that multiplying all wagers by a positive constant α results
in the net payoffs of all agents being multiplied by α. Depending on the choice of the
scoring rule, some but not all WSWMs satisfy neutrality.
2.4. f-norm
Finally, we introduce an (f,µ)-norm function and derive its properties. These are im-
portant technical tools that we will use throughout the paper to understand incentive
properties of wagering mechanisms and design new mechanisms.
Let f : [0, 1]→ R be a continuous, strictly monotone function, and let f−1 denote
the inverse function of f, which is well deﬁned in the range off. Deﬁne the “average”
function for a vector p∈ [0, 1]n with respect to a vector of weights µ, with ∑
iµi = 1
andµi≥ 0∀i, as
µ−avg(p) :=
n∑
i=1
µipi.
We abuse notation to let f(p) denote the vector whose i-th component is f(pi). Deﬁne
the (f,µ)-norm of a vector p∈ [0, 1]n with respect toµ as follows:
∥p∥f,µ :=f−1 (µ−avg(f(p))).
We will call itf-norm for convenience. We now note some properties of thef-norm.
LEMMA 2.5. For any continuous, strictly monotone function f : [0, 1] → R, any
vector of weightsµ and any constantsa andb,
(1) Ifg(x) =af(x) +b, then∥p∥g,µ =∥p∥f,µ.
(2) Ifg(x) =f(ax +b), then∥p∥g,µ = ∥ap+b∥f,µ−b
a .
LEMMA 2.6. Letf andg be continuous, strictly monotone functions.
∥p∥f,µ≤∥ p∥g,µ∀µ⇔
{
g(f−1(·)) is convex if g is increasing
g(f−1(·)) is concave if g is decreasing.
4While the sybilproofness property in Section 2.2 ensures that a participant won’t ﬁnd splitting his wager
and betting under multiple identities proﬁtable ex ante , WSWMs guarantee it even ex post because the
net payoff of each participant remains the same for all x. For the same reason, WSWMs also ensure that
participants with the same prediction do not ﬁnd it proﬁtable to pool their wagers and participate under a
single identity.
3. ARBITRAGE IN WEIGHTED SCORE WAGERING MECHANISMS
We show in this section that the appealing WSWMs leave free money on the table. In
other words, there exist arbitrage opportunities in these mechanisms. We formalize
this notion of an arbitrage, characterize the arbitrage interval for WSWMs and give
sufﬁcient conditions for any wagering mechanism to have an arbitrage opportunity.
We ﬁrst demonstrate the existence of an arbitrage opportunity in the Brier wagering
mechanism, the WSWM with the Brier scoring rule. In the Brier wagering mechanism,
given prediction vector p and wager vector w, participant i receives net payoff, as
deﬁned in (2),
ΠWS
i (p, w,x ) = wiWN\{i}
WN

−(x−pi)2 +
∑
j∈N\{i}
wj
WN\{i}
(x−pj)2


under outcomex. Now suppose participanti instead makes a prediction
ˆpi =
∑
j∈N\{i}
wj
WN\{i}
pj.
Then, his net payoff is nonnegative due to the convexity of the functionf(p) = (x−p)2,
and is strictly positive if not all pj, j∈N\{ i}, take the same value. Further, it is easy
to see that the value of ΠWS
i (ˆpi, p−i, w,x ) is the same for any outcome x. This means
that by predicting ˆpi, participanti makes a strictly positive and outcome-independent
net payoff whenever there exists disagreement among other participants.
The opportunity for a participant to risklessly make a proﬁt is what we call an arbi-
trage opportunity. We now formally deﬁne what risklessly making a proﬁt means in a
wagering mechanism.
Deﬁnition 3.1. A participanti risklessly makes a proﬁt at predictions p and wagers
w in a wagering mechanism if and only if both Πi(p, w, 1) and Πi(p, w, 0) are nonneg-
ative and at least one of Πi(p, w, 1) and Πi(p, w, 0) is strictly positive.
The existence of arbitrage opportunities does not contradict the incentive compati-
bility of the mechanism. This is because participanti still maximizes his expected net
payoff by predicting his true belief pi but he may receive a negative net payoff for one
outcome with this prediction. In addition, given the one-shot nature of the mechanism,
participants seeking arbitrage have no way of knowing ˆpi.
3.1. Characterization of Arbitrage Interval for WSWMs
The demonstrated arbitrage opportunity is not unique to the Brier wagering mecha-
nism and can be generalized to any WSWM. For this, it’s useful to restate the above
observation in terms of f-norms. Notice that we set ˆpi =∥p−i∥f,µ where f(x) = x is
the identity function and µj =wj/WN\{i} for allj̸=i. For an arbitrary scoring rules,
letG be the corresponding convex function in Theorem 2.2. Then the following lemma
gives the corresponding equal arbitrage prediction point for a participant. The proof of
the lemma is very similar to that of Theorem 1 in Chun and Shachter [2011], where
they show that a group of agents can “collude” by all making a prediction at this point
and, as a coalition, make more proﬁt under every outcome than everyone predicting
his true belief. We omit the proof here.
LEMMA 3.2. For any differentiable WSWM with scoring rule s, a participant i
risklessly makes a proﬁt at prediction ˆpi = ∥p−i∥G′,µ, where G′ is the gradient of
G(p) = EX∼p[sX(p)] andµj = wj/WN\{i} for all j∈N\{ i}, as long as not all elements
in p−i are the same (in which case his payoff is 0). Further, his payoff is the same for
all outcomes.
We can further characterize the entire interval that allows a participant to risklessly
make a proﬁt.
THEOREM 3.3. For any differentiable WSWM with scoring rule s, a participant i
risklessly makes a proﬁt at predictions p and wagers w if and only if
(1) pi∈ [∥p−i∥s1,µ,∥p−i∥s0,µ] whereµj =wj/WN\{i} for allj∈N\{ i}, and
(2) not all elements in p−i are the same.
PROOF. We ﬁrst prove the “if part.” Suppose that not all elements in p−i are the
same. Since the scoring rule s is strictly proper and differentiable, according to Corol-
lary 2.3,s1(p) is a strictly increasing function ands0(p) is a strictly decreasing function.
From (2), one can see that participanti’s net payoff ΠWS
i (p, w, 1) strictly increases with
pi and ΠWS
i (p, w, 0) strictly decreases withpi. From Lemma 3.2, there exists a point ˆpi
for which both payments are positive. Suppose participanti predicts
∥p−i∥s1,µ =s−1
1

 ∑
j∈N\{i}
wj
WN\{i}
s1(pj)

.
Then
ΠWS
i (∥p−i∥s1,µ, p−i, w, 1) =s1(∥p−i∥s1,µ)−
∑
j∈N\{i}
wj
WN\{i}
s1(pj) = 0.
Since ΠWS
i (p, w, 1) strictly increases with pi, we must have ∥p−i∥s1,µ < ˆpi. Similarly,
we can show that ΠWS
i (∥p−i∥s0,µ, p−i, w, 0) = 0 and∥p−i∥s0,µ > ˆpi. Again using the
monotonicity of payoffs, it is easy to see that the payoff for any prediction in the non-
empty range [∥p−i∥s1,µ,∥p−i∥s0,µ] results in a nonnegative payoff for trader i for both
outcomes and a strictly positive payoff for at least one.
Now for the “only if” part, when not all elements in p−i are the same, the above
analysis already shows that if pi̸∈ [∥p−i∥s1,µ,∥p−i∥s0,µ], then either ΠWS
i (pi, p−i, w, 0)
or ΠWS
i (pi, p−i, w, 1) is strictly negative, and hence participanti cannot risklessly make
a proﬁt. Suppose that all elements in p−i are the same, and are equal top. Then
ΠWS
i (p, w,x ) = wiWN\{i}
WN
(sx(pi)−sx(p)).
Participanti can then never risklessly make a proﬁt, due to the strict monotonicity of
s1 and s0. If pi > p, then s0(pi) < s0(p) and if pi < p, then s1(pi) < s1(p), so in either
case participant i could make a loss for one of the outcomes. If pi =p then she makes
0 for both outcomes.
3.2. Sufﬁcient Conditions for Existence of Arbitrage
Finally, we show that the existence of arbitrage opportunities seems to be quite gen-
eral for wagering mechanisms by providing some mild sufﬁcient conditions. We make
no assumptions about the wagering mechanisms aside from the three conditions listed
in the theorem statement; in particular, we do not assume weak budget balance, indi-
vidual rationality, or even incentive compatibility.
THEOREM 3.4. If a wagering mechanism satisﬁes the following three conditions:
(1) ∀i∈N ,x∈{ 0, 1}, p−i∈ [0, 1]n−1, and w∈ Rn, Πi(pi, p−i, w,x ) is continuous inpi.
(2) Ifpi =pj for alli,j ∈N , then Πi(p, w,x )≥ 0 for alli∈N , w∈ Rn, andx∈{ 0, 1}.
(3) The normality condition (as deﬁned in Section 2.2).
then for all i∈N , w∈ Rn
+, and ˆp−i∈ [0, 1]n−1 where not all elements of ˆp−i are the
same, there exists an interval [ai,bi], where 0≤ai < bi≤ 1, such that agent i risklessly
makes a proﬁt by predicting some ˆpi∈ [ai,bi].
PROOF. Normality says that for all pi ∈ [0, 1] and w ∈ Rn
+, holding any ˆp−j ∈
[0, 1]n−1 ﬁxed,j̸= i, the expected payoff of agent i with belief pi is strictly minimized
when agentj predicts ˆpj =pi, that is,pi = arg minˆpjEX∼pi[Πi(ˆpj, ˆp−j, w,X )].
We ﬁrst prove that conditions (2) and (3) together imply the following:
(*) For alli∈N , belief pi∈ [0, 1], predictions ˆp−i∈ [0, 1]n−1 such that not all elements
of ˆp−i are the same, and wagersw∈ Rn
+, the expected net payoff of agenti is strictly
positive if he predictspi, that is,EX∼pi[Πi(pi, ˆp−i, w,X )]> 0.
To show this, considerEX∼pi[Πi(pi, ˆp−i, w,X )] andEX∼pi[Πi(pi, ¯p−i, w,X )] where ev-
ery element of ¯p−i equals pi. According to condition (2), EX∼pi[Πi(pi, ¯p−i, w,X )]≥ 0.
Because not all elements of ˆp−i are the same, there are predictions in ˆp−i that
are different from pi. Now, change those predictions to pi one at a time until we
have ¯p−i. At each step, according to condition (3), the expected net payoff of agent
i strictly decreases. Combining with EX∼pi[Πi(pi, ¯p−i, w,X )] ≥ 0, this means that
EX∼pi[Πi(pi, ˆp−i, w,X )]> 0.
Next, we prove that (1) and (*) imply the existence of arbitrage opportunities.
For all w∈ Rn
+ and ˆp−i∈ [0, 1]n−1 such that not all elements of ˆp−i are the same, (*)
requires that
piΠi(pi, ˆp−i, w, 1) + (1−pi)Πi(pi, ˆp−i, w, 0)> 0
for all pi ∈ [0, 1]. Considering the cases in which pi = 1 and pi = 0 , this gives us
Πi(1, ˆp−i, w, 1)> 0 and Πi(0, ˆp−i, w, 0)> 0.
According to condition (1), both Πi(pi, ˆp−i, w, 1) and Πi(pi, ˆp−i, w, 0) are continuous
functions of pi. If Πi(1, ˆp−i, w, 0) > 0, then the net payoff of agent i is strictly positive
under both outcomes when he predicts 1. By continuity of Πi(pi, ˆp−i, w, 1), there exists
a positive ϵ such that when agent i’s prediction is in [1−ϵ, 1], he risklessly makes a
proﬁt. By a similar argument, if Πi(0, ˆp−i, w, 1)> 0, there exists an interval of predic-
tions where agenti risklessly makes a proﬁt by making a prediction in the interval.
The only case left is both Πi(1, ˆp−i, w, 0)≤ 0 and Πi(0, ˆp−i, w, 1)≤ 0. For this case,
deﬁneh(pi) = Πi(pi, ˆp−i, w, 1)− Πi(pi, ˆp−i, w, 0).h(pi) is a continuous function deﬁned
on [0, 1], withh(1)> 0 andh(0)< 0. By the intermediate value theorem of continuous
functions, there exists a p′
i∈ (0, 1) such that h(p′
i) = 0 . Because we must have either
Πi(p′
i, ˆp−i, w, 1) > 0 or Πi(p′
i, ˆp−i, w, 0) > 0, h(p′
i) = 0 means that Πi(p′
i, ˆp−i, w, 1) =
Πi(p′
i, ˆp−i, w, 0)> 0. Agenti makes a strictly positive proﬁt under both outcomes when
predicting p′
i. By continuity of the net payoff functions, this implies that there exists
ϵ> 0 such that when agenti predicts ˆpi∈ [p′
i−ϵ,p′
i +ϵ], he risklessly makes a proﬁt.
The WSWMs, which are normal, satisfy condition (2) in Theorem 3.4 because every-
one receives zero net payoff when all agents make the same prediction. It is interesting
to note that any wagering mechanism that is anonymous, individually rational, and
weakly budget balanced necessarily assigns zero net payoff to all agents when they
have the same prediction and wager, that is, condition (2) is satisﬁed whenever w has
identical elements. Therefore, it is not practical to relax this condition. In the next two
sections, we show that it is possible to relax the normality condition and design mech-
anisms that do not admit arbitrage opportunities yet still satisfy anonymity, weak
budget balance, individual rationality, incentive compatibility, and sybilproofness.
4. NO-ARBITRAGE WAGERING MECHANISMS
In this section, we consider mechanisms that plug the arbitrage hole in WSWMs and
allow the center to make a proﬁt. We formally deﬁne the no arbitrage property, and
give necessary and/or sufﬁcient conditions for a mechanism to satisfy no arbitrage
and/or weak budget balance. In particular, we deﬁne a class of mechanisms called no-
arbitrage wagering mechanisms that are closely related to WSWMs, but with the no
arbitrage property.
No Arbitrage: For alli∈N , p∈ [0, 1]n, and w∈ Rn
+, participanti cannot risklessly
make a proﬁt at p and w.
We ﬁrst provide a characterization theorem on the common form of wagering mecha-
nisms that satisfy individual rationality, incentive compatibility, and no arbitrage. We
continue the convention and call a wagering mechanism differentiable if its net payoff
function is differentiable with respect to the predictions of the agents.
THEOREM 4.1. A differentiable wagering mechanism satisﬁes individual rational-
ity, incentive compatibility, and no arbitrage if and only if its net payoff function is of
the form
Πi(p, w,x ) =ci(p−i, w)[sx(pi)−sx(¯pi(p−i, w))], (3)
wheres is a strictly proper scoring rule,ci and ¯pi are functions of only p−i and w, and
ci(p−i, w)> 0 and ¯pi(p−i, w)∈ [0, 1] for all p−i∈ [0, 1]n−1 and w∈ Rn
+.
PROOF. We ﬁrst prove the sufﬁciency of (3). Because s is a strictly proper scoring
rule and c is a strictly positive function that doesn’t not depend on pi, by deﬁnition of
strictly proper scoring rules, a wagering mechanism with a net payoff function of (3) is
incentive compatible. It’s easy to see that it is also individually rational because strict
properness ofs impliesEX pi[sX(pi)]≥EX pi[sX(¯pi(p−i, w))]. The proof of no arbitrage
follows essentially the same argument in the “only if” part of the proof of Theorem 3.3.
Basically, ifpi̸= ¯pi(p−i, w), then eithers1(pi)<s 1(¯pi(p−i, w)) ors0(pi)<s 0(¯pi(p−i, w))
by monotonicity of the scoring functions.
Next, we prove the necessity of (3).
Incentive compatibility requires that, when ﬁxingp−i and w, the net payoff of agent
i is a strictly proper scoring rule of the prediction ofi. Hence, it can be written as
Πi(pi, p−i, w,x ) =ci(p−i, w)sx(pi) +hi(p−i, w,x ) (4)
wheres is some strictly proper scoring rule and ci is a strictly positive function. That
is, p−i and w only affect the afﬁne transformation of some strictly proper scoring rule.
Sinces is a strictly proper scoring rule and Πi is differentiable, according to Corollary
2.3, s1(pi) is strictly increasing with pi and s0(pi) is strictly decreasing with pi. This
implies that Πi(pi, p−i, w, 1) is strictly increasing withpi and Πi(pi, p−i, w, 0) is strictly
decreasing withpi.
No arbitrage implies that for all pi, p−i and w, either Πi(pi, p−i, w, 1) =
Πi(pi, p−i, w, 0) = 0 or at least one of Πi(pi, p−i, w, 1) and Πi(pi, p−i, w, 0) is strictly
negative. By individual rationality and incentive compatibility, we know that for any
pi, EX∼pi[Πi(pi, p−i, w,X )] ≥ 0. This means that for all pi either Πi(pi, p−i, w, 1) =
Πi(pi, p−i, w, 0) = 0 or one of Πi(pi, p−i, w, 1) and Πi(pi, p−i, w, 0) is at least 0 and the
other is strictly negative. Moreover, because EX∼1[Πi(1, p−i, w,X )] = Π i(1, p−i, w, 1)
and EX∼0[Πi(0, p−i, w,X )] = Π i(0, p−i, w, 0), we know that Πi(1, p−i, w, 1) ≥ 0
and Πi(0, p−i, w, 0) ≥ 0. Together with the monotonicity of Πi(pi, p−i, w, 1) and
Πi(pi, p−i, w, 0), all of these imply that there exists some ¯pi(p−i, w)∈ [0, 1] such that
Πi(¯pi(p−i, w), p−i, w, 1) = Πi(¯pi(p−i, w), p−i, w, 0) = 0. Applying (4), this implies
ci(p−i, w)sx(¯pi(p−i, w)) +hi(p−i, w,x ) = 0.
This gives thathi(p−i,x ) =−ci(p−i, w)sx(¯pi(p−i, w)). Plugging this to (4) gives (3).
4.1. No-Arbitrage Wagering Mechanisms and Weak Budget Balance
Theorem 4.1 gives quite some ﬂexibility in selecting ci and ¯pi. In this section, we hope
to design wagering mechanisms that not only satisfy the incentive properties but also
allow the center to make a proﬁt. This means that we would like to have wagering
mechanisms satisfying weak budget balance. Intuitively, we’d like to remove arbitrage
opportunities from WSWMs, but in a way that beneﬁts the center. It is interesting to
note that wagering mechanisms with net payoff functions in (3) may not necessarily
allow the center to make a proﬁt even if they don’t admit arbitrage opportunities.
We choose to focus on a subset of the mechanisms characterized by Theorem 4.1 be-
cause, as it will become evident soon, this subset of wagering mechanisms connects to
WSWMs in a natural way. We call this family of wagering mechanisms theno-arbitrage
wagering mechanisms (NAWM) and deﬁne it formally below. Given a permutationσ of
agents in N\{i}, we use pσ
−i and wσ
−i to denote the vectors achieved by permuting
elements of p−i and w−i according toσ respectively.
Deﬁnition 4.2. A no-arbitrage wagering mechanism (NAWM) determines the net
payoffs of agents according to function
ΠNA
i (p, w,x ) = wiWN\{i}
WN
[sx(pi)−sx (¯p(p−i, w−i))], (5)
wheres is any strictly proper scoring rule such thatsx(p)∈ [0, 1] for allp∈ [0, 1] andx∈
{0, 1}, and ¯p is any function such that ¯p(p−i, w−i)∈ [0, 1] and ¯p(p−i, w−i) = ¯p(pσ
−i, wσ
−i)
for all p−i∈ [0, 1]n−1, w−i∈ Rn−1
+ , and all permutationsσ ofN\{i}.
NAWMs restrict that ci in (3) is the same function for all agents and depends on
neither the predictions of other agents nor the identities of agents. It is the same
multiplier that appears in the net payoff functions of WSWMs. The deﬁnition also
requires that ¯pi in (3) is the same function for all agents and doesn’t depend on the
identities of the agents or the wager of agent i. Thus, by deﬁnition, NAWMs satisfy
anonymity, and if differentiable, by Theorem 4.1, they satisfy individual rationality,
incentive compatibility, and no arbitrage.
COROLLARY 4.3. Any differentiable NAWM satisﬁes individual rationality, incen-
tive compatibility, anonymity, and no arbitrage.
We sometimes use ¯pi to denote ¯p(p−i, w−i) when the vectors of predictions and wa-
gers are clear in the context. It is easy to check that the net payoff functions of NAWMs
can be written as
ΠNA
i (p, w,x ) = ΠWS
i (p, w,x )− ΠWS
i (¯pi, p−i, w,x ). (6)
This means that an NAWM works by subtracting some value that is independent of the
prediction of agent i from agent i’s net payoff in the corresponding WSWM. Since the
subtracted value doesn’t depend on agenti’s prediction, NAWMs preserve the incentive
compatibility of WSWMs. If we interpret ¯pi as a prediction that an arbitrager makes
when wagering wi against all agents except i, we observe below that the conditions
in Theorem 3.3 are sufﬁcient for an NAWM to satisfy weak budget balance. The proof
follows from the observation in (6) and the budget balance of WSWMs.
THEOREM 4.4. A differentiable NAWM satisﬁes weak budget balance (in addition
to the properties in Corollary 4.3) if for all i∈N , p∈ [0, 1]n, and w∈ Rn
+, it satisﬁes
¯p(p−i, w−i)∈ [∥p−i∥s1,µ,∥p−i∥s0,µ] whereµj =wj/WN\{i} for allj∈N\{ i}.
We note that NAWMs violate the normality property. Normality requires that, ﬁx-
ing everything else, if agentj changes his prediction to agenti’s true belief, then agent
i’s expected net payoff is minimized. In NAWMs, depending on the prediction of other
agents, agent i’s expected net payoff can increase with such a move. To see this, con-
sider an NAWM using the Brier scoring rule (1) and ¯p(p−i, w−i) = ∑
j
wj
WN\{ i}
pj. As we
showed at the beginning of Section 3, this ¯p(p−i, w−i) satisﬁes the condition in Theo-
rem 4.4. Suppose there are only three agents who predict 0.1, 0.4 and 0.7 respectively
and have the same wager. The true belief of agent 2 is also 0.4. With these predictions,
¯p2 = 0.4, the same as agent 2’s prediction, which leads to a zero net payoff for agent 2
in the NAWM. However, if agent 1 changes her report to 0.4, ¯p2 becomes 0.55. Agent 2
now in expectation makes a positive net payoff.
4.2. Adding Neutrality
At this point, we are equipped with a class of wagering mechanisms, characterized
by Theorem 4.4, that satisfy anonymity, individual rationality, incentive compatibility,
no arbitrage, and weak budget balance. Just as not all WSWMs are neutral, not all
NAWMs satisfy neutrality. Next we provide conditions that are necessary and sufﬁ-
cient for an NAWM to satisfy neutrality. In addition to being a desirable property for
scenarios in which it would be unnatural for the wagering mechanism to treat out-
comes asymmetrically (e.g., when wagering over which of two candidates will win an
election), in the next section we will see that neutrality helps us to focus on a smaller
set of NAWMs for which we can obtain the explicit functional forms of the payoff func-
tions and analyze the property of sybilproofness.
We extend the deﬁnition of neutrality for a wagering mechanism to scoring rules
as well as the function ¯p(p−i, w−i). We say that a scoring rule s is neutral if for all
x∈{ 0, 1} andpi∈ [0, 1],sx(pi) = s1−x(1−pi). We say that the function ¯p(p−i, w−i) is
neutral if ¯p(1− p−i, w−i) = 1− ¯p(p−i, w−i) for all p−i∈ [0, 1]n−1 and w−i∈ Rn−1
+ .
LEMMA 4.5. An NAWM satisﬁes neutrality if and only if
(1) its net payoff function (5) can be represented with a neutral scoring rule, and
(2) ¯p(p−i, w−i) is neutral.
PROOF. Conditions (1) and (2) imply
ΠNA
i (1− p, w, 1−x) = wiWN\{i}
WN
[s1−x(1−pi)−s1−x(¯p(1− p−i, w−i))]
= wiWN\{i}
WN
[sx(pi)−sx(¯p(p−i, w−i))] = ΠNA
i (p, w,x ).
Hence the mechanism is neutral.
Next we prove that conditions (1) and (2) are necessary for an NAWM to satisfy
neutrality. Neutrality of an NAWM requires
sx(pi)−sx(¯p(p−i, w−i)) =s1−x(1−pi)−s1−x(¯p(1− p−i, w−i)) (7)
for all p, w, andx.
We use 0.5 to represent a vector whose elements are 0.5. Now consider the case
where p−i = 0.5. Clearly, ¯p(p−i, w−i) = ¯p(1− p−i, w−i) for p−i = 0.5. (7) implies that
sx(pi)−sx(¯p(0.5, w−i)) =s1−x(1−pi)−s1−x(¯p(0.5, w−i))
for allpi, w−i, andx. Pick an arbitrary w∗
−i and deﬁnes′
x(pi) =sx(pi)−sx(¯p(0.5, w∗
−i)).
The above expression implies that s′ is neutral. It’s also easy to check that s′
x(pi)−
s′
x(¯p(p−i, w−i)) = sx(pi)−sx(¯p(p−i, w−i)) for all p, w−i and x, which means that the
original net payoff function can be written as
ΠNA
i (p, w,x ) = wiWN\{i}
WN
[s′
x(pi)−s′
x (¯p(p−i, w−i))].
This proves that (1) is necessary.
Lettingpi = 0.5 in (7), the neutrality of s′ implies that s′
x(¯p(p−i, w−i)) = s′
1−x(¯p(1−
p−i, w−i)) for all p−i and w−i. Applying the neutrality ofs′ again, we have ¯p(p−i, w) =
1− ¯p(1− p−i, w), which shows the necessity of (2).
Since the payoff function of any neutral NAWM can be represented using a neutral
scoring rule, we assume without loss of generality that the scoring rule used in any
neutral NAWM is also neutral. If an NAWM satisﬁes neutrality, the conditions in The-
orem 4.4 can be slightly weakened, to only require ¯pi to be bounded above by∥p−i∥s0,µ
for weak budget balance to be satisﬁed, as shown in the following theorem.
THEOREM 4.6. A differentiable and neutral NAWM satisﬁes weak budget balance
(in addition to the properties in Corollary 4.3) if for all i∈N, w∈ Rn
+, and p∈ [0, 1]n,
¯p(p−i, w−i)≤∥ p−i∥s0,µ whereµj =wj/WN\{i} for allj∈N\{ i}.
In the next section we will see that considering neutrality allows us to restrict our
attention to a smaller set of NAWMS that we can analyze more deeply.
5. NO-ARBITRAGE WAGERING MECHANISMS USING f-NORMS
In the previous section we showed that if an NAWM mechanism uses a neutral scoring
rule s and a neutral ¯p(p−i, w−i) function, then if ¯p(p−i, w−i)≤∥ p−i∥s0,µ is satisﬁed,
the mechanism satisﬁes neutrality and weak budget balance, in addition to anonymity,
individual rationality, incentive compatibility, and no arbitrage. However, we haven’t
shown what functional forms of¯p(p−i, w−i) satisfy these conditions. Moreover, we don’t
know whether any of these mechanisms satisfy sybilproofness.
In this section, we propose a generic way of deﬁning ¯p(p−i, w−i) that satisﬁes these
conditions, using f-norms. We consider the class of NAWMs that use an f-norm to
deﬁne ¯p(p−i, w−i). By Corollary 4.3, any differentiable NAWM in this class satisﬁes
anonymity, individual rationality, incentive compatibility, and no arbitrage. We char-
acterize the functionsf for which these mechanisms also satisfy weak budget balance
and neutrality. We then give speciﬁc examples off-norms that satisfy these properties,
and show that these mechanisms also satisfy sybilproofness.
Deﬁnition 5.1. For any continuous, strictly monotone function f : [0, 1]→ [0, 1], an
f-NAWM is a NAWM with
¯p(p−i, w−i) =∥p−i∥f,µ,
whereµj =wj/WN\{i} for allj∈N\{ i}.
We ﬁrst give necessary and sufﬁcient conditions on f for ¯p(p−i, w−i) to be neutral,
which will allow us to apply the results from Section 4.2.
LEMMA 5.2. Letµj = wj/WN\{i} for all j∈N\{ i}. Then ¯p(p−i, w−i) =∥p−i∥f,µ is
neutral if and only if
f(p) +f(1−p) = 2f(1/2), ∀p∈ [0, 1]. (8)
We further abuse notation and say that f is neutral if it satisﬁes (8). When both f
ands are neutral, we know that f-NAWM satisﬁes neutrality by Lemma 4.5. We now
give a precise characterization of when an f-NAWM satisﬁes weak budget balance,
which is essentially whens0(f−1(·)) is concave.
THEOREM 5.3. The necessary and sufﬁcient conditions for a differentiable
f-NAWM to satisfy weak budget balance are respectively:
(1) A differentiable f-NAWM is weakly budget balanced if f and s are neutral and
s0(f−1(·)) is concave.
(2) If a differentiablef-NAWM is weakly budget balanced thens0(f−1(·)) is concave.
The proof relies on the following lemma, which gives a necessary condition for gen-
eral NAWMs that is a partial converse of Theorem 4.6, in the sense that the inequality
¯pi≤∥ p−i∥s0,µ is required to hold for only certain vectors.
LEMMA 5.4. Letp,q be any two numbers in [0, 1]. Consider a differentiable NAWM
that is weakly budget balanced. Fix all the wagers to be equal to 1 and let ¯pi = ¯p(p−i)
for some function ¯p : [0, 1]n−1→ [0, 1]. Let 1n−2 be the vector of 1’s inn− 2 dimensions.
Then
¯p(p,q 1n−2)≤∥ (p,q 1n−2)∥s0,µ , whereµj = 1/(n− 1) for allj.
PROOF OF THEOREM 5.3. The ﬁrst part follows easily from Theorem 4.6 and
Lemma 2.6.
For the second part, ﬁrst observe that applying Lemma 5.4 to an f-NAWM implies
that for any p and q, letting µ = (1/k, 1− 1/k) for any integer k ≥ 2 and µ′ be a
k-dimensional vector withµ′
j = 1/k for allj, we have
∥(p,q )∥f,µ =∥(p,q 1k−1)∥f,µ′≤∥ (p,q 1k−1)∥s0,µ′ =∥(p,q )∥s0,µ.
The above inequality gives that forh(x) =s0(f−1(x)),αh(x) + (1−α)h(y)≤h(αx + (1−
α)y), for allx,y, and for allα = 1/k for some integerk≥ 2. To see this, for anyx andy,
letp =f−1(x) andq =f−1(y). Then,
∥(p,q )∥s0,(α,1−α) ≥ ∥(p,q )∥f,(α,1−α)
⇔s−1
0 (αs0(p) + (1−α)s0(q)) ≥ f−1(αf(p) + (1−α)f(q))
⇔αs0(p) + (1−α)s0(q) ≤ s0(f−1(αf(p) + (1−α)f(q)))
⇔αs0(f−1(x)) + (1−α)s0(f−1(y)) ≤ s0(f−1(αx + (1−α)y))
⇔αh(x) + (1−α)h(y) ≤ h(αx + (1−α)y),
where the inequality changes direction becauses0 is a decreasing function.
We need to show that this inequality holds for allα∈ [0, 1]. We show this for a dense
subset of [0, 1], and since h is continuous, it follows that it holds for any α∈ [0, 1]. The
dense set that we show it for is the set of all rational numbers where the denominator
is a power of 2. This follows from the following recursive construction, where we show
that if the above inequality holds forα1 andα2, then it also holds for (α1 +α2)/2.
h
(α1 +α2
2 x +
(
1− α1 +α2
2
)
y
)
= h
(1
2 (α1x + (1−α1)y) + 1
2 (α2x + (1−α2)y)
)
≥ 1
2h (α1x + (1−α1)y) + 1
2h (α2x + (1−α2)y)
≥ α1
2 h(x) + 1−α1
2 h(y) +α2
2 h(x) + 1−α2
2 h(y)
= α1 +α2
2 h(x) +
(
1− α1 +α2
2
)
h(y).
In the ﬁrst inequality, we usedαh(x) + (1−α)h(y)≤h(αx + (1−α)y),withα = 1/2 and
in the second inequality we used it withα1 andα2. This completes the proof.
5.1. Example f-NAWMs
Next, we give speciﬁc examples off-NAWMs that are neutral and weakly budget bal-
anced. The ﬁrst follows easily from Lemma 3.2 and our original motivation.
LEMMA 5.5. Let s be a neutral, differentiable, proper scoring rule and G be the
corresponding convex function as in Theorem 2.2. Then the f-NAWM withf = G′ us-
ing scoring rule s is weakly budget balanced and neutral. Further, the surplus of the
mechanism is the same for both outcomes.
The class of f-NAWMs described in Lemma 5.5 is the most balanced in the sense
that the surplus is the same no matter what the outcome is. We now present two other
choices that are in that sense the most extreme mechanisms.
For anyf deﬁned on[0, 1] that satisﬁes (8), its value on[0, 1/2] completely determines
its value on (1/2, 1]. Hence, we now deﬁne an operation that takes any continuous
strictly monotone function deﬁned on [0, 1/2] and extends it to a continuous, strictly
monotone function on [0, 1] that satisﬁes (8). Given any function h : [0, 1]→ R, deﬁne
the symmetrization of the function, denoted sym(h), as
sym(h)(p) =
{
h(p) ifp∈ [0, 1/2],
2h(1/2)−h(1−p) ifp∈ (1/2, 1]. (9)
It is easy to verify that for any function h deﬁned on [0, 1/2], the new function sym(h)
is deﬁned on[0, 1] and satisﬁes (8). We will use the notationsym(p2) to denote the sym-
metrization sym(h) of the functionh(p) =p2 and similarly for other common functions.
THEOREM 5.6. Lets be a neutral, differentiable, proper scoring rule. Thef-NAWM
with f = sym(s0) or f = sym(s1) using scoring rule s is weakly budget balanced and
neutral. When the outcome is x, the surplus of the mechanism with f = sym(s0) is 0
when all of the predictions are closer to x than to 1−x; the surplus of the mechanism
withf = sym(s1) is 0 when all of the predictions are closer to 1−x than tox.
The proﬁt of the f-NAWM with f = sym(s0) has the following nice interpretation:
if everyone predicted that 0 was more likely than 1 and 0 is the outcome (i.e. all
agents make “correct” predictions), then the mechanism is exactly budget balanced and
doesn’t make a proﬁt. This may be seen as being closer to the property of exact budget
balanced than the f-NAWM withf =G′, which will always have a positive proﬁt un-
less all predictions are the same. On the other hand, the f-NAWM with f = sym(s1)
obtains a proﬁt in a less natural scenario, in that it makes a positive proﬁt when all
agents predicted 0 as more likely than 1 and the outcome is 0 (i.e. all agents make
“correct” predictions), but makes zero proﬁt when everyone predicted 0 as more likely
than 1 and the outcome is 1 (i.e. all agents make “wrong” predictions)!
We next turn our attention to the Brier scoring rule, sB, which is deﬁned in (1)
and satisﬁes neutrality. We give a whole range of functions f for which an f-NAWM
using the Brier scoring rule is weakly budget balanced and neutral. This range is an
interpolation between the two extremes, sym(s0) and sym(s1).
LEMMA 5.7. If eitherf = sym(pa) orf = sym((1−p)a) for some constant a∈ [1, 2],
then thef-NAWM withs =sB is weakly budget balanced and neutral.
5.2. Sybilproofness
We now show that the class of neutral and weakly budget balanced f-NAWMs also
satisﬁes sybilproofness.
THEOREM 5.8. Any neutral and weakly budget balancedf-NAWM is sybilproof.
Neutrality and weak budget balance of anf-NAWM mean thats and ¯p(p−i, w−i) are
neutral (or an equivalent mechanism can be written with a neutral s) and s0(f−1(·))
is concave. Our proof ﬁrst shows that we only need to prove sybilproofness for the
case of two agents, i andj. Then, using the neutrality of ¯p(p−i, w−i) and concavity of
s0(f−1(·)), we can show that agent i’s expected net payoff is higher when he predicts
pi and wagers wi than when he participates under any number k > 1 of identities
and predicts piℓ and wagers wiℓ for his identity ℓ, where piℓ and wiℓ can be arbitrary
predictions and wagers as long as ∑k
ℓ=1wiℓ =wi.
6. CONCLUSION
We establish a method to construct wagering mechanisms that satisfy anonymity, indi-
vidual rationality, incentive compatibility, no arbitrage, weak budget balance, neutral-
ity, and sybilproofness, and provide structural characterizations for wagering mecha-
nisms satisfying no arbitrage and some subsets of the other properties. These mecha-
nisms allow the center to make a guaranteed proﬁt from the disagreement of agents
with immutable beliefs, without sacriﬁcing major incentives properties. An intriguing
future direction is to characterize all one-shot wagering mechanisms that satisfy all
seven properties.
While we present our analysis in a setting for predicting binary random variables,
some of our results naturally generalize to predicting ﬁnite discrete random variables.
In particular, the “arbitrage interval” characterized in Theorem 3.3 easily generalizes
to an arbitrage set of probability vectors, and this condition can be used to generalize
Theorem 4.4 for NAWMs to satisfy weak budget balance.
ACKNOWLEDGMENTS
The authors are very grateful to Nicolas Lambert for helpful discussions and email exchanges about this
work and to Miro Dud´ık for early discussions about the arbitrage properties of WSWMs.
REFERENCES
ALI, M. M. 1977. Probability and utility estimates for racetrack bettors. Journal of Political
Economy 85, 4, 803–816.
ALLEN , F. AND GALE , D. 1992. Stock-price manipulation. The Review of Financial Studies 5, 3,
503–529.
BERG, J. E., F ORSYTHE , R., N ELSON , F. D., AND RIETZ , T. A. 2001. Results from a dozen years
of election futures markets research. In Handbook of Experimental Economic Results , C. A.
Plott and V. Smith, Eds.
BRIER , G. W. 1950. Veriﬁcation of forecasts expressed in terms of probability. Monthly Weather
Review 78, 1, 1–3.
CHAKRABORTY , A. AND YILMAZ , B. 2004. Manipulation in market order models. Journal of
Financial Markets 7, 2, 187–206.
CHEN, Y., C HU, C.-H., M ULLEN , T., AND PENNOCK , D. M. 2005. Information markets vs.
opinion pools: An empirical comparison. In ACM Conference on Electronic Commerce . ACM,
New York, NY, USA, 58–67.
CHEN, Y., D IMITROV , S., S AMI , R., R EEVES , D. M., P ENNOCK , D. M., H ANSON , R. D., F ORT-
NOW, L., AND GONEN , R. 2010. Gaming prediction markets: Equilibrium strategies with a
market maker. Algorithmica 58, 4, 930–969.
CHUN, S. AND SHACHTER , R. D. 2011. Strictly proper mechanisms with cooperating players. In
UAI’11: Proceedings of the 27th Conference on Uncertainty in Artiﬁcial Intelligence. 125–134.
DANI , V., M ADANI , O., P ENNOCK , D., S ANGHAI , S., AND GALEBACH , B. 2006. An empirical
comparison of algorithms for aggregating expert predictions. In Conference on Uncertainty in
Artiﬁcial Intelligence.
FORSYTHE , R. AND LUNDHOLM , R. J. 1990. Information aggregation in an experimental mar-
ket. Econometrica 58, 309–347.
FORSYTHE , R., N ELSON , F., NEUMANN , G. R., AND WRIGHT, J. 1991. Forecasting elections: A
market alternative to polls. In Contemporary Laboratory Experiments in Political Economy ,
T. R. Palfrey, Ed. University of Michigan Press, Ann Arbor, MI, USA, 69–111.
GANDAR , J. M., D ARE , W. H., B ROWN , C. R., AND ZUBER , R. A. 1999. Informed traders
and price variations in the betting market for professional basketball games. Journal of
Finance LIII, 1, 385–401.
GAO, X. A., Z HANG , J., AND CHEN, Y. 2013. What you jointly know determines how you act:
Strategic interactions in prediction markets. In ACM Conference on Electronic Commerce .
ACM, New York, NY, USA, 489–506.
GNEITING , T. AND RAFTERY , A. E. 2007. Strictly proper scoring rules, prediction, and estima-
tion. Journal of the American Statistical Association 102, 477, 359–378.
GOOD, I. J. 1952. Rational decisions. Journal of the Royal Statistical Society, Series B (Method-
ological) 14, 1, 107–114.
GROSSMAN , S. J. 1976. On the efﬁciency of competitive stock markets where traders have
diverse information. The Journal of Finance 31, 2, 573–585.
HANSEN , J., S CHMIDT , C., AND STROBEL , M. 2001. Manipulation in political stock markets —
preconditions and evidence. Technical Report.
JACOBS , R. 1995. Methods for combining experts’ probability assessments. Neural Computa-
tion 7, 5, 867–888.
JOHNSTONE , D. J. 2007. The parimutuel Kelly probability scoring rule. Decision Analysis 4, 2,
66–75.
KILGOUR , D. M. AND GERCHAK , Y. 2004. Elicitation of probabilities using competitive scoring
rules. Decision Analysis 1, 2, 108–113.
KUMAR , P. AND SEPPI , D. J. 1992. Futures manipulation with “cash settlement”. Journal of
Finance 47, 4, 1485–1502.
LAMBERT , N., L ANGFORD , J., V AUGHAN , J. W., C HEN, Y., R EEVES , D. M., S HOHAM , Y., AND
PENNOCK , D. M. 2014. An axiomatic characterization of wagering mechanisms. Journal of
Economic Theory. (Forthcoming).
LAMBERT , N., LANGFORD , J., WORTMAN , J., CHEN, Y., REEVES , D. M., SHOHAM , Y., AND PEN-
NOCK , D. M. 2008. Self-ﬁnanced wagering mechanisms for forecasting. In ACM Conference
on Electronic Commerce. ACM, New York, NY, USA, 170–179.
MATHESON , J. E. AND WINKLER , R. L. 1976. Scoring rules for continuous probability distribu-
tions. Management Science 22, 10, 1087–1096.
MILGROM , P. AND STOKEY , N. L. 1982. Information, trade and common knowledge. Journal of
Economic Theory 26, 1, 17–27.
OSTROVSKY , M. 2012. Information aggregation in dynamic markets with strategic traders.
Econometrica 80, 6, 2595–2648.
PAGE , S. 2007. The Difference: How the Power of Diversity Creates Better Groups, Firms, Schools,
and Societies. Princeton University Press, Princeton, New Jersey.
PLOTT, C. R., W IT, J., AND YANG, W. C. 1997. Parimutuel betting markets as information
aggregation devices: Experimental results. Tech. Rep. Social Science Working Paper 986,
California Institute of Technology. Apr.
ROLL , R. 1984. Orange juice and weather. The American Economic Review 74, 5, 861–880.
SAVAGE, L. J. 1971. Elicitation of personal probabilities and expectations. Journal of the Amer-
ican Statistical Association 66, 336, 783–801.
SUROWIECKI , J. 2004. The Wisdom of Crowds. Doubleday.
THALER , R. H. AND ZIEMBA , W. T. 1988. Anomalies: Parimutuel betting markets: Racetracks
and lotteries. Journal of Economic Perspectives 2, 2, 161–174.
UNGAR , L., M ELLORS , B., S ATOP ¨A ¨A, V., B ARON , J., T ETLOCK , P., R AMOS , J., AND SWIFT, S.
2012. The good judgment project: A large scale test of different methods of combining expert
predictions. AAAI Technical Report FS-12-06.
WINKLER , R. L. 1969. Scoring rules and the evaluation of probability assessors. Journal of the
American Statistical Association 64, 327, 1073–1078.
WOLFERS , J. AND ZITZEWITZ , E. 2004. Prediction markets. Journal of Economic Perspec-
tive 18, 2, 107–126.
A. MISSING PROOFS
A.1. Missing Proofs in Section 2
PROOF OF COROLLARY 2.3. Since sx(p) is differentiable, by Theorem 2.2, G(p) is
twice differentiable. Then, s′
1(p) = (1 −p)G′′(p) and s′
0(p) = −pG′′(p). Because s is
strictly proper,G(p) is strictly convex andG′′(p)> 0. Hence,s′
1(p)> 0 forp∈ [0, 1) and
s′
0(p) < 0 for p∈ (0, 1]. Thus, s1(p) strictly increases and s0(p) strictly decreases with
p.
PROOF OF LEMMA 2.5. Let g(x) =af(x) +b. For any particularx withy =g(x), we
havef(x) = y−b
a andg−1(y) =x =f−1(y−b
a ). Then
∥p∥g,µ = g−1 (µ−avg(g(p)))
= f−1
(µ−avg(g(p))−b
a
)
= f−1
(µ−avg(af(p) +b)−b
a
)
= f−1
(a·µ−avg(f(p)) +b−b
a
)
= f−1 (µ−avg(f(p)))
= ∥p∥f,µ.
Now let g(x) = f(ax +b). For any particular x with y = g(x), ax +b = f−1(y) and
f−1(y)−b
a =x =g−1(y). Then
∥p∥g,µ = g−1 (µ−avg(g(p)))
= f−1 (µ−avg(g(p)))−b
a
f−1 (µ−avg(g(p))) = f−1 (µ−avg(f(ap +b)))
= ∥ap +b∥f,µ.
PROOF OF LEMMA 2.6. For any convex function h, by deﬁnition of convexity, we
have that for any x and vector of weightsµ,
h(µ−avg(x))≤µ−avg(h(x)).
First we show the ⇐ direction. Assume that g is increasing and h(x) = g(f−1(x)) is
convex. Given some p∈ [0, 1]n, letxi =f(pi). Applying the convexity inequality above,
we get that for any vector of weightsµ,
g
(
f−1 (µ−avg(f(p)))
)
≤ µ−avg
(
g
(
f−1(f(p))
))
=µ−avg(g(p)) =g(g−1 (µ−avg(g(p))))
⇔f−1 (µ−avg(f(p))) ≤ g−1 (µ−avg(g(p))),
sinceg is strictly increasing.
Ifg is decreasing andh is concave, then−g is increasing and−h is convex. Further,
by Lemma 2.5,∥p∥g,µ =∥p∥−g,µ, so we may use the ﬁrst part.
Now for the⇒ direction, once again assume that g is increasing, and assume that
∥p∥f,µ≤∥ p∥g,µ∀µ. We wish to show thath(x) =g(f−1(x)) is convex. Letx =f(p) and
y =f(q) for anyp,q∈ [0, 1]. For anyα∈ [0, 1], we want to show that
αh(x) + (1−α)h(y) ≥ h(αx + (1−α)y)
⇔αg(f−1(x)) + (1−α)g(f−1(y)) ≥ g(f−1(αx + (1−α)y))
⇔αg(p) + (1−α)g(q) ≥ g(f−1(αf(p) + (1−α)f(q)))
⇔g−1(αg(p) + (1−α)g(q)) ≥ f−1(αf(p) + (1−α)f(q))
⇔∥ (p,q )∥g,(α,1−α) ≥ ∥(p,q )∥f,(α,1−α)
The case where g is decreasing can be handled similarly, except that the inequality is
reversed when applyingg−1 to both sides.
A.2. Missing Proofs in Section 4
PROOF OF THEOREM 4.4. The proof follows from the observation in (6) and the
budget balance of WSWMs. Because ¯pi∈ [∥p−i∥s1,µ,∥p−i∥s0,µ], according to Theorem
3.3, when not all elements of p−i are the same,
ΠWS
i (¯pi, p−i, w,x )≥ 0,
for all x ∈ {0, 1}. When all elements of p−i are the same and equal to p, we
have∥p−i∥s1,µ = ∥p−i∥s0,µ = p. Hence, ¯pi must also equal to p and in this case
ΠWS
i (¯pi, p−i, w,x ) = 0 for allx∈{ 0, 1}. Since the WSWM is budget balanced, by (6),
∑
i∈N
ΠNA
i (p, w,x ) =
∑
i∈N
ΠWS
i (p, w,x )−
∑
i∈N
ΠWS
i (¯pi, p−i, w,x ) =−
∑
i∈N
ΠWS
i (¯pi, p−i, w,x )≤ 0.
PROOF OF THEOREM 4.6. Because the NAWM satisﬁes neutrality, both s and
¯p(p−i, w−i) are neutral. Since s is neutral, s1(p) = s0(1−p). Using this in Lemma2.5,
we get that
∥p−i∥s1,µ = 1−∥ 1− p−i∥s0,µ.
If ¯p(p−i, w−i)≤∥ p−i∥s0,µ for all p, and w and ¯p(p−i, w−i) is neutral, then
¯p(p−i, w−i) = 1− ¯p(1− p−i, w−i)≥ 1−∥ 1− p−i∥s0,µ =∥p−i∥s1,µ.
By Theorem 4.4, the NAWM satisﬁes weak budget balance.
A.3. Missing Proofs in Section 5
Two lemmas will be used in the proofs given in this section. We state them ﬁrst.
LEMMA A.1. Letf andg be twice differentiable, strictly monotone functions.
f′′
f′ ≤ g′′
g′ ⇔
{
g(f−1(·)) is convex if g is increasing
g(f−1(·)) is concave if g is decreasing.
PROOF. Let h(x) =g(f−1(x)). Sincef andg are twice differentiable, so ish, and
h′(x) =g′(f−1(x))(f−1)′(x) and
h′′(x) =g′(f−1(x))(f−1)′′(x) + ((f−1)′(x))2g′′(f−1(x)).
Lety =f−1(x). Then
(f−1)′(x) = 1
f′(y) and (f−1)′′(x) =−f′′(y)
f′(y)3 .
Substituting these, we get
h′′(x) =−g′(y)f′′(y)
f′(y)3 + g′′(y)
f′(y)2.
It is easy to check that
f′′
f′ ≤ g′′
g′ ⇔
{
h′′(x)≥ 0 ifg′(y)≥ 0
h′′(x)≤ 0 ifg′(y)≤ 0.
LEMMA A.2. Fix a function h : [0, 1]→ R, and let f = sym(h). Then for p∈ ( 1
2, 1],
f′(p) =h′(1−p) andf′′(p) =−h′′(1−p).
The proof of Lemma A.2 is immediate using the deﬁnition of symmetrization in (9).
PROOF OF LEMMA 5.2 . If f is strictly monotone and continuous, its inversef−1 is
well deﬁned. Iff satisﬁes (8), then for anyp, lettingy =f(p) gives us
f−1 (
2f( 1
2)−y
)
= 1−f−1(y).
Using this and (8), we have
∥1− p∥f,µ = f−1 (µ−avg(f(1− p)))
= f−1 (
2f( 1
2)−µ−avg(f(p))
)
= 1−f−1 (µ−avg(f(p)))
= 1−∥ p∥f,µ.
For the other direction, assume that ∥1− p∥f,µ = 1−∥ p∥f,µ. Let p = (p, 1−p) and
µ = (1/2, 1/2). We have
f−1
(f(p) +f(1−p)
2
)
= 1−f−1
(f(p) +f(1−p)
2
)
⇒ 2f−1
(f(p) +f(1−p)
2
)
= 1
⇒f(p) +f(1−p) = 2 f
(1
2
)
.
PROOF OF LEMMA 5.4. Suppose that the prediction vector p is (p,q 1n−1), i.e., par-
ticipant 1 predicts p and everyone else predicts q. Then using anonymity and weak
budget balance, it can be argued that ¯p1 =q, and we have ¯pj = ¯p(p,q 1n−2) for allj̸= 1.
Now using the weak budget balance condition, we get that
s0(p)−s0(q) + (n− 1)s0(q)− (n− 1)s0(¯p(p,q 1n−2)) ≤ 0
⇒s0(p) + (n− 2)s0(q) ≤ (n− 1)s0(¯p(p,q 1n−2))
⇒ 1
n− 1(s0(p) + (n− 2)s0(q)) ≤ s0(¯p(p,q 1n−2))
⇒s−1
0
( 1
n− 1(s0(p) + (n− 2)s0(q))
)
≥ ¯p(p,q 1n−2)
⇒∥ (p,q 1n−2)∥s0,µ ≥ ¯p(p,q 1n−2).
Most of the inequalities are self-explanatory. The reversal of the inequality is because
s0 is decreasing.
PROOF OF LEMMA 5.5. That this mechanism satisﬁes weak budget balance follows
essentially from Theorem 4.4 using Lemma 3.2 and Theorem 3.3. The fact that the
surplus is independent of the outcome follows from the fact that the arbitrage proﬁt is
independent of the outcome in Lemma 3.2.
By Lemma 4.5 and Lemma 5.2, to show neutrality, we must simply show that G′ is
neutral assuming neutrality ofs. From Theorem 2.2,
G(p) =ps1(p) + (1−p)s0(p) =ps0(1−p) + (1−p)s0(p).
G′(p) =s0(1−p)−ps′
0(1−p)−s0(p) + (1−p)s′
0(p).
G′(1−p) =s0(p)− (1−p)s′
0(p)−s0(1−p) +ps′
0(1−p).
Adding, we get thatG′(p) +G′(1−p) = 0 =G′(1/2) as desired.
PROOF OF LEMMA 5.7. It is easy to check that sB is neutral. Therefore from
Lemma A.1 and Theorem 5.3, it is sufﬁcient to show that f′′/f′ ≤ s′′
0/s′
0. We ﬁrst
considerf = sym(pa).
Case 1: p∈ [0, 1/2]
We calculate, s′
0(p) = −2p, s′′
0(p) = −2 and s′′
0/s′
0 = 1/p. Similarly, f′(p) = apa−1,
f′′(p) =a(a− 1)pa−2 andf′′/f′ = (a− 1)/p. Sincea≤ 2, we have thatf′′/f′≤s′′
0/s′
0.
Case 2: p∈ (1/2, 1]
s′′
0/s′
0 is, as before, 1/p≥ 0. We now use Lemma A.2 to calculate f′(p) = a(1−p)a−1,
f′′(p) =−a(a− 1)(1−p)a−2 andf′′/f′ =−(a− 1)/(1−p)≤ 0 sincea≥ 1, so once again
we have thatf′′/f′≤s′′
0/s′
0.
Note that this is tight. If a >2, then Case 1 fails. If a <1, then Case 2 fails since
−(a− 1)/(1−p) would be greater than 1/p for p sufﬁciently close to 1, for any given
a< 1.
We now considerf = sym((1−p)a).
Case 1: p∈ [0, 1/2]
f′(p) =−a(1−p)a−1,f′′(p) =a(a−1)(1−p)a−2 andf′′/f′ =−(a−1)/(1−p)≤ 0≤s′′
0/s′
0.
Case 2: p∈ (1/2, 1]
Using Lemma A.2, f′(p) =−apa−1,f′′(p) =−a(a− 1)pa−2 andf′′/f′ = (a− 1)/p, so
once again sincea≤ 2, we have thatf′′/f′≤s′′
0/s′
0.
PROOF OF THEOREM 5.6. For weak budget balance, from Theorem 5.3 it is sufﬁ-
cient to show that s0(f−1) is concave. First consider f = sym(s0). Since f = s0 on
[0, 1/2], it follows that s0(f−1) is identity on [0, 1/2]. Therefore, the non-trivial part is
to show thats0(f−1) is concave on (1/2, 1], wheref(p) = 2s0(1/2)−s0(1−p).
Using Lemma 2.5 we get that when p∈ (1/2, 1]n,∥p∥f,µ = 1−∥ p∥s0,µ. It is easy to
see that∥p∥s0,µ > 1/2 when p∈ (1/2, 1]n, and therefore 1−∥ p∥s0,µ≤∥ p∥s0,µ. Now we
use Lemma 2.6 in the⇒ direction to conclude thats0(f−1) is concave on (1/2, 1].
We have shown thats0(f−1) is concave on [0, 1/2] and (1/2, 1] separately. But thenf
is differentiable at 1/2, which implies so iss0(f−1), and the derivative is continuous at
1/2. Therefores0(f−1) is concave on the entire [0, 1].
One can easily verify that when all of the predictions are at most1/2 and the outcome
is 0, ∥p∥f,µ =∥p∥s0,µ, and the sum of payments to the agents is 0. Since this is a
neutral NAWM, the same is true when predictions are at least 1/2 and the outcome is
1.
The proof forf = sym(s1) is similar.
PROOF OF THEOREM 5.8. The neutrality and weak budget balance of a f-NAWM
imply that s and ¯p(p−i, w−i) are neutral and s0(f−1(·)) is concave. Let s(r,q ) =
qs1(r) + (1−q)s0(r) be the expected score for predictionr under beliefq. We ﬁrst prove
a condition that we will use later, that for any p,q, andµ,
s(∥p∥f,µ,q )≥
∑
i
µis(pi,q ). (10)
We have
s(∥p∥f,µ,q ) =qs 1(∥p∥f,µ) + (1−q)s0(∥p∥f,µ)
=qs 0(1−∥ p∥f,µ) + (1−q)s0(∥p∥f,µ)
=qs 0(∥1− p∥f,µ) + (1−q)s0(∥p∥f,µ)
=qs 0(f−1(
∑
i
µif(1−pi))) + (1−q)s0(f−1(
∑
i
µif(pi)))
≥q
∑
i
µis0(f−1(f(1−pi))) + (1−q)
∑
i
µis0(f−1(f(pi)))
=q
∑
i
µis0(1−pi) + (1−q)
∑
i
µis0(pi)
=q
∑
i
µis1(pi) + (1−q)
∑
i
µis0(pi)
=
∑
i
µis(pi,q ).
The second equality is due to the neutrality of s. The third equality is because the
neutrality of ¯p(p−i, w−i) implies that 1−∥ p∥f,µ =∥1− p∥f,µ. The inequality is due to
the concavity ofs0(f−1(·)).
Now we are ready to prove sybilproofness. We ﬁrst show that it is sufﬁcient to prove
sybilproofness for two-agent wagering. In other words, we show that if an agent would
not want to create false identities when wagering against any single agent, she would
also not want to create false identities when wagering against any group of agents.
From the deﬁnition of a NAWM, it is clear that when agent i participates using
her own identity, she receives the same payoff she would receive if she were play-
ing against a single other agent with prediction and wager pair (¯pi,WN\{i}). Suppose
agent i participates under K identities, i1...i K, and they make predictions and wa-
gers (pi1,wi1)... (pik,wiK) respectively, where ∑K
k=1wik =wi andwik≥ 0,∀k. Then ¯pik
for identityik satisﬁes the following condition:
¯pik =f−1

 ∑
j∈N∪{i1,...,iK}\{i,ik}
wj
WN\{i} +wi−wik
f(pj)


=f−1

 WN\{i}
WN\{i} +wi−wik
∑
j∈N\{i}
wj
WN\{i}
f(pj) +
∑
j∈{1,...K}\{k}
wij
WN\{i} +wi−wik
f(pij)


=f−1

 WN\{i}
WN\{i} +wi−wik
f(¯pi) +
∑
j∈{1,...K}\{k}
wij
WN\{i} +wi−wik
f(pij)

.
For each identity, the reference report ¯pik is calculated in the same way it would be
if the identity were playing against a single agent with prediction and wager pair
(¯pi,WN\{i}) plus the other identities of agent i. Thus, to prove sybilproofness, we only
need to consider the case where playeri plays against a single other player.
Now consider playeri with prediction and wager(pi,wi) and another player with pre-
diction and wager (p,w ). If player i participates using her true identity, her expected
net payoff is
Ex∼pi[Πi((pi,p ), (wi,w ),x )] = w
w +wi
wi(s(pi,pi)−s(p,pi)). (11)
If agent i participates under identities i1,...,i K and they make predictions and wa-
gers (pi1,wi1),..., (piK,wiK) respectively, wherewik≥ 0 and ∑K
k=1wik = wi, then the
expected payoff of identityk is
Ex∼pi[Πik((pi1,...,p iK,p ), (wi1,...,w iK,w ),x )] = w +wi−wik
w +wi
wik(s(pik,pi)−s(¯pik,pi)).
(12)
To show sybilproofness, we’ll show that for any (p,w ), K, (pi,wi), and
(pi1,wi1),..., (piK,wiK), the right hand side of (11) is at least as big as the right hand
side of (12).
For identityik, we know that
¯pik =f−1

 w
w +wi−wik
f(p) +
∑
j∈{1,...K}\{k}
wij
w +wi−wik
f(pij)

.
The expected total payoff of theK identities is
K∑
k=1
w +wi−wik
w +wi
wik(s(pik,pi)−s(¯pik,pi))
≤
K∑
k=1
w +wi−wik
w +wi
wik

s(pik,pi)− w
w +wi−wik
s(p,pi)−
∑
j∈{1,...K}\{k}
wij
w +wi−wik
s(pij,pi)


=
K∑
k=1
w +wi−wik
w +wi
wik

 w +wi
w +wi−wik
s(pik,pi)− w
w +wi−wik
s(p,pi)−
∑
j∈{1,...K}
wij
w +wi−wik
s(pij,pi)


=
K∑
k=1
wiks(pik,p )− w
w +wi
wiks(p,pi)− wik
w +wi
K∑
j=1
wijs(pij,pi)
= w
w +wi
wi
( K∑
k=1
wik
wi
s(pik,pi)−s(p,pi)
)
≤ w
w +wi
wi
(
s(f−1(
K∑
k=1
wik
wi
f(pik)),pi)−s(p,pi)
)
≤ w
w +wi
wi (s(pi,pi)−s(p,pi))
which matches the right hand side of (12), as desired. The ﬁrst two inequalities are
due to (10). The last inequality is due to the fact thats is a proper scoring rule.
