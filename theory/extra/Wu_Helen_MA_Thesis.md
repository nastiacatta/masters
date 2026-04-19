THE UNIVERSITY OF CHICAGO
Prediction Markets as Sociotechnical
Assemblages
Specialized Competition and the Financialization of Uncertainty
by
Helen Wu
June 2025
A thesis submitted in partial fulfillment of the requirements for the
Master of Arts degree in the Master of Arts Program in the
Committee on International Relations
Faculty Advisor: Dr. Anthony Lee Zhang
Preceptor: Dr. Linnea Turco

i
Abstract
This thesis reconceptualizes prediction markets as sociotechnical assemblages
rather than simple information aggregation mechanisms.
Drawing on empirical
analysis of 489 election contracts on Polymarket, I demonstrate how these markets
operate through structured trader ecologies and hierarchical information flows that
challenge conventional economic understandings. Contrary to efficiency-centered
frameworks that treat prediction markets as neutral aggregators of distributed
knowledge, I show how they function as distinctive social arrangements that dis-
tribute agency across human and non-human elements while creating multiple forms
of value. The assemblage framework reveals how prediction markets achieve fore-
casting accuracy despite systematic inefficiencies, through specialized competition
rather than democratic wisdom aggregation. This theoretical reframing contributes
to economic sociology by illuminating new forms of economic coordination and dig-
ital sociality that emerge through blockchain-based financial platforms.
Keywords: prediction markets, sociotechnical assemblages, distributed agency,
digital sociality, economic sociology, market microstructure, blockchain, financial
forecasting

ii
ACKNOWLEDGMENTS
I extend my sincere gratitude to my faculty advisor, Dr. Anthony Lee Zhang, for his
guidance and expertise on financial markets, and to my preceptor, Dr. Linnea Turco, for
her critical insights and detailed feedback. Special thanks to Professor Dacheng Xiu for
contributions to my econometric methodology, Professor Robert Meister for theoretical
insights on financialization, and Professor Gary Herrigel for perspectives on economic
sociology. I am grateful to the Committee on International Relations at the University of
Chicago and my peers for fostering an environment of rigorous interdisciplinary inquiry.

Contents
Acknowledgments
ii
Introduction
Prediction Markets as Sociotechnical Assemblages
2.1
From Information Aggregation to Specialized Competition
. . . . . . . .
2.2
Institutional Features of Prediction Markets . . . . . . . . . . . . . . . .
2.3
Distributed Agency and Digital Sociality . . . . . . . . . . . . . . . . . .
2.4
Theoretical Positioning . . . . . . . . . . . . . . . . . . . . . . . . . . . .
Microstructural Properties: The Anatomy of Market Inefficiency
3.1
Beyond Random Walks: Systematic Inefficiency in Prediction Markets . .
3.2
The Pennsylvania Senate Election: Anatomy of a Market Failure . . . . .
3.3
Efficient Price Formation or Social Architecture? . . . . . . . . . . . . . .
Trader Ecologies: Structured Relationships in Prediction Markets
4.1
Beyond Homogeneous Rationality: Structured Participant Ecologies . . .
4.2
Extreme Concentration: Elite Dominance in “Democratic” Markets . . .
4.3
Information Hierarchies and Knowledge Flows . . . . . . . . . . . . . . .
Digital Sociality: New Forms of Market-Mediated Interaction
5.1
Pseudonymous Identity Formation: The Construction of Market-Based
Reputations . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
5.2
Market-Mediated Communities and Discourse . . . . . . . . . . . . . . .
5.3
Performative Dimensions: Markets as Reality Creators
. . . . . . . . . .
5.4
The Extended Digital Self in Prediction Markets . . . . . . . . . . . . . .
Conclusion: Reimagining Markets Beyond Efficiency
References
A Methodological Details
A.1 Market Efficiency Testing Methodology . . . . . . . . . . . . . . . . . . .
A.2 Trader Classification Methodology . . . . . . . . . . . . . . . . . . . . . .
A.3 Price Impact and Network Effect Analysis
. . . . . . . . . . . . . . . . .
B Microstructural Analysis Results
C Core Market Analyses
D Comparative Analysis
iii

INTRODUCTION
Who will be the next Pope? Which candidate will win the Australian Prime Minister
election?
How much will the Fed increase interest rates?
Contemporary society in-
creasingly subjects human expectations about the future to processes of financialization.
Events once considered outside the domain of market valuation—from electoral outcomes
to papal selections—are now priced and traded on decentralized prediction markets, where
participants wager on uncertain futures through blockchain-based platforms. This trans-
formation represents what Appadurai terms “the financialization of uncertainty”—the
progressive extension of market logics into domains previously governed by alternative
modes of social coordination and collective judgment.1
The emergence of blockchain-based decentralized prediction markets has dramatically
expanded the scope and significance of this financialization process. On prediction mar-
kets, users purchase tokens representing either “Yes” or “No” for specific questions, with
prices ranging from $0 to $1, functioning as implied probabilities. A contract trading at
$0.75 for “Will Candidate X win the election?” suggests a 75% likelihood of that out-
come occurring, according to the collective judgment of market participants. By the 2024
US Presidential Election, a single prediction market on Polymarket—the largest global
prediction market—had generated over $3.68 billion in trading volume, engaging nearly
88,000 participants—a scale unimaginable in previous prediction market implementations.
This expansion represents a significant evolution from earlier market implementations,
transforming how individuals engage with future uncertainty.2
Conventional accounts frame these markets primarily as information aggregation mech-
anisms—digital extensions of Hayek’s price system that efficiently transform distributed
knowledge into accurate forecasts.3 As Wolfers and Zitzewitz argue, prediction markets
“seem to effectively aggregate dispersed information about likely future events,” provid-
ing probability estimates superior to alternative forecasting methods.4 Similarly, propo-
nents of the “wisdom of crowds” thesis suggest these markets harness collective intel-
ligence through aggregating diverse independent judgments.5 In both frameworks, any
observed inefficiencies or inaccuracies represent temporary technical problems to be re-
solved through increased participation, improved market design, or enhanced liquidity.
The central paradox this thesis explores is how prediction markets achieve forecast-
ing accuracy despite their systemic inefficiencies and extreme participation inequality.
1. Arjun Appadurai, Banking on Words: The Failure of Language in the Age of Derivative Finance
(Chicago: University of Chicago Press, 2016).
2. Michel Aglietta, Money: 5,000 Years of Debt and Power (La Vergne: Verso, 2018).
3. F. A. Hayek, “The Use of Knowledge in Society,” The American Economic Review 35, no. 4 (1945):
519–530.
4. Justin Wolfers and Eric Zitzewitz, “Prediction Markets,” Journal of Economic Perspectives 18, no.
2 (2004): 108.
5. James Surowiecki, The Wisdom of Crowds (Westminster: Knopf Doubleday Publishing Group,
2005).

I argue that prediction markets achieve accuracy not through democratic wisdom ag-
gregation but through specialized competition among elite traders operating within a
distinctive sociotechnical assemblage.
While these markets often produce remarkably
accurate forecasts of electoral outcomes, they do so not through democratic aggregation
of independent judgments—as the wisdom of crowds model would suggest—but through
specialized competition among a small subset of traders who exert disproportionate in-
fluence on price formation. Unlike elections where each voter has equal influence, market
participants have radically unequal impact determined primarily by capital deployment
rather than informational advantage. Yet despite this inequality, these markets often
outperform traditional forecasting methods like polls or expert opinions.
Drawing on a dataset of 489 Polymarket election contracts comprising 9.59 million
transactions from 491,423 unique traders, I demonstrate how these markets operate
through structured competition rather than democratic aggregation. This thesis makes
three principal contributions to economic sociology. First, it reconceptualizes prediction
markets as complex assemblages rather than simple information aggregation mechanisms,
revealing how these markets distribute agency across human and non-human actants.
Second, it provides the first comprehensive microstructural analysis of decentralized pre-
diction markets, demonstrating how these markets operate through structured trader
ecologies and hierarchical information flows rather than democratic participation. Third,
it identifies unique forms of digital sociality that emerge through the configuration of these
markets, including pseudonymous identity formation, market-mediated communities, and
performative relationships between prices and real-world events.
The analysis proceeds in four substantive sections.
The first develops a theoreti-
cal framework for analyzing prediction markets, explaining how these arrangements dis-
tribute agency across human and non-human elements while creating multiple forms of
value. This multidimensional value creation extends beyond simple epistemic functions
to include what Belk terms “identity markers” within digital environments.6 The sec-
ond examines the microstructural properties of prediction markets, demonstrating how
systematic inefficiencies reflect essential characteristics of these markets rather than tem-
porary imperfections. The third analyzes the emergence of structured trader ecologies,
revealing how different participant categories create interdependent relationships within
market environments.
The fourth explores how prediction markets enable new forms
of digital sociality through pseudonymous participation, market-mediated communities,
and performative effects.
By examining prediction markets as sociotechnical assemblages rather than simple
information aggregation mechanisms, this thesis contributes to broader sociological un-
derstandings of how technological infrastructures transform economic coordination in
contemporary society. It challenges efficiency-centered approaches that treat markets as
6. Russell W. Belk, “Extended Self in a Digital World,” Journal of Consumer Research 40, no. 3
(2013): 477–500, https://doi.org/10.1086/671052.

neutral aggregation mechanisms, instead revealing how markets function as social ar-
rangements through their unique microstructural properties.
Table 1. Key Terminology
Term
Definition
Prediction Market
A market where participants trade contracts that pay
out based on the outcome of future events, with prices
functioning as implied probabilities
Decentralized Prediction
Market
Prediction markets operating on blockchain networks
without centralized control or intermediaries
Binary Event Contract
Contract with two possible outcomes (e.g., "Yes"/"No"),
where the winning outcome pays $1 per token and the
losing outcome pays $0
Outcome Token
Digital asset representing a specific outcome that pays $1
if correct and $0 if incorrect
Blockchain
Distributed ledger technology that records transactions
across multiple computers, ensuring transparency and
tamper-resistance
Automated Market
Maker
Algorithmic mechanism that provides continuous
liquidity without requiring traditional market makers
Oracle
System that translates real-world information onto the
blockchain to determine market outcomes
Smart Contract
Self-executing code on blockchain networks that
automatically enforces agreement terms
Sociotechnical
Assemblage
Heterogeneous arrangement of human and non-human
elements that together constitute a distinctive form of
coordination
Market Efficiency
The degree to which prices reflect all available
information, typically measured through statistical tests

PREDICTION MARKETS AS
SOCIOTECHNICAL ASSEMBLAGES
Neoclassical economic approaches to understanding prediction markets have predom-
inantly centered on their capacity for information aggregation and efficient price forma-
tion. The Efficient Market Hypothesis posits that prediction market prices should in-
corporate all available information, making future price movements unpredictable based
solely on past patterns. Similarly, the “wisdom of crowds” thesis suggests that diverse,
independent judgments aggregated through market mechanisms should produce remark-
ably accurate forecasts. These frameworks encounter significant limitations when applied
to decentralized prediction markets. First, they presume uniformly rational actors with
equal market influence, contradicting empirical evidence of extreme concentration among
a small participant subset. Second, they assume independence of judgment when actual
participation demonstrates clear interdependence through cascading information flows.
Third, they conceptualize markets as passive aggregation mechanisms rather than active
social arrangements that transform the phenomena they claim to predict.
The theoretical framework I propose departs from these conventional understandings
in three fundamental ways. First, rather than treating prediction markets as efficient
information processors, I conceptualize them as hybrid arrangements that generate value
through specialized competition among heterogeneous participant types. Second, instead
of assuming that accuracy emerges from the wisdom of crowds, I demonstrate how it
develops through structured information hierarchies dominated by a small subset of elite
traders. Third, rather than focusing solely on the epistemic dimension of these markets,
I examine how they simultaneously function as sites of financial speculation, cultural
meaning-making, and identity formation.
2.1
From Information Aggregation to Specialized Competition
The specialized competition framework I develop explains how prediction markets
achieve forecasting accuracy despite systematic inefficiencies. While classical accounts
assume that market efficiency and forecasting accuracy necessarily coincide, my analysis
reveals a more complex relationship. Prediction markets maintain accuracy not because
they seamlessly incorporate all available information through efficient pricing mecha-
nisms, but because a small subset of informed traders with specialized knowledge exert
disproportionate influence on price formation. These markets generate epistemic value
not through democratic aggregation of distributed knowledge but through competitive
dynamics among specialized participants with different information access, analytical ca-
pabilities, and strategic approaches.
Figure 1 illustrates this sociotechnical assemblage approach to prediction markets,

highlighting the individual components and their interactions:
Figure 1. Components of Prediction Markets as Sociotechnical Assemblages.
Unlike models that reduce markets to either technical mechanisms or social construc-
tions, this approach examines how diverse components—human traders, smart contracts,
oracle systems, interfaces—function together to produce emergent properties that exceed
their individual capacities. This perspective aligns with Callon and Muniesa’s observa-
tion that market calculation emerges through “collective hybrids” rather than discrete
individual decisions.7 It also builds on MacKenzie’s analysis of financial models as per-
formative elements that actively shape market behaviors rather than merely describing
them.8
This perspective resolves the apparent paradox of how prediction markets can produce
accurate forecasts despite exhibiting clear evidence of inefficiency. Unlike efficient market
models that assume random price movements, prediction markets systematically display
particular inefficiency patterns—most notably mean reversion, where price overshoots are
followed by corrections. These patterns reflect the competitive dynamics among different
trader types rather than simple information processing failures. Elite traders exploit these
patterns through sophisticated strategies that simultaneously contribute to price discov-
ery while generating financial returns. The regular occurrence of exploitable inefficiencies
7. Michel Callon and Fabian Muniesa, “Peripheral Vision: Economic Markets as Calculative Collective
Devices,” Organization Studies 26, no. 8 (2005): 1236, https://doi.org/10.1177/0170840605056393.
8. Donald MacKenzie, An Engine, Not a Camera: How Financial Models Shape Markets (Cambridge,
MA: MIT Press, 2006).

creates incentives for informed participation that ultimately enhances forecasting accu-
racy despite departures from technical efficiency. This perspective aligns with Martin’s
analysis of derivatives as social technologies that transform uncertainty into calculable
risk while simultaneously creating new forms of social relations.9
2.2
Institutional Features of Prediction Markets
The historical evolution of prediction markets reflects their progressive expansion
from controlled academic experiments to decentralized global networks. The 1988 Iowa
Electronic Market (IEM), operated by University of Iowa professors, served as an early
template for centralized prediction markets focused on electoral outcomes.10 The IEM
operated under regulatory approval from the Commodity Futures Trading Commission
(CFTC) with strict participation limitations and position size constraints. Despite these
restrictions, it demonstrated remarkable predictive accuracy, correctly forecasting the
winner of every presidential election within its operational period and typically outper-
forming traditional polling methods in estimating vote shares.11
Similarly, corporate prediction markets adopted by firms like Google, Microsoft, and
Ford successfully forecasted commercial outcomes such as product launches and earnings
reports, albeit at limited scale and with participation restricted to employees.12 These
early implementations signaled the budding potential of prediction markets as forecasting
tools but remained fairly limited in both scope and accessibility. Buckley suggests these
early implementations demonstrated the potential of collective intelligence mechanisms
while remaining constrained by traditional financial infrastructures.13
Contemporary prediction markets represent a technical innovation—a heterogeneous
arrangement of human and non-human elements that together constitute a specific form
of economic coordination. This assemblage integrates three key technological innovations
that fundamentally transform how these markets function:
First, automated market makers (AMMs) replace traditional order books with algo-
rithmic pricing mechanisms, creating price impact dynamics that differ fundamentally
from traditional exchanges. By implementing continuous liquidity through mathemati-
cal formulas rather than human market makers, AMMs enable trading on virtually any
9. Randy Martin, Knowledge Ltd: Toward a Social Logic of the Derivative (Philadelphia ; Rome ;
Tokyo: Temple University Press, 2015).
10. Russ Ray, “Prediction Markets and the Financial ’Wisdom of Crowds’,” Journal of Behavioral
Finance 7, no. 1 (2006): 2–4, https://doi.org/10.1207/s15427579jpfm0701_1.
11. Joyce E. Berg, Forrest D. Nelson, and Thomas A. Rietz, “Prediction Market Accuracy in the Long
Run,” International Journal of Forecasting 24, no. 2 (2008): 285–300, https://doi.org /10.1016/j.
ijforecast.2008.03.007.
12. Bo Cowgill and Eric Zitzewitz, “Corporate Prediction Markets: Evidence from Google, Ford, and
Firm X,” The Review of Economic Studies 82, no. 4 (2015): 1309–1341, https://doi.org/10.1093/restud/
rdv014.
13. Patrick Buckley, “Harnessing the Wisdom of Crowds: Decision Spaces for Prediction Markets,”
Business Horizons 59, no. 1 (2016): 85–94, https://doi.org/10.1016/j.bushor.2015.09.003.

Table 2. Evolution of Prediction Market Platforms
Market
Name
Start
Date
Structure
Technical
Architecture
Participation
Constraints
Iowa
Electronic
Markets
(IEM)
Centralized
University server,
manual order
matching
Academic
affiliation, $500
position limit
Corporate
PMs (Google,
Ford)
2005-
Private
Intranet platforms,
centralized databases
Employee-only
participation
Augur
Decentralized
Ethereum blockchain,
fork-based resolution
Global access,
high transaction
costs
Polymarket
Decentralized
Polygon L2, AMM
liquidity, centralized
oracles
Global
pseudonymous
access
Kalshi
Regulated
CFTC-licensed, KYC
compliant
US residence
requirement,
$25,000 position
limit
outcome without requiring balanced participation or institutional intermediaries. This
technological arrangement transforms how market participation occurs, creating specific
opportunities for strategic positioning that would be impossible in traditional market
structures.
Second, blockchain infrastructure enables pseudonymous participation, transparent
transaction records, and tamper-resistant contract enforcement. This technological ar-
rangement fundamentally reshapes market participation by eliminating traditional gate-
keeping mechanisms, enabling unlimited position sizes, and creating permanent public
records of all trading activity. Unlike traditional markets where institutional requirements
limit participation, blockchain-based platforms enable genuinely global, permissionless
access while simultaneously allowing reputation formation through pseudonymous iden-
tities.
Third, oracle systems translate real-world information onto blockchains, enabling au-
tomatic contract settlement without requiring trusted institutional intermediaries. This
technological arrangement transforms how market outcomes are determined, creating new
typologies of authority and adjudication that differ from traditional contract enforcement
mechanisms. Unlike traditional markets where settlement depends on institutional discre-
tion, oracle-based systems create predetermined resolution criteria that execute regardless
of participant preferences or institutional priorities.

Together, these technological elements create not simply an improved version of tradi-
tional prediction markets but a qualitatively different arrangement consisting of economic
coordination and social relationship. This arrangement distributes agency across human
and non-human elements in ways that transform standard conceptions of market partic-
ipation, enabling new forms of digital sociality that differ from both traditional financial
markets and non-market social relations.
Table 3. Comparative Features of Traditional vs. Decentralized Prediction Markets
Feature
Traditional Prediction
Markets
Decentralized Prediction
Markets
Ownership
Structure
Centralized (e.g., university,
corporation)
Distributed across network
participants
Participation
Access
Typically restricted by
geography, affiliation
Global, permissionless access
Market Creation
Controlled by platform
operators
Permissionless (anyone can
create markets)
Settlement
Mechanism
Platform operators determine
outcomes
Oracle systems translate
external events
Transaction
Transparency
Limited visibility into trading
activity
Complete transparency
through blockchain
Regulatory Status
Often operates under
regulatory exemptions
Regulatory ambiguity in many
jurisdictions
2.3
Distributed Agency and Digital Sociality
The sociotechnical character of prediction markets manifests primarily through the
innovative ways these markets distribute agency across human and non-human actants.
Traditional economic frameworks conceptualize market activity as the aggregation of
autonomous individual decisions, with agentic power located primarily in human traders
making rational choices based on private information and preferences. These complex
distributions of agency allow technological components to actively shape market dynamics
rather than merely facilitating human decisions.
In prediction markets, Automated Market Makers (AMMs) determine prices according
to mathematical formulas rather than human judgment, creating characteristic price
impact patterns different from traditional order book markets. Oracle systems exercise
decisive authority in translating real-world events into market outcomes, functioning as
what Latour might term “mediators” rather than passive conduits.14 Smart contracts
14. Bruno Latour, Reassembling the Social: An Introduction to Actor-Network-Theory (Oxford: Oxford
University Press, 2005).

enforce commitment mechanisms without requiring institutional intermediaries, creating
new algorithmic social coordination outside of traditional social means. User interfaces
structure participation possibilities through their design choices, making certain actions
more accessible than others regardless of formal market rules.
This distributed agency fundamentally transforms how prediction markets generate
forecasts. Rather than simple information aggregation through independent human judg-
ments, forecast accuracy emerges through specialized competition among different par-
ticipant types, each exploiting specific features of the market devices. High-frequency
traders leverage the AMM’s mathematical structure to capture small margins on numer-
ous transactions. Information specialists exploit the blockchain’s transparency to identify
and follow influential traders. Retail participants provide capital that enables sophisti-
cated traders to profit from information advantages, creating incentives for informed
participation.
This specialized competition model explains how prediction markets achieve forecast-
ing accuracy despite systematic inefficiencies.15 The market’s structure creates financial
incentives for information revelation through profit opportunities, enabling sophisticated
participants to exert disproportionate influence on price formation based on their informa-
tion or analytical advantages. The regular occurrence of exploitable inefficiencies—rather
than being a defect—actually contributes to market accuracy by ensuring continuous par-
ticipation by information-driven traders seeking profit opportunities.
Beyond distributed agency, prediction markets create new forms of digital sociality
that differ from both traditional financial markets and non-market social relations. The
pseudonymous nature of blockchain participation transforms identity formation by en-
abling experimentation with different trading strategies, interaction styles, and social
positions without established identity constraints. This creates what might be termed
“crypto-identities”—reputation constructions that develop through trading histories and
comment contributions rather than through traditional institutional affiliations or cre-
dentials.
Trading activity itself functions as communication, with transactions serving as social
signals alongside their financial function. Parallel comment sections enable discussions
that create feedback loops between trading behaviors and social interpretations. Market-
mediated communities extend beyond platforms into both digital forums and physical
gatherings organized around prediction market participation. These particular social ar-
rangements transform how participants relate to each other through market mechanisms,
creating what Knorr Cetina and Bruegger term “post-social relations” where markets
themselves become objects of attachment beyond traditional social bonds.16
15. Andrei Shleifer and Robert W. Vishny, “The Limits of Arbitrage,” The Journal of Finance 52, no.
1 (1997): 35–55; Karin Knorr Cetina and Urs Bruegger, “Global Microstructures: The Virtual Societies
of Financial Markets,” American Journal of Sociology 107, no. 4 (2002): 905–950.
16. Knorr Cetina and Bruegger, “Global Microstructures: The Virtual Societies of Financial Markets,”

2.4
Theoretical Positioning
This assemblage framework builds on several theoretical traditions while offering a
new perspective on prediction markets specifically. From economic sociology, it draws on
conceptions of markets as social constructions embedded in cultural systems while em-
phasizing the active role of technological elements in shaping social arrangements.17 From
science and technology studies, it incorporates insights about the distribution of agency
across human and non-human actants while focusing specifically on market environments
rather than technical systems generally.18 From platform studies, it engages with analyses
of how digital infrastructures shape interaction possibilities while examining the typical
characteristics of decentralized rather than centralized platforms.19
The microstructural approach towards prediction markets offers an alternative to both
efficiency-centered approaches that treat prediction markets primarily as information ag-
gregation mechanisms and cultural analyses that emphasize social meaning without at-
tending to technological specificity. Instead, it examines how prediction markets function
as sociotechnical devices that create novel forms of economic coordination and social
relationship through their unique configurations of human and non-human elements.
In particular, I pair a quantitative analysis of market dynamics with a sociological in-
terpretation of trader ecologies, information hierarchies, and forms of digital relations that
characterize these markets in practice. Rather than treating empirical deviations from ef-
ficiency as temporary anomalies, the assemblage framework enables me to examine these
patterns as essential characteristics of how prediction markets function as social arrange-
ments. The subsequent sections demonstrate how this theoretical framework illuminates
the unique properties of prediction markets through systematic empirical analysis.
907.
17. Viviana A. Zelizer, The Social Meaning of Money (New York: Basic Books, 1994).
18. Latour, Reassembling the Social: An Introduction to Actor-Network-Theory.
19. Tarleton Gillespie, “The Politics of ’Platforms’,” New Media & Society 12, no. 3 (2010): 347–364.

MICROSTRUCTURAL PROPERTIES: THE
ANATOMY OF MARKET INEFFICIENCY
Having established prediction markets as sociotechnical assemblages, I now examine
how this framework explains their systematic deviation from efficient market behavior—a
key component of my specialized competition model that challenges wisdom-of-crowds
narratives. This section examines how prediction markets systematically deviate from the
efficient behavior expected by economic theory. By documenting persistent inefficiency
patterns across hundreds of markets, I demonstrate that these deviations reflect funda-
mental characteristics of the sociotechnical assemblage rather than temporary imperfec-
tions or developmental stages. These findings challenge the traditional understanding
of prediction markets as efficient information aggregation mechanisms, instead revealing
how accuracy emerges through specialized competition despite systematic inefficiencies.
3.1
Beyond Random Walks: Systematic Inefficiency in
Prediction Markets
The 2024 US Presidential Election market on Polymarket represents the most devel-
oped prediction market in history—with unprecedented volume ($3.68 billion), extraor-
dinary participation (87,843 traders), and continuous liquidity throughout its 296-day
lifecycle. According to economic theory, this market should display nearly perfect effi-
ciency with prices following a random walk pattern. My analysis reveals a starkly different
reality.20
From my dataset of 489 Polymarket election contracts, I selected six representative
case studies spanning diverse electoral contexts, market sizes, and geographical locations
to examine different prediction environments:
The price movements in this market demonstrate systematic reversals—where signif-
icant price changes in one direction tend to be followed by subsequent movements in
the opposite direction.
Statistical analysis confirms this pattern with high statistical
significance. After controlling for fundamental information changes, the market shows
clear mean reversion rather than the random walks predicted by efficient market the-
ory.
Such deviations align with Whelan’s findings on price formation in commercial
prediction markets, where behavioral factors consistently influence pricing dynamics.21
Mean reversion—the tendency for prices to bounce back after moving too far in one direc-
20. The testing framework examined whether prices follow patterns consistent with weak-form EMH
using: (1) random walk tests; (2) return stationarity tests; (3) autocorrelation analysis; (4) runs tests; and
(5) autoregressive modeling. Markets were classified by composite scores, with none achieving “Highly
Efficient” classification.
21. Karl Whelan, “On Prices and Returns in Commercial Prediction Markets,” Quantitative Finance
23, no. 11 (2023): 1699–1712, https://doi.org/10.1080/14697688.2023.2257756.

Table 4. Selected Case Study Markets
Market
Volume
(USD)
Traders
Duration
Outcome
2024 US Presidential
Election
$3.68 billion
87,843
296 days
Correct prediction
(Trump win)
2025 German
Parliamentary
Election
$134.62
million
37,449
62 days
Correct prediction
(CDU/CSU win)
2024 Pennsylvania
Senate Election
$5.48 million
2,666
217 days
Incorrect
prediction (Casey
win)
2025 Croatia
Presidential Election
$3.14 million
6,742
47 days
Correct prediction
(Milanović win)
2024 San Francisco
Mayoral Election
$7.13 million
1,874
43 days
Correct prediction
(Farrell win)
2024 UK
Parliamentary
Election
$4.24 million
5,302
82 days
Correct prediction
(Labour win)
tion—directly contradicts the efficient market principle that past price movements cannot
predict future changes. These patterns persist throughout the market’s lifecycle despite
extraordinary volume and participation, indicating a structural characteristic rather than
a temporary imperfection.
This inefficiency pattern appears consistently across all markets examined, regardless
of size, geographical context, or electoral type. From the German Parliamentary elec-
tion to smaller contests like the Croatia Presidential race, every market demonstrates
statistically significant deviations from efficiency. Moreover, these inefficiencies follow
remarkably similar patterns across diverse contexts, with negative autocorrelation in re-
turns appearing as the most consistent inefficiency signature.

Figure 2. Efficiency Scores Across Selected Prediction Markets.
What makes these findings particularly significant is their challenge to the funda-
mental premise of prediction markets as efficient information aggregation mechanisms.
According to Hayek’s (1945) influential conception, markets function primarily to coor-
dinate dispersed knowledge, with prices serving as signals that efficiently incorporate all
available information. The inefficiency documented here reveals a more complex real-
ity: prediction markets operate not simply as information aggregation mechanisms but
as social arrangements that generate accurate forecasts through specialized competition
despite persistent inefficiencies.
This observation is profound: despite overall accuracy and large trade volumes, predic-
tion markets overwhelmingly exhibit inefficiencies. Far from being an anomaly, prediction
markets consistently fail to aggregate beliefs by incorporating information advantages into
prices. Instead, these market failures enable sophisticated traders with superior informa-
tion and analytical capabilities to deploy capital. The imperfect and often porous nature
of the markets suggests that the fundamental claims of prediction market proponents
may be incorrect—while the markets are accurate, they do not aggregate the wisdom of
crowds but rather allow for structured competition among a few specialized participants.
3.2
The Pennsylvania Senate Election: Anatomy of a Market
Failure
When and how do prediction markets fail? To understand how prediction markets
operate as novel social platforms, it is instructive to examine instances where they fail.
The Pennsylvania Senate Election market provides a compelling case study of how the
specific market configuration can produce dramatic forecast errors despite substantial
participation and volume.

On November 5, 2024, as vote tallies accumulated in Pennsylvania’s closely watched
Senate race, a remarkable disconnect emerged between electoral reality and market ex-
pectations. Despite Republican Dave McCormick’s growing lead in the vote count, Poly-
market’s prediction contract maintained high confidence in Democratic incumbent Bob
Casey’s reelection, closing at 0.78 (implying a 78% probability of Democratic victory) just
hours before McCormick was declared the winner. This dramatic prediction failure—in a
market with substantial volume ($5.48 million) and participation (2,666 traders)—reveals
how market conditions can produce collective misjudgment.
Three key patterns characterize this market failure, each reflecting how the sociotech-
nical architecture shapes market outcomes:
First, the market exhibited extreme concentration of trading activity, with a Gini co-
efficient of 0.961. Just 21 traders—less than 1% of all participants—contributed over half
of all trading volume. This extraordinary concentration created a market structure dom-
inated by a tiny elite whose trading decisions fundamentally shaped collective outcomes.
Unlike traditional financial markets where regulatory constraints limit concentration, the
decentralized nature of Polymarket enables this extreme inequality as a defining feature
of the market structure.
Second, the market displayed a pronounced divergence in trading strategies between
participant categories. The small group of sophisticated traders maintained balanced
strategic approaches, while retail participants (the vast majority) showed a strong ten-
dency to trade against recent price movements. This contrarian tendency among retail
traders—which appeared in over 60% of their trades—created a persistent bias toward
Casey that sophisticated traders failed to fully counteract.
Third, the market suffered from compressed temporal participation, with trading
activity heavily concentrated in the final days despite a 217-day duration. This temporal
compression meant that early warning signs of a potential McCormick victory received
insufficient attention, while late-stage participation was heavily influenced by pre-existing
price levels rather than fresh information analysis.
Analysis of the market’s comment section reveals a further dimension of the market
within the reciprocal relationship between trading activity and discursive sense-making.
As one participant noted shortly before market resolution: “Bob Casey is way underpriced
in this. Multiple organizations haven’t called yet. McCormick is leading by 36.5k. There
are roughly 100k votes left to count.” This commentary—attempting to rationalize a
position increasingly disconnected from electoral reality—demonstrates how the market
functions not simply as a price formation mechanism but as a site of collective meaning-
making where participants develop narratives to justify trading decisions.
The Pennsylvania case illuminates how prediction markets operate as diverse assem-
blages rather than simple information aggregation mechanisms.
The market’s failure
emerged through collective misjudgment that cannot be understood through efficiency-
centered frameworks. This perspective challenges the traditional viewpoint that treat

such failures as temporary anomalies, instead revealing how market behavior emerges
from the specific characteristics of the microstructure itself.
3.3
Efficient Price Formation or Social Architecture?
If prediction markets exhibit systematic inefficiencies and occasionally fail dramati-
cally, how do they nonetheless achieve impressive forecasting performance across most
electoral contexts? I propose a specialized competition framework to resolve this apparent
paradox.
Markets generate accurate forecasts not through perfect efficiency but through struc-
tured competition among different participant types with complementary functions within
the market ecology.
High-frequency traders provide continuous liquidity and exploit
short-term inefficiencies, creating rapid price adjustments to new information. Active
traders contribute information-driven positioning based on analytical capabilities and
specialized knowledge.
Retail traders, while individually exhibiting strong behavioral
biases, collectively provide capital that enables sophisticated participants to profit from
information advantages, creating incentives for informed participation.
This ecological arrangement creates a market structure where sophisticated partici-
pants can profit from systematically exploiting the behavioral tendencies of retail traders.
Rather than perfect efficiency where no profitable trading strategies exist, prediction mar-
kets maintain a dynamic equilibrium where consistent inefficiencies create profit opportu-
nities that attract institutional traders whose participation enhances price discovery. The
persistence of exploitable patterns—rather than their elimination—actually contributes
to market accuracy by ensuring continuous participation by information-driven traders.
The Pennsylvania Senate case represents a situation where this dynamic equilibrium
temporarily broke down. The combination of trader concentration, retail trader bias, and
compressed temporal participation created conditions where expert traders either failed to
identify the mispricing or lacked sufficient incentive to correct it. While such failures occur
occasionally, the specialized competition framework explains why they remain relatively
rare: the financial incentives for exploiting mispricings generally ensure that significant
information advantages are eventually incorporated into prices, even if the process occurs
through competitive dynamics rather than perfect efficiency.
This perspective fundamentally reframes how we understand prediction market accu-
racy. Rather than assuming that accuracy emerges automatically from crowd wisdom, it
reveals how accuracy depends on specific structural properties of the market assemblage
that enable specialized competition among heterogeneous participant types. Markets that
maintain these properties—balanced trader ecologies, sufficient liquidity, appropriate in-
centive structures—tend to produce accurate forecasts despite systematic inefficiencies.
When these properties break down, as in the Pennsylvania Senate case, market failures
become more likely. These structural characteristics reflect what Guyer terms the “dis-

junctive temporalities” of platform-based financial arrangements, where technical systems
mediate heterogeneous economic practices.22
The empirical evidence of market inefficiency challenges conventional understandings
of prediction markets as primarily information aggregation mechanisms. These ineffi-
ciency patterns reveal how prediction markets function as social arrangements.
The
non-random price behaviors reflect distributed agency, where automated market makers,
blockchain infrastructures, and heterogeneous human participants interact to create sys-
tematic trading patterns that generate accurate forecasts through specialized competition
rather than perfect efficiency.
22. Jane I. Guyer, Legacies, Logics, Logistics: Essays in the Anthropology of the Platform Economy
(Chicago: The University of Chicago Press, 2016).

TRADER ECOLOGIES: STRUCTURED
RELATIONSHIPS IN PREDICTION
MARKETS
The evidence of systematic market inefficiency presented above raises a critical ques-
tion: If prediction markets don’t function through efficient information aggregation, how
do they operate? This section examines the structured trader ecologies that form the
backbone of the specialized competition framework. By identifying distinct participant
types with characteristic behavioral patterns, I demonstrate how specialized competition
among these different trader categories generates accurate forecasts despite extreme par-
ticipation inequality. These findings challenge the wisdom of crowds narrative, instead
revealing how accuracy emerges through hierarchical information flows and strategic in-
teraction among trader types with complementary functions in the market ecology.
4.1
Beyond Homogeneous Rationality: Structured Participant
Ecologies
When a trader known simply as “Théo” began placing massive bets on Trump’s vic-
tory in the 2024 Presidential Election through his pseudonymous accounts, other traders
took notice. By the election’s conclusion, this single pseudonymous trader had accumu-
lated approximately $85 million in profit and achieved almost mythic status in prediction
market communities.23 But was Théo an anomaly, or did his influence reveal something
fundamental about how these markets actually function?
Conventional wisdom portrays prediction markets as democratic aggregators of dis-
persed knowledge—digital town squares where diverse participants contribute equally to
collective intelligence. My analysis reveals a starkly different reality: prediction market
participants occupy ecological niches characterized by specific behavioral patterns, tem-
poral rhythms, and strategic approaches that remain remarkably consistent across diverse
market contexts. Rather than independent agents, they function as interdependent com-
ponents within a structured social system.
Using machine learning clustering techniques applied to behavioral metrics calculated
from transaction data, I identified three distinct trader types with characteristic patterns
that appear consistently across different electoral contexts.24
23. Alexander Osipovich, “Exclusive | Trump Whale Scores $85 Million Windfall on Election,” Wall
Street Journal, November 2024, https://www .wsj.com/finance/trump- whale- scored- 85- million-
windfall-on-election-7c2cd906.
24. Unsupervised learning techniques identified behavioral patterns through k-means clustering of mul-
tidimensional trader features. Silhouette analysis consistently identified three trader categories across
markets.
This data-driven approach revealed ecological structures based on actual market behavior
rather than self-reported intentions.

Table 5. Trader Type Characteristics
Trader Type
Population Volume
Behavioral Signature
Strategic
Tendency
High-Frequency
Traders
19.7%
64.0%
Early entry, continuous
participation
Balanced/Market-
making
Active Traders
37.1%
23.7%
Selective timing,
moderate frequency
Information-
driven
Retail Traders
43.1%
12.3%
Late entry, episodic
participation
Contrarian bias
High-Frequency Traders (HFTs) function as the market’s infrastructure providers,
characterized by early market entry, continuous participation, and extraordinary trad-
ing volume relative to their population size.
In the US Presidential market, these
participants—accounting for just 19.7% of traders but contributing 64.0% of total vol-
ume—maintained balanced strategy distributions and neutral sentiment profiles remi-
niscent of professional market-makers in traditional financial markets.
Their trading
patterns showed sophisticated optimization for capturing small margins on numerous
transactions while maintaining neutral directional exposure, establishing the market’s
fundamental liquidity conditions.
Active Traders occupied an intermediate position, characterized by moderate trading
frequency, strategic market timing, and selective participation during significant infor-
mation events. These traders—representing 37.1% of participants and 23.7% of volume
in the US Presidential market—demonstrated information-driven positioning rather than
pure liquidity provision or momentum following. Their trading approach showed strategic
deployment of capital when they perceived informational advantages rather than contin-
uous participation, functioning as the market’s primary information specialists.
Retail Traders constituted the majority of participants (43.1% in the US Presidential
market) while contributing disproportionately little volume (12.3%). Their behavioral
signature included later market entry, episodic participation, smaller position sizes, and
pronounced contrarian bias. Unlike professional traders who optimize strategies based
on market microstructure, retail participants often traded based on personal beliefs,
emotional responses to events, or simple heuristics.
Their consistent contrarian ten-
dency—appearing in nearly 50% of retail trader transactions across markets—suggests a
systematic behavioral pattern shaped by the prediction market’s unique structure.

Figure 3. Trader Type Distribution Across Selected Markets.
This ecological stratification appeared consistently across diverse electoral contexts,
from the US Presidential Election to smaller regional races like the Croatia Presidential
contest. While the relative proportions varied by market size and context, the fundamen-
tal structure—characterized by specialized niches with behavioral patterns—remained
remarkably stable. This consistency suggests these ecological patterns reflect fundamen-
tal characteristics of the sociotechnical assemblage rather than contextual peculiarities.
The structured ecology fundamentally challenges the wisdom of crowds model that
underpins historical understandings of prediction markets. Rather than equal participa-
tion by independent actors, these markets operate through interdependent relationships
among specialized participant types who fulfill complementary functions within the mar-
ket ecosystem. Each trader category occupies a niche shaped by the specific affordances,
creating a structured market ecology that generates accurate forecasts through specialized
competition rather than democratic aggregation of independent judgments.
4.2
Extreme Concentration: Elite Dominance in
“Democratic” Markets
Prediction markets are often portrayed as democratizing platforms that enable di-
verse participants to contribute equally to collective intelligence regardless of status or
resources. The empirical reality reveals a starkly different picture: these markets op-
erate through extreme concentration of activity among a tiny elite whose trading deci-
sions fundamentally shape collective outcomes. This concentration emerges directly from
the sociotechnical configuration of blockchain-based prediction markets, which enables

unlimited position sizes, pseudonymous participation, and algorithmic pricing without
regulatory constraints.
The 2024 US Presidential Election market—with its unprecedented scale and partic-
ipation—vividly illustrates this concentration. Despite involving nearly 88,000 traders,
the market displayed extraordinary inequality in participation, with a Gini coefficient of
0.943 (where 1.0 represents complete inequality). Just 87 traders—representing 0.1% of
all participants—contributed nearly half (47.9%) of the market’s total volume. The top
1% of traders (878 accounts) accounted for more than two-thirds (69.2%) of all activity,
while the remaining 99% collectively contributed less than a third of total volume.
This extreme stratification appeared consistently across all markets examined, re-
gardless of size, electoral context, or geographical location. The German Parliamentary
election market displayed even more extreme concentration (Gini coefficient 0.980), with
just 51 traders (0.14% of participants) generating over half of trading volume.
Even
smaller regional markets like the Croatia Presidential race showed similar patterns (Gini
coefficient 0.938), though with slightly less concentration (1.80% of traders contributed
50% of volume).
Table 6. Trader Concentration Across Electoral Markets
Market
Gini
Coefficient
% Traders for 50%
Volume
% Traders for 90%
Volume
US Presidential
0.943
0.10% (87 traders)
5.00% (4,392 traders)
German
Parliamentary
0.980
0.14% (51 traders)
2.24% (840 traders)
Pennsylvania
Senate
0.961
0.79% (21 traders)
5.10% (136 traders)
Croatia
Presidential
0.938
1.80% (122 traders)
10.86% (733 traders)
Note: Gini coefficient ranges from 0 (perfect equality) to 1 (perfect inequality).
Values
above 0.9 indicate extreme concentration of trading activity.
These findings reveal a profound irony: blockchain technology, often celebrated for its
democratizing potential, actually enables more extreme concentration than traditional
markets by removing regulatory safeguards like position limits and identity verification
requirements. Rather than creating genuinely democratic participation, these markets
establish new forms of elite dominance through their distinctive technological configura-
tion. Unlike democratic processes where each participant has equal formal influence (one
person, one vote), prediction markets operate through radical inequality where a small
participant subset exercises disproportionate influence over collective outcomes.
The concentration documented here challenges the democratic narrative surrounding
prediction markets, revealing tensions between the theoretical promise of decentralized

technologies and their practical implementation. While blockchain infrastructure theo-
retically enables permissionless participation, the actual patterns of engagement reveal
how technological openness can coincide with extreme social stratification. The absence
of position limits, identity verification requirements, or capital constraints—features of-
ten portrayed as democratizing—actually enables the concentration of influence among a
small participant subset with disproportionate resources or expertise. Unlike traditional
polls, in prediction markets, traders ’vote’ with their wallets—those with outsized capital
influence market expectations far more than the average retail trader.
Contrary to the wisdom of crowds narrative, this elite dominance does not neces-
sarily undermine forecasting accuracy—elite traders often possess superior information
or analytical capabilities—but it fundamentally challenges democratic narratives about
prediction markets as egalitarian knowledge aggregation mechanisms. Rather than wis-
dom emerging from the aggregation of diverse independent judgments, market prices
primarily reflect the positioning of a small trader elite whose decisions ripple through
the market ecosystem through cascade effects. This reality stands in stark contrast to
the idea that portrays prediction markets as harnessing the collective intelligence of di-
verse independent participants. Perhaps these market predictions outperform traditional
polling mechanisms because of—and not in spite—of the unequal trader concentration
across markets.
4.3
Information Hierarchies and Knowledge Flows
The concentration of trading activity is further reinforced by distinct patterns of in-
formation flow through the market ecology. Rather than democratic aggregation of dis-
tributed knowledge, prediction markets operate through information hierarchies where
knowledge cascades from elite traders to broader participant circles through structured
patterns. These hierarchical information flows transform how prediction markets cre-
ate epistemic value, generating forecasts through structured competition rather than
wisdom of crowds. This hierarchical structure resembles what Coleman termed “social
capital”—the capacity to leverage one’s position within networks to achieve desired out-
comes.25 The key distinction is that within prediction markets, this social capital operates
through pseudonymous digital identities rather than traditional status markers, creating
what might be termed “virtual information capital.”
By examining the temporal sequencing of trading activity following significant posi-
tion changes by influential traders, I mapped these information cascades with remarkable
precision. Across all markets analyzed, a consistent pattern emerged: High-Frequency
Traders responded most rapidly to whale activity (average follow time 4.81 minutes in
the US Presidential market), followed by Active Traders (11.97 minutes), and finally
25. James S. Coleman, “Social Capital in the Creation of Human Capital,” American Journal of Soci-
ology 94 (1988): S95–S120.

Retail Traders (7.74 minutes).
This structured sequence—with each trader category
demonstrating characteristic response timing to elite signals—reveals prediction markets
as hierarchical information systems rather than forums for independent judgment aggre-
gation.
This cascade pattern varied systematically by market context, revealing how informa-
tion hierarchies adapt to different environments. In the German Parliamentary election,
High-Frequency Traders exhibited extremely rapid responses to whale activity (1.67 min-
utes average), while Retail Traders showed substantial delays (18.19 minutes). By con-
trast, the Croatia Presidential Election displayed more compressed response timing across
trader categories (6.00, 8.12, and 9.46 minutes respectively), suggesting a less stratified
information environment. These contextual variations reflect how cascade patterns adapt
to different information landscapes.
Table 7. Price Impact Patterns Across Markets
Market
Whale Impact
Non-Whale
Impact
Impact Ratio
US Presidential
−0.0024
+0.0019
−1.285
German
Parliamentary
+0.0030
−0.0033
−0.919
Pennsylvania Senate
+0.0090
−0.0030
−2.690
Croatia Presidential
+0.0310
−0.0056
−5.550
Note: Whale Impact and Non-Whale Impact represent the average price change following
trades by each trader category. Impact Ratio is calculated as Whale Impact divided by
Non-Whale Impact.
The differential price impacts that various trader categories exert provide further evi-
dence of these hierarchies. By tracing price movements following specific trader actions, I
discovered that “whale traders” (the top 1% by volume) demonstrate dramatically differ-
ent market influence than other participants. In the 2024 Presidential Election market,
whale traders exhibited negative price impact (−0.0024), while all other traders showed
positive impact (+0.0019). This counterintuitive pattern—where elite traders’ activities
correlate with price movements opposite to their trading direction—suggests sophisticated
contrarian positioning that fundamentally differs from how retail participants engage with
the market.
These influence patterns varied systematically by market context. While Presiden-
tial Election whale traders demonstrated sophisticated contrarian positioning, smaller
regional market whales showed straightforward positive impacts ranging from +0.0030
(German Parliamentary) to +0.0310 (Croatia Presidential). These striking differences
suggest that elite traders employ context-specific strategies, controlling information flow
differently when operating in different prediction environments.

Table 8. Response Times to Whale Trading Activity (minutes)
Market
High-Frequency
Response
Active Trader
Response
Retail Trader
Response
US Presidential
4.81
11.97
7.74
German
Parliamentary
1.67
9.24
18.19
Pennsylvania Senate
7.83
11.45
13.66
Croatia Presidential
6.00
8.12
9.46
Note: Response time is measured as the average time elapsed between a whale trade and a
following trade by the specified trader category.
What emerges is not a democratic wisdom-of-crowds mechanism where each partici-
pant contributes equally to knowledge creation, but a structured information hierarchy
where signals originate with a small elite group and propagate through the broader mar-
ket ecology.26 The blockchain transparency that enables participants to observe specific
trader behaviors rather than just aggregate price movements creates more direct forms of
observational learning than possible in traditional markets. The AMM pricing mechanism
creates price impact patterns that differ from traditional order book markets, enabling
specific forms of market influence through its mathematical structure.
Figure 4. Hierarchical Information Flow in Prediction Markets.
These cascade patterns align with what DeLong et al. termed “positive-feedback trad-
26. This hierarchical structure has parallels in other market systems but operates through mechanisms
unique to blockchain-based platforms. Cascade patterns remained remarkably consistent across all ana-
lyzed markets despite contextual differences.

ing,” where some market participants systematically follow the trades of others rather
than trading based on independent information.27 However, unlike their model where feed-
back traders follow price trends, the evidence here suggests direct observational learning
where specific participant actions trigger subsequent aligned behavior by others.
These hierarchical information flows fundamentally transform how prediction markets
create epistemic value. Rather than generating forecasts through the averaging of inde-
pendent judgments, these markets operate through structured competition among special-
ized participants with different information access, analytical capabilities, and strategic
approaches. Elite traders with superior information or analytical capabilities establish
price trends that cascade through the market ecosystem, while other participants respond
to these signals with varying levels of acceptance or resistance based on their own infor-
mation sets and strategic positioning. This competitive dynamic can produce remark-
ably accurate forecasts despite—or perhaps because of—its hierarchical structure, as it
enables sophisticated participants to exert disproportionate influence on price formation
while creating financial incentives for information revelation through profit opportunities.
The structured participant ecology, extreme concentration, and hierarchical informa-
tion flows documented in this section reveal prediction markets as social arrangements
that generate accurate forecasts through specialized competition rather than democratic
wisdom aggregation. Unlike conventional accounts that emphasize the wisdom of crowds
through diverse independent judgments, my analysis demonstrates how prediction mar-
kets function through structured trader ecologies with participant niches, concentration
among a small elite, and hierarchical information flows that transform how collective
judgment forms through these markets.
27. J. Bradford DeLong et al., “Noise Trader Risk in Financial Markets,” Journal of Political Economy
98, no. 4 (1990): 703–738.

DIGITAL SOCIALITY: NEW FORMS OF
MARKET-MEDIATED INTERACTION
This section examines how prediction markets function as sites for digital social-
ity. Beyond their epistemic and financial dimensions, these markets enable novel social
arrangements through pseudonymous participation, market-mediated communities, and
performative relationships between prices and real-world events. These social dimensions
transform how participants develop identities, form communities, and create meaning
through market participation, revealing prediction markets as a decentralized technology
that create multiple forms of value beyond simple information aggregation.
5.1
Pseudonymous Identity Formation: The Construction of
Market-Based Reputations
Prediction markets enable novel identity formation through pseudonymous participa-
tion that transforms how status and reputation develop in digital environments. Unlike
traditional financial markets where identity depends on institutional affiliation or creden-
tials, these markets enable identity construction primarily through trading histories and
pseudonymous personas visible on the blockchain. This arrangement creates what might
be termed “algorithmic identities” that develop through market performance rather than
traditional status markers.
The French trader known as “Théo” exemplifies this pseudonymous identity formation.
Operating through accounts including “RepTrump,” “Jenzigo,” and “mikatrade77,” Théo
reportedly made approximately $85 million in profit during the 2024 US Presidential
election and received mainstream coverage from the Wall Street Journal. When asked
about this newfound notoriety, Théo remarked: “To be frank, I’m a bit tired of the
whole thing—I’d like to fade back into my normal daily life.”28 This pattern of digital
identity experimentation aligns with what Yee, Bailenson, and Ducheneaut term the
‘Proteus effect,’ whereby an individual’s behavior and self-perception are transformed by
the characteristics of their digital representation.29
Similarly, during the 2024 US Presidential Election campaign, traders operated under
digital identities like “DJTHolder,” “polywannacracker,” “Treadmilled,” and “Sponge-
Gatorade-Zyn.” Fedorenko, Berthon, and Rabinovich describe such pseudonymous iden-
tity performance as a form of “crowded identity,” where participants curate digital per-
sonas specifically for platform environments.30 These pseudonyms developed substantial
28. Osipovich, “Exclusive | Trump Whale Scores $85 Million Windfall on Election.”
29. Nick Yee, Jeremy N. Bailenson, and Nicolas Ducheneaut, “The Proteus Effect,” Communication
Research 36, no. 2 (2009): 285–312, https://doi.org/10.1177/0093650208330254.
30. Ivan Fedorenko, Pierre Berthon, and Tamara Rabinovich, “Crowded Identity: Managing Crowd-
sourcing Initiatives to Maximize Value for Participants through Identity Creation,” Crowdsourcing,

reputation capital within market communities, with their trading activities closely mon-
itored by other participants seeking market signals. This reputation formation occurs
without traditional institutional validation or certification requirements, creating market-
based status hierarchies that operate independently of social position.
This pseudonymous identity formation transforms how status and reputation develop
in market environments. Rather than relying on traditional credentials or institutional
positions, market participants establish digital personas through consistent trading pat-
terns, comment contributions, and profit performance. These digital identities can accu-
mulate substantial social capital within prediction market communities despite complete
anonymity regarding actual identities. The blockchain’s transparency creates a perma-
nent record of trading history that functions as reputation capital, enabling participants
to build status through market performance rather than external credentials.
This form of identity formation differs substantially from both traditional financial
markets and non-market social relationships. Unlike institutional financial markets where
identity depends on formal credentials and organizational position, prediction markets en-
able identity construction through pseudonymous market participation that can operate
independently of traditional status markers. Unlike social media platforms where iden-
tity performance occurs primarily through content creation, prediction markets enable
identity formation through financial positioning on future events.
5.2
Market-Mediated Communities and Discourse
Beyond individual identity formation, prediction markets enable community devel-
opment through their unique configuration. Each Polymarket event includes a digital
comment section that allows traders to engage in complex social discourse about mar-
ket events, creating interpretive communities that extend beyond simple price formation.
These communities develop distinctive norms, specialized vocabularies, and status hier-
archies that reflect the specific characteristics of the market itself.
Analysis of these comment sections reveals several patterns of market-mediated social-
ity. First, trading positions shape commenting behavior, with participants often justifying
or rationalizing their market positions through commentary. In markets like “Who will
be the next Pope?”, participants engage in heated debates regarding outcomes and ethics,
with sophisticated participants displaying specialized knowledge as a form of status per-
formance. User @thetadecay noted, “can we add a warning for Catholics on this market?
Gambling on papal elections is explicitly punishable by excommunication ,” while another
user offered detailed analysis of papal candidates, demonstrating specialized knowledge
that functioned as status performance within the community.
Second, comments reflect distinct interpretive conflict, where participants develop
competing narratives about market events and price movements. During the Pennsyl-
Business Horizons 60, no. 2 (2017): 155–165, https://doi.org/10.1016/j.bushor.2016.10.002.

vania Senate election, commenters engaged in intense debate about the significance of
voting patterns, with some interpreting early returns as favorable for Casey while oth-
ers emphasized the importance of uncounted rural districts. These interpretive conflicts
reveal prediction markets not simply as price formation mechanisms but as sites of col-
lective meaning-making where participants develop shared understandings of complex
events through discursive interaction.
Third, these market-mediated communities extend beyond digital spaces into physical
gatherings organized around prediction market participation. The Forecasting Meetup
Network hosts monthly gatherings for “prediction markets traders, political gamblers,
and forecasting hobbyists” across major cities, creating physical manifestations of digital
communities formed through market participation. In a recursive demonstration of mar-
ket identity, participants can even bet on attendee numbers for these gatherings through
meta-markets on platforms like Manifold, creating nested layers of identity formation
through the market mechanism itself.
These community structures emerge directly from the sociotechnical configuration of
prediction markets.The phenomenon resembles what Cetina terms “synthetic situations”—
digitally mediated social arrangements creating new interaction possibilities.31 The com-
bination of parallel comment sections that enable interpretive discourse alongside trading,
blockchain transparency for trading histories, and pseudonymous participation together
create these market-mediated communities as emergent properties of the assemblage it-
self.
Unlike traditional financial communities that depend on institutional affiliation,
these communities develop through the specific technological mechanisms of prediction
market platforms, enabling characteristic digital connections that differ from both tradi-
tional market communities and non-market social arrangements.
5.3
Performative Dimensions: Markets as Reality Creators
Prediction markets do not merely forecast future events but potentially influence them
through collective belief formation and performative effects. This performative dimen-
sion transforms markets from passive measurement tools into active participants in the
social construction of reality through their recursive relationship with the events they
claim to predict. This performative dimension extends beyond simple boundary work be-
tween representation and reality, creating what MacKenzie and Munster term “platform
seeing”—new regimes of visualization that emerge through digital mediation.32 Drawing
on performativity theory from economic sociology, my analysis reveals how prediction
markets function as “market devices” that actively reconstitute social reality rather than
31. Karin Knorr Cetina, “The Synthetic Situation: Interactionism for a Global World,” Symbolic In-
teraction 32, no. 1 (2009): 61–87, https://doi.org/10.1525/si.2009.32.1.61.
32. Adrian MacKenzie and Anna Munster, “Platform Seeing: Image Ensembles and Their Invisualities,”
Theory, Culture & Society 36, no. 5 (2019): 3–22, https://doi.org/10.1177/0263276419847508.

merely describing it.33
Evidence of this performativity appears in social media discussions about prediction
market prices. X user @joeyManarinoUS attached a screenshot of Polymarket market
odds and tweeted on April 23, 2025: “The fact that Polymarket has Parolin at 29%
is a disaster for the Church. Parolin would be Francis on steroids and everyone needs
to understand that. Parolin is literally the man that Francis chose to be the Vatican
Secretary of State.” This response demonstrates how prediction prices are interpreted not
merely as forecasts but as signals that potentially influence discourse about the events
they claim to predict.
For electoral outcomes specifically, prediction market prices increasingly function as
focal points in public discourse about election prospects, potentially influencing cam-
paign strategies, donor decisions, and voter behavior through their perceived authority
as probability estimates. Media coverage often treats these prices as objective indicators
rather than socially constructed judgments, amplifying their potential influence on the
events they purport to merely predict. This recursive relationship between market prices
and real-world events creates complex feedback loops that challenge simple conceptions
of prediction markets as neutral measurement tools.
As O’Dwyer writes: “Money links the present to the future. And so the value would
not only measure the likelihood of whether such a thing might happen—it would be a
measure of the collective will of the market to make it happen. The token could call
such a future into being.”34 This perspective emphasizes how markets create complex
feedback loops between prices and real-world events, challenging simple conceptions of
directionality between markets and outcomes.
Rather than simply predicting events,
markets potentially participate in their creation through these performative effects.
This performative dimension transforms how we understand prediction markets as
combinatorial forms of innovation. Beyond their epistemic function as forecasting tools
or their financial function as speculative venues, these markets operate as sites of reality
construction where collective beliefs form through market participation and potentially
influence the events they claim to predict.
This performative aspect transforms how
participants relate to uncertain futures through market mechanisms.
5.4
The Extended Digital Self in Prediction Markets
Perhaps the most distinctive aspect of prediction market sociality involves what can
be termed the “extended digital self”—a form of identity that develops through the pro-
jection of beliefs and expectations onto market structures.
Through participation in
prediction markets, individuals engage in a process of self-externalization, where their
33. Michel Callon, “Introduction: The Embeddedness of Economic Markets in Economics,” The Socio-
logical Review 46, no. S1 (1998): 1–57.
34. Rachel O’Dwyer, Tokens: The Future of Money in the Age of the Platform (London New York:
Verso, 2023), 156.

judgments about uncertain futures become concrete financial positions visible to others.
This process transforms how participants relate to both future events and their own be-
liefs, creating novel forms of identity expression that differ fundamentally from traditional
polling or social media participation.
This externalization process manifests in several ways.
First, prediction markets
clearly delineate the boundary space between environment and agent.
The natural
world, by becoming something tradeable and priced, becomes ’outside’ of the agent it-
self—creating dis-entanglement from reality by assuming that it exists on a separate
layer. This separation enables people to trade on outcomes they may not personally de-
sire but expect to occur, creating a separation between personal preference and market
expectations.
Second, the continuous monitoring of prices creates a shared simulation of reality
accessible to anyone anywhere as a type of universal ’language’ of the commons. A user
from Japan will observe the same election prediction as another user from Australia, then
form their own reactions based on the same set of information flows. This form of digital
sociality distinguishes prediction markets from prior forms of distributed communication
channels that remain largely localized due to language barriers, distribution constraints,
and time-lags.
Finally, prediction markets enable the separation of personal preference from prob-
abilistic judgment, allowing participants to trade on outcomes they may not personally
desire but expect to occur.
This separation creates cognitive distancing that differs
from both traditional market participation and non-market social expression.
Unlike
traditional financial markets, prediction market traders imbue a significant part of their
identity into the market—requiring participants to “put their money where their mouth
is” in ways that transform how beliefs are expressed and validated. This commitment
mechanism differs fundamentally from other forms of opinion expression like polling or
social media posting, creating what might be termed “financialized belief expression.”
This ontological liquidity means that markets are non-objective in the sense that
their network composition (prices, participants, depth) constantly changes rather than
remaining static. Participants engage with a continuously evolving system that repre-
sents collective belief formation in real time. The distinctive social patterns documented
in this chapter—comment section dynamics, pseudonymous identity formation, market-
mediated communities, and performative dimensions—reveal these markets as sites where
new forms of social relation emerge through technologically mediated interaction.
The extended digital self in prediction markets operates through a fundamental trans-
formation in how participants relate to their own beliefs and expectations. Unlike polls
where opinions are expressed without financial consequences, or traditional financial mar-
kets where positions reflect investment strategies rather than explicit probability judg-
ments, prediction markets create a new form of commitment where participants financially
back their beliefs about future events. This arrangement creates what might be termed

“identity risk”—where being wrong not only carries financial penalties but also threatens
the participant’s reputation and self-conception as a knowledgeable forecaster.
This analysis of digital sociality in prediction markets demonstrates how they reshape
social relationships beyond simple information aggregation. The pseudonymous identity
formation, market-mediated communities, performative effects, and extended digital self
documented in this section reveal prediction markets as complex social arrangements
that transform how participants relate to uncertain futures, to each other, and to their
own beliefs and expectations. Understanding these social dimensions is essential for com-
prehending how prediction markets function beyond their simple epistemic or financial
aspects.

CONCLUSION: REIMAGINING MARKETS
BEYOND EFFICIENCY
This thesis has reconceptualized prediction markets as sociotechnical assemblages that
achieve accuracy through specialized competition rather than democratic wisdom aggre-
gation. My analysis of 489 Polymarket election contracts reveals three fundamental in-
sights: first, these markets maintain remarkable forecasting accuracy despite systematic
inefficiencies that contradict efficient market theory; second, they operate through ex-
treme concentration of trading activity among a tiny elite rather than broad popular par-
ticipation; and third, they create distinctive forms of digital sociality that transform how
participants construct identities and form communities. These findings challenge both
efficiency-centered economic approaches and democratic wisdom-of-crowds narratives, in-
stead revealing how prediction markets function as distinctive social arrangements that
distribute agency across human and non-human elements while creating multiple forms
of value. The extreme concentration documented here aligns with Pistor’s analysis of
how digital platforms simultaneously democratize access while enabling unprecedented
concentration of influence.35
The theoretical implications of this research extend beyond prediction markets to
broader transformations in how technological systems mediate economic coordination
and social life. By reconceptualizing markets as cultural, social, and economic assem-
blages that distribute agency across human and non-human elements, this framework
contributes to economic sociology, platform studies, science and technology studies, and
discussions of financialization. As McAfee and Brynjolfsson argue, the reconfiguration
of economic coordination through digital platforms represents a fundamental shift in
how collective judgment forms in contemporary society.36 Future research should extend
this analysis to other prediction domains beyond elections, conduct comparative stud-
ies across different platforms with idiosyncratic technological characteristics, and combine
transaction analysis with qualitative methods to access participant intentions and motiva-
tions directly. As blockchain-based platforms enable financial trading on previously non-
financialized events, understanding how these markets function as social arrangements
becomes increasingly important for comprehending the changing relationship between
economic coordination, knowledge production, and identity formation in contemporary
society.
The framework developed in this thesis reveals prediction markets not as neutral in-
formation aggregation mechanisms but as specialized competition arrangements that gen-
erate multiple forms of value through their particular sociotechnical configuration. This
35. Katharina Pistor, “Rule by Data: The End of Markets?,” Law and Contemporary Problems, 2020,
101–124.
36. Andrew McAfee and Erik Brynjolfsson, Machine, Platform, Crowd: Harnessing Our Digital Future,
First edition (New York: W.W. Norton & Company, 2017),

perspective challenges both traditional economic approaches that emphasize efficiency
and democratic narratives that emphasize wisdom of crowds, instead illuminating how
market accuracy emerges from the structured interaction of heterogeneous participants
within a specific technological environment. By examining prediction markets through
this lens, we gain insight into not just these specific platforms but broader transforma-
tions in how economic coordination and social relationships evolve through technological
mediation in the digital age.

REFERENCES
Aglietta, Michel. Money: 5,000 Years of Debt and Power. La Vergne: Verso, 2018.
Appadurai, Arjun. Banking on Words: The Failure of Language in the Age of Derivative
Finance. Chicago: University of Chicago Press, 2016.
Belk, Russell W. “Extended Self in a Digital World.” Journal of Consumer Research 40,
no. 3 (2013): 477–500. https://doi.org/10.1086/671052.
Berg, Joyce E., Forrest D. Nelson, and Thomas A. Rietz. “Prediction Market Accuracy
in the Long Run.” International Journal of Forecasting 24, no. 2 (2008): 285–300.
https://doi.org/10.1016/j.ijforecast.2008.03.007.
Buckley, Patrick. “Harnessing the Wisdom of Crowds: Decision Spaces for Prediction
Markets.” Business Horizons 59, no. 1 (2016): 85–94. https://doi.org/10.1016/j.
bushor.2015.09.003.
Callon, Michel. “Introduction: The Embeddedness of Economic Markets in Economics.”
The Sociological Review 46, no. S1 (1998): 1–57.
Callon, Michel, and Fabian Muniesa. “Peripheral Vision: Economic Markets as Calculative
Collective Devices.” Organization Studies 26, no. 8 (2005): 1229–1250. https://doi.
org/10.1177/0170840605056393.
Cetina, Karin Knorr. “The Synthetic Situation: Interactionism for a Global World.” Sym-
bolic Interaction 32, no. 1 (2009): 61–87. https://doi.org/10.1525/si.2009.32.1.61.
Coleman, James S. “Social Capital in the Creation of Human Capital.” American Journal
of Sociology 94 (1988): S95–S120.
Cowgill, Bo, and Eric Zitzewitz. “Corporate Prediction Markets: Evidence from Google,
Ford, and Firm X.” The Review of Economic Studies 82, no. 4 (2015): 1309–1341.
https://doi.org/10.1093/restud/rdv014.
DeLong, J. Bradford, Andrei Shleifer, Lawrence H. Summers, and Robert J. Waldmann.
“Noise Trader Risk in Financial Markets.” Journal of Political Economy 98, no. 4
(1990): 703–738.
Fama, Eugene F. “Efficient Capital Markets: A Review of Theory and Empirical Work.”
The Journal of Finance 25, no. 2 (1970): 383–417.

Fedorenko, Ivan, Pierre Berthon, and Tamara Rabinovich. “Crowded Identity: Managing
Crowdsourcing Initiatives to Maximize Value for Participants through Identity Cre-
ation.” Crowdsourcing, Business Horizons 60, no. 2 (2017): 155–165. https://doi.
org/10.1016/j.bushor.2016.10.002.
Gillespie, Tarleton. “The Politics of ’Platforms’.” New Media & Society 12, no. 3 (2010):
347–364.
Guyer, Jane I. Legacies, Logics, Logistics: Essays in the Anthropology of the Platform
Economy. Chicago: The University of Chicago Press, 2016.
Hayek, F. A. “The Use of Knowledge in Society.” The American Economic Review 35,
no. 4 (1945): 519–530.
Knorr Cetina, Karin, and Urs Bruegger. “Global Microstructures: The Virtual Societies
of Financial Markets.” American Journal of Sociology 107, no. 4 (2002): 905–950.
Latour, Bruno. Reassembling the Social: An Introduction to Actor-Network-Theory. Ox-
ford: Oxford University Press, 2005.
MacKenzie, Adrian, and Anna Munster. “Platform Seeing: Image Ensembles and Their
Invisualities.” Theory, Culture & Society 36, no. 5 (2019): 3–22. https://doi.org/10.
1177/0263276419847508.
MacKenzie, Donald. An Engine, Not a Camera: How Financial Models Shape Markets.
Cambridge, MA: MIT Press, 2006.
Martin, Randy. Knowledge Ltd: Toward a Social Logic of the Derivative. Philadelphia ;
Rome ; Tokyo: Temple University Press, 2015.
McAfee, Andrew, and Erik Brynjolfsson. Machine, Platform, Crowd: Harnessing Our
Digital Future. First edition. New York: W.W. Norton & Company, 2017.
O’Dwyer, Rachel. Tokens: The Future of Money in the Age of the Platform. London New
York: Verso, 2023.
Osipovich, Alexander. “Exclusive | Trump Whale Scores $85 Million Windfall on Elec-
tion.” Wall Street Journal, November 2024. https://www.wsj.com/finance/trump-
whale-scored-85-million-windfall-on-election-7c2cd906.
Pistor, Katharina. “Rule by Data: The End of Markets?” Law and Contemporary Prob-
lems, 2020, 101–124.

Ray, Russ. “Prediction Markets and the Financial ’Wisdom of Crowds’.” Journal of Be-
havioral Finance 7, no. 1 (2006): 2–4. https://doi.org/10.1207/s15427579jpfm0701_
1.
Shleifer, Andrei, and Robert W. Vishny. “The Limits of Arbitrage.” The Journal of Fi-
nance 52, no. 1 (1997): 35–55.
Surowiecki, James. The Wisdom of Crowds. Westminster: Knopf Doubleday Publishing
Group, 2005.
Whelan, Karl. “On Prices and Returns in Commercial Prediction Markets.” Quantitative
Finance 23, no. 11 (2023): 1699–1712. https://doi.org/10.1080/14697688.2023.
2257756.
Wolfers, Justin, and Eric Zitzewitz. “Prediction Markets.” Journal of Economic Perspec-
tives 18, no. 2 (2004): 107–126.
Yee, Nick, Jeremy N. Bailenson, and Nicolas Ducheneaut. “The Proteus Effect.” Commu-
nication Research 36, no. 2 (2009): 285–312. https://doi.org/10.1177/009365020833
0254.
Zelizer, Viviana A. The Social Meaning of Money. New York: Basic Books, 1994.

A
METHODOLOGICAL DETAILS
A.1
Market Efficiency Testing Methodology
To assess the weak-form efficiency of prediction markets, I implemented a compre-
hensive statistical testing framework following and contemporary prediction market lit-
erature.37 The methodology employs five distinct econometric approaches:
Random Walk Test The Augmented Dickey-Fuller (ADF) test examines whether
price series follow a random walk process. For each market i, I test the null hypothesis
that the price series contains a unit root:
H0 : Price series of market i has a unit root
Efficient markets exhibit non-stationarity in price levels (p-value > 0.05), indicating
prices follow a random walk without systematic predictable patterns. The test statistic
is computed using the regression equation:
∆pt = α + βpt−1 +
k
X
j=1
γj∆pt−j + ϵt
where pt represents the price at time t, and k is the lag order determined by the Akaike
Information Criterion.
Return Stationarity Test The ADF test is applied to logarithmic returns to evalu-
ate return stationarity. For efficient markets, returns should exhibit stationarity (p-value
< 0.05), indicating a consistent underlying distribution. The test is applied to the log-
return series rt = ln(pt/pt−1) using the same ADF methodology as the price series.
Autocorrelation Analysis The autocorrelation function (ACF) for log returns is
computed across multiple lags to detect serial correlation. For a market with sample size
n, I establish significance thresholds at ±1.96/√n. Efficient markets should demonstrate
no significant autocorrelation in returns, as significant values would indicate predictable
patterns. The autocorrelation at lag k is calculated as:
ρk =
Pn
t=k+1(rt −¯r)(rt−k −¯r)
Pn
t=1(rt −¯r)2
Runs Test for Randomness The non-parametric runs test evaluates the random-
ness of return sequences independent of distributional assumptions. The test computes
the number of "runs"—consecutive sequences of returns with the same sign—and com-
pares it to the expected number under the random walk hypothesis. For a series with n+
37. Eugene F. Fama, “Efficient Capital Markets: A Review of Theory and Empirical Work,” The Journal
of Finance 25, no. 2 (1970): 383–417.

positive and n−negative returns, the expected number of runs is:
E(R) = 2n+n−
n+ + n−
+ 1
with standard deviation:
σR =
v
u
u
t2n+n−(2n+n−−n+ −n−)
(n+ + n−)2(n+ + n−−1)
The standardized test statistic follows a normal distribution, with p-values ≥0.05
indicating random sequencing consistent with efficiency.
Autoregressive Model Test An AR(1) model is fit to return series to assess return
predictability:
rt = ϕ0 + ϕ1rt−1 + ϵt
Efficient markets should exhibit statistically insignificant AR coefficients (p-value ≥
0.05), indicating returns cannot be predicted from past values.
Composite Efficiency Score I construct a composite efficiency score through weighted
aggregation of individual test results:
Efficiency Scorei =
P5
j=1 wj · Sj
P5
j=1 wj
× 100
where wj represents test-specific weights (Random Walk: 25; Return Stationarity: 25;
Autocorrelation: 20; Runs Test: 15; AR Model: 15), and Sj indicates the score for test
j.
Markets are classified into four efficiency categories based on their composite scores:
• Highly Efficient [80,100]
• Moderately Efficient [60,80)
• Slightly Inefficient [40,60)
• Highly Inefficient [0,40)
A.2
Trader Classification Methodology
The trader classification approach employs unsupervised learning techniques to iden-
tify distinct behavioral patterns without imposing predefined categories. The implemen-
tation follows a systematic process:
Feature engineering: For each trader i, I computed a feature vector xi comprising:
ffreq,i = num_tradesi
active_daysi

fvol,i = total_trading_volumei
favg,i = total_trading_volumei
num_tradesi
fdir,i = buysi −sellsi
buysi + sellsi
fprice,i = corr(trade_directioni, ∆price)
ftemp,i = late_stage_tradesi
total_tradesi
Dimensionality management: Features with high skewness were transformed us-
ing:
Xlog = log(1 + X)
Feature normalization: Standard scaling was applied:
Xscaled = X −µX
σX
Clustering implementation: K-means clustering was applied to minimize:
min
C
k
X
i=1
X
xj∈Ci
|xj −µi|2
where Ci is the ith cluster, xj is the feature vector for trader j, and µi is the centroid of
cluster i.
Optimal cluster selection: The number of clusters k was selected by maximizing
the silhouette score:
S(i) =
b(i) −a(i)
max{a(i), b(i)}
where a(i) is the mean intra-cluster distance and b(i) is the mean nearest-cluster distance
for point i.
Trader strategy classification: For each trader, a strategy score was computed:
Strategyi =
P
t∈Ti sgn(dirt) · sgn(∆pt−1)
|Ti|
where Ti is the set of trades by trader i, dirt is the direction of trade t (1 for buy, -1 for
sell), and ∆pt−1 is the price change prior to trade t.
A.3
Price Impact and Network Effect Analysis
The price impact measurement framework quantifies how different trader categories
influence market prices:

Price Impact Calculation
For each trade i by trader type j, the immediate price change ∆Pi was calculated as:
∆Pi = Pi+1 −Pi
To account for trade direction, adjusted price impacts ∆P ′
i were computed:
∆P ′
i =





∆Pi
if trade is buy
−∆Pi
if trade is sell
The weighted average price impact for trader type j was calculated as:
∆P j =
P
i∈j Vi∆P ′
i
P
i∈j Vi
where Vi is the volume of trade i.
The impact ratio between trader types A and B was computed as:
Rimpact = ∆P A
∆P B
Network Cascade Analysis
For whale identification, traders were classified based on volume percentile:
Whalei =





if volumeRanki ≤0.01 · N
0
otherwise
where N is the total number of traders.
For each whale trade w at time tw, subsequent trades within a 60-minute window were
analyzed:
Fw = {i | ti −tw ≤60 min ∧diri = dirw}
The follow ratio for trader type j was calculated as:
Followj =
|{i ∈Fw | typei = j}|
|{i | ti −tw ≤60 min ∧typei = j}|
The average follow time for trader type j was computed as:
AvgFollowTimej =
P
i∈Fw,typei=j(ti −tw)
|{i ∈Fw | typei = j}|

B
MICROSTRUCTURAL ANALYSIS RESULTS
The following figures visualize key findings regarding differential price impacts and
response times across trader categories:
Figure 5. Price Impact Across Markets. Positive values indicate prices follow trader direction;
negative values indicate prices move in opposite direction.
Figure 6. Average Response Time to Whale Trader Activity.
These visualizations support the findings discussed in Section III regarding hierarchi-
cal information flows and differential price impacts across trader categories. Figure 5
demonstrates how whale traders exhibit distinctive price impact patterns compared to
non-whale participants, while Figure 6 illustrates the systematic response timing differ-
ences that characterize the trader ecology.

C
CORE MARKET ANALYSES
Table 9. US Presidential Election Market Characteristics
Market
ID
Volume (USD)
Traders
Price
Result
Donald Trump
253591
1.53 billion
62,065
0.555
Yes
Kamala Harris
253597
1.04 billion
72,183
0.399
No
Other Republican
253642
241.66 million
22,339
0.001
No
Michelle Obama
253609
153.38 million
18,963
0.001
No
RFK Jr.
253595
141.61 million
19,391
0.001
No
Other Democrat
253641
116.56 million
18,519
0.001
No
Nikki Haley
253593
107.53 million
15,736
0.001
No
Hillary Clinton
253610
93.31 million
9,795
0.001
No
Joe Biden
253592
72.18 million
6,729
0.001
No
Gavin Newsom
253594
54.16 million
5,305
0.001
No
Table 10. Key US Presidential Market Metrics
Metric
Value
Market Duration
296 days
Trading Frequency
15,631 trades/day
Average Trade Size
$784
Trader-to-Trade Ratio
21.6 trades per trader
Two-Way Traders Ratio
0.64
Price Range (Trump)
0.715
Price Volatility (Trump)
0.289
Gini Coefficient
0.943
Market Efficiency Score (Trump)
40.0
Note: Two-Way Traders Ratio represents the proportion of traders who both bought and
sold positions. Market Efficiency Score ranges from 0 (highly inefficient) to 100 (perfectly
efficient).

Table 11. US Presidential Market Efficiency Classifications
Efficiency Classification
Markets
Percent
Examples
Highly Efficient (80-100)
0
0.0%
–
Moderately Efficient (60-80)
0
0.0%
–
Slightly Inefficient (40-60)
23.5%
Trump, Harris, Kennedy,
Biden
Highly Inefficient (0-40)
76.5%
All other candidates
Table 12. Trader Concentration in 2024 US Presidential Election Market
Trader Category
% of Traders
Number
% of Volume
Top 0.1%
0.1%
47.9%
Top 1.0%
1.0%
69.2%
Top 5.0%
5.0%
4,392
84.7%
Top 10.0%
10.0%
8,784
91.1%
Table 13. Trader Type Distribution in US Presidential Markets
Trader Type
%
Count
% Volume
Strategy Score
Retail Traders
43.1%
37,860
12.3%
-0.392
Active Traders
37.1%
32,590
23.7%
-0.282
High-Frequency
Traders
19.7%
17,305
64.0%
-0.331
Note: Strategy Score values range from -1 (fully contrarian) to +1 (fully momentum), with
0 representing neutral positioning.
Table 14. Pennsylvania Senate Election Market Characteristics
Market
ID
Volume
(USD)
Traders
Price
Result
Republican
(McCormick)
500109
2,564,649
1,326
0.22
Yes
Democrat (Casey)
500108
2,306,432
0.78
No
Other candidate
500110
613,378
1,085
0.002
No

Table 15. Key Pennsylvania Senate Market Metrics
Metric
Value
Total Volume
5.48 million USD
Market Duration
217 days
Trading Frequency
68.3 trades/day
Average Trade Size
$659
Trader-to-Trade Ratio
5.4
Two-Way Traders Ratio
0.36
Price Range (Democrat)
0.47
Price Volatility (Democrat)
0.189
Final Week Momentum
(Democrat)
+0.15
Prediction Error (Brier Score)
0.608
Gini Coefficient
0.961
D
COMPARATIVE ANALYSIS
Table 16. Comparative Market Microstructure Metrics Across Electoral Contexts
Metric
US Pres.
German Parl.
PA Senate
Croatia Pres.
SF Mayor
UK Parl.
Volume (USD
millions)
3,680
134.62
5.48
3.14
7.13
4.24
Unique Traders
87,843
37,449
2,666
6,742
1,874
5,302
Market Duration
(days)
43.6
Trading Frequency
15,631
9,827
68.3
116.4
212.8
117.5
Gini coefficient
0.943
0.980
0.961
0.938
0.951
0.964
Traders for 50% vol.
0.10%
0.14%
0.79%
1.80%
1.23%
0.89%
Traders for 90% vol.
5.00%
2.24%
5.10%
10.86%
8.42%
6.87%
Whale impact
−0.0024
+0.0030
+0.0230
+0.0310
+0.0186
+0.0040
Non-whale impact
+0.0019
−0.0033
−0.0080
−0.0060
−0.0025
−0.0029
Impact ratio
−1.285
−0.919
−2.860
−5.550
−7.440
−1.366
Closing price
(winner)
0.555
0.967
0.220
0.940
0.610
0.875
Brier Score
0.19
0.001
0.608
0.01
0.14
0.02
Efficiency Score
40.0
50.0
65.0
45.0
70.0
45.0
% Contrarian (HFT)
45.9%
32.9%
34.9%
54.8%
40.2%
41.5%
% Contrarian (Retail)
49.6%
60.0%
63.9%
53.2%
58.7%
56.9%
Avg. follow time
(min)
4.81-11.97
1.67-18.19
7.83-13.66
6.00-9.46
5.45-12.80
6.14-8.40

Table 17. Market Distribution by Election Type and Region
Election Type
Count
Region
Count
Presidential
United States
Senate
United Kingdom
Presidential Primary
Germany
Parliamentary
Ireland
Vice Presidential
Brazil
Prime Minister
Canada
Presidential Popular
Vote
Belarus
Mayoral
France
Presidential Tipping
Point
Romania
Balance of Power
Venezuela
Presidential Speech
Croatia
Governor
Moldova
Provincial
Mexico
Electoral College
Greenland
Presidential
Administration
Taiwan
Table 18. Prediction Accuracy by Election Type
Event Election Type
Accuracy
Count
Accuracy (%)
Presidential
0.969
96.90%
Presidential Primary
1.000
100.00%
Senate
0.933
93.30%
Parliamentary
0.929
92.90%
Vice Presidential
1.000
100.00%
Prime Minister
0.958
95.80%
Presidential Popular Vote
0.889
88.90%
Mayoral
0.813
81.20%
Presidential Tipping Point
0.929
92.90%
Balance of Power
0.889
88.90%
Provincial
0.714
71.40%
Presidential Speech
1.000
100.00%
Electoral College
0.833
83.30%
Governor
1.000
100.00%