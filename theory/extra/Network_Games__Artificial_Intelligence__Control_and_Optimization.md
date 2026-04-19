LNCS 15185
Hélène Le Cadre
Yezekael Hayel
Bruno Tuffin
Tijani Chahed (Eds.)
Network Games, 
Artificial Intelligence, 
Control and Optimization
11th International Conference, NETGCOOP 2024
Lille, France, October 9–11, 2024
Proceedings

Lecture Notes in Computer Science
15185
Founding Editors
Gerhard Goos
Juris Hartmanis
Editorial Board Members
Elisa Bertino, Purdue University, West Lafayette, IN, USA
Wen Gao, Peking University, Beijing, China
Bernhard Steffen
, TU Dortmund University, Dortmund, Germany
Moti Yung
, Columbia University, New York, NY, USA

The series Lecture Notes in Computer Science (LNCS), including its subseries Lecture
Notes in Artiﬁcial Intelligence (LNAI) and Lecture Notes in Bioinformatics (LNBI),
has established itself as a medium for the publication of new developments in computer
science and information technology research, teaching, and education.
LNCS enjoys close cooperation with the computer science R & D community, the
series counts many renowned academics among its volume editors and paper authors, and
collaborates with prestigious societies. Its mission is to serve this international commu-
nity by providing an invaluable service, mainly focused on the publication of conference
and workshop proceedings and postproceedings. LNCS commenced publication in 1973.

Hélène Le Cadre · Yezekael Hayel ·
Bruno Tufﬁn · Tijani Chahed
Editors
Network Games,
Artiﬁcial Intelligence,
Control and Optimization
11th International Conference, NETGCOOP 2024
Lille, France, October 9–11, 2024
Proceedings

Editors
Hélène Le Cadre
Inria
Villeneuve-d’Ascq, France
Bruno Tufﬁn
Inria
Rennes, France
Yezekael Hayel
University of Avignon
Avignon, France
Tijani Chahed
IMT
Palaiseau, France
ISSN 0302-9743
ISSN 1611-3349 (electronic)
Lecture Notes in Computer Science
ISBN 978-3-031-78599-3
ISBN 978-3-031-78600-6 (eBook)
https://doi.org/10.1007/978-3-031-78600-6
© The Editor(s) (if applicable) and The Author(s), under exclusive license
to Springer Nature Switzerland AG 2025
This work is subject to copyright. All rights are solely and exclusively licensed by the Publisher, whether
the whole or part of the material is concerned, speciﬁcally the rights of translation, reprinting, reuse of
illustrations,recitation,broadcasting,reproductiononmicroﬁlmsorinanyotherphysicalway,andtransmission
or information storage and retrieval, electronic adaptation, computer software, or by similar or dissimilar
methodology now known or hereafter developed.
The use of general descriptive names, registered names, trademarks, service marks, etc. in this publication
does not imply, even in the absence of a speciﬁc statement, that such names are exempt from the relevant
protective laws and regulations and therefore free for general use.
The publisher, the authors and the editors are safe to assume that the advice and information in this book
are believed to be true and accurate at the date of publication. Neither the publisher nor the authors or the
editors give a warranty, expressed or implied, with respect to the material contained herein or for any errors
or omissions that may have been made. The publisher remains neutral with regard to jurisdictional claims in
published maps and institutional afﬁliations.
This Springer imprint is published by the registered company Springer Nature Switzerland AG
The registered company address is: Gewerbestrasse 11, 6330 Cham, Switzerland
If disposing of this product, please recycle the paper.

Preface
We are very glad to present the proceedings of the 11th International Conference on
Network Games, Control and Optimization, NETGCOOP 2024. The event took place in
the beautiful city of Lille, France, from October 9 through 11, 2024, and was organized
and hosted by Inria.
Internet communications and services are experiencing an increase in volume and
diversity both in their capacity and in their demand. This comes at the cost of an increase
in the complexity of their control and optimization, mainly due to the heterogeneity in
architecture as well as usage. The need for new ways of effectively and fairly allocating
resources belonging to a wide set of not necessarily cooperative networks to a collection
of possibly competing users is urgent and is the aim of this conference.
NETGCOOP 2024 covered different areas of modeling, game theory, control and
optimization, with a focus on scheduling and resource allocation in 5G/6G networks,
matching in graphs as well as propagation, pricing and economic models, energy and
generative AI.
During the conference, we were also very glad to host four very exciting keynote
talks: Michel Mandjes (Leiden University) on analysis and inference of dynamic random
graphs, Nadia Oudjane (EDF) on managing distributed ﬂexibilities in power systems,
Sergio Grammatico (Delft University of Technology) on equilibrium seeking in complex
systems and Michael Jordan (Inria and University of California, Berkeley) on contracts,
uncertainty and incentives in decentralized machine learning.
The success of the conference was largely due to the general co-chairs: Hélène Le
Cadre (Inria) and Yezekael Hayel (Avignon Université), the technical program commit-
tee, whose members devoted much of their time and effort to provide highly-qualiﬁed
reviews, our sponsors: CNRS GDR RO, Samovar laboratory, CRIStAL research center
in Lille, PGMO, Inria and Avignon Université, our publisher Springer, the organiza-
tion committee, Tania Jimenez (Avignon Université) and Marie-Bénédicte Dernoncourt
(Inria) and the publicity chair Alexandre Reiffers-Masson (IMT Atlantique). To all, we
express our deepest gratitude and utter thankfulness.
We extend our very warm thanks to the authors who submitted very high-quality
papers and to the presenters and attendees for their involvement and time, and hope all
the prospective readers take as much pleasure in reading these proceedings as we took
in editing them.
October 2024
Tijani Chahed
Bruno Tufﬁn

Organization
General Chairs
Hélène Le Cadre
Inria, France
Yezekael Hayel
Avignon University, France
Technical Program Committee Chairs
Bruno Tufﬁn
Inria, France
Tijani Chahed
Télécom SudParis, France
Publicity Co-chairs
Alexandre Reiffers-Masson
IMT Atlantique, France
Web Chair
Tania Jimenez
Avignon University, France
Program Committee
Tansu Alpcan
University of Melbourne, Australia
Eitan Altman
Inria, France
E. Veronica Belmega
ETIS/ENSEA – UCP – CNRS, France
Randall Berry
Northwestern University, USA
Quentin Cappart
Polytechnique Montréal, Canada
Xu Chen
Sun Yat-sen University, China
Hanane Dagdougui
Polytechnique Montréal, France
Francesco De Pellegrini
Avignon Université, France
Salah Eddine Elayoubi
CentraleSupélec, France
Jocelyne Elias
Università di Bologna, Italy
Anthony Ephremides
University of Maryland, USA
Dieter Fiems
Ghent University, Belgium
Vasileios Karyotis
Ionian University, Greece

viii
Organization
George Kesidis
Pennsylvania State University, USA
Seong-Lyun Kim
Yonsei University, South Korea
Iordanis Koutsopoulos
Athens University of Economics and Business,
Greece
Lasse Leskelä
Aalto University, Finland
D. Manjunath
IIT Bombay, India
Daniel Sadoc Menasché
Federal University of Rio de Janeiro, Brazil
Iriniel-Constantin Morarescu
Université de Lorraine, France
Ariel Orda
Technion, Israel
Adam Ouorou
Orange Labs, France
Balakrishna Prabhu
LAAS-CNRS
Nahum Shimkin
Technion, Israel
Alonso Silva
Nokia Bell Labs, France
Nicolas Stier
Facebook Core Data Science, USA
Alexandre Reiffers-Masson
IMT Atlantique, France
Sabine Wittevrongel
Ghent University, Belgium
Sponsors
Springer
S@movar
GdR ROD
CRIStAL
PGMO
Inria
Avignon University

Contents
Scheduling, Queuing Systems and Resource Allocation
Optimizing Age of Information with Attacks . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
Josu Doncel and Mohamad Assaad
Strategic Routing in Heterogeneous Discriminatory Processor Sharing
Queues
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
Dieter Fiems and Balakrishna J. Prabhu
Radio Resource Allocation in 5G/B5G Networks: A Dimension Reduction
Approach Using Markov Decision Processes . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
Lucas Inglés, Olivier Tsemogne, and Claudina Rattaro
Modeling and Performance
On the Stability of DAG-Based Distributed Ledger with Heterogeneous
Delays . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
Hajer Rejeb and Alexandre Reiffers-Masson
Performance Paradox of Dynamic Bipartite Matching Models . . . . . . . . . . . . . . . .
Iratxe Iriondo and Josu Doncel
Active Nodes Maximization in a Virus Spread Model: An SI2R Malware
Propagation Model . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
Arthur Ngoufo, Willie Kouam, Yezekael Hayel, Gabriel Deugoué,
and Charles Kamhoua
Pricing and Economic Models
Impact of Regulation and the Digital Markets Act on Competing Platforms . . . .
Patrick Maillé and Bruno Tufﬁn
Optimal Strategy Against Straightforward Bidding in Clock Auctions . . . . . . . . .
Jad Zeroual, Marianne Akian, Aurélien Bechler, Matthieu Chardy,
and Stéphane Gaubert
Fair Cost Sharing Under Platform Two-Sided Intermediation . . . . . . . . . . . . . . . .
Luis Guijarro, José Ramón Vidal, and Vicent Pla

x
Contents
Tariff Versus Sanction Under Bounded Rationality . . . . . . . . . . . . . . . . . . . . . . . . .
Frédy Pokou, Marta Fochesato, and Hélène Le Cadre
Energy, Generative AI
Forecast Trading as a Means to Reach Social Optimum on a Peer-to-Peer
Market . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
Ilia Shilov, Hélène Le Cadre, Ana Buši´c, Anibal Sanjab,
and Pierre Pinson
An Optimization Setup of the Decarbonization Problem
in the Transportation Sector . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
Anthony Couthures, Prunelle Vogler, Olivier Beaude,
Samson Lasaulce, and Irinel-Constantin Morarescu
Large Language Models Playing Mixed Strategy Nash Equilibrium Games . . . .
Alonso Silva
Short Paper
Analysis of a System with Multiple Caches that Share Objects . . . . . . . . . . . . . . .
G. Kesidis and N. Alfares
Author Index . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

Scheduling, Queuing Systems
and Resource Allocation

Optimizing Age of Information
with Attacks
Josu Doncel1(B)
and Mohamad Assaad2
1 University of the Basque Country, UPV/EHU, 48940 Leioa, Spain
josu.doncel@ehu.eus
2 CentraleSupelec, Gif-sur-Ivette, France
Abstract. This paper provides an analysis of the impact of attacks on
the Age of Information (AoI) in queuing systems. We consider single
and tandem queue models, with and without preemption in service. We
have shown that when preemption in service is allowed, attacks do not
result in AoI reduction. For non preemptive servers, we show that attacks
can reduce the AoI for both tandem and single server cases. For the
single server case, we establish necessary and suﬃcient conditions for the
existence of arrival and attacks rates that minimize the AoI and provide
an explicit expression of the optimal attack rate when the arrival rate of
updates is very large. Numerical results corroborate the analytical claims
and show the accuracy of the obtained results when the arrival rate of
update is low.
Introduction
This paper deals with a scenario in which a process needs to be observed remotely
in such a way that the information about the status of this process must be
as recent as possible. Such a situation occurs in a wide range of applications,
being the most popular the autonomous driving systems in which recent traﬃc
information is crucial to take adequate decisions. The Age of Information (AoI)
is a novel performance metric that measures the freshness of the information
about the status of a remote system. Since its introduction in the seminal papers
[3,4], the main goal has been to characterize the average AoI of systems (or
other alternative performance metrics such as the Peak Age of Information,
the Query Age of Information or the Age of Incorrect Information) as well as
to study the conditions under which the AoI can be reduced. In general, the
channel/environment between the source and remote monitor has been generally
modeled as a queueing system, which can capture the impact of transmission
delay due to the fact that the remote receiver is far away from the source. We
refer to [9] for a recent survey on this topic.
We consider a system with attacks. These attacks provoke that all the updates
in the queues are discarded, i.e., that the queueing system gets empty. They
model, for instance, the behavior of a malicious adversary that aims to avoid
that the monitor receives information about the status of the process of interest.
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 3–13, 2025.
https://doi.org/10.1007/978-3-031-78600-6_1

J. Doncel and M. Assaad
The attacks under study here have a clear negative eﬀect if we consider other
performance metrics widely studied in queueing models such as throughput.
In this work, we show that the presence of attacks can improve performance
when the metric under consideration is the AoI. More precisely, we show that
for a single server and for a tandem queue system, when we allow preemption
in service, the AoI is not reduced by the presence of attacks. However, for the
preemptive case, the AoI might be reduced due to the presence of attacks.
Furthermore, for a non preemptive single server, we provide the following
analytical results. First, we establish necessary and suﬃcient conditions for the
existence of an arrival rate of attacks such that the average AoI is reduced. Then,
we provide an analytical expression of the arrival rate of attacks that minimizes
the average Age of Information when the arrival rate of updates is much larger
than the service rate. Finally, we show that when the arrival rate of updates
tends to inﬁnity, R, which is the maximum reduction factor due to the presence
of attacks, tends to 2.
The authors in [1] consider an M/M/1/2 queue and analyze the average AoI
when there is a deterministic or exponentially distributed deadline in the packet
that is waiting in the queue. More precisely, in their model, the packet that
is waiting is discarded when its sojourn exceed its deadline. Our work aims to
study a more general framework by considering that the discarded packets are,
not only those that are waiting in the queue, but also the packets that are in
service. Our work is also close to [5], where the M/M/1/1 queue with preemption
and without preemption is considered and the server changes from On to Oﬀ
state with exponential times. When the server changes from On to Oﬀand it
is busy, it stops serving packets and, when it changes from Oﬀto On again,
the packet that has been stopped is resumed. In our model, however, when an
attack occurs, packets in service are discarded (i.e., they are not served again).
Another diﬀerence of our model is that we consider not only single servers but
also tandem queues.
Model Description
We consider a system in which the status of one process is observed remotely
by a monitor. The transmission channel/medium through which status updates
are sent to the monitor is modeled as a queueing system. We assume that the
transmission times from the sources to the transmission channel and from the
transmission channel to the monitor are both zero. Therefore, we use inter-
changeably the terms generation time of updates and arrival time of updates to
the queueing system, as well as the terms end of service at the queueing system
and delivery to the monitor.
We consider that an attack occurs following a Poisson process of rate α.
When this occurs, all the updates in the transmission channel are discarded, i.e.,
the transmission channel gets empty. We assume that the system can operate
normally right after an attack (i.e., the transmission channel does not need any
recovery time after an attack).

Optimizing Age of Information with Attacks
As a metric of performance of the model under study, we consider the AoI,
which is deﬁned as the time elapsed since the generation time of the last status
update that has been delivered to the monitor. Our goal is to analyze the inﬂu-
ence of the attacks on the AoI. Thus, we denote by Δ(α) the average Age of
Information (AAoI) when the rate at which attacks occurs is α. For the models
under study, we ﬁrst study α∗, which is deﬁned as the value of α that mini-
mizes Δ(α). Furthermore, we investigate the performance improvement due to
the presence of attacks. For this purpose, we deﬁne R as the ratio between the
AAoI when α = 0 and the AAoI for the value of α that minimizes Δ, i.e.,
R = limα→0+ Δ(α)
minα Δ(α)
.
(1)
Single Queues
3.1
Preemptive Queues
We consider a single queue. Updates arrive to the system following a Poisson
process of rate λ and are served with exponential time with rate μ. We consider
that preemption in service is allowed, i.e., when an incoming update arrives
to the queue and the server is busy, the incoming update replaces the current
update in service.
The authors in [8, Thm 2a)] characterize the AAoI of source i (i.e., the source
of interest) in a M/M/1/1 queue with preemption in service and where there are
other sources that are not of interest also send updates to the queue. In their
model, an arrival from an update of a source which is not of the source of interest
replaces the packet in service. Besides, the end of the service of a packet which
is not of the source of interest do not modify the AoI of the source of interest.
Therefore, since there is at most one packet in the system, replacing an update in
service by a packet which is not from the source of interest has the same eﬀect
for the AoI as removing the packet in service (which occurs when an attack
occurs); in both cases, the AoI is not modiﬁed until the end of the service of a
new incoming packet of the source of interest. Hence, we conclude that the AAoI
of a single queue with preemption in service coincides with that of [8, Thm 2a)].
As a result, we have that the AAoI of a M/M/1/1 queue with preemption in
service and attacks is
Δ(α) = 1
λ

1 + λ + α
μ

.
We observe that Δ(α) is clearly an increasing function of α. Therefore, we
conclude the attacks do not reduce the AAoI for this model. As we will see next,
this is not the case when preemption is not allowed.
3.2
Non Preemptive Queues
We consider a single queue with Poisson arrivals of rate λ and exponential ser-
vice times with rate μ in which, unlike in the previous model, we do not allow

J. Doncel and M. Assaad
preemption in service, i.e., when an incoming update arrives to the queue and
the server is busy, the incoming update is discarded.
The author in [7, Section IIIA] characterizes the AAoI single queue without
preemption and abandonment. We note that, since there is at most one update
in this model, an abandonment and an attack have the same eﬀect in the system,
i.e., in both cases, the server gets idle. Therefore, we conclude that our model
coincides with that of [7, Section IIIA]. As a consequence, from the result of [7,
Section IIIA], it follows that the AAoI of a system of a M/M/1/1 queue without
preemption and with attacks is
Δ(α) = 1
λ + 1
μ +
λ
(μ + α)(λ + μ + α) + α
λμ.
(2)
The author in [7, Section IIIA] says that, when λ/μ is suﬃciently large, a
positive rate of abandonments (in our model, attacks) leads to an improvement
of the AAoI, i.e., the AAoI is a decreasing function of α when α →0. Here, we
study analytically the value of α that minimizes (2). We ﬁrst show that (2) is
convex in α.
Lemma 1. (2) is convex in α.
Proof. The derivative of (2) with respect to α is:
λμ −
λ(λ + 2(α + μ))
(α + μ)2(λ + α + μ)2 .
(3)
We compute the derivative with respect to α of the above expression and it
results:
−2λ(α + μ)2(λ + α + μ)2
(α + μ)4(λ + α + μ)4
+
2λ(α + μ)(λ + α + μ)(λ + 2(α + μ))(λ + α + μ + α + μ)
(α + μ)4(λ + α + μ)4
.
The above expression is positive if and only if
−(α + μ)(λ + α + μ) + (λ + α + μ + α + μ)2 > 0.
And the above expression clearly holds since
(λ + α + μ + α + μ)2 = (λ + α + μ)2 + (α + μ)2 + 2(λ + α + μ)(α + μ)
> (λ + α + μ)(α + μ).
Since α is positive, using the above result, we know that the global mini-
mum of (2) is strictly positive when its decreasing at α = 0. We now provide a
necessary and suﬃcient condition for this fact.
Lemma 2. (2) is decreasing at α = 0 if and only if λ
μ > 1.2469.

Optimizing Age of Information with Attacks
Proof. The derivative with respect to α of (2) is given in (3), which at α = 0
equals
λμ −λ(λ+2μ)
μ2(λ+μ)2 . This expression is negative if and only if
λ2(λ + 2μ) > μ(λ + μ)2.
Let ρ = λ/μ. The above expression is equivalent to:
ρ2(ρ + 2) > (ρ + 1)2 ⇐⇒ρ3 + ρ2 −2ρ −1 > 0.
We now notice that ρ3 + ρ2 −2ρ −1 = 0 has a unique positive root, which is
1.2469. And the desired result follows since ρ3 + ρ2 −2ρ −1 is positive when
ρ > 1.2469.
From the above results, we conclude that the optimal rate of attacks is pos-
itive if and only if λ > 1.2469μ.
Proposition 1. The rate of attacks that minimizes (2) is strictly positive if and
only if λ
μ > 1.2469.
In Proposition 1, we provide necessary and suﬃcient conditions such that the
rate of attacks that minimizes AAoI is positive. The derivation of an analytical
expression of the value of α∗(i.e., the value of α that minimizes (2)) requires to
compute the roots of (3), which is equivalent to ﬁnd the roots of a polynomial of
degree four. α∗can hence be obtained numerically in a general setting. However,
we now focus on λ >> μ and we study the value of α∗for this case.
Proposition 2. When λ >> μ, the value of α that minimizes (2) is α∗≈
√μ(
√
λ −√μ).
Proof. Let λ = Cμ. We show that the desired result follows when C →∞. For
λ = Cμ, the derivative with respect to α of (2) is zero if and only if
Cμ2 −
Cμ(Cμ + 2(α + μ))
(α + μ)2(Cμ + α + μ)2 = 0 ⇐⇒
C2μ3(Cμ + 2(α + μ))
(α + μ)2(Cμ + α + μ)2 = 1.
When C →∞, we have that
C2μ3(Cμ + 2(α + μ))
(α + μ)2(Cμ + α + μ)2 ≈
Cμ2
(α + μ)2 .
Therefore, for C →∞, the derivative with respect to α of (2) is zero when
Cμ2
(α + μ)2 ≈1 ⇐⇒α∗≈μ(
√
C −1) = √μ(
√
λ −√μ),
where the last equality follows since λ = Cμ, i.e., C = λ/μ.

J. Doncel and M. Assaad
From the above result, we conclude that, when λ →∞, the value of α that
minimizes (2) tends to inﬁnity as well. We now focus on R, which, according to
(1) and (2), gives for this model
R =
λ + 1
μ +
λ
μ(λ+μ)
minα

λ + 1
μ +
λ
(μ+α)(λ+μ+α) +
α
λμ
.
For the denominator, we have from Proposition 2 that, when λ >> μ,
min
α
 1
λ + 1
μ +
λ
(μ + α)(λ + μ + α) + α
λμ

=
λ + 1
μ +
λ
(μ + √μ(
√
λ −√μ))(λ + μ + √μ(
√
λ −√μ))
+
√μ(
√
λ −√μ)
λμ
=
μ +
√μ(
√
λ + √μ)
+
√λμ.
As a result, when λ →∞, the denominator of R tends to 1/μ. Furthermore,
the numerator of R tends to 2/μ when λ →∞. Thus, the next result follows.
Proposition 3. When λ →∞, R →2.
Tandem Queues
4.1
Preemptive Queues
We consider a system with n tandem queues. The service rate of queue i is
exponentially distributed with rate μi > 0, i = 1, 2, . . . , n. Updates arrive from
outside to Server 1 and we assume that the generation times follow a Poisson
process of rate λ. For i = 1, . . . , n −1, when an update in Server i ends service,
it is immediately sent to Server i+1. We allow preemption of updates in service,
i.e., when an update arrives to a server that is busy, the incoming update starts
service and the update that was being served is lost. We provide an explicit
expression of the AAoI for this model. The proof is given in A.
Proposition 4. The AAoI of a system of n tandem preemptive servers with
attacks is
Δ(α) = 1
λ +
n

i=1
μi
i−1

j=0

1 + α
μj

.
(4)
We observe that the AAoI is a polynomial of degree n with positive coeﬃ-
cients. This implies that α∗= 0 for this model and, as a result, we have that
R = 1. Therefore, we conclude the attacks do not reduce the AAoI for this
model.

Optimizing Age of Information with Attacks
4.2
Two Non Preemptive Queues
We consider a system with two tandem queues with Poisson arrivals with rate λ
and exponential service times with rate μi at Server i. Servers are non preemp-
tive, i.e., when an update arrives to a server that is busy, the incoming update
is discarded. The AAoI of this system without attacks has been studied in [2].
We aim to study whether the presence of attacks reduces the AAoI. For this
purpose, we model the system using the SHS technique. In Fig. 1 we consider
μ1 = μ2 = 1 and, for diﬀerent values of λ, we plot the AAoI of this system when
α changes from 0.1 to 5. We observe that, for λ = 1 and λ = 10, we have that
α∗> 0, which implies that R > 1, i.e., the attacks can reduce the AAoI in this
system.
Fig. 1. AAoI with respect to α for μ1 = μ2 = 1 and diﬀerent values of λ.
Numerical Experiments
The result of Proposition 2 can be used to provide an approximation of the value
of α∗for an arbitrary λ. In Table 1, we study the accuracy of this approximation
for diﬀerent values of λ and μ = 1. We observe that the value of √μ(
√
λ −√μ)
is close to α∗even for λ small.
Table 1. Comparison of α∗and the approximation based on Proposition 2 for diﬀerent
values of λ and μ = 1.
α∗
√μ(
√
λ −√μ)
λ = 3
0.6219 0.732
λ = 10 1.133 1.236
λ = 30 4.413 4.477
λ = 50 6.017 6.071
λ = 100 8.959 9
λ = 200 13.111 13.142

J. Doncel and M. Assaad
Acknowledgements. This work has received funding from the Grant PID2023-
146678OB-I00 funded by MICIU/AEI/10.13039/501100011033 and by the European
Union NextGenerationEU/ PRTR and from the Department of Education of the
Basque Government through the Consolidated Research Group MATHMODE (IT1456-
22).
A
Proof of Proposition 4
We model the system witn n tandem preemptive servers using the SHS technique
[8]. The continuous state is a vector x(t) = [x0(t) x1(t) . . . xn(t)] and the Markov
chain is formed by a single state. Besides, x0(t) represents the age at the monitor
and, for i = 1, . . . , n, xi(t) represents the generation time of the update in Server
i when Server i is busy and, when an update is sent from Server i to the next
one, it is the timestamp of a fake update that is put in Server i and does not
modify the age of the system.
Here, we consider the SHS derivation [6] with an additional transition which
is related to the attacks. For more details on the SHS technique and derivation,
the reader can refer to [6]. Thus, the SHS Markov chain we consider has also
a single state and the table of transitions of the SHS method is presented in
Table 2. We explain each transition now.
Fig. 2. The SHS Markov chain for n tandem preemptive servers with attacks.
Table 2. Table of transitions of the SHS method for n tandem preemptive servers with
attacks.
l
λ(l)
xAl
¯vqlAl
0
λ
[x0 0 x2 x3 . . . xn−1 xn]
[¯v0,0
0
¯v0,2 ¯v0,3 . . . ¯v0,n−1 ¯v0,n]
μ1
[x0 x1 x1 x3 . . . xn−1 xn]
[¯v0,0 ¯v0,1 ¯v0,1 ¯v0,3 . . . ¯v0,n−1 ¯v0,n]
μ2
[x0 x1 x2 x2 . . . xn−1 xn]
[¯v0,0 ¯v0,1 ¯v0,2 ¯v0,2 . . . ¯v0,n−1 ¯v0,n]
...
...
...
...
n −1 μn−1 [x0 x1 x2 x3 . . . xn−1 xn−1] [¯v0,0 ¯v0,1 ¯v0,2 ¯v0,3 . . . ¯v0,n−1 ¯v0,n−1]
n
μn
[xn x1 x2 x3 . . . xn−1 xn]
[¯v0,n ¯v0,1 ¯v0,2 ¯v0,3 . . . ¯v0,n−1 ¯v0,n]
n + 1 α
[x0 x0 x0 x0 . . . x0 x0]
[¯v0,0 ¯v0,0 ¯v0,0 ¯v0,0 . . . ¯v0,0
¯v0,0]

Optimizing Age of Information with Attacks
– For l = 0, a new update arrives to Server 1 and, since the update in Server 1 is
preempted, the value of the second element of x is replaced by zero, whereas
the value of the rest of the elements of x is not modiﬁed.
– For l ∈{1, . . . , n−1}, an update in Server l ends service and is sent to Server
l + 1. Therefore, the value of the l + 2-th element of x is replaced by that
of the l + 1-th element and, since we put a fake update in Server l with the
same timestamp as the update that has just ended its service, the value of
the l + 1-th element of x is not modiﬁed. The rest of the elements of x are
not modiﬁed.
– For l = n, the update of Server n ends its service and it is sent to the
monitor. As a result, the value of the ﬁrst element of x changes to that of the
last element and the last element of x does not change since we put a fake
update in Server n. The rest of the elements of x are not modiﬁed.
– For l = n + 1, an attack arrives and all the updates are discarded, but a
fake update with the same timestamp as that of the monitor is put in all the
servers. Therefore, all the elements of x changes to x0, which is the age of the
monitor.
Since the Markov chain has a single state, the stationary distribution is clearly
πq = 1. The age of the real or fake updates increases at unit rate and, therefore,
bq is a vector formed by n + 1 ones. In the following, we use the notation
μ0 = λ and μn+1 = α to simplify the presentation. We apply [8, Thm 4] for the
transitions of Table 2 and we obtain the following expressions:
¯v0,0
n+1

i=0
μi
	
= 1 + ¯v0,0
n−1

i=0
μi
	
+ ¯v0,nμn + ¯v0,0μn+1
(5)
¯v0,1
n+1

i=0
μi
	
= 1 + ¯v0,1
 n

i=
μi
	
+ ¯v0,0μn+1
(6)
¯v0,k
n+1

i=0
μi
	
= 1 + ¯v0,k
k−1

i=0
μi
	
+ ¯v0,k−1μk−1 + ¯v0,k
 n

i=k
μi
	
,
k = 2, 3, . . . , n.
(7)
Simplifying (5), we get
¯v0,0 = 1
μn
+ ¯v0,n,
(8)
whereas from (6) that
¯v0,1

1 + μn+1
μ0

= 1
μ0
+ ¯v0,0
μn+1
μ0
,
(9)
and from (7) that, if k = 2, . . . , n, then
¯v0,k

1 + μn+1
μk−1

=
μk−1
+ ¯v0,k−1 + μn+1
μk−1
¯v0,0,
(10)

J. Doncel and M. Assaad
Let Bn = 
n
i=0

1 + μn+1
μi

. We multiply both sides of (8) by Bn−1 we get:
¯v0,0Bn−1 = Bn−1
μn
+ ¯v0,nBn−1 = Bn−1
μn
+ ¯v0,n

1 + μn+1
μn−1

Bn−2
= Bn−1
μn
+

μn−1
+ ¯v0,n−1 + ¯v0,0
μn+1
μn−1

Bn−2,
where in the second equality we use that Bn−1 =

1 + μn+1
μn−1

Bn−2 and in the
third equality we use (10) with k = n. Since Bn−1 = Bn−2 + μn+1
μn−1 Bn−2, we note
that the term μn+1
μn−1 Bn−2¯v0,0 appears on both sides of the above expression and,
therefore, both terms are canceled. Hence, we get ¯v0,0Bn−2 = Bn−1
μn
+ Bn−2
μn−1 +
Bn−2¯v0,n−1. Applying this arguments recursively, it results that
¯v0,0B1 = Bn−1
μn
+ Bn−2
μn−1
+ · · · + B0
μ1
+ B0¯v0,1,
which using (9) gives
¯v0,0B1 = Bn−1
μn
+ Bn−2
μn−1
+ · · · + B0
μ1
+ 1
μ0
+ ¯v0,0
μn+1
μ0
.
Since ¯v0,0
μn+1
μ0
appears on both sides of the last expression, the above formula
is equivalent to
¯v0,0 = Bn−1
μn
+ Bn−2
μn−1
+ · · · + B0
μ1
+ 1
μ0
.
References
1. Kam, C., Kompella, S., Nguyen, G.D., Wieselthier, J.E., Ephremides, A.: On the
age of information with packet deadlines. IEEE Trans. Inf. Theory 64(9), 6419–6428
(2018)
2. Kam, C., Molnar, J.P., Kompella, S.: Age of information for queues in tandem. In:
MILCOM 2018 - 2018 IEEE Military Communications Conference (MILCOM), pp.
1–6 (2018)
3. Kaul, S., Gruteser, M., Rai, V., Kenney, J.: Minimizing age of information in vehic-
ular networks. In: 2011 8th Annual IEEE Communications Society Conference on
Sensor, Mesh and Ad Hoc Communications and Networks, pp. 350–358. IEEE (2011)
4. Kaul, S., Yates, R., Gruteser, M.: Real-time status: How often should one update?
In: 2012 Proceedings IEEE INFOCOM, pp. 2731–2735. IEEE (2012)
5. Sinha, A., Mankar, P.D., Pappas, N., Dhillon, H.S.: Age of information with on-oﬀ
service. In: 2023 IEEE Information Theory Workshop (ITW), pp. 445–450. IEEE
(2023)
6. Yates, R.D.: Age of information in a network of preemptive servers. In: IEEE INFO-
COM 2018-IEEE Conference on Computer Communications Workshops (INFO-
COM WKSHPS), pp. 118–123. IEEE (2018)
7. Yates, R.D.: The age of information in networks: moments, distributions, and sam-
pling. IEEE Trans. Inf. Theory 66(9), 5712–5728 (2020)

Optimizing Age of Information with Attacks
8. Yates, R.D., Kaul, S.K.: The age of information: real-time status updating by mul-
tiple sources. IEEE Trans. Inf. Theory 65(3), 1807–1827 (2018)
9. Yates, R.D., Sun, Y., Brown, D.R., Kaul, S.K., Modiano, E., Ulukus, S.: Age of
information: an introduction and survey. IEEE J. Sel. Areas Commun. 39(5), 1183–
1210 (2021)

Strategic Routing in Heterogeneous
Discriminatory Processor Sharing Queues
Dieter Fiems1(B) and Balakrishna J. Prabhu2(B)
1 Ghent University, Departement TELIN, Gent, Belgium
dieter.fiems@UGent.be
2 LAAS CNRS, University of Toulouse, CNRS, Toulouse, France
balakrishna.prabhu@laas.fr
Abstract. We consider strategic routing for a two-class discriminatory
processor queue with an additional cost for joining the premium class. We
show that, depending on the speciﬁc parameters of the system, various
equilibria can coexist, including equilibria where the queueing system is
not ergodic for the equilibrium traﬃc split. We also investigate how the
server can select the priority of the classes and the fees charged from the
customers in order to maximise its revenue.
Introduction
By introducing service diﬀerentiation, customers are oﬀered a choice between
diﬀerent service levels at distinct price points. Customers then make a trade-
oﬀbetween the cost of the diﬀerent service levels and the beneﬁts they bring,
for example, in terms of reductions in sojourn times. This trade-oﬀdetermines
the willingness of customers to pay for these services, and therefore also the
revenue of the service provider. Queueing theory provides various options to
achieve service diﬀerentiation, including preemptive and non-preemptive priority
disciplines [1], parallelised services and discriminatory processor sharing [2,3].
In this paper, we explore strategic routing within the context of coupled-
resources in which the capacity available at one resource depends upon the
demand at all the resources in the network. In particular, we consider two
resources coupled by the discriminatory processor-sharing (DPS) mechanism [4].
Processor-sharing queueing systems, including both discriminatory and gener-
alised processor sharing variants, serve as useful models for resource sharing
in networking and computer systems. Notably, processor-sharing queues have
been eﬀectively utilised to analyse ﬂow-level resource sharing on the Internet, as
demonstrated in studies by Massouli´e and Roberts [5–7]. The body of research
on processor-sharing queueing systems is extensive. For an in-depth review of
the theory and its applications, we recommend the surveys by Yashkov and
Yashkova [8] on processor sharing, and by Altman et al. [9] on discriminatory
processor sharing. In the following discussion, we will speciﬁcally concentrate
on the game-theoretic analysis of processor-sharing queueing systems. Note that
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 14–23, 2025.
https://doi.org/10.1007/978-3-031-78600-6_2

Strategic Routing in Heterogeneous Discriminatory
the uncoupled-resource model is a special case of coupled-resource one, and has
a larger body of literature due to its ease of analysis.
The analysis of routing games with uncoupled-resources started with the sem-
inal work of Orda et al. [10] who gave conditions for the existence and uniqueness
of the Nash equilibrium. Since then, a large body of literature has appeared on
diﬀerent variants of this game. Altman and Shimkin [11] examine an observable
processor-sharing game in which customers decide whether to join the processor-
sharing queue after observing the number of customers already present. A similar
model is studied by Ben-Shahar et al. [12] under the assumption that customers
have heterogeneous preferences. Heterogeneity means that one customer may
join after observing a certain number of customers while another customer may
not join observing the same number of customers. In a concert queueing game,
customers choose their arrival time to minimise a cost that depends on the
arrival times of other customers. In [13], customers select their arrival times
in a processor-sharing queue, where the cost is inﬂuenced by both the sojourn
time and the deviation from their preferred departure time. Processor-sharing
games are also analysed as models for distributed non-cooperative load balanc-
ing. In these load-balancing scenarios, customers either choose a server from a
set of servers [14] or are directed to a server by a limited number of dispatchers
[14,15]. Finally, a time- and load-dependent ﬂuid processor-sharing queue is used
to model the use of park-and-ride systems during rush hour [16].
In comparison, the coupled-resource game has received less attention. Hayel
and Tuﬃn [2] study a DPS queueing game where the utility of joining diﬀerent
classes is a non-negative, decreasing function of the sojourn time. They demon-
strate the existence of a unique Wardrop equilibrium for DPS using these utility
functions. Fiems [3] investigates revenue management for DPS queues, where the
utility decreases linearly with sojourn times. The study shows that a DPS imple-
mentation is preferred over a strict priority discipline if customers are allowed
to balk. If balking is not allowed, the optimal DPS discipline degenerates to
a strict priority discipline, even if customers have heterogeneous evaluations of
sojourn times. The work closest to the model of this paper is the one in [17]
(see Sect. 3 in there) in which customers choose the probability of going to the
higher priority class in exchange of a payment. It is shown that the equilibrium
is either a pure equilibria or a mixed equilibrium depending upon the cost. The
former correspond to all the customers going to one of the two classes while, in
the latter, customers split non-trivially over the two classes. The model and the
results of [17] assume equal service rates for the two classes.
Contributions: We investigate a Markovian DPS queue where both classes
have diﬀerent service rates, and with a ﬁxed cost for joining the premium class.
The players want to minimise their mean sojourn time and may want to pay
a cost to get better service. The fact that the service rates are heterogeneous
gives rise to types of equilibria that are diﬀerent from the ones in [17]. We show
that given the parameters of the DPS queue, multiple equilibia can coexist,
including multiple “stable” equilibria (in the sense that customers converge to
these equilibria if they start from a nearby strategy and selﬁshly minimise their

D. Fiems and B. J. Prabhu
Fig. 1. Representation of the DPS queueing model
cost). Further, there may even be a non-ergodic equilibrium (there is an incentive
to converge to a traﬃc split where the queueing system is not ergodic). At this
non-ergodic equilibrium the queue is unstable and mean sojourn time of both
the classes goes to inﬁnity. This type of equilibrium appears to be speciﬁc to the
coupled-resource model, and in particular to ones with diﬀerent service rates.
The closest result in the uncoupled-resource model that has a similar ﬂavour is
the one in [15] in which the Price of Anarchy goes to inﬁnity when the cost of
a resource goes to zero. However, for ﬁnite costs (as in our paper), instability
does not seem to happen in the uncoupled-resource model. Finally, we restrict
the parameter space of the DPS model to typical scenarios where the premium
tier oﬀers the faster service as well higher DPS weight factors, and discuss how
the service provider can optimise its revenue.
Overview: The remainder of this paper is organised as follows. In the next
section, we introduce the modelling assumptions and notation, and recall the
formulas for the sojourn times in a DPS queueing system. We then discuss the
existence of multiple equilibria by means of numerical examples in Sect. 3. Finally
we draw conclusions in Sect. 4.
DPS Queueing Model
We consider a discriminatory processor-sharing queueing system with two classes
as depicted in Fig. 1. Non-strategic class 1 and class 2 customers arrive at the
queues in accordance with Poisson processes with rates κ1 and κ2, respectively.
In addition, strategic customers arrive at the queue in accordance with a Poisson
process with rate λ and select a class without observing the state of the queueing
system. Let λi denote the arrival rate of strategic customers that opt for class
i ∈{1, 2}, with λ1 + λ2 = λ. The class 1 and class 2 service times constitute a
sequence of independent and identically exponentially distributed random vari-
ables with rates μ1 and μ2, respectively. Without loss of generality, we ﬁx the
DPS weight of class 1 and 2 to γ and 1−γ, respectively for γ ∈[0, 1]. For γ = 0.5
there is no diﬀerentiation between the classes, while for γ = 1 (γ = 0) the DPS
discipline degenerates to a strict preemptive priority discipline for class 1 (class
2). This Markovian DPS queueing system admits a stationary solution provided
that the load does not exceed the service capacity,
μ1
(κ1 + λ1) + 1
μ2
(κ2 + λ2) < 1 .

Strategic Routing in Heterogeneous Discriminatory
If this is the case, the expected sojourn times ¯T1 and ¯T2 of class 1 and 2 equal
[9],
T 1 =
μ1(1 −ρ)

1 +
μ1ρ2(1 −2γ)
μ1γ(1 −ρ1) + μ2(1 −γ)(1 −ρ2)

,
(1)
T 2 =
μ2(1 −ρ)

1 −
μ2ρ1(1 −2γ)
μ1γ(1 −ρ1) + μ2(1 −γ)(1 −ρ2)

,
(2)
with ρi = μ−1
i (λi + κi) and ρ = ρ1 + ρ2.
We now study the fractions of strategic customers that opt for class 1 and
class 2, respectively. To this end, we impose that there exist fractions λ1 and λ2
with λ1 + λ2 = λ such that the queueing process is stationary ergodic. This is
the case provided that
κ1
μ1
+ κ2
μ2
+
λ
max(μ1, μ2) < 1 .
The rates λ1 and λ2 are now chosen such that none of the customers in these
ﬂows has an incentive to change to the other ﬂow. Customers prefer class 1 over
class 2 if T 1 + δ < T 2. Here δ represents a cost for accessing class 1. In other
words, we study the rational split of the ﬂows in Wardrop equilibrium. This
notion is expressed mathematically as follows,

T 1 + δ ≥T 2
if λ2 > 0 ,
T 1 + δ ≤T 2
if λ1 > 0 .
(3)
Ergodicity: To simplify notation, we can rewrite the expected sojourn times
as follows,
T 1 =
β0 −(μ1 −μ2)(2γ −1)λ1
(β2 −(μ1 −μ2)λ1) (β3 −(2γ −1)λ1) ,
(4)
T 2 =
β1 + (μ1 −μ2)(2γ −1)λ1
(β2 −(μ1 −μ2)λ1) (β3 −(2γ −1)λ1)
(5)
with
β0 = γ(κ1μ2 + 2κ2μ1 −κ2μ2 + 2λμ1 −λμ2 −μ1μ2 + μ2
2)
−μ1κ2 + κ2μ2 −μ1λ + λμ2 −μ2
2 ,
β1 = γ(κ1μ1 −2κ1μ2 −κ2μ1 −λμ1 −μ2
1 + μ1μ2)
+ μ2κ1 + μ1κ2 + μ1λ −μ1μ2,
β2 = μ2κ1 + μ1κ2 + μ1λ −μ1μ2,
β3 = γ(κ2 −κ1 + λ + μ1 −μ2) −κ2 −λ + μ2 .
With the notation above, we can specify the range Λ of λ1 for which the queueing
process is stationary ergodic,
Λ =
⎧
⎪
⎨
⎪
⎩
(β2/(μ1 −μ2), λ] ∩[0, λ] ,
for μ1 > μ2 ,
[0, λ] ,
for μ1 = μ2 ,
[0, β2/(μ1 −μ2)) ∩[0, λ] ,
for μ1 < μ2 .

D. Fiems and B. J. Prabhu
Note that for β2/(μ1 −μ2) = 0 or β2/(μ1 −μ2) = λ, the queueing process is
not ergodic for λ1 = β2/(μ1 −μ2). However, the queueing process is ergodic for
λ1 = 0 if β2/(μ1 −μ2) < 0. A similar remark applies to the case λ1 = λ.
In the remainder, we exclude the symmetric case γ = 0.5 and μ1 = μ2. In
this case there is no service diﬀerentiation. We then have that all λ1 ∈Λ are
Wardrop equilibria for δ = 0, while λ1 = 0 is an equilibrium for δ > 0, and
λ1 = λ is an equilibrium for δ < 0.
Mixed equilibrium: We now focus on the existence of a mixed equilibrium.
A mixed equilibrium lies either in the interior of Λ, or at the non-zero boundary
of Λ in case this boundary is not equal to λ. We refer to these types of equilibria
as ergodic and non-ergodic equilibria. We discuss ergodic equilibria ﬁrst.
Solving T 1 + δ = T 2 leads to the following quadratic equation,
δ(2γ −1)(μ1 −μ2)λ2
1 −((2γ −1)δβ2 + (μ1 −μ2) (δβ3 + 4γ −2))λ1
+ δβ2β3 + β0 −β1 = 0 .
In the absence of an additional cost (δ = 0), for equal service time (μ1 = μ2) or
in absence of service diﬀerentiation (γ = 1
2), the quadratic equation simpliﬁes to
a linear equation. In this case, we have a single ergodic equilibrium at most.
In general, the quadratic equation may however possess two distinct solutions
or possess no real-valued solutions in the interior of Λ. Not every solution is stable
though, in the sense that if one slightly deviates from the equilibrium, there is
no incentive to drift back towards the equilibrium. A mixed equilibrium is stable
provided that
∂T 1
∂λ1
> ∂T 2
∂λ1
.
(6)
If this inequality holds, an increase of λ1 translates in longer sojourn times for
the ﬁrst queue, and hence there is an incentive to join the second queue and
drift towards the equilibrium.
The condition for stable equilibria simpliﬁes considerably for speciﬁc
instances. For γ = 0.5 and μ1 ̸= μ2, some elementary calculations show that
∂T 1
∂λ1
/∂T 2
∂λ1
= μ2
μ1
.
Hence, any equilibrium with T 1 + δ = T 2 is stable for μ1 < μ2 and unstable
for μ1 > μ2. Moreover, for any γ and for μ1 = μ2 we have by means on some
elementary calculations,
∂T 1
∂λ1
/∂T 2
∂λ1
= T 1
T 2
.
In the equilibrium, we have T 1 + δ = T 2. Hence, positive δ implies T 1 < T 2
and the equilibrium is not stable. Analogously, for negative δ, we have a stable
equilibrium.
Pure Equilibria: First consider the case μ1 > μ2. We have pure equilibrium
for λ1 = λ provided that T 1 + δ ≤T 2. If β2/(μ1 −μ2) < 0, we have a pure

Strategic Routing in Heterogeneous Discriminatory
equilibrium at λ1 = 0 provided that T 1 + δ ≥T 2. Analogously, for μ1 < μ2, we
have pure equilibrium for λ1 = 0 provided that T 1 +δ ≥T 2. If β2/(μ1 −μ2) > λ,
we have a pure equilibrium at λ1 = λ provided that T 1 + δ ≤T 2. Finally, for
μ1 = μ2, the queues are stable for λ1 = 0 and λ1 = λ, and we have two pure
equilibria.
A pure equilibrium is stable provided we do not have equality at the equilib-
rium. If the latter is the case, stability again requires that the customers have
an incentive to drift towards the equilibrium, that is, the equilibrium is stable
provided (6) holds.
Non-ergodic Equilibria:
It is possible that customers have an incentive to
drift towards a traﬃc mix such that the queueing process becomes non-ergodic.
Now assume μ1 ̸= μ2 and β2/(μ1 −μ2) ∈[0, λ]. Comparing the sojourn times
for λ1 = β2/(μ1 −μ2), we ﬁnd
T 1
T 2
= β0 −(μ1 −μ2)(2γ −1)λ1
β1 + (μ1 −μ2)(2γ −1)λ1
,
which simpliﬁes to the surprisingly simple expression,
lim
λ1→β2/(μ1−μ2)
T 1 + δ
T 2
= (1 −γ)μ2
γμ1
.
Note that the limiting value does not depend on δ as both T 1 and T 2 go to ∞
while δ remains ﬁnite. For μ1 > μ2, there is an incentive to drift towards the
non-ergodic traﬃc mix if the right-hand side exceeds 1. Similarly, for μ1 < μ2,
there is an incentive to drift towards the non-ergodic mix if the right-hand side
is smaller than 1. Both non-ergodic equilibria are stable. If the right-hand side
equals 1, we again have an equilibrium, and stability follows from evaluating
∂T 1
∂λ1
/∂T 2
∂λ1
.
As one would most likely want to avoid non-ergodic equilibria, the former
conditions easily translate into conditions for the DPS parameter γ. For μ1 > μ2,
we impose γ > μ2/(μ1 + μ2), while for μ1 < μ2, we need γ < μ2/(μ1 + μ2). In
words, these conditions limit prioritising the slower server.
Summary: From the discussion above, we may have up to two equilibria in the
interior of Λ as well as up to two equilibria at the boundary. As both T 1 and T 2 are
continuous functions of λ1, we easily see that stable and unstable equilibria alter-
nate when ordered (accounting for the multiplicity of the solutions of the quadratic
equation). Moreover, by listing all possible combinations of pure, mixed and non-
ergodic equilibria, we ﬁnd that the total number of equilibria is at most three.
Discussion
From the results above, we have identiﬁed multiple diﬀerent types of equilibrium
scenarios. Figure 2 illustrates the diﬀerent possibilities. For Fig. 2(a), we set γ =

D. Fiems and B. J. Prabhu
Fig. 2. Diﬀerent types of equilibria in the DPS game with additional cost
0.7, κ1 = κ2 = 0.2, λ = 1, μ1 = 2, μ2 = 1 and δ = 20. There is a single
mixed stable equilibrium. The same arrival rates and service parameters are
used in Fig. 2(b), but we now prioritise the second queue: γ = 0.2. In this case,
the only (stable) equilibrium is obtained for λ1 = 0.6, for which both queues
grow. Customers have an incentive to opt for the slower queue. Note that the
faster queue grows as well as the service share of the slower queue grows with
the slower queue size. In ﬁgure 2(c), we retained all parameters apart from the
constant cost δ which equals δ = −10 in this ﬁgure. We now have a single mixed
equilibrium which is not stable. Just below and above the equilibrium solution,
customers have an incentive to drift away from the equilibrium solution. Both
λ1 = 0.6 and λ1 = 1 are equilibrium solutions, the former again corresponding
to a non-ergodic queueing system as in Fig. 2(b). Finally, ﬁgure 2(d) shows a
scenario with two mixed equilibria. The parameters are here chosen as follows:
γ = 0.22, μ1 = 1.82, μ2 = 2, κ1 = κ2 = 0.2, λ = 1.34, and δ = −6. From left to
right, for λ1 = 0 we have a stable equilibrium, the ﬁrst mixed equilibrium is not
stable, while the second is stable.
In Fig. 3 we show how the number and the value of the equilibria vary with
the priority γ. Figure 3a is plotted for the same parameter as ﬁgs 2(a) and (b) but
with δ = 1. There is only one stable equilibrium which increases as γ increases.
Figure 3b and 3c (resp.) are for parameters of ﬁgs. 2(c) and ﬁgs. 2(d)(resp.). In

Strategic Routing in Heterogeneous Discriminatory
Fig. 3. Number and value of equilibria as a function of γ
Fig. 4. Number of stable and unstable equilibria for diﬀerent (γ, δ) (a) and diﬀerent
(γ, λ) pairs.
Fig. 3b, there are initially three equilibria of which the mixed one is unstable.
Further, λ1 = 1 is an equilibrium for all values of γ. As priority increases the
mixed equilibrium merges with the pure one at λ1 = 0.6. On the other hand,
in Fig. 3c there are two mixed equilibria one of which is stable and it increases
towards λ1 = 1 as γ increases. The mixed unstable equilibrium goes again merges
with the pure one at λ1 = 0.
The former ﬁgures show that the number of equilibria varies with the param-
eters. To further investigate parameter dependence, Fig. 4 shows the regions with
equal number of stable and unstable equilibria in the (γ, δ) (a) and (γ, λ) planes.
We chose the following parameters in Fig. 4(a): κ1 = κ2 = 0.2, μ1 = 1.8, μ2 = 2,
λ = 1.3. In Fig. 4(b), we set κ1 = κ2 = 0, μ1 = 1, μ2 = 2, and δ = 2. For both
ﬁgures, there is just one stable equilibrium and no unstable equilibria in region
1. In region 2 there are 2 stable equilibria as well as an unstable equilibrium.

D. Fiems and B. J. Prabhu
Fig. 5. Server-side optimization
Server-side Optimisation:
Finally, we investigate how the server should
choose γ (the priority) and δ (payment by the customers) so as to maximise
its revenue.
Let λm be the minimum value of λ1 for which the system is stable. This
value is given by (assuming μ1 > μ2): λm = max
	
0, β2(μ1 −μ2)−1
. Note that
at least a rate λm of customers have to go to queue 1 to keep the system stable.
This means the server is guaranteed a revenue of λmδ and it can maximise
revenue by setting an arbitrarily large δ since balking is not allowed in our
model. In practice, faced with a high price, customers will either balk or go to
another service provider. Since our model has only one server (a monopoly) and
customers cannot balk, we impose a tax (or a penalty) of λmδ on the server.
This tax (or penalty) is paid by the server to the society in order to keep its
monopoly. Every customer choosing queue 1 pays δ but the server gets to keep
only a fraction (λ1 −λm)/λ1 of this amount. The revenue of the server is then
(λ1 −λm)δ.
With this deﬁnition of the revenue, the server does not generate revenue when
the customers that choose queue 1 are only those that are forced to make this
choice in order to stabilise the system. The server can no longer take advantage
of its monopoly and set arbitrarily high prices as seen in the example below.
We assume that the server is able to orient the Wardrop equilibrium chosen
by the customers to the stable equilibrium of its choice. In Fig. 5a, the revenue
is plotted as a heat map (the darker the higher) for diﬀerent values of γ and δ.
The other parameters are: κ1 = κ2 = 0.2, λ = 1, μ1 = 2, μ2 = 1. We observe
that it is best for the server to give priority to class 1 (the faster class) by taking
the largest γ. However, for γ = 0.99 (that is, full priority to class 1), there is an
optimal value of δ that is in the interior as is shown in Fig. 5b.

Strategic Routing in Heterogeneous Discriminatory
Conclusion
We demonstrated that in a two-class discriminatory processor queue with an
additional cost for joining the premium class, various equilibria can coexist
depending on the system parameters. Notably, we found that certain conditions
lead to non-ergodic behaviour, where the equilibrium traﬃc mix corresponds to
a non-ergodic queueing system. This highlights the complexity of customer equi-
libria in the non-symmetric DPS queue. Additionally, we showed that the server
can maximise revenue by adjusting the payment level of the higher priority class,
thereby inﬂuencing the fraction of customers choosing the higher priority class.
References
1. Gurvich, I., Lariviere, M.A., Ozkan, C.: Coverage, coarseness, and classiﬁcation:
determinants of social eﬃciency in priority queues. Manage. Sci. 65(3), 1061–1075
(2019)
2. Hayel, Y., Tuﬃn, B.: Pricing for heterogeneous services at a discriminatory pro-
cessor sharing queue. In: Proceedings of Networking (2005)
3. Fiems, D.: Strategic revenue management for discriminatory processor shar-
ing queues. In: Computer Performance Engineering and Stochastic Modelling
(LNCS,volume 14231), pp. 3–17. Springer (2023)
4. Fayolle, G., Mitrani, I., Iasnogorodski, R.: Sharing a processor among many job
classes. J. ACM 27(3), 519–532 (1980)
5. Massouli´e, L., Roberts, J.: Bandwidth sharing: objectives and algorithms.
IEEE/ACM Trans. Networking 10(3), 320–328 (2002)
6. Massouli´e, L., Roberts, J.: Bandwidth sharing and admission control for elastic
traﬃc. Telecommun. Syst. 15(1–2), 185–201 (2000)
7. Roberts, J.W.: A survey on statistical bandwidth sharing. Comput. Networks
45(3), 319–332 (2004)
8. Yashkov, S.F., Yashkova, A.S.: Processor sharing: a survey of the mathematical
theory. Autom. Remote. Control. 68(9), 1662–1731 (2007)
9. Altman, E., Avrachenkov, K., Ayesta, U.: A survey on discriminatory processor
sharing. Queueing Syst. 53(1–2), 53–63 (2006)
10. Orda, A., Rom, R., Shimkin, N.: Competitive routing in multiuser communication
networks. IEEE/ACM Trans. Networking 1(5), 510–521 (1993)
11. Altman, E., Shimkin, N.: Individual equilibrium and learning in processor sharing
systems. Oper. Res. 46(6), 776–784 (1998)
12. Ben-Shahar, I., Orda, A., Shimkin, N.: Dynamic service sharing with heterogeneous
preferences. Queueing Syst. 35(1–4), 83–103 (2000)
13. Ravner, L., Haviv, M., Vu, H.L.: A strategic timing of arrivals to a linear slowdown
processor sharing system. Eur. J. Oper. Res. 255, 496–504 (2015)
14. Altman, E., Ayesta, U., Prabhu, B.J.: Load balancing in processor sharing systems.
Telecommun. Syst. 47(1–2), 35–48 (2011)
15. Ayesta, U., Brun, O., Prabhu, B.J.: Price of anarchy in non-cooperative load bal-
ancing games. Perform. Eval. 68(12), 1312–1332 (2011)
16. Fiems, D., Prabhu, B.J.: Macroscopic modelling and analysis of ﬂows during rush-
hour congestion. In: Performance Evaluation, pp. 149–150 (2021)
17. Hassin, R., Haviv, M.: To Queue or Not to Queue: Equilibrium Behavior in Queue-
ing Systems. Kluwer Academic (2003)

Radio Resource Allocation in 5G/B5G
Networks: A Dimension Reduction
Approach Using Markov Decision
Processes
Lucas Ingl´es1
, Olivier Tsemogne2
, and Claudina Rattaro1(B)
1 Facultad de Ingenier´ıa, Universidad de la Rep´ublica, Montevideo, Uruguay
{lucasi,crattaro}@fing.edu.uy
2 IMT Atlantique, Brest, France
serge-olivier.tsemogne-kamguia@imt-atlantique.fr
Abstract. We tackle radio resource allocation in 5G and B5G networks,
focusing on applications with stringent delay requirements. We formulate
this problem as a discounted Markov Decision Process (MDP), consider-
ing each user’s Channel Quality Indicator and queue status. We introduce
a reducible MDP using state abstraction. By mapping transition dynam-
ics and rewards to an abstract state space, we simplify solving MDPs
with smaller state spaces, avoiding the complexity of the original high-
dimensional state space. We explore diﬀerent methods for weighted state
aggregation and verify through simulations that our dimension reduction
strategy yields results close to the optimal policy.
Keywords: radio resource allocation · markov decision process ·
dimension reduction
Introduction
The ﬁfth generation (5G) of wireless networks has been purposefully designed to
accommodate a wide range of network services, each with its own requirements.
These 5G services are classiﬁed into three primary categories: ultra-reliable and
low-latency communication (uRLLC), enhanced mobile broadband (eMBB), and
massive machine-type communication (mMTC). These use cases frequently have
conﬂicting demands, necessitating a radio design that is highly versatile and
adaptable to address the varying conditions of each service category eﬃciently
[2]. In addition to the strategic conﬁguration of the radio interface (e.g., numerol-
ogy settings), ensuring speciﬁc quality of service levels, particularly to meet strin-
gent maximum delay requirements, heavily relies on the eﬀectiveness of resource
allocation algorithms.
In this work, we study a 5G/B5G downlink scheduling system. We model
the resource allocation problem as a Markov Decision Process (i.e. the ground
MDP), incorporating both the Channel Quality Indicator (CQI) of each user in
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 24–33, 2025.
https://doi.org/10.1007/978-3-031-78600-6_3

Radio Resource Allocation in 5G/B5G: Dimension Reduction Using MDPs
each Physical Resource Block (PRB) and the queue status of each user. Our
goal is to ﬁnd a scheduling policy that minimizes the queuing delay experienced
by users, eﬀectively reducing the sum-delay. Diverse applications, including real-
time video streaming, online gaming, and smart transportation, underscore the
critical importance of optimizing downlink scheduling and resource allocation to
ensure seamless connectivity and high performance across various sectors.
Interestingly, the vast majority of works that study the resource alloca-
tion problem by modeling it as a MDP then solve this complex problem,
which involves high-dimensional states and action spaces, using Artiﬁcial Intelli-
gence techniques. In particular, Reinforcement Learning (RL) is a prevalent tool
employed in these studies (see for example [1,4–6]). Inspired by state abstrac-
tion techniques, which have been shown to signiﬁcantly improve the eﬃciency
of MDP-solving algorithms [3,7], we formulate an abstract MDP. Our approach
deﬁnes the similarity between states and works with a reduced complexity sys-
tem by grouping similar states into aggregate classes. The aggregation deﬁnes
transition and reward dynamics between classes.
The main contribution of this work is the introduction of an approach for
solving high-dimensional Markov Decision Processes (MDPs), speciﬁcally in the
ﬁeld of mobile communications. We propose diﬀerent abstractions to solve the
original resource allocation problem eﬃciently. By conducting a thorough com-
parative analysis of diﬀerent weight distribution strategies for state aggregation,
we identify the most eﬀective approximate solution for the base MDP. This
analysis considers factors such as convergence time, proximity to the optimal
solution (the solution of the ground MDP), and other relevant metrics. Our
results show signiﬁcant improvements in the resolution times of the resulting
MDP, while maintaining minimal error and ensuring the extrapolation to the
original model. Moreover, we provide access to our repository housing the sim-
ulations conducted, facilitating further exploration and validation of our results
(GitHub Repository1).
The remainder of the article is structured as follows. In Sect. 2 we introduce
our hypotheses and the main characteristics of the considered resource allocation
problem. We also formulate our ground MDP and provide some intuition that
will explain the state aggregation, which will be the basis of Sect. 3. In Sect. 3
we describe the diﬀerent abstractions and we present some results. We conclude
in Sect. 4.
Model Description
The scheduler eﬃciently allocates bandwidth among slices and users, using the
Physical Resource Block (PRB) as its basic unit. In 5G’s OFDM system, a PRB
consists of 12 OFDM subcarriers and one Transmission Time Interval (TTI). In
this work, we aim to reduce the state-action space involved in the scheduler’s
decision-making process. To start, let us ﬁrst introduce the problem description.
1 https://github.com/Tsemogne/Radio-Resource-Allocation.

L. Ingl´es et al.
2.1
Problem Description
The time is divided into discrete time slots (i.e. TTIs). Our system comprises
N User Equipments (UEs), denoted as ue1, . . . , uei, . . . , ueN, and M PRBs,
denoted as prb1, . . . , prbj, . . . , prbM. We assume that the Channel Quality
Indicator (CQI) for each UE in each PRB, represented as hi,j, remains con-
stant throughout the time. These CQI values are organized into an N × M
matrix, denoted as h, which we refer to as the Channel Quality (CQ) matrix.
At each time slot, our scheduler allocates each PRB to exactly one UE for that
time slot duration. This allocation can be represented as a tuple a, where a(j)
represents the UE to which prbj is allocated. In matrix form, a is an M × N
matrix. Both matrix are represented in Eq. (1). Here, aj,i equals 1 if the j-th
PRB is allocated to the i-th UE and 0 otherwise. Notably, each row in matrix a
has only one non-zero entry, indicating the UE to which the corresponding PRB
is allocated.
h =
⎡
⎢⎢⎢⎢⎢⎢⎣
h1,1 . . . h1,j . . . h1,M
...
...
...
hi,1 . . . hi,j . . . hi,M
...
...
...
hN,1 . . . hN,j . . . hN,M
⎤
⎥⎥⎥⎥⎥⎥⎦
a =
⎡
⎢⎢⎢⎢⎢⎢⎣
a1,1 . . . a1,i . . . a1,N
...
...
...
aj,1 . . . aj,i . . . aj,N
...
...
...
aM,1 . . . aM,i . . . aM,N
⎤
⎥⎥⎥⎥⎥⎥⎦
(1)
We assume that once an PRB is allocated to a UE, it enables the transmission
of qhi,j bits, where q is a positive constant real number. The total number of
bits scheduled for transmission by the i-th UE is given by Ti:
Ti = q
M

j=1
hi,jaj,i.
(2)
Then, the size of the data remaining in the buﬀer of the i-th UE after transmis-
sion is calculated as:
resti = max(0, bi −Ti).
(3)
Here, bi represents the size of data in the buﬀer at the beginning of the time slot2.
After the transmission, the buﬀer of each UE with a maximum size of B bits
receives a random number li of bits, following a known probability distribution.
The buﬀer can’t store more than B −resti bits and will drop any extra bits.
Therefore, the size of the data in the buﬀer after the time slot is:
b′
i = min (B, li + resti) .
(4)
The decision maker incurs two costs: one for the dropped data and another for
the delay associated with the non-transmitted data:
c′
i = α
	
max(0, li + resti −B)

x + β (resti)y ,
(5)
2 We omit the temporal reference to clarify the notation. Note that resti represents
bi(t + 1), then Eq. (3) can be re-written as bi(t + 1) = max(0, bi(t) −Ti(t))..

Radio Resource Allocation in 5G/B5G: Dimension Reduction Using MDPs
where α, β, x, and y are positive coeﬃcients. The ﬁrst term represents the
cost due to excess data that exceeds the buﬀer capacity, while the second term
accounts for the penalty related to the delay of the data remaining in the buﬀer.
2.2
The Ground MDP Model
Our problem can be modeled as an MDP M = (B, A, P, c) where:
– The state of the network is the size b = (bi)N
i=1 of the data in the buﬀers with
0 ⩽bi ⩽B, then B = {0, . . . , B}N;
– An action is any matrix a ∈{0, 1}M×N with exactly one non-zero entry in
each row;
– The transition probabilities are given by
P (b′|b, a) =
N


i=1
P {li = b′
i −resti} =
N


i=1
El 

1{b′
i=resti+li}

(6)
where resti is deﬁned in Eq. (3);
– The expected cost associated with the transition of each UE buﬀer is related
to Eq. (5). That is, the cost function is deﬁned by
c (b, a) =
N

i=1
E


α
	
max(0, li + resti −B)

x + β (resti)y
.
(7)
We now introduce the value function V π(b), that indicates how beneﬁcial (or
detrimental) it is to be in each state while adhering to the policy π, as follows,
V π(b) = E
 ∞

t=0
γtct 	
bt, π(bt)

b = b0

.
(8)
where γ is the discount factor. Then, the scheduling problem’s objective is
to determine the scheduling policy that solves the optimization minπ∈Π V π(b)
where Π denotes the set of all possible policies. If there are a ﬁnite number of
states, then in principle dynamic programming techniques obtain the optimal
policy. However, the diﬃculty of this dynamic programming increases exponen-
tially in the number of states, which in this case increases exponentially in the
number of UEs.
2.3
Intuitions for Dimension Reduction
We can observe that the total number of possible states can be expressed as
|B| = (B + 1)N. For instance, if we have B = 2 and N = 3, the total number
of states is |B| = 27. However, if we consider an increase to B′ = 3 and N ′ =
5, the total number of states becomes |B′| = 1024. This substantial growth
in the number of states with small increments in B and N underscores the

L. Ingl´es et al.
computational complexity of the problem. When extending this model to a real-
world scenario with large values of N and B, such as in 5G network contexts,
the deﬁned model becomes unmanageable.
In order to address the exponential growing of the state space, let us ﬁrst
explore the dynamics of our system. In doing so, we can ﬁnd that, on average,
the scheduler allocates M
N qHi bits for transmission from the buﬀer of a UE with
bi bits. Therefore, the remaining bits in buﬀer are max

bi −M
N qHi, 0

where
Hi = M
j=1 hi,j is the average CQI of the UE. This means that, in expectation,
the buﬀer is overloaded if E [li] + max

bi −M
N qHi, 0

⩾B, i.e., if
E [li] > B
or
E [li] ⩽B
bi ⩽B + M
N qHi −E [li] .
That is, assuming that each buﬀer satisfy the minimum requirement E [li] ⩽
B, we can characterize an UE by the expected diﬀerence between the transmis-
sion and the arrivals as:
χ (i) = M
N qHi −E [li]
(9)
In order to show the impact of the selected characteristic on the resource
allocation algorithm, we have constructed a simple scenario involving three users
N = 3, each with a maximum buﬀer size of 2 bits B = 2, and two physical
resource blocks available for allocation M = 2. We have solved the MDP (deﬁned
in previous subsection) using the value iteration algorithm and obtained the
results shown in Fig. 1.
In this proposed scenario, we have assigned similar arrival rates to UE 1
and UE 2, whilst a diﬀerent one to UE 0. Consequently, the characteristics of
UE 1 and UE 2 are very similar. Analyzing the ﬁgure, we observe a correla-
tion in resource allocation between UE 1 and UE 2. For the same states, UE 1
and UE 2 are more likely to receive the same amount of resources compared to
UE 0 - UE 2 or UE 0 - UE 1. More precisely, UE 1 and UE 2 share the same
allocation within thirteen states, while UE 0 shares eight with UE 1 and only
six with UE 2. Additionally, between UE 1 and UE 2, when one is favored in
the current allocation, the next allocation tends to favor the other, resulting in
assignments close to the average. This artiﬁcial scenario depicts how users with
similar characteristics tend to obtain similar assignations.
Considering the aforementioned, we can group the states to address the issue
of the state space. We will group the states using abstractions inspired by the
concepts presented here. This way, we will obtain a new MDP which consists of
a whole new set of states with lower cardinality. Therefore, it becomes easier to
search for a solution to the original problem in this new MDP, as it signiﬁcantly
reduces the computational cost. Afterward, we may ﬁnally infer the solution into
the original MDP.

Radio Resource Allocation in 5G/B5G: Dimension Reduction Using MDPs
Fig. 1. Comparison of Resource Allocation Grids. The horizontal axis represents the
UEs with their associated characteristics, while the vertical axis corresponds to the
state index. The number in each grid element indicates the number of bits in the user’s
buﬀer and the color represents the number of resource blocks assigned to each UE for
the respective state.
Dimension Reduction
To solve our MDP we formulate an abstract one by transfer of its dynamics on
a smaller set of “abstract states” (or mega states) that correspond to classes
of ground states. In this section we present the proposed abstractions and the
obtained results.
3.1
Grouping the States
Motivated by the intuition presented in the previous section, a natural crite-
rion for this grouping is to use the deﬁnition given in Eq. (9) as a charac-
teristic, among other possible criteria. Then, all UE characteristics lay in the
interval K =

min
i=1,...,N χ (i) ,
max
i=1,...,N χ (i)

. To group the UEs, we divide the
range K of characteristics in a certain number K of contiguous intervals K1,
. . ., Kk, . . ., KK by the mean of bounds
min
i=1,...,N χ (i) = β0 < . . . < βk <
. . . < βK =
max
i=1,...,N χ (i), by posing
Kk = [βk−1, βk]
if k < K
KK = [βK−1, βK]
. Now we
group UEs of which characteristics lay in the same division. So, the k-th group
of UEs is guek = χ−1 (Kk) = {i = 1, . . . , N | βk−1 ⩽χ (i) < βk} if k < K,
or guek = {i = 1, . . . , N | βK−1 ⩽χ (i) ⩽βK} if k = K. Finally, we group
the states according to the total number φk (b) = 
i∈guek bi of bits in each

L. Ingl´es et al.
group of UE’s buﬀer. The class of a state b is thereby determined by the K-
tuple φ (b) = (φ1 (b) , . . . , φk (b) , . . . , φK (b)). Clearly, φ is an abstraction that
takes values in the set U = ⨉K
k=1 {0, . . . , Bk}, where Bk = |guek| B, and
U is henceforth the abstract state space. The number of abstract states is
|U| = K
k=1 (1 + |guek| B), the maximum value being achieved when the num-
bers of UEs in two UE groups diﬀer from at most 1.
3.2
Approximated Solution
Assuming that a weight distribution ω: B −→R+ is set on the classes of
states, i.e., 
b∈φ−1 ω (b), the transition and the cost dynamics are transferred
on U as: P (u′|u, a) = 
b∈φ−1(u) ω (b) 
b′∈φ−1(u′) P (b′|b, a) and c (u, a) =

b∈φ−1(u) ω (b) c (b, a) . Each policy μ of the so deﬁned MDP
	
U, A, P, c

induces
the policy π of the ground MDP (B, A, P, c) deﬁned by constant extrapolation,
i.e., as π (s) = μ (φ (s)). If μ is the optimal policy of
	
U, A, P, c

, then π is a
quasi-optimal policy of (B, A, P, c).
3.3
Weight Distribution in Classes
Among many possibilities, we randomly select a representative state in each
class or we weight the states according to the similarity (or dissimilarity) in
their components. The idea behind this is to weight according to the extent
to which the groups of UEs are homogeneous. We examine the impact of the
following weight distributions:
Weighting the States After the UEs. We associate an N-tuple (ηi)N
i=1
of coeﬃcients (that need not sum to 1) with the UEs. This tuple induces a
coeﬃcient coef[η] (b) and a weight ω[η] (b) for each state of the MDP, deﬁned as
coef[η] (b) = N
i=1 ηibi
and ω[η] (b) =
coef[η](b)

b′∈φ−1(φ(b)) coef[η](b′). We chose the
coeﬃcients ηi in order to capture the similarity or the dissimilarity of the sizes
of queues of the same group at each time slot.
– To capture the similarity, we take the size, ηi = bi, or the closeness, ηi =
e
bi−
|guek|

j∈guek bj
 between the UE and the average of its group. We call
these models respectively the UE-based empirical and the UE-based closeness
models.
– To capture the dissimilarity, we take the distance ηi =
bi −
|guek|

j∈guek bj

between the UE and the average of its group. We call this model the UE-based
distance model.
Directly Weighting the States. We associate each group of UEs with a coef-
ﬁcient coefk (b) that captures the similarity or the dissimilarity of the sizes
of its members. Then, we aggregate the coeﬃcients of each state and normal-
ize all the aggregated coeﬃcients to obtain a weight ω deﬁned as coef (b) =

Radio Resource Allocation in 5G/B5G: Dimension Reduction Using MDPs
K
k=1 coefk (b)
and ω (b) =
coef(b)

b′∈φ−1(φ(b)) coef(b′). We eventually need to nor-
malize the values bi to βi =
bi

j∈guek bj before the computation of the coeﬃcient
coefk (b). This normalization is impossible if bi = 0 in all the group. This is, only
one possibility represents the group and, accordingly we assign it the coeﬃcient
coefk (b) = 0.
– To capture the similarity, among other indexes, we have the cosine similarity
calculated as the basis is the equal distribution in the group, equal (b)i =

j∈guek bj
|guek|
. Its value is : coefk (b) =

i∈guek biequal(b)i

i∈guek b2
i

i∈guek equal(b)2
i
. We call this
weighting model the (state-based) cosine similarity model.
– To capture the dissimilarity, we perform the state-based: standard deviation
model with coefk (b) =


i∈guek
	
bi−equal(b)i


i∈guek bi
; cross entropy model with
coefk (b) = −
i∈guek βi ln
	
equal (β)i

= ln |guek| ; and total diﬀerence
with the Gini index coefk (b) =

i,j∈guek |bi−bj|
2|guek| 
i∈guek bi .
Representative Selection. Another weighting model consists in choosing a
representative in each class, which is equivalent to assigning some member of
the class the weight value 1 and no weight to the other members. We do it either
randomly or on the basis of the above criteria. We name the ﬁrst model random
representative selection, while the other models are the criterion-based represen-
tative selection. We distinguish between the criterion-based one representative-
selection that consists in randomly selection a representative that maximizes
the underlined criterion, and the criterion-based all representative-selection that
equally weights all the representatives that maximize the underlined criterion.
3.4
Results
We conduct several numerical evaluations to assess the performance of the pro-
posed abstractions3. Diﬀerent simulations can be run in our available GitHub
Repository by changing the model parameters. In all cases, promising results are
obtained, signiﬁcantly reducing the complexity of the problem, which translates
into a notable reduction in execution times. Although an error analysis of this
approach is not performed, it is shown that the state abstraction works.
In particular, we work with a scenario composed of N = 4, B = 3, and
M = 2, solving the ground MDP using the classical value iteration algorithm and
obtained the precise solution and the optimal policy. Additionally, we explore
diﬀerent aggregations; Table 1 summarizes the results obtained by setting the
number of groups to two. Each abstraction model (each row in table 1) is char-
acterized by the number of states selected in each class (select mode: one top-
weighted state, the top-weighted states, or all states), the criteria used to weight
3 All simulations were performed using an Intel Core i7, 11th Generation, 8-core,
2.8 GHz processor with 32 GB of RAM.

L. Ingl´es et al.
the states (groups or UEs), the rule determining the state weights (uniform dis-
tribution, similarity, or dissimilarity), and the variant (standard deviation, cross
entropy or Gini coeﬃcient) of this rule when the items receiving coeﬃcients were
groups and the rule referred to dissimilarity. Then, columns six and seven indi-
cate the maximum diﬀerences between the precise and approximated solutions,
as well as the greatest divergences between the exact and approximated optimal
policies. The table also presents the resolution times and abstraction times, and
it indicates in the last column the percentage of the resolution time (including
the extrapolation time) relative to the resolution time of the ground model.
Table 1. Comparison of abstraction models. Parameters: N = 4, B = 3, M = 2
and γ = 0.9. The precision for each MDP resolution was set to 10−16. Cost function
parameters x = y = α = β = 1. % of total resolution time is the percentage relative to
the resolution time of the ground model.
ID coef owners coef criterion criterion variant select mode max diﬀvalues max diﬀactions abstraction time resolution time extrapolation time % of total resolution time
UEs
uniform
–
one
7.516
18.680
4.786
0.002
27.363
UEs
uniform
–
top
10.350
19.097
5.104
0.006
29.201
UEs
uniform
–
all
10.350
19.041
5.125
0.003
29.301
UEs
sim
–
one
10.380
19.292
4.826
0.002
27.592
UEs
sim
–
top
10.793
21.690
5.788
0.003
33.089
UEs
sim
–
all
8.871
21.032
5.015
0.003
28.671
UEs
dissim
–
one
24.059
20.001
5.169
0.004
29.558
UEs
dissim
–
top
17.482
21.510
6.980
0.003
39.905
UEs
dissim
–
all
14.713
30.658
7.856
0.010
44.950
10 groups
uniform
–
one
9.000
26.170
5.122
0.003
29.283
11 groups
uniform
–
top
10.350
20.800
5.414
0.003
30.956
12 groups
uniform
–
all
10.350
25.976
7.309
0.003
41.783
13 groups
sim
–
one
13.111
26.534
5.331
0.003
30.479
14 groups
sim
–
top
10.793
21.121
5.397
0.004
30.864
15 groups
sim
–
all
9.981
24.329
7.064
0.006
40.396
16 groups
dissim
sd
one
13.770
28.580
5.554
0.003
31.750
17 groups
dissim
cross
one
11.839
21.104
5.539
0.003
31.670
18 groups
dissim
gini
one
8.424
21.075
5.354
0.003
30.608
19 groups
dissim
sd
top
17.482
21.782
6.519
0.004
37.272
20 groups
dissim
cross
top
10.350
29.282
7.550
0.003
43.162
21 groups
dissim
gini
top
17.482
26.261
5.403
0.003
30.888
22 groups
dissim
sd
all
14.765
20.632
5.367
0.005
30.702
23 groups
dissim
cross
all
10.350
20.749
6.982
0.004
39.918
24 groups
dissim
gini
all
14.765
25.828
7.118
0.003
40.697
Within this set of possible abstractions for the given problem, the ﬁrst row of
the table, corresponding to an abstraction where the coeﬃcients are associated
with the UEs and a uniform distribution is used, appears to be the best option
in terms of resolution time and proximity to the optimal solution. The results
show that for this abstraction, the resolution time is 27.3% of the resolution time
of the original MDP. This underscores the motivation to pursue this approach
and achieve its utilization for near real-time decision-making.
Conclusions
In this work, we studied a radio resource allocation system modeled using a
Markov Decision Process (MDP). Various weighted abstractions of state spaces
in MDP were presented, and simulations were conducted to compare the perfor-
mance of each model against the original. The results demonstrate the poten-
tial of these abstractions in eﬃciently solving complex MDPs. For future work,

Radio Resource Allocation in 5G/B5G: Dimension Reduction Using MDPs
we plan to explore more complex scenarios and utilize our abstractions to
enhance the performance of artiﬁcial intelligence algorithms. Additionally, a
more detailed analysis of the approximation error is necessary. Our work in
progress include the combination of state and action spaces abstraction for a
faster resolution. This allows accounting the variable numerology, variable Chan-
nel Quality Indicator (CQI) over time to emulate mobile users, and other factors
that reﬂect real-world conditions more accurately. Our goal to come out with an
eﬃcient online optimization resource allocation in 5G and B5G networks.
Acknowledgments. This work was partially funded by Universidad de la Rep´ublica’s
CSIC R&D Project “5/6G Optical Network Convergence: an holistic view”, a CAP PhD
scholarship and a STIC/AMSUD project between CAPES/BR (88881.694462/2022-
01); Ministry for Europe and Foreign Aﬀairs/FR; Campus France/FR and the National
Agency for Research and Innovation/UY (MOV CO 2022 9 1012442).
References
1. Boutiba, K., Bagaa, M., Ksentini, A.: Optimal radio resource management in 5g nr
featuring network slicing. Comput. Netw. 234, 109937 (2023)
2. Dahlman, E., Parkvall, S., Skold, J.: 5G NR: The Next Generation Wireless Access
Technology. Academic Press, 1st edn. 9 August 2018
3. Garc´ıa, J., ´Alvaro Vis´us, Fern´andez, F.: A taxonomy for similarity metrics between
markov decision processes. Mach. Learn. 111(11), 4217–4247 (2022). https://doi.
org/10.1007/s10994-022-06242-4
4. Gu, Z., et al.: Knowledge-assisted deep reinforcement learning in 5g scheduler design:
from theoretical framework to implementation. IEEE J. Sel. Areas Commun. 39(7),
2014–2028 (2021). https://doi.org/10.1109/JSAC.2021.3078498
5. Haque, M.E., Tariq, F., Khandaker, M.R.A., Wong, K.K., Zhang, Y.: A survey
of scheduling in 5g urllc and outlook for emerging 6g systems. IEEE Access 11,
34372–34396 (2023). https://doi.org/10.1109/ACCESS.2023.3264592
6. Sharma, N., Zhang, S., Somayajula Venkata, S.R., Malandra, F., Mastronarde,
N., Chakareski, J.: Deep reinforcement learning for delay-sensitive lte downlink
scheduling. In: 2020 IEEE 31st Annual International Symposium on Personal,
Indoor and Mobile Radio Communications, pp. 1–6 (2020). https://doi.org/10.1109/
PIMRC48278.2020.9217110
7. Subramanian, J., Sinha, A., Seraj, R., Mahajan, A.: Approximate information state
for approximate planning and reinforcement learning in partially observed systems.
J. Mach. Learn. Res. 23(12), 1–83 (2022). http://jmlr.org/papers/v23/20-1165.html

Modeling and Performance

On the Stability of DAG-Based
Distributed Ledger with Heterogeneous
Delays
Hajer Rejeb(B)
and Alexandre Reiﬀers-Masson
IMT Atlantique, Lab-STICC, UMR CNRS 6285, 29238 Brest, France
{hajer.rejeb,alexandre.reiffers-masson}@imt-atlantique.fr
Abstract. Directed Acyclic Graphs (DAGs) are an appealing design
for Distributed Ledger (DL) architectures. Speciﬁcally, DAG-based DLs
oﬀer valuable beneﬁts compared to blockchains, such as improved scal-
ability, lightweight consensus mechanisms and lower transaction costs.
However, due to the communication delays and distributed nature of the
DL, some transactions may remain unapproved. Previous works have
provided bounds on the expected number of unapproved transactions
when the transactions selection strategy is uniform. Still, a transaction
should be preferably validated by multiple nodes so as to increase the
trust in the ledger. In this paper, we introduce a bound on the expected
number of transactions that are approved by at most one node. For this
purpose, we deﬁne a new stochastic model based on stochastic sets, which
captures the evolution of DAG-based DL. The proposed model enables
us to establish a quadratic bound on the drift in the number of tips. We
then demonstrate that the expected volume of transactions validated by
at most one node is bounded. These results indicate that the occurrence
of large volume of transactions validated by at most one node happens
with suﬃciently low probability.
Keywords: Distributed ledger · DAG-based distributed ledger ·
Stochastic Process
Introduction
Distributed ledger technology (DLT) is a decentralized peer-to-peer digital sys-
tem that records simultaneously transactions between multiples parties spread
across diﬀerent locations. By relying on advanced cryptography and consensus
mechanisms, DLT enables participants to maintain a consistent and immutable
ledger. This eliminates the need for a centralized data store and central author-
ity, unlike traditional databases. While DLT (i.e., blockchain) has showed sig-
niﬁcant potential to support ﬁnancial transactions (and in particular Bitcoin
crypto-currency), broader and more mainstream adoption is likely to follow if
scalability issue (i.e., diﬃculties of handling large volume of transactions quickly
and eﬃciently) is resolved. In this regards, DLTs based on a Directed Acyclic
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 37–46, 2025.
https://doi.org/10.1007/978-3-031-78600-6_4

H. Rejeb and A. Reiﬀers-Masson
Graph (DAG) data structure have been introduced. DAG consists of a number
vertices (i.e., transactions) connected by directed edges such that there is no
cycle (i.e., directed path connecting a vertex to itself). DLT evolves over time as
follows: a node that creates a new transaction is required to validate (hereafter
also referred to as approve or verify) two previous transactions using a transac-
tion selection mechanism introduced in [9]. Few selection strategies have been
introduced, among which the random selection algorithm, wherein transactions
are randomly validated (for example uniformly, using Markov chain Monte Carlo
algorithm [3]). There is a growing trend among companies and startups, such
as IOTA [8], to integrate DAG-based DLT into their business operations. A key
advantage of DAG-based DLTs over blockchains is their ability to connect to
any current vertex in the graph, allowing new transactions (i.e., messages) to be
added to the ledger more eﬃciently and rapidly. Although there are undeniable
beneﬁts compared to classical blockchain, DAG-based DLTs have drawbacks. In
particular, due to the distributed and asynchronous nature of the DLT, the ver-
iﬁcation process induces latency and inconsistencies: for instance, a node may
not consider the same DL state, may believe that a validated transaction is not
yet validated and may be unaware of the existence of a new transaction. As a
consequence, the ledger performance could be signiﬁcantly aﬀected in the sense
that an increased number of transactions remains unapproved. This raises the
question of whether the number of unapproved transactions, which is called a tip
in the literature, remains bounded. In this regards, several works [2,4,8,10,11]
have studied the stability of DAG-based DLs, providing bounds on the expected
number of tips (i.e. transactions that have not been approved by any node)
and the expected validation time. In this paper, we assume that every incoming
transaction needs to be approved (at least) two times because nodes are more
likely to trust a DL in which transactions are conﬁrmed by multiple independent
nodes. Two scenarios are possible: either a node validates a transaction that has
never been validated before, or it validates a transaction that has already been
validated by another (single) node. For this purpose, we choose to use a multi-
nomial distribution for the tip selection mechanism. This is especially important
in ﬁnancial systems and applications that require a high degree of conﬁdence. In
order to estimate the volume of transactions that are insuﬃciently veriﬁed, i.e.,
not approved by any node or approved by a single node, we provide a bound
on the expected number of transactions that have been approved by at most
one node, considering the situation in which communication delays are bounded
and heterogeneous. In the following, we introduce a new deﬁnition of a tip that
corresponds to a transaction validated by at most one node. We propose a new
stochastic model based on stochastic sets to study the evolution of the number
of tips. Then, we determine a negative upper bound on the drift of the number
of tips, which allows us to conclude that its expected number is bounded over
time.

On the Stability of DAG-Based Distributed Ledger
1.1
Related Work
Our review of the literature is focused on studying the stability and perfor-
mance of DAG-based distributed ledgers (DL). The initial mathematical model
[8] of DAG-based ledgers assumes that a central node manages the ledger, while
other nodes access it by requesting information to the central node. The com-
munication delays caused by the interaction between the central server and the
other nodes are assumed to be constant. Another assumption is that the num-
ber of unapproved transactions remains close to its average value at a constant
rate. Based on the same model [8] and on the same conjuncture, some empirical
simulation-based studies [3,5] evaluate the performance of DAG-based ledgers.
In [7], The authors assume that multiple distinct message categories exist, which
lead to varying processing times and consequently diﬀerent reception delays. The
authors prove a mathematical result under diﬀerent delays, which arises from
various classes of messages. In [1], the authors assume that the strategy for
selecting unapproved messages is not uniform and prove that the number of
unapproved messages converges to a partial diﬀerential equation. In [11], using
Markov chain, the authors propose modeling the evolution of DAG-based dis-
tributed ledgers with homogeneous delays among nodes. Our paper extends the
model proposed by [2], which assumes heterogeneous delays and introduces a
mathematical framework to prove that the expected number of unapproved mes-
sages is bounded. Most of these works consider a uniform tip selection algorithm
and focus on the stability and performance of DAG-based DL, which are eval-
uated based on the evolution of unapproved messages. Among all these works,
none study the stability properties considering the evolution of the number of
transactions approved by at most one node in the presence of heterogeneous
delays with a non-uniform selection strategy.
Mathematical Model
For I ∈N∗, let I = {1, ..., I} be the set of nodes in the DL. We assume that
the state of the DL progresses at discrete time steps n ∈N. For i ∈I, let Ci
n
denote the set of new messages sent by node i at time n. Each node i generates
ri new messages at any time n. We denote V i,0
n
as the set of messages that
node i views as unapproved at time n, V i,1
n
as the set of messages that node i
considers approved by a single node j ∈I(j ̸= i) at time n, and W i
n as the set of
messages that node i considers either unapproved or approved by a single node
(other than i) at time n. Given that the selection algorithm of the IOTA Tangle
requires any incoming transaction to approve at least two tips (and can approve
the same tip twice), we assume that each new message from node i approves
two messages chosen randomly with multinomial distribution, independently and
with replacement, in W i
n. Therefore, a message can potentially validate the same
message in W i
n more than once. Additionally, a message in W i
n might be approved
by multiple messages from Ci
n. Let Di
n be the set of approved messages by node
i at time n and let Di
n be the set of all approved messages by node i up to and
including time n. That is,

H. Rejeb and A. Reiﬀers-Masson
Di
n =
n

t=0
Di
n.
We assume that V i,0
0
= {0}, V i,1
0
= Di
0 = Ci
0 = ∅and that a message cannot be
validated by the same node at two diﬀerent times. We deﬁne Γ i
n,di as the set that
contains all messages viewed by i as approved by at least two diﬀerent nodes at
time n + 1. Node j is informed about the new set of unapproved messages with
dij units of time after n and also about that messages in Γ i
n,di should not be
approved after dij units of time from n. Assume that dij = dji. The evolution
of the set Γ i
n,di can be modeled as follows:
Γ i
n,di =

j∈I
Dj
n−dij

⎛
⎝
l̸=j
Dl
n−dil
⎞
⎠,
where dij ∈N is the delay for node j to observe the new messages sent by
node i and the messages approved by node i and di = (dij)j∈I. For example, if
s ∈Γ i
n,di, there exist k, l ∈I, such that s ∈Dk
n−dik and s ∈Dl
n−dil. That is, s
was validated by node k between time 1 and time n−dik and by node l between
time 1 and time n −dil. Note that, if s was validated at time n −dil, it will
only be visible to i at time n + 1 and not at time n. The set W i
n is given by the
following formula:
W i
n+1 =

j∈I
n−dij

t=0
Cj
t −Γ i
n,di.
Note that a node i can only validate a message once. That is the messages
validated only by i are no longer tips for i but are still tips in the system. We
deﬁne Γ i
n as the set of all approved messages at least by two diﬀerent nodes
including i until time n and Γn as the set of all approved messages at least by
two diﬀerent nodes until time n. Then,
Γ i
n = Di
n

⎛
⎝
j̸=i
Dj
n
⎞
⎠,
and
Γn =

j∈I
Γ j
n.
Let Yn be the set of messages which are actually tips at time n. Then, Yn is
depicted by
Yn :=
	 n

t=0
Ct

−Γn

On the Stability of DAG-Based Distributed Ledger
and can be computed recursively as
Yn = Cn

(Yn−1 −Γn) ,
where Cn =

i∈I
Cj
n. We also need to consider the set An of messages that were
created by time (n −d∗) and are tips at time n. That is
An :=
n−d∗

t=0
Ct −Γn,
(1)
where d∗= max
i,j∈I dij.
Example 1. If d = 0 and I = {1, 2, 3}, then
• V i,0
n
= V j,0
n
and V i,1
n
= V j,1
n
for each i, j ∈{1, 2, 3}.
• The set Γ 1
n = Γ i
n,di is the set of all messages viewed by i as approved messages
by at least two diﬀerent nodes at time n + 1 for each i, j ∈{1, 2, 3}. That is
Γ i
n is the set of validated messages by {1, 2}, {2, 3} or {1, 3}.
• W i
n = Yn, for each i ∈{1, 2, 3}.
In this work, we use a multinomial random tip selection strategy. In fact, this
strategy is chosen for its ability to handle multiple outcomes with diﬀerent prob-
abilities. Speciﬁcally, transactions in V i,0
n
are more likely to be chosen by node
i than transactions in V i,1
n . We assume that transactions in V i,0
n
have a two-
thirds chance of being validated by i, while transactions in V i,1
n
have a one-third
chance. In other words, if ri ∈N∗is the number of new messages sent by node i
at each time n, the probability that a transaction a is validated by a node i at
time n is given by
P(a /∈Γ i
n


W i
n) =
⎧
⎨
⎩
if a /∈W i
n

1 −|V i,0
n
|
|W i
n|
r0
i 
1 −|V i,1
n
|
|W i
n|
r1
i if a ∈W i
n,
where r0
i and r1
i are the rounded numbers of 4ri
and 2ri
respectively. We also
deﬁne r :=
I

i=1
ri and r0 :=
I

i=1
r0
i . In the following section, we are interested in
the cardinality Xn of the tips set Yn at each time step n.
Finite Bound over the Expectation of the Cardinality
of the Tips Set
In the following, we introduce a new proof regarding the existence of a ﬁnite
bound on the expectation of the cardinality of the tips set. Such results demon-
strate that DAG-based DLs do not diverge, provided that the delays are
bounded. We begin by establishing the following useful properties of the set An
deﬁned by (1). These properties are needed to prove the bound of the number
of tips Xn.

H. Rejeb and A. Reiﬀers-Masson
Lemma 1. Let i ∈I and n ∈N∗. Then,
1. An ⊆Yn.
2. The number of tips Xn = |Yn| is bounded as follows:
|An| ≤Xn ≤|An| + rd∗.
3. The cardinal of the set of messages that node i believes to be unapproved or
approved by a single node (other than i) at time n, denoted by W i
n is upper
bounded as follows:
|W i
n+1| ≤|An| + 3rd∗.
4. We also have that W i
n is upper bounded by Xn as follows:
|W i
n+1| ≤Xn + 2rd∗.
Proof. We will now prove the four statements:
1. Direct from deﬁnition of An.
2. Note that
Yn =
 n

t=0
Ct

−Γn ⊆
⎛
⎝
n−d∗

t=0
Ct −Γn
⎞
⎠
⎛
⎝
n

t=n−d∗+1
Ct
⎞
⎠= An

⎛
⎝
n

t=n−d∗+1
Ct
⎞
⎠,
which implies that Xn ≤|An| + rd∗.
3. We have
W i
n+1 =

j∈I
n−dij

t=0
Cj
t −Γ i
n,di
⊆

j∈I
n−dij

t=0
Cj
t −Γn−d∗
⊆
	n−d∗

t=0
Ct −Γn−d∗

  	
n

t=n−d∗+1
Ct

⊆
	n−d∗

t=0
Ct −Γn

  	
n

t=n−d∗+1
Ct

 
(Γn −Γn−d∗)
⊆
	n−d∗

t=0
Ct −Γn

  	
n

t=n−d∗+1
Ct

 
⎛
⎝
j∈I
	
n

t=n−d∗+1
Dj
t

⎞
⎠,
⇒|W i
n+1| ≤|An| + d∗r + 2rd∗
= |An| + 3rd∗.

On the Stability of DAG-Based Distributed Ledger
4. Observe that:
W i
n+1 =

j∈I
n−dij

t=0
Cj
t −Γ i
n,di
⊆
n

t=0
Ct −Γn−d∗
⊆
	 n

t=0
Ct −Γn

 
(Γn −Γn−d∗)
⊆
	 n

t=0
Ct −Γn

 
⎛
⎝
j∈I
	
n

t=n−d∗+1
Dj
t

⎞
⎠
= Yn
 	
n

t=n−d∗+1
Dt

⇒|W i
n+1| ≤Xn + 2rd∗.
In the following theorem, we prove a bound on the drift of Xn using the above
lemma.
Theorem 1. The drift of the number of tips Xn is bounded as follows
E(Xn+1


Xn = x) ≤r + x −rr0(x −rd∗)
x + 2rd∗

1 −
r0r
x + 2rd∗

,
(2)
Moreover, if Xn tends to the inﬁnity, we have
lim
x→∞E(Xn+1 −Xn


Xn = x) ≤r −4
3r2.
(3)
Furthermore, for a = 7(rd∗+ rr0) and r0 ≥2
E(Xn+1 −Xn


Xn = x, x ≥a) ≤−r
7 .
(4)
Proof. Since each node acts independently at a given time, the probability that
an element s of An will be tip at time n + 1 is given by
P(s /∈Γn+1


s ∈An) =

i∈I
P(s /∈Γ i
n+1


s ∈An)
=

i∈I

1 −|V i,0
n |
|W in|
r0
i 
1 −|V i,1
n |
|W in|
r1
i
,

H. Rejeb and A. Reiﬀers-Masson
which implies that the expected number of tips in An that no longer remain as
tips at time n + 1 is given by
E(|An ∩Γn+1|


Xn = x) = |An| −|An|

i∈I
	
1 −|V i,0
n+1|
|W i
n+1|

r0
i 	
1 −|V i,1
n+1|
|W i
n+1|

r1
i
≥|An| −|An|

i∈I
	
1 −|V i,0
n+1|
|W i
n+1|

r0
i
≥|An| −|An|

i∈I

1 −
r
x + 2rd∗
r0
i
(5)
= |An| −|An|

1 −
r
x + 2rd∗
r0
(since r0 :=

i∈I
r0
i )
≥|An| −|An|

1 −
rr0
x + 2rd∗+ r0(r0 −1)r2
2(x + 2rd∗)2

= |An|

rr0
x + 2rd∗−r0(r0 −1)r2
2(x + 2rd∗)2

= |An|rr0
x + 2rd∗

1 −
(r0 −1)r
2(x + 2rd∗)

≥|An|rr0
x + 2rd∗

1 −
r0r
x + 2rd∗

≥rr0(x −rd∗)
x + 2rd∗

1 −
r0r
x + 2rd∗

,
(from Lemma 1)
where (5) follows from Lemma 1 and the fact that |V i,0
n | ≥r. Recall that
Yn+1 = Cn+1

(Yn −Γn+1)
then
Xn+1 = r + Xn −|Yn ∩Γn+1|.
Taking the conditional expectation on both sides, we obtain
E(Xn+1


Xn = x) = r + x −E(|An ∩Γn+1|


Xn = x)
≤r + x −rr0(x −rd∗)
x + 2rd∗

1 −
r0r
x + 2rd∗

which provide (2). The upper bound is coming from the fact that An ⊆Yn For
the proof of (3), it suﬃces to take the limit as x →∞in (2), we obtain
lim
x→∞E(Xn+1 −Xn


Xn = x) ≤r −rr0
= r −4
3r2.

On the Stability of DAG-Based Distributed Ledger
Let a = 7(rd∗+ rr0). Then,
E(Xn+1 −Xn


Xn = x, x ≥a) ≤r −rr0(x −rd∗)
x + 2rd∗

1 −
rr0
x + 2rd∗

≤r −2r(x −rd∗)
x + 2rd∗

1 −
rr0
x + 2rd∗

≤r −2r(a −rd∗)
a + 2rd∗

1 −
rr0
a + 2rd∗

(6)
= r −2r(6rd∗+ 7rr0)
9rd∗+ 7rr0

1 −
rr0
9rd∗+ 7rr0

≤r −2r(6rd∗+ 7rr0)
9rd∗+ 7rr0

1 −rr0
7rr0

≤r −2 ∗6r2d∗
9rd∗
= r −8r
7 = −r
7 ,
where (6) follows from the monotonicity of the functions
2r(x−rd∗)
x+2rd∗
and

1 −
rr0
x+2rd∗

in x.
We recall, from Theorem 1 in [6], that if a stochastic process has a negative
upper bound on the drift and bounded jumps, then it has a bounded expectation.
Hence, from the above results, we can deduce the existence of an upper bound
on the expected number of tips Xn.
Corollary 1. By construction, the process Xn have a bounded jumps. That is,
E(|Xn+1 −Xn|p

Xn, ..., X0) ≤(2r)p,
∀p ≥0.
Then, using the inequality (4) and Theorem 1 in [6], we deduce that
E(Xn) < ∞.
Conclusion
We herein introduce a new deﬁnition of tip in DAG-based DL and propose an
innovative mathematical model, based on stochastic sets of messages, to describe
the behavior of the DAG-based DL considering the existence of heterogeneous
delays between nodes. Moreover, we establishe an upper bound on the drift and
then derive an upper bound on the expected number of tips.

H. Rejeb and A. Reiﬀers-Masson
References
1. Ferraro, P., King, C., Shorten, R.: Iota-based directed acyclic graphs without
orphans. arXiv preprint arXiv:1901.07302 (2018)
2. Kumar, N., Reiﬀers-Masson, A., Amigo, I., Rincon, S.R.: The eﬀect of network
delays on distributed ledgers based on directed acyclic graphs: a mathematical
model. Perform. Eval. 163, 102392 (2024)
3. Kusmierz, B., Sanders, W., Penzkofer, A., Capossele, A., Gal, A.: Properties of
the tangle for uniform random and random walk tip selection. In: 2019 IEEE
International Conference on Blockchain (Blockchain), pp. 228–236. IEEE (2019)
4. Müller, S., Amigo, I., Reiﬀers-Masson, A., Ruano-Rincón, S.: Stability of local tip
pool sizes. arXiv preprint arXiv:2302.01625 (2023)
5. Park, S., Oh, S., Kim, H.: Performance analysis of dag-based cryptocurrency. In:
2019 IEEE International Conference on Communications Workshops (ICC Work-
shops), pp. 1–6. IEEE (2019)
6. Pemantle, R., Rosenthal, J.S.: Moment conditions for a sequence with negative
drift to be uniformly bounded in lr. Stoch. Process. Appl. 82(1), 143–155 (1999)
7. Penzkofer, A., Saa, O., Dziubałtowska, D.: Impact of delay classes on the data
structure in iota. In: International Workshop on Data Privacy Management, pp.
289–300. Springer (2021)
8. Popov, S.: The tangle. White Pap. 1(3), 30 (2018)
9. Popov, S., et al.: The coordicide. 12(18), 1–30 (2020). Accessed Jan
10. Popov, S., Saa, O., Finardi, P.: Equilibria in the tangle. Comput. Ind. Eng. 136,
160–172 (2019)
11. Song, X.S., Li, Q.L., Chang, Y.X., Zhang, C.: A Markov process theory for network
growth processes of dag-based blockchain systems. arXiv preprint arXiv:2209.01458
(2022)

Performance Paradox of Dynamic
Bipartite Matching Models
Iratxe Iriondo and Josu Doncel(B)
University of the Basque Country, UPV/EHU, 48940 Leioa, Spain
josu.doncel@ehu.eus
Abstract. We analyze a system in which in each time slot one customer
and one server arrive at the system according to a random process. Com-
patibilities between customers and servers are determined by a bipartite
graph. An incoming customer (resp. server), if it ﬁnds a compatible server
(resp. customer), they are matched and both leave the system. Otherwise,
they are stored in a queue. We investigate the impact on the expected
value of the unmatched customers and servers when we remove an edge
from the compatibility graph. For a quasicomplete graph and a large fam-
ily of matching policies, we provide necessary and suﬃcient conditions
on the probability distribution of the arrivals such that a performance
paradox occurs, i.e., such that removing an edge of the compatibility
graph improves the performance of the system. This phenomenon can be
seen as an analog of the Braess paradox in bipartite matching models.
Keywords: Bipartite matching models · Performance paradox ·
Markov chains
Introduction
We are interested in studying the performance of dynamic bipartite matching
models. In these models, in each time slot, exactly one customer and one server
arrive at the system. Compatible customer and server pairs are matched, in
which case they leave the system. However, if upon arrival a customer (resp.
server) does not ﬁnd a compatible server (resp. customer) to be matched with,
they wait in a queue.
To the best of our knowledge, the author in [10] is the ﬁrst to study the
dynamic bipartite matching model. In that work, the process of public housing
in Boston is explored by considering that, upon the availability of a house, it is
assigned to the longest family waiting for this kind of residence. The interest of
[10] is the fraction of families having the same preferences that are assigned to a
speciﬁc housing project, i.e., the matching rate. Later, an important contribution
is given in [7], which introduces the First Come First Served inﬁnite matching
bipartite model. In this problem, a connected bipartite graph is deﬁned, where
nodes represent the class of incoming elements and the edges their compatibili-
ties. As the compatibility graph is bipartite, the set of nodes can be separated
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 47–56, 2025.
https://doi.org/10.1007/978-3-031-78600-6_5

I. Iriondo and J. Doncel
into two parts: customer nodes and server nodes. Given the large number of
applications, for instance in call centers [8], many researchers have investigated
this model. For instance, in [1], they characterize the necessary and suﬃcient
conditions for the ergodicity of the Markov chain derived from this model and
also show that the steady-state distribution has a product form expression. The
authors in [2] consider other matching policies such as Last Come First Served,
Random, or Priorities and study the stability condition for these cases. The
bipartite matching models can be seen as a generalization of multi-skilled queue-
ing networks in which customers and servers arrive randomly to the system (see
[9] for a recent review of queueing systems with compatibilities).
There has been a recent interest of researchers in studying an alternative
matching model in which the graph that describes the compatibilities is not
bipartite. In this case, the arrivals of elements in the system are one by one.
This variant is introduced by [11]. In [12], it is proven that the steady-state
distribution of elements for this model under the First Come First Matched pol-
icy (which matches a customer with the oldest compatible server and servers
with the oldest compatible customer) has a product-form expression. Using this
result, the authors in [6] study the inﬂuence of adding an edge to the com-
patibility graph and conclude that, when ﬂexibility in the compatibility graph
increases and under the First Come First Matched policy, there exists a perfor-
mance paradox in which the expected value of the number of unmatched items
can increase. This result is generalized in [2] to greedy matching policies, which
is a large family of matching policies that include First Come First Matched
among others.
In this work, we address the following question: does the performance para-
dox of [2,6] also occur in bipartite matching models? We consider a dynamic
matching model with an arbitrary number of customer classes and two types
of servers and a compatibility graph which consists of a quasicomplete graph.
This means that all the customer and server pairs are compatible except for one.
We consider a family of matching policies that prioritize previously unmatched
items to match the incoming customer and server pairs. We ﬁrst provide an
analytical expression of the expected value of the total number of unmatched
customers and servers in a matching model with a quasicomplete compatibility
graph. Then, we remove one edge from the previously considered compatibil-
ity graph and we study the expected value of the total number of unmatched
customers and servers. Using the derived expressions, we ﬁnd a parametrized
family of arrivals and, for this instance, we provide a necessary and suﬃcient
condition for the existence of the performance paradox. We also show that the
diﬀerence on the performance of both matching models when the performance
paradox occurs is unbounded from above. This means that the degradation due
to adding ﬂexibility to a matching model can be arbitrarily large.
The rest of the article is organized as follows. We describe the model under
study in Sect. 2 as well as the assumptions we make. Then, in Sect. 3, we present
the main results of our work concerning the performance paradox in bipartite
matching models. Finally, the main conclusions and the future work are described

Performance Paradox of Dynamic Bipartite Matching Models
in Sect. 4. For the sake a readability, some of the proofs have been reported to
the Appendix.
Model Description
2.1
Bipartite Matching Models
We consider a system with multiple types of customers and servers in discrete
time. In each time slot, one customer and one server arrive at the system. The
set of customers classes is C = {c1, . . . , cm} and the set of servers classes S =
{s1, . . . , sn}. We denote by αi (resp. by βj) the probability that a customer
of type ci (resp. a server of type sj) arrives at the system in a time slot. We
assume independence of the arrivals of customers and servers. As a consequence,
a customer of type ci and a server of type sj arrive at the system in a time slot
with probability αiβj. Also, m
i=1 αi = 1 and n
i=1 βi = 1.
Fig. 1. A compatibility graph with three customer classes and three server classes.
We say that customers of type ci are compatible with servers of type sj when
the customers of type ci can be executed in a server of type sj. Compatible cus-
tomers and servers can be matched, in which case they disappear immediately;
otherwise, they are stored in a queue. The compatibility between customers and
servers is modeled as a bipartite graph (C ∪S, E), where E ⊂C × S represents
the set of compatible pairs of servers and customers. See Fig. 1 for an example
with m = n = 3.
The matching policy determines how compatible customers and servers are
matched. An example of a matching policy is the First-Come-First-Matched
discipline, in which an incoming customer is matched with the oldest compatible
server (and, likewise, an incoming server is matched with the oldest compatible
customer).
Example 1. Consider the compatibility graph depicted in Fig. 1 and the First-
Come-First-Served matching policy. The system is initially empty. Let us con-
sider that a customer of type c3 and a server of type s2 arrive at the system.

I. Iriondo and J. Doncel
Since the arriving customer and server are not compatible, they are stored in
a queue. If, in the next time slot, the incoming customer is of type c2 and the
incoming server is of type s1, the server of type s2 is matched with the customer
of type c2 and the server of type s1 is stored in the queue, leading to a situ-
ation in which there is one the customer of type c3 and one server of type s1
unmatched.
2.2
Performance Paradox
A bipartite matching model is formed by the triple (G, (α, β), ψ), where G is
the compatibility graph, (α, β) is the probability distribution of arrivals of cus-
tomers and servers and ψ is the matching policy under consideration. For a
given matching model, the number of unmatched customers and servers of the
derived matching model is a Markov chain. This Markov chain will be denoted by
M(G, (α, β), ψ) in the following. Let E[M(G, (α, β), ψ)] be the expected value
of the total number of unmatched customers and servers.
In this work, we study the impact on the mean number of customers when we
remove an edge (ci, sj) from the compatibility graph. To this aim, we consider
a compatibility graph G −(ci, sj), which consists of the compatibility graph G
without the edge (ci, sj). We denote by M(G −(si, cj), (α, β), ψ) the Markov
chain derived from this matching model and by E[M(G −(ci, sj), (α, β), ψ)] the
expected value of the mean number of customers and servers for this case.
We say that there exists a performance paradox in a matching model when
E[M(G, (α, β), ψ)] > E[M(G −(ci, sj), (α, β), ψ)].
From the above expression, we have that there exists a performance paradox
in a matching model if adding an edge to the compatibility graph increases the
expected value of unmatched customers and servers.
2.3
Assumptions
Let us present the following assumptions we make in this work.
Assumption 1 (Stability). We assume that the arrivals satisfy the following
condition: ∀C ⊆C ∀S ⊆S

ci∈C
αi <

si∈S(C)
βi and

si∈S
βi <

ci∈C(S)
αi,
(1)
where S(C) is the set of server types that are compatible with one of the customer
types of C and C(S) is the set of server types that are compatible with one of the
customer types of S. According to [5], the above expression provide a necessary
and suﬃcient condition for the stability of the matching model for the First-
Come-First-Matched policy.

Performance Paradox of Dynamic Bipartite Matching Models
Assumption 2 (Compatibility graph). We consider a compatibility graph
which is a quasicomplete bipartite graph. This means that all but one of the cus-
tomer and server pairs is compatible. We also assume that there is an arbitrary
number of customer classes such that m > 2 and n = 2 server classes. With-
out loss of generality, we assume that customer class c1 and server class s2 are
not compatible. This compatibility graph will be denoted as K[2,m] −(c1, s2). The
stability condition of (1) for this Markov chain is given by
α1 < β1.
(2)
In our performance paradox analysis, we assume that the edge we remove
from the compatibility graph is (ci, sj) where i ̸= 1 and j ̸= 2. That is, the edges
(c1, s2) and (ci, sj) do not have any node in common. Without loss of generality,
we assume that (ci, sj) = (cm, s1). This compatibility graph will be denoted as
K[2,m] −{(c1, s2), (cm, s1)}. The stability condition of (1) for this case is given
by
α1 < β1 and αm < β2.
(3)
Assumption 3. We assume that the matching policy is such that, upon arrival
of one customer and one server that are compatible, the matching priority is
given to customers and servers that have not been previously matched (i.e. the
incoming customers and servers are not matched even though they are compat-
ible if there are other compatible customers and servers in the system). This
family of matching policies includes First Come First Matched, and MaxWeight,
which maximizes the number of matching at any time. This family of matching
disciplines will be denoted as D.
Performance Paradox Analysis
The main result of this work consists of providing a necessary and suﬃcient
condition such that the performance paradox exists, i.e., such that
E[M(K[2,m]−(c1, s2), (α, β), D)] > E[M(K[2,m]−{(c1, s2), (cm, s1)}, (α, β), D)].
We ﬁrst focus on M(K[2,m] −(c1, s2), (α, β), D). In the following result, we
characterize this Markov chain and we provide an expression of E[M(K[2,m] −
(c1, s2), (α, β), D)]. The proof of this result is reported in Appendix A.
Lemma 1. The Markov chain M(K[2,m] −(c1, s2), (α, β), D) is a birth-death
process with birth probability equal to λ1 = α1β2 and death probability μ1 =
(1 −α1)β1. Therefore, if ρ1 = λ1/μ1, we have that ρ1 < 1 and
E[M(K[2,m] −(c1, s2), (α, β), D)] =
2ρ1
1 −ρ1
.

I. Iriondo and J. Doncel
We now focus on M(K[2,m] −{(c1, s2), (cm, s1)}, (α, β), D). In the following
result, we characterize this Markov chain and provide an analytical expression
of E[M(K[2,m] −{(c1, s2), (cm, s1)}, (α, β), D)]. The proof of this result can be
found in Appendix B.
Lemma 2. The Markov chain M(K[2,m] −{(c1, s2), (cm, s1)}, (α, β), D) is
formed by two birth-death processes which are connected by the state of the empty
system. The birth probability and death probability of one of them are, respec-
tively, λ1 and μ1 (which have been deﬁned in Lemma 1), whereas for the other
birth-death process the birth probability is λ2 = αmβ1 and the death probability
μ2 = (1 −αm)β2. Therefore, if ρ1 = λ1/μ1 and ρ2 = λ2/μ2, we have that ρ1 < 1
and ρ2 < 1 and
E[M(K[2,m] −{(c1, s2), (cm, s1)}, (α, β), D)]
= 2(1 −ρ1)(1 −ρ2)
1 −ρ1ρ2

ρ2
(1 −ρ1)1 +
ρ2
(1 −ρ2)1

.
From the above results, we conclude that there exists a performance para-
dox when
2(1 −ρ1)(1 −ρ2)
1 −ρ1ρ2

ρ2
(1 −ρ1)2 +
ρ2
(1 −ρ2)2

>
2ρ1
1 −ρ1
.
(4)
We now consider the following probability distribution for the arrivals of the
customer types: α1 = 0.45, αi =
0.1
m−2, for i = 2, . . . , m −1 and αm = 0.45.
For the arrivals of server types, we consider the following parametrized family
of probability distributions: β1 = 0.5 + δ and β2 = 0.5 −δ. We assume that
δ ∈(0, 0.05), which case (2) and (3) are satisﬁed, as it can be seen here:
α1 = 0.45 < 0.5 + δ = β1 and α3 = 0.45 < 0.5 −δ = β2.
For these values and after some simpliﬁcations, we get that
ρ1 = 9
0.5 + δ
0.5 −δ ,
ρ2 = 9
0.5 −δ
0.5 + δ .
It is easy to check that, when δ ∈(0, 0.05), ρ1 < 1 and ρ2 < 1. From the
above results, we have that
2(1 −ρ1)(1 −ρ2)
1 −ρ1ρ2

ρ2
(1 −ρ1)1 +
ρ2
(1 −ρ2)1

= 99
1 + 400δ2
1 −400δ2 ,
(5)
and
2ρ1
1 −ρ1
= 9(1 + 2δ)
1 −20δ .
(6)
Using the above formulas, we characterize the existence of a performance
paradox in this matching model in the following theorem.

Performance Paradox of Dynamic Bipartite Matching Models
Theorem 1. In the above matching model, there exists a performance paradox
if and only if δ ∈(0.005, 0.05).
Proof. We aim to determine the values of δ such that (4) is satisﬁed. According
to (5) and (6), we have that
9(1 + 2δ)
1 −20δ
> 99
1 + 400δ2
1 −400δ2 ⇐⇒9(1 + 2δ) > 99
1 + 400δ2
1 + 20δ
⇐⇒90(1 + 2δ)(1 + 20δ) > 99(1 + 400δ2)
⇐⇒(90 + 180δ)(1 + 20δ) > 99 + 39600δ2
⇐⇒90 + 180δ + 180δ2 + 3600δ2 > 99 + 39600δ2
⇐⇒3600δ2 −1980δ + 9 < 0
⇐⇒3600

δ −1
 
δ −

< 0.
The last expression is only true when
200 < δ <
20, which proves that the
desired result follows.
The intuition behind the above result is the following. When we remove the
edge (cm, s1) of the compatibility graph, upon arrival of one customer of type c1
and one server of type s2, the former can be matched with a server of type s1
and the latter with a customer of type cm. We remark that this is not possible
if the edge (cm, s1) would belong to the compatibility graph since they would
be previously matched (and therefore, they could not be matched with a server
of type s1 and a customer of type cm). A similar phenomenon has been also
observed recently in non-bipartite matching models in [2,6]. Our work shows
that the performance paradox occurs also in bipartite matching models.
Finally, we show that the degradation due to the existence of the performance
paradox can be arbitrarily large.
Theorem 2. When δ →0.5−, then
E[M(K[2,m] −(c1, s2), (α, β), D)] −E[M(K[2,m] −{(c1, s2), (cm, s1)}, (α, β), D)]
tends to inﬁnity.
Proof. We note that, from (5) and (6), the desired result follows if we show that
9(1 + 2δ)
1 −20δ −99
1 + 400δ2
1 −400δ2 ,
tends to inﬁnity when δ →0.05−.
From the above expression, using that δ = 0.05 −x, we get the following:
9.1 −18x
20x
−198 −3960x + 39600x2
20x(20 −200x2)
,

I. Iriondo and J. Doncel
or equivalently
9.1 −18x)(20 −200x2) −(198 −3960x + 39600x2)
20x(20 −200x2)
.
We simplify the last expression and it results:
−900x2 + 445x −4
5x(20 −200x)
.
We note that, when x →0+, the numerator of the above ratio tends to –4,
whereas the denominator to +∞. This implies that the above ratio tends to
inﬁnity when x →0+. And the desired result follows.
Conclusions and Future Work
We have studied the existence of a performance paradox in dynamic bipartite
matching models. More precisely, we have considered a quasicomplete compati-
bility graph, an arbitrary number of customer classes and two server types, and
we provide necessary and suﬃcient conditions on the arrivals of customers and
servers such that the performance paradox exists. This work extends the per-
formance paradox analysis of matching models with non-bipartite compatibility
graphs of [2,6] to bipartite matching models.
For future work, we are interested in analyzing the existence of the perfor-
mance paradox in bipartite matching models with more complex compatibil-
ity graphs (for instance, more sparse compatibility graphs or with an arbitrary
number of server classes). We would also like to analyze the existence of a per-
formance paradox in other matching models such as in multigraphs [3] or in
matching models with self-loops [4].
Acknowledgements. This research has been partially funded by the Department
of Education of the Basque Government through the Consolidated Research Group
MATHMODE (IT1456-22).
A
Proof of Lemma 1
We consider the Markov chain M(K[2,m] −(c1, s2), (α, β), D). We assume that
the system is empty. In each time slot, one customer and one server arrive at
the system. If the incoming server is of type s1, it is matched with the incoming
customer since servers of class s1 are compatible with all the customer classes.
Likewise, if the incoming server is of type s2 and the incoming customer of class
ci, with i ̸= 1, they are matched. When the incoming server is of type s2 and
the incoming customer is of type c1, they are not compatible, therefore they are
stored in a queue. This occurs with probability α1β2.
Assume now that there are k customers of type c1 and k servers of type s2
in the queue. With probability α1β2, one customer of type c1 and one server of

Performance Paradox of Dynamic Bipartite Matching Models
type s2 arrive at the next time slot. In this case, since the arriving elements are
not compatible, the number of unmatched customers and servers gets increased
by one. With probability (1 −α1)β1, one customer of type ci, with i ̸= 1, and
one server of type s1 arrive at the system, in which case, taking into account
the matching policies under consideration (see Assumption 3), the incoming
customer is matched with one server of type s2 and the incoming server with one
customer of type c1. Therefore, the number of unmatched customers and servers
decreases by one. In the rest of the cases, the incoming server and customer are
matched, which implies that the number of unmatched customers and servers
remains unchanged.
The above argument shows that the number of unmatched customers is a
birth-death process in which the birth probability is λ1 = α1β2 and the death
probability is μ1 = (1 −α1)β1. We now show that ρ1 = λ1/μ1 is smaller than
one:
α1β2
(1 −α1)β1
< 1 ⇐⇒α1 < β1,
and the last expression is true due to the stability condition (2).
As a result, the steady-state probability of being k customers of type c1
unmatched in the system is (1 −ρ1)ρk
1. Therefore, we have clearly that the
expected number of unmatched customers of class c1 is
ρ1
1−ρ1 . Using the same
reasoning, we derive that the expected value of the number of unmatched servers
of class s2 is
ρ1
1−ρ1 . As a consequence, the expected value of the total number of
unmatched servers and customers is
2ρ1
1−ρ1 . And the desired result follows.
B
Proof of Lemma 2
We consider the Markov chain M(K[2,m] −{(c1, s2), (cm, s1)}, (α, β), D). One
can use the same arguments as in Appendix A to conclude that two birth and
death processes form the Markov chain; one with the same birth and death
process as in Appendix A and the other with birth probability λ2 = αmβ1 and
death probability μ2 = (1−αm)β2. Thus, if π0 is the normalization constant, the
steady-state probability of being k customers of class c1 and k servers of class
s2 is π0ρk
1, whereas the steady-state probability of being k customers of class c1
and k servers of class s2 is π0ρk
2, where ρ2 = λ2/μ2. We know from Appendix A
that ρ1. We now show that ρ2 < 1 as follows:
ρ2 =
αmβ1
(1 −αm)β2
< 1 ⇐⇒αm < β2,
and the last expression is true because of the stability condition (3). Therefore,
we compute the value of the normalization constant as follows:
π0
⎛
⎝1 +
∞

i=1
ρi
1 +
∞

j=1
ρj
⎞
⎠= 1 ⇐⇒π0 = (1 −ρ1)(1 −ρ2)
1 −ρ1ρ2
.

I. Iriondo and J. Doncel
From the above reasoning, we conclude that the expected value of unmatched
customers is given by
π0
⎛
⎝
∞

i=1
iρi
1 +
∞

j=1
jρj
⎞
⎠= (1 −ρ1)(1 −ρ2)
1 −ρ1ρ2

ρ2
(1 −ρ1)2 +
ρ2
(1 −ρ2)2

.
And the expected value of unmatched servers is also given by the above expres-
sion. Therefore, the desired result follows.
References
1. Adan, I., Weiss, G.: Exact fcfs matching rates for two inﬁnite multitype sequences.
Oper. Res. 60(2), 475–489 (2012)
2. Ana, B., Arnaud, C., Josu, D., Jean-Michel, F.: Performance Paradox of Dynamic
Matching Models under Greedy Policies. working paper or preprint, June 2023
3. Begeot, J., Marcovici, I., Moyal, P., Rahme, Y.: A general stochastic matching
model on multigraphs. arXiv preprint arXiv:2011.05169, 2020
4. Busic, A., Cadas, A., Doncel, J., Fourneau, J.-M.: Product form solution for the
steady-state distribution of a markov chain associated with a general matching
model with self-loops. In: European Workshop on Performance Engineering, pp.
71–85. Springer, 2022
5. Bušić, A., Gupta, V., Mairesse, J.: Stability of the bipartite matching model. Adv.
Appl. Probab. 45(2), 351–378 (2013)
6. Cadas, A., Doncel, J., Fourneau, J.-M., Busic, A.: Flexibility can hurt dynamic
matching system performance. ACM SIGMETRICS Perform. Eval. Rev. 49(3),
37–42 (2022)
7. Caldentey, R., Kaplan, E.H., Weiss, G.: FCFS inﬁnite bipartite matching of servers
and customers. Adv. Appl. Probab. 41(3), 695–730 (2009)
8. Gans, N., Koole, G., Mandelbaum, A.: Telephone call centers: tutorial, review, and
research prospects. Manuf. Serv. Oper. Manag. 5(2), 79–141 (2003)
9. Gardner, K., Righter, R.: Product forms for FCFS queueing models with arbitrary
server-job compatibilities: an overview. Queueing Syst. 96(1), 3–51 (2020)
10. Kaplan, E.H.: Managing the demand for public housing. PhD thesis, Massachusetts
Institute of Technology, 1984
11. Mairesse, J., Moyal, P., et al.: Stability of the stochastic matching model. J. Appl.
Probab. 53(4), 1064–1077 (2016)
12. Moyal, P., Busic, A., Mairesse, J.: A product form for the general stochastic match-
ing model. arXiv preprint arXiv:1711.02620, 2017

Active Nodes Maximization in a Virus
Spread Model: An SI2R Malware
Propagation Model
Arthur Ngoufo1
, Willie Kouam1,2(B)
, Yezekael Hayel2
,
Gabriel Deugoué1
, and Charles Kamhoua3
1 University of Dschang, Dschang, Cameroon
agdeugoue@yahoo.fr
2 CERI/LIA, Avignon Université, Avignon, France
willie.kouam@alumni.univ-avignon.fr, yezekael.hayel@univ-avignon.fr
3 DEVCOM Army Research Laboratory, Adelphi, MD, USA
charles.a.kamhoua.civ@army.mil
Abstract. The threat of malware is increasing and poses signiﬁcant
computer security risks to both individuals and organizations. Under-
standing the tactics employed by these malicious software entities
and their dynamics during the epidemic process is crucial for design-
ing robust defense strategies and ensuring the protection of computer
systems. In this article, we investigate a population of digital nodes
(such as phones, computers, . . . ) under attack by modeling the net-
work using a susceptible-infected-resistant (SI2R) compartmental model,
where hosts can transition between susceptible, infected, or resistant
states. Our model considers two types of infected nodes: active nodes,
whose resources are exploited, and passive nodes, which spread the virus.
Both active and passive nodes can develop resistance with certain prob-
abilities, which are inﬂuenced by the resource utilization percentages set
by the malware designer. Thus, rather than optimizing resource utiliza-
tion, the malware’s goal is to maximize the number of active hosts at the
end of the process. To achieve this objective, we aim to determine the
optimal percentage of passive nodes to consider at each period, recog-
nizing that the variation in the number of active nodes depends on the
number of passive nodes.
Keywords: Computer networks · Optimal control · Epidemic model ·
Two timescale method · SPSA method
Introduction
Malware, short for malicious software, encompasses a range of threats such as
viruses, worms, trojans, and ransomware. These malicious software entities engi-
neered by cyberattackers are designed to disrupt, damage, or gain unauthorized
DISTRIBUTION A. Approved for public release: distribution unlimited.
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 57–70, 2025.
https://doi.org/10.1007/978-3-031-78600-6_6

A. Ngoufo et al.
access to computer systems, by exploiting security vulnerabilities. Driven by
the prospect of signiﬁcant ﬁnancial or political gains, malware creators dedi-
cate considerable eﬀorts towards compromising numerous networked computers
to fulﬁll their nefarious objectives. In recent years, the signiﬁcance of malware
as a pivotal component in security breaches has been underscored by the emer-
gence of zero-day attacks and advanced persistent threats [9,10]. Gaining insight
into spreading processes within complex networks is crucial for devising eﬀec-
tive control strategies across various domains, including epidemiology and public
health [1], as well as the security of cyberphysical networks [8], etc. Given the
high stakes, numerous epidemiological models have been developed to elucidate
the dynamics of malware propagation within computer networks. The most basic
epidemic model is the SI model, which includes the Susceptible (S) and Infected
(I) states. ‘Susceptible’ describes a vulnerable individual who has not yet been
infected, while ’Infected’ refers to an individual who is both a carrier and a prop-
agator of the pathogen. Nodes transition from S to I at the rate of infection. The
SIR model extends this by adding the recovered (R) state, representing individ-
uals who have recovered and gained immunity. In this model, nodes transition
from I to R at the rate of recovery. The SIS model, on the other hand, allows
infected nodes to return to the susceptible state, as they do not gain immunity.
Finally, the SEIR model introduces the exposed (E) state, indicating individ-
uals who are infected but either asymptomatic or not yet able to transmit the
pathogen until they transition to the I state. This model is useful for consider-
ing diseases with an incubation period. Basic versions of these epidemic models
are generally deterministic but may include probabilistic elements [4–7]. In our
context, we study the behavior of malware that desires to maximize the propa-
gation and then exploit the computational resources for the proﬁt of its creator.
Indeed, considering the growing importance of networked or cloud computing,
crypto-mining, and other applications, the computing resources available on a
network have become a major target for malware. Very often the cyber attacker
chooses which of the machines to infect will be used to mine crypto because of
the machine’s power and which will be used to spread the malware because of
their low detection. To simulate how malware spreads and evolves in such a con-
text (to develop eﬀective defense strategies.), we also consider a compartmental
model and diﬀerentiate between two categories of infected nodes: active nodes,
used by the malware designer to exploit resources, and passive nodes, employed
solely for propagating the malware within the network. The distinction between
these two types of infected nodes is crucial, as it aﬀects the overall impact of the
malware on the network. The reduction in the number of passive nodes corre-
sponds to a decrease in the propagation rate, consequently limiting the malware’s
maximum number of active nodes at the end of the process. Furthermore, using
passive nodes’ resources to propagate the infection degrades their performance,
potentially leading to detection and subsequent cleaning by the device owner.
Likewise, high utilization of computational resources in active nodes yields sig-
niﬁcant immediate gains for the malware designer but slows down the infected
targets, increasing the likelihood of detection and removal. Therefore, passive and

Active Nodes Maximization in a Virus Spread Model
active nodes can become resistant at any time with certain probabilities that we
assume are predetermined. This study thus focuses on a speciﬁc aspect of mal-
ware propagation: the maximization of active nodes within a network. Our main
challenge is to determine the optimal percentage of passive nodes to maximize
the number of active nodes at the end of the process. By understanding the inter-
play between active and passive nodes, we can identify strategies that malware
designers might use to achieve the goals, thereby informing the development
of more robust defense strategies. We employ a susceptible-infected-resistant
(SI2R) compartmental model to simulate the dynamics of malware propaga-
tion. In this model, a susceptible node (at risk of infection) that comes into
contact with a passive node can become either active or passive, the transition
probabilities from infected state to resistant state are inﬂuenced by various fac-
tors, including the resource utilization percentages set by the malware designer.
The rest of the paper is organized as follows. In the next section, the model
and the problem are described. Then, in Sect. 3, we provide the mathematical
analysis of the model, by showing the various properties needed to solve the
model. Following this, we use the two timescale and SPSA methods to compute
the solution of the model in Sect. 4 and make some experiments. We provide a
conclusion of our work in Sect. 5.
Model Description
In this section, we outline the problem formulation, providing a comprehensive
description of the continuous-time infection model.
Throughout this paper, we denote the population fraction of susceptible
nodes at each time t in the network by ms(t) ∈[0, 1]. The active nodes for
the malware are denoted by ma(t) and belongs to the interval [0, 1]. The pas-
sive nodes that transmit the viruses are represented by mp(t) ∈[0, 1], and the
population of fully protected nodes at any given time t ⩾0 is denoted by
mr(t) ∈[0, 1]. Since these variables represent population fractions, we must
have ms(t) + ma(t) + mp(t) + mr(t) = 1 at any time t ⩾0. For simplicity,
we will omit the explicit time dependence in the remainder of the paper. The
“susceptible-active, passive-protected” (SI2R) model for the two competing mal-
ware is expressed as follows:
(S) :
⎧
⎪
⎪
⎪
⎨
⎪
⎪
⎪
⎩
˙ms = −λmsmp
˙ma = λpmsmp −γ0ma
˙mp = λ(1 −p)msmp −γ1mp
˙mr = γ0ma + γ1mp
In the preceding system, λ ∈[0, 1] is the infection rate of the malware. A
susceptible node that is in contact with a passive infected node also becomes
infected with λ rate. This new infected node is either active with probability
p or passive with probability 1 −p. If it becomes passive, it is therefore a new
contaminator, while if it becomes active, it cannot infect others but contributes

A. Ngoufo et al.
rewards to the contamination process. However, this activity may slow down the
computer, prompting the computer owner to detect and remove the virus at a
rate of γ0. Passive agents, on the other hand, continue to infect other susceptible
machines but can also be discovered with a lower detection rate of γ1 < γ0.
As stated before, the malware’s objective is to maximize the number of active
nodes at the end of the process. That is, to ﬁnd the optimal probability of making
a contaminated agent active, to maximize the peak of the proportion of active
agents, as shown by Eq. (1).
max
p∈[0,1]

max
t
ma(t)

= max
p∈[0,1] F(p),
(1)
where F(p) = max
t
ma(t), represents the malware’s objective function, which is
the peak of the proportion of active agents for a given p.
A tradeoﬀarises with p as follows: when p approaches 0, only a small number
of new agents become active, while when p approaches 1, only a few passive
agents emerge, thereby restricting the infection process.
Mathematical Analysis of the Model
We assume that the rate of susceptible computers who become infected at the
initial time is greater than the rate of additional passive computers at the initial
time. i.e.:
−λmp(0) + λ(1 −p)ms(0) −γ1 < 0.
(2)
Lemma 1. The function f : [0, +∞[→R such that f(t) = ms(t)mp(t) is decreas-
ing, i.e., f ′(t) < 0.
Proof. There are two cases to consider: the case where the mp function is increas-
ing and the case where it is decreasing.
1. If mp is decreasing: f(t) = ms(t)mp(t)
⇐⇒
f ′(t) =
˙ms(t)mp(t) +
ms(t) ˙mp(t) < 0.
2. If mp is increasing:
˙mp > 0, that is, ms(t) >
γ1
λ(1 −p). Furthermore,
f(t) = ms(t)mp(t) ⇐⇒f ′(t) = ms(t)mp(t)(−λmp(t) + λ(1 −p)ms(t) −γ1).
Let’s consider g(t) = −λmp(t) + λ(1 −p)ms(t) −γ1, therefore g′(t) =
λmp(t)(−2λ(1 −p)ms(t) + γ1). Moreover, ms(t) >
γ1
λ(1 −p)
=⇒ms(t) >
γ1
2λ(1 −p), i.e., −2λ(1 −p)ms(t) + γ1 < 0. Therefore, g′(t) < 0, which means
that g(t) < g(0) and then f ′(t) = ms(t)mp(t)g(t) < ms(t)mp(t)g(0). Accord-
ing to the hypothesis at Eq. (2), (–λmp(0) + λ(1 −p)ms(0) −γ1) < 0 i.e.,
ms(t)mp(t)(−λmp(0) + λ(1 −p)ms(0) −γ1) < 0. Thus, f ′(t) < 0.
In both cases, we obtain the following result f ′(t) < 0.
■

Active Nodes Maximization in a Virus Spread Model
The previous lemma allows us to prove the following proposition, which states
that the malware’s objective function is well-deﬁned, which assumes that the
maximum of the ma function exists.
Proposition 1. The malware’s objective function:
F(p) =
⎧
⎨
⎩
ma(0) if λpms(0)mp(0) −γ0ma(0) < 0
λp
γ0
ms(tp)mp(tp) otherwise;
(3)
where, tp ∈]0, +∞[ is well-deﬁned, and the maximum is unique.
Proof. – If λpms(0)mp(0) −γ0ma(0) < 0, then
˙ma is decreasing, that is,
ma(t) ⩽ma(0), ∀t ∈[0, ∞[.
– Let’s suppose that λpms(0)mp(0) −γ0ma(0) ⩾0, then ∃tp ∈[0, ∞[ such
that
˙ma(tp) = 0, since
lim
t→+∞ma(t) = 0. Moreover,
˙ma(tp) = 0
⇐⇒
λp
γ0
ms(tp)mp(tp) = ma(tp). F(p) is well-deﬁned.
Furthermore, suppose there are t1, t2 ∈[0, ∞[, t1 ̸= t2 such that F(p) =
ma(t1) = ma(t2). In this case, ˙ma(t1) =
˙ma(t2) = 0. Therefore, ma(t1) =
λpf(t1)
γ0
= ma(t2) = λpf(t2)
γ0
⇐⇒
f(t1) = f(t2), with f(t) = ms(t)mp(t).
However, as shown in the lemma (1), f is a decreasing function, that is, t1 <
t2 =⇒f(t1) > f(t2). Thus, F(p) is unique ∀p ∈[0, 1].
The proposition (1) above shows that for a ﬁxed p ∈[0, 1] there is a unique
maximum on t ∈[0, ∞[. We now need to show that max
p∈[0,1] F(p) exists, since
the aim is to determine the probability p ∈[0, 1] for which the function F(p) is
maximal. To achieve this, we ﬁrst need to show that the function F is continuous
on [0, 1].
Proposition 2. The function F as previously deﬁned is continuous on the inter-
val [0, 1].
Proof. Our diﬀerential system can be rewritten as ˙M(t) = U(M, p), where M =
⎡
⎢⎢⎣
ms
ma
mp
mr
⎤
⎥⎥⎦and U(M, p) =
⎡
⎢⎢⎣
−λmsmp
λpmsms −γ0ma
λ(1 −p)msmp −γ1mp
γ0mp + γ1ma
⎤
⎥⎥⎦
According to the Cauchy-Lipschitz theorem, given that the diﬀerential sys-
tem is autonomous (i.e., independent of t) and the function U is continuous with
respect to the state variable M and the parameter p, the system, with known
initial conditions, admits a unique solution for all p ∈[0, 1].
Furthermore, as stated in Pierron Théo’s book on Diﬀerential Equations1, to
demonstrate that the solution of the diﬀerential system is continuous with
1 https://perso.eleves.ens-rennes.fr/~tpier758/cours/edo.pdf.

A. Ngoufo et al.
respect to p, it suﬃces to show that U is continuous and globally Lipschitz
with respect to the state variable and the parameter p.
Since U is, at least C1 with respect to p on the compact interval [0, 1], U
is globally Lipschitz. Thus, the solution is continuous with respect to p, and
consequently, the mapping p 	→ma(t) is continuous for all t ∈J, where J is any
segment of [0, +∞[.
■
Lemma 2. It is certainly not in the malware designer’s interest to choose p = 0,
that is, F ′(0) = 0.
Proof. Let’s consider p = 0, so
˙ma(t) = λpms(t)mp(t) −γ0ma(t) becomes
˙ma(t) = −γ0ma(t) and then ma decreases and F(0) = ma(0). Let now ϵ > 0
very small, such that λϵms(0)mp(0) −γ0ma(0) < 0, therefore, F(ϵ) = ma(0)
(according to the deﬁnition of F(p)).
Moreover, F ′(0) = lim
ϵ→0
F(ϵ) −F(0)
ϵ
= ma(0) −ma(0)
ϵ
= 0
■
The proposition (3) below establishes the existence of a solution to the prob-
lem:
 ˙M(t) = U(M, p)
p∗∈arg max(F(p)), F as deﬁned by(1)
(4)
Proposition 3. 1. The problem (4) has at least one solution;
2. If λpms(0)mp(0) −γ0ma(0) ⩽0 for all p ∈[0, 1], then the problem has an
inﬁnite number of solutions.
3. Otherwise (∃p ∈[0, 1], λpms(0)mp(0) −γ0ma(0) > 0), the solution is non-
trivial for certain conditions on initial values and parameters that we will
determine, i.e., p∗∈(0, 1). In other words i.e. it is in the cyber attacker’s
interest to invest in passive and active nodes simultaneously.
Proof. 1. Since F is a continuous function on a compact set, it admits a maxi-
mum.
2. Let us suppose that λpms(0)mp(0)−γ0ma(0) ⩽0 for all p ∈[0, 1]. According
to the deﬁnition of F, we have F(p) = ma(0) for all p ∈[0, 1].
3. Let’s consider the following system:
(S) :

˙ms(t) = −λmp(t)ms(t)
˙mp(t) = λ(1 −p)mp(t)ms(t) −γ1mp(t)
We aim to determine the solutions very close to ms and mp; dividing the
second equation of (S) by the ﬁrst one, we obtain: dmp
dms
= −(1 −p) +
γ1
λms
,
i.e.,
mp(t) = −(1 −p)ms(t) + γ1
λ ln(ms(t)) + mp(0) + (1 −p)ms(0) −γ1
λ ln(ms(0)).

Active Nodes Maximization in a Virus Spread Model
We substitute this back to obtain a new diﬀerential equation depending only
on ms:
˙ms(t) = λ(1 −p)m2
s(t) −γ1ms(t) ln(ms(t)) −λ

mp(0) + (1 −p)ms(0) −γ1
λ ln(ms(0))

.
(5)
Using a ﬁrst-order approximation of the function t →ln(ms(t)): ln(ms(t)) ≈
ln(ms(0)) −λmp(0)t. Substituting this into (5), we get a new diﬀerential equa-
tion for ˜ms, which is an approximation of ms:
x′(t) = Ax2(t) −(B −Ct)x(t)
(6)
where x(t) = ˜ms(t), A = λ(1 −p), C = γ1λmp(0), and B = λmp(0) + Ams(0).
The solution (6) is given by:
˜ms(t) = exp(−Bt + Ct2/2)
ms(0) + K(t)
,
with
K(t) =
 t
0
−A exp(−Bu + Cu2/2)du
(7)
Now substituting ˜ms(t) back into the second equation of (S), we get an
approximate value ˜mp of mp:
˜mp(t) = pmp(0)
ms(0)
exp(−γ1t)
ms(0) + K(t).
(8)
The expression for ˜ma is therefore given by:
˜ma(t) = exp(−γ0t)
⎛
⎜
⎜
⎝ma(0) + λ
 t
0
p
ms(0)mp(0) exp(γ0u −γ1u) exp(−Bu + C u2
2 )
(1 + ms(0)K(u))2
du
⎞
⎟
⎟
⎠
(9)
We want to show that F ′(1) < 0. We know that for all p ∈[0, 1], there
exists tp ∈[0, +∞[ such that F(p) = ma(tp, p). Therefore, it is suﬃcient
to show that ˜ma(t1−ϵ, 1 −ϵ) > ˜ma(t1, 1). We will ﬁrst ﬁx the time in the
expression of ˜ma and compare ˜ma as a function of the probability p. We will
gradually eliminate the terms that do not inﬂuence our comparison and study
the remaining function. At a result, we need to show that the function
p −→
 t
0
pms(0)mp(0) exp(−Bu + Cu2/2)
(1 + ms(0)K(u))2
du
is decreasing at 1.
Note that, if we consider three positive functions f, g, and h
 t
0
f(u)du <
 t
0
g(u) du =⇒
 t
0
f(u)h(u)du <
 t
0
g(u)h(u) du.
Let
g(t, p) =
 t
0
exp(−Bu+Cu2/2)
and
G(t, p) =
 t
0
p ms(0)mp(0) exp(−Bu + Cu2/2)
(1 + ms(0)K(u))
du.

A. Ngoufo et al.
After integration, G(t, p) =
pg(t, p)
1 −λ(1 −p)ms(0)g(t, p), and then, ∂G
∂p (t, 1) =
g(t, 1)
+
∂g
∂p(t, 1)
−
λms(0)g2(t, 1);
since
∂G
∂p (t, p)
=
g(t, p)(1 −λ(1 −p)ms(0)g(t, p)) + p∂g
∂p(t, p) −λpms(0)g2(t, p)
(1 −λ(1 −p)ms(0)g(t, p))2
.
We notice that ∂G
∂p (0, 1) = 0, therefore, we need to show that the function
t −→h(t) = g(t, 1) + ∂g
∂p(t, 1) −λms(0)g2(t, 1) is decreasing for slightly larger
values of t.
h′(t) = g′(t)[1 −2λms(0)g(t, 1) + λms(0)t], and the function q(t) = 1 −
2λms(0)g(t, 1) + λms(0)t is decreasing if its derivative is negative.
q′(t) = −2λg′(t, 1) + λms(0) = −2λms(0) exp(−Bt + C t2
2 ) + λms(0) < 0
⇐⇒exp(−Bt + C t2
2 ) > 1
2 ⇐⇒λmp(0) −2γ1 ln(2) < 0
The function h′ is decreasing, but h′(0) > 0 and
lim
t→+∞h′(t) = −∞. By the
intermediate value theorem, ∃!t0 ∈R∗
+ such that h′(t0) = 0. We have to show
that there exists t1 ∈R∗
+ such that t0 ⩽t1 < tmax, the point that maximizes
ma (note that, t1 < tmax
⇐⇒
˙˜ma(t1) > 0, since ˙˜ma(tmax) = 0 and ˙˜ma is
an increasing function). This implies that at the moment when ma reaches
its maximum, the function h′ is negative, hence the function h is decreasing.
Consequently, the function G decreases towards 1, and thus F ′(1) < 0.
˙˜
ma(t) = λ ˜
ms(t) ˜
mp(t) −γ0 ˜
ma(t) = λmp(0)ms(0) exp(−γ1t) exp(−Bt + C
t2
) −γ0 exp(−γ0t)(ma(0)
+ λ
 t
0
ms(0)mp(0) exp(γ0u −γ1u) exp(−Bu + C
u2
) du)
By using the above condition exp(−Bt + C t2
2 ) > 1
2 and the inequality,
 t
0
ms(0)mp(0) exp(γ0u −γ1u) exp(−Bu + C u2
2 ) du ≤exp(γ0t −γ1t)
 t
0
exp(−Bu + C u2
2 ) du
we obtain,
˙˜
ma(t) > mp(0)ms(0)

λ exp

−
γ1t

−γ0 exp(−γ0t)ma(0) −γ0 exp(−γ1t)
 t
0
exp

−Bu +
Cu2

du

We observe from the expressions of h′ and ˙˜ma that it is suﬃcient to ﬁnd t1
that satisﬁes the following inequalities:
λ
 t1
0
exp(−Bu + C u2
2 ) du <
λ
2γ0 −ma(0)
(10)
1 −2λms(0)
 t1
0
exp(−Bu + C u2
2 )du + λms(0)t ⩽0
(11)

Active Nodes Maximization in a Virus Spread Model
From (10), such a t1 is then such that: 1 + λms(0)t1
2λms(0)
⩽
2γ0 −ma(0)
λ
⇐⇒t1 ⩽
−1
λms(0) + 1
γ0 −2ms(0)
λ
since from (11), 1 + λms(0)t1
2λms(0)
⩽
 t1
0 exp(−Bu + C u2
2 ) du.
As stated before, we know that h′ is ﬁrst positive before becoming negative,
so it suﬃces to ﬁnd that t1 that satisﬁes (10) and makes h′ negative. Then, by
the intermediate value theorem, we will know that t0 | h′(t0) = 0 is located
before tmax | ˙˜ma(tmax) = 0.
Note that,
 t
0 exp(−Bt + C u2
2 ) du ⩾exp(−B2
2C )t, therefore,
1 −2λms(0)
 t
0
exp(−Bu + C u2
2 )du + λms(0)t ⩽1 −2λms(0) exp( −B2
2C )t + λms(0)t ⩽0
for
t ⩾
1 −2 exp(−B2
2C )λms(0)
. A suﬃcient condition to ﬁnd t1 ∈R∗
+ such
that t0 ⩽t1 < tmax is :
1 −2 exp(−B2
2C )λms(0)
⩽
−1
λms(0) + 1
γ0
−2ms(0)
λ
.
Therefore, with the above suﬃcient, but not necessary conditions satisﬁed,
the solution to the control problem is non-trivial, i.e.,
1 −2 exp( −B2
2C )λms(0)
≤
−1
λms(0) + 1
γ0
−2ms(0)
λ
and λmp(0) −2γ1 ln(2) < 0 =⇒F ′(1) < 0.
(12)
■
Numerical Resolution of the Control Problem by Two
Timescale Convergence and the SP SA Method
4.1
Overview
We introduce the function N deﬁned by the following diﬀerential equation:
˙N(t) = max(0, ˙ma(t)). Since ma has a maximum for all p, then N reaches
this same maximum and becomes constant, i.e.,
lim
t→+∞N(t) = max
t>0 ma(t). The
idea here is to build an algorithm where we use two-speed scales. We use the two
timescale method, consisting of a fast dynamic to calculate the epidemic peak
and a slow dynamic to compute the probability that maximizes the epidemic
peak [3]. The optimal control problem thus becomes:
 ˙M(t) = f(t, p)
˙p = ∇F(p); F defined by (1)

A. Ngoufo et al.
4.2
Algorithm
We use the variable-step gradient descent method for the dynamics of the dif-
ferential system and the SPSA (simultaneous perturbation stochastic approxi-
mation) method [2] for updating the probability p. We then have the following
numerical scheme:
⎧
⎪
⎨
⎪
⎩
M(n + 1) = M(n) + an ˙M(n)
N(n + 1) = N(n) + anmax(0, ˙
ma(n))
p(n + 1) = p(n) + bng(p(n))
where g is an approximation of the objective function F. We thus have:
g(p(n)) = F(p(n) + cnΔn) −F(p(n) −cnΔn)
2cnΔn
The sequences an, bn et cn are chosen so that,

n
an =

n
bn = ∞,

n
(a2
n +
b2
n) < ∞, bn
an
→0. The last condition characterizes the faster convergence of the
system’s dynamics compared to that of p, Δn is a random sequence.
4.3
Numerical Evaluation
For numerical evaluation, we consider an = a/n, bn = b/(1+n log(n)), cn = c/n7
and Δn a sequence of random variables of the normal distribution. We make
simulations with initial values ma(0) = 0.1, mp(0) = 0.05 and ms(0) = 0.85.
Another parameters set are λ = 0.1, γ0 = 0.01, γ1 = 0.005.
Fig. 1. Optimal probability computation for two initial distinct values of p0.

Active Nodes Maximization in a Virus Spread Model
Fig. 2. Non-trivial optimum computation (2a) & ma functions’ comparison (2b).
The objectives of these experiments are threefold: (1a) and (1b) to establish
the convergence of the applied method towards the optimal solution within our
model (the optimal line is obtained by plotting the straight line passing through
the last point of convergence of the algorithm), (2a) to demonstrate the existence
of a non-trivial optimal solution under the conditions speciﬁed in (12), and (2b)
to assess the approximation error of the function ma graphically.
Conclusion
In this study, we explored the dynamics of malware propagation within a net-
work of digital nodes using the susceptible-infected-resistant (SI2R) compart-
mental model, focusing on maximizing the number of active nodes—those whose
resources are exploited by the malware—by strategically determining the optimal
percentage of passive nodes of the infection process. Our analysis revealed that
the variation in the number of active nodes is intrinsically linked to the number
of passive nodes, demonstrating how malware designers can maximize resource
exploitation. Indeed, as illustrated in Figure (2a), when the initial number of
passive nodes is low, the malware designer tends to invest heavily to increase
the number of passive nodes, favoring lower values of p. Our ﬁndings contribute
to the ﬁeld by oﬀering new perspectives on malware strategies and informing the
development of more eﬀective countermeasures. However, our work has certain
limitations, particularly that the value of p is ﬁxed throughout the process and
that the number of new active nodes during the process does not depend on the
number of previous ones. Future research should apply the SI2R model to real-
world data for validation, expand the model to include additional factors such as
varying infection rates and network topologies and develop automated systems
for dynamic defense strategies based on real-time data and predicted malware

A. Ngoufo et al.
behavior. Ultimately, our study highlights the importance of strategic analysis
in understanding and combating malware, advancing theoretical knowledge, and
practical cybersecurity strategies to protect digital networks.
Acknowledgments. The research was sponsored by the U.S. Army Research Oﬃce
and was accomplished under Cooperative Agreement Numbers W911NF-19-2-0150,
W911NF-22-2-0175, and Grant Number W911NF-21-1-0326. The views and conclu-
sions contained in this document are those of the authors and should not be inter-
preted as representing the oﬃcial policies, either expressed or implied, of the U.S.
Army Research Laboratory or the U.S. Government. The U.S. Government is autho-
rized to reproduce and distribute reprints for Government purposes notwithstanding
any copyright notation herein.
A
Appendix
Lemma 3. 1. Let us consider the following diﬀerential equation:
x′(t) = Ax2(t) −(B −Ct)x(t)
(13)
With the initial condition
x(0) = ms(0)
So the solution of (13) is given by (14)
x = exp(−Bt + Ct2/2)
ms(0) + K(t)
,
with
K(t) =
 t
0
−A exp(−Bu+Cu2/2)du (14)
2. Let us suppose that:
˙˜mp(t) = λ(1 −p) ˜mp(t)x(t) −γ1 ˜mp(t)
with the initial condition ˜m(0) = mp(0) Then
˜mp(t) = pmp(0)
ms(0)
exp(−γ1t)
ms(0) + K(t).
Proof. 1. This is a Bernoulli equation, and we will solve it by a change of vari-
able.
Let Z = 1/X
x′(t) = Ax2(t) −(B −Ct)x(t)
⇐⇒
−Z′(t)
Z2(t) =
A
Z2(t) −(B −Ct) 1
Z
The equation in Z is then written as:
Z′(t) = −A + (B −Ct)Z

Active Nodes Maximization in a Virus Spread Model
The solution of the homogeneous equation is given by:
Z(t) = K exp(Bt −Ct2
2 )
K ∈R
To determine a particular solution of the equation in Z, we vary the constant
K and look for the particular solution in the form Z(t) = K(t) exp(Bt−Ct2
2 )
and we have:
Z′(t) + K′(t) exp(−Bt + Ct2
2 ) = −A + (B −Ct)Z
Thus,
K′(t) = −A exp(Bt−Ct2
2 ))
⇐⇒
K(t) =
 t
0
−A exp(−Bu+Cu2
2 )du+C1
A particular solution of the equation in Z is:
Z(t) = exp(Bt −Ct2
2 )
 t
0
−A exp(−Bu + Cu2
2 )du
The general solution for Z is then given by:
Z(t) = exp(Bt −Ct2
2 )(K +
 t
0
−A exp(−Bu + Cu2
2 )du)
The solution of (13) is given by:
x(t) =
exp(−Bt + Ct2
2 )
K +
 t
0 −A exp(−Bu + Cu2
2 )du
Using the initial conditions, we obtain:
x = exp(−Bt + Ct2/2)
ms(0) + K(t)
,
with
K(t) =
 t
0
−A exp(−Bu + Cu2
2 )du
2. We have
˙˜
mp(t) = A ˜
mp(t)x(t) −γ1 ˜
mp
⇐⇒
˙˜
mp(t)
˜
mp
= Ax −γ1
⇐⇒
˙˜
mp(t)
˜
mp
=
exp(−Bt + Ct2/2)
ms(0)
+ K(t)
−γ1
=⇒
ln( ˜
mp(t)) = −ln(
ms(0)
+ K(t)) −γ1t =⇒
˜
mp(t) = k2
exp(−γ1t)
ms(0) + K(t)
k2 ∈R
By using the initial condition, we then obtain:
˜mp(t) = mp(0)
ms(0)
exp(−γ1t)
ms(0) + K(t).

A. Ngoufo et al.
References
1. Bailey, N.T.: The mathematical theory of infectious diseases and its applications.
No. 2nd ediition (1975)
2. Bhatnagar, S., Prasad, H., Prashanth, L., Bhatnagar, S., Prasad, H., Prashanth,
L.: Stochastic approximation algorithms. Stochastic Recursive Algorithms for Opti-
mization: Simultaneous Perturbation Methods, pp. 17–28 (2013)
3. Borkar, V.: Multiple Timescales, pp. 117–138, February 2024. https://doi.org/10.
1007/978-981-99-8277-6_8
4. Brauer, F., Van den Driessche, P., Wu, J., Allen, L.J.: Mathematical epidemiology,
vol. 1945. Springer (2008)
5. Kermack, W.O., McKendrick, A.G.: A contribution to the mathematical theory
of epidemics. Proc. R. Soc. Lond. Ser. A Contain. Pap. Math. Phys. Character
115(772), 700–721 (1927)
6. Li, M.Y., Muldowney, J.S.: Global stability for the seir model in epidemiology.
Math. Biosci. 125(2), 155–164 (1995)
7. Pastor-Satorras, R., Vespignani, A.: Epidemic spreading in scale-free networks.
Phys. Rev. Lett. 86(14), 3200 (2001)
8. Roy, S., Xue, M., Das, S.K.: Security and discoverability of spread dynamics in
cyber-physical networks. IEEE Trans. Parallel Distrib. Syst. 23(9), 1694–1707
(2012)
9. Singh, S., Sharma, P.K., Moon, S.Y., Moon, D., Park, J.H.: A comprehensive study
on apt attacks and countermeasures for future networks and communications: chal-
lenges and solutions. J. Supercomput. 75, 4543–4574 (2019)
10. Winkler, I., Gomes, A.T.: Advanced persistent security: a cyberwarfare approach
to implementing adaptive enterprise protection, detection, and reaction strategies.
Syngress (2016)

Pricing and Economic Models

Impact of Regulation and the Digital
Markets Act on Competing Platforms
Patrick Maillé1
and Bruno Tuﬃn2(B)
1 IMT Atlantique, IRISA, 35000 Rennes, France
patrick.maille@imt.fr
2 Inria, Univ. Rennes, CNRS, IRISA, 35000 Rennes, France
bruno.tuffin@inria.fr
Abstract. The regulation of platforms has been a hot topic, particularly
in Europe with the Digital Markets Act (DMA) passed in 2022. The
purpose of this paper is to design a mathematical model representing
a game between long-term revenue-oriented platforms in competition
playing with their ranking strategy of items. The objective of platforms
is to apply a trade-oﬀbetween short-term revenue from each visit by
displaying most proﬁtable items and long-term number of visits due to
the satisfaction of users from the relevance of the displayed items. We
analyze the output of the game and the impact of proposed regulation
rules on platforms and users.
Introduction
Digital platforms have become a centerpiece of modern society, reshaping the
way we live, work, and interact. By digital platforms, we typically mean and
target here social media networks, e-commerce websites, and search engines. On
the positive side, those platforms have democratized access to information and
resources, empowering users to create, share, and participate in a global digital
ecosystem. But the way they display items inﬂuences business, information and
culture, among other things: an e-commerce web site incentivizes users to buy
the ﬁrst presented items, at the expense of others; similarly search engines guide
people toward some content [6,7].
For that reason, the rise of digital platforms has raised several concerns about
data privacy, misinformation and market concentration, leading to questions
from governments and regulatory bodies about the impact and possible biases
of those key actors. For example, the ranking methods applied by search engines
have been questioned by the US Senate [9], the Federal Trade Commission [1], as
well as the European Commission1. Recently, the European Commission has put
under scrutiny a few big digital platforms labeled as “gatekeepers” and having
an impact on the European Union’s digital economy. To address the issue, the
1 https://digital-strategy.ec.europa.eu/en/news/commission-sends-requests-
information-17-very-large-online-platforms-and-search-engines-under.
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 73–82, 2025.
https://doi.org/10.1007/978-3-031-78600-6_7

P. Maillé and B. Tuﬃn
Digital Markets Act (DMA) [2] was passed in 2022 with the objective of ensuring
fair competition, stimulating innovation, and strengthening consumer protection
in digital markets. The principle is to deal with the dominance of (mostly Amer-
ican) large tech companies and foster a more competitive and diverse digital
ecosystem. Among obligations for (only) “big” platforms—where the notion of
big is deﬁned using thresholds on size and market share—are the obligation to
provide interoperability and data portability, to grant fair access to data for com-
peting businesses, and the interdiction of self-preferencing practices that could
harm competition. Any non-compliance could lead to penalties reaching up to
10% of the company’s global turnover.
The motivation for this paper regards the impact of regulation, particularly
the DMA, on competing platforms, and the potential unintended consequences.
Concretely, we aim at comparing the output from scenarios involving two com-
peting platforms: one of free competition with no regulation or constraint, and
the case where a platform (the “big” one) has to rank items neutrally (i.e., with-
out taking into account any economic consideration). We will then see whether
such an asymmetric regulation, which we label as the DMA scenario, is beneﬁ-
cial. We will also compare with a (third) fully-neutral case at almost no cost. It
is to our knowledge the ﬁrst contribution comparing such scenarios.
In order to model the behavior of strategic platforms, we extend the model
in [4] where the optimal ranking strategy of a single platform is derived, tak-
ing care of the tradeoﬀbetween long-term and short-term revenues. Long-term
revenues mean proposing the most relevant items, leading to users coming back
and therefore more requests; it is considered a neutral behavior, that is, what is
expected from the platform. Short-term revenues are based on presenting ﬁrst
items yielding the largest one-shot gains for the platform, not necessarily the
most relevant for users; it can be considered a non-neutral behavior. To analyze
the eﬀect of DMA, the extension of the model in [4] consists in generalizing the
work to two platforms in competition . This will allow us to see the impact on the
two platforms of DMA compliance with respect to non-neutral and fully-neutral
scenarios.
The remaining of the paper is organized as follows. Section 2 presents the
baseline model and main results taken from [4] describing the optimal strategy
for a (single) revenue-oriented platform. Section 3 then describes how the model
can be extended to two platforms in competition and how the problem can
be solved using the framework of non-cooperative game theory [8]. Section 4
analyzes the three following regulation scenarios: a “free” market where platforms
can arbitrate their revenue tradeoﬀwith no constraint, the DMA where a large
platform is regulated but not a small one, and the fully-regulated case where
platforms can only rank according to relevance. Section 5 numerically compares
the three scenarios for a set of parameters, computing performance indicators
for the outcomes regarding users and both platforms. Finally Sect. 6 concludes
and gives directions for future research.

Impact of Regulation and the Digital Markets Act on Competing Platforms
Model and Results for a Single Platform
We recall the model in [4] that we will extend to multiple platforms in the next
sections. Consider a platform, for example a search engine or a marketplace. We
model the output of a (random) request as a random vector
Y = (M, R1, G1, . . . , RM, GM)
where M is the number of relevant items (upper-bounded by m0) for this query,
Ri represents the relevance of the i-th item (that is, how much it aligns with a
user’s query and intent; upper bounded by 1), and Gi is the expected gain the
platform will make if item i if clicked (upper bounded by K).
We assume the vector Y has a ﬁxed probability distribution (discrete or
continuous) over a compact (closed and bounded) subspace Ω ⊆∪m0
m=0({m} ×
([0, 1] × [0, K])m). For a given realization y = (m, r1, g1, . . . , rm, gm), the goal of
the platform is to select a ranking of the m considered items, that is a permu-
tation π = (π(1), . . . , π(m)) of {1, . . . , m}, such that item i will be displayed in
position π(i). The question is on the selection of the (deterministic) stationary
ranking policy μ as a function of the possible realizations y, π = μ(y), that is,
to select for each possible realization y the most “appropriate” permutation.
A parameter that has an important role for the ranking is the so-called click-
through-rate (CTR), which represents the probability ci,j(y) that an item i at a
position j is clicked, for query y. While its value may be complex in terms of y,
it is often assumed that the click-through rate of item i at position j is separable
into a position eﬀect θj and a relevance eﬀect ψi(y), such that ci,j(y) = θjψi(y)
[5]. (Without loss of generality we order the positions so that the higher the
position in the ranking, the larger the position eﬀect: θ1 ≥θ2 ≥· · · ≥θm.)
One can interpret the position eﬀect θj as the probability that an item i at
position i is seen, while the relevance eﬀect ψi(y) is the (position-independent)
probability that the item is clicked when seen. A less general but also rather
understandable expression is to express the relevance eﬀect as depending only
on item i’s relevance: ψi(y) = ¯ψi(ri).
From the speciﬁed model we can compute the average gain g and average
relevance r for a given stationary ranking policy μ, as
g := g(μ) = EY
 M

i=1
θμ(Y )(i)ψi(Y )Gi

(1)
r := r(μ) = EY
 M

i=1
θμ(Y )(i)ψi(Y )Ri

.
(2)
The platform wants to determine a stationary ranking policy μ maximizing
a function φ which depends on the average gain and average relevance:
max
μ
φ(g, r),
(3)
where φ is an increasing function of both its arguments g and r with bounded
second derivatives in the same arguments.

P. Maillé and B. Tuﬃn
While one can keep a general form for the function φ, a practical case is when
φ(g, r) = λ(r) · (g + β)
where λ(r) is the arrival rate of queries and β > 0 represents a(n average)
revenue per visit to the platform apart from the potential gains stemming from
ranking pages. Of course, λ is increasing in r: the more relevant you are, the
more visits you get in the long term. Typically, the overall revenue of a platform
is proportional to the rate of visits; the average direct gains then equal λ(r) · g.
There might also be a gain from each visit, whose average is denoted by β, leading
to an additional revenue βλ(r). The most relevant example is for a search engine
where β corresponds to gains from ads displayed when a search is launched; for
other marketplaces, β may also represent revenues from ads, or from other sales
derived from a customer having reached the site.
A platform has therefore to ﬁnd a ranking policy which is a trade-oﬀbetween
short-term revenue (based on the potential immediate gain from high-ranked
items) and long-term revenue (based on the satisfaction of users due to the
relevance of the ranking). This is what is analyzed in [4].
To simplify notations, deﬁne ˜Ri := ψi(Y )Ri and ˜Gi := ψi(Y )Gi the relevance
and gain of item i weighed by the relevance-eﬀect click probability (and deﬁne
similarly their realizations ˜ri and ˜gi). The following result then characterizes an
optimal ranking policy.
Proposition 1 (L’Ecuyer et al. [4]). Any optimal randomized policy must
rank the pages by decreasing order of their value of ˜ri + ρ˜gi (except possibly on a
subset of requests of probability 0), with the exception that the order at positions
j, j′ with the same position eﬀect θj = θj′ does not matter.
Such a policy is called a LO-ρ policy (Linear Ordering with weight ρ). That
result remarkably simpliﬁes the search for an optimal policy to just ﬁnding the
optimal parameter ρ∗, which can be done easily by simple optimization tech-
niques. To do so, the results derived in [4] when Y has a continuous distri-
bution are helpful. For the gradient ∇φ(g, r) = (φg(g, r), φr(g, r)) of φ, deﬁne
h(g, r) := φg(g, r)/φr(g, r). Then the following result provides a method to com-
pute an optimal ranking policy.
Proposition 2. If the tuple (r∗, g∗) corresponds to the relevance and gain for an
optimal LO-ρ policy, then the policy parameter satisﬁes ρ = ρ∗= h(g∗, r∗). As
(g∗, r∗) depends on ρ∗, one must have a ﬁxed point ρ∗= h(g(μ(ρ∗)), r(μ(ρ∗))).
If h is bounded over its domain of deﬁnition, the ﬁxed-point equation ρ =
˜h(ρ) (deﬁning the function in terms of ρ) has at least one solution in [0, ∞).
If furthermore ∂˜h
∂ρ(ρ) < 1 for all ρ > 0 (that is, ˜h is a contraction), then the
solution is unique.
Determining ρ∗can be done by Monte Carlo simulation, Robbins-Monro type
stochastic approximation, or successive iterations if ρ →˜h(ρ) is a contraction.

Impact of Regulation and the Digital Markets Act on Competing Platforms
Model of Platforms in Competition
3.1
Mathematical Formalization
We extend here the model to encompass the situation of two platforms, labeled
by 0 and 1, in competition. For each platform p ∈{0, 1}, we index by p the output
random vector of a query Y (p) as well as the number of relevant items M (p), and
the relevance R(p)
i
and expected gain G(p)
i
of each of those items. Without loss
of generality, those values are still upper-bounded by m0, 1 and K, respectively.
For each p ∈{0, 1} the vector Y (p) has a ﬁxed probability distribution (discrete
or continuous) over a compact subspace Ω ⊆∪m0
m=0({m} × ([0, 1] × [0, K])m).
The CTR c(p)
i,j (y(p)) , quantifying the probability that an item i at a position
j is clicked, for platform p and query y(p) is again assumed separable: c(p)
i,j (y(p)) =
θ(p)
j ψ(p)
i
(y(p)), with position and relevance eﬀects being made dependent on p.
For the average gain g(p) and relevance r(p) at Platform p, the goal is to
determine a ranking policy μ(p) solution of
max
μ(p) φ(p)(g(p), r(p), r(p′))
(4)
where now the objective function φ(p) depends not only on the parameters of
p but on the relevance of the competing platform p′ = 1 −p. Again, φ(p) is
increasing in both g(p) and r(p) with bounded second derivatives, and is here a
decreasing function of r(p′) to depict that a relevant competitor means less visits
to the considered platform. We will use revenue expressions of the form
φ(p)(g(p), r(p), r(p′)) = λ(p)(r(p), r(p′)) · (g(p) + β(p))
(5)
where λ(p)(r(p), r(p′)) is the arrival rate of queries to platform p and β(p) > 0
represents a(n average) revenue per visit to the platform. The function λ(p) is
increasing in r(p) and decreasing in r(p′).
For each visit/request, Platform p must select a ranking (permutation) of the
m(p) considered items, π(p) = (π(p)(1), . . . , π(p)(m(p))) such that item i will be
displayed in position π(p)(i). Following the results in [4], considering the policy
of p′ ﬁxed, the optimal permutation is still to rank items in a decreasing order
of ˜R(p)
i
+ ρ ˜G(p)
i
(with again ˜R(p)
i
= ψi(p)(Y (p))R(p)
i
and ˜G(p)
i
= ψi(p)(Y (p))G(p)
i
).
We consider again h(p)(g, r, r′) := φ(p)
g (g, r, r′)/φ(p)
r (g, r, r′), with φ(p)
g
(resp.
φ(p)
r ) the partial derivative of φ(p) with respect to g (resp. r). Proposition 2 can
be reformulated as:
Proposition 3. For a ﬁxed r′, if the tuple (r(p)
∗, g(p)
∗) corresponds to the rele-
vance and gain for an optimal policy, then it can be obtained from an LO-ρ(p)
policy with ρ(p) = ρ(p)
∗
= h(p)(g(p)
∗, r(p)
∗, r′). As (g(p)
∗, r(p)
∗) depends on ρ(p)
∗, one
must have a ﬁxed point ρ(p)
∗
= h(p)(g(p)(μ(p)(ρ(p)
∗)), r(p)(μ(p)(ρ(p)
∗)), r′).

P. Maillé and B. Tuﬃn
3.2
A Game Between Platforms
In summary, the policy ranking choice of each platform p can be reduced to
the choice of a single parameter ρ(p), that can be obtained by solving a ﬁxed-
point equation involving the average relevance r′ of the competitor. Since that
relevance r′ depends on the parameter ρ(p′), platforms impact each other through
their ranking policies. The remainder of the paper analyzes that interaction using
the framework of Game Theory [8], under diﬀerent regulatory scenarios.
Analysis of Three Diﬀerent Regulation Scenarios
The aim of this section is to introduce and analyze three diﬀerent situations: i)
the case without regulation when platforms can (and will) play the game trying
to maximize their revenue; ii) the intermediate DMA situation when there is a
regulation imposed to the big platform, considering one has a larger market size;
iii) the fully-regulated case when platforms are ranking based on relevance only.
4.1
Game-Theoretic Analysis in the Case of Two Platforms
in Competition
We consider here the situation when no regulatory constraint is imposed on either
platform. From our competition model, the policy implemented by a platform is
impacting the revenue, hence the optimal policy, of the competitor. Typically, a
platform’s policy is inﬂuenced by the choice of the opponent through the latter’s
impact on market shares (through its relevance). We therefore end up with a non-
cooperative game where the utility of Platform p ∈{0, 1} is φ(p)(g(p), r(p), r(p′))
and its decision variable is the stationary ranking policy μ(p), and more speciﬁ-
cally (due to the mathematical analysis presented before) the ranking parameter
ρ(p) to apply to a LO-ρ(p) policy.
Subsection 3.1 deﬁnes the best-response of a platform p in response to a given
policy of the competitor p′: for a ﬁxed policy of the competing Platform p′, the
best response of Platform p is derived in Proposition 3.
Formally, the best response of Platform p in response to the strategy ρ(p′) of
Platform p′ is, from Proposition 1, among the LO-ρ policies:
BR(p)(ρ(p′)) = argmaxρφ(p)(g(p)(ρ), r(p)(ρ), r(p′)(ρ(p′))),
where we here explicitly express the dependence on ρ and ρ(p′) of g(p), r(p) and
r(p′) as computed in (1) and (2) for each platform.
The equilibrium concept in the competition between platforms is the so-called
Nash equilibrium, which is a proﬁle of policies (μ(0)
∗, μ(1)
∗), corresponding to a
pair (ρ(0)
∗, ρ(1)
∗) from which no platform has an interest to deviate unilaterally:
for each p ∈{0, 1}, ranking with ρ(p)
∗
is a best response of Platform p when
Platform p′ is ranking with LO-ρ(p′)
∗
.

Impact of Regulation and the Digital Markets Act on Competing Platforms
The game in its most general form is played with both platforms maximiz-
ing their utility φ(p)(g(p), r(p), r(p′)), but we more speciﬁcally consider the case
φ(p)(g(p), r(p), r(p′)) = λ(p)(r(p), r(p′)) · (g(p) + β(p)) of Eq. (5).
A typical expression for λ(p)(r(p), r(p′)), that we will use is
λ(p)(r(p), r(p′)) = A(p) · e−(r(p′))ℓ/r(p)
(6)
for some parameters A(p) > 0 and ℓ> 0; note that this expression veriﬁes the
assumptions on the query rates in terms of relevances of both platforms.
In our numerical experiments, we will also use the (arbitrary and) default
values A(0) = 10, A(1) = 1, ℓ= 2 and M (0) = M (1) = 20, such that with equal
relevance one platform (Platform 0) will have a much larger market share. The
CTR values θ(p)
i
are displayed in Table 1 and are the same for both platforms.
For simplicity, we also consider ψ(p)
i
= 1 for all i and p, i.e., the probability
that a page is visited only depends on its ranking (and not in particular on its
intrinsic relevance).
Table 1. CTR values used in the paper, taken from [3]
θ(p)
θ(p)
θ(p)
θ(p)
θ(p)
θ(p)
θ(p)
θ(p)
θ(p)
θ(p)
θ(p)
θ(p)
θ(p)
θ(p)
0.364 0.125 0.095 0.079 0.061 0.041 0.038 0.035 0.03 0.022 0020 0.015 0.013 0.011
The left panel of Fig. 1 displays the revenue of a platform p in terms of ρ to
illustrate that there is a maximum when the policy of the competitor is ﬁxed,
and the right panel shows the best responses of platforms with the previously
described set of parameters. The existence and unicity of a Nash equilibrium,
deﬁned as an intersection point of the two best-response curves, can be readily
checked from the unique intersection of best-response curves.
Fig. 1. (Left) Revenue of one platform when modifying its parameter ρ, when ρ(p′) =
0.5 and β(p) = 1; (Right) Best responses of platforms.

P. Maillé and B. Tuﬃn
For this competitive scenario without regulation, we illustrate in Fig. 2 the
impact on the revenues, market shares, and average relevance of each platform at
the Nash equilibrium of β(0), the average revenue per visit to Platform 0 outside
of ranked items. The inﬂuence of the parameters A(0) and A(1) could also have
been considered but is actually simple to analyze: as multiplicative constants in
platforms’ utilities, they have no impact on best-responses (and thus, equilibria),
hence one can compute the equilibrium for one value of those parameters and
deduce revenues (being proportional to A(p) for Platform p) and market shares
for any value.
Fig. 2. Free competition. Revenues (left), market shares (middle), and average rele-
vances (right) at equilibrium when β(0) varies.
From Fig. 2, β(0) has a limited impact on the revenue of the “small” platform
(Platform 1), but as could be expected a larger β(0) means more revenue for
Platform 0. Note also that the impact on market shares remains limited. As
regards relevance, the larger β(0), the higher the relevance for both platforms,
meaning that an increasing revenue generated from visits (due to advertisement
explicitly for example for a search engine) has a positive impact on the rele-
vance of the competitor, which may seem surprising. That phenomenon can be
explained as follows: a larger β(0) increases the importance of the number of vis-
its λ(0) in the utility (5) with respect to the term g(0), i.e., incentivizes Platform
0 to increase its relevance r(0) by decreasing its ranking parameter ρ(0). Then to
remain competitive, Platform 1 will also need to improve its relevance r(1), as is
also illustrated by best-response functions being non-decreasing (see Fig. 1).
4.2
A DMA-Inspired Regulation Scenario
This subsection focuses on the situation that could correspond to what the DMA
advocates, i.e., some regulation imposed on the biggest actors. For our context,
such a regulation would prohibit the largest platform from ranking results based
on something else than relevance. Hence, only the small platform, Platform 1,

Impact of Regulation and the Digital Markets Act on Competing Platforms
is allowed to play optimally. For Platform 0, ranking on relevance only implies
ρ(0)
∗
= 0. We then only need to compute the best-response ρ(1)
∗
of Platform 1 as
in [4]. With this setting, the parameter β(0) has no impact on platforms’ ranking
strategies (as ρ(0) = 0 and β(0) would aﬀect Platform 1 only through r(0)). As
neither do A(0) and A(1), we refer to the curves comparing the three scenarios,
in Sect. 5.
4.3
Fully Neutral
Finally, consider now the last case with full neutrality where platforms can only
rank based on relevance. In this case, ρ(0)
∗
= ρ(1)
∗
= 0: no game is played between
platforms. Results are studied in the next section, comparing all three situations.
Quantitative Comparisons of Regulation Scenarios
We now compare directly the output of the game for the three diﬀerent regulation
scenarios, for default values β(0) = 1, β(1) = 0.5, A(0) = 10 and A(1) = 1.
Figure 3 displays the revenues of the two platforms, their market shares, and
relevance, for the three considered regulation regimes.
Fig. 3. Comparing regulation policies when β(0) varies.
One can check that the regulation procedure does not change much the rev-
enue of the “small” platform whatever the value of β(0). There is a more per-
ceptible eﬀect on Platform 0, even if not that signiﬁcant in terms of relative
value.
In terms of market shares, the eﬀect of the policy is insigniﬁcant, which shows
that introducing regulation is useless if the goal is to reduce the importance of
big platforms.
Of course, in the neutral case, relevances are maximal since it is on what
the ranking is based. When β(0) gets larger (that is the proportion of gain of
Platform 0 due to advertisements increases), the less interesting is the application
of DMA on relevances with respect to competition.

P. Maillé and B. Tuﬃn
Conclusions
We have presented a model with two platforms in competition, extending the
monopoly situation of [4] where the optimal ranking strategy of items was com-
puted and analyzed. Thanks to that extension, we have been able to analyze the
impact of regulation procedures on platforms, in particular the Digital Markets
Act (DMA) recently put in place in Europe. According to our model, DMA has
a limited impact if talking about market shares or revenues of platforms.
References
1. Brill, J.: Statement of the Commission regarding Google’s search practices (2013).
http://www.ftc.gov/public-statements/2013/01/statement-commission-regarding-
googles-search-practices. Accessed Nov 2021
2. Commission, E.: Proposal for a regulation of the European parliament and of the
council on contestable and fair markets in the digital sector (digital markets act).
Technical report COM/2020/842 (2020). https://eur-lex.europa.eu/legal-content/
en/ALL/?uri=COM:2020:842:FIN
3. Dejarnette, R.: Click-through rate of top 10 search results in Google (2012). http://
www.internetmarketingninjas.com/blog/search-engine-optimization/click-through-
rate. Accessed 6 Aug 2017
4. L’Ecuyer, P., Maillé, P., Stier-Moses, N., Tuﬃn, B.: Revenue-maximizing rankings
for online platforms with quality-sensitive consumers. Oper. Res. 65(2), 408–423
(2017)
5. Maillé, P., Markakis, E., Naldi, M., Stamoulis, G., Tuﬃn, B.: An overview of research
on sponsored search auctions. Electron. Commer. Res. J. 12(3), 265–300 (2012)
6. Maillé, P., Tuﬃn, B.: Telecommunication Network Economics: From Theory to
Applications. Cambridge University Press, Cambridge (2014)
7. Maillé, P., Tuﬃn, B.: From Net Neutrality to ICT Neutrality. Springer, Cham (2022)
8. Osborne, M., Rubinstein, A.: A Course in Game Theory. MIT Press, Cambridge
(1994)
9. Rushe, D.: Eric Schmidt Google senate hearing – as it happened (2012). http://
www.guardian.co.uk/technology/blog/2011/sep/21/eric-schmidt-google-senate-
hearing. Accessed Nov 2021

Optimal Strategy Against Straightforward
Bidding in Clock Auctions
Jad Zeroual1,2(B), Marianne Akian2, Aurélien Bechler1, Matthieu Chardy1,
and Stéphane Gaubert2
1 Orange Labs, Châtillon, France
{aurelien.bechler,matthieu.chardy}@orange.com
2 INRIA and CMAP - Ecole Polytechnique, Palaiseau, France
jad.zeroual@polytechnique.edu, {marianne.akian,stephane.gaubert}@inria.fr
Abstract. We study a model of auction representative of the 5G auc-
tion in France. We determine the optimal strategy of a bidder, assuming
that the valuations of competitors are unknown to this bidder and that
competitors adopt the straightforward bidding strategy. Our model is
based on a Partially Observable Markov Decision Process (POMDP). We
show in particular that this special POMDP admits a concise statistics,
avoiding the solution of a dynamic programming equation in the space
of beliefs. We illustrate our results by numerical experiments, comparing
the value of the bidder with the value of a perfectly informed one.
Keywords: Auction · Bidding Strategy · POMDP · Optimal Control
Introduction
1.1
Context
The acquisition of frequency spectrum is a vital aspect for telecommunications
companies, as their core operations and success rely on these resources. Spec-
trum auctions have emerged as a prominent method for allocating these valuable
resources. They have undergone signiﬁcant evolution since their introduction,
with various auction models being employed over time [15]. Initially, sealed-
bid auctions were the preferred method for allocating spectrum rights. In this
model, bidders would submit their bids simultaneously without knowing the
bids of their competitors, the highest bidder winning the auction. However, this
model was found to have limitations. For example, in auctions with several fre-
quency bandwidths at stake (which is usually the case), bidders ended up paying
very diﬀerent amounts for the same goods (see page 8 of [13]). To address these
limitations, auction models have evolved to accommodate more complex scenar-
ios. One notable development was the introduction of combinatorial auctions,
which allow bidders to bid on packages of items rather than individual items [8].
This innovation signiﬁcantly improved the eﬃciency of spectrum allocation by
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 83–93, 2025.
https://doi.org/10.1007/978-3-031-78600-6_8

J. Zeroual et al.
enabling bidders to express their preferences for speciﬁc combinations of spec-
trum licenses. Among the various combinatorial auction formats, the combinato-
rial clock auction (CCA) has emerged as a popular choice for spectrum auctions.
The CCA combines the advantages of the clock auction, where prices increase
in rounds until demand equals supply, with the ﬂexibility of combinatorial bid-
ding. This format allows bidders to adjust their bids in response to changing
prices, while also considering complementarities and substitutabilities. When
the licenses present no complementarities, simpliﬁed CCA are implemented. In
those cases, bidders can only bid on the number of items they want to acquire
rather than the exact bundle of items. This type of auction was used as part
of the 5G Auctions in France in 2020 [1]. In this context, [14,15] provide an
introduction to auction theory. [12] further explores this issue, suggesting that
there may not be a universally truthful strategy for CCA.
The evolution of spectrum auctions has also been motivated by the matter
of optimality which can be deﬁned diﬀerently: it could be to maximize rev-
enue for the auctioneer [16], to maximize the fairness of the auction [11] or to
maximize one player’s proﬁt selﬁshly. One way it has been studied is through
prophet inequalities, which are inequalities between a strategic allocation and
the optimal allocation. Those inequalities are widely studied in the literature for
diﬀerent forms of bidder’s preference but almost always in a mechanism design
perspective, so as to maximize social welfare [9,10]. However, few have stud-
ied the question of optimality in a competitive auction where a player wants to
selﬁshly maximize its own utility. An example of such a study can be found in
[2] which proposes a Mixed Linear Integer Programming approach in a perfect
information setting. Nonetheless, the perfect information setting case presents
a diﬃculty: companies do not disclose their valuation to their competitors in
order to keep a competitive edge. As a matter of fact, such valuations can yield
strategic information on a company’s long-term projects. Thus, we can only have
some coarse estimates of the opponent valuations, noting that data are gener-
ally insuﬃcient to infer such estimations [1]. Hence, more practical approaches in
imperfect information setting are used such as Partially Observable Markov Deci-
sion Processes (POMDP). In [4], this framework is used for inferring the utility
of each player. Those models have been rare for modelling auction competition.
One of the possible reasons is that such model requires to make assumptions
on the behavior of competitors. A commonly studied behaviour is the Straight-
forward Bidding (SB) introduced by [13]. It is characterized by its focus on
immediate gains without considering future implications. As a matter of fact, [6]
models an ad auction among SB players and [17] uses it as a baseline strategy
to rate its agents. This strategy has been at the heart of studies mainly because,
despite its simplicity, it can be optimal in various situations. For instance, SB is
proven to be a weakly dominant strategy in auctions of 1 item [3]. Moreover, if
each bidder demands a single item and has no preference for any of them, SB is
a Bayes-Nash equilibrium [19]. What is more, this strategy yields to a situation
comparable to a competitive equilibrium when the goods are substitutes for all
bidders [13], which is the case for the 5G auction we study [1].

Optimal Strategy Against Straightforward Bidding in Clock Auctions
This paper aims to explore what could be the optimal response against SB
opponents for a bidder taking part in a simpliﬁed CCA such as the French
5G auction. Indeed, the SB strategy is interesting as it is a simple yet eﬃcient
strategy [5] for the auction at hand.
1.2
Contribution
We introduce a POMDP formulation for clock auctions from the point of view
of one player against a single straightforward agent. We justify this assumption
by proving that several straightforward agents can be aggregated in this type
of auction. Our main result (Theorem 1) provides a simpliﬁed expression of the
optimal policy under some assumptions on the distribution of the opponents’
preferences. It shows that the optimal solution of the POMDP coincides with a
strategy with concise expression avoiding the recourse to the belief state. Lastly,
we explore the results of the optimal strategy when the theorem holds and show
empirical evidence of its performance.
The paper is organized as follows: Sect. 2 presents the studied auction, the
SB strategy and how it is modelled in the rest of the paper. Section 3 provides
an optimal strategy to bidding in the modelled auction and introduces the main
theorem of simpliﬁcation. Lastly, Sect. 4 applies those results to simulated auc-
tions allowing one to compare the performance of this bidding strategy to the
one of a perfectly informed bidder.
5G Auction in France
2.1
Auction Mechanism
We model an auction amongst n players for m items inspired by the clock auction
held for the 5G auction in France in 2020 [1]. We denote each player by an integer
i ∈{1, . . . , n}. The auction begins at a certain price Pinit ⩾0. A price increment
ΔP > 0 between successive rounds is ﬁxed in advance. The auction mechanism
is the following:
1. The auction starts at price Pinit, we set P ←−Pinit
2. Each player i asks for a number of items di(P). This is her demand or bid.
All demands are simultaneous.
3. We check if the total demand does not exceed the number of items, i.e. if
n
i=1 di(P) ⩽m:
– If it is the case, the auction terminates and each player i receives di(P)
items and pays di(P) × P.
– Otherwise, the price is raised, P ←−P + ΔP, and the auction moves to
the next round (resuming from step 2).
Moreover, the auction presents an eligibility rule: it is mandatory for player i’s
demand to be non-increasing, i.e. ∀P ⩾0, di(P + ΔP) ⩽di(P).
This auction presents both public information and private information:

J. Zeroual et al.
– The demand of each player is revealed at the end of the round. At round t,
the past demands are public information, i.e. {di(Pinit + sΔP)|0 ⩽s < t, i =
1, . . . , n} is known by all players.
– Each player i has a budget Bi. This is a private information. Every player is
under a budget constraint: one’s payment cannot exceed one’s private budget.
We model the preferences of each player i by a private valuation function
vi : {0, . . . , m} −→R+. This valuation represents a maximal price that the player
i is willing to pay for k items. It is also private information. Furthermore, we
introduce the utility ui(k, P) = vi(k)−kP. Each agent i wants to maximize this
utility within the constraints of the auction. The following result is immediate.
Proposition 1. The eligibility rule and the budget constraint ensure the auction
terminates. The number of rounds R is bounded by:
R ⩽ΔP −1
max
1⩽i⩽n

max
1⩽k⩽m
vi(k)
k

−Pinit

.
Hence, during the auction, only a ﬁnite number of prices are observed, namely
P = {Pinit + kΔP|k ∈{0, . . . , R}}.
2.2
Straightforward Bidding
In our study, we suppose all but one player play according to a strategy called
Straightforward Bidding (SB) [13]. This strategy is a myopic strategy: it consists
in maximizing one’s utility at each round, as if the auction would terminate
immediately. The player handles possible tie breaks by taking the lowest number
of items that maximizes her utility. In our case in which there is a single type of
items, SB can be formulated as follows.
Deﬁnition 1. The player i is said to be playing SB if
∀P ⩾0, di(P) = min

arg max
0⩽k⩽m
{vi(k) −kP}

One can notice that in Deﬁnition 1, di only depends on the map P ⩾0 →
max0⩽k⩽m{vi(k) −kP}. This is precisely the Legendre-Fenchel transform of vi
(up to a change of sign), restricted to the non-negative real numbers. Hence,
di only depends on the non-decreasing concave hull of the private valuation vi.
This is formalized by the following result.
Proposition 2. Suppose player i plays according to SB. Let
˘vi = inf{f : {0, . . . , m} →R | f is non decreasing, concave and f ⩾vi}
and for all P ⩾0, deﬁne ˘di(P) = min

arg max0⩽k⩽m{˘vi(k) −kP}

. Then,
1. for all P ⩾0, we have di(P) = ˘di(P).

Optimal Strategy Against Straightforward Bidding in Clock Auctions
2. Let k0 ∈{1, . . . , m −1} such as there exists P ∈P satisfying di(P) = k0.
Then, vi is locally strictly concave in k0 (meaning vi(k0) −vi(k0 −1) >
vi(k0 + 1) −vi(k0)). Moreover, for such a k0, ˘vi(k0) = vi(k0).
Hereafter, we will model the valuation of an SB agent as a concave and
non-decreasing function.
Corollary 1. Suppose player i plays according to SB. If her valuation is normal-
ized, i.e. vi(0) = 0, we can model it by a valuation of the form vi(k) = k
j=1 zj
where z1 ⩾z2 ⩾. . . ⩾zm ⩾0 and in this case, di(P) = m
j=1 1(zj −P > 0).
For the sake of simplicity, we will consider a modiﬁed two-players auction. This
reduction is without loss of modelling power thanks to the following result.
Proposition 3. A clock auction between a player J1 and n −1 SB players can
be identiﬁed to a clock auction between J1 and 1 super SB-player from the point
of view of J1, in the sense that, for every strategy σ of J1 in either auction, there
exists a strategy σ′ in the other one such as her bid is the same at each round
and her ﬁnal utility is the same.
This result allows us to consider a super player e.g. an aggregated player of
demand function δ(p) = n−1
i=1 δi(p) where δi is the demand function of the SB
player i. It can be seen as a super SB-player by reordering the random variable
(Z(i)
j )1⩽j⩽m of every player i.
2.3
Scope of the Study
Our goal is to ﬁnd a strategy for the non-SB player in the auction. In the rest,
we call the Straightforward super player the opponent and the non-SB player the
player. The latter’s private valuation is noted v.
We model the opponent’s valuation as a random variable V (k) = k
j=1 Zj
with (Zj) random non-negative variables of known distribution. The (Zj) must
verify Z1 ⩾. . . ⩾Z(n−1)m almost surely (a.s.). We note her demand function
δ(p) = (n−1)m
j=1
1{Zj > p} which is viewed as a random process. As mentioned
before, the (Zj)1⩽j⩽(n−1)m is a reordering of n −1 sequences (Zi
j)1⩽j⩽m which
verify Zi
1 ⩾. . . ⩾Zi
m almost surely (a.s.) for all i ∈{1, . . . , n −1}.
In a perfect information setting i.e. when the opponent’s valuation is public,
the optimal policy comes naturally:
Proposition 4. Against an SB player, the optimal policy for player i is given
by the optimization problem:
max
k∈{0,...,m}
p∈P
(v(k) −kp)1(k + δ(p) ⩽m) ,
where P = {Pinit + rΔP | 0 ⩽r ⩽maxk∈{1,...,m}
v(k)−Pinit
ΔP
}.

J. Zeroual et al.
Since the player knows the opponent’s bid at every price, she can decide the
moment the auction ends by adapting her own bid. As a matter of fact, since
p →v(k) −kp is decreasing in p for k > 0 and is null for k = 0, the maximum
is necessarily attained at pk = inf{p ∈P : δ(p) + k ⩽m} for a certain k and
is non-negative. An optimal strategy for such an oracle player is to bid the k
that maximizes v(k)−kpk. Since this result is immediate, the literature primarily
examines scenarios where the opponent’s valuation is either unknown or revealed
through signaling during the auction [9,10].
The following section formally introduces the optimization problem regarding
the player’s strategy.
Bellman Equation
3.1
POMDP
We model the situation as a Partially Observable Markov Decision Process
(POMDP):
Deﬁnition 2. We denote by S the state space. The state st = (t, pt, kt, ωt) at
time t is deﬁned by:
– t ⩾0 is a discrete time, it can be interpreted as the round of the auction.
– pt ∈P is the price at round t. The price dynamics is given by p0 = Pinit and
∀t ⩾0, pt+1 = pt + ΔP.
– kt ∈{0, . . . , m} is the player’s bid at round t −1.
– ωt is the choice of nature for the opponent’s valuation during the auction. We
suppose that ∀t ⩾0, ωt+1 = ωt meaning that the opponent’s valuation does
not change during the auction.
We denote by O the set of observations. The observation at time t is given
by ot = (t, pt, kt, δt−1) ∀t ⩾0, where δt = ¯δ(ωt, pt) is the opponent’s bid at
round t (¯δ is a deterministic function). Let δ−1 be any initial conditional. Let
k0 := arg maxk∈{0,...,m}(v(k) −kPinit). From these observations, at round t,
the player takes an action ut = σt((os, us)0⩽s⩽t−1, ot) ∈{0, . . . , m} with σt a
measurable function and ut ⩽kt. The sequence (σt)t⩾0 is called an admissible
strategy. The state following the action ut satisﬁes kt+1 = ut.
The action u causes the state to change from s to s′ with probability
T(s′|s, u). As a matter of fact, in this model, all transitions are deterministic:
T((t′, p′, k′, ω′) | (t, p, k, ω), u) =

if ω′ = ω, k′ = u, t′ = t + 1, p′ = p + ΔP
0
otherwise
However, the initial state s0 is supposed to be random because ω0, the unknown
nature’s choice, is viewed as a random variable.
We will note O(o′|s′, u) the probability with which the player observes o′
when reaching state s′ after taking action u.

Optimal Strategy Against Straightforward Bidding in Clock Auctions
Optimization Problem. The problem is to maximize the player’s expected
value. Our goal is thus to ﬁnd an optimal admissible strategy i.e. optimize with
regards to σ
maximize E[v(kT ) −kT pT ]
where T = inf{t ⩾0 | δt + kt ⩽m} (termination condition)
(1)
We introduce the belief state bt which is the distribution of the current state
conditionally to the history. Thus, bt = P(st|ot, (ut−1, ot−1), . . . , (u0, o0)). Since
the decision of the player and the termination condition depend on the last
observation, a suﬃcient statistics of the POMDP includes not only the belief
but also the last observation ot.
Proposition 5. The optimal value of Problem 1 is given by the Bellman equa-
tion in which o = (t, p, k, δ) with t ⩾0 and b denotes the belief:
ψ(o, b) =
⎧
⎨
⎩
v(k) −k(p −ΔP)
if k + δ ⩽m
max
u⩽k
	
o′∈O
	
s, s′∈S
O(o′|s′, u)T(s′|s, u)b(s)ψ(o′, b′)
otherwise.
(2)
Here, b′(s′) =
O(o′|s′,u) 
s∈S T (s′|s,u)b(s)

s′′∈S O(o′|s′′,u) 
s∈S T (s′′|s,u)b(s) is the updated belief at state s′.
This follows from a classical result of optimal control where the belief takes
into account all the past rounds to determine a probability distribution over the
future state [18,20]. However, it is hard to make out practical use of this form.
3.2
Simpliﬁcation
Solving the Bellman equation requires to consider all histories to compute an
optimal response. However, the only source of randomness is ω. The only ω-
dependent component of the model is the observed bid δ(pt) = δ(ωt, pt) =
(n−1)m
j=1
1{Zj(ω0) > pt}. Hence, we can “transpose” the randomness of the
environment to the opponent’s bid by seeing δ(pt) as a random process.
The following theorem embodies this simpliﬁcation: under an assumption on
the demand function and knowing the initial belief b0, only the demand observed
at the last round matters to take an optimal decision.
Theorem 1. Let ∀t ⩾0,
ϕ(t, k, δ)=
⎧
⎨
⎩
v(k) −kpt−1
if k + δ ⩽m
max
u⩽k
	
δ′⩽δ
P(δ(pt) = δ′|δ(pt−1) = δ)ϕ

t + 1, u, δ′

otherwise.
(3)
Suppose that (δ(pt))t⩾0 is a Markov chain. Let b0 be the distribution of
s0 = (0, Pinit, k0, ω0) where ω0 is the nature’s choice (for the random sequence
(Zj)0⩽j⩽m or the process (δ(pt))t⩾0). Then the optimal value given by Equa-
tion (2) and ϕ coincide at the initial time: Eδ−1[ψ(o0 = (0, Pinit, k0, δ−1), b0)] =
Eδ−1[ϕ(0, k0, δ1)].

J. Zeroual et al.
In other words, we can ﬁnd an optimal solution avoiding the recourse to dynamic
programming in a belief space if the opponent’s demand is a Markov chain as it
is a suﬃcient statistics for the optimal value. This leads to a practical algorithm
to decide bids at each round. The ﬁrst decision considers the distribution of
δ(Pinit) and must maximize the discounted utility. Then, if the auction is not
ﬁnished, it suﬃces to take the arg max at each round t in Eq. (3).
Optimal Bound
Theorem 1 provides a simple algorithm to play an auction optimally. In this
section, we quantify the value of this optimum. To this end, we took inspiration
from prophet inequalities and their deﬁnition of approximation [7]. We investi-
gate how much the algorithm’s expected utility diﬀers from the utility of a player
with perfect information. We also introduce a stronger notion of approximation
which gives a more practical meaning to optimality.
4.1
Exponential Case
The exponential distribution is associated with life expectancy. In the context
of an auction, the demand is similar to the process of aging, as the auctioneer
“dies” when her bid reaches 0. Thus, it makes sense to model the time passing
between two changes in demand as exponential laws. For an opponent i:
– Let λ > 0 and Zopp,i
m+1 = 0
– ∀j ∈{1, . . . , m}, Zopp,i
j
−Zopp,i
j+1
∼E(λ)
– (Zopp,i
j
−Zopp,i
j+1 ) are iid.
Moreover, we suppose that for all i ̸= i′, (Zopp,i
j
−Zopp,i
j+1 ) and (Zopp,i′
j
−Zopp,i′
j+1
)
are independent for any j. We thus deﬁne n−1 opponent i ∈{1, . . . , n−1} with
a demand function δi with independent increments. Hence, the sum remains a
Markov chain. This model allows us to apply the result of Theorem 1 and use
the underlying strategy. In this particular case, P(δi(pt+1) = δt+1|δi(pt) = δt)
can be explicitly computed and P(δ(pt+1) = δt+1|δ(pt) = δt) follows.
4.2
Empirical Evidence of Optimality
We simulate auctions and observe the performance of an agent playing according
to the strategy we have exhibited. Those performances can be compared to an
oracle (see the optimization problem 4) to give a sense of how close the algorithm
is to take the optimal decision.
Simulation Setting. We suppose the opponent and the player have the same
exponential parameter λ. Moreover, the player’s valuation is ﬁxed at v(k) =
λ[k(m + 1) −k(k+1)
] whereas the opponents’ is randomly drawn. Let’s motivate
the player’s valuation. In an auction, every player would have a similar valuation

Optimal Strategy Against Straightforward Bidding in Clock Auctions
in a fair auction (otherwise players with widely lower valuation would not be able
to compete). We thus set this valuation to be the expectancy of a random SB-
opponent’s.
Among the simulations, ΔP the price increment, Pinit the initial price and
m the number of items are ﬁxed. Each simulation is carried out as follows:
– We draw independently n −1 samples of length m: zopp,i
, . . . , zopp,i
m
from
random variables (Zopp,i
j
) to form the demand of one opponent i. Then,
we deﬁne z1, . . . , z(n−1)m as a reordering of (zopp,1
, . . . , zopp,1
m
, . . . , zopp,n−1
,
. . . , zopp,n−1
m
). It yields the opponent’s demand δ(p) = (n−1)m
j=1
1{zj > p}.
– We then play the same auction (i.e. against the same opponent) using two
diﬀerent strategies:
1. For the ﬁrst strategy, we suppose the player has access to the opponent’s
valuation. The player plays with perfect information and obtains an opti-
mal ﬁnal score Vi, her utility at the end of the auction.
2. The second strategy is the policy derived from Eq. (3). This results in a
ﬁnal score ψi.
Approximations. Usually (see [9,10]), an approximation is deﬁned as follows.
Deﬁnition 3. For every strategy σ with imperfect information, let V (σ) be the
random variable giving the score such a strategy yields. We denote by V the
score of the optimal strategy in a perfect information setting. σ is said to be an
α-approximation if and only if E[V (σ)] ⩾αE[V ].
We extend this notion with the following deﬁnition.
Deﬁnition 4. With the foregoing notation, σ is said to be an α-strong approx-
imation with probability p if and only if P(V (σ) ⩾αV ) ⩾p.
Spectrum auctions are neither repeated nor scalable. Thus, it is more meaningful
for an agent to know that there is high chance to approximate the optimal value
rather than knowing that this value would be attained in expectancy.
Empirical Results. In order to choose the most realistic parameters, we con-
sider the same parameters as in the French 5G auction: m = 11, Pinit = 70
and ΔP = 3 (see [1]). We have conducted N = 10.000 auctions for λ ∈
{10, 11, 12, 13, 14, 15} in order to mimic diﬀerent bidding proﬁles compatible
with the 5G auction. From those simulations, we can conjecture that approxima-
tion and strong approximation results can be derived on the Bellman strategy
(Tables 1, 2 and 3).

J. Zeroual et al.
Table 1. Frequence of points (Vi, ψi) such
as ψi ⩾80%Vi
λ
Freq 90% 89% 91% 92% 90% 91%
Table 2. Empirical expectations
λ
E[V ]
E[ψ]
E[V ]/E[ψ] 91% 94% 94% 95% 94% 94%
Table 3. Estimation of P(V = ψ)
λ
P(V = ψ) 49% 54% 57% 61% 58% 58%
From those ﬁgures, we can conjecture that an approximation result can be
empirically observed and the value of α seems to be independent on λ. Such
empirical evidence suggests the existence of a constant approximation factor.
Plus, from a practical point of view, data show that the outcome of our strategy
rarely diﬀers from the optimal outcome since, in at most ≃10% of auctions, the
obtained utility is lower than 80% of the best-possible utility. Furthermore, in
at least half of the sample, the strategy achieved the best possible utility.
Conclusion
We have modelled a real-life auction against a straightforward but realistic strat-
egy as a POMDP, obtained the optimal strategy, and compared the performances
of this strategy and of a perfectly informed one. Future work would focus on hav-
ing theoretical guarantees for this strategy in the same setting. Moreover, one
could study the scaling of this result in higher dimension auctions such as the
SAA (Simultaneous Ascending Auction) where players are allowed to bid on
multiple items rather than a number of items, raising their prices individually.
References
1. Autorité de Régulation des Communications Electroniques, des postes et de la
distribution de la presse: Grand dossier - 5G Attribution des fréquences en
métropole.
https://www.arcep.fr/la-regulation/grands-dossiers-reseaux-mobiles/
la-5g/attribution-des-frequences-en-metropole.html. Accessed 24 May 2024
2. Berge, F., Bechler, A., Chardy, M.: A mixed integer programming approach for
5g spectrum auction strategy optimization. In: ICC 2023 - IEEE International
Conference on Communications, pp. 4846–4852 (2023)
3. Bikhchandani, S., Mamer, J.W.: Competitive equilibrium in an exchange economy
with indivisibilities. J. Econ. Theory 74(2), 385–413 (1997)
4. Boutilier, C.: A POMDP formulation of preference elicitation problems. In: Eigh-
teenth National Conference on Artiﬁcial Intelligence, pp. 239–246. American Asso-
ciation for Artiﬁcial Intelligence, USA (2002)
5. Bulow, J., Levin, J., Milgrom, P.: Winning play in spectrum auctions. Working
Paper 14765, National Bureau of Economic Research (2009)

Optimal Strategy Against Straightforward Bidding in Clock Auctions
6. Cai, Y., Feng, Z., Liaw, C., Mehta, A., Velegkas, G.: User response in ad auctions:
an MDP formulation of long-term revenue optimization (2024)
7. Correa, J., Cristi, A.: A constant factor prophet inequality for online combinato-
rial auctions. In: Proceedings of the 55th Annual ACM Symposium on Theory of
Computing, pp. 686–697. ACM (2023)
8. Cramton, P., et al.: Simultaneous ascending auctions with package bidding (1998)
9. Dütting, P., Kesselheim, T., Lucier, B.: An o(log log m) prophet inequality for
subadditive combinatorial auctions (2020)
10. Eden, A., Feldman, M., Goldner, K., Mauras, S., Mohan, D.: Constant approxima-
tion for private interdependent valuations. In: 2023 IEEE 64th Annual Symposium
on Foundations of Computer Science (FOCS), pp. 148–163. IEEE (2023)
11. Jain, R., Chiu, D., Hawe, W.: A quantitative measure of fairness and discrimination
for resource allocation in shared computer systems (1998)
12. Levin, J., Skrzypacz, A.: Properties of the combinatorial clock auction. Am. Econ.
Rev. 106(9), 2528–2551 (2016)
13. Milgrom, P.: Putting Auction Theory to Work. No. 9780521551847 in Cambridge
Books, Cambridge University Press (2000)
14. Milgrom, P., Strulovici, B.: Substitute goods, auctions, and equilibrium. J. Econ.
Theory 144(1), 212–247 (2009)
15. Milgrom, P.R.: Auction Theory. Cowles Foundation Discussion Papers 779, Cowles
Foundation for Research in Economics, Yale University (1985)
16. Myerson, R.B.: Optimal auction design. Math. Oper. Res. 6(1), 58–73 (1981)
17. Reeves, D.M., Wellman, M.P., MacKie-Mason, J.K., Osepayshvili, A.: Exploring
bidding strategies for market-based scheduling. Decis. Support Syst. 39(1), 67–85
(2005)
18. Ross, S., Pineau, J., Paquet, S., Chaib-draa, B.: Online planning algorithms for
POMDPs. J. Artif. Intell. Res. 32, 663–704 (2008)
19. Wellman, M., Osepayshvili, A., MacKie-Mason, J., Reeves, D.: Bidding strategies
for simultaneous ascending auctions. Top. Theor. Econ. 8, 1461–1461 (2008)
20. Åström, K.J.: Optimal control of Markov processes with incomplete state informa-
tion I. J. Math. Anal. Appl. 10, 174–205 (1965)

Fair Cost Sharing Under Platform
Two-Sided Intermediation
Luis Guijarro(B)
, Jos´e Ram´on Vidal
, and Vicent Pla
Universitat Polit`ecnica de Val`encia, Camino de Vera, s/n., 46022 Val`encia, Spain
{lguijar,jrvidal}@dcom.upv.es, vpla@upv.es
Abstract. We study the pros and cons of the “fair cost sharing” pro-
posal, which entitles the charging of a fraction of the traﬃc cost incurred
by an access Internet Service Provider (ISP) to the Content Providers
(CPs) that deliver content to the access ISP users. This study is con-
ducted in a scenario where CPs host their content in a platform and
where the platform operates two-sided pricing for the intermediation
between CPs and users. Our hypotheses is that this two-sided pricing
interacts in a relevant manner with the access ISP, which can only price
the user side. We conclude that a cost sharing regulation, when com-
plete pass-through is executed by a content aggregating platform, does
not improve the ISP’s proﬁt and does not preclude the platform from
obtaining proﬁts either. Furthermore, we found that the value that the
platform eventually captures is the value that the ISP would capture if
the platform was absent.
Keywords: Fair cost sharing · Platform · Internet Service Providers
Introduction
Net neutrality has been debated intensively since it ﬁrst was advocated two
decades ago. And it has been regulated worldwide, prominently in the US and
in the EU. There are multiple approaches to the net neutrality concept. We
focus on the one which prevents an access Internet Service Provider (ISP) to
charge Content Providers (CPs) in order that the CPs can reach access ISP’s
subscribers [3].
It has been claimed by access ISPs that charging a side payment to the
CPs, which is forbidden by net neutrality regulations, would contribute to the
upgrade of the infrastructure needed to support the huge amount of traﬃc that
ﬂows from the CPs to the users. This rationale has recently been proposed under
the concept of “direct compensation” or “fair cost sharing” [4].
We do not aim to contribute to the general debate on net neutrality under
the current facade [6]. Instead, we will focus on the fact that CPs not only
need access ISP in order to reach users that subscribe to their services, but
also need platforms (e.g., Google YouTube, Amazon Prime Video, Netﬂix) that
intermediate and match CPs against users. These platforms do not abide to an
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 94–103, 2025.
https://doi.org/10.1007/978-3-031-78600-6_9

Fair Cost Sharing Under Platform Two-Sided Intermediation
Fig. 1. Scenario
equivalent net neutrality regulation, and therefore they have been applying two-
sided pricing mechanisms since their inception, which allows them to actively
manage the cross-network eﬀects operating in such business models.
Our focus is then to analyze the pros and cons of enforcing a fair cost share
regulation when access ISPs serve the content aggregated by big platforms,
within a framework where the latter operate two-sided pricing in their busi-
ness models. Our hypothesis is that platform two-sided pricing interacts in a
relevant manner with the access ISP business model.
Economic Model
We model a scenario as depicted in Fig. 1. The users have access to an access
ISP that provides access to the internet and to a platform that intermediates
and matches users and CPs, among other service oﬀerings. The CPs can only
reach the users through the access ISP and only serve their contents through the
platform, which is assumed to host the CPs’ content. Therefore, the ISP and the
platform are necessary for the users to subscribe and use the services provided
by the CPs. And both ISP and platform create their respective stand-alone value
with additional (although typically more basic) services.
2.1
Users’ Subscription
We model a mass of Nu non-atomic users that are potential subscribers of both
the access ISP and the platform, so that if they do subscribe to both of them, they
will be able to enjoy the service provided by the CPs. The users are homogeneous
in all their characteristics except in the value of the outside option. We assume
that the outside option of each user is drawn independently from a uniform
distribution over the unity interval [0, 1].

L. Guijarro et al.
Each user is charged a fee β by the platform and a price b by the access ISP.
We therefore assume that the ISP charges a ﬂat-rate tariﬀ.
The users derive a stand-alone value ru from the combined platform-ISP
service. And they derive an additional value that is increasing in the number of
CPs oﬀering their contents through the platform and the ISP. If the number of
joined CPs is nc, this additional value, assuming a linear dependence, is δnc, so
that δ models the intensity of the cross-group network eﬀect that the CP side
exerts on the user side.
Putting all the above modeling assumptions together, the expression for the
utility that a user derives if he/she subscribes to the combined service is:
u = ru + δnc −β −b
(1)
Note that the above expression has similarities with the common modeling
of the utility derived by the users of a platform when they are charged a par-
ticipation fee β + b [1]. Nevertheless, in this work, as it will be detailed below,
these participation fees are charged by two independent agents.
Finally, since the outside option u0 of each user is uniformly distributed in the
unity interval, the number of users that will subscribe to the combined service
nu can be computed as:
nu
Nu
= Prob{u0 ≤u}
= Prob{u0 ≤ru −β −b + δnc}
=
⎧
⎪
⎨
⎪
⎩
0
if ru −β −b + δnc < 0
ru −β −b + δnc
if 0 ≤ru −β −b + δnc ≤1
if 1 < ru −β −b + δnc
(2)
2.2
CPs’ Decision
We model a mass of Nc non-atomic CPs that are willing to oﬀer their contents to
the users, which are reachable by means of the combined platform-ISP service.
The CP’s business model is based on advertisement. The CPs are homogeneous
in all their characteristics except in the beneﬁt of the outside option, which we
assume it is drawn independently from a uniform distribution over the unity
interval [0, 1].
A CP is charged a fee α by the platform and a price c′ per traﬃc unit
that is downloaded to the subscribers. If we assume that an average traﬃc ω is
downloaded from a CP to a user, we can denote by c = c′ω the price per user
that is charged to the CP.
The CP derives a stand-alone beneﬁt rc from the combined platform-ISP
service. And it gets an advertising revenue γ per user. Since the number of
subscribers is nu, this additional revenue is γnu, so that we can interpret γ as
the intensity of the cross-group network eﬀects that the user side exerts on the
CP side.

Fair Cost Sharing Under Platform Two-Sided Intermediation
Putting all the above modeling assumptions together, the expression for the
proﬁt that a CP obtains if joins to the combined service is:
Πc = rc + γnu −α −cnu = rc −α + (γ −c)nu
(3)
Again, note that the above expression has similarities with a setting where
the CPs are charged both a participation fee α and a transaction fee c [5].
Finally, since the outside option Π0 of each CP is uniformly distributed in
the unity interval, the number of CPs that will join to the combined service nc
can be computed as:
nc
Nc
= Prob{Π0 ≤Πc}
= Prob{Π0 ≤rc −α + (γ −c)nu}
=
⎧
⎪
⎨
⎪
⎩
0
if rc −α + (γ −c)nu < 0
rc −α + (γ −c)nu
if 0 ≤rc −α + (γ −c)nu ≤1
if 1 < rc −α + (γ −c)nu
(4)
2.3
Platform’s Decisions
The platform charges a fee β to each subscriber and a fee α to each joined CP,
so that it gets a revenue equal to
Πp = αnc + βnu.
(5)
We neglect the variable costs incurred by the platform, so that the platform will
set the two-sided price {α, β} in order to maximize Πp.
2.4
ISP’s Decisions
The access ISP gets revenues from the subscribers equal to bnu. As regards the
costs, we assume that only traﬃc-related variable costs are incurred, and the
marginal cost is constant and equal to k′. As argued above, the total aggregated
traﬃc from all joined CPs and all subscribers is equal to the product nuncω.
We assume that a cost share can be enforced and that the platform is able
to pass-through all this share fee to the corresponding CPs. The cost share is
denoted by c′ per traﬃc unit, or c = c′ω per CP-user transaction.
The proﬁts are therefore given by:
Πu = bnu −(k −c)nunc,
(6)
where k = k′ω, and 0 ≤c ≤k is assumed. The access ISP will set b in order to
maximize Πu.

L. Guijarro et al.
Fig. 2. Platform and ISP payment ﬂow model
Analysis
Figure 2 summarizes the payments ﬂow described above in the model.
We assume the following sequence of decisions:
1. A cost share fee c is set.
2. The platform sets {α, β} and the ISP sets b.
3. The users and the CPs decide whether to subscribe/join or not.
We therefore assume that the pricing decisions by the platform and the access
ISP are taken simultaneously and independently.
Furthermore, once prices are set by the access ISP and the platform, the
subscription decisions by users and CPs are modeled under the assumption of a
fulﬁlled-expectations equilibrium, where agents (users or CPs) from one side form
the same expectations on the participation of the agents of the other side and
these expectations turn out to be correct. That is, the number of subscribers nu
and joined CPs nc will be the solution {nu, nc} to the system of the two Eqs. (2)
and (4) [2, p.83]. We assume that 1 −δ(γ −c)NuNc > 0, so that the demand
functions nu and nc are decreasing with their own prices.
We restrict our analysis to interior equilibrium solutions {nu, nc}, that is
0 ≤ru −β −b + δnc ≤1 and 0 ≤rc −α + (γ −c)nu ≤1. And we will solve
the ISP’s and platform’s proﬁt maximization problems through the First Order
Conditions.
Results
We compare the scenario described in the previous sections, where the platform
is present and implements a two-sided pricing, against a baseline scenario, where

Fair Cost Sharing Under Platform Two-Sided Intermediation
the platform is absent. In the baseline scenario, no fees {α, β} are charged and
it is assumed that the content can still match the users.
We discuss the results in terms of ISP proﬁts (Figs. 3, and 13), platform
proﬁts (Figs. 4 and 14), number of subscribers (Figs. 8 and 15), number of joined
CPs (Figs. 9 and 16), users/consumers’ surplus (Figs. 10 and 17), CP surplus
(Figs. 11 and 18), and social welfare (Figs. 12 and 19)
The Consumers’ and CPs’ surpluses are respectively computed as follows:
CS ≡Nu
 u
0
u 1 du0
(7)
CPS ≡Nc
 Πc
0
Πc 1 dΠ0.
(8)
And the Social Welfare is the sum of the surpluses of all agents:
SW = CS + CPS + Πp + Πu.
(9)
The parameters used are Nu = 10, Nc = 1, δ = 0.3, γ = 0.3, k = 1 and
c = 0.3 if not stated otherwise. When the platform is present, the stand-alone
beneﬁts are ru = 1 and rc = 1; when the platform is absent, these are lower
and set to ru = 0.7 and rc = 0.7. For all parameters values, the concavity of the
proﬁt functions are assured, so that the Nash equilibrium exists.
We conduct below comparative statics, that is, we characterize the equilib-
rium of the two-stage game described above as one parameter is varied across
a range of values. Speciﬁcally, we analyze the eﬀect of parameter c (Sect. 4.1),
which is the cost share that the CPs must contribute to the access ISP; and of
parameter γ (Sect. 4.2), which quantiﬁes the per subscriber advertising revenue
for the CP.
4.1
Comparative Statics: c
The parameter c varies between 0 and 0.45.
The results show that, when the platform is present, the ISP and the users
are better oﬀfor low c, but worse oﬀfor high c (Fig. 3 and Fig. 10). However,
the CPs are better oﬀwhen the platform is present (Fig. 11). The overall eﬀect
of the platform presence, when measured by the social welfare, is positive when
c is low and negative when c increases.
When the platform is present, the results show that an increase in the cost
share beneﬁts mostly the platform (Fig. 4), and there is no relevant change for
the ISP (Fig. 3). The CPs are the main agents that get harmed. This result is
made possible by a combination of pricing decisions (Figs. 5, 6, 7): β increasing,
b decreasing and α decreasing (even negative). The overall eﬀect of an increase
in c is beneﬁcial, however, as far as the social welfare is concerned (Fig. 12).
When the platform is absent, there is an even larger positive impact of an
increase in c.

L. Guijarro et al.
Fig. 3. Access ISP’s proﬁt as a func-
tion of c
Fig. 4. Platform’s proﬁt as a function
of c
Fig. 5. β as a function of c
Fig. 6. α as a function of c
Fig. 7. b as a function of c
Fig. 8. Number of subscribers as a func-
tion of c
Fig. 9. Number of joined CPs as a func-
tion of c

Fair Cost Sharing Under Platform Two-Sided Intermediation
Fig. 10. Consumers surplus as a function
of c
Fig. 11. CPs surplus as a function of c
Fig. 12. Social welfare as a function of c
4.2
Comparative Statics: γ
The parameter γ varies between 0.16 and 0.30.
The results show that, when the platform is present, the ISP is worse oﬀfor
low γ, and it gets indiﬀerent as γ increases (Fig. 13). The users are worse oﬀ
(Fig. 17). The CPs are better oﬀ(Fig. 18). And the overall eﬀect is detrimental
for low γ and slightly beneﬁcial for high γ (Fig. 19).
When the platform is present, the ISP and the CPs capture the value of
an increase in γ (Figs. 13 and 18), while the platform and the users lose value
(Figs. 14 and 17), and the overall eﬀect is slightly detrimental (Fig. 19). When
Fig. 13. Access ISP’s proﬁt as a function
of γ
Fig. 14. Platform’s proﬁt as a function
of γ

L. Guijarro et al.
Fig. 15. Number of subscribers as a
function of γ
Fig. 16. Number of joined CPs as a func-
tion of γ
Fig. 17. Consumers surplus as a function
of γ
Fig. 18. CPs surplus as a function of γ
Fig. 19. Social welfare as a function of γ
the platform is absent, the users lose value more rapidly and the overall eﬀect
of the increase is now clearly detrimental.
Conclusions
The conclusions are that a cost sharing regulation, when complete pass-through
is executed by a content aggregating platform, does not improve the ISP’s proﬁt
and does not preclude the platform from obtaining proﬁts either. Furthermore,
despite the fact that higher cost shares are always detrimental for the CPs,
they are less detrimental when the platform is present. And the value that the
platform captures is the value that the ISP captures when the former is absent.
Finally, the social welfare, driven mostly by the consumer surplus, is higher when
the platform is present only for low values of the cost share.

Fair Cost Sharing Under Platform Two-Sided Intermediation
The above conclusion would argue in favor of the eﬀectiveness of the two-sided
platform pricing in counteracting the harm on CPs incurred by a cost-sharing
regulation.
Acknowledgement. This work has been conducted during a research stay in Summer
2023 at the Weizenbaum Institut, Berlin, Germany, hosted by the Research Group Dig-
ital Economy, Internet, Ecosystems and Internet Policy thanks to Dr. Stocker’s invita-
tion. Financial support is acknowledged from Grant PID2021-123168NB-I00, funded by
MCIN/AEI, Spain/10.13039/ 501100011033 and the European Union A way of mak-
ing Europe/ERDF and Grant TED2021-131387B-I00, funded by MCIN/AEI, Spain/
10.13039/501100011033 and the European Union NextGenerationEU/ RTRP.
Disclosure of Interests. The authors have no competing interests to declare that
are relevant to the content of this article.
References
1. Armstrong, M.: Competition in two-sided markets. Rand J. Econ. 37(3), 668–691
(2006)
2. Belleﬂamme, P., Peitz, M.: The Economics of Platforms. Cambridge University
Press, Cambridge (2021)
3. Economides, N., T˚ag, J.: Network neutrality on the internet: a two-sided market
analysis. Inf. Econ. Policy 24(2), 91–104 (2012)
4. Jullien, B., Bouvard, M.: Fair cost sharing: big tech vs telcos. TSE Working Paper,
n. 22-1376 (2022)
5. Rochet, J.C., Tirole, J.: Two-sided markets: a progress report. Rand J. Econ. 37(3),
645–667 (2006)
6. Stocker, V., Lehr, W.: Regulatory policy for broadband: A response to the ETNO
report’s proposal for intervention in Europe’s internet ecosystem (2022). Available
at SSRN 4263096

TariﬀVersus Sanction Under Bounded
Rationality
Fr´edy Pokou1(B), Marta Fochesato2, and H´el`ene Le Cadre1
1 Inria, CNRS, Univ. of Lille, Centrale Lille, UMR 9189 - CRIStAL, 59000 Lille,
France
{fredy-vale-manuel.pokou,helene.le-cadre}@inria.fr
2 Automatic Control Laboratory, Department of Electrical Engineering and
Information Technology, ETH Z¨urich, Physikstrasse, 38092 Z¨urich, Switzerland
mfochesato@ethz.ch
Abstract. We formulate the design of a taxation mechanism as a Stack-
elberg game assuming: a) perfect competition, with exogenous prices; b)
imperfect competition, captured through a variational inequality app-
roach, with endogenous prices. Three settings of the mechanism are con-
sidered: (i) benchmark involving no taxation, (ii) optimum tariﬀ, (iii)
optimum sanction. The expected utility maximization formulation of
the game is extended further by relying on cumulative prospect theory
to account for the bounded rationality of the stakeholders. We derive
closed-form mappings linking the outcomes of the three settings. Addi-
tionally, we assess the impact of bounded rationality through a new per-
formance metric, the Price of Irrationality. Numerical results are derived
on a randomized instance of a gas trading game between Europe, Asia,
and Russia.
Keywords: Game Theory · Sanction Design · Cumulative Prospect
Theory
Introduction
Problem Statement: The economies of many geographic markets are depen-
dent on fossil fuels, e.g., gas. Due to geopolitical tensions, some geographic mar-
kets may decide to partially or totally halt their gas imports by imposing tar-
iﬀs/sanctions on the imports [5]. We therefore propose a model which casts the
optimal tariﬀ/sanction problem as a Stackelberg game in two settings: a) per-
fect competition involving price-taking agents, i.e., geographic markets without
market power, and a Global Market Operator (GMO) deﬁning exogenous export
prices; b) imperfect competition where export prices are determined endoge-
nously as a result of the interactions among geographic markets. The model is
This work was partially funded by the R´egion Hauts-de-France through the STaRS
project SITAR.
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 104–117, 2025.
https://doi.org/10.1007/978-3-031-78600-6_10

TariﬀVersus Sanction Under Bounded Rationality
extended further to incorporate the bounded rationality of the agents, relying
on Prospect Theory (PT).
Main Contributions: Our model is built on an agent-based representation of
suppliers and generators interacting in a certain number of geographic markets.
We aim to assess the impact of tariﬀs/sanctions on the geographic markets’
imports of gas and on their welfare, framing the optimal sanction model as a
Stackelberg game. Considering the bounded rationality of the stakeholders with
respect to a potential risk of supply shortage, we rely on PT to extend the optimal
taxation/sanction games to situations involving stakeholders with diﬀerent risk-
aversion levels. Finally, numerical results are derived on a randomized instance
of the problem.
Reviewed Literature: We consider two forms of taxation mechanisms: tariﬀ
and sanction. The optimum tariﬀis determined by a regulator, interpreted as
the leader of a Stackelberg game, to maximize the welfare of the geographic
market that imposes the tax, while anticipating the clearing of the global gas
exchange market. Diﬀerently, the optimum sanction is determined by a regulator
that arbitrages between maximizing the welfare of the geographic market which
imposes the tax, and minimizing the welfare of the geographic market to be
sanctioned, while anticipating the clearing of the global gas exchange market.
Although they are simple economic instruments designed to inﬂict economic
harm, they have wider implications and can be used to exert pressure to change
behavior or policies. However, the literature dealing primarily with the optimal
design of sanctions is scarce. For this reason, our main bibliographic reference
is [5]. Speciﬁcally, [5] applies diﬀerent sanction models to the speciﬁc context
of Europe’s dependence on Russian gas by framing the problem as a two-player
partial equilibrium model and it assesses the impact of these sanctions on the
utilities of both stakeholders. We generalize this work in several directions. First,
we formulate taxation models as Stackelberg games under perfect and imperfect
competition, considering a larger number of stakeholders. Second, the impact of
the bounded rationality of the stakeholders on the market equilibria is considered
relying on the new concept of Price of Irrationality (PoI).
Paper Organization: The paper is organized as follows. In Sect. 3, we formulate
the perfect competition setting as a partial equilibrium model for three settings
(i) benchmark, (ii) optimum tariﬀ, (iii) optimum sanction. The model is extended
further relying on PT to capture the stakeholders’ bounded rationality in Sect. 4.
The Price of Irrationality is introduced in Sect. 4.2 as a performance metric to
assess the eﬃciency loss caused by the stakeholders’ bounded rationality in each
setting. We conclude in Sect. 5.
The Geographic Markets
Let N be a set of N geographic Natural Gas (NG) markets, abstracted as nodes
on a directed graph Γ = (N, E) where E ⊆N × N is the set of oriented

F. Pokou et al.
edges between the agents. Our model is built on an agent-based representa-
tion of suppliers and generators interacting in a certain number of geographic
markets. Markets can be either demand markets with no generation facility, or
generation markets with ﬁxed exogenously deﬁned demands. After satisfying
their own demand, generation markets can sell their generation surplus to the
demand markets. Let N d and N g be the sets of demand and generation markets
resp., such that N = N d ⊔N g, N d ⊓N g = ∅. For a given market n ∈N, we
deﬁne as Nn the subset of markets it can import (resp. export) NG from (resp.
to). Let dn ∈R≥0 be the demand of market n, qn ∈R≥0 its generation, and
qm,n, ∀m ∈Nn the amount that market n imports (resp. exports) from (resp.
to) the other markets. We impose the following convention: qm,n ≥0 means
that n buys NG from market m; while qm,n ≤0 means that n sells NG to
market n. In this setting, each market n ∈N is described by a strategy vector
xn
def
= (dn, qn, (qm,n)m∈Nn) ∈Rmn with mn = |Nn|+2. We let x−n
def
= (xm)m̸=n
be the vector which contains the decisions of all the agents in N except n.
Furthermore, we deﬁne x
def
= col ((xn)n∈N ) as the collection of the N players’
decision variables, and x0
def
= (pn,m)n,m as the vector containing the trading
prices between each couple of geographic markets in interaction. For illustrative
purpose, we consider 3 geographic markets: the European Union (EU), Asia (A)
and Russia (R). Generalization to a larger number of markets is straightforward.
Assumption 1. EU is a demand market with no NG production facilities, thus
qEU = 0; A and R are generation markets with both ﬁxed demands, i.e., dR =
¯dR > 0 and dA = ¯dA > 0.
Assumption 2 [10]. In the geographic demand market n ∈N d, dn is assumed
to be a linearly decreasing function of the price paid by its consumers (domestic
NG price) pn, i.e., dn(pn) = αn −βnpn ⇔pn(dn) = αn−dn
βn
with αn ≥0, βn > 0.
From Assumption 1, N d def
= {EU}, N g def
= {A, R}. We can now deﬁne the
stakeholders:
• Demand Market: In our case, it is composed solely of the EU with demand
dEU, which is modeled as a linearly decreasing function of pEU in line
with Assumption 2. The EU’s utility function, interpreted as its welfare, is
deﬁned as the diﬀerence between the consumer surplus and the trades costs:
JEU(xEU, x0) =
βEU

αEUdEU −d2
EU

−pEU,RqR,EU −pEU,AqA,EU.
• Generation Markets: Asia (A) and Russia (R) are the two generation markets
whose utility functions are deﬁned as the diﬀerence between revenues from
trades and gas generation costs. Following [10], the gas generation cost is
assumed to be quadratic in qn, i.e., Cn(qn) = anq2
n + bnqn + cn, ∀n ∈N g
with an > 0, bn ≥0, cn ≥0. We have: Jn(xn, x0) = 
m∈Nn pn,mqm,n −
Cn(qn),
∀n ∈N g.
• Global Market Operator (GMO): The GMO aims to minimize the trade sur-
plus. Its utility function is formally given by J0(x, x0) = 
n∈N

m∈Nn

TariﬀVersus Sanction Under Bounded Rationality
[pn,mqm,n + pm,nqn,m] . The choice of J0(·) is classical in in partial equilib-
rium models and essentially justiﬁed by the willingness to enforce global mar-
ket clearing. Let Qn
def
=

m∈Nn
qm,n be market n’s net import for NG. Denote
Xn
def
= {xn ∈Rmn | dn ≤qn + Qn, qn = 0 ∨dn = ¯dn} as the feasibility set of
market n ∈N, i.e., the set of decision variables satisfying the local balance
of supply and demand, and X
def
= 
n∈N Xn as the markets’ joint feasibility
set. Similarly, we let X0 be the feasibility set of the GMO.
Market Structures
3.1
Price-Taker Formulation
The perfect competition setting can be formulated as a partial equilibrium model
[1,6], which is a simpliﬁed interpretation of the general equilibrium theory [1].
In this setting, the GMO, interpreted as an external agent, acts as the “invisible
hand” of Adam Smith, setting the trade prices. Let G = (N ⊔{GMO}, X ×
X0, (Jn)n). The geographic markets solve the following non-cooperative game to
determine their optimal strategy:
∀n ∈N, max
xn
Jn(xn, x0),
max
x0
J0(x, x0),
(1a)
s.t.
xn ∈Xn,
s.t.
0 ≤pn,m ≤¯p, ∀n ∈N, ∀m ∈Γn, (1b)
pn,m = pm,n, ∀n ∈N, ∀m ∈Γn.
(1c)
Simultaneously, the GMO sets the export prices, given xn, ∀n. In (1), we impose
that the trade prices, chosen by the price-setting agent, are limited by the mar-
ket’s price cap ¯p > 0 and price ﬂoors. We assume a lower limit of 0 for all trade
prices. Import and export trading price symmetry is captured by (1c). The par-
tial equilibrium model outcome can be interpreted as a Nash Equilibrium (NE),
deﬁned as follows:
Deﬁnition 1 [1,2]. A strategy proﬁle x∗= (x∗, x∗
0) ∈X × X0 is a Nash Equi-
librium (NE) solution of G if, and only if, Jn(x∗
n, x∗
−n) ≥Jn(xn, x∗
−n), ∀xn ∈
Xn, ∀n ∈N ⊔{GMO}.
We note that at a Nash Equilibrium, J∗
0 = J0(x∗, x∗
0) = 0 from (1) and J0(·)
deﬁnition.
Proposition 1. There exists a NE solution of the Nash Game G.
Proof. The statement follows from [8] observing that Jn(·), ∀n ∈N ⊔{GMO}
are concave functions and the joint feasibility set X × X0 is convex and compact
as the intersection of aﬃne constraints.
□
Proposition 2. At a NE, d∗
n = q∗
n + Q∗
n, ∀n ∈N.

F. Pokou et al.
Proof. Reasoning by contradiction, we assume that at equilibrium there exists
n ∈N such that d∗
n < q∗
n+Q∗
n. As a result, for this n ∈N, λ∗
n = 0. But, from the
KKTs and the constraint on bilateral trades price symmetry, this implies that
λ∗
n = 0, ∀n ∈N. As a result, R and A make no proﬁt from exports. Then, in
order to maximize its proﬁts function, while satisfying the demand constraints,
the generation variables will take the values dR and dA, respectively. Therefore
Q∗
R = Q∗
A = 0. This implies in turn that q∗
R,A = q∗
R,EU = q∗
A,EU = 0, and then
Q∗
EU = 0. Then, from the primal feasibility constraint for EU we get that d∗
EU ≤
0, which is in contradiction with the form of the EU’s utility function which is
quadratic in dEU with a maximum on R∗
+. The proposition statement follows. □
Proposition 3. There exist multiple NEs solutions of the game G.
Proof. Let λn ≥0, ∀n, be the dual variables associated with the supply-demand
balance inequalities. At equilibrium, from the stationarity conditions, we get that
p∗
EU,A = λ∗
EU, p∗
EU,R = λ∗
EU, p∗
A,EU = λ∗
A, p∗
A,R = λ∗
A, p∗
R,EU = λ∗
R, p∗
R,A = λ∗
R.
From this set of relationships, we infer that p∗
EU,A = p∗
EU,R, p∗
A,EU = p∗
A,R,
p∗
R,EU = p∗
R,A and λ∗
EU = λ∗
R = λ∗
A = λ∗. In addition, we have the follow-
ing expressions for demand and generations at NE: d∗
EU = αEU −βEUλ∗
EU,
q∗
A =
2aA (λ∗
A −bA) and q∗
R =
2aR (λ∗
R −bR).
From Proposition 2, we have:
Q∗
EU = d∗
EU, Q∗
R = ¯dR −q∗
R, Q∗
A = ¯dA −q∗
A.
(2)
Furthermore, the bilateral trading reciprocity constraint implies that 
n Q∗
n =
0. This enables us to prove the existence of a unique market price:
λ∗=
αEU +

¯dA +
bA
2aA + ¯dR +
bR
2aR

βEU +
bA
2aA +
bR
2aR
(3)
Regarding the trades, from Eq. 2, we obtain a system of three equations with
three unknown variables:⎧
⎪
⎨
⎪
⎩
qR,EU + qA,EU = d∗
EU,
−qR,EU + qA,R = dR −q∗
R,
−qA,EU −qA,R = dR −q∗
A.
(4)
It is easy to see that this resulting system is incompatible whenever d∗
EU + dA −
q∗
A + dR −q∗
R ̸= 0, which never holds due to the construction of the game. Then,
d∗
EU +dA −q∗
A +dR −q∗
R = 0 always and the system is linearly dependent. Thus,
the NE is not uniquely deﬁned.
□
Let SOL(G) denote the set of solutions of the game G.
Proposition 4. ∀n ∈N ⊔{GMO}, Jn(x∗) = Jn(x∗∗), ∀x∗, x∗∗∈SOL(G).
Proof. By substitution of the optimal net imports in the markets’ utility func-
tions, at each NE we obtain the following expressions: J∗
EU =
α2
EU
2βEU −αEUλ∗+
2βEU(λ∗)2, J∗
n =


b2
n
4an −cn


−


¯dn +
bn
2an


λ∗+ (λ∗)2
4an ,
∀n ∈{A, R} which
depend only on G parameters.
□

TariﬀVersus Sanction Under Bounded Rationality
3.2
Price-Maker Formulation
In a decentralized market, geographic markets’ decisions inﬂuence the market
prices which are obtained as dual variables of the bilateral trading reciprocity
equations. In this setting, the geographic markets’ utility functions are modiﬁed
as follows: Jv
EU(xEU) =
βEU

αEUdEU −d2
EU

and Jv
n(xn) = −(anq2
n + bnqn +
cn), ∀n ∈{A, R} and the feasibility sets become coupled, i.e., Xn(x−n) = {xn ∈
Xn | qn,m = −qm,n, pn,m = pm,n, ∀m ∈Nn}, ∀n. Thus, each agent n ∈N solves
the following optimization problem:
max
x n
Jv
n(xn),
s.t.
xn ∈Xn(x−n).
(5)
The Variational Equilibria (VEs) solutions of the resulting game can be inter-
preted as NEs of the game Gv = (N, (Xn(x−n))n, (Jv
n)n).
Proposition 5. There exist multiple VEs solutions of Gv.
Proof.
At equilibrium, from the stationarity conditions, we get that λ∗
EU,A =
λ∗
EU, λ∗
EU,R = λ∗
EU, λ∗
A,EU = λ∗
A, λ∗
A,R = λ∗
A, λ∗
R,EU = λ∗
R, λ∗
R,A = λ∗
R.
From this set of relationships, we infer that λ∗
EU,A = λ∗
EU,R, λ∗
A,EU = λ∗
A,R,
λ∗
R,EU = λ∗
R,A and λ∗
EU = λ∗
R = λ∗
A = λ∗.
In addition, we have the following expressions for demand and generations at
a VE: d∗
EU = αEU −βEUλ∗
EU, q∗
A =
2aA (λ∗
A −bA) and q∗
R =
2aR (λ∗
R −bR).
The net imports also give us: Q∗
EU = d∗
EU, Q∗
R = ¯dR −q∗
R, Q∗
A = ¯dA −q∗
A
But, the bilateral trading reciprocity constraint implies that 
n Q∗
n = 0. This
enables us to prove the existence of an interior point NE in λ∗deﬁned in (3).
□
Let SOL(Gv) denote the set of VEs solutions of Gv. Similarly to Proposition 4, we
prove that the markets’ utility are constant over SOL(Gv). Substituting (Q∗
n)n
in the markets’ utility functions, at each VE we obtain the following expressions:
Jv∗
EU = −βEU
2 λ∗+ α2
EU
2βEU , Jv∗
n
= −1
4an λ∗+
b2
n
4an −cn,
∀n ∈{A, R} which depend
only on Gv parameters.
3.3
Optimum Tariﬀ
In the price-taker model deﬁned in Sect. 3.1, a tariﬀ(τ) is imposed by the GMO
on imports from Russia, leading to modiﬁed utilities for the geographic markets:
JEU(xEU, x0, τ) =
βEU

αEUdEU −d2
EU

−(pEU,R −τ)qR,EU −pEU,AqA,EU,
JA(xA, x0, τ) = pA,RqA,R + pA,EUqA,EU −CA(qA),
JR(xR, x0, τ) = pR,AqR,A + (pR,EU −τ)qR,EU + pA,RqA,R −CR(qR).

F. Pokou et al.
The tariﬀτ being ﬁxed, let Gτ = (N ⊔N0, X × X0, (Jn(·, τ))n) and SOL(Gτ)
denote the set of solutions of Gτ. The optimum tariﬀproblem can be formulated
as a single leader-multiple followers Stackelberg game [2]:
max
τ,x
JEU(xEU, τ),
s.t.
∀n ∈N, xn ∈SOL(Gτ).
(6)
Proposition 6. The market price in Gτ can be expressed as an aﬃne function
of the market price in G, λt(τ) = λ∗+
βEU τ
βEU+
2 aA +
2 aR
. Furthermore, there exists
a unique tariﬀτ ∗solution of the Stackelberg game (6).
Proof. For ﬁxed τ, relying on the stationarity conditions of the lower level of (6),
from the trades price symmetry, we infer that λ∗
EU(τ) = λt(τ)−τ, λ∗
A(τ) = λt(τ),
λ∗
R(τ) = λt(τ).
In addition, we have the following expressions for demand and generations
at NE of the lower level: d∗
EU(τ) = αEU −βEUλ∗
EU(τ), q∗
A(τ) = λ∗
A(τ)−bA
2aA
, and
q∗
R(τ) = λ∗
R(τ)−τ−bR
2aR
.
From Proposition 2, we have Q∗
EU(τ) = d∗
EU(τ), Q∗
R(τ) = ¯
dR−q∗
R(τ), Q∗
A(τ) =
¯
dA−q∗
A(τ). Furthermore, the bilateral trading reciprocity constraint implies that

n Q∗
n(τ) = 0. This enables us to prove the existence of an interior point NE of
the lower level:
λt(τ) =
αEU + ¯dA + ¯dR +
bA
2 aA +
bR
2 aR
βEU +
2 aA +
2 aR
+
βEU τ
βEU +
2 aA +
2 aR
= λ∗+
βEU τ
βEU +
2 aA +
2 aR
.
(7)
□
From Proposition 3, at the lower level of (6), J∗
EU(τ) =
α2
EU
2βEU −αEUλt(τ) +
βEU

λt(τ)2 −τ 2
, J∗
n(τ) =
b2
n
4an −cn −

¯dn +
bn
2an

λt(τ) + λt(τ)2
4an , ∀n ∈{A, R}.
The tariﬀvalue τ is determined by optimizing the upper-level utility function
JEU(xEU, τ). It is obtained by substituting λt(τ) from Eq. (7) in the EU’s util-
ity function, which gives a quadratic function in τ. At a Stackelberg Equilib-
rium (SE),
∂JEU(xEU,τ)
∂τ
|τ=τ ∗= 0, we obtain τ ∗=
βEU

βEU+
2 aA +
2 aR

(βEU+
2aA +
2aR )2−β2
EU λ∗−
αEU

βEU+
2 aA +
2 aR

(βEU+
2aA +
2aR )2−β2
EU . By replacing τ ∗by its value in Eq. (7), we obtain:
λt = λt(τ ∗) =
(aA + aR + 2 aA aR βEU)2
(aA + aR) (aA + aR + 4 aA aR βEU) λ∗−
4 a2
Aa2
R αEU βEU
(aA + aR) (aA + aR + 4 aA aR βEU) .
In order to analyze such a tax policy’s impact on EU, Asia and Russia’s
utility, we can establish the following relationships:

TariﬀVersus Sanction Under Bounded Rationality
Theorem 1. The markets’ utility at a SE of Gτ can be expressed as aﬃne func-
tions in their values in G: Jt
n = At
nJ∗
n +Bt
n, ∀n ∈{EU, A}, Jt
R = −3At
RJ∗
R +Bt
R,
where At
n is constant, Bt
n depends linearly on λ∗, and J∗
n is quadratic in λ∗, ∀n.
Proof. The result is an application of the polynomial Euclidean division; details
are given in [7].
□
In the price-maker model deﬁned in Sect. 3.3, we obtain results similar to Propo-
sition 6 and Theorem 1. The tariﬀτv being ﬁxed, let Gv
τv be the resulting game
and SOL(Gv
τv) denote the set of solutions of Gv
τv. The Stackelberg game takes the
form:
max
τv,x
Jv
EU (xEU, τv),
s.t
∀n ∈N, max
xn
Jv
n(xn),
s.t.
xn ∈Xn(x-n).
(8)
Proposition 7. The market price in Gv
τv can be expressed as an aﬃne function
of the market price in Gv, λt
v(τv) = λ∗−
βEU+
2 aA +
2 aR
·
τv
2aR . Furthermore, there
exists a unique tariﬀτ ∗
v solution of the Stackelberg game (8).
Proof. This is easily demonstrated by proceeding in a similar way to the proof
of Proposition 6; details are given in [7].
□
At the lower level of (8), all the VEs give the same values for the utility func-
tions at a VE: Jvt
EU(τv) = −βEU
2 λt2
v (τv)+ α2
EU
2 βEU , Jvt
A (τv) = −
4 aA λt2
v (τv)+
b2
A
4 aA −cA,
Jvt
R (τv) = −
4 aR λt2
v +

2 bR−2 τv
4 aR
−
bR
2 aR

λt
v + bR (bR−τv)
2 aR
−(bR−τv)2
4 aR
−cR. The
tariﬀvalue τv is determined by optimizing the upper-level utility function
Jv
EU(xEU, τv).
It
is
obtained
by
substituting
λt
v(τv)
in
the
EU’s
utility
function,
which gives a quadratic function in τv. At a Stackelberg Equilibrium (SE),
∂JEU(x EU,τv)
∂τv
|τv=τ ∗
v = 0, we obtain
τ ∗
v = 2 aR(αEU + ¯dA + ¯dR +
bA
2 aA +
bR
2 aR ). By replacing τ ∗
v by its value in λt
v(τv),
we obtain: λt
v = λt
v(τ ∗
v ) = 0.
Theorem 2. The markets’ utility at a SE solution of Gv
τv can be expressed as
aﬃne functions in the markets’ utility at a NE solution of Gv: Jvt
n = Avt
n Jvt
n +
Bvt
n , ∀n ∈{EU, A}, Jt
R = Avt
R J∗
R + Bvt
R , where Avt
n is a constant, Bvt
n depends
linearly on λ∗, and J∗
n is quadratic in λ∗, ∀n.
Proof. The result is an application of the polynomial Euclidean division [7]. □

F. Pokou et al.
3.4
Optimum Sanction
We start with the price-taker model. The aim of the sanction is to maximize
the EU’s objective function and minimize Russia’s through a ρ parameter. The
optimum sanction model is similar to the optimum tariﬀmodel (6), except that
the upper level objective function is replaced by J(xEU, xR, τ)
def
= JEU(xEU, τ)+
ρJR(xR, τ). The optimal value of τ is obtained from ∂
J(xEU,xR,τ)
∂τ
|τ=τ s = 0, which
gives τ s =
β2
EU
D2 −3 βEUρ
2 aR D2
D1
λ∗−
αEU βEU
D2
+
ρβEU

¯
dR−bR
2 aR

D2
D1
, where D1
def
= βEU −β3
EU
D2
2 +
3 β2
EU ρ
2 aR D2
2 and D2
def
= βEU +
2 aA +
2 aR .
Theorem 3. There exists an aﬃne relationship between τ s in the optimum
sanction model and τ ∗in the optimum tariﬀmodel: τ s = Asτ ∗+ Bs, where
As and Bs are constants deﬁned in [7]. A special case is when ρ=0, leading to
τ s = τ ∗.
Proof. Assuming y1 = a1x + b1 and y2 = a2x + b2, when we do y2
y1 , we can write
y2 = C1y1 + C2. Thus, C1 = a2
a1 and C2 = b2 −a2∗b1
a1 . By proceeding in this way,
we obtain coeﬃcients As and Bs. When ρ = 0, we can easily see that As = 1
and Bs = 0 then τ s = τ ∗.
□
We obtain λs(τ) = λt(τ). At τ = τ s we obtain the following expression for
the market price in Gτ s:
λs(τ s) =
⎛
⎝
βEU

β2
EU
E2 −3 ρ βEU
2 aR E2

E1
+ 1
⎞
⎠λ∗−
βEU
⎛
⎝αEU βEU
E2
+
ρβEU

¯
dR−bR
2 aR

E2
⎞
⎠
E1
,
where E1
def
= E2

βEU −β3
EU
E2
2 + 3 ρ β2
EU
2 aR E2

and E2
def
= βEU +
2 aA +
2 aR .
Similarly to optimum tariﬀmodel in Sect. 3.4, the geographic markets’ utility
functions take the same value in each SE [7]. The optimum sanction model can
be seen as a generalization of the optimum tariﬀmodel; indeed when ρ = 0,
the regulator’s utility function under optimal sanction coincides with that under
optimal tariﬀ.
Theorem 4. There exists an aﬃne relationship between the markets’ utility in
the optimum sanction model and the markets’ utility in the optimum tariﬀmodel:
Js
n = As
nJt
n + Bs
n, ∀n ∈N, where As
n and Bs
n are some constants deﬁned in [7].
Proof. Details are given in [7].
□
We continue with the price-maker model, and obtain results similar to The-
orems 3 and 4. The optimum sanction model is similar to the optimum tar-
iﬀmodel (8), except that the upper-level objective function is replaced by
Jv(xEU, xR, τv)
def
= Jv
EU(xEU, τv) + ρJv
R(xR, τv). The optimal value of τv is
obtained from ∂
Jv(xEU,xR,τv)
∂τv
|τv=τ s
v = 0, which gives

TariﬀVersus Sanction Under Bounded Rationality
τ s
v =
ρ
⎛
⎝
4 a2
R

βEU+
2 aA
+
2 aR
 −
2 aR
⎞
⎠

D1
λ∗+
βEU

αEU+ ¯dA+ ¯dR+ bA
2 aA + bR
2 aR

2aR 
D1

βEU+
2 aA +
2 aR
2
,
where
D1
def
=
2ρ

16 a3
R

βEU+
2 aA +
2 aR
2 −
4 a2
R

βEU+
2 aA +
2 aR
 +
4 aR

+
βEU
4 a2
R

βEU+
2 aA +
2 aR
2 .
Remark 1. Theorems 3, 4 can easily be extended to the variational setting of
the price-maker model [7]. Furthermore, we infer that there exists a closed-form
mapping linking the markets’ utility at a SE under optimal tariﬀ/sanction to
their utility at a NE solution of G.
Correlated equilibrium could be an alternative way to interpret optimal taxation
as modiﬁcations imposed by a regulator in the agents’ strategies.
Dealing with Bounded Rationality
In a realistic setting, gas demand is inﬂuenced by international political ten-
sions, economic growth, geographical location, and weather conditions, all of
which are unpredictable factors. This creates uncertainty about the availability
of this commodity, which can vary over time. To hedge against the risk of sup-
ply shortage, markets may behave irrationally when deﬁning trades and market
prices. To model the irrational behavior of economic agents, we use Cumulative
Prospect Theory (CPT). CPT is an extension of Prospect Theory (PT), devel-
oped to remedy the latter’s inability to capture nonlinear attitudes to risk and
probability weighting eﬀects.
4.1
Prospect Theory-Based Game Formulation
More formally, let (Ξ, A, P) denote a complete measure space and let ξ ∈Ξ
be the stochastic EU’s gas demand. For a subset A of the real, we deﬁne the
indicator function as 1A(y) = 1 if y ∈A; 0 otherwise. In line with [4], we model
the value function υ : R →R describing the (behavioral) value of gains or losses
(i.e., the loss aversion) as a piecewise quadratic function:
υ(y) = (y −ςy2)1{y≥0} + κ(y + ςy2)1{y<0},
(9)
where the parameters 1 ≤κ, ς ≤1 deﬁne the loss aversion tendency in gain
and risk-seeking tendency in loss of a decision-maker. Here, y
def
= y(ξ) denotes
a measurable function of the uncertain demand ξ, hence it is itself a random
variable.
CPT captures the way agents assign a subjective value to the occurrence
probabilities of an event when making decisions under uncertainty. Speciﬁcally,
the expectation of (9) is no longer taken with respect to the true event prob-
abilities, p = P(y ≥0) and 1 −p = P(y < 0), but with respect to a distorted

F. Pokou et al.
probability that typically exacerbates the probability of extreme events. Follow-
ing [9], we model the probability distortion function as:
w(p) = w+(p)1{x≥0} + w−(p)1{x<0},
(10)
where w+(p) =
pγ
(pγ+(1−p)γ)1/γ , w−(p) =
pδ
(pδ+(1−p)δ)1/δ , for 0 < γ, δ ≤1, and w
continuous.
We extend the Expected Utility Theory (EUT) framework from Sect. 3
assuming bounded rationality of EU towards gas supply, by introducing the
probability distortion Q
def
= w♯P where w is deﬁned in 10. We let ξ be the ran-
dom variable measuring EU’s gas demand and we set S(ξ) =
βEU

αEUξ −ξ2

.
For simplicity, under EUT, we assume ξ ∼P where P is deﬁned on a ﬁnite num-
ber of atoms Ξ
def
= {ξk}K
k=1 with pk
def
= P[ξ = ξk], ∀k = 1, ..., K. Moreover, we
deﬁne R(ξ)
def
= ξ −QEU as the stochastic supply shortage. The value function of
interest is as in (9) with y(ξ) = S(ξ) −R(ξ). Note that S(ξ) < R(ξ) can be
interpreted as a supply shortage. The EU’s utility function becomes stochastic
giving JEU(xEU, ξ) = υ(ξ) −pEU,RqR,EU −pEU,AqA,EU for the price-taker struc-
ture and Jv
EU(xEU, ξ) = υ(ξ) in the price-maker structure. EUT and PT-based
games are formulated taken the expectation of JEU and Jv
EU with respect to ξ.
Under EUT, EQ[υ(ξ)] = 
k υ(ξk)pk; while under PT we get:
EQ[υ(ξ)] =

supp(Q)
υ(ξ)dQ(ξ) =

k

S(ξk) −R(ξk) −ς (S(ξk) −R(ξk))2
w+(pk)
+κ

S(ξk) −R(ξk) + ς (S(ξk) −R(ξk))2
w−(pk)

.
The objective functions of Asia and Russia remain the same as in Sect. 3.
Remark 2. Theorems 1–4, Propositions 1–7 can be extended to the PT game
almost everywhere (a.e.) given that the conservative gradient equals the standard
gradient almost everywhere [3].
4.2
Price of Irrationality
Drawing a parallelism with the well-known concept of Price of Anarchy, we
introduce the concept of Price of Irrationality (PoI). Formally, the PoI measures
the loss of eﬃciency due to the bounded rationality of the agents. Let x∗and
y∗be solutions of the EUT and PT-game resp., we deﬁne the PoI as: PoI(G)
def
=


i EP[Ji(x∗
i ,ξ)]


i EP[Ji(y ∗
i ,ξ)]. Since the PT-based equilibrium is based on subjective prospects,
it includes smaller proﬁts than EU-based equilibrium, thus PoI(G) ≥1.
Theorem 5. PoI(G) =


i EP[Ji(xi,ξ)]


Acλ∗2
PT + Bcλ∗
PT + Cc


a.e., where Ac,
Bc, Cc are resp. the sum of the coeﬃcients of the markets’ utility monomials
under bounded rationality and λ∗
PT is the export price in the PT-based game.

TariﬀVersus Sanction Under Bounded Rationality
Proof. Market i’s expected utility evaluated at a NE of G can be written as a
quadratic form which depends on λ∗under EUT and λ∗
PT under PT. Thus, the
PoI can be expressed as a quadratic form in λ∗
PT. Closed-form expressions are
detailed in [7].
□
Similar reasonings apply to PoI(Gτ), PoI(Gτ s) and price-taker structures.
4.3
Numerical Results
We implement the PT-based game on a randomized instance; details about the
model parameters are given in [7]. In Fig. 1, we have represented the utility
of EU, Asia, and Russia assuming bounded rationality of the agents for price-
taker (a), (b) and price-maker (c), (d) models. Under both formulations, we
observe that increasing the sanction towards Russia, increases the EU’s welfare
and severely decreases Russia’s utility. However, Asia is also severely penalized
by this sanction, which can be explained by the rise of the export price.
Fig. 1. PT-game markets’ utility for (a), (b) price-taker agents, (c), (d) price-maker
agents.
In Fig. 2, we have plotted the PoI for price-taker (a) and price-maker (b)
formulations, for a ﬁxed set of PT parameters. We observe that: the less risky
the situation is, the more close to rationality the stakeholders should behave,
and vice-versa; optimum tariﬀalways achieves higher PoI, thus guaranteeing
outcomes closer to the rational setting; there exists a threshold p = 0.5 in (a)

F. Pokou et al.
Fig. 2. PoI for (a) price-taker formulation, (b) price-maker formulation as a function
of p.
and p = 0.53 in (b) above which optimum sanction achieves higher PoI than the
benchmark though remaining below the optimum tariﬀ. This can be explained
by the higher diﬃculty to coordinate stakeholders under the threat of a sanction.
Conclusion
We consider a ﬁnite number of geographic markets involved in gas trading mod-
eled as a non-cooperative game assuming either price-taker or price-maker struc-
ture. We consider three settings: (i) a benchmark model involving neither tar-
iﬀnor sanction; (ii) optimal tariﬀ; (iii) optimal sanction, both on the imports.
Assuming demand is uncertain, we capture the bounded rationality of stakehold-
ers with respect to a potential risk of supply shortage using Cumulative Prospect
Theory. To analyze the outcome of this PT-based game, we introduce a new met-
ric, the Price of Irrationality (PoI), to measure the resulting eﬃciency loss. On
a random instance, we observe that the less risky the situation is, the closer to
rational the stakeholders are, and vice-versa. Furthermore, the optimum tariﬀ
achieves higher PoI, thus guaranteeing outcomes closer to the rational setting.
In an extension, black markets could be considered.
References
1. Arrow, K.J., Debreu, G.: Existence of an equilibrium for a competitive economy.
Econometrica: J. Econometric Soc. 265–290 (1954)
2. Ba¸sar, T., Olsder, G.J.: Dynamic Noncooperative Game Theory. SIAM (1998)
3. Bolte, J., Pauwels, E.: Conservative set valued ﬁelds, automatic diﬀerentiation,
stochastic gradient methods and deep learning. Math. Program. 188, 19–51 (2021)
4. Gazio˘glu, S¸, C¸alı¸skan, N.: Cumulative prospect theory challenges traditional
expected utility theory. Appl. Financ. Econ. 21(21), 1581–1586 (2011)
5. Gros, D.: Optimal tariﬀversus optimal sanction. CEPS Policy Insight (2022)
6. H¨oschle, H., Le Cadre, H., Smeers, Y., Papavasiliou, A., Belmans, R.: An ADMM-
based method for computing risk-averse equilibrium in capacity markets. IEEE
Trans. Power Syst. 33(5), 4819–4830 (2018)

TariﬀVersus Sanction Under Bounded Rationality
7. Pokou, F., Le Cadre, H., Fochesato, M.: Supplementary material for “tariﬀversus
sanction under bounded rationality”. HAL (2024). https://inria.hal.science/hal-
04606536
8. Rosen, J.B.: Existence and uniqueness of equilibrium points for concave n-person
games. Econometrica 520–534 (1965)
9. Tversky, A., Kahneman, D.: Advances in prospect theory: cumulative representa-
tion of uncertainty. J. Risk Uncertain. 5, 297–323 (1992)
10. Yao, J., Adler, I., Oren, S.S.: Modeling and computing two-settlement oligopolistic
equilibrium in a congested electricity network. Oper. Res. 56, 34–47 (2008)

Energy, Generative AI

Forecast Trading as a Means to Reach
Social Optimum on a Peer-to-Peer Market
Ilia Shilov1,3(B), Hélène Le Cadre2, Ana Bušić1, Anibal Sanjab3,
and Pierre Pinson4
1 Inria Paris, DI ENS, CNRS, PSL University, Paris, France
ilia.shilov@inria.fr
2 Université de Lille, Inria, CNRS, Centrale Lille, UMR 9189 - CRIStAL, Lille,
France
3 VITO/EnergyVille, Thorpark 8310, 3600 Genk, Belgium
4 Dyson School of Design Engineering, Imperial College London, London, UK
Abstract. This paper investigates the coupling between a peer-to-peer
(P2P) electricity market and a forecast market to alleviate the uncer-
tainty faced by prosumers regarding their renewable energy sources
(RES) generation. The work generalizes the analysis from Gaussian-
distributed RES production to arbitrary distributions. The P2P trading
is modeled as a generalized Nash equilibrium problem, where prosumers
trade energy in a decentralized manner. Each agent has the option to
purchase a forecast on the forecast market before trading on the elec-
tricity market. We establish conditions on arbitrary probability density
functions (pdfs) under which the prosumers have incentives to purchase
forecasts on the forecast market. Connected with the previous results,
this allows us to prove the economic eﬃciency of the P2P electricity mar-
ket, i.e., that a social optimum can be reached among the prosumers.
Keywords: Mechanism Design · Decentralized Electricity Market ·
Peer-to-peer Market · Forecast Market
Introduction
Decentralization in electricity markets, driven by liberalization, the increase in
renewable energy sources (RES), and the growing role of prosumers, has given
rise to P2P energy markets, in which prosumers negotiate with each other for
energy procurement while minimizing their costs and accounting for the uncer-
tainties in RES generation. This decentralization can lead to more eﬃcient and
ﬂexible energy distribution Le Cadre et al. (2020). However, managing the uncer-
tainties associated with RES generation remains a signiﬁcant challenge Perakis
and Roels (2008), Nair et al. (2014). In traditional energy markets, uncertainties
This paper extends our previous work Shilov et al. (2023) on the integration of forecast
markets with peer-to-peer (P2P) electricity trading by generalizing from Gaussian to
arbitrary distributions.
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 121–130, 2025.
https://doi.org/10.1007/978-3-031-78600-6_11

I. Shilov et al.
faced by end-users are handled by larger entities such as suppliers/retailers, who
can mitigate these uncertainties by managing a large portfolio of users Moret
et al. (2020). However, in decentralized electricity markets, agents must accom-
modate the uncertainty in their generation proﬁles caused by RES, relying on
their forecasts of future uncertain outcomes. Therefore, forecasting is crucial for
making informed decisions in such markets. This aspect has been widely stud-
ied in the literature (see e.g. Petropoulos et al. (2022) for a detailed overview).
The possibility to improve the forecasts needed, using external available data or
forecast mechanisms, leads to the concept of information (or data) markets Agar-
wal et al. (2019). Forecast markets, which aggregate and distribute information
about uncertain future events, have shown promise in improving forecast quality
Wolfers and Zitzewitz (2004), Messner and Pinson (2019). These markets reward
forecasters based on the accuracy of their predictions and their contribution to
improving the client’s utility Raja et al. (2023), Lambert et al. (2008).
Previous research Shilov et al. (2023) introduced a novel coupling of forecast
markets with P2P electricity markets, using Gaussian distributions to model
RES generation uncertainties. This coupling allowed prosumers to purchase fore-
casts in the forecast market modeled after Lambert et al. (2008), Raja et al.
(2023) to improve their trading decisions in the P2P market. The P2P trading
was modeled as a generalized Nash equilibrium problem (GNEP) Harker (1991),
where prosumers’ second-stage decisions depend on their forecasts of RES gen-
eration. This research demonstrated that the impact of forecast updates on a
prosumer’s outcome can be evaluated independently, allowing one to internalize
the utility caused by the forecast update. Furthermore, Shilov et al. (2023) illus-
trated that the economic eﬃciency of the electricity P2P market can be achieved
if prosumers participate in the forecast market. It was shown that the coupling
is individually rational for Gaussian distribution-based forecasts, alongside intu-
ition and numerical evaluation for the general case.
This paper extends the ﬁndings of Shilov et al. (2023) to accommodate arbi-
trary distributions. We generalize the conditions under which market eﬃciency
and individual rationality are achieved when prosumers participate in the fore-
cast market. Extending the theoretical framework to arbitrary distributions, we
establish conditions under which agents have incentives to participate in the
forecast market, ensuring individual rationality. It is remarkable that, for one-
shot game, these conditions depend on the local properties of the forecasts, i.e.
on the local shape of the distributions. These ﬁndings allow us to expand the
previous results supporting the development of eﬃcient P2P markets.
Model
2.1
Peer-to-Peer Electricity Market
We rely on a two-settlement electricity market design consisting of day-ahead
and balancing (real-time) markets. We assume the presence of a backup retailer
from whom the community can purchase energy both in day-ahead (hereafter,
referred to as ﬁrst stage) and in real-time (hereafter, referred to as second stage).

Forecast Trading as a Means to Reach Social Optimum
Fig. 1. Proposed framework overview: red arrows indicate pre-electricity market clear-
ing actions, green indicate post-clearing. (Color ﬁgure online)
Therefore, we ﬁx the buying (b) and selling (s) prices for ﬁrst (or day-ahead pda)
and second (or real time prt) stages, such that prt,b > pda,b > pda,s > prt,s. The
community is seen as a price-taker in the electricity market, hence making the
prices exogenous to this problem, similarly to the model considered in Moret et
al. (2020) (Fig. 1).
Let Γi ⊆N denote the set of neighbors of agent i, which reﬂects the agents
with whom she wants to trade. We denote the trade between agent i and j ∈Γi
as qij (limited with upper-limit κij), where qij is the amount of power i purchases
from (or sells to) j if qij ≥0 (qij ≤0) and impose a bilateral trading reciprocity
constraint qij + qji = 0. Trading cost term is presented in the cost function
as 
j∈Γi cijqij, where parameters cij > 0 represent (product) diﬀerentiation
prices and reﬂect agent i’s preferences for energy trading. Denote di as agent
i’s demand and Δgi as agent i’s renewable energy generation (wind, solar, etc.)
which we assume to be a random variable with a CDF, Fr ∈[0, ∞). In this work,
we do not account for a correlation between agents’ random variables while it
constitutes an important step for a further research. Then, each agent has to
make a trading decision in the ﬁrst stage (day-ahead market) about acquiring
(qda,b
i
) or selling (qda,s
i
) energy at prices pda,b, pda,s respectively. At the second
stage (real-time market), agents settle imbalances after observing the realization
of Δgi for the prices prt,b (buying) and prt,s (selling).
min
qda
i
,qrt
i ,qi
1st stage costs



pda,bqda,b
i
−pda,sqda,s
i
+

j∈Γi
cijqij + E

2nd stage costs



prt,bqrt,b
i
−prt,sqrt,s
i
	
s.t.
qij + qji = 0,
∀j ∈Γi
(1a)
di = Δgi +

j∈Γi
qij + qda,b
i
−qda,s
i
+ qrt,b
i
−qrt,s
i
(1b)
qij ≤κij,
∀j ∈Γi
(1c)
qda,b
i
≥0, qda,s
i
≥0, qrt,b
i
≥0, qrt,s
i
≥0
(1d)
Note, that the expectation of the second stage costs is taken with respect to
a distribution with CDF, Fr, which represents a real distribution of Δgi. Nev-

I. Shilov et al.
ertheless, without full knowledge of this distribution, agent i has access to a
forecast (belief) with CDF Fi about the distribution of Δgi, which she uses for
computing the solution of the problem (1). Detailed description and motivation
for the model can be found in Shilov et al. (2023).
2.2
Coupled Market Model
For the forecast market we adopt a model from Raja et al. (2023), Lambert et
al. (2008). As authors show in [4], this forecast market mechanism enjoys some
desirable properties such as budget-balance, anonymity, sybilproofness, truth-
fulness for the client and an individually rational (IR) for the forecast sellers,
adapted from Lambert et al. (2008). Note that in our study we investigate IR of
the buyers of the forecasts, which is diﬀerent from the latter. We refer to Raja
et al. (2023), Lambert et al. (2008) and Shilov et al. (2023) for more details.
Eﬃciency of the Peer-to-Peer Market. Optimal procurement quantities for
the agents we derived in Shilov et al. (2023) by solving problem (1) as a variant
of stochastic inventory management problem complicated by the peer-to-peer
trading. Below we provide some results from Shilov et al. (2023) concerning
the solution and eﬃciency of the peer-to-peer market that we will use later for
the discussion on individual rationality. First, denote residual after ﬁrst-stage
decisions as ri := di −qda,b
i
+ qda,s
i
−
j∈Γi qij and note that it is non-negative.
We derive the closed-form expression of the optimal procurement strategy in
the presence of day-ahead and real-time contracts in a market with random
renewable generation is
Theorem 1 (Shilov et al. (2023)). The residual ri of agent i after the day-
ahead market is given by
qda,b
i
−qda,s
i
+

j∈Γi
qij = di −F −1
i

pda,b −prt,s −μda,b
i
prt,b −prt,s


= di −F −1
i

pda,s −prt,s + μda,s
i
prt,b −prt,s


= di −F −1
i

cij −prt,s + ζij + ξij
prt,b −prt,s


.
(2)
More precisely,
ri = F −1
pda,b −prt,s
prt,b −prt,s


or
ri = F −1
pda,s −prt,s
prt,b −prt,s


(3)
if agent i purchases (or sells) electricity on the ﬁrst stage.
The result above expresses the agents’ decision on the day-ahead market in
terms of residuals ri, i.e. the quantities representing the additional purchases
that each agent needs to make to balance the uncertainty of the supply after
observing the realization of the renewable generation Δgi. While not providing
the explicit expressions for the decision variables qda,b
i
, qs,da
i
, qij, it is useful for

Forecast Trading as a Means to Reach Social Optimum
further considerations. When designing market rules, it is important to choose
an equilibrium with desirable properties from a set of equilibria (possibly inﬁ-
nite). In our analysis we rely on Generalized Nash Equilibria and its reﬁnement,
Variational Equilibria (VE) as discussed in Kulkarni and Shanbhag (2012).
Deﬁnition 1. A Generalized Nash Equilibrium (GNE) of the game deﬁned by
the problem (1) with coupling constraints, is a vector xi := (qda
i , qrt
i , qi) that
solves problem (1) or, equivalently, a vector xi := (qda
i , qrt
i , qi) such that xi :=
(qda
i , qrt
i , qi) solve the system KKTi for each i.
Deﬁnition 2. A Variational Equilibrium (VE) of the game deﬁned by the maxi-
mization problems (1) with coupling constraints, is a GNE of this game such that,
in addition, the Lagrangian multipliers ζij associated to the coupling constraints
qij + qji = 0 are equal, i.e.:
ζij = ζji,
∀i ∈N, ∀j ∈Γi
(4)
By duality theory, ζij for i ∈N, ∀j ∈Γi can be interpreted as bilateral energy
trading prices Le Cadre et al. (2020). In general, ζij might not be aligned with ζji,
thus leading to non-symmetric energy trading prices between couple of agents.
Relying on VE as solution concepts enforces a natural symmetry in the bilateral
energy price valuations Le Cadre et al. (2020). The conditions on VE existence
are proved in Shilov et al. (2023), where we also demonstrate that the impact of
the forecast update on the prosumer’s outcome on the electricity market can be
evaluated independently of the other prosumers’ forecasts. Thus, it allows us to
endogenize the utility of prosumers brought by the forecast update, which has
been traditionally assumed as an exogenous factor in the literature on forecast
models Raja et al. (2023), Lambert et al. (2008). It was demonstrated that the
eﬃciency of the VE of the electricity peer-to-peer market can be achieved if the
prosumers participate in the forecast market, i.e. social optima can be achieved
if the Market Operator has access to prosumers’ forecasts.
Theorem 2 (Shilov et al. (2023)). Total cost of agent i depends only on the
parameters of agent i. It means that forecast market operator can compute utility
change of agent i without information from the other agents.
Theorem 3 (Shilov et al. (2023)). If all the agents report their forecasts to
the Market Operator (participate in the forecast market), then the VE of (1)
coincides with the set of social welfare optima.
While being a strong assumption, it is mitigated by the fact that we establish
in the next section, more precisely, individual rationality of the coupling between
forecast market and peer-to-peer electricity market. Comparing to Shilov et al.
(2023), in which only the Gaussian distributions were considered, we show that
under mild conditions for arbitrary distributions, agents beneﬁt from purchasing
the forecasts, thus, they have incentive for participation in the forecast market.

I. Shilov et al.
2.3
Individual Rationality
From (2) we obtain that ri = F −1
i
( ζij+cij−prt,s
prt,b−prt,s ), thus, bilateral trading cost
is given by Πq
i = (ζij + cij) 
j∈Γi qij. From KKT conditions we have that
ζij + cij = ci for each j ∈Γi, where ci is some constant speciﬁc for each agent
with pda,s ≤ci ≤pda,b. Then, from (2) we obtain that either ci is equal to pda,b,
if agent i buys energy from the backup retailer, or to pda,s otherwise. It allows
us to ﬁnally write expressions for the total cost imposed on the agent i. First,
consider the case when i buys energy from backup retailer on the day-ahead
market
Πtotal
i
= pda,bqda,b
i
+ pda,b 
j∈Γi
qij + Πsecond
i
= pda,b
di −F −1
i

pda,b −prt,s
prt,b −prt,s

	
+ Πsecond
i
,
(5)
where Πsecond
i
is given by
Πsecond
i
=



prt,briFr(ri) + prt,sri(1 −Fr(ri))
−



prt,b

 ri
0
Δgifr(Δgi)dΔgi −prt,s

 ∞
ri
Δgifr(Δgi)dΔgi,
where Fr (fr) denotes CDF (PDF) of a real distribution of Δgi. It means that
Πtotal
i
gives an expected cost of agent i who takes ri as a ﬁrst stage decision (ri
denotes residual after the ﬁrst stage). Considering the ﬁrst part of the expression:
prt,briFr(ri) + prt,sri(1 −Fr(ri)) = ri(prt,b −prt,s)Fr(ri) + prt,sri
The second part can be expressed as follows, where the expectation with respect
to the real distribution is denoted as Er[·]:
prt,b

 ri
0
Δgifr(Δgi)dΔgi + prt,s

 ∞
ri
Δgifr(Δgi)dΔgi
= prt,bEr[Δgi|Δgi ≤ri]Pr(Δgi ≤ri) + prt,sEr[Δgi|Δgi ≥ri]Pr(Δgi ≥ri)
= prt,bEr[Δgi|Δgi ≤ri]Fr(ri) + prt,sEr[Δgi|Δgi ≥ri](1 −Fr(ri))
= prt,bEr[Δgi] −(prt,b −prt,s)Er[Δgi|Δgi ≥ri](1 −Fr(ri))
Summing it all together:
Πtotal
i
= pda,b[di −ri] + ri(prt,b −prt,s)Fr(ri) + prt,sri −prt,bEr[Δgi]
+ (prt,b −prt,s)Er[Δgi|Δgi ≥ri](1 −Fr(ri)),
(6)
which gives us expected cost of an agent i.
Expression (6) allows us to consider the eﬀects of the forecast market on
the P2P market in an expectation with respect to the real distribution of Δgi.

Forecast Trading as a Means to Reach Social Optimum
First, note that CDF Fr(x) and its PDF fr(x) are deﬁned on x ∈[0, ∞). The
ﬁrst question to answer (and to show the expected rewards of the sellers on
the forecast market) is the deﬁnition of order between distributions. Naturally,
we would like to show that Er[ ˆΠtotal
i
] ≤Er[Πtotal
i
] if distribution ˆFi is “better”
than Fi. Intuitively, for one shot game it should compare two distributions by
the amount of probability mass concentrated around the realization of a random
variable Δgi. It provide us a hint that the comparison should be made by con-
ditioning the distance between distributions. The question on how to choose the
metrics is non-trivial as shown below.
Consider an agent i who has an initial forecast about the distribution of Δgi
with CDF Fi and a ‘better’ forecast with PDF ˆFi. Then, we want to show that
Er[ ˆΠtotal
i
] ≤Er[Πtotal
i
]
(7)
Now, ﬁx prices prt,b > pda,b > pda,s > prt,s and denote ρ := pda,b−prt,s
prt,b−prt,s . Assume
that agent i buys energy on the day-ahead market if she uses Fi or ˆFi or Fr
(this can be expressed as F −1
i
(ρ), ˆF −1
i
(ρ), F −1
r
(ρ) ≤di). Situation in which i
sells energy on the day-ahead market is considered similarly. Moreover, denote
rr
i := F −1
r
(ρ) and ˆri := ˆF −1
i
(ρ).
Denote as Πtotal
r
the cost obtained by the agent i associated with the decision
ri = F −1
r
(ρ), taken when she knows the real distribution Fr. Subtracting it from
both sides of (7), and using (6) we write for the right side of the inequality
Sr := pda,b[rr
i −ri] + prt,s[ri −rr
i ] + (prt,b −prt,s)[riFr(ri) −rr
i Fr(rr
i )]
+ (prt,b −prt,s)

 
 ∞
ri
xfr(x)dx −

 ∞
rr
i
xfr(x)dx

with the left side (Sl) written in the same way but with ˆri instead of ri. Now,
dividing both sides by (prt,b −prt,s), we can write Sr (or Sl if we use ˆFi) as
Sr = ρ[F −1
r
(ρ) −F −1
i
(ρ)] + [F −1
i
(ρ)Fr(F −1
i
(ρ)) −F −1
r
(ρ)Fr(F −1
r
(ρ))]
+

 
 ∞
F −1
i
(ρ)
xfr(x)dx −

 ∞
F −1
r
(ρ)
xfr(x)dx

= F −1
i
(ρ)[Fr(F −1
i
(ρ)) −ρ] +

 F −1
r
(ρ)
F −1
i
(ρ)
xfr(x)dx
Integrating by parts gives
Sr = F −1
i
(ρ)[Fr(F −1
i
(ρ)) −ρ] + F −1
r
(ρ)Fr(F −1
r
(ρ))
−F −1
i
(ρ)Fr(F −1
i
(ρ)) −

 F −1
r
(ρ)
F −1
i
(ρ)
Fr(x)dx =

 F −1
r
(ρ)
F −1
i
(ρ)
(ρ −Fr(x))dx
Thus, we want to prove that

 F −1
r
(ρ)
ˆ
F −1
i
(ρ)
(ρ −Fr(x))dx ≤

 F −1
r
(ρ)
F −1
i
(ρ)
(ρ −Fr(x))dx
(8)

I. Shilov et al.
Assume now that for given ρ,
| ˆF −1
i
(ρ) −F −1
r
(ρ)| ≤|F −1
i
(ρ) −F −1
r
(ρ)|
(9)
which does not immediately guarantee that (8) holds without additional assump-
tions on Fr in the neighbourhood of F −1
r
(ρ). Next we discuss the conditions on
the distributions and ρ such that (7) holds. First, note that ρ = Fr(F −1
r
(ρ)),
thus, inequality clearly holds when F −1
i
(ρ) ≤
ˆF −1
i
(ρ) ≤F −1
r
(ρ) or when
F −1
i
(ρ) ≥ˆF −1
i
(ρ) ≥F −1
r
(ρ). We next assume that ˆF −1
i
(ρ) ≤F −1
r
(ρ) ≤F −1
i
(ρ),
while the opposite case can be considered similarly. In this case with the change
of variables we can rewrite (8) as

 ρ
Fr( ˆ
F −1
i
(ρ))
[F −1
r
(x) −ˆF −1
i
(ρ)]dx ≤

 Fr(F −1
i
(ρ))
ρ
[F −1
i
(ρ) −F −1
r
(x)]dx
(10)
in which the left part is upper-bounded by
 ρ
Fr( ˆ
F −1
i
(ρ))[F −1
r
(ρ)−ˆF −1
i
(ρ)] and the
left part is lower-bounded by
 Fr(F −1
i
(ρ))
ρ
[F −1
i
(ρ) −F −1
r
(ρ)].
Theorem 4. Forecast’s update from Fi to ˆFi decreases agent i’s costs (i.e.
inequality (7) holds) if
1. | ˆF −1
i
(ρ) −F −1
r
(ρ)| ≤|F −1
i
(ρ) −F −1
r
(ρ)|
2.
b−a
c−a
 c
a fr(x)dx ≤
 c
b fr(x)dx,
where a := ˆF −1
i
(ρ), b := F −1
r
(ρ), c := F −1
i
(ρ) and Fr denotes real CDF of Δgi.
Proof. Proof follows from the derivations above. Using the bounds in (10) and
denoting a := ˆF −1
i
(ρ), b := F −1
r
(ρ), c := F −1
i
(ρ) we can write it as
(b −a)[Fr(b) −Fr(a)] ≤(c −b)[Fr(c) −Fr(b)]
(11)
Which can then be transformed into
b −a
c −a

 c
a
fr(x)dx ≤

 c
b
fr(x)dx
(12)
where coeﬃcient K := b−a
c−a ∈(0, 1
2]. This, combined with (9) gives exactly the
conditions of the theorem. Note that the case with F −1
i
(ρ) ≤F −1
r
(ρ) ≤ˆF −1
i
(ρ)
is considered similarly.
⊓⊔
Taking the worst case with K = 1
2, we obtain that the condition for (12)
holds if F ′′
r (x) ≥0 for x ∈[a, c] which represents a suﬃcient condition for (7)
to hold. In the general case, condition (12) deﬁnes the relationship between the
quantiles of the forecasts and CDF of a real distribution of Δgi. This condition
is illustrated in Fig. 2a: blue area should be less than the orange one.

Forecast Trading as a Means to Reach Social Optimum
Fig. 2. Conditions for general and Gaussian distribution (Color ﬁgure online)
Example 1. To illustrate the implications of our result we consider the following
example: let Fr, Fi and ˆFi represent CDFs of Gaussian distributions with means
μr, μi and ˆμi respectively, where ˆμi ≤μr ≤μi and μr −ˆμi ≤μi −μr. Assume
that the variance is the same for all the distributions. For such shifted Gaussian
distributions, condition (12) reduces to the following upper bound:
ρ ≤G(ρ) := μi −μr
μi −ˆμi
Φ
μi −μr
σ
+ Φ−1(ρ)

−ˆμi −μr
μi −ˆμi
Φ
 ˆμi −μr
σ
+ Φ−1(ρ)

,
which can be easily evaluated numerically. Figure 2b demonstrates the values of
G(ρ)−ρ for diﬀerent μr while μi and ˆμi are ﬁxed and are equal to 5 and 2 respec-
tively. The closer ˆμi to μr comparing to μi −μr, the bigger admissible values of
ρ are. For example, when μr = 3 (as in Fig. 2a), condition (12) is satisﬁed with
ρ ≲0.97453. As demonstrated in Shilov et al. (2023), it is possible to obtain
tighter bounds with certain conditions on the distributions, while Theorem 4
provides conditions for arbitrary pdfs.
Conclusion
In this work, we formulated a coupling model between a P2P market and a
forecast market. We addressed existence of incentives for the prosumers to par-
ticipate in the forecast market. In addition, we proved the conditions on the
‘distance’ between the distributions purchase of the forecast leads to decreased
costs. This is a major result which highlights that it is proﬁtable for the pro-
sumers to purchase forecasts and that leads to reaching a social optimum of the
peer-to-peer market.
This paper contributes to a novel direction of exploring the connection
between electricity and forecast markets. One of the promising directions for
further research is to apply the model to real-time markets involving dynamic
prices and uncertainty coming from high share of renewable generation. Con-
tinuing in these directions, we can move towards the most eﬃcient way for the
forecast markets to interact with electricity markets with renewable generation.

I. Shilov et al.
References
Agarwal, A., Dahleh, M., Sarkar, T.: A marketplace for data: an algorithmic solution.
In: Proceedings of the 2019 ACM Conference on Economics and Computation, pp.
701–726. ACM (2019)
Harker, P.T.: Generalized Nash games and quasi-variational inequalities. Eur. J. Oper.
Res. 54(1), 81–94 (1991)
Kulkarni, A.A., Shanbhag, U.V.: On the variational equilibrium as a reﬁnement of the
generalized Nash equilibrium. Automatica 48(1), 45–55 (2012)
Lambert, N.S., et al.: Self-ﬁnanced wagering mechanisms for forecasting. In: Proceed-
ings of the 9th ACM Conference on Electronic Commerce, pp. 170–179. ACM (2008)
Le Cadre, H., Jacquot, P., Wan, C., Alasseur, C.: Peer-to-peer electricity markets:
from variational to generalized Nash equilibrium. Eur. J. Oper. Res. 282(2), 753–
771 (2020)
Messner, J.W., Pinson, P.: Online adaptive lasso estimation in vector autoregressive
models for high dimensional wind power forecasting. Int. J. Forecast. 35, 1485–1498
(2019)
Moret, F., Pinson, P., Papakonstantinou, A.: Heterogeneous risk preferences in
community-based electricity markets. Eur. J. Oper. Res. 287(1), 36–48 (2020)
Nair, J., Adlakha, S., Wierman, A.: Energy procurement strategies in the presence of
intermittent sources. ACM SIGMETRICS Perform. Eval. Rev. 42 (2014)
Perakis, G., Roels, G.: Regret in the newsvendor model with partial information. Oper.
Res. 56, 188–203 (2008)
Petropoulos, F., et al.: Forecasting: theory and practice. Int. J. Forecast. 38, 705–871
(2022)
Raja, A.A., Pinson, P., Kazempour, J., Grammatico, S.: A market for trading forecasts:
a wagering mechanism. Int. J. Forecast. (2023). Accepted/In press
Shilov, I., Le Cadre, H., Bušić, A., Sanjab, A., Pinson, P.: Towards forecast markets for
enhanced peer-to-peer electricity trading. In: 2023 IEEE International Conference
on Communications, Control, and Computing Technologies for Smart Grids (Smart-
GridComm), pp. 1–7 (2023). https://doi.org/10.1109/SmartGridComm57358.2023.
10333930
Wolfers, J., Zitzewitz, E.: Prediction markets. J. Econ. Perspect. 18(2), 107–126 (2004)

An Optimization Setup
of the Decarbonization Problem
in the Transportation Sector
Anthony Couthures1(B), Prunelle Vogler2, Olivier Beaude2,
Samson Lasaulce1,3, and Irinel-Constantin Morarescu1,4
1 Universit´e de Lorraine, CNRS, CRAN, 54000 Nancy, France
anthony.couthures@univ-lorraine.fr
2 EDF Lab’ Paris-Saclay, OSIRIS Department, Palaiseau, France
3 Khalifa University, Abu Dhabi, UAE
4 Automation Department, Technical University of Cluj-Napoca, Cluj-Napoca,
Romania
Abstract. This paper proposes an optimization-based formulation of
the decarbonization problem for the transportation sector, one of the
main sources of CO2 emissions. An important feature of the proposed
approach is that a detailed model is considered i.e., with diﬀerent trans-
portation modes and compositions of the associated ﬂeets of vehicles.
Using real data, this optimization problem is solved numerically under
monetary and CO2 emissions constraints, but also constraints ensuring
the feasibility of the transition. The obtained control actions provide
insights into the transition from existing transportation modes to more
sustainable ones. A discussion is made on the complexity of this problem:
the dependency of resolution time on the budget values is in particular
numerically assessed.
Keywords: Decarbonization · Non-convex Quadratic Programming ·
Resource allocation
Introduction
The imperative to mitigate climate change demands eﬀective decarbonization
strategies at all governance levels. The European Union has set ambitious Green-
House Gas (GHG) reduction targets for 2050, requiring member states to develop
comprehensive national and regional strategies1. GHG emissions are henceforth
measured in CO2 equivalents and will be referred to as CO2 emissions. France
is adopting a decentralized approach in which each region creates and executes
its own decarbonization plan (the so-called “SRADDET”). This decentralization
1 Climate neutrality by 2050, with “Fit for 55” intermediate milestone - with a reduc-
tion of at least 55% of net GHG target by 2030.
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 131–141, 2025.
https://doi.org/10.1007/978-3-031-78600-6_12

A. Couthures et al.
poses signiﬁcant challenges, especially to ﬁnd eﬃcient mechanisms in order to
incentivize the diﬀerent regions to make the proper decarbonization eﬀorts.
Research on decarbonization often focuses on global (world) or local (city)
scales. Globally, strategies involve international treaties and broad policies tar-
geting sector-wide GHG reduction, with analyses ranging from game theory
[1,11] to optimal control [7] and economic impacts [4].
The transportation sector is central to these eﬀorts, due to its substan-
tial CO2 emissions impact2. Studies on decarbonizing transportation are either
macroeconomic model formulations [13,15] or focus on a given aspect, like elec-
tric vehicle charging stations [2], or on a speciﬁc geographic area [5]. Despite
extensive studies, an intermediate-scale approach remains under-explored, even
if critical for harmonizing various transportation modes and ﬂeet compositions
regionally. Our work aims to ﬁll this gap, providing an optimization model for
the private passenger sector, sidestepping the limitations noted in other models
[6,8] with notions of Quality of Service (QoS) and congestion, and allowing sub-
stitution among all transportation modes. Moreover, it provides insight on the
feasibility to meet decarbonization target under monetary constraints.
The main contributions of this paper are: (i) The introduction of a novel
generic optimization model, speciﬁcally designed to target intermediate levels
of analysis within the private passenger sector of a region. This model ﬂex-
ibility allows for adaptation across various geographical scales. (ii) A reﬁned
formulation of QoS for passengers within the transportation sector is proposed,
enhancing the model realism. (iii) The theoretical aspects of the problem are dis-
cussed and reformulated into a form amenable to numerical computation. (iv)
The Optimization Problem (OP) is solved using dedicated nonlinear methods,
and the results are analyzed across realistic scenarios.
The remainder of this paper is structured as follows: Sect. 2 outlines the
transportation model discussed subsequently. Section 3 reformulates the OP as a
Non-Convex Quadratic Problem (NCQP), facilitating eﬀective resolution within
the given context. Section 4 presents simulation results that not only highlight
potential trade-oﬀs important for regional decarbonization strategy design, but
also identify the parameters that most signiﬁcantly aﬀect resolution time.
Problem Formulation
2.1
Decarbonizing Transportation Under Constraints
A tractable decarbonization framework needs to consider a long-term horizon
and a discrete-time dynamics in which the discrete set of sampling times T =
{1, . . . , T} is typically chosen to represent a period of one or few years3. At
each time t ∈T , the region has a desired total level of transportation usage Xt,
measured in passenger.km, which represents the transportation of one passenger
2 About one third of French CO2 emissions in 2023.
3 Public targets granularity e.g., 4 years for French “Strat´egie Nationale Bas-
Carbone”.

Decarbonizing Transportation Sector: As an Optimization Problem
by a particular mode of transportation over one kilometer. Given this desired
transportation usage, the unique decision-maker - referred to hereafter as the
“regional planner” or simply “planner”, is allocated a CO2 emissions budget
Emax
t
. To achieve this target, the planner employs various decarbonization levers
while adhering to a monetary budget limit of Bmax
t
. Under these constraints,
the decarbonization levers have to be activated maximizing the transportation
Quality of Service (QoS), as introduced in Sect. 2.3.
Two
key
aspects
should
be
noted:
(i)
Passenger
(or
“user”)
reac-
tion/behaviour is simply modeled as a mean representative user. In other words,
we do not consider a variety of particular reactions to the decisions of the regional
planner. (ii) The CO2 emissions and monetary budgets are here taken as exoge-
nous parameters.
2.2
Usage, Vehicles and Decarbonization Decision-Making
Modeling
Our model is based on three main ingredients, that are described in the following
paragraphs: the modal usage, the ﬂeet of vehicles and the infrastructure.
Modal Usage Modeling. In addition to the aggregation over users mentioned in
Subsect. 2.1, transportation usage representation is aggregated over both space
(within the region) and time (over the considered time step)4.
Let K = {0, 1, · · · , K} be the set of transportation modes. The mode k = 0
represents the sobriety which corresponds to reduced or avoided travels, encap-
sulating passengers.km that are in fact not spent. The modes k = 1, · · · , K
represent the conventional means of transportation (car, train, bus, etc.). The
primary transportation service metric is xk
t , the transportation usage of mode k
at time t, measured in passengers.km. For a more convenient writing, we intro-
duce the modal share of mode k at t, ˜xk
t , deﬁned by
∀k ∈K, ∀t ∈T ,
xk
t = ˜xk
t Xt,

˜xk
t

k∈K ∈ΔK+1,
(1)
with ΔK+1 denoting the K-dimensional simplex.
A ﬁrst transportation decarbonization lever is now introduced: the modal
switch, with variable βk,l
t , the proportion of mode k replaced by mode l at time
t, inducing the following dynamics for the modal shares:
∀k ∈K, ∀t ∈T ,
˜xk
t+1 = ˜xk
t −

l∈K
βk,l
t
+

l∈K
βl,k
t .
(2)
It is imposed that for all k ∈K, βk,k
t
= 0 at any time t. This shift variable
βk,l
t
corresponds to the facilitation “process” (subsidies, communication, etc.) so
that users are incentivized to switch from k to l.
4 Considering speciﬁcities of diﬀerent seasons, days of weeks, times of days (resp.
geographical locations) are indeed too complex to be integrated in the optimization
setting described hereafter.

A. Couthures et al.
Practical limitations impose to consider lower and upper bounds on modal
switch, as well as on induced modal usage.
∀k, l ∈K, ∀t ∈T ,
0 ≤βk,l
t
≤β
k,l
t,
0 ≤xk
t ≤xk
t ≤xk
t .
(3)
In particular, these bounds allow: (i) Excluding “impossible” travels e.g.,
long-distance walking commute. (ii) Integrating only modal usage changes that
correspond to a gradual transition, without abrupt shift (as new usages adoption
is typically associated to a progressive diﬀusion process [14]).
After introducing modal usage, the vehicle ﬂeet is now described.
Vehicle Fleet Dynamics. Each mode k is associated to a set Ik of vehicle types
aggregated as a ﬂeet. For example, electric or gasoline cars (resp. trains) types
compose the ﬂeet of the car (resp. train) mode. We introduce this distinction to
access the diﬀerent CO2 emissions factors of the diﬀerent types of vehicle. The
number of vehicles of type i at time t is denoted by the variable vi
t. To accom-
modate the needs of diﬀerent transportation modes, there must be a suﬃcient
total number of vehicles - aggregated over the types. Mathematically:
∀k ∈K, ∀t ∈T ,
xk
t ≤

i∈Ik
dirivi
t,
(4)
with the parameters di and ri being the average distance traveled with a vehicle
of type i over the step time and the average occupancy rate of the vehicles in
this ﬂeet.
Regardless of their usage, vehicle ﬂeets undergo dynamic changes through
natural turnover, driven by vehicle lifespan and decay. New vehicles of type
i ∈Ik, added to the ﬂeet during time t, can either be introduced, with variable
θi
t, or replaced with another vehicle j ∈Ik reaching its end of life, with variable
νj,i
t . These variables, θi
t and νj,i
t , which govern the purchase or replacement of
vehicles, are key levers used by the regional planner. Representing the total
number of vehicles of ﬂeet i at the end of t, wi
t is obtained by summing the two
previous quantities:
∀k ∈K, ∀i ∈Ik, ∀t ∈T ,
wi
t = θi
t +

j∈Ik
νj,i
t .
(5)
Note that the main reason to distinguish newly introduced vehicles and replaced
ones is monetary, as these two quantities have a diﬀerent impact on the budget
expressed in (10). Also, it is assumed that vehicles are used until their end-
of-life, of duration τ i, which is assumed to be a deterministic parameter. This
simpliﬁcation: (i) Allows the regional planner to measure all emissions generated
by the usage of vehicles over their lifetime. (ii) Leads to a tractable model. (iii)
Can induce an optimality loss compared to a model where vehicles could exit
or be replaced before their end-of-life. Assessing this optimality loss is left as a

Decarbonizing Transportation Sector: As an Optimization Problem
future perspective. Altogether, the vehicle ﬂeets dynamics expresses:
∀k ∈K, ∀i ∈Ik, ∀t ∈T ,
vi
t+1 = vi
t −wi
t−τ i + wi
t,
(6)
∀k ∈K, ∀i ∈Ik, ∀t ∈T ,
0 ≤θi
t,
0 ≤

j∈Ik
νi,j
t
≤wi
t−τ i .
(7)
After detailing the transportation model’s usage and vehicle ﬂeet dimensions,
the infrastructure is described next.
Infrastructure: At time t and for each transportation mode k ∈K, yk
t is the
variable representing the number of kilometers that the ﬂeet k of vehicles can
travel, measured in vehicles.km. For simplicity, it is assumed that infrastructures
are independent between the diﬀerent modes. For example, cars and buses do
not drive on the “same roads”. Both ﬂeet and infrastructure states are related
through:
∀k ∈K, ∀t ∈T ,

i∈Ik
divi
t ≤yk
t .
(8)
Infrastructures are subject to natural decay from usage and environmental
factors, necessitating regular renewal. Investments can be made to counterbal-
ance this eﬀect. The variable μk
t represents the expansion of the infrastructure
of transportation mode k at time t (another political lever). The dynamics of
infrastructure is then given by:
∀k ∈K, ∀t ∈T ,
yk
t+1 = δkyk
t + μk
t , 0 ≤μk
t ≤μk
t ,
(9)
where 0 < δk ≤1 stands for the depreciation rate of infrastructure of mode k.
The right hand side of constraint (9) accounts for the operational constraints
limiting the capacity increase of an infrastructure, as building time.
The decisions previously presented concerning modal usage, vehicle ﬂeets and
infrastructures are associated to monetary and emissions budget constraints;
they are gathered in the following section.
The decisions regarding modal usage, vehicle ﬂeets, and infrastructure, con-
strained by monetary and emissions budgets, are presented in the next section.
Emissions and Monetary Budgets. Let describe the exogenously set monetary
costs: (i) ck,l
t,switch represents the cost of incentivizing users’ transition from trans-
portation mode k to l e.g., with subsidies for public transportation subscriptions
to make the switch from private vehicles more aﬀordable and csob
t
the cost of
maintaining one kilometer of sobriety; (ii) ci
t,buy (resp. ci,j
t,conv) are the costs of
adding (resp. replacing) one vehicle to the ﬂeet; and (iii) ck
t,inv are the costs of
infrastructure investments.
All these costs provide the monetary budget constraint: ∀t ∈T ,

k∈K

ck
t,invμk
t +

l∈K
ck,l
t,switchβk,l
t Xt+

i∈Ik

ci
t,buyθi
t +

j∈Ik
ci,j
t,convνi,j
t

+x0
tcsob
t
≤Bmax
t
.
(10)

A. Couthures et al.
Moreover, the CO2 emissions budget constraint, is directly expressed by the
vehicle ﬂeets state and the respective emissions factors of the diﬀerent vehicle
types ei:
∀t ∈T ,

k∈K

i∈Ik
dieivi
t ≤Emax
t
.
(11)
In addition to the diﬀerent constraints introduced previously, the following
section describes the objective of the regional planner; it completes the consid-
ered -transportation sector decarbonization - OP deﬁnition.
2.3
Quality of Service (QoS) with Congestion
Transitioning to a decarbonized transportation sector - constrained by monetary
and emissions budgets, the maximization of users QoS is crucial to ensure policy
adoption. Here, the transportation QoS is deﬁned as follows:
QoS(x, y, v) =

k∈K\{0}
qkxk
1 −

i∈Ik
divi
yk

−q0x0,
(12)
where qk > 0 is a weight parameterized to translate user preference for mode
k - emphasizing comfort, accessibility and aﬃnity. Remember that index k = 0
is to represent the sobriety ﬁctive mode, with a speciﬁc treatment regarding
QoS. This formulation also considers the impact of traﬃc congestion with the
multiplication factor 1 −
	
i∈Ik divi
/yk: the closer the distance covered in
mode k, 	
i∈Ik divi, to the associated infrastructure capacity yk, the lower is
this term. Then, the QoS of a mode deteriorates when its ﬂeet is too large for
its infrastructure [10].
Fig. 1. Summary of the transportation sector OP (variables and constraints). All quan-
tities not shown in the diagram are exogenous parameters and are assumed to be known.
2.4
Optimization Problem Formulation
The regional transportation planner’s optimization model aims to maximize QoS
over a planning horizon. It is constrained by monetary and emissions budgets,

Decarbonizing Transportation Sector: As an Optimization Problem
and assumes perfect knowledge of all parameter trajectories. This involves strate-
gic decisions concerning modal usage, vehicle ﬂeet management, and infrastruc-
ture investment. The obtained OP, schematized in Fig. 1, is as follows:
max

t∈T
QoS(xt, yt, vt)
s. t. Modal usage: (1)−(3), Vehicle ﬂeets: (4)−(7), Infrastructure: (8)−(9),
Monetary and CO2 emissions budgets: (10) and (11).
Mathematical Discussion
Our optimization problem is a continuous non-linear and non-convex problem,
which makes it nontrivial to solve. Indeed, this problem is a fractional prob-
lem: all the constraints are linear, and the congestion term in the QoS formu-
lation (12) makes the objective function fractional and non-convex. This prob-
lem can be reformulated as a Non-Convex Quadratic Program (NCQP). We
need to introduce intermediate variables pk
t , and add the quadratic constraints
pk
t yk
t = 	
i∈Ik vi
tdi for all k ∈K and t ∈T . Then, by replacing the fraction by
pk
t in the objective, the QoS function becomes linear.
However, the problem remains inherently non-convex, presenting challenges
in ﬁnding optimal solutions eﬃciently, even more if the horizon is far (T big).
We then use a non-linear solver conducting Spacial Branch and Bound (SBB)
or Outer Approximation approaches. Recall that SBB is an algorithm of global
optimization used to solve Non Linear Problem (NLP) and Mixed-Integer NLP
[9]. At each iteration, a local optimal point is found by solving an NLP as a black-
box. Since NLP is, in general, an NP-hard problem in itself [12], ﬁnding the global
optimum of our non-convex problem is also NP-hard.
In the computations of
Sect. 4, solving our model with a SBB takes longer with higher monetary and
emissions budgets due to a larger set of feasible solutions. In contrast, tighter
budgets allow for quicker optimal solutions. Figure 2 illustrates this, with colors
indicating the time taken to solve, with a 10 s threshold.
Simulation
4.1
Methodology
The code is available at [3]. Simulations use latest data available for the Bre-
tagne region in France. Vehicle usage data and lifespan parameters, vi
t and τ, are
taken from French government transportation statistics [16], while initial modal
shares, xk
0, rely on recent surveys by CEREMA [17]. Emissions factors ei, are
based on data from ADEME’s environmental database [18], and cost parame-
ters, ci,j
··· , are obtained from socio-economic studies by the French Ministry of

A. Couthures et al.
Fig. 2. Computation times and feasibility with parameters as in Sect. 4, x-axis corre-
sponds to the reduction factor applied each year after the ﬁrst year (e.g., 0.90 corre-
sponds to a 10% decrease.). Constrained budget lead to small resolution time.
Ecology [19]. These values are assumed to be constant over time; however, there
are ﬁnancial uncertainties and challenges in accurately determining user prefer-
ences qk parameters. This issue could potentially be addressed through robust
optimization techniques5. Here, assuming constant costs is already conservative.
The Gurobi Solver is employed to solve the OP, chosen for its ability to handle
NCQP and to guarantee optimality6 of the solution by using SBB techniques.
4.2
Optimal Trajectory with Emission and Monetary Budgets
The monetary budget Bmax
t
is constant over time, while emissions budgets Emax
t
decrease by 10% annually, starting from 10% above the initial emissions level.
The modal categories K = {Sobriety, Car, Tramway, Bus, Walking, Biking,
Train} include a diversiﬁed vehicle ﬂeet for “Car” mode, comprising Diesel,
Electric, and Gasoline types ICar = {Diesel, Electric, Gasoline}. QoS coeﬃcients
qk reﬂect the preference hierarchy among the modes, based on initial shares:
car (1.5), tramway (1.2), bus (1), walking (0.5), biking (0.9), and train (1.2),
balancing speed and comfort to mirror realistic preferences. Subsidy costs and
baseline data are sourced from previously mentioned references. Mode shifts β
are capped at 5%, and investments per mode k at time t cannot exceed 10% of
infrastructure at time t −1. Table 1 details emissions and monetary allocations
across diﬀerent budget levels (low and high). Figure 3(a) and Fig. 3(b) depict
5 Introducing an uncertainty set for QoS parameters and setting conservative ﬁnancial
and emission budgets to handle worst-case scenarios.
6 Up to a precision of the gap between the lower and upper bounds of the objective.

Decarbonizing Transportation Sector: As an Optimization Problem
Table 1. Budget Usage and Monetary Distribution for Low and High Budget Scenarios
Low Budget Scenario High Budget Scenario
Budget Used (%)
Budget Used (%)
Emissions (Mteq.CO2) 36.04
33.79 (93.8%) 36.04
33.5 (93.1%)
Monetary (Me)
800 (100%)
8000 (100%)
Allocation between levers
Sobriety
48.16%
1.66%
Modes
23.14%
1.35%
Vehicles
7.86%
85.14%
Infrastructures
20.84%
11.85%
modal share evolution under varying budgets, while Fig. 3(c) and 3(d) display
the respective ﬂeet compositions.
Monetary constraints signiﬁcantly impact transportation choices, promoting
sobriety due to its lower cost despite a reduction in QoS. Under tight budget,
Fig. 3(a) illustrates a marked decline in traditional car usage, oﬀset by increases
in bus, walking, biking, and train modes, which are more cost-eﬀective and less
polluting (due to the need for ﬁnancing cars). Consequently, the car ﬂeet size is
reduced by a third over 15 years, with a notable decrease in gasoline vehicles,
which emit more than diesel, and a slight increase in electric vehicles.
In contrast, the high budget scenario shows minimal sobriety, as seen in
Fig. 3(b) with only marginal reductions in car usage. Cars oﬀer higher service
quality, but ﬂeet modernization to reduce emissions is expensive. Therefore, a
high budget is necessary to maintain private car usage—through infrastructure
investment and a shift to electric vehicles—while meeting decarbonization goals,
as depicted in Fig. 3(d), where the ﬂeet transitions entirely from diesel and gaso-
line to electric, maintaining a stable total vehicle count.
The diﬀerences in budget allocation are highlighted in Table 1. Despite a ten-
fold diﬀerence in available funds, the entire budget is utilized in both scenarios.
In the low-budget scenario, funds mainly compensate for reduced usage and sup-
port modal shifts. In contrast, the high-budget scenario focuses on transitioning
cars from high to low emissions and enhancing infrastructure to improve QoS.

A. Couthures et al.
Fig. 3. Comparison of optimal solution of the two scenarios of Table 1.
Conclusion
This study presents an optimization model tailored for the private passenger
transportation sector at an intermediate scale, typically the one of a region. The
development of this model involved a signiﬁcant modeling work, including the
formulation of assumptions and relationships essential for capturing the com-
plexities of the transportation sector. By reformulating the optimization prob-
lem as a Non-Convex Quadratic Problem, the model eﬀectively balances CO2
emissions and monetary budget constraints. It provides actionable insights for
regional policy planners with an introduced metric of congestion - of vehicles on
transportation infrastructure.
The proposed model has been reformulated to be numerically tractable on
real instances; the resolution being faster for small budget upper bounds. This
observation on computation times is particularly interesting for the next stage
of this research work, enhancing this model into a bi-level problem. This bi-level
framework will include an upper-level decision-maker (e.g., a State) that opti-
mizes both emissions and monetary budgets (imposed to the lower-level agent
considered here). Indeed, this upper level agent will naturally tend to set bud-
get values at low values. This enhancement will allow to capture the dynamics
between diﬀerent levels of decision-making, regional versus national, and provide
deeper insights on optimal decarbonization strategies at a national scale.

Decarbonizing Transportation Sector: As an Optimization Problem
Acknowledgments. This work is supported by the “Programme Gaspard Monge
en Optimisation (PGMO): Decarbonization Eﬀort Sharing Strategies in France”. The
authors thank P. Nogues for his modeling advice, expertise on the subject and providing
some data used in this paper [20].
Disclosure of Interests. The authors have no competing interests to declare that
are relevant to the content of this article.
References
1. Bahn, O., Haurie, A.: A class of games with coupled constraints to model interna-
tional GHG emission agreements. Int. Game Theory Rev. 10(04) (2008)
2. Bouguerra, S., Bhar Layeb, S.: Determining optimal deployment of E.V. charging
stations: case of Tunis City, Tunisia. Case Stud. Transp. Policy 7(3) (2019)
3. Couthures, A.: AnthonyCouthures/Private-Transport-Sector-Optimization-Model:
Zenodo (2024). https://doi.org/10.5281/zenodo.12205178
4. H¨ansel, M.C., et al.: Climate economics support for the UN climate targets. Nat.
Clim. Change 10(8) (2020)
5. Jiang, J., Zhang, D., Meng, Q., Liu, Y.: Regional multimodal logistics network
design considering demand uncertainty and CO2 emission reduction target: a
system-optimization approach. J. Clean. Prod. 248 (2020)
6. Kany, M.S., et al.: Energy eﬃcient decarbonisation strategy for the Danish trans-
port sector by 2045. Smart Energy 5 (2022)
7. Kellett, C.M., Weller, S.R., Faulwasser, T., Gr¨une, L., Semmler, W.: Feedback,
dynamics, and optimal control in climate economics. Ann. Rev. Control 47 (2019)
8. Li, C., Liu, P., Li, Z.: A long-term decarbonisation modelling and optimisation
approach for transport sector planning considering modal shift and infrastructure
construction: a case study of China. Processes 10(7) (2022)
9. Liberti, L.: Introduction to global optimization. Ecole Polytechnique (2008)
10. Maerivoet, S., De Moor, B.: Transp. planning and traﬃc ﬂow models (2005)
11. Mrou´e, B., Couthures, A., Lasaulce, S., Mor˘arescu, I.C.: A quadratic static game
model for assessing the impact of climate change. In: Complex Networks & Their
Applications XII. Springer, Cham (2024)
12. Pardalos, P.M., Schnitger, G.: Checking local optimality in constrained quadratic
programming is NP-hard. Oper. Res. Lett. 7(1) (1988)
13. Pietzcker, R., et al.: Long-term transport energy demand and climate policy: alter-
native visions on transport decarbonization in energy economy models (2013)
14. Rogers, E.M., Singhal, A., Quinlan, M.M.: Diﬀusion of innovations. In: An Inte-
grated Approach to Communication Theory and Research. Routledge (2008)
15. Zhang, R., Hanaoka, T.: Cross-cutting scenarios and strategies for designing
decarb. pathways in the transport sector. Nat. Commun. 13(1) (2022)
16. Ministry of Sustainable Development, “Transportation statistics and analyses”.
https://www.statistiques.developpement-durable.gouv.fr
17. CEREMA, “EMC2: Enquˆetes en cours”. https://www.cerema.fr
18. ADEME, “Base Carbone”. https://base-empreinte.ademe.fr
19. Ministry of Ecology, “Socio-economic costs of transportation”. (2020)
20. Burtin, A., Marteau, F., Nogues, P., Turboult, F.: Vers la neutralit´e carbone en
r´egion `a l’horizon 2050: l’exemple de PACA (2019). La Revue de l’Energie N◦644

Large Language Models Playing Mixed
Strategy Nash Equilibrium Games
Alonso Silva(B)
Nokia Bell Labs, Massy, France
alonso.silva@nokia-bell-labs.com
https://www.bell-labs.com/about/researcher-profiles/alonsosilva/
Abstract. Generative artiﬁcial intelligence (Generative AI), and in par-
ticular Large Language Models (LLMs), has gained signiﬁcant popular-
ity among researchers and industrial communities, paving the way for
the integration of LLMs in diﬀerent domains, such as robotics, tele-
com, and healthcare. In this paper, we study the intersection of game
theory and generative artiﬁcial intelligence, focusing on the capabilities
of LLMs to ﬁnd the Nash equilibrium in games with a mixed strategy
Nash equilibrium and no pure strategy Nash equilibrium (that we denote
mixed strategy Nash equilibrium games). The study reveals a signiﬁcant
enhancement in the performance of LLMs when they are equipped with
the possibility to run code and are provided with a speciﬁc prompt to
incentivize them to do so. However, our research also highlights the limi-
tations of LLMs when the randomization strategy of the game is not easy
to deduce. It is evident that while LLMs exhibit remarkable proﬁciency in
well-known standard games, their performance dwindles when faced with
slight modiﬁcations of the same games. This paper aims to contribute to
the growing body of knowledge on the intersection of game theory and
generative artiﬁcial intelligence while providing valuable insights into
LLMs strengths and weaknesses. It also underscores the need for further
research to overcome the limitations of LLMs, particularly in dealing with
even slightly more complex scenarios, to harness their full potential.
Keywords: Game Theory · LLMs · Generative AI
Introduction
Generative artiﬁcial intelligence (Generative AI) has emerged as a dynamic ﬁeld
within AI, empowering machines with algorithms that enable them to gener-
ate unique content, including music, images, code, text, and human-like con-
versations. One notable example is Large Language Models (LLMs), a spe-
ciﬁc type of Generative AI model that undergoes training on extensive unla-
beled textual datasets. LLMs have demonstrated remarkable abilities in various
domains, including question answering, translation, summarization, code gener-
ation, etc. [7]. Generative AI, and in particular LLMs have gained signiﬁcant
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 142–152, 2025.
https://doi.org/10.1007/978-3-031-78600-6_13

Large Language Models Playing Mixed Strategy Nash Equilibrium Games
popularity among researchers and industrial communities, paving the way for
integrating LLMs in diﬀerent domains, such as robotics [8], telecom [9], and
healthcare [5].
If we take a step back, we notice that in recent years the rapid advancement
of artiﬁcial intelligence and machine learning technologies has led to delegating
an increasing number of tasks to machines. From automated customer service
chatbots to autonomous vehicles, these intelligent systems have demonstrated
remarkable capabilities in handling complex tasks and augmenting human pro-
ductivity. However, as our reliance on those machines grows, it becomes crucial
to comprehend the extent of what we are delegating. LLMs have been employed
in various domains, however amidst their impressive capabilities, it is essential
to acknowledge the potential drawbacks and limitations they possess.
One of the known drawbacks of LLMs is their capacity to randomize (see
for example [4]), therefore we should approach with a certain level of skepticism
their performance on tasks when randomization is a critical factor. In the realm
of game theory, randomization plays a pervasive role. A prime illustration of this
phenomenon is found in the notion of a mixed strategy Nash equilibrium. This
concept entails a strategy wherein a player does not consistently opt for the same
action but rather elects each action with a speciﬁc probability. This element of
uncertainty adds depth and complexity to the strategic decision-making process,
as players strategically allocate their choices based on the likelihood of favorable
outcomes.
In this work, we focus our attention on the capabilities of LLMs to ﬁnd the
Nash equilibrium in games with a mixed strategy Nash equilibrium and no pure
strategy Nash equilibrium (that throughout this work we denote mixed strategy
Nash equilibrium games). For other works, studying LLMs playing games, see
for example [3] and [2]. In particular, we study two classic mixed strategy Nash
equilibrium games: matching pennies and rock, paper, scissors, which we describe
in the following sections. These simple yet universally recognized games provide
an ideal platform to evaluate the LLM capabilities in a controlled environment.
To perform our experiments, we used as LLM the Mistral v0.3 model and the
quantized Hermes-2-Pro-Llama-3-8B, an advanced language model that lever-
ages quantization to improve computational eﬃciency without signiﬁcantly com-
promising performance. We chose this open weights models to ensure that
our experiments are designed and conducted in a manner that allows other
researchers to replicate them accurately. This commitment to reproducibility not
only validates our ﬁndings but also facilitates further research in this area. Our
code can be found on https://github.com/alonsosilvaallende/LLMs_Playing_
MSNE_Games. Another reason to use these models is that one of the key
aspects we use in this paper is the model’s function-calling capabilities. This
feature allows the model to call functions to answer a user’s question. In this
manuscript, we only present the results for the Mistral v0.3 model (for Hermes-
2-Pro-Llama-3-8B the results are similar and can be found in our code).

A. Silva
Matching Pennies Game
2.1
Problem Description
Matching Pennies game is a classic game. It is a two-player zero-sum game,
meaning that any gain by one player is exactly oﬀset by the loss of the other
player. The game works as follows:
• Each player has two possible actions: to play Heads or Tails.
• Both players reveal their choices simultaneously.
• If both choices match (both Heads or both Tails), Player 1 wins. If the choices
do not match (one Heads and one Tails), Player 2 wins.
The payoﬀmatrix of the Matching Pennies game is given by Table 1.
Table 1. Payoﬀmatrix of the Matching Pennies game
Heads Tails
Heads (1, −1) (−1, 1)
Tails (−1, 1) (1, −1)
In the Matching Pennies game, the mixed strategy Nash equilibrium occurs
when each player chooses Heads or Tails with equal probability (50% chance of
Heads and 50% chance of Tails). This is because, given that the other player is
playing a 50–50 strategy, each player’s expected payoﬀis the same regardless of
their own strategy. Therefore, they have no incentive to deviate from the 50–50
strategy, which makes it a Nash equilibrium.
2.2
Game-Playing Capabilities of the LLM Based Purely on its
Pre-existing Knowledge
In this subsection, we investigate the capabilities of the LLM to play the game.
First, we assess the LLM’s ability to recognize the game to see if it is included
in its pre-existing knowledge. To do this we use the following prompt:
PROMPT: What is the mixed strategy Nash equilibrium for the matching
pennies game?
The response generated by the LLM indicates that indeed the Nash Equilib-
rium of this game is included in its pre-existing knowledge:
ANSWER: The Matching Pennies game is a two-player, zero-sum game where
each player secretly chooses either heads (H) or tails (T). If both players
choose the same option, the player who chose ﬁrst wins the coin, and if they
choose diﬀerently, the second player wins.
In a Nash equilibrium, neither player has an incentive to deviate from
their strategy if they believe the other player will stick to theirs. However,
in the Matching Pennies game, there is no pure strategy Nash equilibrium

Large Language Models Playing Mixed Strategy Nash Equilibrium Games
because both players would have an incentive to deviate from their strategies
if they knew what the other player was going to do.
Instead, the Matching Pennies game has a mixed strategy Nash equilib-
rium. In this case, each player should randomly choose heads or tails with
equal probability (0.5). This way, neither player can gain an advantage by
deviating from their random choice, as they have no information about the
other player’s decision.
So, the mixed strategy Nash equilibrium for the Matching Pennies game
is each player choosing H and T with a 50% probability.
We assess the model’s ability to play the game of matching pennies without
any additional instruction. This evaluation is signiﬁcant as it tests the model’s
capacity to comprehend and follow the game’s rules based purely on its pre-
existing knowledge. To do this we use the following prompt:
PROMPT: Respond to the following text with one of the following answers:
‘heads’, ‘tails’. Provide your response in JSON format containing a single
key ‘answer’. Text: Let’s play matching pennies. I have made my choice.
Now, you should make your choice. What do you play?
The idea of using JSON format with a single key is to make the postprocessing
of the LLM’s answers easier (we just need to extract the answer from the JSON
instead of having to search within a potentially long answer which was the action
played by the LLM). This idea was taken from the Scikit-LLM library [1].
We tested 1000 diﬀerent seeds. The probabilities of obtaining Heads or Tails
are given by Table 2.
Table 2. Probabilities of obtaining Heads or Tails in the Matching Pennies game
without any additional instruction.
pHeads 77.9%
pTails 22.1%
We also tested a diﬀerent prompt explicitly telling the LLM to play according
to the mixed strategy Nash equilibrium of the game.
PROMPT: Respond to the following text with one of the following answers:
‘heads’, ‘tails’. Provide your response in JSON format containing a single
key ‘answer’. Text: Let’s play matching pennies. I have made my choice.
Now, you should make your choice. Play according to the mixed strategy
Nash equilibrium. What do you play?
We tested 1000 diﬀerent seeds. The probabilities of obtaining Heads or Tails are
given by Table 3.
The responses generated by the LLM indicate that despite both the Matching
Pennies game and its mixed strategy Nash equilibrium being included in its pre-
existing knowledge, the LLM is unable to play according to this strategy.

A. Silva
Table 3. Probabilities of obtaining Heads or Tails in the Matching Pennies game with
explicit prompt.
pHeads 81.6%
pTails 18.4%
2.3
Let LLMs Run Code
In this subsection, we allow the LLM the possibility to run code. To encourage
the LLM to use this possibility we add the following text to the prompt:
Choose your choice first in valid Python code.
Therefore, we use the following prompt:
PROMPT: Let’s play matching pennies. I have made my choice. Now, you
should make your choice. Choose your choice ﬁrst in valid Python code.
The response generated by the LLM is the following:
import random
choice = random.randint(0,1)
print("Heads" if choice == 0 else "Tails")
This response indicates that despite the LLM being unable to play according
to the mixed strategy Nash equilibrium, it does not have a problem generating
the code to play the game according to the mixed strategy Nash equilibrium.
Therefore, if we allow the LLM to run the code it generated, it indeed plays
the mixed strategy Nash equilibrium.
2.4
Modiﬁed Matching Pennies Game
In this subsection, we consider a modiﬁcation of the Matching Pennies (that
we call the Modiﬁed Matching Pennies game) with the payoﬀmatrix given by
Table 4.
Table 4. Payoﬀmatrix of the Modiﬁed Matching Pennies game
Heads Tails
Heads (7, −1) (−1, 1)
Tails (−1, 1) (1, −1)
In this Modiﬁed Matching Pennies game, the only modiﬁcation is that if both
players choose Heads, the ﬁrst player receives a payoﬀof 7 instead of 1 in the
original matching pennies game. All the other payoﬀs are the same.
The mixed strategy Nash equilibrium of the Modiﬁed Matching Pennies [6]
is given by:

Large Language Models Playing Mixed Strategy Nash Equilibrium Games
• Player 1 plays both options (Heads and Tails) with equal probability 1/2.
• Player 2 plays Heads with probability 1/5 and Tails with probability 4/5.
To make the LLM play the Modiﬁed Matching Pennies Game, we need to be
more explicit on the payoﬀmatrix since the LLM does not know it. We also need
to add to the prompt the phrase “Choose your choice ﬁrst in valid Python code.”
to encourage it to use this possibility. Therefore, we use the following prompt:
PROMPT: Let’s play a modiﬁcation of the Matching Pennies game. More
precisely, each of us has two possible actions: to play Heads or Tails. We
both reveal our choices simultaneously. If both of us play Heads, then I
gain 7 points and you lose 1 point, if both of us play Tails, then I gain 1
point and you lose 1 point. If our choices do not match (one Heads and one
Tails), you gain 1 point and I lose 1 point. I have made my choice. Now,
you should make your choice. What do you play? Choose your choice ﬁrst
in valid Python code.
The response generated by the LLM is the following:
import random
choice = "Heads" if random.randint(0,1) == 0 else "Tails"
print("I have played", choice)
This response is the same as the unmodiﬁed classic Matching Pennies game.
The LLM is unable to ﬁnd the randomization needed to play the mixed strategy
Nash equilibrium of this slightly modiﬁed game.
Rock, Paper, Scissors Game
3.1
Problem Description
The classic game of Rock, Paper, Scissors (RPS) is also a two-player zero-sum
game. The game works as follows:
• Each player has three possible actions: Rock, Paper, or Scissors.
• Both players reveal their choices simultaneously.
• Rock crushes Scissors, Scissors cuts Paper, and Paper covers Rock.
The payoﬀmatrix of the original Rock, Paper, Scissors game is given by
Table 5. Given that payoﬀmatrix, it is well-known that the mixed strategy Nash
equilibrium for this game is for each player to play with equal probability of 1/3
each of the 3 possible actions.
3.2
Game-Playing Capabilities of the LLM Based Purely on its
Pre-existing Knowledge
In this subsection, we investigate the capabilities of the LLM to play the game.
First, we assess the LLM’s ability to recognize the game to see if it is included
in its pre-existing knowledge. To do this we use the following prompt:

A. Silva
Table 5. Payoﬀmatrix of the Rock, Paper, Scissors game
Rock
Paper Scissors
Rock
(0, 0)
(−1, 1) (1, −1)
Paper
(1, −1) (0, 0)
(−1, 1)
Scissors (−1, 1) (1, −1) (0, 0)
PROMPT: What’s the Mixed Strategy Nash equilibrium for the rock, paper,
scissors game?
The response generated by the LLM indicates that indeed the Nash Equilib-
rium of this game is included in its pre-existing knowledge:
ANSWER: In a one-shot Rock, Paper, Scissors (RPS) game between two play-
ers, there is no pure strategy Nash equilibrium because if both players choose
the same strategy, they can be beaten by a deviation to another strategy.
However, in repeated games with perfect information and no bounds on the
number of repetitions, a mixed strategy Nash equilibrium can exist.
In this case, each player randomly chooses their move (rock, paper, scis-
sors) with probabilities that make it unproﬁtable for either player to deviate
from their chosen strategy. One possible set of such probabilities is:
- Player 1 plays rock with a probability of 1/3, paper with a probability
of 1/3, and scissors with a probability of 1/3. - Player 2 plays rock with
a probability of 1/3, paper with a probability of 1/3, and scissors with a
probability of 1/3.
In this mixed strategy Nash equilibrium, neither player has an incentive
to deviate from their chosen strategy because the expected payoﬀfor each
move is the same against every possible move of the other player. This
results in a draw on average, as each player wins approximately one-third
of the games against the other player’s strategies.
We assess the model’s ability to play the rock, paper, scissors game without
any additional instruction. This evaluation is signiﬁcant as it tests the model’s
capacity to comprehend and follow the game’s rules based purely on its pre-
existing knowledge. To do this we use the following prompt:
PROMPT: Let’s play rock, paper, scissors. I have made my choice. Now, you
should make your choice. What do you play?
We tested 1000 diﬀerent seeds. The probabilities of obtaining rock, paper or
scissors are given by Table 6.
We also tested a diﬀerent prompt explicitly telling the LLM to play according
to the mixed strategy Nash equilibrium of the game:
PROMPT: Let’s play rock, paper, scissors. I have made my choice. Now,
you should make your choice. Play according to the mixed strategy Nash
equilibrium. What do you play?

Large Language Models Playing Mixed Strategy Nash Equilibrium Games
Table 6. Probabilities of obtaining Rock, Paper, or Scissors without any additional
instruction
pRock
51.6%
pPaper
0.0%
pScissors 48.4%
We tested 1000 diﬀerent seeds. The probabilities of obtaining rock, paper, or
scissors are given by Table 7.
Table 7. Probabilities of obtaining Rock, Paper, or Scissors without any additional
instruction
pRock
6.7%
pPaper
18.7%
pScissors 74.6%
The responses generated by the LLM indicate that despite both the matching
pennies game and its mixed strategy Nash equilibrium being included in its pre-
existing knowledge, the LLM is unable to play according to this strategy.
3.3
Let LLMs Run Code
In this subsection, similar to the Matching Pennies game, we allow the LLM the
possibility to run code. To encourage the LLM to use this possibility, we use the
following prompt:
PROMPT: Let’s play rock, paper, scissors. I have made my choice. Now, you
should make your choice. Choose your choice ﬁrst in code.
The response generated by the LLM is the following:
import random
choice = ["rock", "paper", "scissors"]
computer_choice = random.choice(choice)
user_input = input("Enter your choice (rock, paper or scissors): ")
if user_input == computer_choice:
print("It’s a tie!")
elif (user_input == "rock" and computer_choice == "scissors") or \
(user_input == "paper" and computer_choice == "rock") or \
(user_input == "scissors" and computer_choice == "paper"):
print("You win!")
else:
print("Computer wins!")

A. Silva
Similar to the case of the Matching Pennies game, this response indicates
that despite the LLM being unable to play according to the mixed strategy
Nash equilibrium, it does not have a problem generating the code to play the
game according to the mixed strategy Nash equilibrium.
3.4
Modiﬁed Rock, Paper, Scissors Game
In this subsection, we consider a modiﬁcation of the Rock, Paper, Scissors game
(that we call the Modiﬁed Rock, Paper, Scissors game) with the payoﬀmatrix
given by Table 8.
Table 8. Payoﬀmatrix of the Modiﬁed Rock, Paper, Scissors game
Rock
Paper Scissors
Rock
(0, 0)
(−2, 2) (1, −1)
Paper
(2, −2) (0, 0)
(−1, 1)
Scissors (−1, 1) (1, −1) (0, 0)
To make the LLM play the Modiﬁed Rock, Paper, Scissors Game, we need to
be more explicit on the payoﬀmatrix since the LLM does not know it. We also
need to add to the prompt the phrase “Choose your choice ﬁrst in valid Python
code.” to encourage it to use this possibility. Therefore, we use the following
prompt:
PROMPT: Let’s play once a modiﬁcation of rock, paper, scissors. More pre-
cisely, if I play rock and you play scissors, then I gain 1 dollar and you lose
1 dollar, if I play scissors and you play paper, then I gain 1 dollar and you
lose 1 dollar, however, if I play paper and you play rock then I gain 2 dollars
and you lose 2 dollars. The same holds by changing our roles. I have made
my choice. Now, you should make your choice. What do you play? Choose
your choice ﬁrst in valid Python code.
The mixed strategy Nash equilibrium of the Modiﬁed Rock, Paper, Scissors
game [6] is given by Table 9.
Table 9. Nash equilibrium strategy for the Modiﬁed Rock, Paper, Scissors game with
payoﬀmatrix given by Table 8
pRock
1/4
pPaper
1/4
pScissors 1/2
The response generated by the LLM is the following:

Large Language Models Playing Mixed Strategy Nash Equilibrium Games
import random
choice = [’rock’, ’paper’, ’scissors’]
user_choice = input(’Enter your choice (rock, paper or scissors): ’)
computer_choice = choice[random.randint(0, 2)]
if user_choice == computer_choice:
print(’It is a tie!’)
elif (user_choice == ’rock’ and computer_choice == ’scissors’) or \
(user_choice == ’scissors’ and computer_choice == ’paper’) or \
(user_choice == ’paper’ and computer_choice == ’rock’):
print(’You lose 1 dollar. The computer plays’, computer_choice)
else:
print(’You win 1 dollar. The computer plays’, computer_choice)
This response is similar to the response of the unmodiﬁed classic Rock, Paper,
Scissors game. The LLM is unable to ﬁnd the randomization needed to play
the mixed strategy Nash equilibrium of this slightly modiﬁed game (nor the
modiﬁcation of the payments).
Conclusions
Our study on the intersection of game theory and generative artiﬁcial intelli-
gence, particularly focusing on Large Language Models (LLMs), has provided
valuable insights into the capabilities and limitations of LLMs in identifying
Nash equilibria in mixed strategy games. Our ﬁndings demonstrate that LLMs
can signiﬁcantly enhance their performance when they are enabled to run code
and are given speciﬁc prompts that encourage this functionality. This capability
allows LLMs to perform well in standard game scenarios where the strategies
are well-deﬁned and well-documented.
However, the study also highlights critical limitations in the adaptability of
LLMs when confronted with games that involve complex randomization strate-
gies or slight modiﬁcations from standard scenarios. In such cases, the perfor-
mance of LLMs noticeably declines, suggesting that while LLMs are proﬁcient
in handling familiar and straightforward game dynamics, their eﬀectiveness is
reduced in more complex or altered game setups.
This research underscores the necessity for ongoing development in the ﬁeld of
generative AI to enhance the robustness and ﬂexibility of LLMs. Future research
should focus on improving the ability of LLMs to handle a broader array of game
types, particularly those that deviate from standard forms, to fully leverage the
potential of LLMs in practical and theoretical applications. Additionally, further
studies are required to explore the integration of advanced machine learning
techniques that could aid LLMs in better understanding and adapting to complex
game strategies.
Overall, our work contributes to the expanding knowledge base at the inter-
section of game theory and artiﬁcial intelligence and opens up new avenues
for research in enhancing the capabilities of generative AI systems in complex
decision-making scenarios.

A. Silva
Acknowledgments. The work presented in this paper has been partially carried out
at LINCS (http://www.lincs.fr).
References
1. Scikit-LLM. https://github.com/koderEngine/scikit-llm
2. Akata, E., Schulz, L., Coda-Forno, J., Oh, S.J., Bethge, M., Schulz, E.: Playing
repeated games with large language models (2023)
3. Brookins, P., Debacker, J.: Playing games with GPT: what can we learn about a
large language model from canonical strategic games? SSRN Electron. J. (2023).
https://api.semanticscholar.org/CorpusID:259714625
4. Hopkins, A.K., Renda, A., Carbin, M.: Can LLMs generate random numbers?
Evaluating LLM sampling in controlled domains. In: ICML 2023 Workshop: Sam-
pling and Optimization in Discrete Space (2023). https://openreview.net/forum?
id=Vhh1K9LjVI
5. Javaid, M., Haleem, A., Singh, R.P.: ChatGPT for healthcare services: an emerging
stage for an innovative perspective. BenchCouncil Trans. Benchmarks Stand. Eval.
3(1), 100105 (2023). https://doi.org/10.1016/j.tbench.2023.100105. https://www.
sciencedirect.com/science/article/pii/S2772485923000224
6. Spaniel, W.: Game Theory 101: The Complete Textbook. CreateSpace Independent
Publishing Platform (2011). https://books.google.de/books?id=4d2xoAEACAAJ
7. Yenduri, G., et al.: GPT (Generative Pre-trained Transformer)-a comprehensive
review on enabling technologies, potential applications, emerging challenges, and
future directions. IEEE Access 12, 54608–54649 (2023). https://api.semanticscholar.
org/CorpusID:258762263
8. Zeng, F., Gan, W., Wang, Y., Liu, N., Yu, P.S.: Large language models for robotics:
a survey (2023)
9. Zou, H., Zhao, Q., Bariah, L., Bennis, M., Debbah, M.: Wireless multi-agent gener-
ative AI: from connected intelligence to collective intelligence (2023)

Short Paper

Analysis of a System with Multiple Caches that Share
Objects
G. Kesidis(B) and N. Alfares
School of EECS, Pennslyvania State University, University Park, PA 16802, USA
{gik2,nna5040}@psu.edu
We consider a caching system of noncooperative proxies (user groups) where each pays
for an allocation of cache memory (and possibly network I/O as well), thus preventing
starvation of any proxy. Objects may be shared among different LRU-lists (each cor-
responding to a proxy) as in [3]. That is, the cost of storing a common object in the
LRUs is shared among the proxies. Also, an LRU-list miss but physical cache hit is
accompanied by a delay corresponding to a physical cache miss. For example, differ-
ent groups of users are “touring” a virtual environment and are using the same cache
(thus are physically proximal), where users of the same group are virtually proximal
(so have temporally correlated demands of the same virtual objects, i.e., objects in their
ﬁelds-of-view).
In [3], the cache blocks some requests selected at random to deter a proxy from
“cheating” by issuing mock requests for speciﬁc content primarily of interest only to
its users in order to keep it cached (hot), while leveraging cached content apportioned
to other proxies, i.e., more generally popular content. Mock queries may change some
near-future LRU-list misses to hits (particularly for content not in the physical cache),
but will come at the cost of additional memory and network I/O resources (possibly
causing some near-future cache misses that would have been hits). So, the free-riding
behavior described in [3] may be disincentivized.
Suppose cache memory is “virtually” allocated so that proxy i ∈{1, 2, ..., J} effec-
tively receives bi ≤B amount of memory. Each partition is managed simply by an
LRU policy. Let P(n) ⊂[J] be the set of proxies for which object n currently appears
in their LRU-list, where P(n) = ∅if and only if object n is not physically cached.
Note that P(n) is not disclosed to the proxies, i.e., the proxies cannot with certainty tell
whether objects not in their LRU-list are in the cache.
Upon request by proxy i for object n of length ℓn, object n will be placed at the head
of i’s LRU-list and all other objects in LRU-list i are demoted in rank. If the request
for object n was a hit on LRU-list i, then nothing further is done. If it was a miss on
LRU-list i, then: if the object is not stored in the physical cache then it is fetched from
the database, stored in the cache and forwarded to proxy i; otherwise, the object is
produced for proxy i after an equivalent delay. Furthermore, i is added to P(n) (as in
[3]), i.e., P(n) ←P(n) ∪{i}, then the length ℓn/|P(n)| is added to LRU-list i and the
“share” of all other caches containing n is reduced to ℓn/|P(n)| (from ℓn/(|P(n)|−1)).
So, if the query for (get request of) object n by proxy i is a miss, its LRU-list length
will be inﬂated and possibly exceed its allocation bi; thus, LRU-list eviction of its tail
This research was supported in part by NSF CNS grants 1526133 and 1717571 and by a Cisco
Systems URP gift.
c
⃝The Author(s), under exclusive license to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, pp. 155–157, 2025.
https://doi.org/10.1007/978-3-031-78600-6

G. Kesidis and N. Alfares
(least recently used) object may be required. When an object m is “LRU-list evicted”
by any proxy, the apportionment of ℓm to other LRU-lists is increased (inﬂated), which
may cause other objects to be LRU-list evicted by other proxies, i.e., a “ripple” eviction
effect [2].
Let λi,k be the mean request rate for object k, of length ℓk, by proxy i. For the IRM
model, a simple generalization of the working-set approximation for variable-length
objects is: if mini bi ≫maxk ℓk then
∀i bi =
N

k=1
hi,kℓk
(1)
where
∀i, k hi,k = 1 −e−λi,kti
(2)
and ti are interpreted as (assumed common) mean eviction times of objects k in LRU-
list i, i.e., the time between when an object enters the cache and when it’s evicted from
the cache.
For our shared caching system, only a fraction of an object k’s length ℓk will be
attributed to a particular LRU-list i, depending on how k is shared over (eviction) time
ti. For all i, k, let this attribution be Li,k ≤ℓk, i.e.,
∀i, bi =
N

k=1
hi,kLi,k =
N

k=1
(1 −e−λi,kti)Li,k.
(3)
One may take
L(1)
i,k = ℓkE
1 + 
j̸=i Zj,k
,
(4)
where Zj,k are independent Bernoulli random variables such that hj,k = P(Zj,k =
1) = 1 −P(Zj,k = 0). That is, under the assumption of independent LRU-lists, L(1)
i,k
is the stationary mean attribution of the length of object k to LRU-list i given that k is
stored in LRU-list i. For example, for a system with just J = 2 caches, i.e., j ∈{1, 2},
E
1 + 
j̸=i Zj,k
= 1 · (1 −h3−j,k) + 1
2h3−j,k = 1 −1
2h3−j,k.
So, substituting (4) into (3) gives, for i ∈{1, 2},
0 = bi −
N

k=1
(1 −e−λi,kti)(1 −1
2(1 −e−λ3−i,kt3−i))ℓk;
a system with two nonlinear equations in two unknowns t1, t2.
Empirically, we found that using (4) gives a good estimate when J > 2, but sig-
niﬁcantly under-estimates the object hitting probabilities, i.e., L(1)
i,k is too large, when
J = 2. To explain this, we argue that object sharing creates a kind of positive associa-
tion between the LRU-list hit events, because hits in one cause the objects to effectively

Analysis of a System with Multiple Caches that Share Objects
reduce in size in others, so that they remain in the LRU-lists longer (larger eviction
times), thus increasing the hit probabilities in others.
Substituting (4) into (3) gives, for i ∈{1, 2, . . . , J},
0 = bi −
N

k=1
hi,kE
1 + 
j̸=i Zj,k
ℓk =: ∂ui
∂ti
=: ∂iui
(5)
Under (2) and EZj,k = hj,k for independent Boolean Zj,k, (5) is a set of J equa-
tions in J unknowns {ti}J
i=1.
Note that for all the above deﬁnitions, ∀i, k, Li,k ≤ℓk, so one expects correspond-
ing hit cache probabilities to be larger than without object-sharing.
A basic assumption is that,
∀i bi < 1
J
N

k=1
ℓk,
(6)
i.e., no LRU-list is large enough to hold all of the objects even if the objects were fully
shared.
Proposition 1. If (6) holds then there are real numbers sj ≥0, Sj < ∞, such that
sj < Sj and there exists a unique solution {ti}J
i=1 ∈J
i=1[si, Si] to (5).
The proof of this result, using a game-theoretic argument, is given in [2] together
with some numerical results and discussions, e.g., regarding overbooking and reducing
ripple evictions. [1] describes a Memcached (MCD) based implementation of a seg-
mented LRU prototype.
References
1. Alfares, N., Kesidis, G., Li, X., Urgaonkar, B., Kandemir, M., Konstantopoulos, T.: On a
caching system with object sharing. In: Proceedings of the ACM International Workshop on
Middleware and Applications for Internet of Things (M4IoT) (2020)
2. Kesidis, G., Alfares, N., Li, X., Urgaonkar, B., Kandemir, M., Konstantopoulos, T.: Working-
set approximation for a caching system with object sharing. https://github.com/PSU-Cloud/
MCD-OS/
3. Pu, Q., Li, H., Zaharia, M., Ghodsi, A., Stoica, I.: FairRide: near-optimal, fair cache sharing.
In: Proceedings of the USENIX NSDI. Santa Clara, CA, USA (2016)

Author Index
A
Akian, Marianne
Alfares, N.
Assaad, Mohamad
B
Beaude, Olivier
Bechler, Aurélien
Bušić, Ana
C
Chardy, Matthieu
Couthures, Anthony
D
Deugoué, Gabriel
Doncel, Josu
3, 47
F
Fiems, Dieter
Fochesato, Marta
G
Gaubert, Stéphane
Guijarro, Luis
H
Hayel, Yezekael
I
Inglés, Lucas
Iriondo, Iratxe
K
Kamhoua, Charles
Kesidis, G.
Kouam, Willie
L
Lasaulce, Samson
Le Cadre, Hélène
104, 121
M
Maillé, Patrick
Morarescu, Irinel-Constantin
N
Ngoufo, Arthur
P
Pinson, Pierre
Pla, Vicent
Pokou, Frédy
Prabhu, Balakrishna J.
R
Rattaro, Claudina
Reiffers-Masson, Alexandre
Rejeb, Hajer
S
Sanjab, Anibal
Shilov, Ilia
Silva, Alonso
T
Tsemogne, Olivier
Tufﬁn, Bruno
V
Vidal, José Ramón
Vogler, Prunelle
Z
Zeroual, Jad
© The Editor(s) (if applicable) and The Author(s), under exclusive license
to Springer Nature Switzerland AG 2025
H. Le Cadre et al. (Eds.): NETGCOOP 2024, LNCS 15185, p. 159, 2025.
https://doi.org/10.1007/978-3-031-78600-6