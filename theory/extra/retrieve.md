How the Introduction of Machine Traders and Disclosure of 
Their Presence Affect Prediction Accuracy: An Online Controlled 
Experiment in Prediction Market
Liting Li and Haichao Zheng
ABSTRACT
Incorporating prediction models developed based on machine learn­
ing algorithms into the traditional prediction market creates hybrid 
intelligence. We design and conduct an online controlled experiment 
to investigate the impacts of two dimensions of human–machine 
interaction, whether to introduce machines as traders and whether 
to disclose their presence, on the prediction performance. The results 
of the experiment reveal that the introduction of machines creates two 
competing effects on prediction accuracy. The positive influence 
comes from the intensified competition brought by machines, which 
fosters a strong desire to win among human participants and moti­
vates them to engage in more deliberate decision-making efforts. 
Conversely, in the context of intensive competition, humans are 
inclined to trade at a large magnitude, consequently leading to 
a decrease in prediction performance. Furthermore, the results indi­
cate that simply disclosing the presence of machines can have 
a detrimental impact on prediction performance, as it may lead to 
a reduction in human deliberation efforts. Furthermore, this article 
delves into the potential mechanisms involved. This study contributes 
to the understanding of human behaviors in hybrid prediction markets 
and highlights the need for careful human–machine interaction 
design to optimize prediction market performance
KEY WORDS AND  
PHRASES 
Prediction markets; machine 
traders; machine disclosure; 
prediction accuracy; hybrid 
intelligence; online trading
Introduction
Prediction markets, also known as information markets, are markets where participants 
trade contracts and yield payments based on the outcome of uncertain events [4]. These 
prediction markets serve as effective tools to synthesize heterogeneous opinions to predict 
future events [4]. Analogous to the financial market, participants in the prediction market 
can buy or sell contracts, whose final prices are tied to the actual results of future uncertain 
events. For instance, in a political election prediction market such as Iowa Electronic 
Markets (https://iemweb.biz.uiowa.edu), participants can buy or sell a “win” contract that 
is associated with a candidate’s final election result. If the candidate wins the election, the 
buyer who bought one “win” contract of that candidate will receive $1 in return, and $0 
otherwise. The price of the contract reflects the probability of the occurrence of 
a corresponding event (e.g., whether or not a candidate wins).
Empirical evidence has demonstrated the effectiveness of prediction markets in harnes­
sing crowd intelligence across various domains, including politics, sports, epidemic dis­
eases, retail sales, economic indicators, and corporate performance, such as market 
CONTACT Haichao Zheng 
haichao@swufe.edu.cn
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE 
2024, VOL. 28, NO. 4, 569–600 
https://doi.org/10.1080/10864415.2024.2401948
© 2024 Taylor & Francis Group, LLC 

capitalization prediction before an initial public offering [4, 8, 28, 41]. However, despite its 
advantages, the prediction market also suffers from disadvantages. For instance, there is 
a gradual reduction in human participation over time [52], and accessing new information 
comes at a considerable cost. Moreover, the ability of humans to gain insights from vast 
datasets poses a significant challenge. These drawbacks can potentially hinder the efficiency 
of contract pricing in the prediction market, as human participants may tend to overreact or 
underreact to price fluctuations (Sung et al., 2019).
To address the aforementioned shortcomings associated with prediction markets solely 
reliant on human participants, this study proposes the integration of machines into the 
traditional prediction market. With the advancements in machine learning algorithms and 
big data technologies, various machine-based approaches have been developed and success­
fully applied in diverse fields, such as disease diagnosis and stock market volatility fore­
casting. By introducing machines into the prediction market, we aim to mitigate the 
identified limitations and enhance the overall effectiveness of the market’s predictive 
capabilities.
The fusion of human and machine capabilities represents an effective approach to 
harnessing their respective advantages and achieving enhanced hybrid intelligence [37,  
61, 73]. In the domain of prediction, both humans and machines offer unique strengths 
[64, 68]. Humans, for instance, possess tacit knowledge that is challenging to formalize, and 
their decision making is often influenced by individual reasoning patterns. Conversely, 
machine models excel at processing vast amounts of data to extract patterns or knowledge 
efficiently and rapidly [71]. Introducing machines into the traditional prediction market 
predominantly reliant on human participants can yield dual benefits. First, machines bring 
valuable new information to augment the existing market dynamics. Second, while 
machines may encounter biases and fairness concerns stemming from input samples and 
training processes, their decision making remains free from emotional or cognitive biases. 
The integration of machines thus complements the human-centric approach and enriches 
the prediction market landscape, contributing to more reliable and insightful predictions.
Nonetheless, the inclusion of machines in the traditional prediction market can also exert 
indirect effects on overall market performance by influencing human affect and cognition. 
Moreover, machines may harm the information heterogeneity of the prediction market by 
serving as decision support tools; therefore, we consider incorporating machines as traders 
in this article. However, a mere introduction of machines without considering the intricate 
dynamics of human–machine interactions may not fully leverage the potential of a hybrid 
prediction market. We propose that the performance of such a hybrid market does not 
merely improve by simply amalgamating the knowledge from humans and machines. 
Previous studies have demonstrated that human–machine interactions, including the 
expectation of machine presence, can impact human behavior and prediction performance 
[22]. In reality, regulations pertaining to the implementation of artificial intelligence (AI) 
increasingly demand disclosure of machine learning model presence and details [2]. 
Therefore, a comprehensive understanding of the direct and indirect impacts on prediction 
accuracy upon the integration of machines into the traditional prediction market becomes 
imperative for designing a hybrid market with superior forecasting performance.
While prediction markets are primarily focused on forecasting future events, they still 
share the nature of markets like capital markets. As an increasing number of machine 
models find their way into the capital market, the concept of a hybrid market has garnered 
LI AND ZHENG

significant attention in the financial domain. Within this context, the most frequently 
studied dependent variables are price bubbles and market efficiency. However, existing 
studies on the introduction of machines into hybrid markets have presented mixed or 
competing effects, particularly in experimental settings. For instance, Grossklags and 
Schmidt [26] observed that in an experimental double auction market, market prices closely 
align with the fundamental value when the presence of algorithmic traders is disclosed to 
the participants. Conversely, in a simulated asset market, algorithmic traders were found to 
lead to significant deviations from fundamental values [50]. These diverse findings under­
score the complex nature of human–machine interactions in hybrid markets and warrant 
a deeper investigation to comprehend the underlying mechanisms influencing market 
efficiency. As we explore the integration of machines into the traditional prediction market, 
it becomes crucial to examine the specific impacts on prediction accuracy and market 
dynamics to foster a better understanding and design of an efficient hybrid market.
Apart from the diverse findings, we also note the absence of a definitive model to 
elucidate the effects of introducing machines and disclosing their presence in the hybrid 
market. The distinct research context of the human–machine hybrid prediction market 
presents an opportunity for further exploration of how machines influence prediction 
accuracy. In the hybrid system, humans and machines may engage in various forms of 
interaction, including competition and collaboration. In most cases, machines work as 
teammates with humans. For example, in chest x-ray diagnosis, advanced machine learning 
models can aid doctors in making final judgments [53]. However, few studies in business 
concern the competitive environment of humans and machines, as most scenarios are 
human–computer negotiation in business-to-consumer e-commerce transactions [11]. In 
our research context, humans and machines participate in a competitive prediction contest, 
with each pursuing individual goals to trade in the prediction market and earn rewards.
We posit that the introduction of machines and the disclosure of machine presence in 
this competitive context can impact human decision-making quality and market perfor­
mance in distinct ways. Compared to the prediction market with only humans, simply 
including machines in the prediction market without disclosure can make the competition 
more intensive, which can be perceived from the increased trading frequency or rapidly 
changing price dynamics. Conversely, disclosing machines in the prediction market might 
undermine human traders’ confidence in their beliefs, possibly leading to feelings of anger 
and jealousy toward the machines, a phenomenon known as algorithm aversion [19]. To 
establish effective human–machine interaction in the prediction market, it is crucial to 
investigate how the introduction of machines and the disclosure of machine presence 
influence human traders’ decision-making quality and prediction performance.
Moreover, when compared to experiments conducted in financial hybrid markets, the 
distinctive nature of the hybrid prediction market necessitates the development of a novel 
model or theory capable of explaining human decision-making quality and prediction 
accuracy. In the settings of economic experiments of hybrid markets, the participants 
hold the fundamental values of the contracts and the distribution of the outcome, and 
they do not need to search for more information to trade. However, for the experiments in 
our prediction markets studies, human participants need to collect more information and 
update their beliefs to make wiser decisions. Therefore, unraveling the mechanism of how 
the introduction of machines and the disclosure of machine presence affect humans and 
prediction markets demands a careful examination of multidimensional human behaviors. 
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

In addition to studying trading frequency [26], we should also investigate other variables of 
human behaviors potentially influenced by the introduction of machines, such as delibera­
tion effort and trading magnitude. Specifically, to develop a model linking machines to 
market efficiency, we incorporate three human behaviors—deliberation efforts, belief 
updating frequency, and trading magnitude—as key drivers of prediction accuracy [6].
The research gaps in the prediction market, the diverse findings from economic experi­
ments, and the practice requirements of AI serve as the driving forces behind our study’s 
research question: How do the introduction of machines and the disclosure of their presence 
impact the prediction accuracy of prediction markets? Understanding these aspects will pave 
the way for developing an effective and well-informed human–machine hybrid market that 
optimizes prediction accuracy and performance. To answer the research question, we 
develop a hybrid prediction market and conduct an experiment. The prediction tasks are 
one-day-ahead prediction of stock price up–down in China. For this purpose, we train 10 
distinct machine learning models, each of which engages in automated trading within the 
market. Market performance (prediction accuracy) is the focal outcome variable, and the 
introduction of machines and disclosure of their presence are the main concerned 
treatments.
Based on the experiment, we obtain two interesting findings. First, our results reveal two 
competing effects of the introduction of machines into the prediction market on market 
prediction accuracy. The positive influence comes from the intensive competition context 
brought by machines, which enables humans to have the desire to win and motivates them 
to put more deliberate efforts into decision making. However, under conditions of intense 
competition, human traders tend to engage in large-magnitude trades, subsequently leading 
to a decline in prediction performance. Second, disclosing machine presence will harm the 
prediction performance since its total effect on prediction accuracy is negative. For indirect 
effects, we found that the disclosure of machine presence decreases humans’ deliberation 
effort and belief updating frequency, which have proven to be significant antecedents to 
prediction accuracy. These findings underscore the importance of carefully considering the 
implications of introducing machines and disclosing their presence in hybrid prediction 
markets. Our study contributes valuable insights for designing effective human–machine 
interactions in prediction markets to enhance forecasting performance.
The rest of this article is structured as follows: First we outline the related literature and 
develop the research model; next we describe the prediction market we designed and 
conducted the controlled field experiment. Then we present our results and explore 
potential mechanism through questionnaires, interviews, and a click data analysis. 
Finally, we conclude with implications, limitations, and future research.
Literature Review
Collective Intelligence and Prediction Markets
The prediction market serves as a valuable approach for integrating diverse private infor­
mation or knowledge from large crowds. The prediction market has been proven to be 
a valid and robust method to predict the probability of future events or the true value of an 
asset [4]. However, with proper scoring feedback, collaboration features, and statistical 
aggregation, the prediction poll is also an attractive alternative [5]. Related to the research 
LI AND ZHENG

on information aggregation, prediction market is an effective tool for aggregating opinions, 
Spann and Skiera [60] devise a structure of a virtual market to predict short- and medium- 
term business indicators, such as box office forecasts, cell phone service usage, and pop 
music rankings.
Unlike the traditional way of aggregating opinions [33, 47], the prediction market 
allows market participants to use personal wealth to buy and sell contracts. This 
incentive encourages market participants to express their true beliefs and ideas. As 
participants’ decision-making behavior is directly linked to changes in their wealth, 
participants are more willing to make decisions based on the information they have. 
Consequently, any behavior that provides false information or manipulates prices will 
cause traders to lose wealth in the market, which is one of the reasons why prediction 
markets are superior to other opinion aggregation tools. Additionally, the theory of 
diversity and ensemble learning also proves that the predictions of pooled groups are 
beneficial to reduce the errors formed by individual predictions.
Despite their advantages, prediction markets also confront two major deficiencies. 
First, user participation in the prediction market tends to decline gradually, and it 
may vary unevenly at different time points [52]. Second, the systematic bias of 
participants will also harm the prediction accuracy of the prediction market. 
Similar to traditional capital markets, traders’ performance in prediction markets 
also suffers from cognitive biases, such as making judgments based on personal 
preferences rather than objective facts [72]. Moreover, traders may overreact to prices 
due to their behavioral biases and incomplete processing of complex information, 
resulting in biased information market forecasts [62]. Additionally, the information 
market prices may exhibit a preference for long-shot bias (favorite-longshot bias, 
FLB)—that is, the probability of high (low) probability events is underestimated 
(overestimated). Existing models that account for long-shot bias might struggle to 
encompass all complexities, thereby hindering the proper adjustment of market 
forecasts to enhance their accuracy [56]. Therefore, prices in the prediction market 
are not always effective.
Cognitive biases of traders will be further amplified through the market, and the 
rapid fluctuations in prices may elevate decision makers’ cognitive load, leading to 
biased judgments based on heuristics [35]. Similarly, in the prediction market, early 
price changes may stimulate interest in subsequent transactions, creating conditions 
for the herding behavior. Traders with limited private information may engage in 
irrational transactions when confronted with rapidly changing prices, consequently 
resulting in market price deviations [59]. Thus, traders’ behavioral biases and limited 
ability to process complex information may also cause traders to overreact to price 
changes—that is, to rely too much on price signals in the market [62].
To mitigate these challenges, incorporating machine learning models in the predic­
tion market may offer a promising solution. As machines are not influenced by human 
cognitive biases, their inclusion can potentially reduce price deviations. By leveraging the 
strengths of machines and humans in a synergistic manner, we can strive to create 
a more effective and reliable hybrid intelligence system in the prediction market domain. 
To achieve the objective, it is crucial to comprehend the mechanism of incorporating 
machines into the market and whether to disclose the machines’ presence to the 
participants and the market.
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

Human–Machine Hybrid Market
This article also builds on prior economic and financial research that compares the predic­
tion performance of human-machine hybrid market and pure human market. Table 1 
presents a comprehensive summary of the existing literature concerning the effects of 
introducing machines to the financial market.
Das et al. [17] were among the pioneering researchers to study human–machine hybrid 
trading in experimental capital markets. Their study revealed that machine traders out­
performed human traders, and the efficiency of hybrid markets was higher than that of 
traditional pure human or pure machine markets. Building upon the work of Das et al. [17], 
Luca and Cliff [43] conducted a series of studies using OpEx, an experimental economic 
system they developed. They repeated previous experiments with different computer agents, 
and identified that adaptive agents achieve the best performance in the human–machine 
hybrid continuous double auction (CDA) market [43, 44]. Extending from the aforemen­
tioned research, several laboratory experiments have found that the operation speed of 
machine agents affects the performance of human and the overall market. For instance, 
when the trading speeds of automated trading agents are slowed down to match the 
timescales of human trading, the overall market efficiency increases [12].
In contrast to the literature on evaluating different machine trading strategies, 
Grossklags and Schmidt [27] aim to disentangle the effects of machine traders’ actual 
trading behavior from the influence of human expectations regarding the presence of 
machines in human–machine hybrid markets. They observed that even in the absence of 
machine trading, human expectations of machines can significantly impact their behavior. 
Apart from investigating machine traders’ performance and the influence of their trading 
Table 1. Economic Experiment Studies on Human–Machine Hybrid Market.
Theme
Context
Findings
Machine settings
Reference
Trader’s earning
CDA
Machine traders earn more than human traders
Quantity: 6C6H 
Machine: realized 
algorithms (ZIP, 
GD)
Das et al. [17]
Trader’s earning
OpEx
AA machine traders perform best
Quantity: 6C6H 
Machine: realized 
algorithms (ZIP, 
GD)
Luca and Cliff 
[43], Luca and 
Cliff [44]
Trader’s earning
OpEx
Reducing the trading speed of machine traders 
increases the market’s ability to achieve 
competitive equilibrium
Quantity: 6C6H 
Machine: realized 
algorithms (AA)
Cartlidge et al. 
[12]
Market efficiency, 
human 
behavior
CDA
The market that exposes the presence of 
machines to humans is more efficient, and 
human trades decreases slightly
Quantity: 6C6H 
Machine: realized 
algorithms 
(Arbitrageur)
Grossklags and 
Schmidt [27]
Market bubble
CDA
Market bubbles can be reduced simply by 
changing human traders’ expectations of the 
presence of machine traders
Quantity: 6H 
Machine: no 
realized 
algorithms 
(Equilibrium)
Farjam and 
Kirchkamp 
[22]
Human emotion, 
behavior
First 
Seal 
Auction
Humans are less aroused and bid less when 
trading with machines
Machine: no realized 
algorithms 
(Wizard of Oz)
Teubner et al. 
[66]
Note: CDA is the acronym for continuous double auction, which is a type of market mechanism. Machines such as ZIP, AA, and 
GD are trading agencies in the continuous double auction market that appear in the paper. In addition, in the “Machine 
settings” column, C refers to computer, H refers to human, and “6C6H” means that there are six machines and six humans. 
The strategy of “Wizard of Oz” means machines just copy the strategies of the predecessors.
LI AND ZHENG

strategies on human behavior, this line of literature also explores the impact of machine 
traders on the overall market. For instance, machine traders contribute to enhancing 
market price information efficiency by providing increased liquidity [15]. Moreover, the 
findings of Farjam and Kirchkamp [22] suggest that even when actual machine traders are 
absent in the market, merely modifying human traders’ expectations regarding machine 
trading can substantially influence market prediction efficiency, resulting in smaller market 
bubbles and faster price discovery.
In the domain of the prediction market, Nagar and Malone [51] attempted to integrate 
machine models of three-layer artificial-neural-net agents into the traditional prediction 
market, which solely consisted of human participants. Their study involved human and 
machine agents predicting whether the next play in an American football game would be 
a “run” or “pass.” While the results indicated that the overall hybrid prediction market 
generated lower prediction error [51], they did not thoroughly explore the potential 
influences of human–machine interaction on prediction accuracy. One limitation of their 
experimental design was the absence of a comparable group in which humans held no 
expectations of machines. Therefore, Nagar and Malone [51] do not examine how the 
expectation of machine presence affects prediction market accuracy. In this article, we posit 
that the introduction and disclosure of machines can have different impacts on human 
behavior, subsequently influencing the performance of the hybrid market. Our study aims 
to address this research gap and shed light on the diverse effects of these two human– 
machine interactions in the prediction market context.
Theoretical Underpinnings and Hypotheses Development
Theoretical Underpinnings
The relevant literatures for this study encompass collective intelligence and human– 
machine interaction. Despite this, there exists a lack of a unified model that simulta­
neously incorporates human behavior and market performance in the context of 
human–machine hybrid market research. In this study, the focal dependent variable 
is the prediction performance of the market, measured with the Brier score [5]. 
Figure 1 illustrates our research framework. The predictive power of the market is 
derived from the collective contributions of the participants engaging in contract 
Behavioral drivers 
Machine behaviors 
Whether to 
disclose machines 
presence 
Whether to 
introduce machines 
as traders 
Trade 
magnitude 
Deliberation 
effort 
Human 
Decision-
making quality 
Belief updating 
frequency 
Prediction 
performance 
Figure 1. Research Framework
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

transactions. Therefore, human decision quality is one influencing factor for predic­
tion performance. In addition to human input, the knowledge embedded in machines 
also contributes to the hybrid prediction market. Therefore, the introduction of 
machines is also involved as a predictor for prediction performance, which is not 
presented in Figure 1.
Our contribution lies in the left part of the model, whether to introduce machines 
(introduction of machines as traders) and whether to disclose machines’ presence (dis­
closure of machines’ presence), which are the central human–machine interaction design 
elements. Studies on the human–machine hybrid prediction market have used economic 
modeling to demonstrate that the predictive efficiency of human–machine competitive 
prediction markets (machines as traders) has consistently outperformed hybrid markets 
with only cooperative relationships (machines disclose prediction results as decision sup­
port tools). Moreover, in scenarios where both competition and cooperation exist, market 
predictive efficiency is highest only when participants have a moderate level of trust in 
machine prediction results [20]. Thus, in this article, we mainly focus on the competitive 
relationship between human and machines.
According to decision theory, the decision-making process of an individual or organiza­
tion consists of five main steps: gathering relevant information, identifying possible alter­
natives, narrowing down alternatives, evaluating alternatives, and making a final decision 
[57]. In the prediction market, the alternatives are predefined, and the core work 
a participant needs to do is collecting information, selecting and evaluating contracts, and 
ultimately executing trades.
Based on cognitive load theory, the internal cognitive load at work is influenced by the 
task’s complexity and human expertise [63]. The other two loads in cognitive load theory 
are external cognitive load and relevant cognitive load [63]. The former is the load imposed 
by the way the task is represented. The former pertains to the load imposed by the task’s 
representation, while the latter refers to the learning process that helps individuals allocate 
cognitive resources to various activities. In the context of prediction markets, when the 
presence of machines is disclosed, the internal cognitive load for humans may increase as 
they need to consider the strategies employed by machines.
Cognitive load theory posits that these three cognitive loads are additive, and the total 
cognitive load should not exceed human mental resources [63]. Consequently, when the 
cognitive load becomes too burdensome, individuals may tend to eschew complex cognitive 
processes in decision making and resort to heuristic thinking or intuition [9, 54], resulting 
in observable changes in user behaviors. The increased trades brought about by the 
introduction of machines in the market may create a more competitive and intricate 
environment, potentially elevating humans’ internal cognitive load [42].
According to existing findings in studies of crowd intelligence in prediction tasks, human 
behaviors, including deliberation effort, belief updating frequency, and trading magnitude, 
have been identified as significant drivers of prediction performance in prediction polls 
[49]. While human–machine hybrid systems hold the potential to harness the strengths of 
both humans and machines, human attitudes toward machines, such as mistrust, could 
potentially hinder the realization of human–machine complementary advantages [1]. To 
develop a high-quality hybrid prediction system, it is essential to assess the impacts of 
machines on human behavior. As illustrated in the research framework, behavioral drivers 
are proposed as mediating variables that link machine design to human decision-making 
LI AND ZHENG

quality. The connections between these constructs are further elucidated in the following 
three sections.
In the model, two control variables are considered. First, we take into account that 
humans may exhibit varying levels of familiarity with certain prediction tasks, and this 
familiarity can influence their decision-making quality. Therefore, we include three dummy 
variables representing different stock codes as control variables for decision-making quality 
and prediction performance. Second, as population size may also affect prediction perfor­
mance, we incorporate the number of humans as a control variable for prediction perfor­
mance. All the control variables are not depicted in the figure of the research framework.
How Does the Introduction of Machines Affect the Prediction Market?
Introducing machines into the prediction market affects prediction performance in two 
ways. First, the incorporation of machines in the market, even when humans are unaware of 
machines’ presence, exerts an influence on human behaviors due to the changes introduced 
by machine trading, such as alterations in price dynamics. Specifically, the introduction of 
machines leads to a higher number of transactions and intensified competition, irrespective 
of whether their identities are disclosed. Human traders can perceive the intensity of 
competition through the frequency of price changes observed in the market. It is worth 
noting that there are other machine characteristics, like number of machines and class of 
machines, that influence the accuracy of prediction market. However, in this study, we focus 
on the most basic scenario: whether to introduce machines into prediction market.
The effects of competition on human behaviors and performance have yielded mixed 
findings in the existing literature. Some studies propose that heightened competition can 
undermine participants’ motivation to exert more effort in the game. However, according to 
the competitive arousal model, a competitive environment can fuel individuals’ desire to 
succeed [39, 46]. Insights from online game studies also suggest that players will make more 
effort (more games and longer duration) when competing against opponents of similar skill 
levels [42]. A higher desire to win motivates humans to think more deliberately before 
making a buy or sell decision and to trade more frequently as soon as they gain fresher 
information. In addition to enhancing the desire to win, the arousal induced by 
a competitive prediction market also stimulates heightened excitement in human traders, 
resulting in larger trading magnitudes. Consequently, we hypothesize the following: 
H1a: Introducing machines into the prediction market will improve humans’ deliberation 
effort.
H1b: Introducing machines into the prediction market will improve humans’ belief update 
frequency.
H1c: Introducing machines into the prediction market will increase humans’ trading 
magnitude.
Second, the introduction of machines can directly impact prediction accuracy. One impor­
tant aspect of this impact is the enhancement of market liquidity through the inclusion of 
machines. For instance, in a simulated capital market, the addition of machine traders with 
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

higher transaction frequency and lower latency than human traders resulted in increased 
market liquidity and improved market effectiveness [50]. Furthermore, machine models 
have the capability to identify new patterns or information from vast datasets, which might 
be challenging for humans to discover easily. As a result, the presence of machines generates 
additional liquidity and novel information in the market, ultimately driving market prices 
closer to their true values and facilitating rapid price discovery.
In the area of prediction markets, previous studies have consistently demonstrated that 
hybrid prediction markets, comprising both humans and machines, outperform markets 
consisting solely of humans or machines in terms of accuracy, calibration, and recall [51]. 
Simulation experiments employing the same trading strategy for humans and machines 
have revealed that machine traders with fast trading frequencies and low delays exhibit 
superior prediction performance compared to the overall prediction market, even out­
performing some human traders [7]. The complementarity between humans and machines 
contributes to the enhanced performance of the hybrid prediction market, particularly 
when the correlation of result confidence is low between humans and machines. In such 
scenarios, the introduction of machines can improve the overall prediction accuracy, 
despite their individual accuracy being lower than that of humans [61]. Based on these 
findings, we propose the following hypothesis: 
H2: Introducing machines into the prediction market will directly improve prediction 
performance.
How Does Disclosure of Machines Presence Affect the Prediction Market?
The disclosure of a machine’s presence in the hybrid prediction market presents a delicate 
trade-off. From the view of business transparency ethics, human participants have a right to 
be informed about whether others are humans or machines [2]. Extensive research has 
shown that humans tend to exhibit different attitudes toward humans and machines [66]. 
From the perspective of evolution, humans perceive machines as distinct entities, akin to 
a separate species, leading to a sense of hostility toward machines [58, 70]. Consequently, 
when competing against machines, individuals may exhibit reduced effort in their decision 
making and participation [69]. As individuals cannot perceive the “psychological” or 
“mental” model of machine forecasting and trading in the prediction market, they will be 
averse to trading with machines, resulting in decreased participation in the market [25].
Research in neuroscience has provided valuable insights into the differences in brain 
activity during human and human–machine interactions. Krach et al. [38] conducted 
a study involving the rock–paper–scissors game that revealed that brain regions associated 
with social interaction exhibited lower activity when subjects interacted with machines. 
Building on the NeuroIS research approach, Teubner et al. [66] investigated the impact of 
machine agents on human bidders’ affective processes and bidding behavior in an electronic 
auction. Their findings indicated that computerized agents moderated the intensity of 
bidders’ immediate emotions in response to discrete auction events and also influenced 
the bidders’ overall arousal levels during the auction.
The outcomes from laboratory experiments involving the integration of algorithmic 
traders into the continuous double auction market indicate that at the individual level, 
LI AND ZHENG

the awareness of algorithmic traders’ presence leads to a slight reduction in transaction 
volume [26]. In the domain of online games, extant research has found that when there are 
plug-in machine agents, players’ enthusiasm for playing decreases [69]. Marketing studies 
have also unveiled that revealing a chatbot’s identity before engaging in a conversation with 
a customer will result in a decline of over 79.7 percent in purchase rates [45]. Within the 
realm of hybrid financial markets, Grossklags and Schmidt [26] have identified that subjects 
trade slightly (but not significantly) less when they are aware of the presence of algorithmic 
traders.
In the research context of prediction markets, machines are poised to claim a portion of 
the rewards from prediction tasks, which may lead humans to perceive machines as 
adversaries that could compromise their gains. In this scenario, individuals might rush 
into making impulsive decisions to outperform machines and secure profits. We propose 
that humans’ deliberation efforts and trading frequency will be lower as they perceive higher 
pressure and less expected reward in the market because of machine enemies. In addition, 
facing the challenge of artificial intelligence, humans may become less confident and more 
prudent to trade in the prediction market; that is, their average trading magnitude will 
decrease. Therefore, we hypothesize the following: 
H3a: Disclosing machine presence in the prediction market will reduce humans’ deliberation 
effort.
H3b: Disclosing machine presence in the prediction market will reduce humans’ belief update 
frequency.
H3c: Disclosing machine presence in the prediction market will reduce humans’ trading 
magnitude.
Human Trading Behaviors, Decision-Making Quality, and Market Performance
The drivers of prediction accuracy have already gained much attention in studies on 
collective intelligence. For instance, human traders’ active participation, such as the total 
number of transactions and trader’s self-revision, positively affects the information 
aggregation efficiency, yielding a greater market predictive accuracy [74]. Moreover, 
Mellers et al. [49] identified three groups of driving variables that are closely correlated 
with prediction quality: dispositional variables (cognitive ability, political knowledge, 
and open-mindedness), situational variables (training in probabilistic reasoning and 
participation in collaborative teams), and behavioral variables of deliberation time and 
frequency of belief updating. The research unit in Mellers et al. [49] is individual 
participants, and our research unit is the prediction market. Therefore, we include the 
behavioral variables deliberation effort and belief updating frequency in the research 
model. The empirical findings in the individual level studies could be extended to the 
level of market or prediction tasks—the average deliberation effort and belief updating 
frequency of participants in a prediction market also act as main drivers of decision- 
making quality. For human decision-making quality and collective performance, it is 
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

widely accepted and proven that there is a positive relationship between individual 
prediction quality and aggregated performance [36]. 
H4: Deliberation effort will improve human decision-making quality.
H5: Belief updating frequency will improve human decision-making quality.
H6: Human decision-making quality can improve prediction market performance (lower 
Brier score).
In addition to those drivers, previous studies also indicate that belief updating magnitude 
also affects prediction quality. Atanasov et al. [6] found that the most accurate forecasters 
made frequent, small updates, while low-skill forecasters were prone to confirm initial 
judgments or make infrequent, large revisions. In the prediction market, average trading 
shares could be used as a proxy for the belief updating magnitude. We do not distinguish 
the first trading or subsequent ones, as the magnitude in all trading signals humans’ 
confidence level. The results of the experimental asset market literature show that the 
degree of self-confidence at the individual and market levels affects the known basic 
value [3].
In contrast with previous studies, instead of a direct effect on decision quality, we 
propose that trading magnitude affects decision quality as a mediating variable of delibera­
tion efforts and belief updating frequency. A large trading magnitude means that humans 
are often confident about their decisions and tend to be reluctant to put forth more effort to 
deliberate in their decision-making. Previous studies also found that higher subjective 
confidence would decrease the information-seeking behavior in the decision-making pro­
cess [18], which deteriorates the effort of humans.
Regarding the relationship between trading magnitude and belief updating frequency in 
the prediction market, Atanasov et al. [6] found that approximately two-thirds of fore­
casters fall into the categories of “large, infrequent” and “small, frequent,” which means that 
magnitude and frequency may be negatively correlated. Thus, we hypothesize that: 
H7a: Trading magnitude is negatively related to deliberation effort.
H7b: Trading magnitude is negatively related to belief updating frequency.
Method
Research Context and Prediction Task
To conduct the experiment, we designed a prediction web application based on the 
prediction market (https://m.imzhuge.com). Generally, two kinds of market mechanisms, 
double auction and market maker, are available for us to design a prediction market. For 
instance, Iowa Electronic Markets (https://iemweb.biz.uiowa.edu) follows the double auc­
tion approach that matches buyers and sellers, which requires a certain amount of active 
participants in the markets. In contrast to the double auction mechanism, an algorithmic 
LI AND ZHENG

market maker is always prepared to trade. In particular, any participant can trade with the 
market maker and bring new information into the market at any time. Therefore, we adopt 
the second method and develop a logarithmic market scoring rules (LMSR) market, which 
has been widely applied in the prediction market [13, 14, 30, 31].
The tasks in our experiment are one-day-ahead predictions of stock price up–down in 
China. Four well-known listing companies, Kweichow Moutai (stock code: sh600519), 
Eastmoney (stock code: sz300059), Industrial & Commercial Bank of China (stock code: 
sh601398), and Contemporary Amperex Technology (stock code: sz300750), were selected 
as the prediction targets. The LMSR market maker can provide a continuous price, that is, 
probability of potential outcomes, based on the contract amounts. In this study, there are 
two outcomes (contracts) for each prediction task, namely, price rise (“Up”) and price fall 
(“Down”). Assume that refers to the vector contracts shares at time t, in which each element 
represents the total shares of the “Up” and “Down” in the prediction market. The price 
function for these two contracts is determined as follows, where parameter b > 0 determines 
the market’s liquidity. We set b at 200 in this study. The formula suggests that the sum of the 
probabilities (prices) is 1. 
The market maker also holds a cost function that is used to calculate the cost or income for 
a trader. The cost function C qt!
 
is as follows: 
A trader, either a person or a machine, who buys or sells any shares at time t, changing the 
outstanding number of shares from qt  1
! to qt!, will incur a cost of C qt!
 
  C qt  1
!
 
.
To create a hybrid prediction market, 10 machine learning models, such as random 
forests, recurrent neural networks [23], and convolutional neural networks [34], were 
trained for each company. Specifically, we develop two sets of input features, select five 
types of machine learning models, and finally train a total of 10 machine learning predictors 
for each company, that is, five models for each dataset. The first set of features includes 
seven basic price information items of the stock, and the second set of features adds 10 
technical indicators on the basis of the first set of features. The five types of machine 
learning models include logistic regression (LR), decision tree (DT), random forest (RF), 
convolutional neural network (CNN) [34], and long- and short-term recurrent neural 
networks (LSTM) [23]. Since these features are well described in the area of stock market 
prediction, we only display the names of features in Table 2.
These models can explore the patterns embedded in the market data and the derived 
technical indicators to predict the probability of the stock price movement the next day. 
Table 2. Input Features for Machine Models Training.
Features
Examples
7 price features
close, open, high, low, vol, amount, pct_change
10 technical 
features
SMA_10, WMA_10, MOM, MACD, WILLIAM_R, Stochastic Oscillator (Stochastic_K), Stochastic Oscillator 
(Stochastic_D), RSI, AD_Oscillator, CCI
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

There is no significant difference in terms of prediction accuracy, that is, Brier score, 
between the machines in the groups of yes_trade_yes_disclose and yes_introduce_no_di­
sclose (difference = –0.009, p value > 0.1).
Procedure and Manipulation
On the first day of the experiment, the participants were required to read an introduction to 
the experiment and watch a video of the prediction market platform. We also collected 
human demographic information, such as age, gender, machine learning expertise, and 
financial expertise, on the first day. Participants were randomly assigned to one of the three 
scenarios: (1) no machines are introduced and no disclosure of machine presence (no_in­
troduce_no_disclose, H), (2) machines are introduced but their presence is not disclosed 
(yes_introduce_no_disclose, No), or (3) machines are introduced and their presence is 
disclosed to humans (yes_introduce_yes_disclose, Yes). We did not create a condition of 
no_introduce_yes_disclose, which does not have machines but disclosed their presence, 
since it is also not legal and ethical to do so in the field of real-world AI applications.
In the yes_introduce_yes_disclose condition, we indicate that machine traders also trade 
in the market with a pair of questions and answers: “Do machines trade in the market? Yes! 
Some machine agents will participate in the market.” In addition to the manipulation of 
machine presence, we also introduce the basic knowledge about the machine learning 
models in the market: which types of data can be used to train machine learning models, 
the steps in which models can be trained, and how the models make predictions and trade in 
the prediction market. Though we state that all the traders in the market are humans in the 
groups of yes_introduce_no_disclose and no_introduce_no_disclose, similar to the condition 
yes_introduce_yes_disclose, we also introduce the background of machine learning, includ­
ing the input data for model training, how the models are trained, and how models predict 
probabilities of future event.
Before the formal experiment, we recruited 12 college students to check the manipulation 
of treatments. All of the feedback suggests that there is no confusion, suggesting that the 
treatment manipulation works well in the experiment. After random assignment, each 
participant would make predictions and trade in the markets during eight trading days 
from December 2 to December 14, 2021. Every day, four prediction tasks (markets) were 
created for each condition. As we stated in the prediction market design, the prediction 
tasks are one-day-ahead stock movement predictions of four listing companies; therefore, 
96 prediction tasks (4 markets  3 conditions  8 days) were run in the experiment. All the 
prediction tasks started at 3 p.m. each trading day when the stock markets closed in China 
and ended at 9 a.m. the next trading day when the stock market opened again. During this 
period, all humans and machines can only utilize historical data to predict the stock price 
movement of the next day.
The human participants voluntarily join in any prediction tasks they prefer. On the 
first day, all humans were reminded that the more accurate the transaction and the more 
tasks they participated in, the more rewards they might receive. When participants log into 
the trade page, in each prediction task, humans and machines can buy or sell two kinds of 
contracts (“up” or “down”). Before submitting orders, they can make comments, which 
should be at least five words, on the reasons why they buy or sell. Although previous studies 
indicate that the prediction market with a social network may produce better predictions 
LI AND ZHENG

[55], information exchange is not the main concern in this study. Thus, humans trade 
contracts with only their private knowledge and judgment of the stock price movement the 
next day, and machines make their buy or sell decisions based on the models’ output of the 
probability of up movement. If the predicted “up” probability is high, they will buy the “up” 
contracts and the currency invested in each trading changes to (Probabilityup Probabilitydown)  Currency, in which Probabilityup and Probabilitydown refer to the prob­
ability that the stock price goes up and down, and Currency means the currency left in the 
machine’s balance. Otherwise, the machines will buy the “down” contract. The machines 
made trades until no currency was left or the markets ended.
At the beginning of each day, all participants were granted 30 virtual currencies for each 
task to trade on that day, which could not be shared among the tasks or transferred to 
subsequent tasks. For each prediction task, we set a bonus of 100 Chinese yuan, which 
would be shared and divided by all the participants according to their performance. The 
actual results of up–down movement would be revealed at 5 pm the next trading day. If the 
stock price increases, each “up” contract values 1 virtual currency, and each “down” 
contract obtains 0. If the price goes down, each “down” contract values 1 virtual currency, 
and each “up” contract obtains 0. After the market closes, the award of each task would be 
divided and paid to all participants of humans and machines based on their virtual 
currencies. For instance, if a person in a prediction task holds 100 virtual currencies 
when the market is cleared and the total amount of currencies in this task is 1000, he or 
she would receive 10 percent of the 100 yuan bonus, that is, 10 yuan (100  10%).
Participants
Participants (N = 181) were recruited from a university of finance and economics in China, 
of which six persons were excluded without trading in the market, leaving 175 participants 
in this research. The background of the participants is well fitted to the financial prediction 
task, as all of them have taken a basic financial course, which empowers them to trade in the 
prediction market. A total of 152 of 175 people revealed their demographic information; 23 
participants did not fill out the information. The distribution of missing counts and 
nonmissing numbers was not significantly different among the three groups (χ2(2, 175) = 
1.259, p = 0.533 > 0.1). The results in Table 3 show that except for education, other variables 
do not differ significantly between groups, suggesting that the randomization works well.
Detailed descriptive statistics of all participants are shown in Table 4. The results 
indicate that 84 percent of participants ranged from 18 to 25 years old. In total, 
82.3 percent of the participants were undergraduates. In total, 12.6 percent of the 
participants were male, and 74.3 percent were female. With regard to finance 
experience, 43 percent of the participants reported that they had no investment 
Table 3. Demographic Information in Each Group.
Participants feature
H
Yes
No
H vs. Yes
H vs. No
Yes vs. No
Age
1.000
1.073
1.026
-0.073
-0.026
0.046
Gender
0.897
0.836
0.842
0.061
0.054
-0.006
Education
3.000
3.091
3.053
-0.091**
-0.053
0.038
Machine learning experience
1.448
1.491
1.447
-0.043
0.001
0.044
Finance experience
0.431
0.455
0.553
-0.024
-0.122
-0.098
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

experience before, and 64 (36.6 percent) had 1–2 years of investment experience. 
Regarding machine learning expertise, 7.4 percent of the participants reported that 
they had not heard of machine learning, 68 participants (38.9 percent) had heard of 
it, 60 (34.3 percent) had read the materials on machine learning, 9 (5.1 percent) had 
model implementation experience, and two reported that they had an experience of 
model training improvement.
Measures
Prediction Accuracy of the Prediction Market
The prediction accuracy of a prediction market is measured with the Brier score defined 
here: 
where Predup;t denotes the probability (price) forecast placed on the up answer of 
a binary question at time t. Brier scores range from 0 (best) to 2 (worst) [3]. As the 
time point count T may differ from task to task, the mean price in each hour is an 
alternative proxy probability for that hour. In this study, the Brier score was 
calculated based on all price points, as it is very similar to the score based on 
hourly mean price data.
Table 4. Descriptive Statistics of Participants.
Characteristics
Frequency
Percentage (%)
Age
< 18
0.6
18–25
26–30
1.1
31–40
0
0
41–50
0
0
51–60
0.6
>60
0
0
None
13.1
Gender
Male
12.6
Female
74.3
None
13.1
Education
Primary
0
0
Junior high
0
0
High school
0.6
Bachelor
82.3
Master
0.4
Doctoral
0.6
None
13.1
Machine learning experience
Never heard of
7.4
Only heard of
38.9
Materials
34.3
Implement
5.1
Improvement
1.1
None
13.1
Investment experience
No investment experience
Within 2 years
36.6
3–5 years
1.7
Above 5 years
0.6
None
13.1
LI AND ZHENG

Human Decision-Making Quality
Human decisions, sell or buy, are the basic input to change the market price. The ratio of 
human correct trading to total transactions is used to measure all human decision-making 
quality in a prediction task, which is defined as follows: 
in which N is the trade numbers and I(·) is the function that counts the correct tradings, that 
is, the contracts corresponding to the actual result.
Human Trading Behaviors
Three typical human trading behaviors, trading magnitude, deliberation effort, and belief 
updating frequency, have been found to be drivers of decision-making quality. Trading 
magnitude in a prediction task is measured as the average contract shares in all the trades in 
that market. A large trading magnitude may bring a sharp rise or fall in market prices, which 
means that humans have a high level of confidence or belief updating when they trade.
Previous studies measured the efforts humans put into decision making with delibera­
tion time. We use the correlated average length of comments on a trade to measure 
deliberation effort.1 A long comment not only indicates more time human participants 
spent on their decisions but also suggests that human participants think hard and carefully.
Belief updating frequency is the average number of tradings of all humans in a prediction 
task. All the measures of the key variables are listed in Table 5. Three human behavior 
variables in a specific prediction task are first averaged on trading units for a given 
participant and then averaged across participants in that task.
Results
Data Description
The data analysis is on the prediction market (task) level. The research method part stated 
that there are 96 markets in all. The 12 prediction tasks on the first day were excluded, as the 
humans were not very familiar with the prediction market at the beginning of the experi­
ment. Another 24 prediction markets run from Friday afternoon (3 p.m.) to Monday 
Table 5. Measures of the Main Observable Variables
Variables
Measurement
Introduction of machines
machine_introduction 1 when machines are introduced and 0 otherwise
Disclosure of machines presence
machine_disclose
1 if machines’ existence is disclosed to humans and 0 
otherwise
Market prediction performance
overall_bs_all
Brier score, which ranges from 0 (best) to 2 (worst)
Human decision-making quality
h_ratio_pred_true
Ratio of tradings that is consistent with the true result
Human 
behavior
Trading magnitude
h_trading_share
Average number of traded contracts
Deliberation effort
h_comment_length
Average length of comments for a decision
Belief updating 
frequency
h_trade_num
Average number of tradings of all humans in prediction 
tasks
1In the transaction interface, we inform participants with “Writing comments can help you clarify your thoughts and improve 
decision rationality. Please provide comments longer than 5 words”; these words may motivate participants to write 
valuable comments.
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

morning (9 a.m.) were also dropped in the prediction market. Finally, 60 one-day prediction 
markets were left for subsequent data analysis. The statistical characteristics of the key 
variables in the 60 prediction markets are shown in Table 6.
Before hypothesis testing, in this section, we explore the relationships between the key 
variables with a visualization and correlation matrix. First, we obtain 12 groups by grouping 
the data by company, introduction of machines, and disclosure of machine presence. Then 
we calculate the means of the Brier score, human behavior indicators, and human decision 
quality. Finally, we visualize the mean values in each group from subfigures (a)–(e) in 
Figure 2, in which legend 0–0 is the no_introduce_no_disclose group, legend 1–0 is the 
yes_introduce_no_disclose group, and legend 1–1 indicates the yes_introduce_yes_disclose 
group.
Figure 2(a) shows that on the whole, introducing machines into the prediction markets 
can improve prediction performance (lower Brier score), and disclosing machines may 
reduce the prediction accuracy. From Figure 2(b), we see that the overall average decision- 
making 
quality 
of 
humans 
is 
quite 
low. 
Except 
for 
stock 
sh6000519, 
Table 6. Descriptive Statistics for Key Variables.
Count
Mean
Std
Min
Max
overall_bs_all
0.52
0.29
0.13
1.28
h_trading_share
26.87
4.29
18.08
33.89
h_comment_length
8.07
0.49
7.22
9.48
h_num_trade
2.46
0.85
1.35
5.41
h_ratio_pred_true
0.41
0.25
0.00
0.77
Figure 2. Visualization of Key Variables
LI AND ZHENG

yes_introduce_no_disclose scores the highest in terms of human quality, suggesting that 
perhaps introducing but not disclosing machines is the best strategy.
For human behaviors, deliberating efforts are greatest in the yes_trade_no_disclose group 
Figure 2(c). Humans trade more frequently, that is, update belief, in the group no_intro­
duce_no_disclose Figure 2(d). The trading magnitude is larger when the machines partici­
pate in the prediction market Figure 2(e).
In addition to the visualizations, we also explore the relationships between the main 
variables using the correlation matrix shown in Table 7. The results suggest that introducing 
machines and disclosing their presence are positively correlated with trading magnitude 
(h_trading_share). Introducing machines is positively correlated with humans’ deliberation 
effort (h_comment_length), and it will bring a large trading magnitude (h_trading_share) 
and reduce the belief updating frequency (h_num_trade).
Hypotheses Testing
Previous model-free evidence indicates that when introducing machines into a market, 
human participants tend to trade less and trade with higher share, but write more com­
ments, leading to higher performance on both human level and market level. However, after 
disclosing the machines’ presence, the benefits of having machines in the market are 
discounted. To test the research hypotheses, we conducted regression analyses. All the 
variables in this study were observable variables, and data analyses were performed using 
the R version of PROCESS, which is a widely accepted tool for mediation analysis [32].
The models explained 26.58 percent of the variance in prediction performance, 13.94 per­
cent of the variance in human decision-making quality, 48.60 percent of the variance in 
deliberation effort, 54.99 percent of the variance in trading magnitude, and 30.39 percent of 
the variance in belief updating frequency. The results of hypotheses testing are shown in 
Table 8.
Introducing machines significantly influences humans’ deliberation effort (β = 1.083; 
p < 0.001), so H1a was supported. However, introducing machines does not affect belief 
updating significantly (β = –0.408; p > 0.1), indicating that H1b was not supported. 
Introducing machines brings a significant improvement on trading magnitude (β = 
7.306; p < 0.001). Therefore, H1c was supported. Although the exploratory study 
shows that the Brier score is high in the market without machines, we did not find 
a significant role of machine introduction in improving prediction performance (β = – 
0.072; p > 0.1). Thus, H2 was not supported.
The results revealed that machine disclosure has a negative effect on deliberation effort 
(= –0.631; p < 0.001). Therefore, H3a was supported. Additionally, disclosing machines 
affects belief updating frequency significantly (β = –0.482; p < 0.05), suggesting that H3b 
was supported. Regarding its influence on the trading magnitude, we did not find 
a marginally significant negative effect (β = –1.472; p > 0.1). Thus, H3c was not supported.
Considering the value of human behaviors, we found that deliberation effort (β = 
0.152; p < 0.05) and belief updating frequency (β = 0.066; p < 0.1) have a significant 
effect on decision-making quality. Therefore, H4 and H5 were supported. In addition, 
human decision-making quality significantly influences prediction performance (β = – 
0.350; p < 0.05). Therefore, H6 was supported. Regarding the relationships between 
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

Table 7. Correlation Matrices.
overall_bs_all
h_ratio_pred_true
h_num_trade
h_comment_length
h_trading_share
machines_disclose
machine_introduction
overall_bs_all
h_ratio_pred_true
–0.359***
h_num_trade
0.107
0.153
h_comment_length
0.005
0.225*
–0.103
h_trading_share
–0.294**
–0.120
–0.414***
0.159
machines_disclose
–0.0810
0.003
–0.428***
–0.199
0.242*
machine_introduction
–0.189
0.067
–0.496***
0.413***
0.728***
0.500***
LI AND ZHENG

trading magnitude and other behaviors, we found that trading magnitude significantly 
improves deliberation effort (β = –0.053; p < 0.001), supporting H7a. However, it does 
not increase belief updating significantly (β = –0.036; p > 0.1). Therefore, H7b was not 
supported.
Indirect Effects Assessment
Finally, we assess the indirect effects of the machine introduction and disclosure of machine 
presence on human decision-making quality and prediction performance. As Hayes [32] 
suggested, we apply a bias-corrected bootstrap confidence interval for the indirect effect 
Table 8. Hypotheses Testing.
Dependent variables
Independent variables
Trading 
magnitude
Deliberation 
effort
Belief update 
frequency
Human decision 
quality
Prediction 
performance 
(Brier score)
machine disclosure
(H3c)–1.472n.s.
(H3a)– 
0.631***
(H3b)–0.482*
introducing machines
(H1c) 
7.306***
(H1a)1.083***
(H1b)–0.408n. 
s.
(H2)–0.072n.s.
trading magnitude
(H7a)– 
0.053***
(H7b)–0.036n. 
s.
belief update frequency
(H5)0.066#
deliberation effort
(H4)0.152*
sz300059
0.004n.s.
0.044n.s.
sh601398
–0.091n.s.
0.166#
sz300750
–0.140n.s.
0.237*
human participants counts
0.006n.s.
human decision quality
(H6)–0.350*
_cons
22.490***
8.985***
3.870***
–0.925n.s.
0.502n.s.
N
R squared
0.5499
0.4860
0.3039
0.1394
0.2658
Note: n.s., Nonsignificant. *p < .05. **p < .01. ***p < .001. #p < .1. Coefficient values with p < 0.1, p < 0.01, p < 0.05, 
and p < 0.001 are in bold.
Table 9. Total Effects and Indirect Effects of Machines.
Hypotheses
Effect
SE
LLCI
ULCI
Total effects
introducing machine → prediction performance (Brier score)
–0.0938 0.1144 –0.3192
0.1267
machine disclosure → prediction performance (Brier score)
0.0394 0.0216
0.0096
0.0998
Specific indirect effects
introducing machine → trade magnitude → deliberation effort
–0.3833 0.1364 –0.7139 –0.1674
introducing machine → trade magnitude → deliberation effort → human decision 
quality
–0.0583 0.0301 –0.1403 –0.0153
introducing machine → trade magnitude → deliberation effort → human decision 
quality → prediction performance
0.0204 0.0135
0.0042
0.0629
introducing machine → deliberation effort → human decision quality
0.1648 0.0677
0.0323
0.3002
introducing machine → deliberation effort → human decision quality → prediction 
performance
–0.0577 0.0325 –0.147
–0.0123
machine disclosure → deliberation effort → human decision quality
–0.0959 0.0423 –0.1924 –0.0205
machine disclosure → belief update frequency → human decision quality
–0.0317 0.0234 –0.0935 –0.0004
machine disclosure → belief update frequency → human decision quality → 
prediction performance
0.0111 0.0096
0.0006
0.043
machine disclosure → trade magnitude → deliberation effort → human decision 
quality
0.0117 0.0096
0.0005
0.0437
machine disclosure → trade magnitude → deliberation effort → human decision 
quality → prediction performance
–0.0041 0.0037 –0.0179 –0.0003
Note: Only the significant indirect routes are listed in this table.
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

based on 5000 bootstrap samples, and the level of confidence for all confidence intervals in 
output is 95. Before diving into the specific indirect paths, we first present the total effects of 
machine disclosure and machine introduction. The results in Table 9 suggest that introdu­
cing machines does not improve market performance (effect = –0.0938; 95% CI [–0.3192, 
0.1267]), as zero is not excluded from the confidence interval. We believe that the reason 
why the coefficient is not significant is that there is a limit on virtual coins in the prediction 
market, which limits the continuous impact of the machine on the prediction market.
There are two competing indirect routes from machine introduction to prediction 
performance. The positive indirect route is “introducing machine → deliberation effort 
→ human decision quality → prediction performance (Brier score),” and the negative route 
is “introducing machine → trade magnitude → deliberation effort → human decision 
quality → prediction performance (Brier score).” Therefore, it is reasonable to conclude 
that introducing machines increases humans’ deliberation effort, but it also makes humans 
submit large trade orders, which will harm prediction performance.
The results in Table 9 suggest that disclosure of machine presence has a negative effect on 
prediction performance, that is, increasing the Brier score (effect = 0.0394; 95% CI[0.0096, 
0.0998]). The two main indirect routes that make the machines disclose work are “machine 
disclosure → deliberation effort → human decision quality → prediction performance 
(Brier score)” and “machine disclosure → belief update frequency → human decision 
quality → prediction performance (Brier score).” Therefore, the dark side of disclosing 
machines is that it will damage humans’ deliberation effort and reduce humans’ belief 
updating frequency.
Robustness Check
We conduct six robustness checks as follows. First, we include the prediction tasks in the 
first day and run the model with the dataset of 96 one-day prediction markets (RC1). As 
shown in Table 10, all the coefficients follow the same directions as those with 60 prediction 
datasets. Second, we drop machine disclosure variables from the model and run the model 
with a dataset of prediction markets in which machines are not disclosed (RC2a). Similarly, the 
variable introducing machines is deleted from the model, and the hypotheses were tested using 
the prediction markets with machines (RC2b). All the result patterns remain unchanged.
Third, we add a link between trading magnitude and human decision-making quality, as 
previous studies suggest that small updates are good at making predictions (RC3). The 
results show that trading magnitude does have a negative influence on decision quality, but 
it is not significant (β = –0.159, p > 0.1). In addition, when including the direct effect from 
trading magnitude to decision-making quality, all other paths remain unchanged.
Fourth, although trade share can serve as a proxy variable of trade magnitude, the 
number of contracts a participant trades may be influenced by the contract price; thus, 
we use the average payoff to replace the trade share (RC4). Fifth, instead of the comment 
length, we use the average time spent on trading to measure the deliberation effort. 
Specifically, the trade speed is measured with the average time (seconds) from the time 
a participant enters a task page to the time he/she makes a final trade (RC5). Finally, to 
avoid the potential issues related to violations of standard regression assumptions, we 
consider the robust standard errors for coefficient estimation (RC6).
LI AND ZHENG

Mechanism Exploration
Although we have examined the impacts of the machines’ introduction and disclosure of 
their presence on human behaviors at the market level, it is important to understand the 
mechanisms underlying the roles of human–machine interaction. Thus, we further explore 
the possible mechanisms by diving into the participants’ attitude measures toward 
machines, conducting post-task interviews, and analyzing their online click data.
Attitudes Toward Machines
First of all, in the experiment, we measure participants’ attitudes toward machines, team­
mate likeness, and confidence in machines to explore the underlying mechanisms. 
Teammate likeness refers to the extent to which humans consider machines to be team­
mates, which is measured with a single indicator from level 0 (completely teammate) to level 
3 (completely competitor) [16]. The specific average values of teammate likeness in each 
group are 2.09 in the group yes_introduce_yes_disclose, 2.02 in the group yes_introduce_­
no_disclose, and 1.97 in the condition no_introduce_no_disclose. The results suggest that on 
the whole, all the humans in any group view machines as competitors.
Confidence in machines refers to the beliefs of humans about the extent to which 
machines are capable of predicting the future stock movement. A single indicator adjusted 
from Efendić et al. [21] to suit our research context was used to measure humans’ 
confidence in machines, which ranges from 0 (completely distrust) to 3 (completely 
confident). The average values of confidence in machines in each group are as follows: 
Table 10 Robustness Check Results (Path Coefficients of RC1–RC5).
RC1
RC2a
RC2b
RC3
RC4
RC5
RC6
introducing machine → 
deliberation effort (H1a)
0.840***
1.091***
1.058***
1.062***
0.571**
1.083***
introducing machine → 
belief update frequency (H1b)
0.114n.s.
–0.086n.s.
–0.228n.s.
–0.217n.s.
–0.228n.s.
0.019n.s.
introducing machine → 
trade magnitude (H1c)
0.633***
0.767***
0.810***
0.795***
0.810***
7.306***
introducing machine → 
prediction performance (H2)
–0.137n.s.
–0.156n.s.
–0.169n.s.
–0.169n.s.
–0.169n.s.
–0.036n.s.
machine disclosure → 
deliberation effort (H3a)
–0.457***
–0.645***
–0.616***
–0.629***
–0.037n.s.
–0.631***
machine disclosure → 
belief update frequency (H3b)
–0.167#
–0.275*.
–0.269*
–0.277*
–0.269*
–0.095
machine disclosure → 
trade magnitude (H3c)
–0.089n.s.
–0.266#
–0.163#
–0.187#
–0.163#
–1.472*
deliberation effort → 
human decision quality (H4)
0.012n.s.
0.544**
0.362*
0.308#
0.350*
0.487**
0.183***
belief update → 
human decision quality (H5)
0.016n.s.
0.299n.s.
0.119n.s.
0.169n.s.
0.214#
0.137n.s.
0.332***
human decision quality → 
prediction performance (H6)
–0.468***
–0.349*
–0.294*
–0.298#
–0.298*
–0.298**
–0.175**
trading magnitude → 
deliberation effort (H7a)
–0.797***
–0.545**
–0.405**
–0.462**
–0.477**
–0.668***
–0.053***
trading magnitude → 
belief update frequency (H7b)
–0.474***
–0.374n.s.
0.155n.s.
–0.183n.s.
–0.200n.s.
–0.183n.s.
–0.016n.s.
trading magnitude → 
human decision quality
–0.159n.s.
Note: n.s., Nonsignificant. *p < .05. **p < .01. ***p < .001. #p < .1. Coefficient values with p < 0.1, p < 0.01, p < 0.05, and .p < 
0.001 are in bold.
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

1.90 in the group yes_introduce_yes_disclose, 1.62 in the group yes_introduce_no_disclose, 
and 1.92 in the condition no_introduce_no_disclose. The results indicate that when 
machines are introduced into the market, humans’ beliefs about machines’ capabilities 
increase if their presence is disclosed. Although the humans in the no_introduce_no_di­
sclose group have the highest level of confidence in machines, they do not confront 
machines directly.
However, the humans in condition yes_introduce_yes_disclose will be affected by 
machines most, as they consider machines as competitors and at the same time believe 
that machines are capable of predicting future events. The results of the survey about 
teammate likeness and confidence in machines may explain the reasons why humans’ 
deliberation effort decreases when they actually face the challenges coming from machines. 
In addition to attitude surveys, future research can further explore the mechanisms by 
evaluating the impacts of machines on humans’ immediate emotions and overall arousal 
based on neural evidence [66].
Interviews
The attitude surveys show that when machines are added into the market, humans’ beliefs 
about machines’ capabilities are increasing if machines’ presence is disclosed. However, the 
underlying reason is not clear yet; for example, it is possible that humans are averse to 
algorithm—that is, they think machines have capability, but they are reluctant to give more 
effort when trading in a market with such competitive machines. To uncover the mechan­
isms of the effects of disclosure of machine presence, we further conducted interviews with 
eight human participants under the condition yes_introduce_yes_disclose. The focal topic of 
the interviews was humans’ feelings about the machines’ presence. All of the eight inter­
viewees stated that they felt the competition in the market become fiercer. One respondent 
even said that “machines tend to make decisions more quickly than humans, and I’m 
unlikely to be able to beat it.” The more competition there is, the less likely it is that humans 
will gain high profits.
To our surprise, even though interviewees consider machines as competitors, they do not 
hate or become jealous of the machines as we expected. Thus, the decreasing of deliberation 
effort when presence is disclosed may not come from algorithm aversion; it is more likely 
come from the higher level of competition. In this condition of higher competition, humans 
become more aroused to make quick investment decisions with less deliberation effort, 
which may damage their decision quality.
Click Data Exploration
Moreover, to further prove that humans will make quicker decisions, we also analyzed the 
online click data of participants and explored the differences in their actions in different 
groups. Typically, there are three kinds of actions in trading: “enter prediction task,” “go to 
trade,” and “view information.” Action “enter prediction task” occurs when a participant 
clicks the button to enter a prediction task page. After entering a task page, a participant can 
trade directly by clicking the trade button (action “go to trade”) or explore more relevant 
information about the task by clicking different buttons on the page (action “view informa­
tion”). We calculated the frequency of each action following another action and constructed 
LI AND ZHENG

a behavior transition matrix for three conditions. The results show that the transition rate 
from action “enter prediction task” to the action “go to trade” is slightly increasing in the 
condition yes_introduce_no_disclose (0.362) compared to the condition yes_introduce_yes_­
disclose (0.461). On the contrary, the transition rate from action “enter prediction task” to 
“view information” is decreasing (from 0.429 to 0.303), which indicates that when we 
disclose the presence of machines, humans tend to trade directly instead of exploring 
more information related to the task. These results further give consistent evidence for 
humans’ quick decisions when facing fierce competition.
Finally, Figure 3 summarizes the mechanism exploration by displaying humans’ attitudes 
toward machines and action transition rates (ratios of participants who trade directly or 
review the information before trading).
Discussion
Implications for Research
The prediction market serves as an effective tool for harnessing the wisdom of crowds. 
Human–machine interaction design plays a crucial role in the prediction performance of 
the hybrid prediction market. This study explores the impact of the introduction of 
machines and the disclosure of their presence on human decision-making quality and 
prediction performance. Although the current study does not explore the influence of 
more intricate human–computer interaction designs on prediction performance, the 
study still offers insights into the influence of machine presence disclosure on subsequent 
human-computer hybrid decision making.
Compared with the previous literature on information aggregation and forecasting, the 
prediction market in this article is a unique and complex environment that combines the 
characteristics of markets, games, and tournaments and has been used in prediction tasks in 
various fields, such as education [10, 40]. Few studies have investigated the impact of adding 
machine trading and disclosure of its presence in the field of economic and financial 
Figure 3. Mechanism Exploration Results
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

forecasting. Existing studies on hybrid prediction systems usually consider human adoption 
of machine predictions in a cooperative manner, while the context of the prediction market 
allows us to examine the impact of whether to introduce machines on human prediction in 
a competitive way [65]. This study makes three contributions to research on human– 
machine hybrid prediction systems as follows.
First, to the best of our knowledge, we are one of the first to introduce human behaviors 
as drivers for prediction performance in a human–machine hybrid prediction market. 
Extant studies have tried to integrate machines and humans together and assess their 
prediction performance [51]; however, they do not investigate the exact mechanisms by 
which machines affect the prediction efficiency. Analytical models and simulation methods 
have also been used to study the design of human–machine hybrid systems, but the 
influence of the disclosure of machine presence has not been well explored [24]. 
Introducing human behaviors as mediating drivers of market performance allows us to 
uncover the impacts of machines in this kind of hybrid market. Specifically, deliberation 
effort and belief update frequency were modeled as direct factors influencing decision- 
making quality. Additionally, we assessed the impacts of another human behavior, trading 
magnitude, which is found to be negatively related to deliberation efforts.
Second, the results revealed two competing influences of introducing machines on 
human behaviors. The positive influence comes from the intensive competition brought 
by machines that enables humans to have a desire to win and motivates them to deliberate 
more. The positive effect may not always hold as the machine’s number increases. In this 
study, 10 machine learning models were developed for each market. More machines will 
intensify the competition greatly, which may even lower humans’ effort. Future studies 
should check whether or not human efforts continue to increase with higher level machine 
participation, that is, introducing more machines. Our results also suggested a negative 
effect of introducing machines in the condition of a high level of competition—humans 
tend to trade in large magnitude, which will lower the prediction performance. The results 
can be explained by the studies on the effects of competition on human participation in 
digital game research. The participants in our experiments have a similar background, so 
a participant might infer he or she was competing with humans who have the comparable 
ability. According to the results of digital games, players will put more effort when facing 
opponents with similar ability [42]. Thus, when introducing machines, increased trading 
frequency, or rapidly changing price dynamics create a more competitive market, partici­
pants tend to deliberate more effort and gather more information to trade. However, 
according to the competitive arousal model, a participant may also feel excited facing the 
increased competition, resulting in more confidence, and may transact with larger trade 
magnitude on a high-uncertainty event, finally deteriorating the positive effects of his or her 
effort.
Third, the results verified that simply disclosing machine presence will harm the perfor­
mance of the hybrid prediction market, as it will decrease humans’ deliberation effort. The 
extent to which machines are perceived or disclosed to humans differs greatly in the 
experimental market and real finance market. In the foreign exchange market, although 
lots of trades are made by machines, humans cannot truly feel the direct interaction against 
machines [15]. Besides, the perspective of the presence of algorithm traders in stock market 
analysis is different from ours. Studies in the stock market are concerned with the overall 
impact (e.g., liquidity and volatility of the market), while this article focuses on the 
LI AND ZHENG

prediction function of the prediction market, as well as the machines’ influence on parti­
cipants’ perceptions and behaviors. Therefore, it is better suited for comparison with 
research conducted on experimental economic markets. However, in the experimental 
market, the information about machine presence can be manipulated by the researcher. 
Although the impacts of machine presence have been studied in financial experiment 
studies, the uniqueness that differentiates the prediction market from traditional finance 
conditions makes it interesting to further study machine behavior designs. For example, in 
the financial experimental market, participants often do not need to collect additional data 
to make decisions, as the distribution of possible dividends for each contract is common 
knowledge in the market [26, 29]. However, in the prediction market, all humans who want 
to make wise decisions must exert more effort, such as collecting data and deliberating more 
on their transactions.
Regarding the methodology employed in this study, field experiments with real stock 
price volatility prediction tasks improve the external validity of our findings. The negative 
effect of machine disclosure may inspire future studies to design more harmonious human– 
machine relationships to mitigate the dark side of machine disclosure. For example, 
gamification designs can be utilized in the hybrid prediction market to alleviate the hostile 
relationship between humans and machines [40].
Implications for Practice
This research also holds important practical implications. First, since humans’ deliberation 
effort and belief updating frequency contribute to decision-making quality, and trading 
magnitude is harmful, sponsors of the prediction market could develop a process to audit 
humans’ good and bad behavioral attributes for potential intervention techniques. For 
example, if someone is found to make excessive, hasty trades with little effort, the system 
can alert him or her about that decision or provide assistance, such as sharing machines’ 
predictions.
Second, we should be cautious about introducing machines by balancing their positive 
and negative effects on human decision quality. Specifically, people may trade in large 
magnitude, which brings large belief updates and reduces human deliberation effort and 
market performance. Thus, this calls for more attention to human–machine interaction 
design to optimize or minimize humans’ trading magnitude. For example, a maximum 
volume of a single transaction could be set for humans, which enforces them to invest less 
each time and makes for more belief updating. In this study, we introduced 10 models into 
each market. To maintain the intelligence of machines while mitigating their potential 
negative impacts, it may be more advantageous to use a smaller number of models with 
strong predictive capabilities.
Third, simply disclosing machines to humans is not a good choice. Disclosing 
machines can reduce trading magnitude, which is found to be a good practice in 
judgment and decision making. One possible reason is that humans become more 
alert to new information when they see the existence of machines, and they will make 
smaller investments. Sponsors of the prediction market could attempt to harness this 
positive aspect of disclosing machine presence, while they must be cautious about the 
dark side, since disclosing machines may be harmful for human deliberation efforts. To 
make human–machine interactions friendlier, we should consider other human– 
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

machine interactions. For instance, a cooperation framework enabling humans and 
machines to have a common goal may lessen people’s hostility to machines and improve 
humans’ efforts.
Limitations and Future Research
Despite its contributions to theory and practice, this study has several limitations for future 
study. First, the model in this study only explains 13.94 percent of the variance of belief 
updating frequency, an important predictor for human decision-making quality, suggesting 
that other antecedents to belief updating were missed in the study. Future studies could 
investigate the factors influencing human trade frequency. It is possible that introducing 
gamification elements can motivate humans to engage in more small trades. Second, all the 
participants in the experiments are students from a university of finance and economics in 
China; thus, their average decision-making qualities are not as good as those of experts in 
financial companies. In addition, experts in the finance industry may have different attitudes 
toward machines. Although the prediction market with small group sizes works well in 
environments with varying degrees of knowledgeable participants [67], it is valuable for 
future studies to assess the validity of our results for larger populations with more financial 
experience. Third, this study did not study the dynamic effects of machines on market 
performance. Humans’ attitudes toward machines may change over the long run [48]; 
however, the experiments in this study lasted for only eight days, which prevented us from 
assessing the dynamic effects of machines. In the future, we could run a long-term hybrid 
prediction market to check whether machines’ negative effects diminish as humans adapt to 
machines. Finally, we only consider the situation of only disclosing the presence of machines; 
it would be valuable to conduct more experiments to examine different kinds of disclosure 
policies, which may affect human behaviors in different ways. In this study, we disclose the 
accuracy of machines in this scenario in the pretest; the accuracy has little impact on 
participants’ behaviors, as the prediction task—stock fluctuation prediction—is a rather 
hard task in reality, so participants did not expect high performance from machines.
Conclusions
This study investigated the effects of introducing machines and disclosing their presence on 
human decision-making quality and prediction performance in hybrid prediction markets. 
The findings reveal that human behaviors, such as deliberation effort, belief update fre­
quency, and trading magnitude, play crucial roles in determining the success of human- 
machine hybrid prediction systems. While the introduction of machines (merely trading) 
can have both positive and negative effects on human behaviors, disclosing machine 
presence additionally may harm the overall performance of the hybrid prediction market. 
Therefore, careful consideration should be given to human–machine interaction design of 
the human–machine hybrid prediction market to optimize prediction performance. This 
research not only contributes to the theoretical understanding of human–machine hybrid 
prediction systems but also offers practical implications for designing more effective pre­
diction markets. Future studies could further explore the dynamic effects of machines, the 
impact of different disclosure policies, and the validity of the findings in larger populations 
with varying levels of financial expertise.
LI AND ZHENG

Disclosure statement
No potential conflict of interest was reported by the author(s).
Funding
This study was supported by National Natural Science Foundation of China (72071160).
Notes on contributors
Liting Li (liliting@tyut.edu.cn) is a lecturer at the College of Economics and Management, Taiyuan 
University of Technology, China. Liting Li is also affiliated with Shanxi Key Laboratory of Data 
Element Innovation and Economic Decision Analysis, Taiyuan, China. She received her Ph.D. in 
technical economics and management from Southwestern University of Finance and Economics, 
China. Dr. Li’s research interests lie in the areas of crowdsourcing, crowdfunding, and human– 
machine hybrid prediction systems. She has published in MIS Quarterly, Decision Support Systems, 
Electronic Commerce Research, Electronic Commerce Research and Applications, Journal of Global 
Information Management, and other venues.
Haichao Zheng (haichao@swufe.edu.cn; corresponding author) is a professor at the School of 
Management Science and Engineering, Southwestern University of Finance and Economics, China. 
He received his Ph.D. in management science and engineering from Nankai University, China. 
Dr. Zheng’s research interests include crowdsourcing, crowdfunding, and human–machine hybrid 
prediction systems. He has published in the MIS Quarterly, Decision Support Systems, Information 
Systems Journal, European Journal of Information Systems, Information and Management, 
International Journal of Electronic Commerce, Electronic Commerce Research, Electronic Commerce 
Research and Applications, and other journals.
References
1. Abeliuk, A.S.; et al. Quantifying machine influence over human forecasters. Scientific Reports, 
10, 1 (2020), 1–14.
2. Ananny, M.; and Crawford, K. Seeing without knowing: Limitations of the transparency ideal 
and its application to algorithmic accountability. New Media & Society, 20, 3 (2018), 973–989.
3. Aragón, N.; and Roulund, R.P. Confidence and decision-making in experimental asset markets. 
Journal of Economic Behavior & Organization, 178, (2020), 688–718.
4. Arrow, K.J.; et al. The promise of prediction markets. Science, 320 (2008), 877–878.
5. Atanasov, P.; et al. Distilling the wisdom of crowds: Prediction markets vs. prediction polls. 
Management Science, 63, 3 (2017), 691–706.
6. Atanasov, P.; et al. Small steps to accuracy: Incremental belief updaters are better forecasters. 
Organizational Behavior and Human Decision Processes, 160 (2020), 19–35.
7. Berea, A.; and Twardy, C. Automated trading in prediction markets, in International 
Conference on Social Computing, Behavioral-Cultural Modeling, and Prediction, 2013, pp. 
111–122.
8. Berg, J.E.; Neumann, G.R.; and Rietz, T.A. Searching for Google’s value: Using prediction 
markets to forecast market capitalization prior to an initial public offering. Management 
Science, 55, 3 (2009), 348–361.
9. Browne, G.J.; Pitts, M.G.; and Wetherbe, J.C. Cognitive stopping rules for terminating infor­
mation search in online tasks. MIS Quarterly, 31, 1 (2007), 89–104.
10. Buckley, P.; and Doyle, E. Individualising gamification: An investigation of the impact of 
learning styles and personality traits on the efficacy of gamification using a prediction market. 
Computers & Education, 106 (2017), 43–55.
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

11. Cao, M.; et al. A portfolio strategy design for human–computer negotiations in e-retail. 
International Journal of Electronic Commerce, 24, 3 (2020), 305–337.
12. Cartlidge, J.; et al. Too fast too furious: Faster financial-market trading agents can give less 
efficient markets. In ICAART-2012: 4th International Conference on Agents and Artificial 
Intelligence. 2012.
13. Carvalho, A. On a participation structure that ensures representative prices in prediction 
markets. Decision Support Systems, 104, (2017), 13–25.
14. Carvalho, A. A permissioned blockchain-based implementation of lmsr prediction markets. 
Decision Support Systems, 130, (2020), 1–15.
15. Chaboud, A.P.; et al. Rise of the machines: Algorithmic trading in the foreign exchange market. 
Journal of Finance, 69, 5 (2014), 2045–2084.
16. Chen, J.Y.C.; et al. Situation awareness-based agent transparency and human-autonomy 
teaming effectiveness. Theoretical Issues in Ergonomics Science, 19, 3 (2018), 259–282.
17. Das, R.; et al. Agent–human interactions in the continuous double auction. In Proceedings of 
the International Joint Conferences on Artificial Intelligence (IJCAI), 2001.
18. Desender, K.; Boldt, A.; and Yeung, N. Subjective confidence predicts information seeking in 
decision making. Psychological Science, 29, 5 (2018), 761–778.
19. Dietvorst, B.J.; Simmons, J.P.; and Massey, C. Algorithm aversion: People erroneously avoid 
algorithms after seeing them err. Journal of Experimental Psychology, 144, 1 (2015), 114–126.
20. Dong, L.; et al. Human–machine hybrid prediction market: A promising sales forecasting 
solution for e-commerce enterprises. Electronic Commerce Research and Applications, 
56 (2022).
21. Efendić, E.; Van de Calseyde, P.P.F.M.; and Evans, A.M. Slow response times undermine trust 
in algorithmic (but not human) predictions. Organizational Behavior and Human Decision 
Processes, 157 (2020), 103–114.
22. Farjam, M.; and Kirchkamp, O. Bubbles in hybrid markets: How expectations about algorith­
mic trading affect human trading. Journal of Economic Behavior & Organization, 146, (2018), 
248–269.
23. Fischer, T.; and Krauss, C. Deep learning with long short-term memory networks for financial 
market predictions. European Journal of Operational Research, 270, 2 (2018), 654–669.
24. Fügener, A.; et al. Will humans-in-the-loop become borgs? Merits and pitfalls of working with 
ai. MIS Quarterly, 45, 3 (2021), 1527–1556.
25. Füllbrunn, S.; Rau, H.A.; and Weitzel, U. Does ambiguity aversion survive in experimental 
asset markets? Journal of Economic Behavior & Organization, 107 (2014), 810–826.
26. Grossklags, J.; and Schmidt, C. Software agents and market (in)efficiency—A human trader 
experiment. IEEE Trans SMC Part C. Special Issue on Game-Theoretic Analysis & Simulation of 
Negotiation Agents, (2006), 1–13.
27. Grossklags, J.; and Schmidt, C. Software agents and market (in)efficiency—A human trader 
experiment. IEEE Transactions on Systems, Man, and Cybernetics, Part C (Applications and 
Reviews), 36, 1 (2006), 56–67.
28. Guo, Z.; Fang, F.; and Whinston, A.B. Supply chain information sharing in a macro prediction 
market. Decision Support Systems, 42, 3 (2006), 1944–1958.
29. Hanaki, N.; Akiyama, E.; and Ishikawa, R. Behavioral uncertainty and the dynamics of traders’ 
confidence in their price forecasts. Journal of Economic Dynamics and Control, 88, (2018), 
121–136.
30. Hanson, R. Combinatorial information market design. Information Systems Frontiers, 5, 1 
(2003), 107–119.
31. Hanson, R. Logarithmic market scoring rules for modular combinatorial information 
aggregation. Journal of Prediction Markets, 1 (2007), 3–15.
32. Hayes, A. Introduction to Mediation, Moderation, and Conditional Process Analysis (3rd ed.), 
A Regression-Based Approach. New York: Guilford Press, 2022
33. Hill, S.; and Ready-Campbell, N. Expert stock picker: The wisdom of (experts in) crowds. 
International Journal of Electronic Commerce, 15, 3 (2011), 73–102.
LI AND ZHENG

34. Hoseinzade, E.; and Haratizadeh, S. CNNPred: CNN-based stock market prediction using 
a diverse set of variables. Expert Systems with Applications, 129 (2019), 273–285.
35. Kahneman, D.; et al. Noise: How to overcome the high, hidden cost of inconsistent decision 
making. Harvard Business Review, 94 (2016), 38–46.
36. Keuschnigg, M.; and Ganser, C. Crowd wisdom relies on agents’ ability in small groups with 
a voting aggregation rule. Management Science, 63, 3 (2017), 818–828.
37. Kleinberg, J.; et al. Human decisions and machine predictions. Quarterly Journal of Economics, 
133, 1 (2018), 237–293.
38. Krach, S.R.; et al. Can machines think? Interaction and perspective taking with robots inves­
tigated via fmri. PLOS ONE, 3, 7 (2008), 1–11.
39. Ku, G.; Malhotra, D.; and Murnighan, J.K. Towards a competitive arousal model of 
decision-making: A study of auction fever in live and internet auctions. Organizational 
Behavior and Human Decision Processes, 96, 2 (2005), 89–103.
40. Legaki, N.Z.; et al. Gamification of the future—An experiment on gamifying education of 
forecasting. Proceedings of the 52nd Hawaii International Conference on System Sciences, 2019.
41. Li, E.Y.; Tung, C.-Y.; and Chang, S.-H.C.-H. The wisdom of crowds in action: Forecasting 
epidemic diseases with a web-based prediction market system. International Journal of Medical 
Informatics, 92 (2016), 35–43.
42. Liu, D.; Li, D.; and Santhanams, R. Digital games and beyond: What happens when players 
compete? MIS Quarterly, 37, 1 (2013), 111–124.
43. Luca, M.D.; and Cliff, D. Agent–human interactions in the continuous double auction—Redux 
using the OpEx lab-in-a-box to explore ZIP and GDX. Proceedings of the 3rd International 
Conference on Agents and Artificial Intelligence (ICAART), 2011.
44. Luca, M.D.; and Cliff, D. Human–agent auction interactions: Adaptive-aggressive agents 
dominate. Proceedings of the Twenty-Second International Joint Conference on Artificial 
Intelligence, 2011.
45. Luo, X.; et al. Frontiers: Machines vs. humans: The impact of artificial intelligence chatbot 
disclosure on customer purchases. Marketing Science, 38, 6 (2019), 937–947.
46. Malhotra, D.; Ku, G.; and Murnighan, J.K. When winning is everything. Harvard Business 
Review, 86, 5 (2015), 1–10.
47. Manahov, V.; and Zhang, H. Forecasting financial markets using high-frequency trading data: 
Examination with strongly typed genetic programming. International Journal of Electronic 
Commerce, 23, 1 (2019), 12–32.
48. McNeese, N.J.; et al. Trust and team performance in human-autonomy teaming. International 
Journal of Electronic Commerce, 25, 1 (2021), 51–72.
49. Mellers, B.; et al. The psychology of intelligence analysis: Drivers of prediction accuracy in 
world politics. Journal of Experimental Psychology Applied, 21, 1 (2015), 1–14.
50. Mukerji, P.; et al. The impact of algorithmic trading in a simulated asset market. Journal of Risk 
and Financial Management, 12, 68 (2019), 1–11.
51. Nagar, Y.; and Malone, T.W. Making business predictions by combining human and machine 
intelligence in prediction markets. Thirty Second International Conference on Information 
Systems, Shanghai, 2011.
52. O’Leary, D.E. User participation in a corporate prediction market. Decision Support Systems, 
78, (2015), 28–38.
53. Patel, B.N.; et al. Human–machine partnership with artificial intelligence for chest radiograph 
diagnosis. NPJ Digital Medicine, 2 (2019), 111.
54. Pitts, M.G.; and Browne, G.J. Stopping behavior of systems analysts during information 
requirements elicitation. Journal of Management Information System, 21, 1 (2004), 203–226.
55. Qiu, L.; Rui, H.; and Whinston, A. Social network-embedded prediction markets: The effects of 
information acquisition and communication on predictions. Decision Support Systems, 55, 4 
(2013), 978–987.
56. Restocchi, V.; et al. It takes all sorts: A heterogeneous agent explanation for prediction market 
mispricing. European Journal of Operational Research, 270, 2 (2018), 556–569.
INTERNATIONAL JOURNAL OF ELECTRONIC COMMERCE

57. Robert Baum, J.; and Wally, S. Strategic decision speed and firm performance. Strategic 
Management Journal, 24, 11 (2003), 1107–1129.
58. Schmitt, B. Speciesism: An obstacle to AI and robot adoption. Marketing Letters, 31, 1 (2019), 
3–6.
59. Schnytzer, A.; and Snir, A. Herding in imperfect betting markets with inside traders. Journal of 
Gambling Business and Economics, 2, 2 (2008), 1–16.
60. Spann, M., and Skiera, B. Internet-based virtual stock markets for business forecasting. 
Management Science, 49, 10 (2003), 1310–1326.
61. Steyvers, M.; et al. Bayesian modeling of human-ai complementarity. Proceedings of the 
National Academy of Sciences, 119, 11 (2022), e2111547119.
62. Sung, M.-C.; et al. Improving prediction market forecasts by detecting and correcting possible 
over-reaction to price movements. European Journal of Operational Research, 272, 1 (2019), 
389–405.
63. Sweller, J. Cognitive load during problem solving: Effects on learning. Cognitive Science, 
12 (1988), 257–285.
64. Teodorescu, M.; et al. Failures of fairness in automation require a deeper understanding of 
human–ML augmentation. MIS Quarterly, 45, 3 (2021), 1483–1500.
65. Tetlock, P.E.; Mellers, B.; and Scoblic, J.P. Bringing probability judgments into policy debates 
via forecasting tournaments. Science, 355, (2017), 481–483.
66. Teubner, T.; Adam, M.; and Riordan, R. The impact of computerized agents on immediate 
emotions, overall arousal and bidding behavior in electronic auctions. Journal of the 
Association for Information Systems, 16, 10 (2015), 838–879.
67. Van Bruggen, G.H.; et al. Prediction markets as institutional forecasting support systems. 
Decision Support Systems, 49, 4 (2010), 404–416.
68. van den Broek, E.; Sergeeva, A.; and Huysman Vrije, M. When the machine meets the expert: 
An ethnography of developing AI for hiring. MIS Quarterly, 45, 3 (2021), 1557–1580.
69. Weibel, D.; et al. Playing online games against computer- vs. human-controlled opponents: 
Effects on presence, flow, and enjoyment. Computers in Human Behavior, 24, 5 (2008), 
2274–2291.
70. Williams, R.B.; and Clippinger, C.A. Aggression, competition and computer games: Computer 
and human opponents. Computers in Human Behavior, 18 (2002), 495–506.
71. Wilson, H.J.; and Daugherty, P.R. Collaborative intelligence: Humans and AI are joining 
forces. Harvard Business Review, (2018), 1–11.
72. Wolfers, J.; and Zitzewitz, E. Prediction markets. Journal of Economic Perspectives, 18, 2 (2004), 
107–126.
73. Wu, D.-J. Artificial agents for discovering business strategies for network industries. 
International Journal of Electronic Commerce, 5, 1 (2000), 9–36.
74. Yang, S.; Li, T.; and van Heck, E. Information transparency in prediction markets. Decision 
Support Systems, 78 (2015), 67–79.
LI AND ZHENG

Copyright of International Journal of Electronic Commerce is the property of Taylor &
Francis Ltd and its content may not be copied or emailed to multiple sites or posted to a
listserv without the copyright holder's express written permission. However, users may print,
download, or email articles for individual use.