. 
. 
Latest updates: hps://dl.acm.org/doi/10.1145/1386790.1386820
. 
. 
RESEARCH-ARTICLE
Self-financed wagering mechanisms for forecasting
NICOLAS S LAMBERT, Stanford University, Stanford, CA, United States
. 
JOHN C LANGFORD, Yahoo Research Labs, Sunnyvale, CA, United States
. 
JENNIFER WORTMAN VAUGHAN, University of Pennsylvania, Philadelphia, PA, United
States
. 
YILING CHEN, Yahoo Research Labs, Sunnyvale, CA, United States
. 
DANIEL M. REEVES, Yahoo Research Labs, Sunnyvale, CA, United States
. 
Y SHOHAM, Stanford University, Stanford, CA, United States
. 
View all
. 
. 
Open Access Support provided by:
. 
Stanford University
. 
Yahoo Research Labs
. 
University of Pennsylvania
. 
PDF Download
1386790.1386820.pdf
17 January 2026
Total Citations: 27
Total Downloads: 328
. 
. 
Published: 08 July 2008
. 
. 
Citation in BibTeX format
. 
. 
EC '08: ACM Conference on Electronic
Commerce
July 8 - 12, 2008
Il, Chicago, USA
. 
. 
Conference Sponsors:
SIGECOM
EC '08: Proceedings of the 9th ACM conference on Electronic commerce (July 2008)
hps://doi.org/10.1145/1386790.1386820
ISBN: 9781605581699
.

Self-Financed Wagering Mechanisms for Forecasting
∗
Nicolas Lambert
Stanford University
John Langford
Y ahoo! Research
Jennifer Wortman
University of Pennsylvania
Yiling Chen
Y ahoo! Research
Daniel Reeves
Y ahoo! Research
Y oav Shoham
Stanford University
David M. Pennock
Y ahoo! Research
ABSTRACT
We examine a class of wagering mechanisms designed to
elicit truthful predictions from a group of people without
requiring any outside subsidy. We propose a number of de-
sirable properties for wagering mechanisms, identifying one
mechanism—weighted-score wagering—that satisﬁes all of
the properties. Moreover, we show that a single-parameter
generalization of weighted-score wagering is the only mech-
anism that satisﬁes these properties. We explore some vari-
ants of the core mechanism based on practical considera-
tions.
Categories and Subject Descriptors
J.4 [Social and Behavioral Sciences ]: Economics
General Terms
Economics, Theory
Keywords
Group forecasting, mechanism design, prediction markets
1. INTRODUCTION
Consider a group of people with diﬀerent estimates about
an uncertain variable, for example diﬀerent probability esti-
mates or diﬀerent quantile estimates. We seek mechanisms
to induce all the group members to truthfully reveal their
estimates to each other.
If some patron is willing to pay for the group’s informa-
tion, then the patron can use any number of well-known
scoring rule payment functions that give group members the
incentive to truthfully report their estimates [16, 14]. How-
ever, if no patron is willing to subsidize the process, as we
assume in this paper, then self-ﬁnanced or budget-balanced
mechanisms are needed.
∗Part of this work was done while N. Lambert and J. Wort-
man were at Yahoo! Research, New York.
Permission to make digital or hard copies of all or part of this work for
personal or classroom use is granted without fee provided that copies are
not made or distributed for proﬁt or commercial advantage and that copies
bear this notice and the full citation on the ﬁrst page. To copy otherwise, to
republish, to post on servers or to redistribute to lists, requires prior speciﬁc
permission and/or a fee.
EC’08, July 8–12, 2008, Chicago, Illinois, USA.
Copyright 2008 ACM 978-1-60558-169-9/08/07 ...$5.00.
Prediction markets [17] can be run in a self-ﬁnanced way,
for example by employing double auction or parimutuel
mechanisms. Such markets induce aggregate estimates [18,
7], but do not induce truthful individual estimates [3]. An
informed trader may simply lack the wealth necessary to
move the market to express a belief. Similarly, if a trader
has a belief that matches the current market price, there is
no incentive to participate. Additionally, double auctions
are prone to the thin-market problem: with few traders, the
volume of transactions is insuﬃcient attract other traders,
hindering price discovery.
Kilgour and Gerchak [10] also propose an adaptation of
scoring rules for groups that are budget-balanced. However,
they require that all group members wager the same amount
of money. Recently, Johnstone [8] adapted the Kilgour-
Gerchak scoring rules to account for diﬀerent wagers, but
the resulting mechanism is not truthful. Newsfutures.com
employs a form of competitive forecasting for continuous
random variables that works well in practice, though is not
truthful.
In this paper, we take an axiomatic approach, compil-
ing a list of desirable properties in Section 4 that arguably
any mechanism should have: budget balance, anonymity,
truthfulness, normality, sybilproofness, individual rational-
ity, and monotonicity. In Section 2, we construct a general
space of mechanisms calledwagering mechanisms which con-
tains many known approaches, including call markets and
parimutuel markets. In Section 3, we identify the weighted-
score mechanism, a generalization of Kilgour-Gerchak scor-
ing rules, adapted to the elicitation of general distribution
properties and with weights a function of amount wagered.
We prove that weighted-score wagering satisﬁes all seven
properties.
A natural question to ask is whether there are other mech-
anisms satisfying this set of properties. We prove that the
answer is no. More precisely, in Section 5 we prove that the
mechanisms that satisfy the ﬁrst ﬁve properties are exactly
the weighted-score mechanisms, parameterized by the total
amount wagered. Then, relaxing some of the properties, in
Section 6 we explore variants of the core mechanism based
on practical considerations.
2. PRELIMINARIES
2.1 Model
We consider a wagering setting involving a principal and
a ﬁnite set of agents, or playersN ={1,...,n }. The prin-
cipal is interested in eliciting certain information on a given
random experiment, for example a horse race or the elec-
tion of a political candidate. We denote by Ω the set of
possible outcomes. We assume that the outcome of the ran-
dom experiment is drawn according to some distribution un-
known to the principal, but on which players form beliefs.
We model information of interest as distribution properties,
such as event probabilities or mean, deﬁned in Section 2.3.
Players participate in a wagering mechanism, formalized
in the next subsection. Wagering mechanisms are essen-
tially one-shot games in which players wager some money
and make a prediction. After the realization of the experi-
ment, each player receives a payout that is a function of her
performance relative to the performance of other players.
We assume that players are risk neutral and seek to max-
imize their expected payout with respect to their belief. We
argue that linear utility is a reasonable assumption when
the money at stake remains small enough. We further as-
sume that players choose their wager up front, before decid-
ing on their prediction. 1 We believe that such a behavior
is plausible in a context where players have ﬁxed budgets.
In particular, this is consistent with the model and ﬁndings
of Ali [1] in the case of horse-race parimutuel betting. Ali
showed that amounts players are willing to bet are typically
small and player utility varies approximately linearly in the
range of amounts being bet.
2.2 Wagering Mechanisms
Wagering mechanisms, which cover a large class of one-
shot mechanisms, allow players to specify a wager as part of
their actions. Wagering mechanisms operate in two steps.
In the ﬁrst step, each player announces a report chosen from
a certain set of possible reports R and wagers any positive
amount of money. Wagers are deposited in a common pot.
The set of allowed reports R may take various forms, for
example, in the case of a horse race, players may be asked
to specify a winning horse, or may be asked to lay out the
probability of winning for each competing horse. In a second
step, after the realization of the experiment, the common
pot is divided among the players according to their perfor-
mance, based on their reports and the true outcome of the
experiment. When the mechanism is not budget-balanced,
players may receive a bonus, or may have to pay a tax or
fee. Using the vector notation x = (x1,...,x n), each player
i reporting ri and wagering mi gets a nonnegative payout
Πi(r, m,ω ) speciﬁed by the mechanism. Payouts depend on
reports and wagers, and on the true outcome of the experi-
mentω. Player i’s net proﬁt is thus Πi(r, m,ω )−mi.
We assume that a player who wagers zero gets zero payout,
so without loss of generality, we can use the set of natural
numbers to represent the set of playersN = N since nonpar-
ticipation is equivalent to a zero bid.2 The formal deﬁnition
of wagering mechanism is given below.
Deﬁnition 1. A Wagering Mechanism is a tuple (R, Ω, Π)
together with a set of playersN, whereR is the set of allowed
reports, Ω is the outcome space, and Π = (Π i(r, m,ω ))i∈N
is the vector of payout functions Πi :RN× [0, +∞)N× Ω↦→
[0, +∞), with Πi(r, m,ω ) = 0 if mi = 0.
1The amount wagered may depend on the player’s be-
lief/knowledge. For example, the more conﬁdent the player
is about some outcome, the more she may want to wager.
2This notational change is useful to deﬁne wagering mecha-
nisms with a varying number of players.
Wagering mechanisms include several well-known in-
stances of betting mechanisms, in particular, parimutuel
betting markets [1, 15]. In a parimutuel market, players wa-
ger on mutually exclusive and exhaustive eventsE1,...,E m
(where, for example, Ei = “horsei wins the race”). Players
lose their wagers when the true outcome is not what they
bet, while winning players share the total money wagered in
proportion to their own wager. Such a market is a wagering
mechanism with the set of reports R ={E1,...,E m}, and
a payout
Πi = 1ω∈ri
mi∑
jmj1ω∈rj
∑
j
mj ,
when player i reports ri and wagers mi dollars, and where
1ω∈A is 1 if ω∈A and 0 otherwise.
Call markets [9, 13, 4] can also be viewed as wagering
mechanisms. In a typical call market for binary events, par-
ticipants trade on contingent contracts, each contract cor-
responding to an outcome, paying oﬀ $1 if the outcome be-
comes true and $0 otherwise. Traders may submit orders,
which indicate the maximum price they are willing to pay
for a certain contract and a maximum amount of money to
spend. Whenever possible, the market matches orders for
one outcome with orders for the opposite one. When the
space of outcomes is large, more exotic betting languages
can be used to allow, for example, betting on combinations
of events. This includes Boolean betting where players bet
on Boolean formulas of events [5] and permutation betting
where players bet on properties of the ﬁnal ranking of com-
peting candidates [2]. Such combinatorial betting may use
call markets with multilateral order matching to clear bets,
which can be modeled as wagering mechanisms. However
the payout functions are often very complicated. Further-
more, these instances of wagering mechanisms do not admit
a dominant strategy; rather, players make reports condi-
tionally on their beliefs on other players’ reports. At best,
when the range of possible reports is limited to outcomes or
events, the mechanism may allow a partial speciﬁcation of
individual subjective probabilities such as: the (subjective)
probability is greater than some threshold. However this
is an incomplete speciﬁcation and less natural than simply
stating a belief.
2.3 Distribution Properties
Distribution properties, introduced in Lambert et al. [11],
are a convenient way to model information on probability
distributions. A distribution property Γ(P ) is deﬁned as a
function that assigns a real value to any probability distri-
bution P in a given convex domain. By assumption, the
domain must contain the true distribution of the random
experiment under consideration. For example, in the case of
a continuous outcome, the domain of the median would be
the set of continuous densities with full support, the domain
of the expectation the set of distributions with ﬁnite ﬁrst
moment.
Common distribution properties include the probability of
an event, the expectation, the variance, medians/quantiles,
moments, indicators of the symmetry of the distribution
(skewness), and dispersion (kurtosis). For instance, the
property Γ corresponding to the probability of an event A
is Γ(P ) =P (A), that of the median of a random variable X
is Γ(P ) = supm{m : P (X < m) < 1/2}. As in Lambert et
al. [11], we say that a reportr (respectively, a probabilityP )
is admissible when r (respectively Γ(P )) falls in the interior
of Γ’s range, which is an open interval for continuous prop-
erties. We are interested in wagering mechanisms wherein
players report sets or vectors of property values. For exam-
ple, a single probability of a given event, the full distribution
for a ﬁnite set of outcomes, or a pair (expectation, variance).
Similar to scoring rules [16], Lambert et al. [11] deﬁne
reward functions that truthfully elicit single properties or
sets of properties from a risk neutral agent as follows.
Deﬁnition 2. A score function for a vector of distribution
properties Γ = (Γ1,..., Γk) is a real-valued function s(r,ω ),
with r = (r1,...,r k) and ri the report for property Γi, and
ω the outcome. It is called strictly proper when
EP [s(r,ω )]<E P [s(Γ(P ),ω )] (1)
for all admissible probabilityP and vectorr = (r1,...,r k)̸=
(Γ1(P ),..., Γk(P )).
Here and throughout the remainder of the paper, EP [X]
denotes the expectation of X when the outcome ω is dis-
tributed according to the distribution P . For convenience,
we identify single properties as vectors of properties with a
single element (k = 1).
3. WEIGHTED-SCORE MECHANISMS
In this section we present a speciﬁc subclass of wager-
ing mechanisms called weighted-score mechanisms. These
mechanisms are weighted mixtures of strictly proper score
functions. Rewards are determined by (1) the relative per-
formance of the players, as in the scoring rules of Kilgour and
Gerchak [10], and (2) the amounts wagered, as in parimutuel
betting markets.
Deﬁnition 3. A weighted-score mechanism is a wagering
mechanism (Ω,R, Π) associated with a vector of properties
Γ = (Γ1,..., Γk). Here Ω is the space of possible outcomes,
R = (a1,b 1)×···× (ak,bk) where (ai,bi) is an interval of
possible values for Γi, and Π is the vector of payout functions
with the payout to bettor i deﬁned as
Πi(r, m,ω ) =mi
(
1 +s(ri,ω )−
∑
js(rj,ω )mj
∑
jmj
)
wheres is a strictly proper score function for Γ taking values
in the interval [0, 1].
We need to choose s so as verify Equation (1). Fortu-
nately, there already exists a wealth of such functions for
common properties [16]. Savage [14] gives a simple char-
acterization of strictly proper score functions for probabili-
ties and expectations of random variables, and examples of
strictly proper scores for quantiles appear in Gneiting and
Raftery [6]. For example, to elicit the probability of an event
A, one may use the quadratic scores(p,ω ) = 1−(1ω∈A−p)2.
To elicit the median of a continuous variable in the interval
[α,β ], one can use s(m,ω ) = 1 −|m−ω|/(β−α). Ta-
ble 1 gives examples of weighted-score mechanisms to elicit
the probability of a binary event, and the expectation and
median of a continuous random variable.
Weighted-score mechanisms are interesting and valuable
because they satisfy many desirable properties. These are
discussed in detail in the next section. In Section 5, we will
see that the core properties are veriﬁed by the slightly larger
class of weighted-score mechanisms parameterized by the to-
tal money wagered, and that those are the only mechanisms
satisfying these properties.
Note that when one elicits probabilities of a binary event
(when Γ(P ) =P (A) for some eventA), and when all wagers
are equal, payouts are proportional to those given by the
KG-scoring rules [10]. As we shall see in Section 5, the mul-
tiplicative factor, (n− 1)/n when there are n participants,
is necessary to induce sybilproofness.
Weighted-score mechanisms can be used for free forecast-
ing. They reveal truthful predictions of distribution proper-
ties from a group of experts, without requiring any outside
subsidy. Betting is another natural ﬁeld of application. In-
deed, common betting mechanisms are limited in several
ways. For example, parimutuel markets do not work prop-
erly when all bettors agree that one event is much more
likely than its alternatives. These markets are also not ap-
plicable with continuous outcomes, such as date and time.
Besides the limited range of bets allowed prevents the full ex-
ploitation of one’s information. Weighted-score mechanisms
overcome these issues.
4. MECHANISM PROPERTIES
4.1 Desirable Properties
We describe seven desirable properties for wagering mech-
anisms. Denote by M = (R, Ω, Π) a wagering mechanism,
and let Γ be a vector of properties Γ = (Γ 1,..., Γk).
The ﬁrst three properties are adapted from the axioms
proposed by Kilgour and Gerchak [10].
Budget-Balance M is budget-balanced if the market gen-
erates neither proﬁt nor loss, i.e,
∑
i
Πi(r, m,ω ) =
∑
i
mi,
for any vector of reports r, any vector of money wa-
gered m, and any outcome ω.
Anonymity M is anonymous if the payouts do not depend
on the identity of the players. For any permutation σ
of N, any player i, and any outcome ω,
Πi((ri)i∈N,(mi)i∈N,ω ) =
Πσ(i)((rσ−1(i))i∈N, (mσ−1(i))i∈N,ω ) .
Truthfulness M is truthful for Γ when players maximize
their expected payout when reporting true property
values. For any player i, any admissible probability
P , any set of reports of others r−i and any vector of
wagers m,
EP [Πi((r−i, Γ(P )), m,ω )]>E P [Πi((r−i,ri), m,ω )]
is satisﬁed for all ri̸= Γ(P ).
When a player’s expected payout depends both on her own
report and on reports of others, it is natural to interpret
the player’s payment as her performance relative to other
players. The relative performance of a player should increase
either when the player’s absolute performance increases, or
T able 1: Some examples of weighted-score mechanisms.
Space of outcomes: Information elicited: Payout for player i:
Any space Ω Probability of an event A⊂ Ω mi +mi
∑
jmj(1ω∈A−rj)2
∑
jmj
−mi(1ω∈A−ri)2
Ω = [α,β ] Expectation of the outcome mi +mi
∑
jmj(ω−rj)2
(α−β)2 ∑
jmj
−mi
(ω−ri)2
(α−β)2
Ω = [α,β ] Median of the outcome mi +mi
∑
jmj|ω−rj|
|α−β| ∑
jmj
−mi
|ω−ri|
|α−β|
when the absolute performance of another player decreases.
This property is captured by normality.3
Normality A mechanismM is normal if, for any admissi-
ble probability distribution P , if any player i changes
her report, the changes of expected payouts ∆ j, with
respect to P , of any other player j is null or of the
opposite sign of the changes of expected payouts ∆i of
playeri.
In electronic platforms, it is important to prevent players
from manipulating identities. To reﬂect this requirement,
we complement truthfulness bysybilproofness, which ensures
that payouts remain unchanged as a subset of players with
the same reports manipulate user accounts, either by merg-
ing accounts or creating fake identities, or by doing transfers
of wagers between them.
Sybilproofness M is sybilproof if for any subset of players
S⊂ N, for any reports r with ri =rj for i,j ∈S , for
any vectors of wagers m, m′ such that mi = m′
i for
i ̸∈ Sand ∑
i∈Smi = ∑
i∈Sm′
i, the following two
conditions hold.
For alli̸∈S , for all ω,
Πi(r, m,ω ) = Πi(r, m′,ω ) ,
and for all ω,
∑
i∈S
Πi(r, m,ω ) =
∑
i∈S
Πi(r, m′,ω ) .
The next property deals with the participation constraint.
Individual rationality ensures that players get a nonnegative
expected proﬁt with respect to their belief.
Individual Rationality M is individually rational if for
any player i, for any admissible probability distribu-
tion P , for any wager mi > 0, there exists a report r∗
i
such that for any wagers m−i, and reports r−i of other
players, the expected proﬁt of i is nonnegative:
EP [Πi((r−i,r∗
i ), m,ω )−mi]≥ 0
Milgrom and Stokey [12] proved the no-trade theorem which
states that, under certain assumptions, agents should not
trade with each other in a zero-sum market. The no-trade
theorem requires that agents have the same prior, that they
be Bayesian rational (performing Bayesian belief updates),
3Note that individual rationality, truthfulness and budget-
balance do not necessarily imply normality for more than
two players. For example, the mechanism of Section 6.1
veriﬁes all three properties but is not normal.
and that their Bayesian rationality be common knowledge.
Individual rationality as deﬁned above relies on the assump-
tion that players do not satisfy all three conditions required
by the no-trade theorem, thus can serve as a participation
constraint. Indeed, in practice, people do trade in zero-sum
and even negative-sum markets, for example because they
don’t share the same priors, because they are over-conﬁdent
or bounded rational, or because there are noisy traders in
the market.
Our ﬁnal property deals with the connection between wa-
gers and proﬁts. To increase participation incentives and
larger wagers, it is preferable that a player making a pos-
itive expected proﬁt under her own belief makes an even
higher proﬁt by increasing her wager. Similarly, a player
who loses money on expectation should lose even more by
raising her participation level. We call it monotonicity.
Monotonicity M is monotonic if for any playeri, any ad-
missible probability distribution P , any vector of re-
ports r, any vector of wagers m, and any Mi > mi,
either
0 < E P [Πi(r, (m−i,mi),ω )−mi]
< E P [Πi(r, (m−i,Mi),ω )−Mi]
or
0 > E P [Πi(r, (m−i,mi),ω )−mi]
> E P [Πi(r, (m−i,Mi),ω )−Mi] .
4.2 Attributes of weighted-score mechanisms
We show that weighted-score mechanisms satisfy all the
desired properties described above.
Theorem 1. All weighted-score mechanisms are:
1. Budget-balanced,
2. Anonymous,
3. Truthful,
4. Sybilproof,
5. Normal,
6. Individually rational,
7. and Monotonic.
Besides, due to their linear form, weighted-score mechanisms
are also group strategyproof, in the sense that they incen-
tivize honest behavior not only at the individual level but
also at the group level: a group of players maximizes its ex-
pected global payout only when each of its members reports
true property values.
Proof. We prove each property separately as follows..
(1) Budget-Balance For any r, m, and ω,
∑
i
Πi(r, m, ω) =
∑
i
mi +
(∑
i
s(ri, ω)mi
)
−
(∑
i
mi
) ( ∑
j s(rj , ω)mj
∑
j mj
)
=
∑
i
mi .
(2) Anonymity Let σ be any permutation of N. For any
r, m, ω, and i,
Πσ(i)((rσ−1(j))j∈N, (mσ−1(j))j∈N, ω)
= mσ−1(σ(i))
(
1 + s(rσ−1(σ(i)), ω)
−
∑
j s(rσ−1(j), ω)mσ−1(j)∑
j mσ−1(j)
)
= mi
(
1 + s(ri, ω) −
∑
j s(rj , ω)mj
∑
j mj
)
= Π i((rj)j∈N, (mj)j∈N, ω) .
(3) T ruthfulness For any r, m, ω, i, and P ,
EP [Πi(r, m, ω)] = mi
(
1 + EP [s(ri, ω)]
(
1 − mi∑
j mj
)
−
∑
j̸=i EP [s(rj , ω)]mj
∑
j mj
)
.
Since s is strictly proper for Γ, EP [s(ri,ω )] is maximized
only at ri = Γ(P ), so
EP [Πi((r−i, ri), m, ω)] < EP [Πi((r−i, Γ(P )), m, ω)]
for all ri̸= Γ(P ).
(4) Sybilproofness Let r be the common report of all i∈
S. For any i̸∈S ,
Πi(r, m, ω)
= mi (1 + s(ri, ω)
−
∑
j̸∈S s(rj , ω)mj + s(r, ω) ∑
j∈S mj
∑
j̸∈S mj + ∑
j∈S mj
= m′
i (1 + s(ri, ω)
−
∑
j̸∈S s(rj , ω)m′
j + s(r, ω) ∑
j∈S m′
j∑
j̸∈S m′
j + ∑
j∈S m′
j
= Π i(r, m′, ω).
Additionally,
∑
i∈S
Πi(r, m, ω)
=
∑
i∈S
mi (1 + s(r, ω)
−
∑
j̸∈S s(rj , ω)mj + s(r, ω) ∑
j∈S mj
∑
j̸∈S mj + ∑
j∈S mj
=

∑
i∈S
m′
i

 (1 + s(r, ω)
−
∑
j̸∈S s(rj , ω)m′
j + s(r, ω) ∑
j∈S m′
j∑
j̸∈S m′
j + ∑
j∈S m′
j
=
∑
i∈S
Πi(r, m′, ω).
(5) Normality Let ˜ri and ˜r = (r−i, ˜ri) be deﬁned in such
a way that
EP [Πi(˜r, m, ω)] > EP [Πi(r, m, ω)].
Then
EP [s(˜ri, ω)] > EP [s(ri, ω)],
and for j̸=i,
EP [Πj(˜r, m, ω)] − EP [Πj(r, m, ω)]
= − mi∑
j mj
(EP [s(˜ri, ω)] − EP [s(ri, ω)]) < 0.
Similarly, if EP [Πi(˜r, m,ω )] < E P [Πi(r, m,ω )] then
EP [Πj(˜r, m,ω )]−EP [Πj(r, m,ω )] > 0. This proves nor-
mality.
(6) Individual rationality For ﬁxed wagers m and a
probability distribution P , EP [s(ri,ω )] is maximized when
ri = Γ(P ). Thus, EP [s(rj,ω )]≤ EP [s(Γ(P ),ω )] for all j.
We have
∑
j EP [s(rj , ω)]mj
∑
j mj
≤ EP [s(Γ(P ), ω)].
Hence,
EP [Πi(r, m, ω) − mi] = miEP [s(ri, ω)] − mi
∑
j EP [s(rj , ω)]mj
∑
j mj
≥ mi[EP s(ri, ω)] − miEP [s(Γ(P ), ω)]
= 0
when player i reports ri = Γ(P ).
(7) Monotonicity Let ˜si =EP [s(ri,ω )]. Then
EP [Πi(r, m, ω) − mi] = mi
(
˜si −
∑
j ˜sj mj
∑
j mj
)
= ami
mi + b ,
where a = ˜si
∑
j̸=imj− ∑
j̸=i ˜sjmj and b = ∑
j̸=imj.
Because the value of ax/(x +b) is positive and increases
with x when a > 0 and is negative and decreases with x
when a< 0, monotonicity holds.
5. UNIQUENESS OF WEIGHTED SCORE
MECHANISMS
Theorem 1 shows that the family of weighted score mecha-
nisms satisﬁes a number of useful properties. In this section,
we will show that weighted score mechanisms are unique
in this sense. More precisely, weighted score mechanisms,
parameterized by the total money wagered in the common
pool, are the only wagering mechanisms that are simulta-
neously budget-balanced, anonymous, truthful, normal, and
sybilproof.
We start by characterizing the set of all truthful and nor-
mal wagering mechanisms, and progressively add the con-
straints of anonymity, budget-balance, and sybilproofness.
This incidentally proves that the mechanisms introduced by
Kilgour and Gerchak [10] without subsidy are the onlyCom-
petitive Prediction Schemes to be truthful, normal, anony-
mous, and budget-balanced.
In the analysis that follows, we assume that Ω is ﬁnite, and
consider elicitation of a single property Γ (for example, the
probability of a binary event). We assume Γ is continuous
and not locally constant, 4 and denote by (a,b ) the interval
of admissible reports. As in Lambert et al. [11], we deﬁne
a distribution property to be elicitable when there exists a
strictly proper score function for that property. We say that
a function is smooth when it is twice continuously diﬀeren-
tiable. In the sequel of this section, we consider mechanisms
with smooth payouts, and when we refer to the term “wager-
ing mechanism” we always mean “wagering mechanism with
smooth payouts”.
5.1 Characterizing truthful and normal
mechanisms
The ﬁrst characterization lemma shows that any wager-
ing mechanism is truthful and normal when it is additively
separable into strictly proper score functions.
Lemma 1. A wagering mechanism is truthful for Γ and
normal if and only if its payouts are nonnegative and addi-
tively separable in the form
Πi(r, m,ω ) =m +fi,i(ri, m,ω )−
∑
j̸=i
fi,j(rj, m,ω )
where for all i and j, for any ﬁxed value of m, fi,j is a
smooth strictly proper score function for Γ.
The proof will make use of the following lemma, whose
proof is omitted due to lack of space.
Lemma 2. If f : (a,b )n↦→ R is twice continuously diﬀer-
entiable, and if
∂2f(x1,...,x n)
∂xi∂xj
= 0
for all x∈ Rn and all i̸=j, then there exists fi : (a,b )↦→ R
such that
f(x1,...,x n) =
n∑
i=1
fi(xi) .
Proof (Lemma 1). The truthfulness and normality of
any rule of this form follow from the linearity of expecta-
tion and fi,j being strictly proper scores for Γ. It remains
to show that truthful and normal rule must be of this form.
Let n be the number of participating players. Since we
assume the wagers m1,··· ,mn are ﬁxed, we can denote the
payout function for i as Πi(r1,...,r n,ω ) = Πi(r,ω ).
Let Pi be the beliefs of bettor i. By truthfulness,
Γ(Pi)∈ arg maxEPi[Πi(r−i,·,ω )] (2)
for all r−i. By normality, for any k̸=i,
Γ(Pi)∈ arg minEPi[Πj(r−i,·,ω )] . (3)
The ﬁrst order condition in (2) and (3) gives that for all
admissible beliefs Pi, for all k∈{ 1,··· ,n},
∂EPi[Πk(r,ω )]
∂ri
⏐⏐⏐⏐
ri=Γ(Pi)
= 0 .
Applying the same argument to any j̸=i with beliefs Pj
gives us
∂EPj [Πk(r,ω )]
∂rj
⏐⏐⏐⏐
rj=Γ(Pj)
= 0 .
4With respect to the topology considered in Lambert et
al. [11].
We now diﬀerentiate the left side of the these equations
byrj and ri respectively to get
∂2EPi[Πk(r,ω )]
∂ri∂rj
⏐⏐⏐⏐
ri=Γ(Pi)
= ∂2EPj [Πk(r,ω )]
∂rj∂ri
⏐⏐⏐⏐⏐
rj=Γ(Pj)
= 0 .
Now consider admissiblePi,Pj with diﬀerent property val-
ues; in other words, Γ(Pi)̸= Γ(Pj). Since Πk is smooth,
∂2Πk
∂ri∂rj
= ∂2Πk
∂rj∂ri
,
so by linearity of expectation, for all admissible Pi and Pj,
EPi
[
∂2Πk(r,ω )
∂ri∂rj
⏐⏐⏐⏐
ri=Γ(Pi),rj=Γ(Pj)
]
= 0 ,
and
EPj
[
∂2Πk(r,ω )
∂ri∂rj
⏐⏐⏐⏐
ri=Γ(Pi),rj=Γ(Pj)
]
= 0 .
Let r∗
i ̸=r∗
j be admissible reports, and let X be the ran-
dom variable deﬁned by
X(ω) = ∂2Πk(r,ω )
∂ri∂rj
⏐⏐⏐⏐
ri=r∗
i,rj=r∗
j
.
The previous equations says that for all probabilities Pi,Pj
such that Γ(Pi) = r∗
i and Γ(Pj) = r∗
j , we have EPi[X] =
EPj [X] = 0.
Now, Theorem 2 of Lambert et al. [11] shows that elic-
itable properties may be expressed as linear constraints. In
particular, it shows that there exist random variablesYi and
Yj such that
EP [Yi] = 0⇔ Γ(P ) =r∗
i
and
EP [Yj] = 0⇔ Γ(P ) =r∗
j .
Since EP [Yi] = 0 implies Γ( P ) = r∗
i which in turn implies
that EP [X] = 0, it must be the case that X is proportional
toYi. By a similar argument, X must be proportional toYj.
If X is not null, Yi and Yj are proportional, implying that
r∗
i =r∗
j , which is a contradiction. Therefore it must be the
case that X(ω) = 0 for all ω, and for all admissible reports
r∗
i̸=r∗
j ,
∂2Πk(r1,...,r n,ω )
∂ri∂rj
⏐⏐⏐⏐
ri=r∗
i,rj=r∗
j
= 0 .
This remains true when r∗
i =r∗
j by continuity.
By Lemma 2, this implies that there are functions fk,i
such that
Πk(r,ω ) =fk,k(rk,ω )−
∑
i̸=k
fk,i(ri,ω ) .
By truthfulness,fk,k must be a strictly proper score func-
tion for Γ; by normality, for every i̸= k, fk,i must be a
strictly proper score function for Γ.
5.2 Adding Anonymity
With anonymity added, we provide a necessary condition
for the special case of identical wagers.
Lemma 3. If a wagering mechanism is truthful for Γ,
normal, and anonymous, then there exist smooth functions
f and g such that if every player wagers the same amount
m, then for all i the payout to i is
Πi(r, m,ω ) =m +f(ri,m,M,ω )−
∑
j̸=i
g(rj,m,M,ω ) ,
whereM is the total amount wagered. Furthermore, for any
ﬁxed values of m and M, f and g must be strictly proper
score functions for Γ.
The proof, omitted due to space restrictions, is based on
successive use of the anonymity property.
5.3 Adding budget-balance
We now add budget-balance, and easily show the follow-
ing, still considering the special case of identical wagers.
Lemma 4. If a wagering mechanism is truthful for Γ,
normal, anonymous, and budget-balanced, then there ex-
ists a smooth function f such that if every agent wagers the
same amount m, then payouts are
Πi(r, m,ω ) =m+f(ri,m,M,ω )− 1
n− 1
∑
j̸=i
f(rj,m,M,ω ),
whereM is the total amount wagered. Furthermore, for any
ﬁxed values of m and M, f must be a strictly proper score
function for Γ.
The proof can be obtained directly by the application of the
budget-balanced equality.
We can always write payouts as Πi =mi(1 +ρi) for some
functionρi, the Return On Investment (ROI). As we require
nonnegative payouts, the functionf(·,m,M,ω ) takes values
in an interval of length at most m, so that the ROI of any
player in such a mechanism is never higher than 1 when
wagers are identical.
Corollary 1. If a wagering mechanism is budget-
balanced, anonymous, truthful and normal, a player’s ROI
cannot be above 100% when all wagers are identical.
We will see that, adding sybilproofness, this corollary gen-
eralizes to the case of diﬀerent wagers.
Interestingly, when applied to the setting of Kilgour and
Gerchak, our result permits to prove uniqueness of their
scoring rules within the class of Competitive Prediction
Schemes (CPS) [10]. They restrict themselves to the case of
eliciting the probability of a binary event; here we consider
the natural generalization of their setting for the elicitation
of one or more distribution properties. A CPS is essentially
a wagering mechanism without a wager. In a ﬁrst step each
playeri amongn players makes a reportri corresponding to
one or several distribution properties. In a second step, after
the true outcome ω of the uncertain event becomes known,
playeri receives a payment Πi(r1,...,r n,ω ) (which may be
negative). The properties budget-balance, anonymity, truth-
fulness, normality, and individual rationality can be directly
adapted to this setting. The (generalized) Kilgour and Ger-
chak scoring rules, deﬁned by
Πi(r1,...,r n,ω ) =s(ri,ω )− 1
n− 1
∑
j̸=i
s(rj,ω ) ,
where s a strictly proper score function for a vector of
properties Γ, can be shown to be budget-balanced, anony-
mous, truthful, normal, and individually rational (based on
K&G [10] and Theorem 1). Noting that the constraint of
nonnegative payouts plays no role in proving Lemma 1 and 3,
Lemma 4 shows that these scoring rules are the only com-
petitive prediction schemes to satisfy these core properties.
Theorem 2. Given n players, any Competitive Predic-
tion Scheme is budget-balanced, anonymous, truthful for Γ
and normal if and only if the payment of agent i when the
true outcome is ω is given by
s(ri,ω )− 1
n− 1
∑
j̸=i
s(rj,ω ) ,
wheres is strictly proper for Γ.
5.4 Uniqueness of Weighted Score
We now turn to the main theorem.
Theorem 3. A wagering mechanism is budget-balanced,
anonymous, truthful for Γ, normal and sybilproof, if and
only if the payouts are given by
Πi(r, m,ω ) =mi +mi
(
sM(ri,ω )− 1
M
∑
j
mjsM(rj,ω )
)
where M = ∑
jmj, and sM is a smooth function taking
values in [0, 1] that is a strictly proper score function for Γ.
This result allows to complement Corollary 1.
Corollary 2. If a wagering mechanism is budget-
balanced, anonymous, truthful, normal, and sybilproof, a
player’s ROI is never above 100%.
Proof (Theorem 3). The proof of Theorem 1 may be
applied directly to show that weighted score mechanisms
satisfy these properties. Here we show the other direction.
The proof proceeds in three steps below.
To start, suppose that there are n players wagering the
same amount m, and let M =nm be the total amount wa-
gered. Since the wagers are identical, we know that the pay-
out function takes the special form given in Lemma 4. Let
˜f(r,m,M,ω ) be the functionf given by this lemma. Fix any
possible report r0 and let f(r,m,M,ω ) = ˜f(r,m,M,ω )−
˜f(r0,m,M,ω ), then
Πi(r, m,ω )
= m +f(ri,m,M,ω )− 1
n− 1
∑
j̸=i
f(rj,m,M,ω ), (4)
and f(r0,m,M,ω ) = 0 for all m,M,ω .
In the ﬁrst step, we start with this equation and show that
it is possible to create a functions such that for any positive
integersk and n,
s
(
r,ω, n
2k
)
= 2k n
n− 1f
(
r, 1
2k, n
2k,ω
)
. (5)
In the second step, we show that for any number of play-
ers n, any set of reports r, and any set of (not necessarily
identical) wagers m, we can write the payout to player i as
Πi(r, m,ω )=mi
(
1+s(ri,ω,M )−
∑
jmjs(rj,ω,M )
M
)
(6)
where M = ∑
imi and s is the function deﬁned in Step 1.
Finally, in Step 3, we show that the function s can be
written as a strictly proper score function taking values in
[0, 1], completing the proof. More details on each step follow.
Step 1:
Let (a,b ) be the interval of possible reports. We begin by
showing how to create a function s : (a,b )× Ω× R+↦→ R
that satisﬁes Equation (5) for any positive integers k and
n. To do so, we consider z groups of 2ℓ players, for some
ℓ >0. Every player in each of the groups wagers 1 /(2k+ℓ).
In the ﬁrst group, each player reports r, while in the other
groups, each player reports r0. By summing over the value
of Equation (4) for each member of the ﬁrst group, we see
that the aggregate payout for the ﬁrst group is
1
2k + 2ℓ
(
1− 2ℓ− 1
z· 2ℓ− 1
)
f
(
r, 1
2k+ℓ, z
2k,ω
)
. (7)
Now consider an alternate situation in which a single
player wagers 1/2k and reportsr againstn−1 other players,
each wagering 1/2k and reporting r0. By Equation (4), the
payout of the ﬁrst player in this scenario is
1
2k +f
(
r, 1
2k, n
2k,ω
)
. (8)
By sybilproofness, Equation (7) must equal Equation (8)
when the number of groupsz isn. Hence by simple algebra,
2k
(n− 2−ℓ
n− 1
)
f
(
r, 1
2k, n
2k,ω
)
= 2 k+ℓf
(
r, 1
2k+ℓ, n
2k,ω
)
. (9)
Now, since
lim
ℓ→+∞
2k
(n− 2−ℓ
n− 1
)
= 2k
( n
n− 1
)
,
it must be the case that the limit of the right-hand side of
Equation (9) exists. Thus there exists a function s : (a,b )×
Ω× R+↦→ R such that
s
(
r,ω, n
2k
)
= lim
ℓ→+∞
2k+ℓf
(
r, 2−(k+ℓ), n
2k,ω
)
.
Plugging this into Equation (9) yields Equation (5).
Step 2:
Using the previous result, we now show that for any num-
ber of players n, for any reports and (not necessarily iden-
tical) wagers, the payout to each player i can be expressed
as in Equation (6). To do so we use a continuity argument
applied to an approximation of the payouts. In particular,
we assume that the vector of wagers belongs to the set
M ={(a12−k,...,a n2−k)/a∈ Nn,k∈ N} .
While this assumption does restrict the set of possible wa-
gers, we note that because M is dense in Rn
+, it is the case
that for any positive vector of wagersm, there exist elements
ofM arbitrarily close to m. Thus any vector of wagers can
be approximated arbitrarily well using a vector in M.
Now, given a vector of wagers m∈M , there clearly exist
a vector of integersa and a valuek> 0 such thatmi =ai/2k
for all i. Let N = ∑
iai. To obtain the vector of payouts
Π(r, m,ω ), we compare the present scenario with another
in which there are N players divided into n groups. Each
groupi containsai players, each wagering 1/2k on reportri.
By Equation (4) and (5) the aggregate payout of group i in
this alternate scenario is
ai
2k +ai
( (
1− ai− 1
N− 1
)
f
(
ri, 1
2k, N
2k,ω
)
− 1
N− 1
∑
j̸=i
ajf
(
rj, 1
2k, N
2k,ω
) )
= ai
2k +ai
(
N−ai
2kN s(ri,ω,M )
−
∑
j̸=i
aj
2kNs(rj,ω,M )
)
= ai
2k
(
1 +s(ri,ω,M )−
∑
j
aj
Ns(rj,ω,M )
)
= mi
(
1 +s(ri,ω,M )− 1
M
∑
j
mjs(rj,ω,M )
)
.
By sybilproofness, this quantity is precisely Π i(r, m,ω ),
the payout of player i in the initial scenario with n players.
Thus since the set M is dense in Rn
+, by continuity of the
payout functions, for all m∈ Rn
+, Equation (6) holds.
Step 3:
It remains to show that the payout can always be writ-
ten as in Equation (6) using a function s that is a score
function taking values in [0, 1]. First, notice that s(·,ω,M )
must be bounded, since payouts are always nonnegative. Let
L(ω,M ) = inf s(·,ω,M ), and let ˜s(r,ω,M ) = s(r,ω,M )−
L(ω,M ). Note that we can write
Πi(r, m,ω ) =mi +mi
(
˜s(ri,ω,M )−
∑
jmj˜s(rj,ω,M )
M
)
.
Consider the scenario in which there are only two players,
one wageringϵ and reportingr, and the other wageringM−ϵ
and reporting r′. The payout of the ﬁrst player is
ϵ
[
1 + ˜s(r,ω,M )− ϵ˜s(r,ω,M ) + (M−ϵ)˜s(r′,ω,M )
M
]
≥ 0 .
Since inf ˜s(·,ω,M ) = 0, for all r′,
1− (M−ϵ)˜s(r′,ω,M )
M ≥ 0 ,
and, by taking the limit as ϵ→ 0, for all r′,
˜s(r′,ω,M )≤ 1 .
Therefore ˜s takes values in [0, 1]. The requirement of truth-
fulness implies that, for allM >0, ˜s(·,·,M ) is strictly proper
for Γ, which concludes the proof.
6. EXTENSIONS
We now present several extensions of the weighted-
score mechanisms, each of which achieves properties that
weighted-score does not at the expense of other properties.
6.1 Adaptive weighted-score
One major diﬃculty encountered in designing score func-
tions is that of incentive calibration: scores should vary the
most in regions that are more likely to contain the true prop-
erty value [14, 16]. As an example, consider designing a score
function to collect reports about expected points in sports
games. Without precise knowledge of the teams, the game,
and its statistics, one must consider a large interval of possi-
ble point values. Yet informed forecasters are likely to report
points within a small window. This mismatch induces small
reward diﬀerences amongst forecasters. It also reduces in-
centives for agents to reveal their own belief with precision.
However given expert advice limiting the plausible property
values in advance, a score function with a large reward range
for forecasters can be created.
The problem of properly adjusting score functions is par-
ticularly important for the weighted-score mechanism. In-
deed, if score diﬀerences are small, the amplitude of money
transfers between participants is likely to be considerably
lower than initial wagers, thereby reducing incentives to par-
ticipate.
We propose of a variant of weighted-score mechanism with
self-adjusting score functions. To do this, consider a de-
composition of the initial game into multiple, smaller games
where only half of the players participate with a small frac-
tion of their wagers. For each of these games, the payouts
are computed according to a weighted-score payout function
whose score functions are parameterized by sets of property
values. This set, sent from the other half of the players,
provides very accurate information about the regions where
most reports are made. In any of the smaller games, players
who participate do not inﬂuence the shape of the payout
function, so that truthfulness remains true, although sybil-
proofness is lost.
We now give the formal deﬁnition. Given a set ofn players
N , we consider the set of groups of players of size⌈n/2⌉,S =
{A⊆N /|A| =⌈n/2⌉}, andSi the set of sets ofS containing
i. For any set of property values R (provided, for examples,
by experts as likely property values), let sR be a strictly
proper score function for Γ. Let m′
i =mi/|Si| be the wager
of playeri in each “small game”. We call adaptive weighted-
score mechanism a wagering mechanism whose payouts are
Πi(r, m,ω ) =mi+
∑
S∈Si
m′
i
[
s{rℓ/ℓ∈N\S}(ri,ω )
−
∑
j∈Sm′
js{rℓ/ℓ∈N\S}(rj,ω )∑
j∈Sm′
j
]
Compared to the original weighted-score mechanism, this
variant loses normality and sybilproofness, but maintains
the other properties. 5
Theorem 4. Adaptive weighted-score mechanisms are
budget-balanced, anonymous, truthful, individually ratio-
nal and monotonic.
6.2 Higher stakes
The notion of “bettingm dollars” is commonly interpreted
as placing a bet such that, in the worst case, m dollars will
be lost. In the weighted-score mechanisms discussed here,
5Theorem 4, 5 and 6 may be proved in a similar fashion as
Theorem 1. We omit the proofs due to space restrictions.
players may not be able to lose their entire wager, no matter
what the other players do. Indeed, when a player reports a
value that does not minimize the score function, no mat-
ter what the outcome, they are guaranteed to recoup part
of their wager. An important case is that of eliciting the
probability of a binary event: Theorem 3 demonstrates that
these “low stakes” are true for any mechanism having the
core properties; any player announcing a probability other
than 0 or 1 is certain to recoup part of her wager. Random-
ization can address this drawback.
Let Γ = (Γ 1,..., Γk) be a vector of distribution proper-
ties, s be strictly proper for Γ, and ˜ s be proper (but not
necessarily strictly proper), that is,
EP [˜s(r,ω )]≤EP [˜s(Γ(P ),ω )]
for all admissible reports r and probabilities P .
Consider computing the payout function as follows. First,
ﬂip a coin. If the coin is heads, then for all i,
Πi(r, m,ω ) =mi +mi
(
s(ri,ω )−
∑
js(rj,ω )mj
∑
jmj
)
.
Otherwise, for all i,
Πi(r, m,ω ) =mi +mi
(
˜s(ri,ω )−
∑
j ˜s(rj,ω )mj
∑
jmj
)
.
Randomization is equivalent to inserting a factor in the
outcome space, using Ω′ = Ω×{H,T}, where{H,T} is the
outcome space for the coin ﬂip. As long as the probabili-
ties of heads and tails are strictly positive, the randomized
mechanism conserves all of the properties of weighted-score
wagering.5
Theorem 5. The randomized weighted-score mechanism
is budget-balanced, anonymous, truthful, individually ra-
tional, sybilproof, normal and monotonic.
If the alternative score only takes extreme values, a player
can always lose her wager.6 In the case of eliciting the prob-
ability of an event, one may choose
˜s(p,ω ) =
{
1 if |p−ω|≤ 1
2 ,
0 otherwise.
6.3 Higher ROI
By Corollaries 1 and 2, no wagering mechanism satisfy-
ing the core properties can result in returns on investment
higher that 100%. This contrasts with most betting mar-
kets, wherein players may win several times their wager by
betting on a very unlikely outcome. To solve this, one may
use parimutuel-score mechanisms, where payouts are com-
puted according to
Πi(r, m,ω ) = mis(ri,ω )∑
jmjs(rj,ω )
∑
j
mj
where s is a strictly proper score function for Γ.
Parimutuel-score mechanisms are very similar to certain
mechanisms introduced by Johnstone [8] and may be used in
the same context. Like horse-race type parimutuel betting
markets, parimutuel-score schemes have unbounded return
on investment. They conserve several desirable properties. 5
6At the limit as the total wager of other players grows.
Theorem 6. Parimutuel-score mechanisms are budget-
balanced, anonymous, sybilproof and monotonic.
However, they are not truthful, not individually rational and
not normal . They may be considered as approximately
truthful in many practical situations: indeed, asymptotically
as the number of players grows, a player tends to lose inﬂu-
ence over the denominator of the payout function. The pay-
out then becomes proportional to the strictly proper score
function s, which ensures truthfulness.
7. CONCLUSION
We have investigated wagering mechanisms for revealing
individual predictions from a group of agents. Agents are
called to report on some information about some random
experiment. Along with their report, they place a wager in a
common pot. Upon realization of the experiment, agents re-
ceive a payment that depends on the true outcome and their
own report. Payments are composed of a share of the com-
mon pot and possibly bonuses or taxes/fees. These mech-
anisms include many instances of common betting markets
and call markets.
We have identiﬁed a particular subclass of such mecha-
nisms called weighted-score mechanisms. Those novel elici-
tation schemes provide free individual forecasts of distribu-
tion properties, such as probabilities of binary events, or ex-
pectations and quantiles of random variables. They satisfy
a number of desirable properties, including budget-balance,
anonymity, truthfulness, normality, sybilproofness, individ-
ual rationality, and monotonicity.
Furthermore, we have showed that weighted-score mech-
anisms, parameterized by the total money wagered, are
the only mechanisms that are budget-balanced, anonymous,
truthful, normal, and sybilproof. In addition, we have
proved that the Kilgour and Gerchak’s scoring rules are the
only forecasting methods to satisfy the core properties (for
the setting considered in [10]).
We have explored variants of weighted-score mechanisms
that conserve many desirable properties, and improve the
core mechanism in several ways, by oﬀering adaptive re-
wards, higher stakes, and unbounded returns on investment.
Our theoretical investigation leaves several open paths for
future research. An important question, not addressed in
the present work, is that of empirical studies. How do our
mechanisms perform in a realistic environment? How do
people behave when faced with a weighted-score mechanism
or one of its variants? Also, our paper concentrated on one-
shot mechanisms. A natural important step is to introduce
dynamism: can we develop similar mechanisms – and similar
characterizations – when adding a time dimension? In par-
ticular, is it possible to conserve truthfulness (and so avoid
bluﬃng strategies), and incentivize agents to reveal their
prediction early? This would permit to elicit at all times
individual beliefs of agents, and watch their aggregation.
Acknowledgments
The authors would like to thank Esteban Arcaute, Alina
Beygelzimer, Preston McAfee, Bethany Soule and Yevgeniy
Vorobeychik for helpful discussions and suggestions, and the
anonymous reviewers for their useful comments.
8. REFERENCES
[1] M. Ali. Probability and Utility Estimates for
Racetrack Bettors. The Journal of Political Economy ,
85(4):803–815, 1977.
[2] Y. Chen, L. Fortnow, E. Nikolova, and D. Pennock.
Betting on permutations. Proceedings of the 8th ACM
Conference on Electronic Commerce, pages 326–335,
2007.
[3] Y. Chen, D. Reeves, D. Pennock, R. Hanson,
L. Fortnow, and R. Gonen. Bluﬃng and strategic
reticence in prediction markets. In WINE, pages
70–81, 2007.
[4] N. Economides and J. Lange. A Parimutuel Market
Microstructure for Contingent Claims Trading.
European Financial Management, 11(1):25–49, 2005.
[5] L. Fortnow, J. Kilian, D. Pennock, and M. Wellman.
Betting Boolean-style: a framework for trading in
securities based on logical formulas. Decision Support
Systems, 39(1):87–104, 2005.
[6] T. Gneiting and A. Raftery. Strictly proper scoring
rules, prediction and estimation. Journal of the
American Statistical Association, 102(477):359–378,
2007.
[7] R. Hanson. Combinatorial Information Market Design.
Information Systems Frontiers, 5(1):107–119, 2003.
[8] D. Johnstone. The Parimutuel Kelly Probability
Scoring Rule. Decision Analysis, 4(2):66, 2007.
[9] C.-H. Kehr, J. P. Krahnen, and E. Theissen. The
anatomy of a call market. Journal of Financial
Intermediation, 10(3-4):249–270, 2001.
[10] D. Kilgour and Y. Gerchak. Elicitation of
Probabilities Using Competitive Scoring Rules.
Decision Analysis, 1(2):108–113, 2004.
[11] N. Lambert, D. Pennock, and Y. Shoham. Eliciting
Properties of Probability Distributions. Proceedings of
the 9th ACM Conference on Electronic Commerce ,
2008.
[12] P. Milgrom and N. Stokey. Information, trade, and
common knowledge. Journal of Economic Theory ,
1982.
[13] M. Peters, A. Man-Cho So, and Y. Ye. Pari-mutuel
markets: Mechanisms and performance. In WINE,
pages 82–95, 2007.
[14] L. Savage. Elicitation of Personal Probabilities and
Expectations. Journal of the American Statistical
Association, 66(336):783–801, 1971.
[15] R. H. Thaler and W. T. Ziemba. Anomalies:
Parimutuel betting markets: Racetracks and lotteries.
Journal of Economic Perspectives , 2(2):161–174, 1988.
[16] R. Winkler, J. Mu˜ noz, J. Cervera, J. Bernardo,
G. Blattenberger, J. Kadane, D. Lindley, A. Murphy,
R. Oliver, and D. R´ ıos-Insua. Scoring rules and the
evaluation of probabilities. TEST, 5(1):1–60, 1996.
[17] J. Wolfers and E. Zitzewitz. Prediction Markets. The
Journal of Economic Perspectives , 18(2):107–126,
2004.
[18] J. Wolfers and E. Zitzewitz. Prediction Markets in
Theory and Practice. Working paper, 2006.
