Market Manipulation: An Adversarial Learning Framework for Detection and
Evasion
Xintong Wang and Michael P. Wellman
University of Michigan, Ann Arbor
xintongw@umich.edu, wellman@umich.edu
Abstract
We propose an adversarial learning framework to
capture the evolving game between a regulator who
develops tools to detect market manipulation and
a manipulator who obfuscates actions to evade de-
tection. The model includes three main parts: (1) a
generator that learns to adapt original manipulation
order streams to resemble trading patterns of a nor-
mal trader while preserving the manipulation intent;
(2) a discriminator that differentiates the adversari-
ally adapted manipulation order streams from nor-
mal trading activities; and (3) an agent-based simula-
tor that evaluates the manipulation effect of adapted
outputs. We conduct experiments on simulated or-
der streams associated with a manipulator and a
market-making agent respectively. We show ex-
amples of adapted manipulation order streams that
mimic a speciﬁed market maker’s quoting patterns
and appear qualitatively different from the original
manipulation strategy we implemented in the sim-
ulator. These results demonstrate the possibility of
automatically generating a diverse set of (unseen)
manipulation strategies that can facilitate the train-
ing of more robust detection algorithms.
Introduction
Market manipulation is deﬁned by the US Securities and Ex-
change Commission as “intentional conduct designed to de-
ceive investors by controlling or artiﬁcially affecting the mar-
ket for a security”. Though it has long been present, manipu-
lation practice has evolved in its forms, and is of increasing
concern with the automation of trading and the interconnect-
edness of ﬁnancial markets [Lin, 2015]. Automated programs
are employed to inject deceitful information, as other traders
make extensive uses of machine learning techniques to extract
information from all possible sources (including the mislead-
ing ones) and execute decisions.
We focus on a speciﬁc but common form of manipulation,
called spooﬁng, which is applied through a series of direct
trading actions in a market. Traders interact with the market
by submitting orders to buy or sell; we refer to the sequence of
such actions taken by an individual trader over a period of time
Figure 1: An example of spooﬁng activities conducted over the course
of 0.6 seconds. A series of large out-of-the money manipulation sell
orders (red triangles) are ﬁrst placed to drive prices down and make
the buy order accepted (the ﬁlled blue triangle). The deceptive sell
orders are immediately replaced with large buy ones (blue triangles)
to push the price up and proﬁt from the sale at a higher price (the
ﬁlled red triangle). Source: UK Financial Conduct Authority.
as the trader’s order stream. Orders that do not execute im-
mediately rest in the order book, a repository for outstanding
offers to trade. At any given time, the order book for a particu-
lar security reﬂects the market’s expressed supply and demand
for that security. A manipulative order stream can be viewed
as a targeted attack [Huang et al., 2011], corrupting the order
book’s signal on supply and demand. False expressions in
the manipulative order are designed to fool traders about the
market state, leading them to alter trading behavior in a way
that will directly move the price and beneﬁt the manipulator.
Fig. 1 illustrates an alleged spooﬁng order stream.
The automated nature of many manipulative strategies has
also spurred efforts to automate detection. Nasdaq recently
announced an AI-based surveillance system trained with his-
torical data and spotted patterns of market-abuse techniques
to detect suspect equities trading practices [Rundle, 2019].
Despite recent advances, developing high-ﬁdelity detection
systems faces the challenge that an adversary often takes steps
to obfuscate their strategies in effort to escape detection (e.g.,
manipulating in a way that appears as normal trading activity).
This causes regulators to play a costly game of cat-and-mouse
with manipulators who constantly innovate to evade.
We propose an adversarial learning framework to reason
about how a manipulator might mask its behavior (represented

as the order stream) to evade detection of a given discrimina-
tive model. The idea is to let a generative model learn to adapt
existing manipulation strategies to resemble characteristics of
normal trading, while preserving a comparable manipulation
effect. A history of adapted order streams that effectively
manipulate are further used to improve the robustness of the
detector. We apply such adversarial reasoning recursively, up-
dating the generator and the discriminator level-by-level, and
characterize the evolution of adapted manipulation strategies.
Our generative model adopts the sequence-to-sequence
paradigm [Sutskever et al., 2014], and takes a manipulation or-
der stream as source and a paired benign trader’s order stream
as target. It learns to adapt the source by minimizing the com-
bination of an adversarial loss and a self-regularization loss.
The adversarial loss is calculated by a discriminator that clas-
siﬁes an order stream as adapted from manipulation or target,
minimized as the output becomes indistinguishable from a
benign trader’s order stream. The self-regularization loss is
a feature-wise distance between the source and the adapted
stream, penalizing large changes between the two to preserve
the manipulation effect.
We conduct experiments and evaluate the proposed
approach using order streams generated by an agent-based
market simulator.1 The simulator models simple manipulation
strategies similar to Fig.1 [Wang and Wellman, 2017], and
can practically produce a large set of order streams associated
with each agent across a variety of market conditions. We
run controlled simulations to acquire order streams associated
with a manipulator (SP) as source, and as target the order
streams that a market-making agent (MM) would have placed
under corresponding market conditions. To help quantify
the manipulation effect, we decompose the SP behavior
into manipulation and exploitation orders, and deﬁne a
baseline order stream (EXP) that omits the manipulation
orders (i.e., those not intended to execute). Our goal here
is to adapt manipulation order streams to resemble market-
making, a legitimate trading role with generally positive
inﬂuence on market efﬁciency [Schwartz and Peng, 2012;
Wah et al., 2017]. Fig. 2 gives an overview of our approach.
Experimental results show that our proposed framework can
generate adapted manipulation order streams that resemble
quoting patterns of a market maker and appear qualitatively
different from the original manipulation strategy we imple-
mented in the simulator. This adaptation evades detection,
but at the cost of compromising effectiveness in manipulation.
After a few iterations of evolving and evading the detector, the
strategy has sacriﬁced almost all of its manipulation capability.
Though it is likely impossible to develop a detector immune
from adversarial attacks, modeling the evasion can be a useful
step toward more robust detection of market manipulation.
Related Work
Agent-Based Models of Market Manipulation
To study
the effects of particular trading practices, researchers classify
market participants into different roles based on their trading
1Learning from real market data is infeasible, as actual order
streams identiﬁed as manipulation do not exist in any substantial
quantity.
(a) Update the generator and the discriminator level-by-level.
(b) Given a ﬁxed detector Dl−1, train Gl to generate SPl.
Figure 2: Overview of our approach. We start with a classiﬁer D0
that discriminates between SP and MM order streams. In response, a
generator G1 learns to adapt SP order streams, producing SP1 that
can evade detection by D0. SP1 order streams are then incorporated
to train the next-level discriminator D1. We apply such adversarial
reasoning recursively, producing a sequence of adapted manipulators
and corresponding increasingly robust detectors.
intent and activity patterns (e.g., trading volume, frequency,
position). An agent-based market simulator designs agents
around such roles, and reproduces “stylized facts” observed in
real ﬁnancial markets through strategic interactions of these
agents [LeBaron, 2006; Kirilenko et al., 2017].
In prior work, we developed an agent-based model of mar-
ket manipulation [Wang and Wellman, 2017], demonstrating
settings where a manipulation agent can effectively deceive
approximately rational background traders through spooﬁng.
Speciﬁcally, in markets populated with background learning
traders who bid based on beliefs induced from market obser-
vations including the malicious activities, the manipulator is
able to push prices signiﬁcantly higher than they would be oth-
erwise, and proﬁt from this manipulation. Since background
trading agents react to different market conditions according
to their codiﬁed strategies, the model can verify manipula-
tion intent and quantify its impact by conducting controlled
experiments of markets with and without a spooﬁng agent.
Learning via Adversarial Training
There is a substantial
body of work on adversarial training [Goodfellow et al., 2015;
Tzeng et al., 2017; Volpi et al., 2018; Sinha et al., 2018],
investigating a variety of training procedures designed to learn
models robust to (adversarial) perturbations in the input. Many
of these approaches involve augmenting training dataset with
examples from a target domain that is considered “hard” under
the current model. A key issue addressed in some but not all
of this work is to preserve speciﬁed properties of the source
domain while generating adversarial examples to improve
robustness.
Our approach draws particular inspiration from Shrivastava

0
1000 2000 3000 4000 5000
Time
99000
99400
99800
100200
100600
101000
Price
(a) EXP (baseline).
0
1000 2000 3000 4000 5000
Time
99000
99400
99800
100200
100600
101000
Price
(b) SP (source).
0
1000 2000 3000 4000 5000
Time
99000
99400
99800
100200
100600
101000
Price
(c) MM (target).
Figure 3: Order streams associated with EXP, SP, and MM in a set of controlled simulations. During the execution stage (time before 1000),
both EXP and SP bought one share of the security at price 99,908. Then, SP maintained manipulation buy orders at a tick behind the best bid to
push the price up. As a result, SP managed to sell the share at price 100,102, whereas EXP sold the share at 100,044.
et al. [2017], who proposed Simulated + Unsupervised (S+U)
learning. The idea is to train a generative model to improve the
realism of simulated images using unlabeled real ones, while
preserving the annotation information from the simulator. A
pixel-level loss is further imposed between the simulated input
and the generated image to enforce annotation. Experimen-
tal results show that S+U learning enables the generation of
highly realistic images with reliable labels and helps to im-
prove learning models’ performance on classiﬁcation tasks,
including gaze estimation and hand pose estimation. Our work
extends the approach to adapt simulated order streams while
preserving the intent behind the original sequence of actions.
Formulation and Model
3.1
Trading Strategies and Representations
We follow prior work [Wang and Wellman, 2017; Wang et
al., 2018; Wah et al., 2017] in the design of manipulation and
market-making strategy, extending each with a bit of ﬂexibility
to reduce overﬁtting to artifacts. We describe the trading
strategies and their representations as order streams below.2
Manipulation Strategy (SP)
During each simulation run,
the manipulator aims to maneuver prices either up or down
with equal probability. We elaborate the case of manipulat-
ing prices up, and the other applies vice versa. The strategy
includes three stages. During the ﬁrst execution stage, the
agent buys by accepting any sell order at price lower than the
fundamental mean ¯r. In the next manipulation stage, it stops
buying and instead maintains large manipulation buy limit or-
ders at price one tick below the best bid. The goal is to falsely
signal demand to push price up so that the units bought earlier
can be sold at higher prices later. During the last stage, the
manipulator starts to sell the units by accepting any buy orders
at a price higher than ¯r. The agent continues to manipulate
until the trading period ends or all the bought units are sold.
Market-making Strategy (MM)
Upon each arrival, the
market maker submits a quote ladder centered around an es-
timate of the terminal fundamental value of the underlying
security, denoted by ˆrt. Speciﬁcally, the quote ladder is de-
cided by three strategic parameters ω, K, ζ that respectively
2Since an order stream is a sequence of actions incurred by a
strategy, we refer to a strategy and order streams associated with that
strategy interchangeably.
control the quote spread, number of price levels, and the num-
ber of ticks between two adjacent prices:
(
[Bt −Kζ, . . . , Bt −(K −β)ζ]
for buy orders
[St + (K −α)ζ, . . . , St + Kζ]
for sell orders,
(1)
where Bt = ˆrt −ω/2, St = ˆrt + ω/2, and α and β truncate
the price ladder such that limit orders do not immediately
transact with the market’s current best bid and ask. We add
Gaussian noise around each price in Eq. (1) and its associated
quantity to mitigate certain artifacts (e.g., prices separated by
an equal distance). Since quote ladders are symmetrically cen-
tered around unbiased estimations of the terminal fundamental
value, the MM orders in expectation do not distort learning
traders’ pricing beliefs. The MM agent follows the same ar-
rival schedule as the manipulator to produce a paired target
order stream, which records orders that would have placed
under market conditions encountered by the manipulator.
Exploitation
Strategy
(EXP)
The
exploitation
order
streams serve as the control group to measure the effect of
manipulation orders. The strategy executes the same buy and
sell scheme as the SP strategy during the ﬁrst and last stage
without placing any manipulation order.
Order Stream Representation
An order stream records a
sequence of (hypothetical) actions associated with an agent. It
is represented by a variable-length sequence with an element
corresponding to each time an agent arrives and submits a bid
schedule. A bid schedule comprises a set of limit orders, each
specifying a price (expressed by distance to market quote) and
a quantity. Fig. 3 shows order streams respectively associated
with EXP, SP, and MM in a set of controlled simulations.
3.2
The Model
We use the market simulator to generate a dataset of labeled or-
der streams D = {(wi, EXP), (xi, SP), (yi, MM)}N
i=1, where
wi, xi, and yi denote order streams incurred by their respective
strategies under one set of controlled simulations (like those
in Fig. 3). The goal here is to adapt the simulated SP order
streams to become indistinguishable from the MM ones while
preserving some manipulation effect.
Model Overview
Our generator adopts the sequence-to-
sequence paradigm [Sutskever et al., 2014], which consid-
ers the interconnection between bid schedules within a se-
quence (e.g., a manipulator who buys ﬁrst is more likely to

manipulate price up and later sell). It has an encoder-decoder
structure Gθ = (Genc, Gdec), where θ denotes the function
parameters. This encoder-decoder model has been widely
used in tasks that require sequence-to-sequence learning, such
as the statistical machine translation [Sutskever et al., 2014;
Cho et al., 2014] and sentence generation [Logeswaran et
al., 2018]. The encoder adopts a recurrent neural network
(RNN) that takes an order stream x as input and produces a
ﬁxed-length latent representation vector zx := Genc(x). The
vector contains compressed information of the input (e.g., ma-
nipulate prices up or down), and is decoded by Gdec, a second
RNN that generates x′ ∼pGdec(·|zx) to resemble characteris-
tics of the target domain y. The discriminator Dφ also uses an
RNN component followed by a linear layer, and outputs the
probability of an input being an adapted order stream.
A Recursive Training Procedure
We propose a recursive
training procedure of the generator and the detector (depicted
in Fig. 2a), designed to mimic the adversarial reasoning be-
tween a manipulator and a regulator. The manipulator starts by
playing the SP strategy that is codiﬁed in our market simulator,
and the regulator develops detector D0 to distinguish manipu-
lation order streams from MM streams. The manipulator then
constructs its next-level strategy SP1 by learning a generator
G1 to adapt SP, such that the adapted order streams can evade
the detection of D0 and preserve a comparable manipulation
effect. To achieve both aims, the generator is trained to mini-
mize a combination of adversarial loss and regularization loss
(depicted in Fig. 2b), which we describe in detail below. In
response, a new detector D1 is trained to identify both the
original manipulation strategy SP and the evolved one SP1.
We apply such reasoning recursively to generate adversarial
manipulation activities, so as to improve the robustness of a
detector.
Adversarial Loss
We follow the GAN setup [Goodfellow et
al., 2014] which models the generator and the discriminator as
a two-player minimax game. During training, the level-l dis-
criminator network Dl updates its parameters φl to minimize
the following loss:
LD(φl) = −
X
i
log(D(x′
i; φl)) −
X
i
log(1 −D(yi; φl)),
(2)
where x′
i represents some learned (or identity) transformation
of xi, and D(·) denotes the probability of the input order
stream either associated with or adapted from SP.
We ﬁx the discriminator Dl−1 and train the level-l generator
Gl to maximize the probability of Dl−1 making a mistake.
Speciﬁcally, it learns θl by minimizing the adversarial loss:
Ladv
G (θl) = −
X
i
log(1 −Dl−1(G(xi; θl))).
(3)
Self-Regularization Loss
To preserve manipulation effect,
we combine the adversarial loss with a self-regularization
loss that penalizes any difference between the adapted and
original order stream. This can be interpreted as a manipulator
preference to adapt its original manipulation strategy as little
as possible to evade detection. We deﬁne regularization loss
as the mean squared error between the input and the adapted
order stream:
Lreg
G (θl) = 1
N
X
i
∥G(xi; θl) −xi∥2
2 ,
(4)
Payoff
Manipulation
Effect
Transaction
Risk
Dl−1
(%)
Dl
(%)
SP
411∗,∗∗
0
-
SP1
362∗,∗∗
0.50
0.14
0.59
SP2
310∗
0.30
0.26
0
SP3
303∗
0.22
0.59
0
MM
0.15
0.85
EXP
324∗
0
0
-
-
Table 1: Summary statistics of the respective trading strategy on test
dataset. Asterisks denote statistical signiﬁcance at 5% level of the
paired t-test for payoffs compared to MM(∗) and EXP(∗∗).
where ∥·∥2 is the L2 norm. The overall loss for G is LG =
Ladv
G + λLreg
G , where λ is a hyperparameter.
Measuring Manipulation Effect
We evaluate the manip-
ulation effect of an adapted order stream x′
i := Gl(xi) by
feeding it back to the market simulator under the same set of
experimental controls. That is, we compare the effects under
scenarios where background traders are guaranteed to arrive
at the same time, receive identical private values, and observe
the same fundamental values as in simulations that generate
wi, xi, and yi. Any change in background bidding behavior
can therefore be attributed to the adapted order stream.
We compare market outcomes incurred by the adapted order
stream to those of markets with SP and EXP, and measure the
manipulation intensity and transaction risk. The manipulation
intensity of x′
i, denoted by δx′
i, is deﬁned as the fraction of the
price deviation realized by x′
i in that of the SP order stream:
δx′
i =









min
n
max
nPx′
i −Pwi
Pxi −Pwi
, 0
o
, 1
o
if Pxi > Pwi
min
n
max
nPwi −Px′
i
Pwi −Pxi
, 0
o
, 1
o
otherwise,
(5)
where Pwi, Pxi, and Px′
i denote the average transaction price
in respective markets since the start of the manipulation stage.
The higher the manipulation intensity is, the better x′
i preserves
the manipulation effect. Transaction risk is deﬁned as the ratio
between the number of transactions and the number of arrivals
during the manipulation phase. By deﬁnition, SP and EXP
have manipulation intensity one and zero, respectively, and
both exhibit transaction risk zero.
Experimental Results
We follow the proposed framework and generate adversarial
order streams by adapting the simulated SP order streams to
look like quoting patterns of a market maker. We visualize
examples of adapted manipulation activities, and demonstrate
the competing improvement between the adapted manipulation
strategies and the detectors.
4.1
Dataset and Implementation Details
We conduct simulations using the agent-based market simu-
lator, and generate 10,944 groups of labeled order streams
{(wi, EXP), (xi, SP), (yi, MM)} (out of 30,000 controlled

−2
−1
0
Distance to Best Quotes (x1000)
0.000
0.001
0.002
0.003
Density
SP
SP1
SP2
SP3
MM
(a) Price distribution.
0
Order Quantity
0.00
0.05
0.10
0.15
0.20
Density
SP
SP1
SP2
SP3
MM
(b) Quantity distribution.
0
Order Imbalance Ratio
0.0
0.2
0.4
0.6
0.8
1.0
1.2
Density
SP
SP1
SP2
SP3
MM
(c) Order imbalance distribution.
Figure 4: Comparisons of the respective statistics on the SP order streams, adapted outputs, and MM order streams.
0.0
0.2
0.4
0.6
0.8
1.0
Manipulation Intensity
0.0
0.2
0.4
0.6
0.8
1.0
Transaction Risk
0.0
0.2
0.4
0.6
0.8
1.0
(a) SP1.
0.0
0.2
0.4
0.6
0.8
1.0
Manipulation Intensity
0.0
0.2
0.4
0.6
0.8
1.0
Transaction Risk
0.0
0.2
0.4
0.6
0.8
1.0
(b) SP2.
0.0
0.2
0.4
0.6
0.8
1.0
Manipulation Intensity
0.0
0.2
0.4
0.6
0.8
1.0
Transaction Risk
0.0
0.2
0.4
0.6
0.8
1.0
(c) SP3.
0.0
0.2
0.4
0.6
0.8
1.0
Manipulation Intensity
0.0
0.2
0.4
0.6
0.8
1.0
Transaction Risk
0.0
0.2
0.4
0.6
0.8
1.0
(d) MM.
Figure 5: The manipulation effect of order streams associated with the corresponding level of SP strategy. Each color of a cell encodes the
cumulative density of order streams that achieve a certain manipulation intensity and transaction risk. The closer dark blue is to the bottom
right, the better adapted order streams are able to preserve higher manipulation intensity with lower transaction risk.
simulation runs).3 Each trading session lasts 5000 time steps,
and the generated order streams have lengths varying from 4
to 91. The ﬁrst execution stage is from time 200 to 1000, after
which the manipulation agent starts to spoof. At time 2000,
it begins to liquidate previously accumulated positions. The
underlying security has a fundamental mean ¯r = 105. Based
on estimations of the ﬁnal fundamental value, the MM submits
a quote ladder with ω = 256, K = 8, ζ ∼N(128, 10), and
quantity q ∼N(5, 2). We use 8,896 groups of order streams
for training (with a 80/20 train-validation split) and the rest
2,048 groups for testing.
We use a bi-directional Gated Recurrent Unit (GRU) RNN
[Cho et al., 2014] with a hidden state size of 64, followed by
a linear layer for both Genc, Gdec, and D in the experiments.
Since order streams are of variable lengths, we pad them to
the maximum length for forward passes, and cut them back
to original lengths for loss calculations and evaluations. We
initialized the model parameters with the uniform distribution
between -0.08 and 0.08. We use batches of 64 order streams
to train the discriminator and the generator, and pick weight
of the self-regularization loss λ = 1 based on the validation
performance.
4.2
Generating Adapted Manipulation Examples
We evaluate the adversarially adapted order streams from
three main aspects: (1) similarity to the MM quoting patterns,
(2) preservation of manipulation effect, and (3) effectiveness
3We keep valid simulations where the manipulator successfully
trades during the ﬁrst stage (so that there is an incentive to spoof),
and pushes prices to its desired direction by at least ten ticks.
in evading the detection of an existing discriminator. Table 1
presents summary statistics of order streams associated with
their corresponding trading strategies (or generative models).
We discuss each aspect in detail below.
Comparing to MM
We follow prior work [Li et al., 2020]
in using price and quantity distributions to measure how well
the generated order streams resemble the target MM streams.
We further propose a domain-speciﬁc measure, the order im-
balance distribution, deﬁned as the ratio between the num-
bers of buy and sell orders submitted over a trading period
(whichever value is larger on the numerator). This captures
a trader’s imbalance in preference between long and short
positions. Fig. 4 presents comparisons of the respective dis-
tributions. We ﬁnd the adapted manipulation order streams
produce distributions similar to that of the MM, and are able
to overcome artifacts codiﬁed in the SP strategy (e.g., large-
quantity orders always at one tick behind the best quotes and
severe order imbalance to deceive the market). Speciﬁcally, we
ﬁnd that orders are gradually adapted to cover a wider range
of prices with relative small quantities, and order balance is
roughly maintained throughout the trading period.
Preserving Manipulation Effect
We feed adapted order
streams back to the market simulator under the same set of
experimental controls, and measure their manipulation effect
by the manipulation intensity and transaction risk as deﬁned
in Sec. 3.
Fig. 5 shows the two-dimensional cumulative
density over the 2,048 adapted outputs with respect to the two
proposed metrics. We ﬁnd that SP1 can preserve a comparable
manipulation intensity under a reasonable transaction risk;
however, as the generator adapts in response to a more robust

Sell
Buy
0
Limit Sell Order
Limit Buy Order
Transacted Sell
Transacted Buy
Figure 6: Examples of adapted manipulation order streams. Dashed black lines represent the latest transaction prices, whereas dashed grey
lines the transaction prices if no manipulation exists.
discriminator, the adapted streams become to suffer a large
degradation in manipulation intensity and an increase in trans-
action risk (e.g., SP3 has a similar performance to MM). This
weakened manipulation effect is further conﬁrmed in Table 1.
Evading the Detection
Table 1 shows that a generator can
easily fool an existing detector with adversarially generated
order streams. By learning from a history of adapted or-
der streams, the discriminator is able to detect manipulation
streams from all previous levels, and in the meantime ensures
the training stability of the next-level generator.
Qualitative Evaluation
Fig. 6 demonstrates examples of
the original and its corresponding adapted manipulation
order streams. We observe that the adapted streams become
qualitatively similar to the trading patterns of a MM, and
such simultaneous quoting behavior on both sides of the
market has indeed been suggested as a good strategy for high
frequency traders to mask their manipulative intent [Levens,
2015]. We note several other ﬁndings from the evolution of
adapted manipulation strategies. First, SP1 remains to place
large orders close to the market best quote, whereas SP2 and
SP3 choose to either largely decrease the order quantity or
place large orders behind smaller ones to avoid being detected.
Second, SP2 and SP3 tend to submit orders at more aggressive
prices across market quotes, and this may cause unintended
transactions during the manipulation phase.
Conclusion
We employ an adversarial learning framework to model the
evolving game between a regulator and a manipulator, in
which the regulator deploys algorithms to detect manipulation
and the manipulator masks actions to evade detection. Evasion
is represented by a generative model, trained by augmenting
manipulation order streams with examples of market making
activity traces. The intent is to produce adapted streams that
are hard to distinguish from a market maker’s behavior. We
visualize examples of adapted manipulation order streams, and
show they resemble quoting patterns of a market maker and
appear qualitatively different from the original manipulation
strategy we implemented in the simulator. This adaptation
evades detection, but only at the cost of compromising ef-
fectiveness in market manipulation. After a few iterations of
evolving and evading the detector, the strategy has sacriﬁced
almost all of its manipulation capability.
Our results reﬂect the speciﬁc modeling and simulation
choices adopted, and thus it remains to be seen whether a
more clever form of adaptation can evade detection while
retaining more effectiveness in manipulation. Whether or not
it is possible to ultimately craft successful adversarial attacks,
the generation and evasion process modeled here provides a
way to anticipate the evolution of evasive adversaries. Such
anticipation capacity provides a way to develop more robust
detection methods, for market manipulation as well as other
fraudulent behaviors.
Acknowledgments
This work was supported in part by the US National Science
Foundation IIS-1741190.

References
[Cho et al., 2014] Kyunghyun Cho, Bart van Merri¨enboer,
Caglar Gulcehre, Dzmitry Bahdanau, Fethi Bougares, Hol-
ger Schwenk, and Yoshua Bengio. Learning phrase rep-
resentations using RNN encoder–decoder for statistical
machine translation. In Empirical Methods in Natural Lan-
guage Processing, pages 1724–1734, 2014.
[Goodfellow et al., 2014] Ian Goodfellow,
Jean Pouget-
Abadie, Mehdi Mirza, Bing Xu, David Warde-Farley, Sher-
jil Ozair, Aaron Courville, and Yoshua Bengio. Generative
adversarial nets. In International Conference on Neural
Information Processing Systems, pages 2672–2680, 2014.
[Goodfellow et al., 2015] Ian Goodfellow, Jonathon Shlens,
and Christian Szegedy. Explaining and harnessing adver-
sarial examples. In International Conference on Learning
Representations, 2015.
[Huang et al., 2011] Ling Huang, Anthony D. Joseph, Blaine
Nelson, Benjamin I.P. Rubinstein, and J. D. Tygar. Ad-
versarial machine learning.
In Proceedings of the 4th
ACM Workshop on Security and Artiﬁcial Intelligence, page
43–58, 2011.
[Kirilenko et al., 2017] Andrei A. Kirilenko, Albert S. Kyle,
Mehrdad Samadi, and Tugkan Tuzun. The ﬂash crash:
High frequency trading in an electronic market. Journal of
Finance, 72:967–998, 2017.
[LeBaron, 2006] Blake LeBaron. Agent-based computational
ﬁnance. Handbook of Computational Economics, 2:1187–
1233, 2006.
[Levens, 2015] Tara E. Levens. Too fast, too frequent? High-
frequency trading and securities class actions. University
of Chicago Law Review, 82:1511–1558, 2015.
[Li et al., 2020] Junyi Li, Xintong Wang, Yaoyang Lin,
Arunesh Sinha, and Michael P. Wellman. Generating real-
istic stock market order streams. In 34th AAAI Conference
on Artiﬁcial Intelligence, 2020.
[Lin, 2015] Tom C. W. Lin. The new market manipulation.
Emory Law Journal, 66:1253–1314, 2015.
[Logeswaran et al., 2018] Lajanugen Logeswaran, Honglak
Lee, and Samy Bengio. Content preserving text generation
with attribute controls. In International Conference on
Neural Information Processing Systems, pages 5108–5118,
2018.
[Rundle, 2019] James Rundle. Nasdaq deploys AI to detect
stock-market abuse. Wall Street Journal, 2019.
[Schwartz and Peng, 2012] Robert A Schwartz and Lin Peng.
Market makers. Encyclopedia of Finance, 2012.
[Shrivastava et al., 2017] Ashish Shrivastava, Tomas Pﬁster,
Oncel Tuzel, Josh Susskind, Wenda Wang, and Russell
Webb. Learning from simulated and unsupervised images
through adversarial training. In IEEE Conference on Com-
puter Vision and Pattern Recognition, pages 2242–2251,
2017.
[Sinha et al., 2018] Aman Sinha, Hongseok Namkoong, and
John Duchi. Certiﬁable distributional robustness with prin-
cipled adversarial training. In International Conference on
Learning Representations, 2018.
[Sutskever et al., 2014] Ilya Sutskever, Oriol Vinyals, and
Quoc V. Le. Sequence to sequence learning with neural net-
works. In International Conference on Neural Information
Processing Systems, pages 3104–3112, 2014.
[Tzeng et al., 2017] E. Tzeng, J. Hoffman, K. Saenko, and
T. Darrell. Adversarial discriminative domain adaptation.
In IEEE Conference on Computer Vision and Pattern Recog-
nition, pages 2962–2971, 2017.
[Volpi et al., 2018] Riccardo Volpi, Hongseok Namkoong,
Ozan Sener, John Duchi, Vittorio Murino, and Silvio
Savarese. Generalizing to unseen domains via adversarial
data augmentation. In International Conference on Neural
Information Processing Systems, pages 5339–5349, 2018.
[Wah et al., 2017] Elaine Wah, Mason Wright, and Michael P.
Wellman. Welfare effects of market making in continuous
double auctions. Journal of Artiﬁcial Intelligence Research,
59:613–650, 2017.
[Wang and Wellman, 2017] Xintong Wang and Michael P.
Wellman. Spooﬁng the limit order book: An agent-based
model. In International Conference on Autonomous Agents
and Multiagent Systems, pages 651–659, 2017.
[Wang et al., 2018] Xintong Wang, Yevgeniy Vorobeychik,
and Michael P. Wellman. A cloaking mechanism to mitigate
market manipulation. In International Joint Conference on
Artiﬁcial Intelligence, pages 541–547, 2018.