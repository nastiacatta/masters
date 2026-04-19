This article was downloaded by: [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] On: 07 November 2025, At: 05:57
Publisher: Institute for Operations Research and the Management Sciences (INFORMS)
INFORMS is located in Maryland, USA
Operations Research
Publication details, including instructions for authors and subscription information:
http://pubsonline.informs.org
Price Interpretability of Prediction Markets: A
Convergence Analysis
Jianjun Gao; , Zizhuo Wang; , Weiping Wu; , Dian Yu
To cite this article:
Jianjun Gao; , Zizhuo Wang; , Weiping Wu; , Dian Yu (2025) Price Interpretability of Prediction Markets: A
Convergence Analysis. Operations Research 73(1):157-177. https://doi.org/10.1287/opre.2022.0417
Full terms and conditions of use: https://pubsonline.informs.org/Publications/Librarians-Portal/PubsOnLine-
Terms-and-Conditions
This article may be used only for the purposes of research, teaching, and/or private study. Commercial use or
systematic downloading (by robots or other automatic processes) is prohibited without explicit Publisher approval,
unless otherwise noted. For more information, contact permissions@informs.org.
The Publisher does not warrant or guarantee the article’s accuracy, completeness, merchantability, fitness
for a particular purpose, or non-infringement. Descriptions of, or references to, products or publications, or
inclusion of an advertisement in this article, neither constitutes nor implies a guarantee, endorsement, or support
of claims made of that product, publication, or service.
Copyright © 2024, INFORMS
Please scroll down for article—it is on subsequent pages
With 12,500 members from nearly 90 countries, INFORMS is the largest international association of operations
research (O.R.) and analytics professionals and students. INFORMS provides unique networking and learning
opportunities for individual professionals, and organizations of all types and sizes, to better understand and use
O.R. and analytics tools and methods to transform strategic visions and achieve better outcomes.
For more information on INFORMS, its publications, membership, or meetings visit http://www.informs.org

Crosscutting Areas
Price Interpretability of Prediction Markets: 
A Convergence Analysis
Jianjun Gao,a,b Zizhuo Wang,c,* Weiping Wu,d,* Dian Yue,* 
aSchool of Information Management and Engineering, Shanghai University of Finance and Economics, Shanghai 200433, China; bKey 
Laboratory of Interdisciplinary Research of Computation and Economics, Shanghai University of Finance and Economics, Ministry of 
Education, Shanghai 200433, China; cSchool of Data Science, The Chinese University of Hong Kong, Shenzhen, Guangdong 518172, China; 
dSchool of Economics and Management, Fuzhou University, Fuzhou 350108, China; eIndustrial Bank, Co., Ltd., Fuzhou 350014, China 
*Corresponding authors 
Contact: gao.jianjun@shufe.edu.cn, 
https://orcid.org/0000-0002-7824-5919 (JG); wangzizhuo@cuhk.edu.cn, 
https://orcid.org/0000-0003-0828-7280 (ZW); wu.weiping@fzu.edu.cn, 
https://orcid.org/0000-0002-5958-6910 (WW); 
deaniiyu@outlook.com, 
https://orcid.org/0000-0001-7796-8368 (DY) 
Received: August 15, 2022 
Revised: November 1, 2023; March 11, 2024; 
April 15, 2024 
Accepted: April 17, 2024 
Published Online in Articles in Advance: 
June 10, 2024 
Area of Review: Market Analytics and 
Revenue Management 
https://doi.org/10.1287/opre.2022.0417 
Copyright: © 2024 INFORMS
Abstract. Prediction markets are long known for prediction accuracy. This study sys­
tematically explores the fundamental properties of prediction markets, addressing ques­
tions about their information aggregation process and the factors contributing to their 
remarkable efficacy. We propose a novel multivariate utility–based mechanism that uni­
fies several existing automated market-making schemes. Using this mechanism, we 
establish the convergence results for markets comprised of risk-averse traders who have 
heterogeneous beliefs and repeatedly interact with the market maker. We demonstrate 
that the resulting limiting wealth distribution aligns with the Pareto efficient frontier 
defined by the utilities of all market participants. With the help of this result, we estab­
lish analytical and numerical results for the limiting price in different market models. 
Specifically, we show that the limiting price converges to the geometric mean of agent 
beliefs in exponential utility-based markets. In risk measure-based markets, we con­
struct a family of risk measures that satisfy the convergence criteria and prove that the 
price converges to a unique level represented by the weighted power mean of agent 
beliefs. In broader markets with constant relative risk aversion utilities, we reveal that 
the limiting price can be characterized by systems of equations that encapsulate agent 
beliefs, risk parameters, and wealth. Despite the impact of traders’ trading sequences on 
the limiting price, we establish a price invariance result for markets with a large trader 
population. Using this result, we propose an efficient approximation scheme for the lim­
iting price. Numerical experiments demonstrate that the accuracy of this approximation 
scheme outperforms existing approximation methods across various scenarios. Our 
findings serve to aid market designers in better tailoring and adjusting the market- 
making mechanism for more effective opinion elicitation.
Funding: This work was supported by the National Natural Science Foundation of China [Grants 
71671045, 71971132, 72150002, 72201067, and 72394361], the InnoHK initiative of the Government of 
the HKSAR, Laboratory for AI-Powered Financial Technologies, the Guangdong Provincial Key 
Laboratory of Mathematical Foundations for Artificial Intelligence [Grant 2023B1212010001], the 
Shanghai Research Center for Data Science and Decision Technology, and the Key Laboratory of 
Interdisciplinary Research of Computation and Economics, Ministry of Education, Shanghai Uni­
versity of Finance and Economics. 
Supplemental Material: The computer code and data that supports the findings of this study is available 
within this article’s supplemental material at https://doi.org/10.1287/opre.2022.0417. 
Keywords:
dynamic mechanisms • information elicitation • prediction markets
1. Introduction
Information, often scattered among the crowd, is valu­
able yet hard to aggregate. Throughout the centuries, 
researchers and practitioners have invented various 
tools in an attempt to piece them together. Classical 
mechanisms like polls, surveys, and brainstorming 
work fine.1 However, they lack the commitment to let 
people put their money where their mouth is. Over 
the past two decades, the prediction market, a mecha­
nism designed specifically for information elicitation 
and aggregation, has gained much popularity (Wol­
fers and Zitzewitz 2004, Arrow et al. 2008). For exam­
ple, the Iowa Electronic Markets (IEM), arguably the 
pioneer of prediction markets, almost consistently 
OPERATIONS RESEARCH 
Vol. 73, No. 1, January–February 2025, pp. 157–177 
ISSN 0030-364X (print), ISSN 1526-5463 (online) 
https://pubsonline.informs.org/journal/opre 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

beats professional opinion polls (Berg et al. 2008). Other 
success stories include corporate consensus pooling, 
box office forecasting, and online recreational sports 
betting (Chen et al. 2005, Cowgill et al. 2009, Cogwill 
and Zitzewitz 2015).
Because of the liquidity issue, a prediction market is 
usually organized by an automated market maker (Han­
son 2003).2 In this market, traders exchange specialized 
securities with a market maker. These securities offer 
rewards based on uncertain outcomes, revealed once the 
true state is known. Traders, guided by their subjective 
beliefs, trade with the market maker to gain expected 
utility. Simultaneously, the market maker gathers valu­
able information through trading to enhance the overall 
accuracy of predictions. Although the prediction market 
literature has primarily focused on designing effective 
market-making mechanisms (Chen and Pennock 2007, 
Abernethy et al. 2013, Othman et al. 2013, Slamka et al. 
2013), there have been relatively few attempts to explore 
the market’s evolutionary behavior. In this paper, we 
aim to narrow this gap by addressing the following 
questions and providing additional insights into the 
analysis of prediction markets. 
1. Under what conditions can we expect a prediction 
market to reach a consensus? That is, when does the 
trading process (market price) converge?
2. How to interpret the limiting price? What is the 
relation between such limiting price with each trader’s 
belief, wealth and their risk attitude?
In line with the spirit of Sethi and Vaughan (2016), we 
explore a dynamic prediction market model with multi­
ple securities, involving a finite number of myopic, risk- 
averse traders with heterogeneous beliefs interacting 
with an automated market maker. We make several con­
tributions that enhance the understanding and effective­
ness of prediction markets.
First, we introduce a unified multivariate utility (MU)- 
based mechanism that incorporates several market- 
making mechanisms (Hanson 2003, 2007; Chen and Pen­
nock 2007; Agrawal et al. 2011) into a consistent frame­
work. Based on this framework, we propose a method 
for establishing market convergence that subsumes and 
extends the existing results in Frongillo et al. (2015) and 
Sethi and Vaughan (2016). More importantly, we dem­
onstrate that the limiting wealth distribution is Pareto 
optimal with respect to the utility of each trader. Addi­
tionally, this approach allows us to bypass the challenges 
of analyzing transient behavior in price dynamics and 
enables a direct examination of the limiting price.
By leveraging the general convergence result, we 
study the convergence properties under various utility 
types. Specifically, we derive the analytical form of 
price dynamics for the exponential utility-based mar­
ket, revealing that the limiting price is the geometric 
mean of agents’ beliefs and is independent of the trad­
ing sequences. We extend this result to the convex risk 
measure-based market. Specifically, we present an ex­
plicit method to construct risk measures that satisfy the 
convergence requirements. For a wide range of convex 
risk measures, we derive the analytical form of the lim­
iting price, which emerges as a weighted power mean 
of agent beliefs.
Furthermore, we explore the more commonly used 
market model where all participants adopt the utility 
with constant relative risk aversion (i.e., CRRA utility) to 
make decisions. We analyze traders’ optimal trading 
decisions and examine the limiting wealth distribution 
resulting from the aggregate Pareto optimization prob­
lem. It reveals that the limiting price can be character­
ized through a system of equations including all 
participants’ risk parameters, initial wealth allocation, 
and subjective beliefs. Crucially, we establish a funda­
mental result indicating that, even though trading 
sequences can influence the limiting price, their impact 
diminishes to insignificance as the trader population 
increases. Using these results, we introduce a heuristic 
weight called Pareto optimality-induced (POI) weights 
and derive an associated approximate price formula 
that underscores the important role of risk aversion 
and initial wealth in price determination. To evaluate 
this approximation scheme, we conduct numerical 
experiments, which demonstrate that our POI price 
can closely track the actual price resulting from the 
trading process across various settings. Through fur­
ther comparison, our approximation scheme consis­
tently outperforms previous attempts in the literature, 
such as the one presented in Sethi and Vaughan (2016). 
This performance improvement significantly advances 
the state-of-the-art in our comprehension of market 
prices.
Our findings hold significant potential for various 
applications. First, the MU-based mechanism offers 
extensive flexibility in designing pricing formulations, 
empowering the market designer to tailor markets for 
diverse purposes. Second, our theoretical results estab­
lish a link between the parameters and the limiting 
price, enhancing the market designer’s ability to elicit 
traders’ beliefs. Specifically, our result suggests that 
the market maker should exercise caution when select­
ing risk and wealth parameters to balance liquidity 
and accuracy. Our theoretical result on price stability 
in a random trading market suggests that it is im­
portant to attract more traders to achieve a reliable 
limiting price. Moreover, in scenarios like artificial pre­
diction markets (Chakravorti et al. 2023), where tra­
ders are artificially generated supervised learners, our 
results provide guidance for configuring hyperpara­
meters for these artificial traders. Last, our conver­
gence scheme and the subsequent price analysis can be 
effortlessly extended to prediction markets without a 
market maker. As an ancillary outcome, the theoretical 
proof of market convergence is closely related to the 
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

distributional algorithm of weakly coupled multiobjec­
tive optimization, which can be extended to address 
more generalized problems sharing a similar structure.
This paper is organized as follows. In the remainder 
of this section, we review the related literature. In 
Section 2, we introduce the market model and the 
MU-based pricing mechanism. In Section 3, we present 
the general convergence result. In Section 4, we study 
the exponential utility-based market and the risk 
measure-based market. We then explore the CRRA 
utility-based market in Section 5. In Section 6, we dis­
cuss the price-volume relationship, forward-looking 
trading decision, and the nonstationary market setting. 
We conclude the paper in Section 7. All the proofs and 
related results are provided in the Online Appendix.
1.1. Related Research
Our work is closely related to the research on automated 
market-making mechanisms in prediction markets. The 
logarithm market scoring rule (LMSR) introduced by 
Hanson (2003, 2007) stands out as one of the most pop­
ular mechanisms in Internet prediction markets due 
to its desirable properties. In practice, LMSR can be 
implemented in the form of a cost function (Chen and 
Vaughan 2010). This cost function–based mechanism 
has been refined in various directions (Abernethy 
et al. 2013, 2014b; Othman et al. 2013). Furthermore, 
Chen and Pennock (2007) propose a univariate utility 
function–based framework, which strongly motivates 
our adoption of the MU-based mechanism. Addition­
ally, Agrawal et al. (2011) introduce the sequential 
convex pari-mutuel mechanisms, allowing the market 
to accept limit orders. Partial equivalence among these 
mechanisms has been established (Chen and Pennock 
2007, Chen and Vaughan 2010, Agrawal et al. 2011). 
To deal with the liquidity-adaption problem in practi­
cal implementation, Othman et al. (2013) propose a 
liquidity-sensitive mechanism. Recent developments 
have extended these mechanisms in various directions 
(Freeman et al. 2017, Ban 2018, Freeman and Pennock 
2018). As for the performance comparison of different 
mechanisms, Slamka et al. (2013) provide simulation 
studies.
In prediction markets, trading-generated prices 
serve as predictors of future events, reflecting an 
aggregate estimate of the likelihood of a certain event 
occurring (Manski 2006, Wolfers and Zitzewitz 2006). 
As for market convergence and price interpretation, 
there are generally two streams of studies. The first 
one involves a common prior and heterogeneous infor­
mation. Ostrovsky (2012) and Iyer et al. (2014) find that 
when all participants are risk neutral or risk averse, 
prices converge to a common posterior. These findings 
align with the well-known theorem established by 
Aumann (1976), stating that people with a common 
prior must have a common posterior if all posteriors 
are common knowledge, or in short, people cannot agree 
to disagree. The second stream of the model is charac­
terized by heterogeneous priors and common informa­
tion. In this paradigm, several researchers adopt the 
static equilibrium model, where the price results from 
the market clearing condition. Following this idea, 
Gjerstad and Hall (2005) and Manski (2006) find a bias 
between traders’ mean beliefs and the equilibrium 
price. However, Pennock (1999) and Wolfers and Zit­
zewitz (2006) show that the market equilibrium coin­
cides with the wealth-weighted average of trader’s 
beliefs when traders adopt the logarithm utility to 
make decisions.
In contrast to the previous static model, another line 
of research explores the dynamic trading model. Oth­
man and Sandholm (2010) investigate a market with 
risk-neutral traders with heterogeneous beliefs. In this 
setting, a finite number of traders interact with the mar­
ket maker only once, resulting in a dependence between 
the trading order and the last posted price. In a related 
study, Frongillo and Reid (2015) adopt risk measures to 
model traders’ preferences in a market equipped with a 
cost function–based mechanism. When the traders trade 
with the market maker in a random order, the dynamic 
trading process exhibits similarities with a machine 
learning algorithm that aims to minimize aggregate 
risk. Frongillo and Reid (2015) also develop some con­
vergence conditions. However, their approach critically 
relies on the translation invariance property of risk mea­
sures, which is generally not available in our MU-based 
market. Our work shares more similarities with Sethi 
and Vaughan (2016), who establish price convergence 
for a binary predication market with risk-averse traders 
and an LMSR-based market maker. In contrast, our 
research focuses on a broader market setting, encom­
passing multiple securities, a general market-making 
mechanism, and a variety of trading decision para­
digms. These complexities make it challenging to apply 
their approaches directly to analyze our general model. 
Bonnisseau and Nguenamadji (2013) considered a dis­
crete Walrasian process, which is related to our model. 
However, the key difference is that their process in­
volves pure exchange without a market maker. In con­
trast, our model is more intricate due to the externality 
introduced by the market maker and the pairwise 
trading restriction. The conditions required for market 
convergence in this scenario remain unclear, which par­
tially motivates our current research.
Additionally, several studies have examined predic­
tion markets with specific market structures. For exam­
ple, Abernethy et al. (2014a) analyze the equilibrium 
properties of a market with traders whose beliefs are 
drawn from exponential family distributions. Carvalho 
(2017) demonstrates that in a binary prediction market 
with an LMSR-based mechanism and risk-neutral 
budget-constrained traders, the price converges to the 
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

median belief of traders. Tarnaud (2019) investigates 
the asymptotic properties of a simple binary market 
with an LMSR-based mechanism and two traders. 
As valuable tools for forecasting and information 
aggregation, prediction markets also receive consider­
able attention in the operations research and manage­
ment science societies. For example, Chen et al. (2008) 
develop a diffusion model for predicting the price of 
political events in prediction markets, whereas Berg 
et al. (2009) use prediction markets to forecast market 
capitalization before an initial public offering. Healy 
et al. (2010) investigate different trading mechanisms 
in small markets with complex environments. Atana­
sov et al. (2017, 2022) systematically compare predic­
tion markets with other popular information elicitation 
methods. Through several large-scale experimental 
tests, they find these two methods have advantages in 
different situations. Jian and Sami (2010) and Choo et al. 
(2022) study the accuracy of prediction markets when 
there is price manipulation.
Besides the human-populated markets, artificial pre­
diction markets with artificial agents (bot-traders) are 
developed as supervised learning tools for probability 
estimation and the aggregation of weak classifiers 
(Storkey et al. 2012, Chakravorti et al. 2023). Tuning 
the hyperparameters (i.e., wealth, risk parameter, and 
beliefs of each bot-trader) in these artificial markets is a 
key challenge, as highlighted by Chakravorti et al. 
(2023). Our convergence result and interpretation of 
the limiting price provide potential guidance for tun­
ing these hyperparameters.
Notations: A vector is denoted by a boldface letter, 
that is, x  (x1,:::,xn) ∈Rn stands for a column vector 
x. Let e and 0 be the all-one and all-zero vectors in the 
appropriate dimension, respectively. Given vectors y 
and x in Rn, the notation y ≥x means that yi ≥xi for all 
i, whereas y > x indicates that y ≥x, and there exists an 
i such that yi>xi. Notations recc(A) and recc(F) repre­
sent the recession cone of the convex set A and the con­
vex function F, respectively (as defined in Bertsekas 
et al. 2003). The domain of function F(·) is denoted as 
dom(F), and the probability simplex is represented as 
Θn ¢{(q1,:::,qn) ∈Rn
+ |Pn
i1 qi  1}, where R+ denotes 
the set of nonnegative real numbers.
2. Market Model and Trading Process
In this section, we introduce the market model. We con­
sider a state space {1,2,:::,I} with I ≥2, comprising of 
mutually exclusive and exhaustive outcomes. Each 
state i ∈{1,2,:::,I} corresponds to an Arrow-Debreu 
security, which pays 1 dollar if state i occurs. These 
securities are traded in a prediction market organized 
by a central market maker. A total of J>1 traders 
engage in repeated transactions with the market maker 
at discrete time points t  0,1,2,:::. We represent the 
market maker’s wealth at time t as Wt ∈R and their 
outstanding securities position (i.e., the number of 
securities already sold) as Qt ∈RI. The market maker’s 
initial values are W0 > 0 and Q0  0. For each trader 
indexed by j  1,:::,J, we use wj,t ∈R and qj,t ∈RI to 
denote their wealth and security positions at time 
t  0,1,2,:::. The initial values are wj,0 > 0 and qj,0  0.
At each time t, one trader interacts with the market 
maker (we will specify the order of arrivals of the tra­
ders in later discussions) by submitting an order ∆q ∈
RI. For instance, in the context of a football match out­
come, such an order might be expressed as ∆q 
(2,1, 1), representing two shares for a buying order 
on “win,” one share for a buying order on “loss,” and 
one share for a selling order on “tie.” At any time t, if 
the jth trader pays ∆w to the market maker (if ∆w < 0, 
then it means the trader is paid ∆w by the market 
maker) and buys ∆q share of security, then the market 
state is updated as follows3:
Trader j :
wj,t+1  wj,t  ∆w
qj,t+1  qj,t + ∆q,
(
Market Maker :
Wt+1  Wt + ∆w
Qt+1  Qt + ∆q:
(
(1) 
The other traders’ positions keep unchanged, that is, 
wk,t+1  wk,t and qk,t+1  qk,t, for k  1,:::,J and k ≠j.
To price an order ∆q ∈RI, the market maker adopts 
an MU-based mechanism described as follows. Sup­
pose the market maker’s MU function is U(·) : RI →R, 
which maps the net wealth position yt ¢Wt · e  Qt ∈
RI to some real number. We call yt the net wealth position 
because it represents all the possible wealth levels if the 
final state is revealed at time t.4 Similar to the utility- 
based pricing mechanism in Chen and Pennock (2007), 
the price of the order ∆q is determined by solving the 
following optimization problem5:
Pcmin(∆q) :
min
∆w∈R ∆w
Subject to :
U((Wt + ∆w) · e  (Qt + ∆q))
≥U(W0 · e),
(Wt + ∆w) · e  (Qt + ∆q) ∈dom(U):
(2) 
The minimizer of problem Pcmin(∆q) is the price of 
the order ∆q. Constraint (2) can also be written as 
U(yt + (∆w · e  ∆q)) ≥U(W0 · e), which means that the 
utility of the updated net wealth position is no less than 
that of the initial state. This is consistent with the 
utility-preserving property proposed in Chen and Pen­
nock (2007), that is, the market maker tries to find the 
lowest possible charge for the order ∆q such that the 
posttrade utility level is no less than the initial level.
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

To ensure the previous pricing problem is well posed, 
throughout this paper, we assume U(·) satisfies the fol­
lowing assumptions.
Assumption 1. Function U(·) satisfies the following condi­
tions: (i) it is continuous, concave and its domain dom(U) is 
convex with e ∈recc(dom(U)); and (ii) it is monotonically 
increasing.6
Assumption 1 is mild and natural for the utility func­
tion except for the requirement e ∈recc(dom(U)) that 
means that the utility is well defined even if the wealth 
goes to infinity. Under Assumption 1, it can be verified 
that the MU-based pricing rule satisfies the axioms pro­
posed in Abernethy et al. (2013). These axioms serve as 
general requirements for a reasonable pricing mecha­
nism. Furthermore, the MU-based pricing rule pos­
sesses several other desirable properties. For instance, 
it demonstrates responsiveness to any finite order with 
a unique price, eliminates arbitrage opportunities for 
surebets and exhibits a finite worst-case loss (under 
mild conditions). Moreover, there is abundant flexibil­
ity to construct MU functions (see examples in Online 
Appendix EC.2.1). The following result establishes the 
relation between the MU-based pricing rule with the 
market scoring rule (MSR) and the cost function-based 
mechanism.
Proposition 1. An MU-based mechanism with a utility 
function satisfying Assumption 1 is equivalent to a cost 
function-based mechanism with a corresponding cost func­
tion. Furthermore, if an MU-based mechanism has a bounded 
loss under the worst-case scenario, then the underlying utility 
can induce a proper scoring rule. Conversely, any proper 
scoring rule can induce an MU-based mechanism that has 
bounded worst-case loss.
The detailed proof of the previous proposition is 
provided in Online Appendix EC.2.2. In this work, 
we adopt the MU-based pricing rule in our analysis 
mainly due to the following reasons. First, as shown in 
Proposition 1, the MU-based pricing rule is general 
enough to cover existing classical pricing rules. More 
importantly, the MU-based mechanism provides a 
tractable way to study the convergence property of 
prices generated by a dynamic trading process. Once 
we have these convergence results, they can be directly 
applied to other pricing rules. Second, compared with 
the cost function–based pricing rule (Chen and Pen­
nock 2007, Abernethy et al. 2013) and the LMSR (Han­
son 2003), the MU-based mechanism could explicitly 
incorporate the risk preferences and the heterogeneous 
beliefs of all participants in a unified framework, 
which enables us to explore how these heterogeneous 
factors affect the final prices of these securities. Third, 
constructing the MU function-based market maker is 
more convenient in practice compared with other 
mechanisms. For example, when using a risk measure 
to construct a cost function–based mechanism, the 
candidate function must be convex and translation 
invariant. This can make customizing a valid cost 
function in an analytical form a challenging task.7 In 
contrast, the MU-based utility only requires the func­
tion to be concave and monotone, and it can be con­
structed in various ways, including the classic expected 
utility theory (EUT) (Chen and Pennock 2007) and con­
vex risk measures (Chen and Pennock 2007, F¨ollmer 
and Schied 2011, Hu and Storkey 2014, Frongillo et al. 
2015). Moreover, the price of an order can be com­
puted by a simple line search. We provide additional 
properties of the MU function and some examples in 
Online Appendix EC.2.
On the trader’s side, we assume that each trader j ∈
{1,:::,J} also adopts an MU function, Vj(·) : RI →R, to 
evaluate his/her net wealth position.8 Following the 
spirit of Sethi and Vaughan (2016), the jth trader solves 
the following problem to decide the amount of securi­
ties to trade,
¯Pj(wj,t,qj,t) :
max
∆q∈RI, ∆w∈R
Vj((wj,t  ∆w) · e + (qj,t + ∆q))
subject to ∆w  arg min
w∈R
{w|U((Wt + w) · e
 (Qt + ∆q)) ≥U(W0 · e),
(Wt + w) · e  (Qt + ∆q) ∈dom(U),
(wj,t  w) · e + (qj,t + ∆q) ∈dom(Vj)}:
(3) 
In this problem, the term (wj,t  ∆w) · e + (qj,t + ∆q)
in the objective function represents the jth trader’s 
net wealth position after the current trading. Problem 
¯Pj(wj,t,qj,t) can be viewed as a bilevel optimization 
problem. It fully characterizes all the information in one 
round of trading, that is, the size of the order ∆q is 
determined by the upper-level problem, and the pay­
ment of the order ∆q, is determined by the subproblem 
in Constraint (3). The lower level subproblem in Con­
straint (3) is nothing but the problem Pcmin(∆q). To 
guarantee the whole trading process is well defined, we 
impose the following conditions for Vj(·), j  1,:::,J.
Assumption 2. Each Vj(·) satisfies the following condi­
tions: (i) it is continuous and strictly concave for nonequi­
valent wealth vectors9; and (ii) dom(Vj) is convex with 
recc(Vj) ⊆RI
+ and e ∈recc(dom(Vj)); (iii) it is monotoni­
cally increasing.
Assumption 2 is similar to Assumption 1 except that 
it requires Vj(·) to be strictly concave except along the 
direction e. This condition is necessary to establish 
trading process convergence in the later part of this 
paper. Such an assumption is weaker than global strict 
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

concavity, and it can also accommodate risk measure- 
based MU function, which is linear along direction e.
Although the state {wj,t,qj,t} fully represents the trad­
ing process, it is complicated to study the convergence 
of the trading process by solving problem ¯Pj(wj,t,qj,t)
directly. It is more convenient to use the net wealth posi­
tion to characterize the trading process. Specifically, at 
time t, let xj,t ¢wj,t · e + qj,t and yt ¢Wt · e  Qt be the 
jth trader’s and the market maker’s net wealth position, 
respectively. At time t0, it has xj,0  wj,0 · e and y0 
W0 · e. In each round of trading, when an order ∆q is 
placed at price ∆w, the variation of market maker’s 
wealth is denoted as z¢(z1,z2,:::,zI)  ∆w · e + ∆q. 
Then, the dynamics (1) transform into xj,t+1  xj,t + z if 
the jth trader interacts with the market at time t, and 
xk,t+1  xk,t for k ≠j, along with the market maker’s 
wealth update, yt+1  yt  z. It is worth noting that the 
market total wealth adheres to the following condition:
yt +
X
J
j1
xj,t 
X
J
j1
xj,0 + y0  wall
0 · e,
(4) 
for all t  0,1,:::, where wall
0 ¢PJ
j1 wj,0 + W0 is the 
total wealth of all participants in the market. Equation 
(4) suggests that the total net wealth position in the 
market maintains constant throughout the trading 
process.
Using the wealth vectors xj,t and yt, the utility pre­
serving property (2) can be expressed as U(yt  z) ≥
U(W0 · e). This formulation motivates us to consider 
an equivalent formulation of the jth trader’s decision 
problem:
Pj(xj,t) : max
z∈RI Vj(xj,t+1)  Vj(xj,t + z)
Subject to : U(yt  z) ≥U(W0 · e),
(5)
yt  z ∈dom(U), xj,t + z ∈dom(Vj), 
for given xj,t and yj,t satisfying (4). The following result 
establishes equivalence between problems Pj(xj,t) and 
¯Pj(wj,t,qj,t) in the sense of the optimal solutions.
Proposition 2. Under Assumptions 1 and 2, problem 
Pj(xj,t) admits a unique solution z∗. Furthermore, any fea­
sible solution {∆w∗,∆q∗} of problem ¯Pj(wj,t,qj,t) satisfying 
∆q∗ ∆w∗· e  z∗is an optimal solution of ¯Pj(wj,t,qj,t).
The previous result suggests that Pj(xj,t) captures 
all the essence of market evolution encoded in the origi­
nal problem ¯Pj(wj,t,qj,t). It greatly simplifies the origi­
nal market process characterized by wj,t, qj,t, Wt and 
Qt with the pricing problem ¯Pj(wj,t,qj,t). Therefore, in 
the consequent analysis, we focus on the formulation 
Pj(xj,t).
Remark 1 (No-Bankruptcy Restriction). In practical appli­
cations, traders often operate under the no-bankruptcy 
restriction, which means that the constraint xj,t ≥0 
holds for all t and j  1,:::,J. When the problem Pj(xj,t)
includes such constraints, we denote the corresponding 
problem as P+
j (xj,t).
To facilitate analysis, we make an additional 
assumption.10
Assumption 3. The functions U(·) and Vj(·), j  1,:::,J 
are continuously differentiable.
Before we analyze the convergence property, we dis­
cuss how to compute the instantaneous prices of the 
securities under the MU-based mechanism. The instan­
taneous prices of the securities can be viewed as an 
integrated forecast of the corresponding event (Wolfers 
and Zitzewitz 2004). Let y  (y1,y2,:::,yI) be the mar­
ket maker’s net wealth position. The instantaneous price 
of each security is defined as the marginal cost per 
share for purchasing an infinitesimal quantity of this 
security. The instantaneous price of the ith security, 
i ∈{1,:::,I}, can be computed by pricing the order 
∆q  ɛ · ei where ɛ > 0 is a small number and ei is the 
ith unit vector. If ∆w(ɛ) is the solution of problem 
Pcmin(ɛ · ei), then the instantaneous price of the ith secu­
rity is pi  limɛ→0∆w(ɛ)=ɛ. Under some assumptions of 
U(·), the price pi can be explicitly computed.
Proposition 3. Under Assumptions 1 and 3, given market 
state y, if one of the following conditions holds: (i) the state var­
iable y is an interior point of dom(U) or (ii) U(y) approaches 
∞whenever y approaches the boundary of dom(U), then 
the instantaneous price of the ith security is
pi 
∂U(y)=∂yi
PI
k1 ∂U(y)=∂yk
, i  1,:::,I:
(6) 
If we aggregate all pi in a vector p  (p1,:::,pI), then the 
price vector is exactly the normalized gradient of U(y), 
that is, p  ∇U(y)=(e⊤∇U(y)). When the assumptions in 
Proposition 3 fail to hold, the domain boundary of U(·)
will affect the solution of problem Pcmin(ɛ · ei). In those 
cases, one can still compute the price by using the enve­
lope theorem. However, the expression of such a price 
will depend on the boundary structure of U(·) and lack 
an analytical formulation. We omit the detailed discus­
sions for those cases.
3. Convergence of Market States in 
General Setting
In this section, we study the convergence properties of 
the market states (wealth and prices) generated by the 
sequential interactions between the traders and the 
market maker. We define the trading sequence as an 
infinite sequence of traders indexed by time, denoted 
by S  {j1,j2,:::,jt,:::} with jt ∈{1,:::,J}. We say a 
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

sequence S satisfies the infinite participation or simply 
the IP property, if for any j ∈{1,:::,J}, the set {t|jt 
j,jt ∈S} has infinite elements. We denote all trading 
sequences satisfying the IP property by Φ. In other 
words, Φ contains all trading sequences such that each 
trader interacts with the seller for an infinite number 
of times.11 Given a sequence S, we can define the trad­
ing process as follows (which is referred to as Trading 
Process 1):
Trading Process 1 (Trading Process)
Initialization: set y0  W0 · e, xj,0  wj,0 · e, ∀j  1,:::, 
J; S  {j1,j2,:::,jt,:::} ∈Φ is given;
Set t  1.
while True do
Select the j-th trader at time t as j  jt;
Solve z from problem Pj(xj,t) (or problem P+
j (xj,t)
if there is no bankruptcy constraint);
Update: 
yt+1  yt  z,
xj, t+1  xj, t + z:
t  t + 1
end
In Trading Process 1, we use pt  (p1,t,:::,pI,t), t  1, 
2,:::, to denote the instantaneous price of the securities 
at time t. Given yt, pt can be computed by (6). As 
t →∞, if xj,t and pi,t converge to some limits x∗
j and p∗
i, 
respectively, then we call x∗
j and p∗
i the limiting wealth 
allocation for trader j and the limiting price of the ith 
security. Some important questions naturally arise: Do 
the wealth allocation xj,t and the price pi,t generated 
from Trading Process 1 converge to a limiting alloca­
tion and a limiting price, respectively? If they do, what 
properties characterize the limiting wealth allocation 
and the limiting price?
To answer these questions, we first define the feasi­
ble set of all possible market states generated by the 
Trading Process 1 as follows:
A 
(
(x1,: : : ,xJ) | y +
X
J
j1
xj  wall
0 · e, U(y) ≥U(W0 · e),
Vj(xj) ≥Vj(wj,0 · e), (xj ≥0,if bankruptcy is
prohibitted) j  1, : : : ,J
)
:
(7) 
It is not hard to prove that the feasible set A is a com­
pact set. We then introduce the definition of Pareto opti­
mality of the wealth allocation with respect to the MU 
function Vj(·) for j ∈{1,2,:::,J}.
Definition 1. A wealth allocation (x∗
1,:::,x∗
J) is called a 
Pareto optimal allocation if the following two condi­
tions hold: (i) U(wall
0 · e  PJ
j1 x∗
j) ≥U(W0 · e); and (ii) 
there does not exist any (x1,:::,xJ) such that U(wall
0 ·
e  PJ
j1 xj) ≥U(W0 · e) and Vj(xj) ≥Vj(x∗
j) for all j ∈
{1,:::,J} with strict inequality holds for at least one 
j† ∈{1,:::,J}.
The Pareto optimal allocation means that, for each 
trader, it is not possible to increase its own utility 
without decreasing the utility of any other traders. All 
the Pareto optimal wealth allocations form the Pareto 
efficient set. The concavity of Vj(·) guarantees that any 
Pareto efficient wealth allocation can be achieved by 
some weighting parameters n  (ν1,:::,νJ) ∈RJ
+ \ {0}
(Mas-Colell et al. 1995) by solving the following opti­
mization problem:
Ppo(n) :
max
x1,:::,xJ
X
J
j1
νjVj(xj)
Subject to : y +
X
J
j1
xj  wall
0 · e,
U(y) ≥U(W0 · e),
(8)
xj ≥0,
j  1,:::,J
(if bankruptcy is prohibitted):
We then present our main result, which states that the 
Trading Process 1 converges to some Pareto optimal 
allocation.
Theorem 1. Under Assumptions 1, 2, and 3, the wealth 
allocation xj,t and yt generated from Trading Process 1 for 
any given trading sequence S ∈Φ converge to some limit 
x∗
j and y∗, that is, limt→∞xj,t  x∗
j for all j  1,:::,J and 
limt→∞yt  y∗, if either one of the following conditions 
holds: (i) dom(U)  RI; or (ii) dom(U) can be expressed 
as dom(U)  {y|y ≥L} with L < W0 · e and satisfies 
limyi→Li
∂U
∂yi  +∞and ∂U
∂yi is finite if yi ≠Li. Furthermore, 
the limiting allocation (x∗
1,:::,x∗
J) must be a Pareto optimal 
allocation.
In the previous result, two alternative conditions 
(condition (i) and (ii)) are imposed to ensure that the 
limit of wealth allocation is an interior point in the 
domain of the utility function. Condition (i) is easy to 
understand, whereas condition (ii) is a generalization 
of the Inada condition, which is commonly used in con­
ventional utility optimization. Theorem 1 states that, as 
the Trading Process 1 goes on, eventually, no trader 
would like to modify their wealth position anymore; 
that is, the wealth process (x1,t,:::,xJ,t) converges to 
some limiting wealth allocation. Moreover, the limiting 
wealth allocation (x∗
1,:::,x∗
J) must locate on the Pareto 
optimal set defined in Definition 1. The Pareto optimal­
ity of the limiting allocation formally confirms the theo­
retical foundations of prediction markets: a prediction 
market can indeed incentivize people to participate, 
and the limiting price is a “good price” in the sense that 
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

it is supported by a wealth allocation where the well- 
being (measured by utility level) of any trader cannot 
be improved anymore without decreasing some other 
traders’ utility.
Remark 2. We emphasize that the requirement S ∈Φ 
is necessary for achieving overall Pareto optimality. 
The trading process will still converge if one or more 
traders cease trading from time t>0, and the remain­
ing traders will still reach their own Pareto optimality. 
However, if a trader only interacts with the market 
maker for a finite number of times, then he/she may 
still be willing to trade after his/her last transaction 
but is deprived of that opportunity. Consequently, 
this trader’s final wealth, along with other traders’ 
wealth, may not be located in the Pareto optimal set.
A direct result of Theorem 1 is that the price of the 
security also converges to some limiting price. Such a 
limiting price can be computed as follows.
Corollary 1. When the assumptions in Theorem 1 are met 
and the trading process converges, the limiting price is 
given by
p∗
∇U(y∗)
∇U(y∗)⊤e ,
(9) 
where y∗is the market maker’s limiting wealth allocation 
defined in Theorem 1.
In the upcoming sections, we will study how the 
market forms prices by aggregating traders’ beliefs. To 
represent these beliefs, we use u  (θ1,:::,θI) ∈ΘI and 
pj  (π1,j,:::,πI,j) ∈ΘI to denote the market maker’s 
and the jth trader’s subjective beliefs (probabilities) on 
the outcomes, respectively. Unless otherwise stated, we 
assume that these beliefs remain constant throughout 
the trading process.
4. Exponential Utility and Risk 
Measure–Based Market
The previous section demonstrated market states con­
verging to Pareto optimal allocations but provided lim­
ited insight into how the market forms equilibrium 
prices. In this section, we explore two special cases: 
exponential utility-based and risk measure-based MU 
functions. We will derive the price convergence results 
for these market models.
4.1. Exponential Utility–Based Market
We first consider the exponential utility functions–based 
market. The exponential utility has a constant risk aver­
sion coefficient, which leads to trading decisions inde­
pendent of the trader’s wealth level (Makarov and 
Schornick 2010). This feature eliminates the wealth effect 
in the trading process and allows us to clearly illustrate 
the impacts of traders’ beliefs and risk preferences upon 
the limiting prices. It is important to note that adopting 
the exponential utility to price the security is equiva­
lent to using the LMSR pricing rule, which is a widely 
adopted mechanism (see Online Appendix EC.2.2 or 
Chen and Pennock 2007). Specifically, given market 
state vectors y  (y1,:::,yI) and xj  (x1,j,:::,xI,j) for 
j  1,:::,J, the market maker’s MU function and the jth 
trader’s utility function are
U(y)¢
X
I
i1
θi
1  eβ·yi
β
and
Vj(xj)¢
X
I
i1
πi,j
1  eαj·xi,j
αj
, j  1,:::,J,
(10) 
respectively, where β > 0 and αj > 0 are the risk aver­
sion coefficients for the market maker and the jth 
trader, respectively.
Because the exponential utility–based MU function 
satisfies the conditions outlined in Theorem 1, both 
wealth allocation and instantaneous prices converge to 
their respective limiting values. The following results 
characterize the evolution of market prices generated 
by Trading Process 1.
Proposition 4. In a market equipped with the exponential 
utility functions defined in (10), given the market state 
{xj,t,yt} with the price pt at time t, it has the following 
results: (a) If the jth trader trades with the market maker, 
then the optimal trading amount is z∗ (z∗
1,:::,z∗
I) with
z∗
i  1
βln
( ˆπi,j,t=pi,t)
β
αj+β
PI
k1 pk,t( ˆπk,j,t=pk,t)
β
αj+β
0
@
A, i  1,:::,I,
(11) 
where ˆπi,j,t ¢πi,j · eαjxi,j,t=(PI
k1 πk,j · eαjxk,j,t). (b) The 
price is updated to
pi,t+1 
(pi,t)
αj
αj+β · ( ˆπi,j,t)
β
αj+β
PI
k1 (pk,t)
αj
αj+β · ( ˆπk,j,t)
β
αj+β
, i  1,:::,I:
(c) As t →∞, for any S ∈Φ, price pt converges to the 
limiting price p∗ (p∗
1,:::,p∗
I), where
p∗
i 
θ
β
i
QJ
j1 π
αj
i,j


PJ
j1
αj+1
β
PI
k1
θ
β
k
QJ
j1 π
αj
k,j


PJ
j1
αj+1
β
, i  1,:::,I:
(12) 
The previous result demonstrates that the limiting price 
is precisely the geometric mean of the risk-adjusted 
beliefs held by all participants, including the traders 
and the market maker. It is worth noting that this limit­
ing price, p∗
i, remains unaffected by the realized trading 
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

sequence, represented by S, as long as S ∈Φ. Price For­
mulation (12) is closely connected to the concept of the 
logarithm opinion pool mentioned in Chakraborty and 
Das (2015).12 In Chakraborty and Das (2015), as it only 
focuses on the static trading model, it suggests one 
potential research direction as extending these findings 
to a market involving multiple agents engaging in 
repeated trading until market states converge. By pro­
viding an explicit outcome for this scenario, Proposi­
tion 4 addresses such a question raised by Chakraborty 
and Das (2015).
Remark 3. It is also important to note that, although 
the risk-neutral utility is a special case of the exponen­
tial utility,13 the result in Proposition 4 does not hold 
for the risk-neutral case as it needs the assumption β > 0 
and αj > 0 for all j  1,:::,J. Even if the market maker 
adopts the exponential utility, the whole trading process 
may not converge when traders are risk neutral because 
such a market does not meet the strict concavity condi­
tion in Assumption 2. Indeed, under the risk-neutral set­
ting, after the jth trader interacts with the market, the 
price of the ith security will be modified exactly to the 
jth trader’s belief, πi,j, which leads to price oscillation 
(see the detail in Online Appendix EC.1.7).
4.2. Risk Measure–Based Market
We demonstrated that the exponential utility–based 
market can converge to a unique limiting price, regard­
less of the trading sequence. This section delves deeper 
into the risk measure–based MU function, which exhibits 
a similar property under specific conditions. Although 
some literature (Hu and Storkey 2014, Frongillo et al. 
2015) has investigated the risk measure-based prediction 
market and developed convergence results, the existing 
studies provide limited information about the general 
convergence condition and the method to compute the 
limiting price. This section aims to complete these miss­
ing pieces.
We focus on the convex risk measures, which have 
emerged as a valuable tool in decision making due to 
their unique properties (F¨ollmer and Schied 2011). How­
ever, directly using the general convex risk measures to 
construct the MU functions in trading problem Pj(xj,t)
may not satisfy the convergence prerequisites outlined 
in Assumptions 1 and 2. To illustrate such a case, we 
provide a counterexample in Online Appendix EC.1.3 
(Example EC.1). To address this issue, we need additional 
mild conditions on the risk measure–based MU functions. 
Specifically, we assume the jth trader’s MU function and 
the market maker’s MU function are, respectively, con­
structed by some risk measures as follows:
Vj(xj)  ρj(xj), j  1,:::,J,
and
U(y)  ρ0(y),
(13) 
where ρj(·) : RI →R for j  0,1,:::,J are differentiable 
convex risk measures. Recall that a convex risk measure 
has the following dual representation (F¨ollmer and 
Schied 2011):
ρj(x)  sup
p∈ΘI
{p⊤x  αj(p)}   inf
p∈ΘI{p⊤x + αj(p)},
(14) 
where αj(·) : ΘI →R is called the penalty function for 
j  0,:::,J. We assume αj(·) is differentiable for all j 
0,:::,J and define its partial derivative as follows. For 
some p  (p1,p2,:::,pI) ∈ΘI, the derivative of αj(p) is 
denoted as
fi,j(pi)¢ ∂αj(p)
∂pi
,
i  1,:::,I, j  0,:::,J:
(15) 
If we impose some mild conditions on fi,j(·), then the 
market constructed by the risk measures will also con­
verge to a unique limiting state.
Proposition 5. If the functions {fi,j(·)}|I,J
i1,j1 defined in 
(15) satisfy the following two conditions: (i) fi,j(·) is continu­
ously differentiable and strictly increasing; and (ii) fi,j(1) is 
finite and limpi→0 fi,j(pi)  ∞for all i  1,:::,I and j  0, 
:::,J, then the MU function U(·)  ρ0(·) satisfies Assump­
tion 1, the MU functions Vj(·)  ρj(·), j  1,:::,J, satisfy 
Assumption 2. In addition, both Vj(·) and U(·) satisfy 
Assumption 3. Thus, the market constructed by (13) meets 
the conditions in Theorem 1 and the market state converges 
to a Pareto optimal allocation.
Based on the previous result, to check whether the 
market constructed by the risk measures (13) converges, 
we only need to check whether the penalty functions 
{αj(·)}|J
j0 meet the conditions in Proposition 5.
We then focus on characterizing the limiting wealth 
allocation and the corresponding limiting price. We 
have the following result.
Theorem 2. In a risk measure–based market that satisfies 
the condition in Proposition 5, the following results are 
true. (i) The limiting wealth allocation is the unique solu­
tion of problem Ppo(n) by setting n  e. (ii) For any trad­
ing sequence S ∈Φ, the unique limiting price generated 
by Trading Process 1 is p∗ ∇ρ0(y∗) where y∗ wall
0 ·
e  PJ
j1 x∗
j and (x∗
1,:::,x∗
J) are the solution of problem 
Ppo(e). Furthermore, the price vector p∗is given by p∗
arg minp∈ΘI
PJ
j0 αj(p) where αj(·) is defined in (14) for 
j  0,1,:::,J.
One surprising result of this theorem is that the limit­
ing price can be independent of the initial wealth alloca­
tion. The root cause is the translation invariance property 
of risk measures. Indeed, considering the jth trader’s 
decision problem, the objective function minz{ρj(wj,0 ·
e + z)} is equivalent to minz{ρj(z)}. Therefore, the initial 
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

wealth wj,0 can be eliminated from the individual prob­
lem. Hence, all subsequent trades become independent 
of the initial wealth. A similar observation holds for the 
market maker. As a result, the limiting y∗, which deter­
mines the limiting price p∗, is independent of the initial 
wealth allocation.
With the help of Theorem 2, it becomes feasible to 
explicitly compute the limiting price p∗when the for­
mulation of the risk measures ρj(·) is provided. We 
now consider a particular type of risk measure con­
structed using a dual formulation. We maintain the 
same notations as in Section 4.1, using {θi}|I
i1 and 
{πi,j}|I
i1 to represent the beliefs of the market maker 
and the jth trader, respectively. The following result 
establishes that the limiting price can be expressed as 
the power-weighted mean of all participants’ beliefs.
Corollary 2. Let hj ≥0, j  0,:::,J, be some parameters. If 
the penalty functions αj(·) take the following form: α0(p) 
 h0
γ (PI
i1 pi(pi=θi)γ1  1) and αj(p)   hj
γ (PI
i1 pi(pi=
πi,j)γ1  1) for j  1,:::,J with some γ < 1, then the lim­
iting price is
p∗
i 
h0 · θ
1γ
i
+ PJ
j1 hj · π
1γ
i,j

1γ
PI
k1
h0 · θ
1γ
k
+ PJ
j1 hj · π
1γ
k,j

1γ
(16) 
for i  1,:::,I.
Price Equation (16) shows that the limit price is 
a weighted power mean of the traders’ beliefs where 
the weight is a trader-dependent parameter hj. When 
γ →0, the penalty function becomes the Kullback-Leibler 
divergence, that is, α0(p)  h0
PI
i1 θi log(pi=θi) with 
αj(p)  hj
PI
i1 πi,j log(pi=πi,j) for j  1,:::,J, and the 
corresponding limiting price becomes the arithmetic 
weighted mean of trader beliefs. Regarding the selection 
of parameter hj, one particular choice is the initial wealth 
of each trader. In some applications, such as the artificial 
prediction market (Chakravorti et al. 2023), these para­
meters can be viewed as the hyperparameters that con­
trol the overall model performance.
5. Limiting Price for CRRA Utility
5.1. Price Variability
The preceding section demonstrates that, under certain 
conditions, the price sequence produced by the expo­
nential utility–based and risk measure–based markets 
can converge to a unique limit price for any trading 
sequence that satisfies the IP property. This motivates 
us to inquire if a similar outcome can be extended to 
more commonly used utility functions. In this section, 
we mainly explore a market model constructed by 
the utility with constant relative risk aversion (i.e., 
CRRA utility). The CRRA utility enjoys widespread 
use in economic modeling and analysis. In the CRRA 
utility–based market, we assume the market maker’s 
and the jth trader’s MU functions are
U(y)  1
γm
X
I
i1
θi · y
γm
i
and
Vj(xj)  1
γ
X
I
i1
πi, j · xγ
i, j,
j  1, : : : , J,
(17) 
respectively, where γ < 1 and γm < 1 are the traders’ 
and market maker’s risk aversion parameters, respec­
tively; y ∈RI and xj ∈RI are the wealth vectors; and 
(θ1,:::,θI) ∈ΘI and (π1,j,:::,πI,j) ∈ΘI are the associ­
ated subjective beliefs as we defined in previous 
sections.
Under the previous setting, the trader’s decision 
problem Pj(xj) generally lacks a closed-form solution. 
Nonetheless, when all participants have identical risk 
parameters, the trader’s decision can be solved as 
follows.
Proposition 6. In the CRRA utility–based market defined 
by (17) with γ  γm, given {xj,t}|J
j1 and yt at time t, 
the solution of the jth trader’s decision problem Pj(xj,t) is 
z∗
i  (yi,t · κi,j  xi,j,t · λ∗
j)=(λ∗
j + κi,j) for i  1,:::,I, and the 
market states are updated to
yi,t+1 
λ∗
j
κi,j + λ∗
j
(xi,j,t + yi,t),
xi,j,t+1 
κi,j
κi,j + λ∗
j
(xi,j,t + yi,t),
(18) 
where κi,j ¢(πi,j=θi)
1γ, for i  1,:::,I and j  1,:::,J, and 
λ∗
j > 0 is the solution to the following equation:
X
I
i1
λ∗
j
λ∗
j + κi,j
(xi,j,t + yi,t)
 
!γ
θi  Wγ
0:
(19) 
This proposition shows that in a CRRA utility–based 
market, the initial wealth of each trader is recursively 
adapted into the wealth vector yt of the market maker. 
Hence, the limiting y∗may be affected by the initial 
wealth allocation, as opposed to the risk measure- 
based markets. The following example demonstrates 
how the initial wealth, risk parameters, and trading 
sequence could affect limiting prices.
Example 1. We consider a CRRA utility–based market 
with three assets (I  3) and two traders (J  2) whose 
beliefs are p1  (0:2,0:2,0:6) and p2  (0:6,0:1,0:3), re­
spectively. The market maker’s parameters are θ1 
θ2  θ3  1=3, W0  5 and γm  γ. The two traders’ ini­
tial wealth are w1,0  w1 and w2,0  w2, where we vary 
the parameters (w1,w2) to examine their impact on the 
limiting prices. In Trading Process 1, we consider two 
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

trading sequences: S1  {1,2,1,2,:::} and S2  {2,1,2, 
1,:::}.14 Figure 1(a) depicts the utility value trajecto­
ries generated by these trading processes for different 
(w1,w2) when γ  0:5. The Pareto efficient frontier 
(represented by the solid line) is obtained by solving 
problem Ppo(n) for different n. This figure illustrates 
that, for a given wealth distribution and fixed trading 
sequence (either S1 or S2), the utility value trajectories 
indeed converge to points on the Pareto efficient fron­
tier, confirming the result in Theorem 1. However, 
even for identical initial wealth, different trading se­
quences may generate different utility paths (and 
hence different limiting prices). Figure 1(b) demon­
strates the impact of the risk parameter. It shows the 
price trajectories of p1,t and p3,t when w1  w2  10 for 
the trading sequence S1. This illustration makes it 
clear that a change in the risk aversion parameter, for 
example, from γ  0:5 to γ  0:7, affects the limiting 
prices. Table 1 provides details of the limiting prices 
for different (w1,w2) and γ. A closer examination 
reveals that even with fixed initial wealth, the limiting 
price may vary under different trading sequences, 
although both S1 and S2 satisfy the IP property.15
However, among these factors, the trading sequence 
has less impact than the initial wealth and the risk 
parameter.
As demonstrated in Example 1, the trading se­
quence can impact the limiting price. A key observa­
tion for understanding this phenomenon is that S1 
can be equivalently viewed as S2 preceded by an extra 
Trader 1 action. Such an action results in an initial 
market state different from that of the original S2. As 
Proposition 6 suggests, different initial wealth results 
in a different limiting price. Thus, the limiting prices 
for the two sequences S1 and S2 are different. To illus­
trate, we consider Example 1 with w1  w2  10. The 
extra action of S1 (the first trade) yields market states 
x1  (7:49,7:49:13:50), x2  (10,10,10), and y  (7:51,7:51, 
1:50). After the first trade, sequence S1 becomes iden­
tical to S2. However, for S2, the initial condition is 
x1  (10,10,10), x2  (10,10,10), and y  (5,5,5), which 
is different from the states obtained from S1 after the 
first trading, thus the two sequences result in different 
limiting prices.
Figure 1. (Color online) Utility and Price Trajectories in Example 1
(a)
(b)
Notes. (a) Trajectory of the utility. (b) Trajectory of the price.
Table 1. Limiting Wealth Allocation and Price in Example 1
Wealth
Risk
Trading sequence
Limiting price
w1
w2
γ
p∗
p∗
p∗
0.5 (0.7)
S1 :
0.4044 (0.3959)
0.1839 (0.1849)
0.4117 (0.4192)
S2 :
0.4045 (0.4004)
0.1838 (0.1841)
0.4117 (0.4155)
0.5 (0.7)
S1 :
0.4436 (0.4449)
0.1745 (0.1726)
0.3819 (0.3825)
S2 :
0.4440 (0.4800)
0.1743 (0.1741)
0.3817 (0.3459)
0.5 (0.7)
S1 :
0.3624 (0.3463)
0.1933 (0.1959)
0.4443 (0.4578)
S2 :
0.3621 (0.3776)
0.1933 (0.2044)
0.4446 (0.4180)
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

Practically, traders interact with the market maker ran­
domly, leading to a random trading path. Consequently, 
the limiting price becomes a trading sequence–dependent 
random variable. In the following theorem, we character­
ize the limiting price for a given trading sequence and 
demonstrate that price invariance can be achieved when 
the trader population is large.
Theorem 3. For the CRRA utility–based market, we have 
the following results: 
i. Given a trading sequence S ∈Φ, the Trading Process 
1 converges to the limiting wealth allocation {x∗
j} character­
ized by problem Ppo(n∗) with some weights n∗ (ν∗
1,:::, 
ν∗
J) ∈RJ
+ \ {0}; and the limiting price is given by
p∗
i  ξ∗
i
X
I
k1
ξ∗
k,
i  1,:::,I,
(20) 
where j∗ (ξ∗
1,:::,ξ∗
I) is the unique solution to the following 
equations:
ξ∗
i 
PJ
j1 (ν∗
jπi,j)
1γ
+ (ξ∗
i)
γγm
(1γ)(1γm) · L(j∗,u) · W0 · θ
1γm
i
wall
0
0
B
B
B
B
B
B
@
C
C
C
C
C
C
A
1γ
,
i  1,:::,I
(21) 
where L(j,u)¢
PI
k1 θk(θk=ξk)
γm
1γm 1
γm.
ii. In Trading Process 1, if traders’ beliefs pj and initial 
wealth wj,0 are independently and identically distributed 
random variables for j  1,:::,J; with each trader having an 
equal probability of trading with the market maker at each 
trading instance, then the solution {ξ∗
i}|I
i1 defined in Equa­
tion (21) and the associated limiting price {p∗
i}|I
i1 generated 
by each trading sample path converge almost surely to a pair 
of constant vectors as the trader population J →∞.
The first result in Theorem 3 provides an explicit 
method for computing the limiting price p∗for a speci­
fic trading sequence with the associated weighting 
parameters n∗. It is worth noting that the functional 
form of the limiting price (20) and (21) remains consis­
tent, as the influence of the trading sequence is solely 
reflected through the weights n∗. The second result in 
Theorem 3 is an interesting product of the price for­
mula. One can consider it a prediction market analogue 
of the “Law of Large Numbers.” It implies that in a ran­
domly trading market with a large trader population, 
the variation of limiting price induced by different trad­
ing sequences becomes asymptotically negligible. This 
underscores the significance of trader participation in 
prediction markets, as it not only enhances liquidity but 
also increases the stability of limiting prices. Imagine 
a prediction market that yields predictions (limiting 
price) that are heavily dependent on the trading se­
quence. In such a case, one cannot know whether its 
prediction truly represents the overall beliefs or only hap­
pens to be a biased result of a specific trading sequence. 
Such uncertainty will undermine the interpretability of 
prices and jeopardize the prediction accuracy.
Theorem 3 also provides several potentially useful 
insights for market design. Combining (20) and (21), 
the limiting price has the following decomposition:
p∗
i 
0
B
B
B
B
@
PJ
j1(νjπi, j)
1γ
(PI
k1 ξ∗
k)
1γwall
0
+ (p∗
i)
γγm
(1γ)(1γm) · L(p∗, u)W0θ
1γm
i
wall
0
C
C
C
C
A
1γ
,
i  1, : : : , I:
(22) 
This decomposition can be explained as follows. First, 
a smaller initial wealth W0 can reduce the market 
maker’s impact on the limiting price. Second, a market 
maker with higher risk aversion (smaller γm) also 
diminishes its influence on the limiting price because 
(p∗
i)(γγm)=((1γ)(1γm)) is a decreasing function of γm for 
p∗
i ∈(0,1). Third, the function L(p∗,u) exhibits an 
intriguing suppressive effect designed to mitigate the 
price distortion caused by the market maker’ external­
ity. To explain further, L(p∗,u) reaches its maximum 
value of one when p∗ u. When the market consensus 
p∗significantly deviates from the market maker’s belief 
u, the term L(p∗,u) lessens its impact, effectively reduc­
ing the market maker’s influence on the limiting price. 
It is worth noting that such a suppressive effect stems 
from the utility-preserving condition (8), underscoring 
the additional benefits of the MU-based mechanism.
With the previous results, in the next section, we 
investigate how to approximate the limiting price under 
a finite trader scenario by choosing an appropriate 
weight n∗.
5.2. Heuristic Weighting Parameters and 
Price Formula
The previous section has emphasized the vital role of 
determining the weighting parameters, n∗, in solving 
problem Ppo(n∗) to establish the limiting price. Given 
the practical difficulty of obtaining the “true” weighting 
parameters n∗before trading converges, we propose an 
approximation using deterministic weights. Drawing 
inspiration from previous analysis, which highlights 
Pareto optimality of the limiting wealth allocation and 
underscores the significance of both the initial wealth 
distribution wj,0 and the risk parameter γ in shaping 
the limiting price (Table 1), we introduce the concept of 
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

POI weights, denoted as ˆn  ( ˆν1,:::, ˆνJ) and defined as
ˆνj  (wj,0)1γ, j  1,:::,J:
(23) 
Applying Theorem 3, we replace n∗with the POI 
weights ˆn in Equation (21) to calculate the associated 
POI limiting price, denoted as ˆp  ( ˆp1,:::, ˆpI), with its 
components given as follows:
ˆpi  ˆξi
X
I
k1
ˆξk,
i  1,:::,I,
(24) 
where ˆj  ( ˆξ1,:::, ˆξI) is the unique solution of the fol­
lowing equation:
ˆξi 
PJ
j1 wj,0 · π
1γ
i,j + ˆξ
γγm
(1γ)(1γm)
i
· L(ˆj,u) · W0 · θ
1γm
i
wall
0
0
B
@
C
A
1γ
,
i  1,:::,I:
(25) 
Now, we provide some interpretation for the POI limit­
ing price. Equation (25) implies that the price ˆpi is 
directly linked to a weighted average that considers all 
participants’ wealth and risk-adjusted beliefs regarding 
the ith asset. More specifically, the term PJ
j1 wj,0 ·
π1=(1γ)
i,j 
represents the average risk-adjusted belief con­
tributed from all the traders weighted by their own 
wealth. In contrast, the term ˆξ
(γγm)=((1γ)(1γm))
i
· L(ˆj,u) ·
W0 · θ
1=(1γm)
i 
that combines the risk difference and belief 
divergence controls the contribution of market maker’s 
risk-adjusted belief in such a price.
POI Price Equation (24) and (25) encompass specific 
market scenarios as special cases. When both market 
maker and traders adopt the logarithmic utilities, that 
is, γ  γm  0 in (17), Equation (25) will simplify to
ˆξi 
PJ
j1 wj,0 · πi,j + L0(ˆj,u) · W0 · θi
wall
0
,
i  1,:::,I,
(26) 
where L0(ˆj,u)  exp(PI
k1 θk log(θk= ˆξk)) represents the 
exponential of Kullback-Leibler divergence (KLD) between 
u and ˆj. If we further set L0(ˆj,u) ≡1, then Price Equa­
tion (24) becomes the wealth-weighted average of mar­
ket beliefs discussed in Sethi and Vaughan (2016).
We highlight that the solution methodology for deriv­
ing the CRRA utility–based limiting price, for example, 
Equation (21) and POI Weights (23), remain applicable 
even when market participant’s MU functions extend 
beyond the CRRA family of utilities. One example is the 
hybrid market model where the market maker adopts 
exponential utility, as given by Equation (10), whereas 
the traders adopt logarithmic utility. In this scenario, the 
POI limiting price remains the same as (24), but the 
equations for ˆj become
ˆξi 
PJ
j1 wj,0 · πi,j + 1
β ˆξi log θi=
ˆξi
PI
k1 ˆξk


XJ
j1wj,0
,
i  1,2,:::,I:
(27) 
We provide more details of Equation (27) in Online 
Appendix EC.1.5. Our numerical experiments (given 
in Online Appendix EC.1.5) demonstrate that Price 
Equation (27) outperforms the conventional wealth- 
weighted average price reported in Sethi and Vaughan 
(2016). The CRRA utility–based pricing formula can 
also be extended to a more comprehensive market 
model where all participants adopt utilities with hyper­
bolic absolute risk aversion (HARA utility). A brief dis­
cussion of this model is presented in Online Appendix 
EC.1.6.
5.3. Evaluation of Approximation Scheme
In this section, we first use simulation to validate the 
accuracy of the POI weights (23) and Price Equation 
(24) in estimating the true weighting coefficients and 
the true limiting price, respectively. Following this 
validation, we proceed to examine how the risk para­
meters and initial wealth impact the accuracy of our 
approximation.
We consider a CRRA utility–based market with I  3, 
W0  10, and θ1  θ2  θ3  1=3. Traders are randomly 
generated as follows. The jth trader’s belief is sampled 
from pj  α · ¯p + (1  α) · =||, where ¯p is the baseline 
belief evenly sampled from (0:6,0:2,0:2) and (0:2,0:2, 
0:6);  is uniformly distributed random noise on [0,1]3, 
and α  0:5 controls the market belief structure. We 
conduct simulations according to Trading Process 1, 
with each trader randomly selected with equal proba­
bility to interact with the market maker at each time 
period. For each set of parameters, we perform N  5 × J 
rounds of simulation, and we denote the kth sample of 
the limiting wealth allocation as {xsim
1 (k),:::,xsim
J 
(k)}|N
k1. 
• Evaluation by limiting wealth: To verify the accuracy 
of the POI weights (23), we first solve the problem 
Ppo(ˆn) whose solution is denoted as {ˆx1,:::, ˆxJ}. If the 
heuristic weight ˆn provides an accurate approximation 
for the “true” weighting parameter, then the wealth 
allocation {ˆx1,:::, ˆxJ} should be close to the sample lim­
iting wealth allocation {xsim
1 (k),:::,xsim
J
(k)}|N
k1 gener­
ated by the simulation. We introduce the following 
quantity to measure the difference for each sample:
δx(k)¢
X
J
j1
‖xsim
j
(k)  ˆxj‖=
X
J
j1
‖xsim
j
(k)‖, 
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

for k  1,:::,N. The sample mean and variance of δx(k)
is denoted by E[δx] and Var[δx], respectively.
• Evaluation by limiting price: We denote the price 
associated with the kth sample of limiting wealth as 
psim(k), and we compute the POI price ˆp using (24). To 
measure the difference between these prices, we use the 
KLD, that is, given two prices pa,pb ∈∆I, the KLD of 
these prices is defined as D(pa,pb)¢PI
i1 pa
i ln(pa
i =pb
i ). 
We then denote the KLD between the kth sample price 
psim(k) and the POI price ˆp as δp(k)¢D(psim(k), ˆp)
for k  1,:::,N. We then compute the sample mean 
and sample variance of δp(k) as E[δp] and Var[δp], 
respectively.
Table 2 reports the comparative results for different 
setups (γm,γ ∈{2,0:5} and J ∈{50,100,200,400}). For 
each set of risk parameters, denoted as (γm, γ), we list 
the results for different values of J. The results clearly 
show that, regardless of the different settings, the POI 
weights (23) and the POI price (24) perform exception­
ally well, exhibiting minimal disparities in both wealth 
and price. A closer examination reveals several notewor­
thy patterns. First, for a fixed set of risk parameters γm 
and γ, increasing the trader population J enhances the 
accuracy of our approximation. This enhancement is evi­
dent as all error and variation indicators decrease with 
the increase in J. Of particular significance is the observa­
tion that Table 2 also highlights a notable decrease in 
approximation variances, Var[δx] and Var[δp], with a 
larger population. This reduction in variance can be 
attributed to the decrease in variation stemming from 
the trading sequence. Consequently, this pattern con­
firms the second result outlined in Theorem 3, which 
posits that a larger population leads to a more stable 
limit price. Second, for a given trader population, the 
approximation error is smaller in scenarios with γm 
2 compared with those with γm  0:5, suggesting that 
our approximation is more accurate for higher levels of 
risk aversion.
We proceed to examine how the risk parameters and 
initial wealth affect the quality of our approximation. 
To better illustrate the impact of these parameters, we 
introduce the conventional wealth-weighted price for­
mula from Sethi and Vaughan (2016) as a benchmark, 
denoted as ˘p  (˘p1,:::, ˘pI), where
˘pi 
θi · W0 + PJ
j1 wj,0πi,j
W0 + PJ
j1 wj,0
, i  1,:::,I:
(28) 
We follow a simulation procedure similar to that in 
Table 2, using a fixed J  50 and γm  0:5. To high­
light the impact of traders’ risk parameter γ, we vary 
its values and compare the resulting limiting prices 
obtained from the simulation with two heuristic price 
formulas: (24) and (28).
In Figure 2(a), the dash-dot curve represents the 
average price of the first security resulting from 
n  250 rounds of simulations, which exhibits an 
upward trend as γ increases. Importantly, our POI 
price Equation (24) effectively captures this trend, as 
indicated by the solid curve. In contrast, the conven­
tional wealth-weighted Equation (28) fails to exhibit 
such a distinct pattern as it does not account for the 
risk parameter. Figure 2(b) illustrates the approxima­
tion errors of the two heuristic prices where D( ¯psim, ˆp)
and D( ¯psim, ˘p) measure the KLD between the simu­
lated average price and the two heuristic prices, respec­
tively. Notably, when γ deviates from zero, especially 
when it is below zero, our price Equation (24) signifi­
cantly outperforms the conventional wealth-weighted 
Equation (28).
Table 2. Verification of Approximation Scheme
Market parameters
Price difference
Wealth difference
γm
γ
J
E[δp]
Var[δp]
E[δx]
Var[δx]
2
2
1.71 × 105
5.75 × 1010
5.75 × 104
9.30 × 108
2
2
8.84 × 106
2.61 × 1010
2.48 × 104
1.76 × 108
2
2
2.54 × 106
1.35 × 1011
1.84 × 104
1.31 × 108
2
2
1.51 × 106
4.52 × 1012
1.26 × 104
6.06 × 109
2
0.5
1.04 × 104
1.35 × 108
9.69 × 104
2.31 × 107
2
0.5
4.33 × 105
1.75 × 109
4.29 × 104
4.10 × 108
2
0.5
3.20 × 105
1.17 × 109
2.50 × 104
1.79 × 108
2
0.5
1.91 × 105
5.48 × 1010
1.35 × 104
6.37 × 109
0.5
2
5.08 × 105
3.60 × 108
2.77 × 103
6.64 × 106
0.5
2
1.84 × 105
1.78 × 108
9.70 × 104
1.42 × 106
0.5
2
5.34 × 106
2.00 × 1010
5.09 × 104
2.45 × 107
0.5
2
2.01 × 106
7.94 × 1011
3.66 × 104
8.11 × 108
0.5
0.5
3.83 × 105
1.20 × 109
2.89 × 103
2.03 × 106
0.5
0.5
1.95 × 105
2.23 × 1010
1.34 × 103
3.24 × 107
0.5
0.5
8.61 × 106
3.38 × 1011
6.70 × 104
6.12 × 108
0.5
0.5
2.15 × 106
3.47 × 1012
3.18 × 104
1.77 × 108
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

We then investigate the impact of the market maker’s 
initial wealth W0, which is a key design variable for pro­
viding liquidity. Holding γm  γ  1, we raise W0 
from 5 to 100. In Figure 3(a), the limiting price decreases 
as W0 increases. This is because the price becomes 
increasingly biased toward the market maker’s own 
belief (i.e., θi  1=3) as its wealth grows. Both Equations 
(24) and (28) display a similar trend. However, our price 
Equation (24) closely tracks the limiting price, whereas 
the conventional one (28) tends to overestimate it signif­
icantly. Figure 3(b) provides a more detailed compari­
son of these approximation errors by evaluating the 
KLD. It becomes evident that our POI price Equation 
(24) not only demonstrates greater accuracy but also 
exhibits much higher stability than Equation (28) when 
varying the market maker’s wealth W0. This character­
istic highlights that the quality of our heuristic price 
Equation (24) is not sensitive to fluctuations in the 
Figure 2. (Color online) Comparison of Two Heuristics for Different Risk Parameters 
(a)
(b)
Notes. (a) Prices and γ. (b) KLD and γ.
Figure 3. (Color online) Comparison of Two Heuristics for Different Initial Wealth 
(a)
(b)
Notes. (a) Prices and W0. (b) KLD and W0.
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

market maker’s wealth level. Such a property may bene­
fit the market maker in customizing the market-making 
mechanism.
In summary, the combination of the POI weights 
(23) with Equation (21) offers an accurate estimation 
of the limiting price across various market scenarios. 
Although such a price formula is not entirely analyti­
cal, the parameters ξ∗
i, given in Equations (21) provide 
comprehensive information on how the price is aggre­
gated based on participants’ beliefs, risk attitudes, and 
wealth levels.
6. Price-Volume Relationship, Forward- 
Looking Traders, and Nonstation­
ary Market
In this section, we provide analysis of the price-volume 
relationship resulted from our model, explore the impact 
of trader’s forward-looking decision, and discuss the 
market behavior in a nonstationary market.
6.1. Price-Volume Relationship
Similar to the microstructure analysis in the financial 
market, studying the relationship between the price and 
trading volume reveals how prices evolve during trad­
ing. To examine this, we consider the tth round of trad­
ing where the jth trader interacts with the market maker 
according to Trading Process 1. Here, we can view the 
trader in each time period as a group of traders. For 
instance, the jth trader represents a group of traders 
holding similar beliefs with the wealth being the aggre­
gate wealth. Therefore, the order size in each round of 
trading represents an aggregate order for a group of tra­
ders. For simplicity, we consider a market with binary 
securities (I 2). The jth trader solves problem Pj(xj,t) to 
determine the optimal decision z∗ (z∗
1,z∗
2). Because the 
two securities are mutually exclusive, the trading vol­
ume is only related to the net demand Dt ¢∆q∗
1  ∆q∗
2 
z∗
1  z∗
2 where ∆q∗
i is the amount of the order. The mutual 
exclusiveness also implies the prices pt  (p1,t,p2,t) satis­
fies p1,t  1  p2,t. We then examine the relationship 
between the net demand Dt and the security’s price p1,t 
for different market settings.
As the exponential MU function-based market admits 
a closed-form solution for trading problem Pj(xj), it is an 
ideal vehicle to study the price-volume relationship. 
Using Expression (11) in Proposition 4, we can compute 
the net demand as
Dt  z∗
1  z∗
2 
αj + βln
ˆπ1,j,t(1  p1,t)
(1  ˆπ1,j,t)p1,t



αj + β
ln
ˆπ1,j,t
1  ˆπ1,j,t


 ln
p1,t
1  p1,t




,
(29) 
where ˆπi,j,t is defined in Proposition 4. We observe that 
the volume Dt is proportional to the difference between 
the log odds of the jth trader’s belief and the security 
price. The demand Dt decreases as the price p1,t in­
creases, indicating a higher demand for the security 
with lower price.
Conversely, for a fixed price p1,t, the demand Dt 
depends on the trader’s utility-adjusted belief ˆπ1,j,t. A 
trader trades more security if ˆπ1,j,t deviates further 
from the price. It is also evident that the net trade vol­
ume is discounted by a factor 1=(αj + β). That is to say, 
even if two traders have identical subjective beliefs, the 
trader who is more risk-averse trades less security than 
the one with less risk aversion. This finding further 
demonstrates the importance of including the risk 
parameter in our approximated price Equation (25).
The previous price-volume relationship also holds 
for the CRRA utility–based market. We slightly modify 
the market in Example 1 by aggregating the first 
two securities as a single security, which gives a binary 
market. That is, the two traders’ beliefs become π1 
(0:4,0:6) and π2  (0:7,0:3). Figure 4 plots trader 2’s net 
demand as a function of p1,t for different parameters, 
that is, γm,γ ∈{0:5, 0:5} and W0 ∈{5,10}. Clearly, we 
can observe the pattern that the net demand is nega­
tively correlated with the price and the risk aversion 
parameter. In addition, this figure also indicates that 
when the market maker has larger wealth, it may pro­
vide higher trading volume (higher liquidity).
6.2. Forward-Looking Traders
Our market model is based on the assumption of tra­
ders making one-period myopic trading decisions. It 
is beneficial to comprehend both the trader’s decision- 
making process and the resultant market price behav­
ior by examining scenarios where traders adopt a 
Figure 4. (Color online) Demand as Function of Price for 
CRRA Utility 
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

forward-looking (FL) trading model. To simplify the 
discussion, we compare the myopic decision model 
(i.e., problem Pj(xj,t)) with a two-period decision prob­
lem, which serves as a proxy for the FL decision model. 
In this FL decision model, the FL trader interacts with 
the market at t0 and t1 (with t1 > t0). Different from the 
myopic model, at time t0, the FL trader aims to maxi­
mize the utility at time t1. Between the two trading 
instances t0 and t1, other traders also interact with the 
market, leading to variations in the market state. To 
model this effect, we introduce a binary random vector 
 ∈RI which has two values,   u with probability φ 
and   d with probability 1  φ. The probability φ 
reflects the trader’s belief concerning the potential mar­
ket state movements (increasing or decreasing). Given 
the impact of market state on prices, φ can be viewed as 
a forecast of price movement. The FL trader’s decision 
problem is formulated as follows:
PFL :
max
zt0,zu
t1,zd
t1
φ · V(xt1 + zu
t1) + (1  φ) · V(xt1 + zd
t1)
Subject to yu
t1  yt0  zt0 + u, yd
t1  yt0  zt0 + d,
(30)
xt1  xt0 + zt0,
U(yt0  zt0) ≥U(W0 · e),
U(yu
t1  zu
t1) ≥U(W0 · e),
U(yd
t1  zd
t1) ≥U(W0 · e), 
where zt0 represents the decision variable at time t0, 
and zu
t1 and zd
t1 are the decisions at time t1 associated 
with the two scenarios ( ∈{u,d}). Constraint (30) 
depicts the market state at time t1.
We then consider an example with two assets to com­
pare the trading decisions generated by the mypoic 
model (i.e., problem Pj(xj,t)) and the FL model (PFL). 
We solve the myopic decision problem and the FL deci­
sion problem by varying the parameter φ ∈[0,1].
Figure 5(a) compares the optimal decisions from the 
two models at t0 and t1 in response to the prediction of 
future price movement (i.e., φ). Specifically, zt0,1 |Myo 
and zt0,1 |FL represent the optimal wealth allocation on 
the first security obtained by the myopic model and the 
FL model at period t0, respectively. Similarly, zu
t1,1| FL 
and zd
t1,1 |FL are the time t1’s decision generated by the 
FL model. Figure 5(b) displays the associated posttrad­
ing price for the first security after period t1, incorporat­
ing the impact of the random shock u or d.
Figure 5(a) shows that the myopic decision zt0,1 |Myo 
is independent of φ. In contrast, the FL trader exhibits 
an interesting speculative behavior. It is worth noting 
that the price at time t0 is pt0  (0:5,0:5). In the absence 
of any trading, two shocks, u and d, may move the 
price to pu  (0:8,0:2) and pd  (0:2,0:8), respectively. 
In Figure 5(a), we consider the scenario with a small 
value of φ indicating a strong belief in d. The FL trader 
tends to significantly short security one at time t0, antic­
ipating a drop in price from 0.5 to 0.2. At time t1, if the 
realized state is d, then the trader may long security 
one (i.e., zd
t1,1 |FL > 0), as the downward price of 0.2 is 
much lower than his/her belief π1  0:9. Conversely, if 
the realized state is u, then the FL trader has little 
Figure 5. (Color online) Comparison Between Myopic and Forward-Looking Trading Decisions 
(a)
(b)
Notes. (a) Optimal wealth allocation on first security. (b) Posttrading price at t1. These figures are plotted under the following setting. In model 
(PFL), the utility functions are U(y)  θ1 ln(y1) + θ2 ln(y2) and V(x)  π1 ln(x1) + π2 ln(x2). The trader’s belief is (π1,π2)  (0:9,0:1) and the wealth 
position is xt0  (1,1). The market maker’s initial wealth and beliefs are W0  3 and (θ1,θ2)  (0:5,0:5), with the market state yt0  (1,1). The ran­
dom shocks generated by the other traders are u  (1:5,3) and d  (3, 1:5).
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

incentive to trade significantly (i.e., zu
t1,1 |FL is around 0), 
because the upward price of 0.8 is close to his/her belief 
π1  0:9. Figure 5(b) illustrates the posttrading price 
after t1. One can observe that the resulting price gener­
ally aligns closer to the trader’s belief (0:9,0:1) than in 
the myopic case, except when the FL trader’s belief in a 
price rise is small, but it turns out that the price goes 
up. This observation suggests that FL behaviors could 
magnify the influence of an individual trader in shap­
ing the limiting price.
6.3. Nonstationary Market
All the previous analyses are based on the stationary 
assumption; that is, we assume that no new information 
comes to the market during trading. However, in real­
ity, most prediction markets run for several months, 
and when an event shocks the market, traders’ beliefs 
are significantly changed. To show how new informa­
tion affects security prices, we consider two situations: 
the shock happens at an early stage (before price con­
vergence), and the shock happens at a late stage. We 
adopt Example 1 for illustration. The shock changes the 
traders’ beliefs on the second security, that is, the origi­
nal beliefs, π1  (0:2,0:2,06) and π2  (0:6,0:1,0:3) are 
modified to ˆπ1  normalize{(0:2,0:2,0:6) + (0,1,0)} 
(0:1,0:6,0:3) and ˆπ2  normalize{(0:6,0:1,0:3) + (0,1, 
0)}  (0:3,0:55,0:15), respectively. Figure 6(a) displays 
the trajectories of two traders’ utilities. The solid line 
and dash-dot line indicate the Pareto optimal frontiers 
of utility values generated by the original and modified 
beliefs, respectively. We can observe that, regardless of 
when the shock occurs, the utilities ultimately converge 
to the new Pareto-optimal set (i.e., the solid curve and 
the dashed curve indicate the Pareto-optimal sets for 
the market with and without the shock, respectively). 
However, the position of the limiting points varies. 
Figure 6(b) illustrates the trajectory of the first security’s 
price, p1,t. Similar to the utility values, when new infor­
mation enters the market, the price p1,t responds rap­
idly to this new information. It is important to note that 
the limiting prices resulting from early and late shocks 
are different. This is a straightforward consequence of 
Theorem 3, which indicates that all traders’ initial con­
ditions and beliefs determine the limiting price. If we 
consider the time at which the shock occurs as the new 
starting point, early and late shocks produce different 
initial conditions, thus potentially leading to different 
limiting prices.
7. Conclusion
This paper studies the prediction market convergence 
properties through the utilization of the MU-based 
market-making mechanism. This mechanism not only 
consolidates various existing market-making methods 
under specific conditions but also establishes a frame­
work for examining the dynamic trading process 
within a market featuring a single market maker and a 
finite number of traders. Within this framework, we 
address one fundamental question arising in the pre­
diction market: the formation of the limiting price 
(final price) by all market participants. We establish, 
under mild conditions, that traders’ wealth processes 
converge to a limiting wealth distribution, resulting in 
Pareto optimal utility levels for all participants. This 
outcome enables us to explore the limiting price across 
different market types. In exponential utility markets, 
Figure 6. (Color online) Utility and Price Trajectories After Shock 
(a)
(b)
Notes. (a) Utility trajectories. (b) Price trajectories.
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

we present an explicit formula for the limiting price. 
For convex risk measure–based markets, we introduce 
a method to design MU functions via penalty functions 
and demonstrate that the limiting price is uniquely 
determined as a weighted power mean of trader beliefs. 
Regarding CRRA utility-based markets, we character­
ize the limiting price through a system of equations. 
Additionally, we present a theoretical result indicating 
that the impact of trading sequence variation becomes 
negligible as the trader population increases. This novel 
finding enables us to formulate an approximate price 
formula, suggesting that the limiting price can be con­
structed as a wealth-weighted risk-adjusted average of 
all participants’ beliefs. Numerical experiments validate 
the high accuracy and robustness of this approximation.
There are several promising directions for future 
research. First, although this work has derived price 
formulas under various theoretical settings, a critical 
next step is the empirical validation of these results 
using real market data.
Second, our model is built on the stationary assump­
tion that participants’ beliefs remain constant. In real- 
world trading, traders and market makers typically 
adaptively revise their beliefs based on new informa­
tion. Although our preliminary analysis in Section 6
indicates that changes in traders’ beliefs can result 
in significant shifts in the limiting price, it remains 
unknown how traders and market maker should in­
corporate this new information into their decision- 
making process as part of a learning process. A recent 
study by Birge et al. (2021) analyzes the profit maximi­
zation problem for market makers in the spread bet­
ting market, where the market maker may learn the 
distribution of event outcomes during trading. To 
address the potential profit loss that Bayesian policies 
may suffer in the presence of strategic bettors, they 
propose a new policy that balances learning with 
bluff-proofing. Another crucial issue is information 
asymmetry, where the centralized market maker can 
observe all trading activities while traders can only 
observe prices. In the context of the platform’s incen­
tive strategy for multiple sellers, Birge et al. (2024) pro­
pose effective incentive policies when all participants 
need to learn about demand under the asymmetric 
information setting. Building on this line of research, 
our model has the potential to incorporate learning 
features with an asymmetric information structure for 
both traders and the market maker.
Third, in our model, we assume that traders’ deci­
sion problems are myopic. However, in the actual mar­
ket, some professional traders may possess significant 
insights into future market movements, thus exhibit­
ing forward-looking (FL) behavior. As demonstrated 
in Section 6, FL traders may generate different trading 
decisions and further impact market prices. Therefore, 
establishing a tractable multiperiod decision problem 
for FL traders is another important direction for future 
research.
Last, it is well known that classical risk-averse pre­
ferences cannot fully explain certain decision-making 
behaviors observed in empirical studies and psycho­
logical experiments (Tversky and Kahneman 1992). 
Prospect theory (PT) is an influential alternative the­
ory that accounts for psychological factors such as loss 
aversion, reference points, and probability distortion 
in individual decision making (Barberis 2013, Kahne­
man and Tversky 2013). Recently, Yu et al. (2022) 
adopt a PT-based utility and construct an equilibrium 
model to explain pricing anomalies in betting markets. 
In the context of pricing models, den Boer and Keskin 
(2022) incorporate the PT-based demand function into 
a dynamic pricing model with demand learning and 
propose an asymptotically optimal dynamic pricing 
policy. Incorporating PT-based traders into the cur­
rent analysis could provide a more realistic represen­
tation of real-world trading. Furthermore, it would be 
intriguing to explore how such traders influence the 
limiting price. However, establishing market conver­
gence could be challenging due to the nonconvex 
nature of the PT-based model. To address this chal­
lenge, several key assumptions made in this work 
may require refinement.
Acknowledgments
The authors thank the associate editor and two anonymous 
referees for valuable comments on an earlier version of the 
paper. Any opinions, findings, and conclusions or recom­
mendations expressed in this material are those of the 
author(s) and do not reflect the views of the Chinese Ministry 
of Education or the Chinese Government.
Endnotes
1 According to Berg et al. (2008), polls only accurately predict the out­
come in 32% of cases in presidential elections. Pathak et al. (2015) find 
that expert forecasts perform worse than polls and prediction mar­
kets. In the corporate setting, Cogwill and Zitzewitz (2015) discover 
that expert forecasts have a 25% higher mean square error compared 
with prediction markets.
2 The “liquidity issue” refers to a phenomenon where buyers’ 
or sellers’ orders face delays or extended waiting times before 
being matched. In prediction markets, which usually have fewer 
traders than financial markets, one approach to address this issue 
is introducing a market maker to provide liquidity for buy and sell 
orders.
3 In this work, most of the results are irrelevant to the condition of the 
nonnegative wealth restriction (bankruptcy restriction). However, 
we specify the difference when necessary.
4 For example, let yt  (y1,t,:::,yI,t) and Qi,t be the ith element of Qt. 
Then, the ith element of y is yi,t  Wt  Qi,t which represents the 
wealth after paying the obligation if ith event occurs.
5 Note that the domain of function U(·), denoted by dom(U), may not 
necessarily be RI. As a result, in problem (Pcmin), we explicitly add 
the constraint (Wt + ∆w) · e  (Qt + ∆q) ∈dom(U). This constraint 
can typically be expressed by some linear or nonlinear inequalities.
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

6 In this paper, we call a multivariate function F(·) : RI →R monotoni­
cally increasing, if and only if for any y, ˆy ∈dom(F), if y ≥ˆy, then 
F(y) ≥F(ˆy) and inequality holds strictly when y > ˆy.
7 Although F¨ollmer and Schied (2011) show that any convex risk 
measure (cost function) can be defined numerically via an acceptance 
set or by the dual representation, it requires solving a constrained 
optimization problem whenever a new order is submitted.
8 The choice of trader’s MU function Vj(·) is similar to that of the mar­
ket maker’s MU function U(·). It can be based on conventional 
expected utility or constructed using a convex risk measure. Typically, 
in these formulas, the trader’s subjective belief is explicitly specified.
9 We call y ∈RI and x ∈RI are equivalent wealth, if and only if y 
x + t · e for some t ∈R. Strictly concavity of nonequivalent wealth 
means that, for any x,y ∈dom(Vj) who are not equivalent wealth vec­
tors, it has Vj(αx + (1  α)y) > αVj(x) + (1  α)Vj(y) for any α ∈(0,1).
10 Assumption 3 is not necessary to define the MU-based pricing 
mechanism and not necessary for general convergence results. Impos­
ing these assumptions helps simplify the analysis in the dynamic trad­
ing process.
11 The IP property is a weaker condition than the assumption made 
in Sethi and Vaughan (2016). In Assumption 1 of Sethi and Vaughan 
(2016), it is assumed that there exists a constant m such that each 
trader must trade once during any period of length m. Obviously, 
this implies the IP property but not the reverse. Therefore, our 
assumption allows a more flexible trading pattern than that in Sethi 
and Vaughan (2016).
12 The logarithm opinion pool refers to the normalized weighted geo­
metric mean of different opinions that originated from the early 
works such as Morris (1974) and Bordley (1982) in area of the opinion 
pooling.
13 If we let β →0 or αj →0 in (10), then the exponential utilities 
become risk-neutral utilities, that is, U(y)  PI
i1 θiyi and Vj(xj) 
PI
i1 πi,jxi,j for all j  1,:::,J.
14 If the same trader arrives twice in a row, the second trade is vacu­
ous because the first one is already utility maximizing.
15 It is worth noting that when there are only two traders, S1 and S2 
are effectively the only possible sequences that satisfy the IP prop­
erty. The impact of the trading sequence is also discussed in Sethi and 
Vaughan (2016).
References
Abernethy J, Chen Y, Vaughan JW (2013) Efficient market making via 
convex optimization, and a connection to online learning. ACM 
Trans. Econom. Comput. 1(2):1–39.
Abernethy JD, Frongillo RM, Li X, Vaughan JW (2014b) A general 
volume-parameterized market making framework. Proc. 15th 
ACM Conf. Econom. Comput., 413–430.
Abernethy J, Kutty S, Lahaie S, Sami R (2014a) Information aggrega­
tion in exponential family markets. Proc. 15th ACM Conf. Econom. 
Comput., 395–412.
Agrawal S, Delage E, Peters M, Wang Z, Ye Y (2011) A unified 
framework for dynamic prediction market design. Oper. Res. 
59(3):550–568.
Arrow KJ, Forsythe R, Gorham M, Hahn R, Hanson R, Ledyard JO, 
Levmore S, et al. (2008) The promise of prediction markets. Sci­
ence 320(5878):877–878.
Atanasov P, Witkowski J, Mellers B, Tetlock P (2022) Crowd predic­
tion systems: Markets, polls, and elite forecasters. Proc. 23rd ACM 
Conf. Econom. Computat., 1013–1014.
Atanasov P, Rescober P, Stone E, Swift SA, Servan-Schreiber E, Tetlock 
P, Ungar L, et al. (2017) Distilling the wisdom of crowds: Predic­
tion markets vs. prediction polls. Management Sci. 63(3):691–706.
Aumann RJ (1976) Agreeing to disagree. Ann. Statist. 4(6):1236–1239.
Ban A (2018) Strategy-proof incentives for predictions. Internat. Conf. 
Web Internet Econom. (Springer, Berlin), 51–65.
Barberis NC (2013) Thirty years of prospect theory in economics: A 
review and assessment. J. Econom. Perspective 27(1):173–196.
Berg JE, Nelson FD, Rietz TA (2008) Prediction market accuracy in the 
long run. Internat. J. Forecasting 24(2):285–300.
Berg JE, Neumann GR, Rietz TA (2009) Searching for Google’s value: 
Using prediction markets to forecast market capitalization prior 
to an initial public offering. Management Sci. 55(3):348–361.
Bertsekas DP, Nedi A, Ozdaglar AE (2003) Convex Analysis and Optimi­
zation (Athena Scientific, Belmont, MA).
Birge JR, Chen H, Keskin NB, Ward A (2024) To interfere or not to 
interfere: Information revelation and price-setting incentives in a 
multiagent learning environment. Oper. Res. Forthcoming.
Birge JR, Feng YF, Keskin NB, Schultz A (2021) Dynamic learning and 
market making in spread betting markets with informed bettors. 
Oper. Res. 69(6):1446–1476.
Bonnisseau JM, Nguenamadji O (2013) Discrete Walrasian exchange 
process. Econom. Theory 52(3):1091–1100.
Bordley RF (1982) A multiplicative formula for aggregating probabil­
ity assessments. Management Sci. 28(10):1091–1213.
Carvalho A (2017) On a participation structure that ensures represen­
tative prices in prediction markets. Decision Support Systems 
104:13–25.
Chakraborty M, Das S (2015) Market scoring rules act as opinion pools 
for risk-averse agents. Adv. Neural Inform. Processing Systems 
28:2359–2367.
Chakravorti T, Singh V, Rajtmajer S, McLaughlin M, Fraleigh R, Grif­
fin C, Kwasnica A, et al. (2023) Artificial prediction markets pre­
sent a novel opportunity for human-AI collaboration. Ricci A, 
Yeoh W, Agmon N, An B, eds. Proc. 22nd Internat. Conf. Autono­
mous Agents Multiagent Systems.
Chen Y, Pennock DM (2007) A utility framework for bounded-loss 
market makers. Proc. 23rd Conf. Uncertainty Artificial Intelligence, 
49–56.
Chen Y, Vaughan JW (2010) A new understanding of prediction mar­
kets via no-regret learning. Proc. 11th ACM Conf. Electronic Com­
merce (ACM, New York), 189–198.
Chen MK, Ingersoll JE Jr, Kaplan EH (2008) Modeling a presidential 
prediction market. Management Sci. 54(8):1381–1394.
Chen Y, Chu CH, Mullen T, Pennock DM (2005) Information markets 
vs. opinion pools: An empirical comparison. Proc. 6th ACM Conf. 
Electronic Commerce (ACM, NewYork), 58–67.
Choo L, Kaplan TR, Zultan R (2022) Manipulation and (mis) trust in 
prediction markets. Management Sci. 68(9):6716–6732.
Cogwill B, Zitzewitz E (2015) Corporate prediction markets: Evi­
dence from Google, Ford and Firm x. Rev. Econom. Stud. 82(4): 
1309–1341.
Cowgill B, Wolfers J, Zitzewitz E (2009) Using prediction markets to 
track information flows: Evidence from Google. Das S, Ostrovsky 
M, Pennock D, Szymanksi B, eds. Auctions, Market Mechanisms 
and Their Applications (Springer, Berlin), 3.
den Boer AV, Keskin NB (2022) Dynamic pricing with demand learn­
ing and reference effects. Management Sci. 68(10):7065–7791.
F¨ollmer H, Schied A (2011) Stochastic Finance: An Introduction in Dis­
crete Time (Walter de Gruyter, Berlin).
Freeman R, Pennock DM (2018) An axiomatic view of the parimutuel 
consensus wagering mechanism. Proc. 17th Internat. Conf. Autono­
mous Agent MultiAgent Systems (ACM, New York), 1936–1938.
Freeman R, Pennock DM, Vaughan JW (2017) The double clinching 
auction for wagering. Proc. ACM Conf. Econom. Comput. (ACM, 
New York), 43–60.
Frongillo R, Reid MD (2015) Convergence analysis of prediction mar­
kets via randomized subspace descent. Adv. Neural Inform. Proces­
sing Systems 28:3034–3042.
Frongillo R, Chen Y, Kash I (2015) Elicitation for aggregation. Proc. 
Conf. AAAI Artificial Intelligence 29(1):900–906.
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 

Gjerstad S, Hall M (2005) Risk Aversion, Beliefs, and Prediction Market 
Equilibrium (Economic Science Laboratory, University of Arizona, 
Tucson, AZ).
Hanson R (2003) Combinatorial information market design. Inform. 
Systems Frontiers 5(1):107–119.
Hanson R (2007) Logarithmic markets scoring rules for modular com­
binatorial information aggregation. J. Prediction Markets 1(1):3–15.
Healy PJ, Linardi S, Lowery JR, Ledyard JO (2010) Prediction markets: 
Alternative mechanisms for complex environments with few tra­
ders. Management Sci. 56(11):1977–1996.
Hu J, Storkey A (2014) Multi-period trading prediction markets with 
connections to machine learning. Proc. Internat. Conf. Machine 
Learn., 1773–1781.
Iyer K, Johari R, Moallemi CC (2014) Information aggregation and alloca­
tive efficiency in smooth markets. Management Sci. 60(10):2509–2524.
Jian L, Sami R (2010) Aggregation and manipulation in prediction 
markets: Effects of trading mechanism and information distribu­
tion. Proc. 11th ACM Conf. Electronic Commerce (ACM, New York), 
207–208.
Kahneman D, Tversky A (2013) Prospect theory: An analysis of deci­
sion under risk. Handbook of the Fundamentals of Financial Decision 
Making: Part I (World Scientific, Singapore), 99–127.
Makarov D, Schornick AV (2010) A note on wealth effect under 
CARA utility. Finance Res. Lett. 7(3):170–177.
Manski CF (2006) Interpreting the predictions of prediction markets. 
Econom. Lett. 91(3):425–429.
Mas-Colell A, Whinston MD, Green JR (1995) Microeconomic Theory, 
vol. 1 (Oxford University Press, New York).
Morris PA (1974) Decision analysis expert use. Management Sci. 
20(9):1233–1241.
Ostrovsky M (2012) Information aggregation in dynamic markets 
with strategic traders. Econometrica 80(6):2595–2647.
Othman A, Sandholm T (2010) When do markets with simple agents 
fail? Proc. 9th Internat. Conf. Autonomous Agents Multiagent Sys­
tems, vol. 1, 865–872.
Othman A, Pennock DM, Reeves DM, Sandholm T (2013) A practical 
liquidity-sensitive automated market maker. ACM Trans. Econom. 
Comput. 1(3):1–25.
Pathak D, Rothschild D, Dudik M (2015) A comparison of forecasting 
methods: Fundamentals, polling, prediction markets, and experts. 
J. Prediction Markets 9(2):1–31.
Pennock DM (1999) Aggregating Probabilistic Beliefs: Market Mechanisms 
and Graphical Representations (University of Michigan, Ann Arbor).
Sethi R, Vaughan JW (2016) Belief aggregation with automated mar­
ket makers. Comput. Econom. 48(1):155–178.
Slamka C, Skiera B, Spann M (2013) Prediction market performance 
and market liquidity: A comparison of automated market 
makers. IEEE Trans. Engrg. Management 60(1):169–185.
Storkey A, Millin J, Geras K (2012) Isoelastic agents and wealth 
updates in machine learning markets. Proc. 29th Internat. Conf. 
Machine Learn., 1019–1026.
Tarnaud R (2019) Convergence within binary market scoring rules. 
Econom. Theory 68(4):1017–1050.
Tversky A, Kahneman D (1992) Advances in prospect theory: 
Cumulative representation of uncertainty. J. Risk Uncertainty 
5(4):297–323.
Wolfers J, Zitzewitz E (2004) Prediction markets. J. Econom. Perspective 
18(2):107–126.
Wolfers J, Zitzewitz E (2006) Interpreting prediction market prices as 
probabilities. Technical report, National Bureau of Economic 
Research, Cambridge, MA.
Yu D, Gao JJ, Wang TY (2022) Betting market equilibrium with hetero­
geneous beliefs: A prospect theory-based model. Eur. J. Oper. Res. 
298:137–151.
Jianjun Gao is an associate professor of the School of Information 
Management and Engineering at Shanghai University of Finance and 
Economics, Shanghai. His research focuses on designing algorithms 
for complex decision problems, including dynamic portfolio optimi­
zation, pricing problems, and risk management.
Zizhuo Wang is a professor at the School of Data Science at The 
Chinese University of Hong Kong, Shenzhen. His primary research 
interests include data-driven decision making, Internet economics, 
and pricing and revenue management.
Weiping Wu is an associate professor of the School of Economics 
and Management at Fuzhou University. His research interests 
include portfolio selection, algorithmic trading, and optimization 
theory.
Dian Yu is an asset-liability management specialist of the Plan­
ning and Finance Department at Industrial Bank, Co., Ltd., China. 
His research interests include behavioral finance, portfolio selection, 
revenue management, and asset-liability optimization.
Gao et al.: Price Interpretability of Prediction Markets: A Convergence Analysis 
Operations Research, 2025, vol. 73, no. 1, pp. 157–177, © 2024 INFORMS 
Downloaded from informs.org by [2a0c:5bc0:40:2e26:85a2:a440:8e62:dcc8] on 07 November 2025, at 05:57 . For personal use only, all rights reserved. 