arXiv:2407.14485v3  [cs.GT]  29 May 2025
On Sybil-Proof Mechanisms
Minghao Pan1, Bruno Mazorra2, Christoph Schlegel3, and Akaki Mamageishvili4
1California Institute of Technology
4Offchain Labs
1,2,3Flashbots
Abstract
We show that in the single-parameter mechanism design environment, the only
non-wasteful, symmetric, incentive compatible and Sybil-proof direct mechanism is a
second price auction with symmetric tie-breaking. Thus, if there is private information,
lotteries or other mechanisms that do not always allocate to a highest-value bidder
are not Sybil-proof or not incentive compatible. Moreover, we show that our main
(im)possibility result extends beyond linear valuations, but not to multi-unit object
allocation with capacity constrained bidders.
We also provide examples of mechanisms (with higher interim payoff for the bidders
than a second price auction) that satisfy all of the other axioms and a weaker, Bayesian
notion of Sybil-proofness. Thus, our (im)possibility result does not generalize to the
Bayesian setting and we have a larger design space: With Sybil constraints, equivalence
between dominant strategy and Bayesian implementation (that holds in classical single-
parameter mechanism design without Sybils) no longer holds.
Introduction
In environments where creating new identities is cheap or free and verifying participants’
identities is hard, mechanism design must consider the possibility that a participant creates
multiple identities to secure a better outcome from the mechanism. Such manipulation of
a mechanism is commonly referred to as a Sybil attack and a mechanism that is immune
to such attacks is called Sybil-proof.
When allocating private goods, a natural choice of a Sybil-proof mechanism is an auc-
tion that assigns (all units of) the good to the highest-value bidder(s). However, pure
auctions may be undesirable if we aim to ensure fairness, wider participation, or other dis-
tributional goals: In blockchain systems, for example, randomness in allocating the right
to propose blocks is desirable to avoid power concentration, which could lead to censorship
and undermine decentralization. Bitcoin’s proof-of-work mechanism in particular, which
uses pseudorandomness in proposer selection, has been argued to be an effective method to

achieve decentralization of the system by having many different actors “mining” blocks.1
This assessment can, however, change if there is significant heterogeneity in value for pro-
posal rights, as we further discuss below.
As another example, in the case of online sales of event tickets, tickets are often sold
at a relatively low price where there is still excess demand. The “under-pricing” of tickets
is a way for the event organizers to give dedicated fans with smaller budgets a chance to
participate, yet this also makes the primary sale a target for middlemen that resell tickets
with a premium on a secondary market (Budish and Bhave, 2023). If quantities of tickets
per buyer are capped, middlemen effectively achieve this by using Sybils in the primary
sale.2
Given these considerations, it is natural to ask whether there are Sybil-proof mecha-
nisms for assigning private goods other than auctions. Our main result, Theorem 1, we give
a strong negative answer to this question: in the classical Myersonian mechanism design
setting with quasi-linear preferences and one-dimensional types, we show that the only
monotonic, symmetric, and non-wasteful allocation rule for which the induced mechanism
with “Myerson payments”3 is Sybil-proof, is the rule that allocates everything to the high-
est value bidder, breaking ties uniformly (if the good is indivisible), resp. sharing the unit
equally among highest value bidders (if the good is divisible). Thus, while there is a large
design space of monotonic allocation rules - as two extreme cases we could assign the good
with equal probability (with equal shares), independently of value, among participants or
we could always assign the good to the highest value bidder - adding Sybil-proofness col-
lapses the set of implementable allocation rule to a single one. The result extends beyond
linear valuation (Theorem 3), but interestingly not to the multi-unit case with unit-demand
bidders (Proposition 4).
While our main (impossibility) theorem is formulated for direct mechanism that elicit
values from the participants, indirect mechanism cannot circumvent the impossibility, as
we have a version of the revelation principle in the presence of Sybils (Proposition 1): for
every symmetric indirect mechanism with Sybils that implements an objective function in
dominant strategies, the direct mechanism induced by the objective function is Sybil-proof
and incentive compatible. Similarly, we can formulate a revelation principle for Bayesian
1The proof-of-work mechanism of Bitcoin is a particular instance of a proposer selection mechanism that
assign the right to propose the next block with probability proportional to effort (of mining). Similarly, in
proof-of-stake systems, proposal rights are usually assigned through a lottery with chances proportionally
to stake. Proportional selection mechanisms have in this context been characterized by Sybil-proofness,
Symmetry, Non-wastefulness, and Collusion-proofness (Chen et al., 2019; Leshno and Strack, 2020). Under
this mechanism, one’s chance of winning depends, however, on others’ effort. Thus, the mechanism fails to
be incentive compatible.
2Related issues also appear in crypto-currency “airdrops” where protocols want to reward early adopters
with tokens, see (Messias et al., 2023), and the use of non-proportional rules, has lead to wide-spread exploits
through Sybils who afterwards sell their airdrop on a secondary market.
3By the classical work of Myerson (Myerson, 1981), we know that if we want to achieve incentive
compatibility of a mechanism in this environment, we can use any monotonic allocation rule together with
payments defined in the particular manner specified in “Myerson’s lemma”.

instead of dominant strategy implementation (Proposition 2).
One way out of our impossibility result is to move to the Bayesian setting. Instead
of the strong ex-post requirement of Sybil-proofness, we could demand that no bidder
can gain from introducing additional Sybils in equilibrium, provided all other bidders
truthfully report their valuations and do not use Sybils. In this weaker setting, we establish
that there are indeed mechanisms which are non-wasteful, symmetric, Bayesian incentive-
compatible, and Bayesian Sybil-proof —yet they do not always allocate to the highest
bidder. Specifically, we give two examples that suggest a specific way of constructing such
mechanisms: The first mechanism allocates the object through a lottery when there are
few bidders and through an auction otherwise. The second mechanism allocates the object
through a lottery among high value bidders above a threshold (and through an auction
if there are no high value bidders). Thus, under Sybil-constraints and in contrast to the
classical mechanism design setting without Sybils, Bayesian implementation is strictly weak
than dominant strategy implementation and allows for a larger design space.
1.1
Related Work and Implications
Sybil-proof mechanisms have been studied in various contexts, including voting systems (Wag-
man and Conitzer, 2008), combinatorial auctions (Yokoo et al., 2004; Gafni et al., 2020a;
Gafni and Tennenholtz, 2023), recommender systems (Brill et al., 2016) and blockchain sys-
tems (Chen et al., 2019; Leshno and Strack, 2020), and different Sybil-proof mechanisms4
have been discussed in these contexts. Most related to our work, (Yokoo et al., 2004) prove
that there is no Pareto-efficient, false-name-proof combinatorial auction. We do not require
Pareto efficiency, as we are primarily interested in whether non-trivial distributional goals
can be achieved. However, it is as a consequence of our theorem that the combination of
Non-wastefulness, Sybil-proofness and Incentive Compatibility implies Pareto-efficiency.
Our results also relate to the literature on mechanism design with one-dimensional
types.
In the case without Sybils, for one-dimensional types Dominant-Strategy- and
Bayesian Incentive compatibility are equivalent in the sense that for each Bayes-Nash IC
mechanism one can construct a Dominant-Strategy IC mechanism that gives each partici-
pant the same interim expected pay-off (Manelli and Vincent, 2010; Gershkov et al., 2013).
We show that the statement is no-longer true with additional Sybil-proofness constraints
and dominant-strategy implementation is strictly stronger than Bayes-Nash implementa-
tion in the presence of Sybils.
The implications of our impossibility result are significant, particularly for block pro-
poser rights selection in blockchain systems: Assigning chances of proposing blocks pro-
portionally (to work, stake or bids), as is usually done in practice and theoretically recom-
mended (Chen et al., 2019; Leshno and Strack, 2020), is a reasonable solution if the value
of the proposal right is the same to everyone and is commonly known. However, in reality,
4Previously literature also used the term false-name proof mechanisms for a stronger notion than the
one we use in this paper.

heterogeneous (and private) value is a concern, as different participants can generate differ-
ent values from proposal rights. For example, some block proposers have exclusive access
to some of the submitted transactions to include in their block, as documented in (¨Oz et al.,
2024) for the case of Ethereum. In practice, this had led to the creation of out-of-protocol
secondary market for the content of blocks, and these markets exhibit a high degree of
market concentration in the hand of few block builders (¨Oz et al., 2024); in other words,
empirically the assertion of a “monopoly without monopolist” (Huberman et al., 2021)
does not really hold. Our results indicate that this is not only a problem of this partic-
ular (indirect) mechanism but any Sybil-proof proposer assignment mechanism if there is
significant heterogeneity in the value of block proposal rights. Similar but different impos-
sibility results also occur if one considers collusion resistance instead of Sybil resistance
as a desideratum. For transaction fee mechanisms, for example, (Gafni and Yaish, 2024)
show that there is no non-trivial mechanism that satisfies constant probability allocation,
incentive compatibility, miner incentive compatibility and collusion resistance.
Model and Result
We consider mechanisms with a variable population of bidders: A (direct) mechanism5
specifies for each finite N ⊂N set of bidders (some of them real agents, some of them,
possibly, Sybils), an allocation rule xN : RN
+ →∆(N) where ∆(N) := {x ∈RN
+ :
P
i∈N xi ≤1} and a payment rule pN : RN
+ →RN . In the following, we will often omit
the superscript N when there is no ambiguity.
We can interpret the allocation shares
xN
i (v) for the reported values6 v ∈RN
+ either as probabilities of obtaining an indivisible
good or as an allocation of a perfectly divisible good of which one unit is distributed in
total. A bidder i with value vi ≥0 has a linear utility
Ui(xi, pi) = vixi −pi
if allocated a share xi and making a payment of pi.
In the following, for the payment rule we require that bidders who do not derive value
from the item do not need to pay,7 i.e. for each finite N ⊆N, bidder i ∈N and values
v−i ∈RN\{i}
+
we have
pN
i (0, v−i) = 0.
(1)
5Focusing on direct mechanism, where participants report their value to the mechanism which deter-
mines an allocation from the reports is without loss of generality by the revelation principle. For more
context, we provide a revelation principle in the presence of Sybils in Section 2.1. Technical details on
indirect mechanisms can be found in Appendix.
6We work with the non-negative reals as type space. Alternatively, we could also work with an interval
[0, ¯v] as type space and obtain the same characterization result with completely analogous proofs.
7If we do not make this assumption, our results would hold up to adding constants to payments.

Next, we introduce several axioms that the mechanisms should satisfy. First, we want
the allocation rule to always allocate the whole unit.
Non-wastefulness: For each finite N ⊂N set of agents and v ∈RN
+ we have
X
j∈N
xN
j (v) = 1.
Second, we want the allocation rule to treat agents symmetrically:
Symmetry: For each finite N ⊂N set of agents, v ∈RN
+ , permutation π : N →N and
each j ∈N we have
xN
j (v) = xN
π(j)({vπ(i)}i∈N ).
Third, we want the mechanism to be dominant strategy8 incentive compatible:
Incentive Compatibility: For each v ∈RN
+, each finite N ⊂N set of agents, each agent
i ∈N and bid ui ≥0 we have
vixN
i (v) −pN
i (v) ≥vixN
i (ui, v−i) −pN
i (ui, v−i).
As known from classical results (Myerson, 1981), this is equivalent to using “Myerson
payments”,
pj(v) := vj · xj(vj, v−j) −
Z vj
0
xj(z, v−j)dz,
(2)
and requiring the axiom of
Monotonicity: For each finite N ⊂N set of agents, the function xN is non-decreasing on
its domain.
Fourth, we want the mechanism to be Sybil-proof. Previous literature has used the
term “false-name-proof” rules, (Yokoo et al., 2004), but usually for the combination of
incentive compatibility and Sybil-proofness, which requires immunity to deviations where
the bidder reports a different value and creates Sybils. For our result a weaker notion
of Sybil-proofness is needed, which only requires immunity to Sybil attacks where a bid-
der reports truthfully from his original account and creates one Sybil with an arbitrary bid:
Sybil-proofness: For each v ∈RN
+, each finite N ⊂N, i ∈N, j ∈N \ N and bid u ≥0,
we have
8It is well-known that for the single-parameter setting a Bayesian incentive compatible mechanism exists
if and only if a dominant strategy incentive compatible mechanism exists for the same allocation rule so
that dominant strategy incentive compatibility is not really a stronger property.

vixN
i (v) −pN
i (v) ≥vi

xN∪{j}
i
(v, u) + xN∪{j}
j
(v, u)

−pN∪{j}
i
(v, u) −pN∪{j}
j
(v, u).
2.1
The Revelation Principle for Sybils
In principle, it might not be bad in itself that participants in a mechanism use Sybils, as
long as the mechanism achieves good outcomes. However, it turns out that the possibil-
ity to Sybil fundamentally constrains what outcomes can be achieved by any mechanism.
This is a variant of the ”revelation principle”. If an arbitrary symmetric indirect mecha-
nism implements an objective in such a way that bidders might use Sybils as part of their
strategies, then there is necessarily a corresponding direct mechanism achieving the same
objective in a Sybil-proof way. For the technical definition of a symmetric indirect mech-
anism (M, x, p), its extensions with Sybils ( ˜
M, ˜x, ˜p) and the notion of ”implementation”
see the Appendix. The principle can be summarized in the following proposition which is
similar to an observation by (Yokoo et al., 2004):
Proposition 1 (Revelation Principle for Sybils in Dominant strategies). Let (M, x, p)
be a symmetric mechanism and ( ˜
M, ˜x, ˜p) be the corresponding mechanism with Sybils. If
( ˜
M, ˜x, ˜p) implements an objective function in weakly dominant strategies, then the direct
mechanism induced by the objective function is Sybil-proof and incentive compatible.
An analogous result also holds for Bayes-Nash equilibria for the Bayesian setting and
the Bayesian Sybil-proofness notion that we will introduce later. As far as we know, this
version of a Revelation Principle is new and has not been formulated in previous literature.
Proposition 2 (Revelation Principle for Sybils for Bayes-Nash equilibrium). Let (M, x, p)
be a symmetric mechanism and ( ˜
M, ˜x, ˜p) be the corresponding mechanism with Sybils.
If ( ˜
M, ˜x, ˜p) implements an objective function in Bayes-Nash equilibrium, then the direct
mechanism induced by the objective function is Bayesian incentive compatible and Bayesian
Sybil-proof.
The revelation principle allows us to focus on direct mechanisms that are IC and Sybil-
Proof subsequently.
2.2
Characterization Result
We now show that the only direct mechanism that satisfies all of the above axioms is a
second-price auction.
Theorem 1. A direct mechanism is non-wasteful, symmetric, incentive compatible, and
Sybil-proof if and only if it is a second price auction with symmetric tie-breaking.

Proof. By Myerson’s lemma, the payments that implement the rule in dominant strategies
are defined by Equation (2). Subsequently, we will use the following two facts about the
payments: first they make participation individually rational,
pj(v) ≤vj · xj(v),
for any v ∈RN
+ , which is implied from (1), and second the payoff of a bidder j whose value
is vj and bids truthfully when the other bidders bid v−j is
Uj(v) := vj · xj(vj, v−j) −pj(v) =
Z vj
0
xj(z, v−j)dz.
(3)
In the following, we show three lemmas that will be used for the proof of the theorem.
The first lemma says that, when there are many bidders that bid the same value, one
bidder bidding higher will almost certainly get the good.
Lemma 1. For any u > v, u, v ∈R+, we have
lim sup
n
x1∪{2,...,n}
(u, v[2,n]) = 1.
Proof. Suppose that the value of Bidder 1 is u and that the values of all other n−1 bidders
are v. Bidder 1 could deviate by bidding u from his original account and creating a Sybil
that bids v. By Symmetry and Non-wastefulness, the Sybil account has a chance of
xn+1(u, v[2,n+1]) = 1
n

1 −x1(u, v[2,n+1])

to win the lottery. The payment from the Sybil account is at most v · xn+1(u, v[2,n+1]), by
individual rationality. In order to prevent Bidder 1 from this deviation, we must have
U1(u, v[2,n])
≥
U1(u, v[2,n+1]) + (u −v)xn+1(u, v[2,n+1])
=
U1(u, v[2,n+1]) + (u −v) 1
n

1 −x1(u, v[2,n+1])

,
(4)
where the first inequality is implied from (3) and properties of the integral.
By a straightforward induction on n, we have
U1(u, v) ≥(u −v)
∞
X
n=2
n

1 −x1(u, v[2,n+1])

.
Suppose by contradiction that lim supn x1(u, v[2,n]) < 1, then there exists N large and a > 0

small such that for any n > N, x1(u, v[2,n]) < 1 −a. Hence,
U1(u, v)
≥
(u −v)
∞
X
n=2
n

1 −x1(u, v[2,n+1])

≥
(u −v)
∞
X
n=N
n

1 −x1(u, v[2,n+1])

≥
(u −v)
∞
X
n=N
a
n
=
∞,
which is impossible. We can conclude that lim supn x1(u, v[2,n]) = 1.
We then lower bound the expected payoff of the higher value bidder when there are
two bidders.
Lemma 2. U1(u, v) ≥u −v if u > v, u, v ∈R+.
Proof. Fix ε ∈(0, u −v) small. Equation (4) implies, U1(u, v) ≥U1(u, v[2,n]) for any n ≥2
and Equation (3) together with the monotonicity of x implies
U1(u, v[2,n])
=
Z u
0
x1(z, v[2,n])dz
≥
Z u
v+ε
x1(z, v[2,n])dz
≥
(u −v −ε)x1(v + ε, v[2,n]).
Taking lim supn on both sides and using Lemma 1, we get
U1(u, v) ≥lim sup
n
U1(u, v[2,n]) ≥(u −v −ε).
As ε > 0 is arbitrary, we arrive at
U1(u, v) ≥u −v.
Next, we show that the utility of a bidder is (weakly) decreasing in the bid of the other
bidder.
Lemma 3. For a fixed u ≥0, the function v 7−→U1(u, v) is decreasing in [0, u].

Proof. Let v1 > v2. Then by Equation (3) and monotonicity,
U1(u, v1) =
Z u
0
x1(z, v1)dz =
Z u
0
(1 −x2(z, v1))dz ≤
Z u
0
(1 −x2(z, v2))dz = U1(u, v2).
We then fix u as the value of Bidder 1 and draw the value of Bidder 2 from the uniform
distribution between 0 and u. The expected utility of Bidder 1 is
u
Z u
v=0
U1(u, v)dv = 1
u
Z u
v=0
Z u
z=0
x1(z, v)dzdv = 1
u
Z Z
u≥v>z≥0
(x1(z, v) + x1(v, z)) = u
2,
where we use Equation (3) in the first equality and Non-wastefulness in the third equality.
On the other hand, by Lemma 2, the expected utility of Bidder 1 is at least
u
Z u
v=0
U1(u, v)dv ≥1
u
Z u
v=0
(u −v)dv = u
2.
Thus, for v ∈(0, u), U1(u, v) = u −v, almost surely. In particular, there exists a sequence
vi ↑u such that U1(u, vi) = u −vi. By Lemma 3, we have
U1(u, u) ≤lim
i U1(u, vi) = 0
so that U1(u, u) = 0. However, we know
0 = U1(u, u) =
Z u
z=0
x1(z, u)dz
so that x1(z, u) = 0 almost surely. As z 7→x1(z, u) is non-decreasing due to monotonicity,
we have x1(z, u) = 0 for every z < u. We have established that for the case of two bidders,
the allocation rule always assigns the item to the highest value bidder. Next, we show by
induction on the number of bidders that in the case of more than two bidders the item is
also allocated to the highest value bidder:
We claim that for any n ≥2 and any v < u := max{u2, . . . , un}, Bidder 1 will not
obtain the good if reporting v, i.e. x1(v, u2, . . . , un) = 0. We proceed by induction on
n. We already know that the base case n = 2 is true. Suppose that the claim is true
for n = k and assume towards contradiction that x1(v, u2, . . . , uk+1) > 0 for some v <
u := max{u2, . . . , uk+1}. By relabeling if necessary, assume that u2 ≥u3 ≥· · · ≥uk+1.
Consider the scenario that there are k bidders where Bidder 1 has value u and Bidder i
has value ui for 2 ≤i ≤k. Then u = max{u2, . . . , uk+1} = max{u2, . . . , uk}. If Bidder 1
bids truthfully, his utility payoff is
Z u
0
x1(z, u2, . . . , uk)dz = 0

by the induction hypothesis.
However, if Bidder 1 deviates by bidding u himself and
creating a Sybil that bids uk+1, then his utility payoff is
Z u
0
x1(z, u2, . . . , uk+1)dz + (u · xk+1(u, u2, . . . , uk+1) −pk+1(u, u2, . . . , uk+1))
≥
Z u
v
x1(v, u2, . . . , uk+1)dz + (uk+1 · xk+1(u, u2, . . . , uk+1) −pk+1(u, u2, . . . , uk+1))
≥(u −v)x1(v, u2, . . . , uk+1) + Uk+1(u, u2, . . . , uk+1)
> 0,
which contradicts Sybil-proofness.
To summarize, we have shown the allocation rule shall reward the item to the highest
bidder (when there is a tie among bids, the symmetry assumption implies uniform tie-
breaking rule) and therefore, by incentive compatibility, the mechanism is a second-price
auction.
Next, we will see that the axioms in our characterization are logically independent,
and dropping any of Non-wastefulness, Incentive Compatibility and Sybil-proofness give
additional mechanisms. If we drop Sybil-proofness, then any Symmetric, Monotone, and
Non-wasteful allocation rule with “Myerson payments” will satisfy all the axioms. The
generalized proportional mechanism
xN
i (u) =
f(ui)
P
j∈N f(uj),
pi(u) = cui,
for a convex increasing function f with f(0) = 0 and c > 0 satisfies all the axioms but
Incentive Compatibility. If we drop Non-wastefulness, then the second price auction with
a reservation price that does not depend on (or increases with) the number of bidders
will satisfy all other axioms. We give another interesting example which does not satisfy
Non-wastefulness and satisfies all the other axioms in the following.
Example 1. Consider the allocation rule
xN
i (u) = 2−|N|
ui
P
j∈N uj
and the payment rule given by the “Myerson payments”. Then the mechanism satisfies
Symmetry, Incentive Compatibility, Monotonicity, and Sybil-proofness.
Proof. The only nontrivial property to check is Sybil-proofness.
We prove something
slightly stronger than the notion of Sybil-proofness we use above: an agent cannot benefit
from creating a Sybil and bidding arbitrarily both from the original account and the Sybil
account.

We first calculate the payments from Myerson’s lemma. Let N := |N|. For v ∈RN
+,
we let C := PN
i=2 vi and we have
p1(v)
=
2−N

v1
v1
v1 + C −
Z v
0
z
z + C dz

=
2−N

v1
v1
v1 + C −ln

C
v + C

.
Suppose that there are n bidders with values u1, . . . , un. We let C := Pn
i=2 ui. If they
all bid truthfully, Bidder 1 has utility payoff
U1(u) = 2−nu1
u1
u1 + C −2−n

u1
u1
u1 + C −ln

C
u1 + C

.
Suppose that Bidder 1 deviates by bidding some other y and creating a Sybil bidding z.
Then his utility payoff will be
U′(y, z)
:=
2−(n+1)u1
y + z
y + z + C
−2−(n+1)

y
y
y + C −ln

C
y + C

−2−(n+1)

z
z
z + C −ln

C
z + C

.
Notice that
x 7→x
x
x + C −ln

C
x + C

is a convex function in x. Hence, U′(y, z) is maximized when y = z. We simplify U′(y, y)
to
U′(y, y) = 2−nu1
y
2y + C −2−n

y
y
y + C −ln

C
y + C

.
However, this is smaller than the utility Bidder 1 gets when bidding y and not creating
Sybils
2−nu1
y
y + C −2−n

y
y
y + C −ln

C
y + C

,
which is again smaller than U1(u) by Incentive Compatibility. Hence, Bidder 1 has no
incentive to deviate by creating Sybils.
Bayesian Sybil-Proofness
In previous sections, we introduced a strong notion of Sybil-proofness, which ensures that
no agent can benefit from creating Sybils, regardless of the strategies employed by other
participants.
However, we may wish to relax this requirement and consider a weaker,

Bayesian notion of Sybil-proofness, where agents hold prior beliefs about the number
of other participants and/or their valuations. In this Bayesian setting, we require that
creating Sybils is not profitable in equilibrium, that is, if no agent creates Sybils and all
other participants truthfully report their valuations, then no agent can increase their payoff
by creating Sybils instead of using a single identity.
In what follows, we show that there exist mechanisms that satisfy non-wastefulness,
symmetry, incentive-compatibility, and a Bayesian notion of Sybil-proofness, yet do not
allocate the item to the highest-value bidder with probability one. This indicates that we
can retain some Sybil-proof guarantees in the Bayesian sense without necessarily allocat-
ing to the highest value bidder. Specifically, we give two examples that suggest a specific
way of constructing such mechanisms. The first mechanism allocates the object through a
lottery when there are few bidders and through an auction otherwise. The second mech-
anism allocates the object through a lottery among high value bidders above a threshold
set ex-ante (and through an auction if there are no high value bidders). In contrast to the
first mechanism, the second mechanism will allocate the object randomly with significant
probability, independently of the number of bidders (the probability of random allocation
conditional on the number of bidders being n is bounded from below by a constant inde-
pendent of n). Moreover, it has the property that it generates higher interim payoff for
bidders than the second price auction.
Technically, for the Bayesian version of our model we need to enhance it by a prior
which is a probability distribution µ over S
N⊂N,|N|<∞RN
+ . Thus, both, valuations and the
number of real bidders, can be unknown. Denote by µ(·|vi) the posterior of bidder i if he
is part of the mechanism and has type vi. The posterior is a probability distribution over
S
i∈N⊂N RN
+ . Subsequently, we focus on the independent private value setting, where the
conditional distribution of values, conditional on the set of agents in the mechanism being
N, is F N for a distribution F on R+ that is strictly increasing on its support (assumed to
be (0, ¯v) for some ¯v > 0 or ¯v = ∞) with F(0) = 0 and the probability density function f
being three times differentiable.
We have the standard notion of Bayesian incentive compatibility:
Bayesian Incentive Compatibility: For each v ∈RN
+, and each agent i ∈N and bid
ui ≥0 we have
Eµ(·|vi)[vix
˜
N
i (vi, v−i) −p
˜
N
i (vi, v−i)] ≥Eµ(·|vi)[vix
˜
N
i (ui, v−i) −p
˜
N
i (ui, v−i)].
However, subsequently all of the constructed mechanisms also satisfy the stronger notion
of dominant strategy incentive compatible introduced previously.
Moreover, we want the mechanism to be Bayesian Sybil-proof. We consider a rather
strong Bayesian notion of Sybil-proofness, which is similar to the one in (Gafni et al.,
2020b; Mazorra and Della Penna, 2023). Importantly, we do not necessarily endorse the
notion as the only reasonable definition of Bayesian Sybil-proofness. Rather the point is
that we can construct examples of Sybil-proof mechanisms that do not always allocate to

the highest value bidder even if we use a strong notion of Bayesian Sybil-proofness. The
notion requires that creating Sybils does not benefit a bidder in expectation if no-one else
uses a Sybil in equilibrium and reports their true valuation.
Bayesian Sybil-proofness: For each v ∈RN
+, each i ∈N and all J ⊂N and u ∈RJ
+
Eµ(·|vi)[vixN
i (v)−pN
i (v)] ≥Eµ(·|vi)


X
j∈(J\N)∪i
vixN∪J
j
(vi, uJ\N , v−i) −pN∪J
j
(vi, uJ\N , v−i)

.
(5)
The following example uses a lottery to allocate the item in case two agents participate
and report a low value, and a second price auction in all other cases.9
Example 2. Fix a > 0 (we will establish which one later on) and define the following
mechanism:
• For n := |N| = 2 bidders, the mechanism works as follows:
– If both bidders report values v1, v2 ∈[0, a), the item is randomly assigned with
equal chances to one of the bidders, with no payments.
– Otherwise, the item is allocated through a second-price auction.
• For n ≥3, the mechanism is a second-price auction.
The mechanism is symmetric and non-wasteful but not ex-post efficient, so it is not
equivalent to a second-price auction. It uses a monotonic allocation rule with Myerson
payments, thus it is dominant strategy incentive compatible (and in particular Bayesian
incentive compatible). Nevertheless, one can choose a so that it becomes Bayesian Sybil-
proof. A simple illustration arises when F is the uniform distribution on the unit interval
and a = +∞. In this case, the mechanism for n = 2 bids coincides with a lottery where
the allocation that a bidder gets does not depend on his report, and for n ≥3, it becomes
a second-price auction. To see that the mechanism is Bayesian Sybil-proof, note that con-
ditional on the number of bidders being 2, an agent with valuation v achieves an expected
payoff of v/2. When valuations are drawn from U[0, 1], a two-bidder second-price auction
also yields an expected payoff of v/2 for an agent with valuation v. The expected payoff of
a second price auction with more than two bidders is strictly lower. Hence, introducing ad-
ditional zero-bidding Sybils does not increase the agent’s expected payoff and introducing
non-zero bidding Sybils decreases the agent’s expected payoff. The mechanism does not
9The construction generalizes and allows to obtain mechanisms that would not always allocate through
an auction even for a larger number of participants. The crucial point is that the randomness must decrease
with the number of participants. How the randomness needs to decrease in the number of participants is,
in general, a function of the prior. Our example has the advantage that it works for (almost) arbitrary
priors.

allocate the item to the highest bidder with probability 1/2 when n = 2, and is Bayesian
Sybil-proof.
In the following we show that for a broad class of distributions (beyond the uniform
case), there exists a suitably chosen constant a > 0 such that the mechanism remains
Bayesian Sybil-proof. Intuitively, the choice of a balances the expected payoffs from the
lottery (when few agents participate or all bids are low) with those from the second-price
auction segment, ensuring that no bidder can profit by introducing Sybils. The proof is in
the Appendix.
Proposition 3. If the density of the value distribution satisfies f′(0) > 0, there exists
a > 0 such that the mechanism defined in Example 2 is Bayesian Sybil-Proof and does not
almost surely allocate the item to the highest bidder.
As a second example, we consider a lottery mechanism where the item is allocated with
equal chances among agents that pay an entry price and the ”ticket price” is increasing in
the number of participants.
Example 3. Let the value distribution F be twice differential and strictly increasing on its
support [0, ¯v]. Let Zn−1 be the maximum of an i.i.d sample of size n −1 drawn from the
distribution F. For each integer n ≥2, let y⋆= min{y : (v−x)f(x) ≤1−F(x), ∀x ∈[y, v]},
define a number an
an = max{y⋆, E[Zn−1], F −1
n −2
n −1

}.
which we call an the ”ticket price”. The lottery mechanism with increasing ticket
price for n bids is defined as follows:
• If all or all but one bids are below an, the item is allocated by a standard second-
price auction (among all those bids), and the winner pays the second-highest bid with
uniform tie-breaking rule.
• If at least m ≥2 bids are at least an, then each of those m bidders wins the item with
probability 1/m, and the winner’s payment is an.10
Observe that, as long as y⋆< v,11 for each n, this mechanism differs from the second-
price auction with positive probability, since Pr[v ≥an] > 0 as an < ¯v. Moreover, the
10By risk neutrality, we could equivalently charge all m bidders (and not only the winner) an/m.
11Requiring y⋆< v means that beyond y⋆, i.e., in the upper tail of F, we have
(v −x)f(x) ≤1 −F(x),
∀x ∈[y⋆, v].
(6)
Equivalently, in terms of the hazard rate hF (x), this condition is expressed as
hF (x) ≤
v −x,
∀x ∈[y⋆, v].
(7)
In other words, sufficiently close to the endpoint v, the tail of F is no heavier than that of the uniform
distribution on [0, v].

mechanism is incentive compatible as it uses a monotonic allocation rule with Myerson
payments. Furthermore, the mechanism is non-wasteful, as it almost surely allocates the
item to a buyer, and it is symmetric. Moreover, we can show that under mild conditions,
the mechanism is Bayesian Sybil-proof. Before we establish Sybil-proofness, we highlight
two important properties of this mechanism. First, observe that if at least two agents bid
at or above an, then the item is allocated by a lottery among those qualifying agents at the
posted price an. In contrast, a second-price auction would allocate the item with probability
1 to the highest of these agents at a price equal to the second-highest qualifying bid. Hence,
with non-negligible probability (specifically 1−a n−1
n
), the outcome and payment under our
mechanism differ from those of a standard second-price auction.
A second notable aspect is that when multiple bidders qualify (i.e. have vj ≥an), the
good is allocated randomly at a fixed price among them. This often yields higher ex-interim
utility than a second-price auction, as we will establish in Lemma 4.
To see how frequently a lottery with at least two agents occurs, let X be the number
of agents whose valuations are at least an. In the special case that each valuation of bid-
ders is drawn independently from Uniform[0, 1], the random variable X follows a binomial
distribution with parameters n and (1 −an). Thus the probability that at least two agents
qualify is
Pr(X ≥2) = 1 −a n
n −n
 1 −an

a n−1
n
≈1 −2/e.
In other words, with probability ≈1 −2/e the mechanism runs a lottery among at least
two agents.
To prove Sybil-Proofness, using affine transformations, it is sufficient to show it for F
strictly increasing with support [0, 1]. The following Lemma is proved in the Appendix.
Lemma 4. Suppose agents have valuations drawn from a distribution F strictly increasing
with support [0, 1]. When all agents report truthfully, any agent i’s ex-interim expected pay-
off (conditional on knowing the number of submitted bids) under the lottery with increasing
ticket price mechanism is decreasing in the ticket price a ∈[y⋆, 1]. Moreover, any agent’s
ex-interim expected payoff is at least as high as in a standard second-price auction.
With the lemma, we can prove that the mechanism is Bayesian Sybil-proof.
Theorem 2. Let the value distribution F be twice differential and strictly increasing
on its support [0, ¯v].
Then the lottery mechanism with increasing ticket prices an =
max{y⋆, E[Zn−1], F −1 
n−2
n−1

} is Bayesian Sybil-proof. In particular, if y⋆< v, then there
exists a mechanism that is non-wasteful, symmetric, incentive compatible, and Bayesian
Sybil-proof that is non-equivalent to the second-price auction.
Proof. We establish the result for the case that the number of bidders is known by the
bidders. A fortiori this also establishes the result if the number of bidders follows a non-
degenerate prior. If v < an, the agent cannot profit by splitting into multiple identities:

the mechanism behaves like a second-price auction, where multi-bid strategies do not help
since the second-price auction is Sybil-proof. Hence assume v ≥an.
Suppose the agent creates k = k1 + k2 Sybils, with k1 Sybils ≥an−1+k and k2 Sybils
below an−1+k.
Because {an} is increasing and an ≥y⋆, Lemma 4 rules out profitable
manipulations when k1 = 1 and k2 ≥2.
Now consider k1 ≥2. One checks (as in Lemma 4) that the agent’s ex-interim payoff
from this Sybil strategy is
U(v, k1, k2, an−1+k) : =
 v−an−1+k
 n−1
X
m=0
n −1
m
  1−F(an−1+k)
m  F(an−1+k)
 n−1−m
k1
m + k1
.
A monotonicity argument, see Lemma 6 in the Appendix, shows U(v, k1, k2, a) is monotone
non-increasing in a ∈[F −1(n−2
n−1), 1]; thus
U(v, k1, k2, an−1+k) ≤U(v, k1, k2, an−1+k1) ≤v −an−1+k1.
On the other hand,
v −an−1+k1 ≤v −an
≤(v −E[Zn−1 | Zn−1 ≤v]) Pr[Zn−1 ≤v]
≤U(v, an)
The first inequality is deduced from the fact that the sequence an is increasing. The third
inequality is deduced by Lemma 4 since (v −E[Zn−1 | Zn−1 ≤v]) Pr[Zn−1 ≤v] is the
ex-interim expected payoff in the second-price auction. The second inequality holds since
v −an ≤(v −E[Zn−1 | Zn−1 ≤v]) Pr[Zn−1 ≤v] if and only if v −(v −E[Zn−1 | Zn−1 ≤
v]) Pr[Zn−1 ≤v] ≤an. This last inequality is deduced from
v −(v −E[Zn−1 | Zn−1 ≤v]) Pr[Zn−1 ≤v] = v Pr[Zn−1 > v] + E[Zn−1 | Zn−1 ≤v] Pr[Zn−1 ≤v]
≤E[Zn−1]
≤an (By construction).
Hence Sybil strategies yield lower expected payoffs, proving the mechanism is Bayesian
Sybil-proof.
Extensions
We briefly discuss other extensions of our baseline model and whether our main (im)possibility
result extends to these settings.

4.1
Multiple Goods with Unit-Demand
In Theorem 1 we showed that every non-wasteful, symmetric, Incentive Compatible, and
Sybil-proof direct mechanism for allocating one good is a second-price auction. A natural
question is whether the result extends to the case of multiple goods. With multiple goods,
however, there might not even be an efficient, symmetric, Incentive Compatible, and Sybil-
proof direct mechanism if some bidders demand multiple units.12 One simple setting where
there are multiple non-wasteful, symmetric, Incentive Compatible, and Sybil-proof direct
mechanisms is the case of unit demand bidders. In the context of blockchain, this could, for
example, be the case if we want to design a transaction fee mechanism for a fixed capacity
block, for an environment where each user wants at most one transaction (or bundle of
transactions) be included in the block and all transactions require the same amount of
block space.
More precisely, we assume there are m identical copies of an item, and each agent
has unit-demand valuations: an agent has a value for receiving for up to one unit but no
additional value for receiving more than one.
We extend the notion of non-wastefulness as follows. For all finite N ⊂N ,
1. 0 ≤xN
i (v) ≤1
for all i ∈N,
2. defining n := |N|, we have



X
i∈N
xN
i (v) = m,
if n ≥m,
xi(v) = 1 for every i ∈N,
if n < m.
Thus, we always allocate all m items (so none go unused), and we never allocate more than
one item to any bidder, since doing so would be wasteful given unit-demand valuations.
We refer to this as non-wastefulness for unit-demand bidders.
The uniform-price mechanism is defined as follows:
Definition 1 (Uniform-price auction). Let n := |N| be the number of submitted bids. For
the bid profile v, write the order statistics as v(1) ≥v(2) ≥. . . . Define the clearing price
p(v) :=



v(m+1),
if n > m,
0,
if n ≤m.
1. Allocation. Award one item to each of the bidders whose bid is at least v(m), i.e.
the top min{m, n} bids. If several bidders tie at the cutoff, break ties uniformly at
random so that exactly m items are assigned when n ≥m.
12The VCG mechanism is for example not always Sybil-proof, see (Yokoo et al., 2004).

2. Payment.
Every allocated bidder pays the uniform price p(v); all other bidders
pay 0.
Given these conditions, our question becomes
• Is the uniform-price auction the unique mechanism that is symmetric, Incentive Com-
patible, Sybil-proof, and non-wasteful for unit-demand bidders?
The answer is no. Consider the following counterexample.
Example 4. Let m be the number of items. Let v be the bid profile and, w.l.o.g., assume
the bids are ordered in descending order. In case that n ≤m or vm+1 < v1/m allocate the
items as a uniform-price auction. Otherwise, allocate the m items by selecting, uniformly
at random, a subset of m agents from the set [m + 1] and giving one item to each selected
agent. Consequently, every agent receives an item with probability
m
m+1.
Clearly this mechanism is monotonic, therefore, the Myerson payments make the mech-
anism Incentive Compatible. The mechanism is non-wasteful, and symmetric by construc-
tion.
The following statement is proved in the appendix.
Proposition 4. The mechanism is Sybil-proof.
4.2
Super-additive Utility
Our main theorem can be extended to a broader class of preferences. Specifically, suppose
each agent i has a private type θi. If the mechanism allocates some good or resource xi to
agent i with type θi and charges a payment pi, then agent i’s utility is
U(θi, xi, pi) = v(θi, xi) −pi,
where v : R+ × [0, 1] →R+ is a strictly increasing in R>0 × (0, 1] and twice differentiable
function with v(θi, 0) = 0 and v(0, xi) = 0.
Thus, as in previous sections, agents are
ex-ante symmetric (otherwise, discussions of Sybils make little sense), but their interim
utility depends on a private signal. We make two assumptions on the valuation function.
We require value to be convex in types:
Type-convexity: for every x ∈[0, 1] the function θi 7→v(θi, x) is convex.
The second assumption is
Superadditive interim utility: for every θi ≥0 the function x 7→∂1v(θi, x) is superad-
ditive on [0, 1]:
∂1v(θi, x) + ∂1v(θi, y) ≤∂1v(θi, x + y),
0 ≤x, y, x + y ≤1.

Note that Myerson payments in this setting are given by
p(θ) =
Z xi(θ)
0
∂2v(θi, xi)dxi = v(θi, xi(θ)) −
Z θi
0
∂1v(˜θi, xi)d˜θi.
Thus, the interim utility under Myerson payments for bidder i with type θi is
U(θi, x(θ), p(θ)) =
Z θi
0
∂1v(˜θi, x)d˜θi.
Super-additivity of ∂1v(˜θi, x) therefore implies that the interim utility is super-additive
in consumption which makes Sybilling a worthwhile strategy in mechanisms other than
auctions. Type-convexity on the other hand guarantees that the interim utility is increasing
in types which is needed for implementation (in dominant strategies).
Here are some examples that are part of the class of preferences:
Example 5. Let θi ∈R+ and xi ∈[0, 1].
Power family
v(θi, xi) = θα
i xβ
i ,
α ≥1, β ≥1.
Exponential–power family
v(θi, xi) = θα
i
 eκxi −1

,
α ≥1, κ > 0.
Hyperbolic-sine family
v(θi, xi) = θα
i sinh(κxi),
α > 1, κ > 0.
The notions of symmetry, non-wastefulness incentive compatibility and Sybil-proofness
can be adapted in a straightforward way to this setting.
We then have the following
extension of Theorem 1, which is proved in the appendix:
Theorem 3. For valuation functions that are type-convex and induce superadditive in-
terim utility, the second-price auction with symmetric tie-breaking is the only direct mech-
anism that simultaneously satisfies non-wastefulness, symmetry, incentive compatibility,
and Sybil-proofness.

Conclusion
Our main theorem can be interpreted as a trilemma for the design of non-wasteful mecha-
nism in the presents of Sybils: any such mechanism is either not Incentive-Compatible, not
Sybil-proof or centralizing. In light of our main theorem, if we aim to design a practical
mechanism that does not always assign the good to the highest-value bidder, then we need
to relax Sybil-proofness, Incentive Compatibility, or Non-wastefulness. We discuss some
possible directions to relax these axioms.
In some contexts, being wasteful seems to be very undesirable,13 whereas in others it
could be tolerable. Sybil-proofness is easier to satisfy when the probability of not allocating
the good to anyone is increasing in the number of bidders, as Examples 1 shows. However,
the mechanism in Example 1 can hardly be of practical use, as the probability of wasting
the good converges to 1 when there are many bidders. Thus, we ask:
Question 1. Does there exist a Symmetric, Incentive Compatible, and Sybil-proof mecha-
nism such that the probability of allocating the good to a bidder is larger than some positive
constant?
Practically, relaxing Incentive Compatibility is a natural direction to explore. Our im-
possibility result implies that no non-trivial distributional objectives can be achieved by any
Sybil-proof mechanism. However, that does not exclude the possibility of approximately
satisfying objectives. Thus, we ask
Question 2. How well can (worst-case) equilibria of Sybil-proof mechanisms, such as the
proportional mechanism, approximate distributional objectives?
In many practical scenarios, creating Sybils is cheap but not entirely free (Mazorra
and Della Penna, 2023).
If we assume that creating Sybils has a small constant cost
for all bidders, will there be a substantially larger class of mechanisms satisfying all the
desirable properties? In particular, we are interested in which distributional objectives we
can achieve.
Question 3. When creating Sybils is costly, what mechanism satisfying Sybil-proofness,
Incentive Compatibility, and Non-wastefulness would lead to a (most) decentralized market?
In the last section, we have seen that relaxing Sybil-proofness to a Bayesian version
extends the set of possible mechanisms.
There are arguably many sensible notions of
Bayesian Sybil-proofness. Moreover, it would be interesting to classify the design space of
Bayesian Sybil proof mechanisms.
Question 4. What is the class of Bayesian Sybil-proof mechanisms?
13This is for example the case in our running example of block proposing, as blockchains shouldn’t
produce empty blocks.

References
Brill, M., Freeman, R., Conitzer, V., and Shah, N. (2016). False-name-proof recommenda-
tions in social networks.
Budish, E. and Bhave, A. (2023). Primary-market auctions for event tickets: Eliminating
the rents of “bob the broker”? American Economic Journal: Microeconomics, 15(1):142–
170.
Chen, X., Papadimitriou, C., and Roughgarden, T. (2019). An axiomatic approach to
block rewards. In Proceedings of the 1st ACM Conference on Advances in Financial
Technologies, pages 124–131.
Gafni, Y., Lavi, R., and Tennenholtz, M. (2020a). VCG under sybil (false-name) attacks -
A bayesian analysis. In The Thirty-Fourth AAAI Conference on Artificial Intelligence,
AAAI 2020, The Thirty-Second Innovative Applications of Artificial Intelligence Con-
ference, IAAI 2020, The Tenth AAAI Symposium on Educational Advances in Artificial
Intelligence, EAAI 2020, New York, NY, USA, February 7-12, 2020, pages 1966–1973.
AAAI Press.
Gafni, Y., Lavi, R., and Tennenholtz, M. (2020b). Vcg under sybil (false-name) attacks-
a bayesian analysis. In Proceedings of the AAAI Conference on Artificial Intelligence,
volume 34, pages 1966–1973.
Gafni, Y. and Tennenholtz, M. (2023). Optimal mechanism design for agents with DSL
strategies: The case of sybil attacks in combinatorial auctions. In Verbrugge, R., editor,
Proceedings Nineteenth conference on Theoretical Aspects of Rationality and Knowledge,
TARK 2023, Oxford, United Kingdom, 28-30th June 2023, volume 379 of EPTCS, pages
245–259.
Gafni, Y. and Yaish, A. (2024). Barriers to collusion-resistant transaction fee mechanisms.
In Bergemann, D., Kleinberg, R., and Sab´an, D., editors, Proceedings of the 25th ACM
Conference on Economics and Computation, EC 2024, New Haven, CT, USA, July 8-11,
2024, pages 1074–1096. ACM.
Gershkov, A., Goeree, J. K., Kushnir, A., Moldovanu, B., and Shi, X. (2013). On the equiv-
alence of bayesian and dominant strategy implementation. Econometrica, 81(1):197–220.
Huberman, G., Leshno, J. D., and Moallemi, C. (2021). Monopoly without a monopolist:
An economic analysis of the bitcoin payment system. The Review of Economic Studies,
88(6):3011–3040.
Leshno, J. D. and Strack, P. (2020). Bitcoin: An axiomatic approach and an impossibility
theorem. American Economic Review: Insights, 2(3):269–286.

Manelli, A. M. and Vincent, D. R. (2010). Bayesian and dominant-strategy implementation
in the independent private-values model. Econometrica, 78(6):1905–1938.
Mazorra, B. and Della Penna, N. (2023). The cost of sybils, credible commitments, and
false-name proof mechanisms. arXiv preprint arXiv:2301.12813.
Messias, J., Yaish, A., and Livshits, B. (2023). Airdrops: Giving money away is harder
than it seems. arXiv preprint arXiv:2312.02752.
Myerson, R. B. (1981).
Optimal auction design.
Mathematics of operations research,
6(1):58–73.
¨Oz, B., Sui, D., Thiery, T., and Matthes, F. (2024). Who wins ethereum block building
auctions and why?
In Proceedings of the 5th Conference on Advances in Financial
Technologies (AFT).
Wagman, L. and Conitzer, V. (2008). Optimal false-name-proof voting rules with costly
voting. In AAAI, volume 8, pages 190–195.
Yokoo, M., Sakurai, Y., and Matsubara, S. (2004). The effect of false-name bids in combi-
natorial auctions: new fraud in internet auctions. Games Econ. Behav., 46(1):174–188.
A
Revelation principle
We define (indirect) mechanisms with variable population to be families (MN , xN , pN )N⊂N,|N|<∞
of mechanisms for each finite N ⊂N set of players, where MN = ×i∈N MN
i
are strategy
(or message) spaces, xN : MN →∆(N) is an allocation function and pN : MN →RN
+
is a payment function. We call a mechanism symmetric if there is a message space M
such that for all finite N ⊂N and all i ∈N we have MN
i
= M and for all permutations
π of N we have xN
π(i)((sπ(i))) = xN
i (s) and pN
π(i)((sπ(i))) = pN
i (s). The corresponding
mechanism with Sybils for a symmetric mechanism (M, {xN , pN }N⊂N,|N|<∞) is given
by ( ˜
M, {˜xN , ˜pN }N⊂N,|N|<∞) with
˜
M = S
n∈N Mn and
˜x[N]
i
(s) =
dim(si)
X
j=1
x[ ˜
NN]
˜
Ni+j(vec(s)),
˜p[N]
i
(s) =
dim(si)
X
j=1
p[ ˜
NN]
˜
Ni+j(vec(s)),
where ˜Ni := Pi−1
j=1 dim(sj) and vec(s) denotes the concatenation of s1, s2, . . . , sN.
We
extend the outcome function to sets N that are not of the form [N] = {1, . . . , N} by
requiring the Sybil mechanism to be symmetric.
Generally, subtleties arise around the players reasoning about the true number of bid-
ders. Subsequently, we assume that bidders cannot condition their message on the number

of messages the Sybil mechanism receives (because they do not know it when sending the
message to the mechanism).
For dominant strategy implementation case, we can then
operate in a ”belief-free” model: sending message mi(vi) should be weakly-dominant for a
bidder i with value vi, for all possible sets of participants in the Sybil mechanism. For the
Bayesian setting bidders will also hold beliefs about the number (or more generally set of)
bidders that participate in the Sybil mechanism, as we further discuss below.
A social welfare function for a variable population model is a function f : D →∆(N) ×
RN
+ with fi(v1, . . .) = (0, 0) for vi = 0 where D ⊆c00(R+) is a subset of the set of R+-valued
sequences with finitely many non-zero elements. The first element of fi(v) corresponds to
the probability with which bidder i gets the item, and the second element corresponds to
the payment bidder i makes. A social welfare function yields a direct mechanism where
M = R+ and (xN (v), pN (v)) = f(v|N , 0|N\N ).
We say that a (Sybil) mechanism ( ˜
M, ˜x, ˜p) implements f in weakly dominant strategies
iff there is a message profile (mi(·))i∈N such that for each v = (vi) ∈c00(R+),
1. for each i ∈supp(v) and each finite N ⊂N with i ∈N reporting mi(vi) to mechanism
( ˜
M, ˜x, ˜p) is a weakly dominant strategy,
2. for each v we have f(v) = (˜xsupp(v)(m(v)), ˜psupp(v)(m(v))).
Proposition 5 (Revelation Principle for Sybils in Dominant strategies). Let (M, x, p)
be a symmetric mechanism and ( ˜
M, ˜x, ˜p) be the corresponding mechanism with Sybils. If
( ˜
M, ˜x, ˜p) implements f in weakly dominant strategies, then the direct mechanism f is
Sybil-proof and incentive compatible.
Proof. Suppose not. Then there is a bidder i with value vi that is better off from lying
or from Sybilling in the direct mechanism at some set N of participants who submit
bids v−i. In the first case, if reporting ui instead of vi would yield higher pay-off if the
other bids in the mechanism are v−i, then the standard revelation principle argument
applies: sending message mi(ui) would yield a higher payoff in the Sybil mechanism than
sending mi(vi) in case the other participants in the Sybil mechanism send messages mj(vj).
This contradicts mi(vi) being a dominant strategy if i has value vi. In the second case,
reporting vi and creating a Sybil i′ bidding ui′ yields a higher payoff if the other bids
in the mechanism are v−i. But then sending message m = (mi(vi), mi′(ui′)) to the Sybil
mechanism would yield higher payoff than sending message mi(vi) when other bidders send
messages mj(vj), contradicting mi(vi) being a weakly dominant strategy for bidder i in
the Sybil mechanism.
To formulate the Bayesian version of a Sybil revelation strategy we add a prior to the
model which is a probability measure π over c00(R+).14
14A natural case would for example be the i.i.d. private value setting with an unknown number of bidders
where we have a probability λ(N) of N players participating in the Sybil mechanism for each of which the
value is drawn i.i.d. from a distribution F.

We say that a (Sybil) mechanism ( ˜
M, ˜x, ˜p) implements f in Bayes-Nash equilibrium iff
there is is a strategy profile (mi(·))i∈N such that for each v ∈c00(R+),
1. for each i ∈supp(vi) and each m′ ∈M we have
E[vixi(m(v)) −pi(m(v))|vi] ≥E[vixi(m′
i, m−i(v−i)) −pi(m′
i, m−i(v−i))|vi]
2. for each v we have f(v) = (˜xsupp(v)(m(v)), ˜psupp(v)(m(v))).
Proposition 6 (Revelation Principle for Sybils for Bayes-Nash equilibrium). Let (M, x, p)
be a symmetric mechanism and ( ˜
M, ˜x, ˜p) be the corresponding mechanism with Sybils.
If ( ˜
M, ˜x, ˜p) implements f in Bayes-Nash equilibrium, then the direct mechanism f is
Bayesian incentive compatible and Bayesian Sybil-proof.
Proof. Suppose not. Then there is a bidder i with value vi that is better off from lying or
from Sybilling in the direct mechanism given that everyone else bids truthfully and does
not Sybil. In the first case, if reporting ui instead of vi would yield higher expected pay-off
given truthful bidding of the other bidders, then messaging mi(ui) instead of mi(vi) to
the Sybil mechanism if other bidders follow the equilibrium bidding strategy would be a
better response contradicting mi(·) being a best response. Similarly, if creating a sybil i′
and bidding ui′ from it makes bidder i better of in expectation in the direct mechanism,
then sending message (mi(vi), mi′(ui′)) to the Sybil mechanism is a better response to the
other bidders’ strategies than sending message mi(vi) contradicting the fact that (mj(·))
is a Bayes-Nash equilibrium of the direct mechanism.
B
Proof of Proposition 3
Proof. Without loss of generality we establish the result for the case that the number of
bidders is known by the bidders. The same type of argument if the number of bidders
follows a non-degenerate prior. First, we show that if the following equation holds
aF(a)
=
Z a
0
zf(z) dz,
(8)
with some a > 0, then the claim of the proposition holds. As the the mechanism is IC, the
following condition holds:
vF(a)
≥vF(w) −
Z w
0
zf(z) dz
for all v ≤a ≤w
(9)
Since the second-price auction is IC, we know that vF(v) −
R v
0 zf(z) dz ≥vF(w) −
R w
0 zf(z) dz, and thus we can replace the first inequality with the stronger one:
vF(a)
≥vF(v) −
Z v
0
zf(z) dz
for all v ≤a.

The last inequality implies that the mechanism is Bayesian Sybil-Proof as follows. The
mechanism is clearly Bayesian Sybil-Proof for n ≥3. For n = 2, an agent has an incentive
to engage in Sybil strategies if and only if the expected payoff from the second-price auction
with another agent exceeds the expected payoff from this mechanism. However, the last
inequality implies that this does not occur.
Next, we derive sufficient condition, f′(0) > 0, for which the equation (8) has a non-zero
solution.
Define
G(a) =
Z a
0
z f(z) dz −a F(a)
.
Notice that G(0) = 0 and lima→+∞G(a) = −∞. By continuity, if there exists b > 0 such
that G(b) > 0, then there must be a positive root of G, corresponding to a non-trivial
solution of the equation (8).
Direct computation yields
G′(x) = 1

x f(x) −F(x)

,
G′′(x) = x
2 f′(x),
G′′′(x) = 1

f′(x) + x f′′(x)

.
Hence G′(0) = 0, G′′(0) = 0, and G′′′(0) = f′(0)
2 . If f′(0) > 0, then G′′′(0) > 0. A Taylor
expansion of G around 0, G(x) = G(0)+G′(0)x+1/2G′′(0)x2 +1/6G′′′(0)x3 +o(x3), shows
that G(x) > 0 for sufficiently small x > 0. It follows that G crosses zero at some positive
a, giving a non-trivial solution of the equation.
C
Lemmas for the Proof of Theorem 2
Lemma 5. Let F be a distribution function on [0, ∞), and fix 0 ≤a ≤v. Define
U(v, a) = F(a)n−1 v−a

+
Z a
0
F(x)n−1 dx + (v−a)
n−1
X
m=1
n −1
m
 
1−F(a)
m F(a) n−1−m
m + 1.
Then
U(v, a) =
Z a
0

F(x)
n−1 dx + (v −a) 1 −

F(a)
n
n

1 −F(a)
 .
Proof. First, recall the binomial identity
n−1
X
m=0
n −1
m
 
1 −F(a)
m F(a) n−1−m
m + 1 =
1 −

F(a)
n
n

1 −F(a)
 .
Hence
n−1
X
m=1
n −1
m
 
1 −F(a)
m F(a) n−1−m
m + 1 =
1 −

F(a)
n
n [ 1 −F(a) ] −F(a) n−1.

Substitute this back into the definition of U(v, a). The part in parentheses becomes
(v −a)
 1 −F(a)n
n [1 −F(a)] −F(a)n−1

.
Hence
U(v, a) = F(a)n−1(v −a) +
Z a
0
F(x) n−1 dx + (v −a)
 1 −F(a)n
n [1 −F(a)] −F(a)n−1

.
Factor out (v −a):
U(v, a) =
Z a
0
F(x) n−1 dx + (v −a)

F(a)n−1 +
1 −F(a)n
n[ 1 −F(a) ] −F(a)n−1

.
Clearly the F(a)n−1 terms cancel, leaving
U(v, a) =
Z a
0
F(x) n−1 dx + (v −a) 1 −F(a)n
n [1 −F(a)].
Lemma 6. Suppose F is a cdf with support [0, 1] twice differentiable. Let n ≥2 be an
integer and k > 0. Define
S(a) =
n−1
X
m=1
n −1
m

(1 −F(a))m F(a)a n−1−m
k
m + k,
a ∈[0, 1].
Set a⋆
=
n−2
n−1 . Then the function S(a) is non-increasing on the interval [F −1(a⋆), 1].
Moreover, if we define
G(a) = (v −a) S(F(a)),
for some v ∈[F −1(a⋆), 1],
then G(a) is also non-increasing on [F −1(a⋆), v].
Since F is increasing, making a change of variables, is sufficient to show it for F(x) = x.
First, observe that
k
m + k
=
Z 1
0
k xk−1 xm dx =
Z 1
0
k xm+k−1 dx.
Hence each term in the sum for S(a) can be written as
n −1
m

(1 −a)m a n−1−m
Z 1
0
k xm+k−1 dx.

Interchange summation and integration to obtain
S(a) =
Z 1
0
k x k−1hn−1
X
m=1
n −1
m
  (1 −a) x
m a n−1−mi
dx.
Recognize that
n−1
X
m=0
n −1
m
  (1 −a) x
m a n−1−m =

a + (1 −a) x
 n−1,
and the m = 0 term alone is a n−1. Thus
n−1
X
m=1
n −1
m
  (1 −a) x
m a n−1−m =

a + (1 −a) x
n−1 −an−1.
Therefore
S(a) =
Z 1
0
k x k−1 h a + (1 −a) x
 n−1 −an−1i
dx.
Monotonicity of S(a) for a ≥a⋆. We show S′(a) ≤0 when a ≥a⋆= n−2
n−1 . Differentiate
under the integral:
S′(a) =
Z 1
0
k xk−1 d
da
h
(a + (1 −a) x)n−1 −an−1i
dx.
The derivatives inside are
d
da

(a + (1 −a) x)n−1
= (n −1) (a + (1 −a) x) n−2 (1 −x),
d
da

an−1
= (n −1) a n−2.
Hence
S′(a) = (n −1) k
Z 1
0
xk−1h
(a + (1 −a) x) n−2 (1 −x) −a n−2i
dx.
Define
E(a, x) := (a + (1 −a) x) n−2 (1 −x) −a n−2.
We claim E(a, x) ≤0 for all x ∈[0, 1] whenever a ≥
n−2
n−1 . Factor out a n−2 in the first
term:
(a + (1 −a) x) n−2 = a n−2h
1 + 1−a
a x
i n−2
.
Thus
E(a, x) = a n−2h
(1 −x)
 1 + c x
 n−2 −1
i
,
c = 1 −a
a
.

We can show that if c ≤
n−2, then (1 −x)(1 + c x) n−2 ≤1. Define
L(x) = (1 −x)
 1 + c x
n−2.
At the endpoints, L(0) = 1 and L(1) = (1 −1) (1 + c)n−2 = 0. A brief derivative check
shows that if c ≤
n−2, then L′(x) is non-positive on [0, 1], implying L(x) is decreasing.
Indeed, one computes
L′(x) = (1 + c x)n−3h
−
 1 + c x

+ (n −2) c
 1 −x
i
,
and the bracketed term is never positive for 0 < x ≤1 when c ≤
n−2. Hence L(x) decreases
from L(0) = 1 to L(1) = 0, so L(x) ≤1 holds on the entire interval.
c ≤
n−2 corresponds to a ≥n−2
n−1. Under that condition, we get E(a, x) ≤0 for all
x ∈[0, 1], and hence S′(a) ≤0. Therefore S(a) is non-increasing on

a⋆, 1

.
Monotonicity of G(a) = (v −a) S(a). Suppose 0 ≤a ≤v ≤1 and a ≥a⋆. Define
G(a) = (v −a) S(a).
We have (v −a) ≥0 and, from Step 2, S(a) is non-increasing and nonnegative for a ≥a⋆.
A short derivative check gives
G′(a) = d
da

(v −a) S(a)

= (v −a) S′(a) −S(a).
Since (v −a) ≥0 and S′(a) ≤0, the term (v −a) S′(a) is non-positive. Also, S(a) ≥0, so
−S(a) is non-positive. Therefore
G′(a) ≤0,
which shows F(a) is non-increasing on [a⋆, v].
For each a ≥a⋆=
n−2
n−1 , the function S(a) is non-increasing. Furthermore, for any v ∈
[a⋆, 1], the product (v −a)S(a) is also non-increasing on [a⋆, v].
C.1
Proof of Lemma 4
Proof. We first prove the following:
Claim:
n(1+(n−1)F(a)n−nF(a)n−1)((v−a)f(a)−(1−F(a)))
(n(1−F(a)))2
≤0 for a ∈[y⋆, 1] and v ∈[a, 1].
Since a ∈[y⋆, 1] and v ∈[a, 1], (v−a)f(a)−(1−F(a)) ≤0 by definition of y⋆. Therefore,
to prove the claim, is sufficient to show that 1 + (n −1)F(a)n −nF(a)n−1 ≥0. Define the
function
g(x) = 1 + (n −1)xn −nxn−1,
for x ∈[0, 1].

Evaluating at the endpoints, we obtain
g(0) = 1,
g(1) = 1 + (n −1) −n = 0.
Next, computing the derivative,
g′(x) = (n −1)nxn−1 −n(n −1)xn−2 = n(n −1)xn−2(x −1).
Since x −1 ≤0 for x ∈[0, 1], it follows that g′(x) ≤0 in this range, meaning g(x) is
decreasing. Since g(0) = 1 and g(1) = 0, we conclude that g(x) ≥0 for all x ∈[0, 1], which
proves the claim.
Let i be an agent with valuation v, and define K = { j ̸= i | vj ≥a}. Let U(v, a)
denote agent i’s expected payoff with the lottery mechanism with ticket price a. We want
to show that if a′ ≥a, then U(v, a) ≥U(v, a′). First, let’s compute U(v, a). We split into
two cases:
Case 1: v < a. The agent’s expected payoff is equivalent to the payoff of the second-
price auction, i.e. the expected payoff is
(v −E[Zn−1 | Zn−1 ≤v]) Pr[Zn−1 ≤v] =
Z v
0
F(x)n−1dx
independent of a. Thus no change occurs as a crosses above v.
Case 2: v ≥a. Now agent i always qualifies (i ∈K). Let Y = |K| −1 be the number
of other bidders whose bids exceed a, so Y is Binomial(n −1, 1 −F(a)).
If Y = 0, the mechanism is effectively a second-price auction with n bidders, among
whom i is guaranteed highest if the others are all below a. The payoff in this scenario is
F(a)n−1(v −E[Zn−1 | Zn−1 ≤a]) = F(a)n−1(v −a) +
Z a
0
F(x)n−1dx
If Y ≥1, the mechanism assigns the item at random among the Y + 1 qualifying
bidders, charging a. The agent’s expected payoff is
n−1
X
m=1
Pr(Y = m) v −a
m + 1
= (v −a)
n−1
X
m=1
n −1
m

(1 −F(a))mF(a)n−1−m
m + 1.
Adding the two parts (for Y = 0 and Y ≥1) yields
U(v, a) = F(a)n−1(v−a)+
Z a
0
F(x)n−1dx + (v−a)
n−1
X
m=1
n −1
m

(1−F(a))m F(a) n−1−m
m + 1.
By Lemma 5 the sum equals
U(v, a) =
Z a
0
F(x)n−1 dx + (v −a) 1 −

F(a)
n
n

1 −F(a)
.

Observe that
∂U(v, a)
∂a
= F(a)n−1 −1 −F(a)n
n(1 −F(a)) + (v −a)f(a)−n2F(a)n−1(1 −F(a)) + n(1 −F(a)n)
(n(1 −F(a))2
= n
 1 + (n −1)F(a)n −nF(a)n−1
((v −a)f(a) −(1 −F(a)))
(n(1 −F(a)))2
The previous expression is non-positive for a ∈[y⋆, 1] and v ∈[a, 1], by the Claim.
Putting both claims together, ∂U(v,a)
∂a
≤0 for a ∈[y⋆, 1] and v ∈[a, 1]. Therefore,
U(v, a) is monotone non-increasing in this region. In particular, if v ≥an,
U(v, a) ≥U(v, v) =
Z v
0
F(x)n−1dx.
D
Proof of Proposition 4
Proof. First, let’s start by computing the payment rule.
Let v1, . . . , vn−1 be the bids
reported, and assume w.l.o.g. that they are in descending order and n ≥m + 1. Suppose
another i = n agent bids v. The Myerson payments of agent i is
pi(v, v−i) = vixi(v, v−i) −
Z v
0
xi(t, v−i), dt.
Now, the allocation rule is:
xi(t, v−i) =





1, if max{t, v1} ≥m vm and t ≥vm
m
m+1, if max{t, v1} < m vm and t ≥vm+1
0, othwerise
Clearly, in any case if v < vm+1 then its allocation and payment is zero, so let’s assume
that v ≥vm+1.
Case 1: v ≥mvm.
1. If v ≤v1, then the payment is exactly vm.
2. In case v > v1. If v1 ≥mvm, then the payment is vm. Otherwise, the payment is
m
m+1vm +
m
m+1 max{v1/m, vm+1}.
Case 2: v < mvm.
1. If v1 ≤mvm, the payment is
m
m+1 max{v1/m, vm+1}.

2. If v1 > mvm, the payment is vm in case v ≥vm and 0 otherwise.
The result is trivial if n ≤m −1 and so let’s assume that n ≥m. A first observation
is that no agent has an incentive to Sybil bids below the largest m + 1 (including his
other Sybil bids) since those will just increase payments without increasing the allocation
probability. A second observation is that no agent is incentivized to bid more than two
Sybils. A third Sybil will not increase the probability of getting an item (since with two
agents the probability of getting the item is 1), and just will increase payments. Therefore,
we will take into account the deviations of two Sybils. When reporting two Sybils, if one
bids less than the m + 1-st biggest bid, that Sybil will not get allocated the item, and can
only increase the payment of the other Sybil, making this deviation also not profitable.
Therefore, let’s assume that agents bid with two Sybils with a bid larger than vm.
We will reason by cases.
Suppose that n −1 agents reported v1, . . . , vn−1 bids. Let’s start with an agent with
valuation v < v1.
1. If v1 ≥mvm, then the agent has no incentive to Sybil bid, since for him the mechanism
is equivalent to a uniform-price auction.
2. If v1 < mvm, then if he employs two Sybils, their Sybil payments are at least
m
m+1 max{v1/m, vm}. Hence his utility with the Sybil strategy is at most
v −
m+1 max{v1/m, vm} = v −
m+1vm.
On the other hand, if he truthfully reports his value, his utility is
m
m+1v−
m
m+1 max{v1/m, vm+1}.
Observe that v −2
m
m+1vm ≤
m
m+1v −
m
m+1vm iff
m+1v ≤
m
m+1(2vm −vm+1), and this
inequality is true since vm ≥vm+1 and v < v1 ≤mvm.
Now, let’s assume that v ≥v1.
1. The cases v1 ≥m vm or v1 < m vm and v < m vm are analogous to the previous case.
2. If v1 < m vm and v ≥m vm. If the agent bids truthfully, then its utility is
v −
m
m+1vm −
m
m+1 max{v1/m, vm+1} ≥v −2
m
m+1vm.
(10)
Clearly, in case the agent employs two Sybils, he has no incentive to employ one with
bid higher than m vm since this would allocate the item with probability 1 but the
second Sybil would increase the payment. Therefore, let’s assume that two Sybil bids
are below m vm. In this case, each Sybil payment is at least
m
m+1 max{v1/m, vm},
therefore his utility in this case is at most v −2
m
m+1 max{v1/m, vm} = v −2
m
m+1vm
and so, by (10), is less than or equal to his utility bidding truthfully.

E
Proof of Theorem 3
Lemma 7. If v is strictly increasing in R>0 × (0, 1] and twice differential function with
v(θ, 0) = 0 and v(0, x) = 0 and holds type-convexity and superadditive interim utility
properties then the valuation function is:
1. ∂1v(θ, x) > 0 for every θ, x > 0.
2. Single-crossing: v(θ′, x′) −v(θ, x) ≥v(θ, x′) −v(θ, x) whenever θ′ > θ and x′ > x;
3. Allocation superadditivity: v(θ, x)+v(θ, y) ≤v(θ, x+y) for every θ ≥0 and x, y ≥0
with x + y ≤1.
Proof. (1) Assume, for a contradiction, that
∂1v(θ0, x) = 0
for some θ0 > 0, x > 0.
Because v is convex in the first argument the function θ 7→∂1v(θ, x) is non-decreasing. On
the other hand ∂1v(0, x) = 0, so
∂1v(θ, x) = 0
for every θ ∈[0, θ0].
Integrating gives
v(θ0, x) −v(0, x) =
Z θ0
0
∂1v(t, x) dt = 0
hence v(θ0, x) = v(0, x).
This contradicts the assumption that θ 7→v(θ, x) is strictly
increasing.
(2) Fix x′ > x and define ϕ(θ) := v(θ, x′)−v(θ, x). Then ϕ′(θ) = ∂1v(θ, x′)−∂1v(θ, x′).
Because v(θ, 0) = 0 and x 7→v(θ, x) is superadditive, it is non-decreasing on (0, 1]; hence
ϕ′(θ) ≥0 for all θ > 0. Thus ϕ is non-decreasing, giving the desired inequality for θ′ > θ.
(3) By the properties of v and the fundamental theorem of calculus,
v(θ, x) =
Z θ
0
∂1v(t, x) dt
for all (θ, x).
(11)
And so, for every x, y ∈[0, 1] such that x + y ≤1,
v(θ, x) + v(θ, y) =
Z v
0
[∂1v(t, x) + ∂1v(t, y)]dt ≤
Z v
0
∂1v(t, x + y)dt = v(θ, x + y).
Lemma 8 (Myerson-lemma for general valuations). Suppose v is strictly increasing in
R>0 × (0, 1] and twice differential function with v(θ, 0) = 0 and v(0, x) = 0 and holds
type-convexity and superadditive interim utility properties. Then, a mechanism (x, p) is
Incentive Compatible if and only if, for every agent i and every profile θ−i,

1. the allocation θi 7→xi(θi, θ−i) is non-decreasing on [0, ∞); and
2. payments satisfy the envelope formula
pi(θi, θ−i) = v(θi, xi(θi, θ−i)) −
Z θi
0
∂1v(z, xi(z, θ−i)) dz,
θi ≥0.
Now we are ready to prove Theorem 3:
The proof follows the same structure as the proof for the linear valuations. In the
following, however, we will assume the stronger notion of Sybil-proofness, that is, the
agent can employ an arbitrary finite number of Sybil bids.
Lemma 9. U1(θ1, θ2) = v(θ1, 1) −v(θ2, 1) and x1(u, v) = 1 if θ1 ≥θ2, θ1, θ2 ∈R+.
Proof. First, let’s show that U1(θ1, θ2) ≥v(θ1, 1) −v(θ2, 1). Suppose that the value of
Bidder 1 is θ1 and the value of Bidder 2 is θ2. Suppose the Bidder 1 unilaterally deviates
and uses n −1 Sybils, bidding θ2 with each one of them. By symmetry, the allocation
for each Sybil is xi(θ2[n]) =
n. Since the mechanism is Incentive Compatible, it is, in
particular, individually rational, and hence, the payment per Sybil is at most v(θ2, 1/n).
Therefore, the utility of the unilateral deviation is at least v(θ1, n−1
n ) −(n −1) v(θ2, 1
n).
Since the mechanism is Sybil-proof,
U1(u, v) ≥v

θ1, n −1
n

−(n −1)v(θ2, 1
n).
Since v(θ2, ·) is superadditive, (n −1)v(θ2, 1
n) ≤v(θ2, 1 −/n). By continuity of v,
U1(u, v) ≥lim sup
n→+∞

v

θ1, n −1
n

−v

θ2, 1 −1
n

= v(θ1, 1) −v(θ2, 1).
Now, let’s show that U1(θ1, θ2) ≤v(θ1, 1) −v(θ2, 1).

On one side, we have U(θ1, θ2) =
R θ1
0 ∂1v(z, x1(z, θ2))dz, therefore
Z θ1
0
U(θ1, θ2) dθ2 =
Z θ1
0
Z θ1
0
∂1v(z, x1(z, θ2)) dz dθ2
=
ZZ
{0≤θ2<z≤θ1}
∂1v(z, x(z, θ2)

dz dθ2 +
ZZ
{0≤z<θ2≤θ1}
∂1v(z, x(z, θ2)) dz dθ2
=
ZZ
{0≤θ2<z≤θ1}
∂1v(z, x(z, θ2)) dz dθ2 +
ZZ
{0≤θ2<z≤θ1}
∂1v(θ2, x(θ2, z)) dz dθ2
=
ZZ
{0≤θ2<z≤θ1}
h
∂1v(z, x(z, θ2)) + ∂1v(θ2, 1 −x(z, θ2))
i
dz dθ2
≤
ZZ
{0≤θ2<z≤θ1}
∂1v(z, 1) dz dθ2
=
Z θ1
0
hZ z
0
dθ2
i
∂1v(z, 1) dz =
Z θ1
0
z ∂1v(z, 1) dz
=
h
z v(z, 1)
iθ1
0 −
Z θ1
0
v(z, 1) dz = θ1 v(θ1, 1) −
Z θ1
0
v(θ2, 1) dθ2
=
Z θ1
0

v(θ1, 1) −v(θ2, 1)

dθ2.
≤
Z θ1
0
U(θ1, θ2)dθ2
In the first step, we use Myerson lemma to rewrite
R θ1
0 U(θ1, θ2) dθ2 as
R θ1
0
R θ1
0 ∂1v
 z, x(z, θ2)

dz dθ2.
Next, we partition the square [0, θ1] × [0, θ1] into the two congruent right–triangles T1 =
{(z, θ2) | 0 ≤θ2 < z ≤θ1} and T2 = {(z, θ2) | 0 ≤z < θ2 ≤θ1}. Relabelling the variables
on T2 and invoking the identity x(z, θ2) + x(θ2, z) = 1 allow the two contributions to be
combined, yielding the integrand ∂1v
 z, x(z, θ2)

+ ∂1v
 θ2, 1 −x(z, θ2)

.
For the first the inequality, fix a point with θ2 < z. Because θ 7→∂1v(θ, y) is non–
decreasing, we have ∂1v(θ2, 1 −x) ≤∂1v(z, 1 −x). Superadditivity in the second argument
then gives ∂1v(z, x) + ∂1v(z, 1 −x) ≤∂1v(z, 1), so the integrand is bounded above by
∂1v(z, 1).
Since this upper bound depends only on z, the inner integration in θ2 simply contributes
the factor z, leaving
R θ1
0 z ∂1v(z, 1) dz. An elementary integration by parts transforms this
integral into
R θ1
0 [v(θ1, 1) −v(θ2, 1)] dθ2. In the last inequality, we use that U1(θ1, θ2) ≥
v(θ1, 1) −v(θ2, 1).
In short, we showed that U1(θ1, θ2) = v(θ1, 1) −v(θ2, 1) a.s.

Now, let’s show that θ 7→U(θ1, θ) is non-increasing. Let θ2 ≥θ′
2, then
U1(θ1, θ2) =
Z θ1
0
∂1v(z, x1(z, θ2))dz =
Z θ1
0
∂1v(z, 1 −x1(θ2, z))dz
≤
Z θ1
0
∂1v(z, 1 −x1(θ′
2, z))dz =
Z θ1
0
∂1v(z, x1(θ′
2, z))dz
≤
Z θ1
0
∂1v(z, x1(z, θ2))dz = U1(θ1, θ′
2)
Therefore, for every θ, there exists a sequence θi ↑θ such that U1(θ, θi) = v(θ, 1) −
v(θi, 1). So, since θ′ 7→U(θ, θ′) is non-increasing,
U(θ, θ) ≤lim inf
n→+∞U(θ, θi) = 0
so that U(θ, θ) = 0. However, by Myerson lemma
0 = U1(θ, θ) =
Z θ
0
∂1v(z, x1(z, θ))dz,
(12)
so that ∂1v(z, x1(z, θ)) = 0 a.s.
for z ∈[0, θ).
By Lemma 7, if z, x1(z, θ) > 0 then
∂1v(z, x1(z, θ)) > 0.
Assume, toward a contradiction, that there exists z0 > 0 such
that x1(z0, θ) > 0. Because the mapping z 7→x1(z, θ) is non-decreasing, we would have
x1(z, θ) > 0 for every z ∈[z0, θ); hence ∂1v(z, x1(z, θ)) > 0 on that interval. Consequently,
Z θ
0
∂1v(z, x1(z, θ)) dz > 0,
which contradicts 12. Therefore x1(z, θ) = 0 for all z ∈[0, θ).
In the previous lemma, we have established that for the case of two bidders, the al-
location rule always assigns all the item to the highest value bidder. Next, we show by
induction on the number of bidders that in the case of more than two bidders, the item is
also allocated to the highest value bidder:
We claim that for any n ≥2 and any θ′
1 < θ1 := max{θ2, . . . , θn}, Bidder 1 will
not obtain the object if reports θ′
1, i.e. x1(θ′
1, θ2, . . . , θn) = 0. We proceed by induction
on n.
We already know the base case n = 2 is true.
Suppose that the claim is true
for n = k and assume towards contradiction that x1(θ′
1, θ2, . . . , θk+1) > 0 for some θ′
1 <
θ1 := max{θ2, . . . .θk+1}. Since θ 7→x1(θ, θ2, . . . , θk+1) is non-decreasing, by Lemma 7 this
implies that ∂1v(z, x1(z, θ2, . . . , θk+1)) > 0 for all θ ≥θ′
1. Consider the scenario where
there are k bidders, where Bidder 1 has value θ1 and Bidder i has value θi for 2 ≤i ≤k.
If Bidder 1 bids truthfully, his utility payoff is
Z θ1
0
∂1v(z, x1(z, θ2, . . . , θk))dz = 0

by induction hypothesis. However, if Bidder 1 deviates by bidding θ1 himself and creating
a Sybil that bids θk+1, then his utility payoff is (where xi(z) := xi(z, θ−i) and pi(z) :=
pi(z, θ−i) for i = 1, k + 1 and z ∈R+):
v(θ1, x1(θ1) + xk+1(θk+1)) −p1(θ1) −pk+1(θk+1) ≥v(θ1, x1(θ1)) −p1(θ1) + v(θ1, xk+1(θk+1)) −pk+1(θk+1)
≥
Z θ1
0
∂1v(z, x1(z))dz + v(θk+1, xk+1(θ1)) −pk+1(θk+1)
|
{z
}
≥0 By IR
≥
Z θ1
θ′
∂1v(z, x1(z))dz > 0
which contradicts sybil-proofness. To summarize, we have shown that the allocation rule
shall reward the item to the highest bidder (when there is a tie among bids, the symmetry
assumption implies uniform tie-breaking rule) and therefore, by Incentive Compatibility,
the mechanism is the generalized second-price auction with the symmetric tie-breaking
rule.