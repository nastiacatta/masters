An Adversarially Robust Data Market for Spatial, Crowd-sourced Data
AIDA MANZANO KHARMAN, CHRISTIAN JURSITZKY, QUAN ZHOU, and
PIETRO FERRARO, Imperial College London, London, United Kingdom
JAKUB MARECEK, Czech Technical University, Prague, Czech Republic
PIERRE PINSON and ROBERT SHORTEN, Imperial College London, London, United Kingdom
We describe an architecture for a decentralised data market for applications in which agents are incentivised to collaborate to
crowd-source their data. The architecture is designed to reward data that furthers the market’s collective goal, and distributes
reward fairly to all those that contribute with their data. We show that the architecture is resilient to Sybil, wormhole and data
poisoning attacks. In order to evaluate the resilience of the architecture, we characterise its breakdown points for various
adversarial threat models in an automotive use case.
CCS Concepts: • Computer systems organization →Peer-to-peer architectures; • Information systems →Database
design and models; • Security and privacy →Access control; Digital rights management; Privacy-preserving protocols;
Domain-specific security and privacy architectures;
Additional Key Words and Phrases: Smart Cities, Security and Privacy, Service-Oriented Architecture, Crowd Sensing and
Crowd Sourcing, Cyber-Physical Systems, Data Management and Analytics, Data markets for mobility applications
ACM Reference format:
Aida Manzano Kharman, Christian Jursitzky, Quan Zhou, Pietro Ferraro, Jakub Marecek, Pierre Pinson, and Robert Shorten.
2025. An Adversarially Robust Data Market for Spatial, Crowd-sourced Data. Distrib. Ledger Technol. 4, 4, Article 33
(October 2025), 20 pages.
https://doi.org/10.1145/3703464
Introduction
In recent years there has been a shift in many industries towards data-driven business models [50]. Traditionally,
users have made collected data available to large platform providers, in exchange for services (for example, Web
search). However, the fairness and even ethics of these business models continue to be questioned, with more
This work has received funding from IOTA Foundation and the European Union’s Horizon Europe research and innovation programme under
grant agreement No. 101070568. This work was also supported by Innovate UK under the Horizon Europe Guarantee; UKRI Reference Number:
10040569 (Human-Compatible Artificial Intelligence with Guarantees (AutoFair)). Specifically, A. M. Kharman, Ch. Jursizky, P.Ferraro, and R.
Shorten were funded by Iota Foundation. J. Marecek was funded by the European Commission. Q. Zhou was funded by Innovate UK.
Authors’ Contact Information: Aida Manzano Kharman, Imperial College London, London, United Kingdom; e-mail: aida.manzano-
kharman17@imperial.ac.uk; Christian Jursitzky, Imperial College London, London, United Kingdom; e-mail: jursitzky.christian@gmail.com;
Quan Zhou, Imperial College London, London, United Kingdom; e-mail: q.zhou22@imperial.ac.uk; Pietro Ferraro, Imperial College London,
London, United Kingdom; e-mail: p.ferraro@imperial.ac.uk; Jakub Marecek, Czech Technical University, Prague, Czech Republic; e-mail:
jakub.marecek@fel.cvut.cz; Pierre Pinson, Imperial College London, London, United Kingdom; e-mail: p.pinson@imperial.ac.uk; Robert
Shorten (corresponding author), Imperial College London, London, United Kingdom; e-mail: r.shorten@imperial.ac.uk.
Permission to make digital or hard copies of all or part of this work for personal or classroom use is granted without fee provided that
copies are not made or distributed for profit or commercial advantage and that copies bear this notice and the full citation on the first page.
Copyrights for components of this work owned by others than the author(s) must be honored. Abstracting with credit is permitted. To copy
otherwise, or republish, to post on servers or to redistribute to lists, requires prior specific permission and/or a fee. Request permissions from
permissions@acm.org.
© 2025 Copyright held by the owner/author(s). Publication rights licensed to ACM.
ACM 2769-6480/2025/10-ART33
https://doi.org/10.1145/3703464
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

33:2
•
A. M. Kharman et al.
stakeholders arguing that such platforms should recompense citizens in a more direct manner [5, 6, 25, 52]. This
poses many challenges that need to be solved to address new data ownership models.
The first one regards fair recompense to the data harvester by data-driven businesses. While it is true that users
receive value from companies in the form of the services their platforms provide (e.g., Google Maps), it is not
clear that the exchange of value is fair. The second one arises from the potential for unethical behaviours that are
inherent to the currently prevailing business models. Scenarios in which such behaviour has emerged arising out
of poor data-ownership models are well documented. Examples of these include Google Project Nightingale,1,2
where sensitive medical data were collected of patients that could not opt out of having their data stored in Google
Cloud servers. Patients were not informed of this deal. Finally, another challenge is related to the reliability of the
data. Often, the data are generated by users and it is not clear how to protect the system against malicious users
that might try to exploit it (e.g., by providing fake data).
The challenges above call for a novel infrastructures to track and trade data ownership. These infrastructures
can be classified as being either centralised, in which an oracle looks after security and management issues,
or decentralised in which trust and security is encoded as part of the data market peer-to-peer protocol. The
design of such markets is not new and there have been numerous attempts to design marketplaces to enable the
exchange of data for money [8, 18, 43, 51]. This, however, is an extremely challenging endeavour. Data cannot be
treated like a conventional commodity due to certain properties it possesses. It is easily replicable; its value is
time-dependant and intrinsically combinatorial; and dependent on who has access to the dataset. It is also difficult
for companies to know the value of the dataset a priori, and verifying its authenticity is challenging [2]. Our
particular interest is in developing a data market design that is hybrid in nature; hybrid in the sense that some
non-critical components of the market are provided by trusted infrastructure, but where the essential components
of the market place, governing ownership, trust, data veracity and so on, are all designed in a decentralised
manner. This data market is designed for crowd-sourced sensing applications with a view to: (i) achieving a
verifiable exchange of data ownership between sellers and buyers; (ii) given an oversupply of data, ensuring that
participating agents receive a fair amount of writing access rights to the market; (iii) automatically selecting
data points, from all those available, to add the most value to the data market’s collective goal; and (iv) being
robust in adversarial environments by providing protection against Sybil attacks, Wormhole attacks and Data
Poisoning attacks (defined below). Further, we characterise its breakdown points for various adversarial threat
models in an automotive use case. Finally, to illustrate the potential utility of the data market, we consider a
specific use case in a smart mobility environment that, we hope, might represent a first step towards more general
architectures. In this setting, drivers of vehicles within a smart city wish to monetise the data harvested from
their cars’ sensors [33]. This use case, while simplifying several aspects, still captures many pertinent aspects of
more general data market design: for example, detection of fake data, certification of data-quality and resistance
to adversarial attacks.
To summarise, the contributions of this article are:
—We propose the architecture for a data market. The architecture is resilient against a number of attack vector
and has guarantees of fairness and privacy.
—A novel Proof-of-Work (PoW) mechanism that is adaptive, useful for the functioning of the market and
fair by design.
—We propose an alternative formulation for the Maximum Entropy Voting (MEV) algorithm, called
Combination-MEV (C-MEV) and we propose a novel application of this algorithm in the context of this
work.
1https://www.bbc.co.uk/news/technology-50388464
2https://www.theguardian.com/technology/2019/nov/12/google-medical-data-project-nightingale-secret-transfer-us-health-information
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

An Adversarially Robust Data Market for Spatial, Crowd-sourced Data
•
33:3
The remainder of this article is organised as follows: After an overview of related work in Section 2, we present
a high-level description of the architecture for the data market in Section 3, as well as describing how each
functional component contributes to achieving the desired properties. Then in Section 4 we proceed to formalise
the definitions used in each component of the data market and describe each component of the data market in
detail. Finally, in Section 6, we describe the attacks considered and the resilience of the architecture to those.
Related Work on Data Market Design
Numerous authors have proposed centralised [2, 15, 26, 34, 35, 41, 44, 54] and decentralised [8, 18, 22, 39, 43, 48,
54] data markets, recently. Industry-specific data markets, e.g., in power systems, agricultural or IoT sensor data
[1, 17], are also proliferating. Some recent decentralised implementations include Catena-X [36], Ocean Protocol
[40] and Data Broker DAO [55]. Of the decentralised data market proposals, most use Blockchain architectures
as a basis for their work. However, these proposals often fail to address Blockchain design flaws that rapidly
become exposed in the context of data markets [22, 43, 54]. For example, PoW-based Blockchains reward miners
with the most computational power. Aside from the widely discussed issue of energy waste, Blockchain-based
systems also typically use commission-based rewards to guide the interaction between users of the network,
and Blockchain miners. Such a miner-user interaction mechanism is not suitable in the context of data markets,
effectively prioritising wealthier users’ access to the data market. In addition, miners with greater computational
power are more likely to earn the right to append a block, and thus earn the commission. This reward can then be
invested in more computational power, leading to a positive feedback loop where more powerful miners become
more and more likely to write blocks and earn more commissions. Similarly, the wealthier agents are the ones
more likely to receive service for transactions of higher monetary value. This could cause traditional PoW-based
Blockchains to centralise over time [10]. It is worth noting that centralised solutions to data markets already
exist, such as [11], which namely focus on implementing methods to share and copy data, and to protect certain
rights to it, such as read rights. Furthermore, none of these implementations consider the security concern of
selling artificially generated data. They do ensure that the posted metadata matches the sold data, but there
is no method to ensure that the data that are sold are of good quality, sound and real. Instead, they trust that
the seller is honest, or incorporate the assumption that a reputation mechanism exists to filter agents based on
trustworthiness. Our work addresses these security concerns by proposing an architecture that is resilient to
data poisoning (i.e., injection of fake data streams) and wormhole attacks (i.e., claiming data have been collected
from one location, when in fact it has been collected from elsewhere). Another possible categorisation of prior
work relates to the trust assumptions made in the system design. The work in [44] assumes that upon being
shared, the data are reported truthfully and fully. In practice, this assumption rarely holds. This assumption
is justified in their work by relying on a third-party auditor, which the authors of [54] also utilise. However,
introducing an auditor simply shifts the trust assumption to their honest behaviour and forgoes decentralisation.
In [2], it is identified that the buyer may not be honest in their valuation of data. They propose an algorithmic
solution that prices data by observing the gain in prediction accuracy that it yields to the buyer. However, this
comes at the cost of privacy for the buyer: They must reveal their predictive task. In practice, many companies
would not reveal this Intellectual Property, especially when it is the core of their business model. The work
of [37] is an example of a publicly verifiable decentralised market. Their system allows for its users to audit
transactions without compromising privacy. Unfortunately, their ledger is designed for the transaction of a finite
asset: Creating or destroying the asset will fail to pass the auditing checks. For the transaction of money this is
appropriate: It should not be possible to create or destroy wealth in the ledger (aside from public issuance and
withdrawal transactions). However, for data this does not hold. Users should be able to honestly create assets
by acquiring and declaring new datasets they wish to sell. Furthermore, their cryptographic scheme is built to
transfer ownership of a single value through Pedersen commitments.
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

33:4
•
A. M. Kharman et al.
As we have mentioned, the data market architecture considered in this article deviates from those traditionally
considered in the literature (such as those mentioned above) in a number of key aspects. First, rather than
being centralised, or decentralised, our architecture is hybrid in nature. Secondly, in our data market, the trust
assumptions are embedded in consensus mechanisms that can be verified by all agents using the market place. In
other words, the users of a data market have a means to agree on what they trust, and verify that this agreement
was reached in a correct and honest manner.
A Hybrid Data Market Architecture
Here we present a high-level overview of the proposed architecture. We begin by reminding the reader that the
data market is designed to operate in crowd-sourced environments, where the following conditions prevail:
(1) For each potential data point that can made available in the data market there is an over-supply of
measurements, as is the case, for example, in many crowd-sourcing applications.
(2) Competing sellers are interested in aggregating (crowd-sourcing) data points from the market to fulfil a
specific purpose. For example, in applications in which sensors measure environmental quantities (rainfall,
pollution levels), data may be aggregated to increase robustness, or simply to provide a macroscopic view
of the measurements.
(3) Buyers agree to only purchase data from the market, and that each data point in the market has a unique
identifier so that replicated data made available on secondary markets can be easily detected by data
purchasers. This may seem like a strong assumption. Why would buyers wish to purchase data from this
market? Because our proposal offers increased data quality, reliability and trustworthiness. The protocol is
resilient against injections of fake data, so buyers have security guarantees: They will not be acquiring
bogus data.
(4) There is a mechanism that can verify the geographical location of an agent at time of data collection with a
certain degree of confidence. One such technique is given in [23].
In many mobility applications, where cars are used as sensing devices, many, if not all, of the above conditions
prevail. To illustrate this, consider applications where cars seek to monetise information associated with their
geographical location. First, agents present a valid proof of their identity and location, as well as demonstrating
that their information is timely and relevant. Agents that succeed receive a validity token that allows them to
form spatial coalitions with other agents in their proximity. Each agent measures data points from a location
quadrant. These data points are then aggregated by an elected committee of agents from a spatial coalition of that
location quadrant. The spatial coalition provides an objective function, that is used to determine the utility of said
data. It is then possible to calculate how valuable data points are with respect to said objective function. This is
done by computing the Shapley value [46] of the data points. The Shapley value is used to measure the marginal
contribution of data point towards maximising the objective function, and is shown to satisfy notions of fairness.
The higher the Shapley value, the more valuable that data point is. Each agent receives a Shapley value for their
data point provided. This determines the amount of PoW they must compute to sell their data. The greater the
Shapley value, the less work they must perform. Indeed, this work consists of computing the Shapley value of a
new set of incoming data points. This feature ensures that spam attacks are costly because for every new data
point an agent wishes to sell, they must perform a new a PoW. Furthermore, the work agents perform is useful
for the functioning of the data market.
An architecture that implements such a system is depicted graphically in Figure 1. We now briefly describe the
functional components of the data market.
Verification. Agents’ position are verified by a proof-of-position mechanism [23] that ensures they provide a
valid position and identity. This component ensures that spam attacks are expensive, as well as enabling verifiable
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

An Adversarially Robust Data Market for Spatial, Crowd-sourced Data
•
33:5
Fig. 1. Data market architecture. Credit for the images is given in the following—In order of appearance: Icons made by
Freepik, Pixel perfect, juicyfish, srip, Talha Dogar and Triangle Squad from www.flaticon.com.
centralisation. All agents in the market can verify the validity of a proof-of-position and valid identity because
this information is publicly available.
Voting Scheme. Agents belonging to a spatial coalition agree on what data is worthy of being trusted and sold
on the data market. Agents express their preferences for whom they trust to compute the most accepted value of
a data point in a given location. This is carried out through a voting scheme.
Data Consensus. Once a committee of agents is elected (in the step above), it must come to a consensus as
to what is the agreed upon dataset associated to a given location. This is computed by the group following an
algorithm that aggregates the coalition’s data. This component ensures that at a specific location the dataset does
not contain data points from faulty sensors or from malicious agents (i.e., agents can decide to eliminate outliers).
Access Control Mechanism. This mechanism used to decide how data should be prioritised to enter the data
market. This mechanism has two steps: Firstly, all data points are assigned a value, which determines the priority
they receive to enter the data market; and secondly, proportionally to this priority, the agent owning that data
point must perform an adaptive, useful PoW to sell their data.
Data Market. The content of the datasets is not public. Buyers purchase the right to access the dataset and
perform analytics on them. To provide sufficient information for the buyers, each dataset has metadata associated
with it that provides a description of the dataset. The sellers also provide the provenance of the data along with a
valid proof-of-position to verify this, and the objective function that their dataset maximises and its value. Buyers
can access and browse the market and place bids for specific datasets in exchange for monetary compensation.
Buyers may wish to purchase: (i) access (but not ownership) to the entire dataset; (ii) access (but not ownership)
to only part of the dataset; (iii) ownership of the dataset or of part of it, which would give them the rights to
redistribute or perform further analytics on said dataset. Each right has a corresponding price that would be
decided between the sellers and the buyers.
Distributed Ledger. Successful transactions are recorded on a distributed ledger to provide a decentralised,
immutable record of ownership. The ledger determines which agents have access to particular data, and what
access rights they are allowed. Access and ownership to data is managed and exchanged through the use of
Non-Fungible Tokens [9].
Components of the Data Market
We proceed by describing the algorithmic components proposed. Namely, the proposed data market is orchestrated
using three key algorithms: one for agent verification; one to implement a reputation-based voting system and
an access control algorithm. In this section we describe their technical operation; before proceeding, to aid
exposition, we introduce necessary definitions:
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

33:6
•
A. M. Kharman et al.
Data-point: A data point is defined as 푥푖∈푋where 푥푖denotes the data point of agent 푖and 푋is the space of
all possible measurements.
Location quadrant: The set of all possible agent locations is defined as L = {1, 2, 3, ...,푙}. The location quadrant
푞, is an element of L, where 푞∈L.
Buyer: A buyer is denoted 푏, where 푏∈퐵and 퐵is the set of agents looking to purchase ownership (or any
other rights) to the datasets available for sale.
Spatial Coalition: A spatial coalition, 퐶푞, is a group of agents in the same location quadrant, 푞.
Crowdsourced Dataset: Agents in a spatial coalition, 퐶푞, aggregate their data points to provide an agreed upon
data point, 푋푡, at time, 푡.
Agent: An agent is defined as 푎푖∈퐴where 퐴is the set of all agents competing to complete the marketplace
algorithm to become sellers. The index 푖∈푁, where 푁= |퐴| and 푁is the total number of agents in the
data market at a given time, 푡∈푇.
Objective Function: An objective function, 푣퐶푞(·), maps the aggregate data points of a spatial coalition to a
utility.
Shapley Value: The Shapley value, 휓(퐶푞), is a mechanism to distribute reward amongst a coalition, 퐶푞, by
considering how valuable the contributions of each agent in the coalition are, with respect to an objective
function, 푣퐶푞(·). The Shapley value is the unique reward allocation that satisfies all the properties of the
Shapley fairness criteria [46].
4.1
The Verification Algorithm
This algorithm is run by a central authority to provide agents with a seal of credibility for the data they wish to
provide. Agents can verify that a commitment3 is well formed and that the proof-of-position algorithm outcome
is correct. However, they must trust the central authority to check that the ID provided by the agent is valid. 4 For
example in the context of mobility applications, vehicle license plates can be used as a proxy for a valid identity.
The validity of the data submission must be verified before the data reach the data marketplace, to avoid
retroactive correction of poor quality data. This is done through the VerifyingAlgorithm, defined below. The
following definitions are necessary to understand the functioning of the algorithm:
Commitment: An agent commits to their data point by generating a commitment that is hiding and binding,
such that the data point cannot be changed once the commitment is provided. A commitment to a data
point 푥푖, location quadrant 푞and ID 푖, of an agent 푎푖, at time 푡, is defined as 푐←Commitment(푎푖,푥푖,푞,푡).
Proof of ID: Let the Proof of ID be an algorithm, IDProof, that verifies the valid identity of an agent 푎푖, with
ID 푖. In the context of application that we shall present, this identification will be the license plate of a
vehicle. The algorithm will return a Boolean, 훼, that will be 푇푟푢푒if the agent has presented a valid license
plate and 퐹푎푙푠푒otherwise. Then IDProof is defined as the following: 훼←IDProof(푖). It is executed by a
central authority that can verify the validity of an agent’s identity.
Proof-of-position: Let proof-of-position be an algorithm, PoP, that is called by an agent 푎푖, with ID 푖. The
algorithm takes as inputs the agent’s commitment, 푐, and their location quadrant, 푞. We define PoP as the
following algorithm: 훽←PoP(푞,푐),
where the output will be a Boolean 훽that will be True if the position 푞matches the agent’s true location
and False otherwise.
3A cryptographic commitment is a primitive that allows an agent to commit to a value such that it is hidden and cannot be changed later [14].
4Some decentralised proofs of identity have begun to emerge such as the Proof of Humanity project [13].
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

An Adversarially Robust Data Market for Spatial, Crowd-sourced Data
•
33:7
Algorithm 1: Verification: VerifyingAlgorithm(푎푖, 푥푖, 푞, 푡, 푟)
푐←Commitment(푎푖,푥푖,푞,푡);
훼←IDProof(푖);
훽←PoP(푞,푐);
if 푡is not 푒푥푝푖푟푒푑then
훾←푇푟푢푒;
else
훾←퐹푎푙푠푒;
if (훼= 푇푟푢푒, 훽= 푇푟푢푒,훾= 푇푟푢푒) then
return 푇푟푢푒;
else
return 퐹푎푙푠푒;
4.2
Voting Scheme: Reputation-based MEV
As we have mentioned, agents form spatial coalitions to present reliable data to the marketplace. We use an
adaptation of the MEV scheme presented in [30] that takes into consideration the reputation of agents in the
system. This voting scheme reduces the likelihood of selecting an extreme candidate (i.e., agent) due to its
probabilistic nature. In the context of our work, the selected agents compute the accepted dataset by aggregating
data points.
4.2.1
Reputation. Reputation can be viewed as a trustworthiness metric that is assigned to an agent. Formally
an agent 푎푖assigns a score of trustworthiness to an agent 푎푗. This score is denoted as 푟푖→푗. We assume agents
assign reputation following a rational strategy or an agreed upon utility function.5
In the case of MEV, which involves solving an optimisation problem, the agent running the election must prove
that the voting outcome was correctly computed. To provide guarantees of correctness to the voters, we propose
using an End-to-End (E2E) verifiable voting scheme. E2E voting schemes require that all voters can verify the
following three properties: Their vote was cast as intended, recorded as cast and tallied as cast [3]. To ensure fair
and free elections, we require the voting mechanism implementation to also satisfy ballot secrecy as defined in
[47] and [32].
4.2.2
Reputation-based MEV.
Vote: The vote of agent 푎푖∈퐴, is defined as a pairwise preference matrix in 푆(푎푖) ∈R푁×푁. Each entry is
indexed by any two agents in 퐴and its value can be derived from data point 푥푖and reputation 푟푖→푗. An
example of a pairwise preference matrix for three agents is shown in Equation (2).
Aggregation of Votes: The aggregation of all agents’ votes, 푆(퐴), is defined as the average of 푆(푎푖), where
푖∈퐴, as follows:
푆(퐴) := 1
푁
Õ
푎푖∈퐴
푆(푎푖).
(1)
Agent Ordering: An agent ordering, 표, is defined as a permutation of agents in [30]. To reduce computational
complexity, we suggest computing 표by selecting a subset of agents as the preferred group, such that the
order of preferred and non-preferred agents does not matter.
5A possible way to allocate reputation could be trusting data measurements based on the age of the vehicle or manufacturer. Other examples
include [7] and [31].
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

33:8
•
A. M. Kharman et al.
Ordering Set: The ordering set O is the set of all possible agent orderings, such that 표∈O.
Representative Probability: The Representative Probability property states that the probability of the election
outcome resulting in candidate A being placed above candidate B should be the same as the proportion of
the voters preferring A to B.
Probability Measure of Ordering Set: The (discrete) probability measure, 휋: O →R≥0 gives a probability of
each ordering 표∈O being selected as the outcome ordering, 표∗. The probability measure, 휋, is the one
with maximal entropy whilst also adhering to the Representative Probability property. 휋∗is the optimal
solution to the optimisation problem formulated in Equation (6).
To combine MEV and reputation, a key step is to move from reputation 푟푖→푗to a pairwise preference matrix
푆(푎푖) ∈R푁×푁:
푆(푎1) =
푎푖
푎푗
푎푘
푎푖
0
푎푗
0
0
1/2
푎푘
0
1/2
0
.
(2)
The entry of a pairwise preference matrix is indexed by every two agents of 퐴, and its values are defined as
푆(푎푖)푗,푘=


if 푎푖prefers 푎푗and 푗≠푘
0.5
if 푎푖prefers both equally and 푗≠푘
0
if 푎푖prefers 푎푘or 푗= 푘
,
(3)
for 푎푗,푎푘∈퐴. Agent 푎푗is preferred to 푎푘if, for example, 1+|푥푖|·푟푖→푗
1+|푥푖−푥푗| > 1+|푥푖|·푟푖→푘
1+|푥푖−푥푘| and both agents are equally
preferred if the two values are equal. In this manner, a pairwise preference matrix 푆(푎푖) can be computed for each
agent 푎푖. The average of pairwise preference matrices over all agents is denoted as the preference matrix 푆(퐴),
as described in Equation (1). 푆(퐴) represents the pairwise preference of all agents in 퐴, whose entries 푆(퐴)푗,푘
display the proportion of agents that prefer agent 푎푗over agent 푎푘.
The original MEV [30] runs an optimisation over all candidate orderings, which strongly defines the computa-
tional complexity of the problem because the number of orderings is the factorial of the number of candidates. As
a variant of MEV, we consider agent combinations, instead of permutations for the ordering set O, such that 퐴is
divided into a preferred group P, of cardinality 퐾, and non-preferred group NP. Let 퐾be the number of winners
needed and 푁= |퐴|. Hence, the cardinality of the ordering set decreases from 푁! to
푁!
퐾!(푁−퐾)!. For small 퐾, this
leads to a drastic reduction of the computational complexity. We call this variant of the original MEV, C-MEV.
For each ordering 표∈O, we can define a pairwise preference matrix 푆(표) (in the same way as Equation (3)),
whose entries are defined as
푆(표)푗,푘=


if 푎푗is placed over 푎푘
0.5
if both are in the same group and 푗≠푘
0
if 푎푘is placed over 푎푗or 푗= 푘
(4)
for 푎푗,푎푘∈퐴. Let us define an unknown probability measure 휋: O →R≥0. 휋(표),표∈O, which gives the
probability of 표being chosen as the outcome ordering. Then, we construct a theoretical preference matrix 푆(휋)
as follows:
푆(휋) :=
Õ
표∈O
휋(표) · 푆(표).
(5)
The entry 푆(휋)푗,푘states the probability of the outcome ordering placing 푎푗over 푎푘under probability measure 휋.
The definition of Representative Probability simply requests that 푆(휋) = 푆(퐴).
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

An Adversarially Robust Data Market for Spatial, Crowd-sourced Data
•
33:9
Table 1. The Lower-cardinality Ordering Set when
퐴= {푎푖,푎푗,푎푘} and 푀= 1
O
표1
표2
표3
Preferred P
(푎푖)
(푎푗)
(푎푘)
Non-preferred NP
(푎푗,푎푘)
(푎푖,푎푘)
(푎푖,푎푗)
Agents in the same brackets are given the same rank in an
ordering.
The entropy of 휋measures the uncertainty of choosing elements in O. The uniform distribution has the
maximum amount of entropy. Associated with 휋, the entropy is defined as −Í
표∈O 휋(표) log 휋(표) [19]. Hence,
the original formulation of MEV is outlined in Equation (6). In this formulation, when maximising entropy, we
ensure the solution 휋∗to be the most moderate probability measure which satisfies the Representative Probability
property:
휋∗= max
휋
−
Õ
표∈O
휋(표) log 휋(표)
s.t.
Õ
표∈O
휋(표) · 푆(표) = 푆(퐴)
Õ
표∈O
휋(표) = 1
휋(표) ≥0
∀표∈O.
(6)
휋∗returns the probability of selecting each ordering 표∈O. The result of the C-MEV election computed by
randomly sampling an ordering, 표∗, from the probability distribution 휋∗.
For example, let us consider an election where one winner is selected out of candidates 퐴= {푎1,푎2,푎3}. If
the probability distribution 휋∗, computed following Equation (6), states that: 휋∗(표1) = 0.5, 휋∗(표2) = 0.3 and
휋∗(표3) = 0.2, where each ordering is defined in Table 1, then the election will return agent 푎1 as the winning
candidate with the highest probability. In other words, C-MEV will return the most moderate candidate, whilst
ensuring that the outcome adheres to the Representative Probability property.
Finally, since 퐾needs to be kept small to maintain the computational complexity of C-MEV low, in order to
increase the amount of candidates, we can perform C-MEV iteratively, 퐽times. This can be done as follows:
—Solve C-MEV and find the preferred group P = P1, of cardinality 퐾.
—Obtain 퐴1 = 퐴\ P1.
—From 퐴1 find the new preferred group P2, of cardinality 퐾.
—Repeat the above three steps 퐽times.
Refer to Figure 2 for a simple example of this process, with 퐽= 3 and 퐾= 3.
This iterative version of C-MEV allows us to obtain 퐽groups of preferred candidates of dimension 퐾. Notice
that this is a decrease in computational complexity with respect to solving C-MEV for groups of 퐾· 퐽candidates.
To show that, define 퐶푀(푖, 푗) as the complexity to solve C-MEV for 푗groups of 푖candidates. Then, the complexity
to solve C-MEV for a group of 퐾· 퐽candidates is 퐶푀(퐾· 퐽, 1) =
푁!
(퐾·퐽)!(푁−퐾·퐽)!, whereas the computational
complexity to solve C-MEV, 퐽times for groups of 퐾candidates is 퐶푀(퐾, 퐽) = Í퐽
푖=0
(푁−퐾·푖)!
퐾!(푁−퐾·(푖+1))!. Then it is easy
to show that,
퐶푀(퐾, 퐽) =
퐽Õ
푖=0
(푁−퐾· 푖)!
퐾!(푁−퐾· (푖+ 1))! < 퐽
푁!
퐾!(푁−퐾)! <
푁!
(퐾· 퐽)!(푁−퐾· 퐽)! = 퐶푀(퐾· 퐽, 1),
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

33:10
•
A. M. Kharman et al.
Fig. 2. Example of an election performed with C-MEV with parameters 퐽= 3, 퐾= 3.
For a sample election process, the reader may refer to the Appendix, where the election steps are clearly
outlined in order, for ease of exposition: which proves that iterative C-MEV leads to a decrease in computational
complexity.
4.3
Data Consensus
Coalitions of agents in the same location quadrant must agree on the accepted value of measured data. The
rationale for this algorithmic component is that, since we are assuming to be in environments with an oversupply
of data, we can use the large amount of measurements to filter out data points that have been submitted either
by malicious agents or agents with faulty sensors. The underlying assumption is that the majority of the agents
participating in the data collection are honest (i.e., they will not report fraudulent or fake data). It is also assumed
that agents in the same geographic area measure similar results within margins of measurement precision.
Therefore, by aggregating agents’ measurements, the aim of the Data Consensus component is to resolve conflicts
in diverging results. Moreover, the aforementioned aggregation should be computed in a privacy-preserving
manner. This prevents agents from stealing valuable data points from other agents.
To recap, the Data Consensus component needs to satisfy three properties: (i) it needs to be executed in a
decentralised fashion; (ii) untrue data points submitted by malicious actors or faulty sensors should not appear
in the final dataset of the spatial coalition; (iii) it must be computed in a privacy-preserving manner, such that
malicious agents are prevented from stealing valuable data points from other agents.
We now introduce two concepts that we use to characterise different algorithms and measure how they achieve
the three aforementioned properties:
—K-privacy: A decentralised algorithm in which 푁agents provide individual inputs 푥푖to compute an output
˜푥is 푘-private if it is not possible to reconstruct the dataset 푋= {푥1,푥2, ...} unless 푘, or more agents collude
with one another by exchanging information (i.e., their 푥푖’s) where 푘is a positive integer. In other words, if
a dataset satisfies k-privacy with 푘= 3, at least three agents must share their 푥푖’s to reconstruct 푋.
—Breakdown Point: In estimation theory, the breakdown point characterises the robustness of an estimator and
is dependent on the sample size 푛[45]. In our context the theoretical breakdown point of the Data Consensus
algorithm is the minimum share of agents required to alter the dataset of the spatial coalition arbitrarily
[21]. The practical breakdown point is the average share of agents required to alter the dataset of the spatial
coalition arbitrarily.
With these definitions we may characterise the algorithm of choice for the Data Consensus mechanism: a
decentralised mean-median algorithm. The rationale for this choice is that the mean-median algorithm represents
a compromise between a decentralised computation of mean and a decentralised computation of median. The
former can be computed in a decentralised way [38] and is n-private, where 푛is the number of agents in the spatial
coalition. However, its theoretical breakdown point is 1
푛. In other words, a single agent is required to arbitrarily
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

An Adversarially Robust Data Market for Spatial, Crowd-sourced Data
•
33:11
Fig. 3. Access control mechanism: Agents in coalition 퐶푞1 must compute the Shapley value, 휓(퐶푞2), of the new incoming
data, 푋푡+1, using 푋푡+1 and 푣퐶푞1 (·). Once the agents of 퐶푞2 receive their Shapley value, they must complete an amount of
PoW that is inversely proportional to their Shapley value. This work is to compute the Shapley value of 휓(푋푡+2) and so on.
Once a coalition completes this work they may enter the market.
alter the dataset of the spatial coalition. The latter, on the other hand, is one of the most robust estimators as
its theoretical breakdown point is 1
2. However, computation of the median in a privacy-preserving way is a
computationally complex task [16].
The mean-median algorithm is an algorithm that can estimate the median value of the dataset in a robust and
private manner.
The first step of the algorithm is to randomly assign every agent to a group in such a way that there are 푔
groups with at least 푠agents each. 푔and 푠determine the properties of privacy and robustness of the algorithm.
The next step is to calculate the mean within each group. The resulting mean is at least of k-privacy: 푘= 푠−1.
The value of each mean is then broadcast among each group and it is then possible to compute the median of all
the means. As there are 푔groups, there are 푔ways in which the median can be chosen. As such, the theoretical
breakdown point, 푃, of the mean-median algorithm is
푃= 푔
2푛.
(7)
The relationship between 푠, 푔and the number of agents 푛is given by the following inequality:
푛≥푠· 푔.
(8)
4.4
Access Control Mechanism to the Data Market
A spatial coalition, 퐶푞, is formed by agents within the same location quadrant, where 퐶푞= {푎푞1,푎푞2,푎푞3...} ⊆퐴
and {푞1,푞2,푞3...} are the IDs of the agents in quadrant 푞. Each agent 푎푞푖∈퐶푞measures a data point 푥푞푖at a
given time 푡. Agents in 퐶푞agree on an objective function, 푣퐶푞(·) which determines the utility of their dataset. A
committee of agents is elected from agents in 퐶푞using MEV, following Section 4.2. This committee aggregates
data points provided by agents in 퐶푞using an aggregation algorithm outlined in Section 4.3. The resulting
aggregated data point is denoted as 푋푡, where 푋푡= mean-median(푥푞1,푥푞2,푥푞1...). It is then possible to calculate
how valuable data points are with respect to said objective function. This is done by computing the Shapley value,
휓(푋푡). The Shapley value is used to measure the marginal contribution of data point towards maximising the
objective function, and is shown to satisfy notions of fairness. Agents in 퐶푞must complete a PoW that is inversely
proportional to the Shapley value they received for their data point contribution. The more valuable their data,
the less work they must perform.6 Indeed, this assigned PoW consists of computing the Shapley value of the
next incoming data point(s) wishing to enter the data market, 휓(푋푡+1). This work enables the functioning of the
market and, a visualization of it can be seen in Figure 3. More specifically, we make use of smart contracts7 to
automate this process. In our context, a smart contract will be executed by one agent 푎푖to compute the Shapley
6In this context, more work would involve computing the Shapley value of a greater number of data points.
7A smart contract is a program that will automatically execute a protocol once certain conditions are met. It does not require intermediaries
and allows for the automation of certain tasks [12, 53].
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

33:12
•
A. M. Kharman et al.
Fig. 4. SHAP values of the samples of each feature.
value of agent 푎푗’s data. The outputs will be the Shapley value of agent 푎푗’s data and a new smart contract for
agent 푎푖. Calculating the new smart contract generated serves as the proof of agent 푎푗’s useful work.
4.4.1
A Contextual Example: Crowd-sourcing Pollution Measurements. We illustrate an example with real data
to showcase how the Shapley value would be used to rank the data points in terms of value, and allocate a
proportional PoW correspondingly.
We use the data on pollution levels of a range of different contaminants, taken from a number of cities in India.
The data have been made publicly available by the Central Pollution Control Board.8 The cleaned and processed
data were accessed from https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india. We illustrate an
example wherein a buyer is interested in purchasing data on pollution levels of different contaminants in order to
predict the Air Quality Index (AQI) of a given location. We generate a linear regression model to predict AQI,
which has been previously done in [49], although other options for models to predict AQI have been explored in
alternative works such as [4] and [24]. This model will serve as the objective function.
A description of how AQI is calculated can be found in https://app.cpcbccr.com/ccr_docs/How_AQI_Calculated.
pdf. Following from this calculation, it is reasonable to observe how the variables PM2.5 (Particulate Matter 2.5-
micrometer in μg/m3) and PM10 (Particulate Matter 10-micrometer in μg/m3) are highly correlated with AQI. We
include them as well as NO, NO2, NOx, NH3, CO, SO2 and O3 as training features for the linear regression model.
Agents collecting measurements of different pollutants have their data points evaluated by a preceding set of
agents that must calculate some PoW. This PoW is computing the Shapley value of a data point. To do so, they
utilise the given objective function, which in this case is the linear regression model, and the agent’s data.
We show the results of calculating the Shapley value of individual data points within a given dataset in Figure 4.
We simulate this using the SHAP library, presented in [29]. Following from the SHAP documentation: ‘Features
pushing the prediction higher are shown in red, those pushing the prediction lower are in blue’ [28]. By visual
inspection of Figure 4, we can conclude that data points measuring high PM2.5 and PM10 concentrations increase
the predicted AQI the most.
Consequently, the agents having provided those data points would receive the highest Shapley values, and thus
have to perform less PoW. In this context, that would mean computing the Shapley value of a smaller number of
new incoming data points.
8https://cpcb.nic.in/
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

An Adversarially Robust Data Market for Spatial, Crowd-sourced Data
•
33:13
Remark. The reader may rightly question the privacy risks of an agent accessing another one’s dataset to
compute the Shapley value. What is to incentivise them to compute the Shapley value honestly, and what is to
prevent them from stealing or duplicating another agent’s data if they realise it has a high Shapley value?
To address the first concern, the computation of the Shapley value is automated through the use of smart
contracts. These can be inspected by anyone to ensure their correct operation. Furthermore, [27] and [57] propose
ways to compute Shapley values under encryption. This allows the computation of this value without having to
reveal the dataset to the agent carrying out said computation.
Secondly, in the market there is no protection against agents duplicating data, but they cannot monetise this
copied data unless they go through the verification, consensus and then access control stages again. Because we
are in an environment with an oversupply of data and that is crowd-sourced, the data are unlikely to be highly
sensitive and thus the incentive to go through these steps is very small. In addition to this, if data duplication is
indeed deemed a pertinent issue for the context of a different data market implementation, the Shapley value
calculation can be replaced by the Shapley Robust algorithm proposed in [2], for which we have written a Python
implementation using the SHAP explainer Python library. This is an adaptation of the Shapley value calculation
that will penalise highly similar data, thereby penalising attackers wishing to monetise duplicated data. This
implementation can be found in https://github.com/aidamanzano/DataMarket.
4.5
Purchasing Datasets
Once the steps above have been completed and the metadata of data have been posted publicly on the market,
the sellers chose which buyer or buyers they will sell their dataset to. Finally, once a transaction is successful,
the reward of the sale is distributed amongst the participants of the spatial coalition that generated the dataset
according to a given reward distribution function.
Applications
The ACLED is an organisation that collects data on political conflict and violence around the world [42]. Their
data are collected by internationally based researchers, and their dataset has been used by multiple UN bodies,
governments across the world, news outlets and policy-making bodies and NGOs. Its reach and impact are vast
and have been used to shape responses to crises, to design policies and report on conflict. They have a table of
retracted events upon finding that the data collected were incorrect or reported twice.9
Robustness of Data Market in Adversarial Environments
In an adversarial, decentralised environment, one must take into account the possibility of attacks on the system.
We proceed to describe their nature and how these are mitigated by the algorithmic components of the data
market architecture.
Sybil Attack: Sybil Attacks are a type of attack in which an attacker creates a large number of pseudonymous
identities which they use to exert power in and influence over the network. Sybil attacks are mitigated
in the verification stage, as agents must present a valid proof of identity. This proof is granted to them
through a centralised authority but all other agents can verify that it exists and therefore that it must
9https://acleddata.com/data-export-tool/. Our proposed protocol makes uploading incorrect data extremely difficult and unlikely. In a context
where data are internationally aggregated, and used for such important contexts with legally binding consequences, our proposal can greatly
mitigate the risk of this issue arising. Another example use case is Bellingcat: a public, investigative journalism organisation that leverages
open source intelligence (OSINT) to conduct investigations [20]. One of their main activities involves analysing public primary source data to
fact check events and report on conflict and human rights violations. This task is arduous, and verifying the validity of data is fundamental
for their reporting. By using data that have been obtained through our data marketplace instead, investigators would have stronger security
guarantees that the data are not from a different location to the one reported, or artificially manufactured. The latter two are growing concerns
for news reporting and investigations in the age of deepfakes and misinformation.
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

33:14
•
A. M. Kharman et al.
be valid. In the context of smart mobility applications, generating multiple identities is made expensive
because agents must provide a valid vehicle license plate to enter the market and sell data.
Wormhole Attack: A Wormhole Attack involves a user maliciously reporting they are in a location that is not
the one they are truly in. An attack can be mounted by a series of malicious actors claiming to measure data
from a location they are not truly in, and wishing to monetise these fraudulent data. To mitigate against
this attack, agents must present a valid proof-of-position in the verification stage. This proof is assumed to
be correct and sound, and by definition, agents are only able to present one valid proof.
Data Poisoning: Data Poisoning is an attack where malicious agents collude to report fake data in order
to influence the agreed upon state of a system [56]. Malicious agents wishing to report fake data must
influence enough agents in their spatial coalition to ensure that sufficient agents in the Data Consensus
mechanism get elected to compute a fake data point. Probabilistic voting schemes make the cost of this
coercion significantly high. Furthermore, to sell the uploaded data point, the agent must first perform a
useful PoW that is proportional to how valuable the data point is deemed. The less useful the data point
the more work the agent must complete to sell it. Selling spam data will therefore be very time-consuming
for an attacker.
Remark. The reader may also question the resilience of this protocol to inaccurate data measurements. Indeed,
some agents may have faulty sensors and collect inaccurate but not malicious data. This may include not only the
value of the data but the geolocation of the data as well. This scenario is also considered in our protocol. There
are three possible ways in which inaccurate data may arise: The inaccurate data are either vastly divergent from
the accepted value, or it is similar to the accepted value but slightly noisy, or reported from a wrong location. In
the first case, the data point will be filtered out in the voting and the data consensus protocol. In the second case,
the data point is sufficiently similar such that it will not affect the final dataset sold, and in the final case, the
proof-of-position protocol prevents this from happening.
As the Sybil attack and the Wormhole attack are not possible due to the design of the data market, we proceed
by showcasing results that illustrate the robustness of the data market with respect to the Data Poisoning attack.
6.1
Simulation Setup
We consider a number of agents 푁taking measurements from the same location quadrant. To account for faulty
sensors and other sources of errors, the process of taking a measurement is represented by sampling from a
Gaussian distribution with mean, 휇, and SD, 휎. Here we assume that the value 휇represents the true value of the
phenomenon that agents are measuring. Furthermore, we assume that a set of collaborative malicious agents
report a fake measurement 휇푎푑푣. This is done to simulate a Data Poisoning attack.
Each agent is randomly assigned a reputation score: With probability 1
2 they are assigned a value of 1, otherwise
the reputation is sampled from a Gaussian distribution with 휇푟푒푝and 휎푟푒푝, where 휇푟푒푝is a value much larger than
1. This is to simulate a number of low reputation agents attempting to sell inaccurate data.
We consider two scenarios to test the mean-median algorithm: firstly with group size, 푠, of agents 푠= 3 (triplet
group size), and secondly with sizes chosen depending on the number of agents, 푁, with 푠=
√
푁.
For each scenario we perform 푆number of Monte-Carlo simulations, in which we vary the numbers of agents,
푁, and the size of the malicious coalition.
6.2
Evaluation of Results
Figure 5 shows a simulation of the mean-median algorithm for the Data Consensus mechanism described in
Section 4.3. We also show the results for the median algorithm to provide a baseline for comparison. This simulation
has been computed with 푆= 25 and 푁= 1,000. Notice that the number of agents 푁is greatly exaggerated with
respect to a realistic scenario and its results are functional to establish a baseline behaviour in the presence of
a large number of agents. In green we show the behaviour of the decentralised median algorithm, in blue the
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

An Adversarially Robust Data Market for Spatial, Crowd-sourced Data
•
33:15
Fig. 5. Characterisation of data consensus algorithms’ behaviour under different degrees of coordinated data poisoning
attacks.
behaviour of the mean-median algorithm with 푠= 3 and in red the behaviour of the mean-median algorithm with
푠=
√
푁, as the size of the adversarial coalition increases.
It can be observed that, when the percent of adversaries in the network increases, the deviation of the reported
data point from the ground truth increases. For the median algorithm, this deviation is significant when the
percent of adversaries in the network is 50%, which is consistent with the theoretical breakdown point. For the
mean-median algorithm with 푠= 3 (triplets), there are three different percentages at which a significant deviation
from the ground truth can be observed. This is because when the percentage of adversaries is below 20%, it is
likely that most agents within the triplet groups will be honest. For a percent of adversaries between 20% and
50%, it is most likely that at least one out of three is malicious. For a percentage between 50% and 80%, two out of
three are likely to be malicious and finally, when the percentage of adversaries is above 80%, it is most probable
that all agents in the median group are malicious.
Regarding the mean-median algorithm with 푠=
√
푁(square-roots), it shows a continuous, almost linear,
relation to the number of adversaries present. This is a result of a larger group size, with 푠=
√
푁and 푁= 1,000,
which allows for a more uniform distribution of honest and malicious agents in the median groups.
To investigate the scaling effect and behaviour of the algorithm when smaller numbers of agents are present
(which also represents more realistic scenarios), the same simulation was carried out but with 푁= 20 agents,
as depicted in Figure 6. The number of Monte-Carlo simulations is increased to 푆= 100 to provide meaningful
statistical results.
From the results shown in Figure 6, it can be observed that the algorithms act similarly. Given a greater percent
of adversaries present in the system, the deviation of the reported data from the ground truth increases. When
the number of agents decreases, the practical breakdown point increases from 3% to 10% for the square-roots
algorithm, and for the triplets algorithm it decreases from 20% to 15%. These results are in accordance with the
theoretical breakdown point defined in Equation (7).
Finally, Figure 7 represents how much the reported data deviate from the ground truth, when combining the
reputation-based C-MEV voting scheme and the Data Consensus algorithm. The results obtained demonstrate that
the combination of both mechanisms provides an increased robustness against Data Poisoning attacks, assuming
a functional reputation system exists. In this simulation the voting scheme (C-MEV) outputs 퐽= 5 sets of agents
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

33:16
•
A. M. Kharman et al.
Fig. 6. Breakdown analysis of data consensus algorithms, with a coordinated data poisoning attack.
Fig. 7. Characterisation of breakdown of C-MEV combined with mean-median algorithm.
of cardinality 퐾= 3, out of a set of 푁= 30 agents, which then aggregate data points to provide the agreed upon
data point of a given location, according to the mean-median algorithm.
Figure 7 is a heatmap that depicts the results of the simulations. The y-axis represents the percentage of highly
reputational agents within the set of honest agents, and the x-axis represents the percentage of adversaries. The
number of Monte-Carlo simulations is set to 푆= 100 to provide meaningful statistical results. We sample the
reputation for the high-reputation honest actors, from a Gaussian distribution with parameters 휇푟푒푝= 100 and
휎푟푒푝= 30.
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

An Adversarially Robust Data Market for Spatial, Crowd-sourced Data
•
33:17
Visual inspection of the proposed results lead to two main observations: (i) combining C-MEV and data
consensus has a higher practical breakdown point than data consensus alone; (ii) an increased share of highly
reputational agents among the honest ones leads to an increase of the practical breakdown point. This is because,
the higher the reputation of a honest agent, the more likely they are to be selected, thus decreasing the chances
of malicious agents being elected.
To conclude, it can be said that combining MEV and the mean-median, the system offers strong protection
against Data Poisoning. To succeed in mounting a Data Poisoning attack, the malicious coalition must control
from 40% to 60% of the network, assuming a functional reputation system exists.
Conclusions
We have presented a fair, decentralised data market architecture that is robust to a number of attacks. The
novelty of this work includes: ranking data in terms of how valuable it is using the Shapley value, and using it to
proportionally adapt the PoW each agent must complete. Furthermore, the PoW is itself useful and necessary
for the functioning of the market, and thus not wasteful. We also utilise a voting scheme that satisfies desirable
properties of fairness, and introduce an optimisation to make its computational complexity significantly lower for
the context of this work. We evaluate the resilience of the Data Consensus algorithm combined with the voting
mechanism towards Data Poisoning attacks. Our simulations show an increased robustness.
Acknowledgement
The authors would like to thank Juan Antonio Vera García for the idea of allowing sellers to provide the objective
function.
References
[1] Samrat Acharya, Robert Mieth, Ramesh Karri, and Yury Dvorkin. 2022. False data injection attacks on data markets for electric vehicle
charging stations. Advances in Applied Energy 7 (2022), 100098. DOI: https://doi.org/10.1016/j.adapen.2022.100098
[2] Anish Agarwal, Munther Dahleh, and Tuhin Sarkar. 2019. A marketplace for data: An algorithmic solution. In 2019 ACM Conference on
Economics and Computation, 701–726.
[3] Syed Taha Ali and Judy Murray. 2016. An overview of end-to-end verifiable voting systems. In Real-World Electronic Voting. Taylorfrancis,
189–234.
[4] Saba Ameer, Munam Ali Shah, Abid Khan, Houbing Song, Carsten Maple, Saif Ul Islam, and Muhammad Nabeel Asghar. 2019.
Comparative analysis of machine learning techniques for predicting air quality in smart cities. IEEE Access 7 (2019), 128325–128338.
[5] Lori Andrews. 2012. Facebook Is Using You. New York Times (2012). Retrieved from https://www.nytimes.com/2012/02/05/opinion/
sunday/facebook-is-using-you.html
[6] Christina Aperjis and Bernardo A. Huberman. 2012. A market for unbiased private data: Paying individuals according to their privacy
attitudes. DOI: http://dx.doi.org/10.2139/ssrn.2046861
[7] Ferheen Ayaz, Zhengguo Sheng, Daxin Tian, Guan Yong Liang, and Victor Leung. 2020. A voting blockchain based message dissemination
in vehicular ad-hoc networks (VANETs). In ICC 2020-2020 IEEE International Conference on Communications (ICC). IEEE, 1–6.
[8] Shaimaa Bajoudah, Changyu Dong, and Paolo Missier. 2019. Toward a decentralized, trust-less marketplace for brokered IoT data
trading using blockchain. In 2019 IEEE International Conference on Blockchain (Blockchain). IEEE, 339–346.
[9] Ammar Battah, Mohammad Madine, Ibrar Yaqoob, Khaled Salah, Haya R. Hasan, and Raja Jayaraman. 2022. Blockchain and NFTs for
trusted ownership, trading, and access of AI models. IEEE Access 10 (2022), 112230–112249.
[10] Alireza Beikverdi and JooSeok Song. 2015. Trend of centralization in Bitcoin’s distributed network. In 2015 IEEE/ACIS 16th International
Conference on Software Engineering, Artificial Intelligence, Networking and Parallel/Distributed Computing (SNPD). IEEE, 1–6.
[11] Frank Bell, Raj Chirumamilla, Bhaskar B. Joshi, Bjorn Lindstrom, Ruchi Soni, and Sameer Videkar. 2022. Data sharing, data exchanges,
and the snowflake data marketplace. In Snowflake Essentials. Springer, 299–328.
[12] Konstantinos Christidis and Michael Devetsikiotis. 2016. Blockchains and smart contracts for the Internet of Things. IEEE Access 4
(2016), 2292–2303. DOI: https://doi.org/10.1109/ACCESS.2016.2566339
[13] Sofia Cossar, Tara Merk, Jamilya Kamalova, and Primavera De Filippi. 2024. Proof of Humanity: Ethnographic Research of a “Democratic”
DAO. European University Institute.
[14] Ivan Damgård. 1998. Commitment schemes and zero-knowledge protocols. In School Organized by the European Educational Forum.
Springer, 63–86.
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

33:18
•
A. M. Kharman et al.
[15] Milind Dawande, Sameer Mehta, and Liying Mu. 2023. Robin Hood to the rescue: Sustainable revenue-allocation schemes for data
cooperatives. Production and Operations Management 32, 8 (2023), 2560–2577. DOI: https://doi.org/10.1111/poms.13995
[16] Joris Duguépéroux and Tristan Allard. 2020. From task tuning to task assignment in privacy-preserving crowdsourcing platforms. In
Transactions on Large-Scale Data-and Knowledge-Centered Systems XLIV: Special Issue on Data Management–Principles, Technologies, and
Applications. Springer Berlin Heidelberg, 67–107.
[17] Carla Goncalves, Pierre Pinson, and Ricardo J. Bessa. 2020. Towards data markets in renewable energy forecasting. IEEE Transactions on
Sustainable Energy 12, 1 (2020), 533–542.
[18] Víctor González, Luis Sánchez, Jorge Lanza, Juan Ramón Santana, Pablo Sotres, and Alberto E. García. 2023. On the use of Blockchain to
enable a highly scalable Internet of Things data marketplace. Internet of Things 22 (2023), 100722.
[19] Robert M. Gray. 2011. Entropy and Information Theory. Springer Science & Business Media.
[20] Eliot Higgins. 2021. We Are Bellingcat: An Intelligence Agency for the People. Bloomsbury Publishing.
[21] P. J. Huber and E. M. Ronchetti. 2009. Robust Statistics. Wiley-Blackwell, 2nd ed.
[22] Nick Hynes, David Dao, David Yan, Raymond Cheng, and Dawn Song. 2018. A demonstration of sterling: A privacy-preserving data
marketplace. Proceedings of the VLDB Endowment 11, 12 (2018), 2086–2089.
[23] Aida Manzano Kharman, Pietro Ferraro, Anthony Quinn, and Robert Shorten. 2023. Robust decentralised proof-of-position algorithms
for smart city applications. In 2023 62nd IEEE Conference on Decision and Control (CDC). IEEE, 112–119.
[24] Anikender Kumar and P. Goyal. 2011. Forecasting of daily air quality index in Delhi. Science of the Total Environment 409, 24 (2011),
5517–5523.
[25] Nikolaos Laoutaris. 2019. Why online services should pay you for your data? The arguments for a human-centric data economy. IEEE
Internet Computing 23, 5 (2019), 29–35. DOI: https://doi.org/10.1109/MIC.2019.2953764
[26] Qinya Li, Zun Li, Zhenzhe Zheng, Fan Wu, Shaojie Tang, Zhao Zhang, and Guihai Chen. 2021. Capitalize your data: Optimal selling
mechanisms for IoT data exchange. IEEE Transactions on Mobile Computing 22, 4 (2021), 1988–2000.
[27] Yingjin Lu, Xianglan Jiang, and Lu Jiao. 2011. The privacy protection for Shapley value. In 2011 International Conference on Computational
and Information Sciences, 428–430. DOI: https://doi.org/10.1109/ICCIS.2011.296
[28] Scott Lundberg. 2018. SHAP Documentation. Retrieved from https://shap.readthedocs.io/en/latest/index.html
[29] Scott M. Lundberg and Su-In Lee. 2017. A unified approach to interpreting model predictions. In Advances in Neural Information
Processing Systems 30. I. Guyon, U. V. Luxburg, S. Bengio, H. Wallach, R. Fergus, S. Vishwanathan, and R. Garnett (Eds.), Curran
Associates, Inc., 4765–4774. Retrieved from http://papers.nips.cc/paper/7062-a-unified-approach-to-interpreting-model-predictions.pdf
[30] Roger Sewell, David MacKay, and Iain McLean. 2009. Probabilistic electoral methods, representative probability, and maximum entropy.
Voting Matters 26 (2009), 16–38.
[31] Haitham Mahmoud, Muhammad Ajmal Azad, Junaid Arshad, and Adel Aneiba. 2023. A framework for decentralized, real-time reputation
aggregation in IoV. IEEE Internet of Things Magazine 6, 2 (2023), 44–48.
[32] Aida Maria Manzano Kharman and Ben Smyth. 2023. Is your vote truly secret? Ballot secrecy iff ballot independence: Proving necessary
conditions and analysing case studies. arXiv:2311.12977. Retrieved from https://doi.org/10.48550/arXiv.2311.12977
[33] McKinzie and Company. 2016. Monetizing Car Data: New Service Business Opportunities to Create New Customer Benefits. Retrieved
from https://www.mckinsey.com//media/mckinsey/industries/automotive%20and%20assembly/our%20insights/monetizing%20car%
20data/monetizing-car-data.ashx
[34] Sameer Mehta, Milind Dawande, Ganesh Janakiraman, and Vijay Mookerjee. 2021. How to sell a data set? Pricing policies for data
monetization. Information Systems Research 32, 4 (2021), 1281–1297.
[35] Yifei Min, Tianhao Wang, Ruitu Xu, Zhaoran Wang, Michael I. Jordan, and Zhuoran Yang. 2022. Learn to match with no regret:
Reinforcement learning in Markov matching markets. Advances in Neural Information Processing Systems 35 (2022), 19956–19970.
[36] Janine Mügge, Julian Grosse Erdmann, Theresa Riedelsheimer, Marvin Michael Manoury, Sophie-Odette Smolka, Sabine Wichmann,
and Kai Lindow. 2023. Empowering end-of-life vehicle decision making with cross-company data exchange and data sovereignty via
Catena-X. Sustainability 15, 9 (2023), 7187.
[37] Neha Narula, Willy Vasquez, and Madars Virza. 2018. zkledger: Privacy-preserving auditing for distributed ledgers. In 15th USENIX
Symposium on Networked Systems Design and Implementation (NSDI ’18), 65–80.
[38] Roman Overko, Rodrigo Ordopoez-Hurtado, Sergiy Zhuk, Pietro Ferraro, Andrew Cullen, and Robert Shorten. 2019. Spatial positioning
token (SPToken) for smart mobility. IEEE Transactions on Intelligent Transportation Systems 23, 2 (2019), 1529–1542. DOI: https:
//doi.org/10.1109/ICCVE45908.2019.8964853
[39] Kazim Rifat Özyilmaz, Mehmet Doğan, and Arda Yurdakul. 2018. IDMoB: IoT data marketplace on blockchain. In 2018 Crypto Valley
Conference on Blockchain Technology (CVCBT). IEEE, 11–19.
[40] Ocean Protocol Foundation. 2020. Ocean Protocol: Tools for the Web3 Data Economy. Retrieved from https://oceanprotocol.com/tech-
whitepaper.pdf
[41] Aitazaz Ali Raja, Pierre Pinson, Jalal Kazempour, and Sergio Grammatico. 2022. A market for trading forecasts: A wagering mechanism.
International Journal of Forecasting 40, 1 (2024), 142–159.
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

An Adversarially Robust Data Market for Spatial, Crowd-sourced Data
•
33:19
[42] Clionadh Raleigh, Rew Linke, Håvard Hegre, and Joakim Karlsen. 2010. Introducing ACLED: An armed conflict location and event
dataset. Journal of Peace Research 47, 5 (2010), 651–660.
[43] Gowri Sankar Ramachandran, Rahul Radhakrishnan, and Bhaskar Krishnamachari. 2018. Towards a decentralized data marketplace for
smart cities. In 2018 IEEE International Smart Cities Conference (ISC2). IEEE, 1–8.
[44] Mohammad Rasouli and Michael I. Jordan. 2021. Data sharing markets. arXiv:2107.08630. Retrieved from https://doi.org/10.48550/arXiv.
2107.08630
[45] Peter J. Rousseeuw. 1985. Multivariate estimation with high breakdown point. In Mathematical Statistics and Applications. Springer,
283–297.
[46] L. S. Shapley. 1953. Contributions to the Theory of Games (AM-28), Vol. II. Princeton University Press. DOI: https://doi.org/doi:10.1515/
9781400881970
[47] Ben Smyth. 2021. Ballot secrecy: Security definition, sufficient conditions, and analysis of Helios. Journal of Computer Security 29, 6
(2021), 551–611. DOI: https://doi.org/10.3233/JCS-191415
[48] Michael Sober, Giulia Scaffino, Stefan Schulte, and Salil S. Kanhere. 2023. A blockchain-based IoT data marketplace. Cluster Computing
26, 6 (2023), 3523–3545.
[49] S. B. Sonu and A. Suyampulingam. 2021. Linear regression based air quality data analysis and prediction using Python. In 2021 IEEE
Madras Section Conference (MASCON), 1–7. DOI: https://doi.org/10.1109/MASCON51689.2021.9563432
[50] Florian Stahl, Fabian Schomm, and Gottfried Vossen. 2014. The Data Marketplace Survey Revisited. Technical Report. ERCIS Working
Paper.
[51] Florian Stahl, Fabian Schomm, and Gottfried Vossen. 2014. Data marketplaces: An emerging species. In Databases and Information
Systems. Frontiers, 145–158.
[52] Maurice E. Stucke. 2017. Should we be concerned about data-opolies? Georgetown Law Technology Review 2 (2017), 275.
[53] Nick Szabo. 1997. The Idea of Smart Contracts. Retrieved from https://www.fon.hum.uva.nl/rob/Courses/InformationInSpeech/CDROM/
Literature/LOTwinterschool2006/szabo.best.vwh.net/smart_contracts_idea.html
[54] Matias Travizano, Carlos Sarraute, Mateusz Dolata, and Aaron French. 2020. Wibson: A case study of a decentralized, privacy-preserving
data marketplace. In Blockchain and Distributed Ledger Technology Use Cases: Applications and Lessons Learned. Springer, 149–170.
[55] Matthew Van Niekerk and Roderik van der Veer. 2018. Global Market for Local Data. Retrieved from https://www.allcryptowhitepapers.
com/wp-content/uploads/2018/11/Databroker-DAO.pdf
[56] Yuxi Zhao, Xiaowen Gong, Fuhong Lin, and Xu Chen. 2021. Data poisoning attacks and defenses in dynamic crowdsourcing with online
data quality learning. IEEE Transactions on Mobile Computing 22, 5 (2021), 2569–2581.
[57] Shuyuan Zheng, Yang Cao, and Masatoshi Yoshikawa. 2022. Secure Shapley value for cross-silo federated learning (Technical Report).
arXiv:2209.04856. Retrieved from https://doi.org/10.48550/arXiv.2209.04856
Appendix
A
An Example of an MEV Election
We illustrate a sample election of our proposed modification of MEV. Let us consider an election with three
candidates: 퐴= {푎푖,푎푗,푎푘} and only one winner is needed (퐾= 1). The possible outcomes are shown in Table A1.
Each agent constructs a vote for their preferred outcome. The possible outcomes in this case can be 푡1,푡2 or 푡3.
An example of a vote for outcome 푡1 is the pairwise preference matrix 푆(푡1), displayed in Equation (A1).
푆(푡1) =
푎푖
푎푗
푎푘
푎푖
0
푎푗
0
0
1/2
푎푘
0
1/2
0
.
(A1)
Table A1. The Lower-carnality Ordering Set when
퐴= {푎푖,푎푗,푎푘} and 퐾= 1
O
푡1
푡2
푡3
Preferred P
(푎푖)
(푎푗)
(푎푘)
Non-preferred NP
(푎푗,푎푘)
(푎푖,푎푘)
(푎푖,푎푗)
Agents in the same brackets are given the same rank in an
ordering.
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.

33:20
•
A. M. Kharman et al.
Fig. A1. A prize wheel for sampling an outcome ordering 푡∈T from a probability measure 휋.
Each agent constructs their vote. The election administrator (the agent tasked with tallying votes) receives all
the votes and computes the average vote by aggregating all the votes (following Equation (1)). The administrator
then solves the optimisation problem as per Equation (6). This will return the probability of selecting each of the
three possible outcomes: 휋∗= 휋∗(푡1), 휋∗(푡2), 휋∗(푡3).
Suppose the administrator computes 휋∗from the optimisation problem in Equation (6). Assuming 휋∗(푡1) = 0.3,
휋∗(푡2) = 0.4 and 휋∗(푡3) = 0.3, to find the winning candidate ordering 푡∗, the administrator simply samples 푡∗from
휋∗. Consider a prize wheel as shown in Figure A1. The wheel includes |T | wedges where each wedge represents
one ordering 푡and takes the share of 휋∗(푡). To obtain the winning outcome ordering, simply spin the wheel and
푡∗is the wedge where the red arrow stops, i.e., 푡1 in Figure A1.
To summarise:
(1) Firstly, each agent 푎푖constructs their vote, the pairwise preference matrix 푆(푖), from the data point 푥푖and
reputation 푟푖→푗.
(2) Then, an average of all agents’ pairwise preference matrix 푆(퐴) is calculated.
(3) Then, a low-cardinality ordering set of agents T is constructed from 퐾, the number of necessary winners
needed.
(4) For every possible ordering of candidates 푡, a theoretical pairwise preference matrix 푆(푡) is constructed.
(5) Then, the election administrator (the agent running the election) solves the optimisation problem to
maximise entropy as defined in Equation (6). The outcome is a probability measure 휋∗, of a given ordering.
This probability measure also adheres to the Representative Probability property, Section 4.2.2.
(6) Finally, the election administrator samples an outcome ordering 푡∗from 휋∗, using a ‘prize-wheel’ sampling,
as shown in Figure A1. This ordering is the final election outcome.
Received 17 July 2024; revised 30 September 2024; accepted 20 October 2024
Distributed Ledger Technologies: Research and Practice, Vol. 4, No. 4, Article 33. Publication date: October 2025.