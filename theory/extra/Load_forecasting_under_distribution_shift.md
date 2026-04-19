Contents lists available at ScienceDirect
Applied Energy
journal homepage: www.elsevier.com/locate/apen
Load forecasting under distribution shift: An online quantile ensembling 
approach
Dalin Qin a iD , Xian Wu a , Dayan Sun b , Zhifeng Liang b , Ning Zhang a,∗ iD
a Tsinghua Sichuan Energy Internet Research Institute, 610213, Sichuan, China 
b State Grid Corporation of China, 100031, Beijing, China
H I G H L I G H T S
∙ Propose a novel quantile ensemble strategy that bridges probabilistic forecasting and deterministic prediction by leveraging the rich information encoded in 
multiple quantiles. This strategy dynamically combines quantile forecasts with adaptive long-term and short-term weights, enabling more accurate and robust 
online predictions.
∙ Propose a detect-then-adapt strategy featuring a quantile-level shift indicator to identify distribution changes. Based on this indicator, we introduce an adaptive 
fast-and-slow learning strategy that dynamically adjusts online learning rate for balancing rapid adaptation to abrupt shifts and stable learning during gradual 
changes, enabling effective responses to non-stationary and evolving data distributions.
∙ We conduct extensive experiments across diverse distribution shift scenarios, demonstrating the proposed method’s superior adaptability and forecasting accuracy 
compared to conventional approaches. Moreover, in-depth discussions reveal how quantile-specific adjustments, adaptive learning strategies, and choice of quantile 
combination contribute to its practical effectiveness, offering actionable guidance for real-world applications.
A R T I C L E 
I N F O
Keywords:
Load forecasting 
Distribution shift 
Ensemble learning 
Online learning
A B S T R A C T
Reliable load forecasting is crucial for power system operations but remains challenging under frequent distribu-
tion shifts caused by evolving consumption patterns and external disruptions. While deterministic methods (DLF) 
generate point predictions and probabilistic methods (PLF) capture uncertainty, existing approaches fail to bridge 
these paradigms to utilize PLF’s distribution insights for improving DLF accuracy under shifting conditions. To 
address this gap, we propose Adaptive Online Quantile Ensembling, a novel framework that integrates probabilis-
tic insights into deterministic forecasting for robust online adaptation. Our method features dynamic quantile 
ensembling with long-term and short-term weight decomposition for balancing stability and responsiveness, as 
well as a detect-then-adapt strategy for adaptive fast-and-slow learning based on real-time error monitoring. 
Extensive experiments on post-COVID load datasets demonstrate significant improvements in accuracy and re-
sponsiveness over baselines, particularly during abrupt and gradual distribution shifts. This work establishes an 
effective approach to leverage probabilistic information for accurate load forecasting in dynamic, non-stationary 
environments.
1. Introduction
Accurate load forecasting plays a crucial role in the reliable and 
efficient operation of modern power systems. Over the past decades, 
extensive load forecasting research has been conducted, covering a 
broad range of horizons, including short-term, medium-term, and long-
term forecasting [1,2]. The methodologies used in load forecasting can
generally be classified into several categories: statistical approaches, 
such as autoregressive integrated moving average [3]; machine learn-
ing techniques, such as support vector machines [4], random forests 
[5]; and deep learning models, such as multi-layer perceptron networks 
(MLP) [6], recurrent long short-term memory networks (LSTM) [7], 
convolutional neural networks (CNN) [8], transformers [9], and so on.
∗ Corresponding author.
Email address: ningzhang@tsinghua.edu.cn (N. Zhang).
https://doi.org/10.1016/j.apenergy.2025.126812 
Received 26 June 2025; Received in revised form 25 August 2025; Accepted 18 September 2025
Applied Energy 401 (2025) 126812 
Available online 7 October 2025 
0306-2619/© 2025 Elsevier Ltd. All rights are reserved, including those for text and data mining, AI training, and similar technologies. 

D. Qin, X. Wu, D. Sun et al.
Recent research efforts have focused not only on general algorithmic 
improvements, but also on the underlying characteristics and optimiza-
tion of load datasets. For instance, similarity-based grouping methods 
have been demonstrated to be effective for evaluating and optimizing 
the structure of building cooling load datasets in the absence of measur-
able occupancy information, facilitating improved model performance 
in realistic deployment scenarios [10]. Moreover, deep learning-based 
feature engineering techniques have shown great promise for extract-
ing latent patterns and enhancing building energy prediction accuracy, 
particularly under complex load dynamics [11]. The development and 
validation of simplified yet robust online cooling load prediction ap-
proaches for large buildings have further illustrated the value of effi-
cient, adaptive models in practical settings [12]. Increasing attention 
has also been paid to transfer learning and data-centric strategies to 
address forecasting challenges in data-scarce contexts. Notably, stud-
ies have systematically investigated the statistical and practical merits 
of transfer learning methods, revealing their substantial benefits for 
short-term building energy predictions where labeled data are limited 
or distributional heterogeneity is present [13]. The comparative eval-
uation of data-centric and algorithm-centric approaches provides new 
insights for model selection and domain adaptation in energy forecasting 
applications [14].
While traditional deterministic load forecasting (DLF) approaches 
typically provide point estimates, they often fail to capture the inherent 
uncertainties in power systems. To address this limitation, probabilis-
tic load forecasting (PLF) has attracted increasing attention in recent 
years [15]. By generating forecast intervals, quantiles, or probability 
distributions instead of single-valued predictions, PLF offers a more 
comprehensive representation of uncertainty, enabling more informed 
decision-making for power system operation and planning. For instance, 
a pinball loss-guided LSTM model was investigated in [16] for individ-
ual PLF. [17] proposed a deep mixture model for conditional probability 
density forecasting of residential loads, and [18] proposed load prob-
ability density forecasting using Gaussian process quantile regression. 
[19] investigated neural basis expansion analysis and conformal quan-
tile regression to obtain robust load prediction intervals with theoretical 
coverage guarantees. Some studies investigate how to transform point 
forecasts into probabilistic forecasts. [20] proposed generating proba-
bilistic load forecasts by performing quantile regression averaging on a 
set of sister point forecasts. [21] proposed a bootstrap-based ensemble 
approach to construct forecast intervals from multiple point forecasts. 
[22] proposed a novel PLF method to leverage existing point load 
forecasts by modeling the conditional forecast residuals.
In recent years, the stochasticity and volatility of electricity loads 
have increased significantly, driven by the integration of renewable en-
ergy, changing consumption patterns, and the emergence of new loads 
such as electric vehicles. Traditional models, which are typically trained 
using fixed historical datasets, often struggle to adapt to these dynamic 
changes and suffer from degraded forecasting accuracy in the presence 
of shifting data distributions [23]. To address the challenges posed by 
distribution shifts, various techniques, such as online learning, have 
been proposed to enhance the adaptability and robustness of forecast-
ing models under non-stationary conditions. For DLF, [24,25] proposed 
continuously updating the forecasting model in response to changes 
in the underlying data distribution, thereby improving forecasting per-
formance in dynamic environments. [26] developed a reinforcement 
learning-based online load forecasting approach to capture possible vari-
ations in demand patterns. [27] proposed a modified passive-aggressive 
regression model to implement online ensemble forecasting. For PLF, 
[28] proposed adaptive online learning of hidden Markov models with 
theoretical guarantees. [29] investigated the coupling effect of external 
features on PLF and proposed an online decoupling feature framework 
to account for distribution shifts. [30] paid special attention to tem-
poral correlation in online PLF. [31] proposed a Kalman filter-based 
adaptive quantile regression approach for online forecasting of electric-
ity net load. Ensemble learning has become a promising strategy for
improving the robustness and accuracy of forecasting models under dis-
tribution shifts [32,33]. By integrating multiple predictors, ensemble 
methods can mitigate the individual weaknesses of component mod-
els and enhance overall adaptability to non-stationary environments. 
Notable advancements include the development of static and dynamic 
ensemble frameworks, such as probabilistic ensemble load forecast-
ing [21], hybrid ensemble learning [34], passive-aggressive regression 
ensembles [27], and online random forests [35]. These approaches lever-
age the diversity and complementary strengths of different models, and 
in dynamic settings, allow for the adaptive adjustment of ensemble 
weights or structures in response to real-time data changes.
Despite recent advances, research on deterministic load forecasting 
(DLF) and probabilistic load forecasting (PLF) and ensemble learning 
under distribution shift still faces notable limitations, which can be 
summarized as follows:
• Limited Exploitation of Distributional Insights: Most prior works
develop DLF and PLF techniques separately, with minimal interac-
tion or information sharing between point forecasts and probabilistic 
outputs. Probabilistic forecasts often capture valuable information 
about uncertainty, skewness, and tail risk, but existing DLF models 
rarely utilize these distributional insights to improve point prediction 
accuracy or robustness, especially in non-stationary contexts.
• Insufficient Online Shift Detection: Most current ensemble and
forecasting frameworks lack robust, fine-grained online mechanisms 
to detect distribution shifts when and where they occur. This lim-
its the models’ ability to promptly adapt forecasting strategies in 
response to changing system dynamics.
• Lack of Joint Online Adaptation: Ensemble approaches typically
operate offline or involve batch updates, lacking principled on-
line mechanisms to detect, synchronize, and respond to distribution 
shifts across multiple predictors in real time. Adaptive schemes for 
combining probabilistic outputs during ongoing shift events remain 
underexplored.
We compare existing online load forecasting approaches under distri-
bution shifts in Table 1. To the best of our knowledge, there is currently 
no systematic study on how to effectively combine deterministic and 
probabilistic forecasting methods to address distribution shifts in load 
forecasting. This paper aims to bridge this gap by leveraging proba-
bilistic outputs to enhance deterministic forecasting accuracy in such 
settings. The main contributions of this work are threefold:
1. We propose a novel quantile ensemble strategy that bridges proba-
bilistic forecasting and deterministic prediction by leveraging the 
rich information encoded in multiple quantiles. This strategy dy-
namically combines quantile forecasts with adaptive long-term 
and short-term weights, enabling more accurate and robust online 
predictions.
2. We propose a detect-then-adapt strategy featuring a quantile-level
shift indicator to identify distribution changes. Based on this indica-
tor, we introduce an adaptive fast-and-slow learning strategy that 
dynamically adjusts online learning rate for balancing rapid adap-
tation to abrupt shifts and stable learning during gradual changes, 
enabling effective responses to non-stationary and evolving data 
distributions.
3. We conduct extensive experiments across diverse distribution
shift scenarios, demonstrating the proposed method’s superior 
adaptability and forecasting accuracy compared to conventional 
approaches. Moreover, in-depth discussions reveal how quantile-
specific adjustments, adaptive learning strategies, and choice of 
quantile combination contribute to its practical effectiveness, 
offering actionable guidance for real-world applications.
The rest of the paper is structured as follows. Section 2 analyzes the 
main problem to be solved in this paper. Section 3 elaborates on the
Applied Energy 401 (2025) 126812 

D. Qin, X. Wu, D. Sun et al.
Table 1 
Comparison of online load forecasting approaches under distribution shift.
Reference
Forecast paradigm
Uncertainty modeling
Shift detection & adaptation
Shift handling
[24] 
Deterministic
✘
✓
Online learning
[25] 
Deterministic
✘
✘
Online learning
[26] 
Deterministic
✓
✘
Reinforcement learning
[27] 
Deterministic
✘
✓(Threshold-based)
Online learning & Ensemble learning
[28] 
Probabilistic
✓
✘
Adaptive HMM
[29] 
Probabilistic
✓
✓(Threshold-based)
Feature Decoupling
[30] 
Probabilistic
✓
✘
Temporal Correlation
[31] 
Probabilistic
✓
✘
Kalman Filtering
Our Method 
Probabilistic → Deterministic
✓
✓(Fine-grained)
Online learning & Ensemble learning
methodologies. Section 4 reports experimental results and relevant anal-
yses to demonstrate the effectiveness of our method. Section 5 draws the 
conclusions and provides directions for future work.
2. Problem statement 
2.1. DLF and PLF objectives
𝑇
Let D = {(𝐱𝑡
 , 𝑦 𝑡)}
be
𝑡=1
 the historical dataset, where 𝐱𝑡
 
 
 
 ∈R 𝑑
 
denotes
the feature vector and 𝑦𝑡
 ∈ R the target load at time 𝑡. The goal of DLF is
to learn a mapping 𝑓∶ R 𝑑→ R outputting a point prediction 𝑦̂ 𝑡= 𝑓(𝐱𝑡
 
 ),
by minimizing
min
𝑓∈F E (𝐱,𝑦)∼P [𝓁(𝑦, 𝑓 (𝐱))] , 
(1)
where 𝓁(⋅, ⋅) (e.g., mean squared error) is the loss function, and P is the 
(unknown) data distribution.
In PLF, the goal is to predict the conditional quantiles of 𝑦𝑡
 
 given
𝐱𝑡
 
 . For quantile level 𝜏 ∈ (0, 1), PLF learns 
 
 
𝑓 𝜏∶ R 𝑑→R such that
( )
𝑦̂ 𝜏=
𝑡
 𝑓
approximates the true
-th conditional quantile of
:
𝜏
 
 
 
 (𝐱𝑡
 ) 
 𝜏
 
 
 
 𝑦𝑡
 
min 
𝑓 𝜏∈F 𝜏
E (𝐱,𝑦)∼P 
[ 𝜌 𝜏 
( 𝑦 − 𝑓 𝜏(𝐱) )] , 
(2)
where 𝜌 𝜏(𝑢) = 𝑢(𝜏 − I{𝑢 < 0}) is the pinball loss. 
2.2. Online learning under distribution shift
In practice, the load data-generating distribution is rarely stationary. 
Over time, the actual distribution P 
 
 that governs
often drifts away
𝑡
 (𝐱𝑡
 
 , 𝑦 𝑡 ) 
 
 
from the historical training distribution Ptrain
 
 , i.e.,
(𝐱 𝑡, 𝑦 𝑡 ) ∼ P 𝑡 , 
P 𝑡 ≠ P train, 
(3)
due to factors such as renewable integration, behavioral changes, or 
external events. As a result, models trained solely on past data may 
gradually become suboptimal or even useless.
To address this challenge, online learning provides a framework 
where the forecaster continually updates its model using the sequen-
tial data stream. This enables the model to gradually adapt to changes 
in the data distribution and maintain competitive performance under 
distribution shifts.
Online learning protocol. At each time 𝑡, the process is summarized 
as follows:
1. The forecaster observes the feature vector 𝐱 and
𝑡
 makes predic
tions—either a point forecast 𝑦̂ 𝑡 (DLF) or a set of quantile forecasts 
{𝑞̂𝜏
 } 
(PLF).
,𝑡𝜏∈T 
-
2. The true value 𝑦𝑡
 is revealed, and the forecaster incurs loss 𝓁(𝑦 𝑡 , 𝑦̂ 𝑡 )
or {𝜌 𝜏 (𝑦𝑡
 
 − 𝑞̂𝜏
 
 )} 
.
,𝑡
𝜏∈T 
3. The model parameters are optionally updated using the new data
point (𝐱 𝑡, 𝑦 𝑡 ).
For DLF, online algorithms (e.g., online gradient descent) iteratively 
minimize the cumulative deterministic loss:
min
𝑓 1,…,𝑓 𝑇
𝑇∑ 
𝑡=1
𝓁(𝑦 𝑡, 𝑓 𝑡 (𝐱 𝑡)), 
(4)
which essentially allows the model to track changes in the conditional 
mean E P [
𝑡𝑦|𝐱𝑡
 
 ].
For PLF, the online protocol is applied separately for each quantile 
level:
min
𝑓 𝜏,1,…,𝑓 𝜏,𝑇
𝑇∑ 
𝑡=1
𝜌 𝜏 (𝑦 𝑡 − 𝑓 𝜏,𝑡(𝐱 𝑡 )), 
∀𝜏 ∈ T , 
(5)
enabling the tracking of the entire conditional quantile function
{ P
𝑞
 𝑡
𝜏
 (𝐱 𝑡)}𝜏
 
as
∈T
 the underlying distribution evolves. 
Sensitivity to Distribution Shifts. Online DLF can only adapt to 
changes in the expectation (first moment) of 𝑦|𝐱𝑡
 
 ,
𝑓DLF
𝑡
(𝐱 𝑡) ≈ E P 𝑡[𝑦|𝐱 𝑡]. 
(6)
However, changes in other distributional properties (variance, skewness, 
tails) may be entirely missed.
In contrast, online PLF produces a set of predictions from different 
quantile levels,
{
𝑓PLF
𝜏,𝑡(𝐱 𝑡) 
}
𝜏∈T ≈ 
{
𝑞P 𝑡 
𝜏
} 
𝜏∈T , 
(7)
which can dynamically respond to subtle or complex changes in the en-
tire conditional distribution, providing finer-grained information about 
distribution shifts, including changes in uncertainty, asymmetry, and tail 
behavior.
2.3. Main problem
Existing online DLF typically relies on direct point updating (on-
line learning), leaving the potential of quantile-informed adaptation 
unexploited. Despite the rich dynamic information embedded in online 
quantile forecasts, such outputs are rarely directly harnessed to improve 
point predictions under distribution shifts. Motivated by these findings, 
we aim to investigate the following problem:
Problem: How can we adaptively leverage the online quantile pre-
dictions—reflecting possibly subtle and complex distributional changes—to 
obtain robust DLF under distribution shift?
We propose to design an adaptive online ensemble E over the 
quantile predictions:
𝑓 ∗ (𝐱 𝑡) = E ({ ̂𝑞 𝜏,𝑡
} 
𝜏∈T , 𝐱 𝑡
) , 
(8)
where E dynamically responds to distributional shifts by exploiting the 
information across quantiles. The construction and analysis of such an 
adaptive ensemble are the central technical contributions of this work.
Theoretical basis: We provide a theoretical perspective on the va-
lidity of using an ensemble of quantile estimates to produce a point
Applied Energy 401 (2025) 126812 

D. Qin, X. Wu, D. Sun et al.
forecast. Suppose the conditional distribution of 𝑦|𝐱 is continuous with
a strictly increasing cumulative distribution function 𝐹 𝑦|𝐱 . The quantile 
function 𝑞 𝜏(𝐱) is then well-defined and continuous for 𝜏 ∈ (0, 1). By a
change of variables, 𝑦 = 𝑞𝜏
 
 (𝐱) where 𝜏 = 𝐹𝑦
 |𝐱 (𝑦), the conditional mean
can be written as
E[𝑦|𝐱] = ∫ 
+∞
−∞
𝑦𝑓 𝑦|𝐱(𝑦)𝑑𝑦 = ∫
0
𝑞 𝜏(𝐱)𝑑𝜏, 
(9)
where 𝑓𝑦
 |𝐱is the conditional density. This formula holds as long as 𝑦|𝐱
admits a continuous and strictly increasing CDF, and expresses the con-
ditional mean as the integral (i.e., average) of the conditional quantile
function over 𝜏 ∈ (0, 1) [36,37]. In practice, given a finite set of quantile
𝐾
levels {𝜏 }
, we can approximate this integral via a
𝑘𝑘=1
 
 weighted sum:
̂𝑦(𝐱) =
𝐾
∑
𝑘=1
̃ 𝑤𝑘𝑞𝜏𝑘(𝐱),
(10)
where 𝑤̃ 𝑘 are integration weights (e.g., uniform weights for evenly 
spaced quantiles).
If (i) the quantile levels are sufficiently dense over (0, 1), (ii) quan
tile regression models are well-calibrated (i.e., 𝑞𝜏
 (𝐱)
𝑘
 approximates the 
true 𝜏 𝑘 -th conditional quantile), and (iii) weights approximate the in
tegral over 𝜏, then 𝑦̂(𝐱) will consistently estimate E[𝑦|𝐱] as 𝐾 → ∞. 
In real-world scenarios, only a finite set of quantiles is available and 
quantile regressors may be imperfect, especially in the tails. Thus, the 
ensemble—particularly with dynamic, non-uniform weights—serves as 
a principled empirical estimator, robustly leveraging cross-quantile dis
tributional information to enhance point forecasts, particularly under 
distribution shift and uncertainty.
-
-
-
3. Proposed methodology
In this section, we propose our method, consisting of a novel adaptive 
quantile ensemble method and a detect-then-adapt strategy to guide the 
online learning process. The overall framework of the proposed method 
is shown in Fig. 1.
3.1. Quantile ensemble framework
In this subsection, we will introduce our quantile ensemble frame-
work, composed of a set of quantile prediction models to output load 
forecasts at various quantiles and an adaptive ensembling framework to 
integrate the quantile predictions into a final point prediction.
3.1.1. Quantile regression
We initialize our quantile ensemble by pretraining a set of quan
tile regression models, each targeting a specific quantile level. For a 
predefined set T = {𝜏 1, … , 𝜏 𝐾}, we use 
 
 
historical 
 
 
data to pretrain 𝐾 dis
tinct quantile models {𝑓𝜏
 
𝐾
0 }
according to the pinball loss objective
𝑘,
𝑘=1
function (
-
-
2):
𝑓 𝜏,0 = arg min 
𝑓 𝜏∈F 𝜏
|D|
∑
(𝐱)∈D
𝜌 𝜏
( 𝑦 − 𝑓 𝜏(𝐱)), 
(11)
,𝑦
where 𝑓 0 denotes the offline pretrained model for quantile level
𝜏,
 
 𝜏, 
which takes a feature vector 𝐱 as input to produce a prediction 𝑞̂𝜏
 
= 
𝑓 
. D is the offline training dataset.
𝜏,0(𝐱)
 
 
 
 
 
 
 
Specifically, the quantile regression model 𝑓𝜏
 
 consists of several
modules designed to effectively capture the temporal and contextual 
dependencies of the load forecasting problem, as illustrated in Fig. 2:
• Historical Load Module: This module processes the historical load
sequence [𝑥 𝑡−24−𝑚 , … , 𝑥 𝑡−24 ], where 𝑚 is the length of look-back win
dow. It can be implemented by any suitable neural network layers 
such as LSTM, MLP, or CNN. The module outputs an embedding 
vector summarizing recent load dynamics.
-
• Calendar Feature Module: This module encodes the calendar in
cal,w
cal,h
formation (e.g., the day of week 𝑥 
, the hour of
)
𝑡
 day 𝑥𝑡
 
corresponding to the target forecast time. Calendar variables are 
typically transformed via one-hot encoding to facilitate learning.
-
-
• 
temp
Temperature Feature: The temperature at the forecast time 𝑥 𝑡
is also included as a key input feature, providing crucial exogenous 
information for load prediction.
• Prediction Head: The outputs of the above modules are concate
nated and forwarded to a fully connected (FC) layer, which produces 
the final quantile estimate for level 𝜏.
Each 𝑓𝜏𝑘,0 is trained independently 
 
to specialize in estimating a 
particular conditional quantile of the target variable. This offline pre
training provides a diverse set of quantile predictors, each capturing one 
aspect of the conditional distribution of the load, laying the foundation 
for the subsequent adaptive ensembling and online learning stage.
-
3.1.2. Adaptive quantile ensembling
𝐾
Given 𝐾 quantile regression models {𝑓 
} 
corresponding to a
𝜏𝑘,𝑡𝑘=1
 
set of quantile levels T 
= {𝜏1
 , … , 𝜏 
 
𝐾
 
 
 
 
 }, the ensemble generates the
deterministic forecast 𝑦̂ at time 𝑡 as:
𝑡
 
̂𝑦 𝑡=
𝐾
∑
𝑘=1
̃ 𝑤𝑘,𝑡𝑓𝜏𝑘,𝑡 (𝐱 𝑡), 
(12)
Fig. 1. The overall framework of the proposed methods, including quantile regression, quantile ensemble, and detect-then-adapt strategy for online load forecasting.
Applied Energy 401 (2025) 126812 

D. Qin, X. Wu, D. Sun et al.
Fig. 2. Quantile regression model structure, including historical load module, calendar feature module, temperature feature input, and quantile prediction head.
where 𝑤̃ 𝑘,𝑡 is the adaptive weight assigned to the 𝑘-th quantile model.
The adaptive weight 𝑤̃ 𝑘,𝑡 is constructed to dynamically respond to 
distributional changes, combining two components:
• Long-term weight (𝑤 
): Captures historical contributions of quan
𝑘,𝑡
 
tile level 𝜏 
 
 , providing a stable baseline that
𝑘
 
 evolves through progres
sive updates. Such a weight can be continuously updated via online 
gradient descent [
-
-
38] or exponentiated gradient descent [39].
• Short-term weight (𝑏 𝑘,𝑡 ): Reflects immediate adjustments based on
recent data, capturing transient distributional changes at time 𝑡. The 
short-term weights 𝐛𝑡
 = {𝑏 
generated
𝑘,𝑡}𝐾
are
𝑘=1
 
 
 
 
using a lightweight 
decision network, parameterized by 𝜙. This network makes decisions 
based on current quantile predictions that are conditioned on long
term weights and ground-truth revealed from the last timestep:
-
𝐛 𝑡 = 𝑔 𝜙 
( 
[𝑤𝑘,𝑡̂𝑞𝜏𝑘,𝑡] 𝐾
𝑘=1, 𝑦 𝑡−1 
) 
, 
(13)
where 𝑔 𝜙 can be trained according to the RvS learning strategy [40] 
(Detailed procedure will be presented in the Section 3.3).
The final normalized weight is computed via the softmax transformation:
̃ 𝑤𝑘,𝑡= 
exp(𝑤 𝑘,𝑡 + 𝑏 𝑘,𝑡 )
∑𝐾
𝑗=1 exp(𝑤 𝑗,𝑡 + 𝑏 𝑗,𝑡) 
, 
𝑘 = 1, … , 𝐾. 
(14)
The proposed framework provides a systematic approach for convert
ing probabilistic quantile forecasts into robust deterministic predictions, 
which offers two key advantages that make it particularly effective for 
DLF under distribution shifts: (1) By combining stable long-term weights 
with dynamically adjusted short-term weights, the framework achieves a 
balance between historical trends and real-time responsiveness. (2) The 
ensemble aggregates diverse distribution insights from multiple quantile 
regression models, which capture richer distribution properties such as 
variance, skewness, and extreme tail behaviors, significantly improving 
the robustness of online DLF.
-
3.2. Detect-then-adapt strategy
In dynamic environments, the online learning rate 𝜂𝑡
 
 plays a critical 
role in balancing fast learning for rapid adaptation and slow learning 
to ensure stability and robustness [41,42]. The online update rule for 
model parameters is given by:
𝜃 𝑡+1 = 𝜃 𝑡− 𝜂 𝑡 ∇ 𝜃 L 𝑡, 
(15) 
where 𝜃 
 represents the model parameters at time 𝑡, L 
loss 
 is the 
function
𝑡
𝑡
(e.g., pinball loss). The choice of 𝜂𝑡
 
 fundamentally affects the model’s
adaptability and robustness:
• Fast Learning (large 𝜂 ):
𝑡
 When 𝜂is large, the gradient step
𝑡
 
 
 
 
 
 
 
 
𝜂𝑡
 
 ∇𝜃
 
 L𝑡 
induces significant parameter changes at each update. This accel
erates adaptation under abrupt shifts and minimizes short-term
-
prediction error:
‖𝜃 𝑡+1 − 𝜃 ∗ ‖ = ‖𝜃 𝑡 − 𝜃 ∗ ‖ − 𝜂 𝑡‖∇ 𝜃 L 𝑡 ‖, 
𝜂 𝑡 ≫ 0, 
(16)
∗
where 𝜃
 
 
denotes the optimal parameter set. However, large up
dates risk amplifying noise when the distribution is stable, which 
will degrade robustness by destabilizing the model and leading to 
suboptimal solutions.
-
• Slow Learning (small 𝜂𝑡
 ): When 𝜂 𝑡
 
 
 
 
 is small, parameter updates
are conservative, ensuring smooth convergence to 𝜃∗ 
 
 
 
 
 
 
 . This ap
proach alleviates overfitting risks, particularly under stationary or 
slow-changing distributions:
-
‖𝜃 𝑡+1 − 𝜃 ∗ ‖ ≈ ‖𝜃 𝑡 − 𝜃 ∗ ‖, 
𝜂 𝑡 → 0. 
(17)
However, the slow adjustment may result in delayed responses to 
abrupt distribution shifts, increasing short-term L 𝑡 (𝜃 𝑡 ) and reducing 
adaptability.
To account for this trade-off, we propose a novel Detect-then-Adapt 
Strategy that dynamically adjusts 𝜂 𝑡 based on real-time monitoring of
error dynamics. This strategy integrates shift detection and adaptive 
learning rate adjustment into a unified framework, achieving fine
grained responsiveness and robust generalization under varying data 
conditions.
-
Error Dynamics Monitoring. To dynamically detect distribution 
shifts, we monitor the real-time behavior of forecasting errors for each 
quantile regression model 𝑓 
. For quantile level
at time , the pinball
𝜏𝑘,𝑡
 
 
 
 𝜏 𝑘
 
 
 
𝑡
 
 
 
 
loss 𝜖𝑘,𝑡
 
serves as a measure of forecasting performance:
𝜖 𝑘,𝑡= 𝜌 𝜏(𝑦 𝑡− ̂𝑞𝜏𝑘,𝑡 ), 
(18)
𝑇
The sequence 𝝐 
= {𝜖 
}
represents the forecast
𝑘
𝑘,𝑡𝑡=1
 
ing error trajec
tory over time for quantile level 𝜏 
 , where the mean 𝜇 
 and standard
𝑘
𝜖𝑘
 
 
 
deviation 𝜎𝜖
 
can be computed as:
𝑘 
-
𝜇 𝜖 𝑘= 1
𝑇
𝑇∑ 
𝑡=1
𝜖 𝑘,𝑡, 
𝜎 𝜖 𝑘=
√
√
√
√1
𝑇
𝑇∑ 
𝑡=1
(𝜖 𝑘,𝑡 − 𝜇 𝜖𝑘 ) 2, 
(19)
where 𝑇 denotes the length of the error sequence. The mean 𝜇𝜖
 
 
 reflects
𝑘 
the average forecasting error, while 𝜎 𝜖 captures its variability.
𝑘 
To highlight recent observations while preserving historical trends, 
we apply an exponentially weighted moving average (EWMA) smooth
ing:
-
𝑍 𝑘,0 = 𝜇 𝜖𝑘 ,
𝑍 𝑘,𝑡= (1 − 𝜆)𝑍 𝑘,𝑡−1 + 𝜆𝜖 𝑘,𝑡 ,
𝑡> 0,
(20)
where 𝜆 ∈ (0, 1) controls the trade-off between recent errors and his
torical observations, with higher 𝜆 emphasizing recent observations. It
-
Applied Energy 401 (2025) 126812 

D. Qin, X. Wu, D. Sun et al.
is important to note that this EWMA-based error monitoring is strictly 
causal and utilizes current and past observations—no future or un-
seen data are involved at any time. This ensures full compatibility with 
real-time, online learning and avoids any information leakage. 
𝑇
The sequence 𝒁 𝑘 = {𝑍 𝑘,𝑡}
inherits statistical properties from the
𝑡=1
 
 
 
 
original error sequence 𝝐 𝑘 . Its mean 𝜇 𝑍 
and
𝑘,𝑡
 variance 
 
𝜎
can
𝑍𝑘,𝑡
 be
derived as [43,44]:
𝜇 𝑍 𝑘,𝑡= 𝜇 𝜖𝑘, 
𝜎𝑍𝑘,𝑡= 
√
𝜆
2 −𝜆 
( 1 − (1 − 𝜆) 2𝑡) 𝜎 𝜖 𝑘. 
(21)
The sequence 𝒁 
 
 effectively represents a smoothed measure of online
𝑘
 
forecasting errors, mitigating noise while capturing real-time dynamics.
Fast-and-Slow Adaptation. To dynamically tune the learning rate 
for each quantile model, we define a Shift Indicator 𝛾𝑘,𝑡
 
 that quantifies 
deviations in error dynamics from its baseline distribution:
𝛾 𝑘,𝑡= 
𝑍 𝑘,𝑡− 𝜇 𝜖 𝑘
𝜎 𝑍𝑘,𝑡
. 
(22)
Based on 𝛾𝑘,𝑡
 
 , the learning rate 𝜂𝑘,𝑡
 
 
 
 
 
 
 of model 𝑘is adjusted according
to the following function:
𝜂 𝑘,𝑡 = 𝜂 min + (𝜂 max − 𝜂 min) ⋅
1 + 𝑒 −𝑝𝛾𝑘,𝑡, 
(23)
where 𝜂min
 
and 𝜂max
 
denote predefined bounds, and 𝑝 is a hyperparam
eter controlling the sensitivity to 𝛾𝑘,𝑡
 
 . 
-
The proposed shift indicator enables flexible responses to varying
conditions. During sudden distribution shifts, when 𝝐 𝑘 increases sharply,
𝛾 
becomes a large positive value, pushing 𝜂 
 toward 𝜂max
 
 and facil
𝑘,𝑡
𝑘,𝑡
 
itating rapid adaptation. Conversely, when errors stabilize or decrease 
over time, 𝛾 
enters the negative range, reducing
toward
to pre
𝑘,𝑡
 
 
 
 
 
 
𝜂𝑘,𝑡
 
 𝜂min
 
 
 
 
serve stability and mitigate overfitting. This smooth adjustment enables 
a continuous transition between fast and slow learning states, ensuring 
that the model adapts appropriately to the evolving environment.
-
-
3.3. Full algorithm
In Algorithm 1, we formalize the step-by-step implementation of the
proposed framework, including offline initialization and online adaptive 
prediction and model updating. First, the offline pretraining phase con-
structs a diverse set of quantile predictors for different levels, serving as 
foundations for the following online learning process. Subsequently, the 
online prediction-adaptation phase operates sequentially on streaming 
data. At each timestep, the ensemble generates deterministic point fore-
casts based on multiple quantile predictions. Simultaneously, it updates 
ensemble weights by considering both long-term and short-term effects, 
while continuously adjusting quantile regression models with adaptive 
learning rates. This dual-phase mechanism ensures that the framework 
remains both adaptable and resilient in dynamic environments. 
Remarks: Our method differs from existing approaches in two key 
aspects:
• Adaptive Quantile Ensemble: We introduce a dual-component
weight update mechanism, combining long-term historical contribu-
tions with short-term, context-aware adjustments for each quantile. 
The ensemble weights are adaptively tuned online using both stream-
ing error signals and a decision network, enabling rapid responsive-
ness to different types of distribution shifts. This allows the method 
to selectively aggregate the most informative quantile predictions 
for robust point forecasting, instead of static averaging which may 
be suboptimal in dynamic environments.
• Detect-then-Adapt Strategy: Rather than using fixed or manually
switched learning rates, we design a continuous, quantile-specific 
adaptive learning rate schedule. This schedule is driven by real-time 
error monitoring (using EWMA-based shift indicators), enabling the 
system to detect shifts at the quantile level and to automatically
Algorithm 1: Adaptive quantile ensemble algorithm.
Input: Historical dataset D, quantile levels T = {𝜏 1, … , 𝜏 𝐾}, 
default learning rate 𝜂, learning rate bounds 𝜂min
 
 , 𝜂 max , 
smoothing parameter 𝜆, sensitivity parameter 𝑝. 
 
𝑇
Output: Point forecasts {𝑦̂ 𝑡 }𝑡=1
1 Offline Pretraining Phase: 
2 for each quantile level 𝜏 𝑘∈ T in parallel do
Pretrain quantile regression
1 ∑
models:𝑓
 
𝜏,0 = ar
|
 
 
g min𝑓
∈F𝜏
 
 
D|
( ,𝑦)∈D
𝑘
𝜏
𝐱
𝜌𝜏(𝑦 −
(
𝑘
𝑘
𝑘
 𝑓𝜏𝐱));
𝑘
𝐾
Pretrain ensemble weights 𝐰 0 = {𝑤 }
and decision network
𝑘𝑘=1
 
parameters 𝜙 0 :
∑
∑
𝐾
𝐰
0
 
 , 𝜙 0 = arg 
 
min
(𝑦−
𝑤̃ 𝑓
0(𝐱)) ,
𝐰
 
 
 𝑘
𝜏,
 
,𝜙|D|
 
 
𝑘
(𝐱,𝑦)∈D
𝑘=1
(
)
exp(𝑤𝑘
 + 𝑏 
 
𝑘 )
 
 
s.t. 
𝑤̃ 𝑘= ∑
, 
{𝑏 
𝐾
𝑘 } =1 = 𝑔
[𝑤𝑞̂ ]𝐾, 𝑦.
𝐾
=1 exp(
+
)
𝑘
 
 𝜙
𝑘𝜏𝑘
 =1
𝑤𝑗
 
 𝑗
 
𝑘
 
𝑗
 𝑏
 
5 Online Prediction-Adaptation Phase: 
6 for each timestep 𝑡 = 1, 2, … do
Prediction: 
Observe feature vector 𝐱 and
𝑡
 
 
 
compute quantile 
forecasts:𝑞̂𝜏
 𝑘,𝑡= 𝑓𝜏𝑘,𝑡(𝐱 𝑡
 
 
 
 
 ), ∀𝑘= 1, … , 𝐾;
Compute point forecast via
∑
𝑦̂ 𝑡=
𝐾
𝑘=1 𝑤̃ 𝑘,𝑡𝑞̂𝜏𝑘,𝑡 .
 adaptive ensemble: 
Ensemble Weight Update: 
Observe true load 𝑦, calculate loss
𝑡
 
 
 
 as the mean squared
error: 
(
)
L𝑡
 = 2 𝑦𝑡− 𝑦̂ 𝑡 
;
Update short-term weights and
( 
) 
𝑏 𝑡+1,𝑘 = 𝑔
}𝐾
𝜙
 
{
𝑡
𝑤𝑘,𝑡𝑞̂𝜏𝑘,𝑡 𝑘=1, 𝑦 𝑡
 
 
 
 
 
 
 
 
 
 
,
𝜙
←
+1 
𝜙
L
𝑡
𝑡−𝜂∇𝜙
𝑡 ;
 decision network 𝑔𝜙
 : 
 
′
Update long-term weights using auxiliary prediction 𝑦̂ :𝑡
∑
𝐾
L
′
𝜕
′
 
𝑦̂ =
𝑤 𝑘,𝑡𝑞̂
𝑡
𝑡
 
𝜏𝑘,𝑡, 
𝑤 
 
 
 
𝑡+1,𝑘
 
 ←𝑤𝑘,𝑡−𝜂
,
𝑘=1
𝜕𝑤 𝑘,𝑡
𝜕L′
(
 𝑡
)
= −
′
 
𝑦−
𝜕𝑤
𝑡
 𝑦̂
⋅
𝑡
 𝑞̂𝜏𝑘,𝑡 ;
 𝑘,𝑡
Detect-then-Adapt: 
Compute pinball loss 𝜖 𝑘,𝑡
 
 
 
 
 
 
 = 𝜌𝜏(
𝑘𝑦𝑡−𝑞̂𝜏𝑘,𝑡 ) for each quantile
level;
Calculate smoothed online error sequence: 
𝑍 𝑘,0 = 𝜇𝜖
 𝑘, 
 
 
𝑍 
 
 
 
 
𝑘,𝑡= (1 −𝜆)𝑍 𝑘,𝑡−1 + 𝜆𝜖𝑘,𝑡
 
 ;
Compute shift indicator and adapt online learning rate:
𝑍
 
𝛾 
=
𝑘,𝑡
 
−𝜇𝜖
 𝑘
𝑘,𝑡
 
, 
𝜂
𝜎
 𝑘,𝑡 = 𝜂min
 
 
 + (𝜂 max − 𝜂 min ) ⋅
−𝑝𝛾
;
𝑘,𝑡
𝑍
1 +
𝑘,𝑡
 
 𝑒 
Update model parameters for each quantile regression
model: 
𝜃 
←
𝜏𝑘,𝑡+1
 
 
 
𝜃
L
𝜏
 
−
𝑘,𝑡
 
 
 
 
 
 
 
 
 
 
 
 
𝜂𝑘,𝑡 ∇𝜃
𝜏 𝑘
L
,𝑡 ,
𝜏𝑘
 ,𝑡= 𝜌𝜏(
𝑘𝑦𝑡−𝑓𝜏
));
𝑘,𝑡 (𝐱𝑡
balance fast and slow adaptation. As a result, our approach main
tains stability during stationary periods and achieves rapid adapta
tion during sudden shifts, outperforming conventional fixed-rate or 
coarse thresholding strategies. 
-
-
4. Case studies 
In this section, we use the post-COVID load forecasting competi-
tion data [45] to evaluate the effectiveness of the proposed method. 
Detailed experiment setups, experimental results, and related analysis 
and discussion will be provided.
Applied Energy 401 (2025) 126812 

D. Qin, X. Wu, D. Sun et al.
Fig. 3. Visualization of temperature and corresponding testing load data. Two significant distribution shifts in load data can be obversed due to the influence of cold 
wave and COVID-19.
4.1. Experimental setups 
4.1.1. Data description
The dataset provided by the competition [45] consists of hourly load 
demand observations along with comprehensive weather data, ranging 
from March 2017 to November 2020. To evaluate the long-term perfor-
mance of online load forecasting, we adopt a train-test split with 30 % 
of the data allocated for offline training and the remaining 70 % for 
online testing. This choice emphasizes the need for robust performance 
over extended online evaluation periods. Fig. 3 illustrates the tempera-
ture alongside the corresponding load demand during the testing period. 
Two pronounced distribution shifts in load demand are evident: a cold 
wave occurring between late 2018 and early 2019, and the disrup-
tions caused by the COVID-19 pandemic starting in early 2020. These 
events significantly change the load patterns, highlighting the inherent 
non-stationarity challenges in online load forecasting problems.
We focus on the day-ahead load forecasting setting, aiming to predict 
load value 𝑥 at
𝑡
 timestep 𝑡 based on historical load [𝑥 
 
 
𝑡−95 , … , 𝑥𝑡−24 ], cal
endar information 𝑥cal
 
𝑡
𝑥temp
 
 
 
, and temperature information 
𝑡
 
. According
to the proposed 
-
Algorithm 1, all the models will be offline pretrained 
on the training set for 50 epochs. During the online phase, the model 
predicts each hourly load sequentially. At the end of each day, once the 
ground truth for all 24 hours is revealed, the daily loss is computed to 
update the model.
4.1.2. Model settings
We 
instantiate 
the 
quantile 
regression 
model 
described 
in 
Section 3.1.1 with CNN, MLP, and LSTM as the backbone to showcase the 
general applicability of the proposed method. Specifically, each model 
will be constructed for each quantile level in T = {0.3, 0.4, 0.5, 0.6, 0.7} 
(further discussion on the choice of quantile combination is provided 
in Section 4.4). These models will be offline pretrained with a learning 
rate of 0.1 and online updated with the proposed adaptive learning rate 
strategy.
For the proposed adaptive quantile ensembling framework described 
in Section 3.1.2, we instantiate the decision network 𝜙 as a three-layer 
MLP model with a dropout rate of 0.1. The decision network and long
term weight 𝑤 in the ensemble model are trained using the Adam 
optimizer with a learning rate of 0.001 for the offline phase and 0.0001 
for the online phase.
-
4.1.3. Evaluation metrics
For evaluation, we calculate the commonly used mean absolute er-
ror (MAE) and mean squared error (MSE) based on the normalized 
ground truth and predictions. The online forecasting performance over 
the whole testing period as well as performance during the cold wave 
period and COVID-19 period are evaluated accordingly.
4.2. Main results
This section presents a detailed comparison of the proposed method 
against two baseline approaches- (1) Vanilla online forecasting and (2) 
Quantile ensemble with uniform averaging. Vanilla online load forecasting 
serves as a traditional deterministic forecasting benchmark, where the 
model is pretrained offline and updated online via gradient descent ac-
cording to the MSE loss function with a fixed learning rate. While this 
approach provides a straightforward mechanism for adapting to chang-
ing data distributions, it lacks the ability to incorporate any probabilistic 
insights. On the other hand, quantile average ensemble serves as an in-
termediate baseline between vanilla online approach and the proposed 
adaptive ensemble approach. It aggregates predictions from multiple 
quantile regression models by uniformly averaging without accounting 
for dynamic distribution changes.
Fig. 4 compares the performance achieved by the proposed adap-
tive quantile ensemble approach against baselines across CNN, LSTM, 
and MLP architectures under various conditions, including overall per-
formance, the cold wave period, and the COVID-19 period. It can be 
observed that quantile averaging approach already achieves notable im-
provements over vanilla online approach in terms of both MAE and 
MSE, validating the hypothesis that leveraging probabilistic forecast-
ing enhances deterministic prediction accuracy. Building on this, the 
proposed adaptive quantile ensemble achieves consistently better per-
formance than both baselines, further demonstrating the effectiveness 
of selectively leveraging probabilistic forecasts and dynamically adjust-
ing weights to account for distribution shifts. For example, the adaptive 
ensemble reduces MAE by 17.6 % for CNN, 22.7 % for LSTM, and 
21.5 % for MLP compared to vanilla online; and 4.6 % average MAE 
reduction compared to quantile averaging in the overall evaluation. 
The advantages of the proposed method are particularly pronounced 
during different types of distribution shifts. During the cold wave pe-
riod, characterized by gradual changes in load patterns, the adaptive 
ensemble achieves robust improvements by effectively capturing and 
adapting to these slow-evolving changes. In comparison, the COVID-
19 period presents a more challenging environment with abrupt and 
irregular distribution shifts that severely disrupt load dynamics. Even 
under these highly non-stationary conditions, the proposed approach 
exhibits remarkable adaptability, reducing average MAE by 22.3 % and 
32.8 % compared to vanilla online during cold wave and COVID period, 
respectively. The framework’s dynamic weighting mechanism—com-
bining long-term stability with short-term responsiveness—allows it to 
respond appropriately to varying types of distribution shifts, ensuring 
consistently superior performance across all scenarios and backbone 
architectures.
Fig. 5 illustrates online load forecasting during the particularly 
challenging COVID-19 period. The top subfigure shows the ground
Applied Energy 401 (2025) 126812 

D. Qin, X. Wu, D. Sun et al.
Fig. 4. Performance comparison of vanilla online forecasting, quantile average ensemble, and the proposed adaptive quantile ensemble under different conditions with 
CNN, LSTM, and MLP architectures. (a) MAE results of overall performance, cold wave period, and COVID-19 period. (b) MSE results of corresponding conditions.
Fig. 5. Visualization of prediction performance during the COVID-19 period. (Top) Actual load values versus predictions from the vanilla online approach and 
the proposed adaptive quantile ensemble method. (Bottom) Cumulative average MAE comparison between the vanilla online approach and the proposed method 
throughout the COVID-19 period, illustrating performance dynamics under abrupt distribution shifts.
truth (black curve) and predictions from the vanilla online approach 
(red curve) and the proposed method (green curve). It is evident that 
the vanilla approach struggles to adapt to rapid changes in load pat-
terns, resulting in persistent deviations from the true values. In contrast, 
the proposed method closely tracks the true values, showcasing its 
robustness and superior tracking ability during highly non-stationary 
conditions. The bottom subfigure presents a cumulative average MAE 
comparison, highlighting the dynamic characteristics of the two ap-
proaches. The cumulative error curve for the vanilla online approach 
remains consistently high, reflecting its inability to adapt to abrupt 
distribution shifts. In contrast, the proposed method maintains a rela-
tively lower cumulative average MAE curve with smoother fluctuations, 
demonstrating its superior robustness in the face of sudden and irregular 
load pattern changes.
As an example, Fig. 6 illustrates the proposed ensemble approach 
based on quantile regression, showcasing how probabilistic predictions 
are leveraged for deterministic load forecasting. The shaded black re-
gion represents the prediction interval derived from quantile regression, 
which models the inherent uncertainties in load forecasting and provides 
richer distributional information to enhance deterministic forecasting 
during a critical period shortly after the outbreak of COVID-19.
In practice, when training multiple quantile regressors indepen-
dently, quantile crossing often occurs—i.e., the predicted quantile es-
timates are not strictly ordered, violating the monotonicity requirement 
of quantile functions. To address this issue, we employ a simple yet 
effective post-processing ranking step: the predicted quantile values are 
sorted in ascending order for each time step prior to ensembling. Fig. 7 
presents a comparative analysis of prediction accuracy between our
Applied Energy 401 (2025) 126812 

D. Qin, X. Wu, D. Sun et al.
Fig. 6. Illustration of the proposed method leveraging quantile regression outputs to enhance deterministic load forecasting during a critical period shortly after the 
outbreak of COVID-19.
Fig. 7. Comparison of forecasting performance (MAE and MSE) between the original proposed method and the non-crossing variant, which applies a post-processing 
quantile ranking step to enforce monotonicity.
original method and the non-crossing variant with the ranking opera-
tion applied (taking LSTM as an example). The results show that the 
non-crossing strategy consistently reduces both MAE and MSE across 
distribution shift scenarios. Importantly, this approach incurs negligi-
ble computational cost and does not require changes to the training 
procedure, making it highly practical for real-world deployment.
These findings highlight the practical utility and robustness of the 
proposed method, demonstrating its ability to seamlessly integrate 
probabilistic insights into deterministic forecasting in dynamic and 
non-stationary environments.
4.3. Effectiveness of fast-and-slow strategy
As analyzed in Section 3.2, balancing fast and slow learning plays 
a crucial role in addressing distribution shifts in online load forecast-
ing. To validate this principle, we compare several online learning rate 
adjustment settings:
1. Fixed Learning: Implements a predetermined, static learning
rate throughout the online forecasting process, with three vari-
ants—slow (lr=0.05), moderate (lr=0.07), and fast (lr=0.09). 
Each variant represents a distinct compromise between stability 
and responsiveness.
2. Fast-Slow-Switch: Discretely switches between fast (lr=0.09)
and slow (lr=0.05) learning based on error monitoring threshold. 
Specifically, fast learning will be activated when:
𝑍 𝑘,𝑡> 𝜇 𝜖 𝑘 + 𝜔𝜎𝑍𝑘,𝑡, 
(24)
where 𝑍, 𝜇, 𝜎 are defined in (20)–(21), and threshold 𝜔 = 1.
3. Proposed Adaptive Strategy: Dynamically adjusts learning rates
within the continuous range [0.05,0.09], guided by quantile-
specific shift indicators (21)–(23), where smoothing parameter 
𝜆 = 0.2 and sensitivity parameter 𝑝 = 1.
Fig. 8 presents the evaluation results in terms of MAE and MSE 
across overall performance, cold wave period, and COVID-19 period. 
It can be observed that the behavior of fixed learning rate strategies 
differs significantly under gradual and abrupt shifts. During the cold 
wave period, where load patterns change progressively, Slow Learning 
achieves better performance relative to Fast Learning due to its stability 
under slow-evolving dynamics. Conversely, during the COVID-19 pe-
riod, characterized by abrupt changes in load patterns, Slow Learning 
struggles to adapt promptly, resulting in higher error rates. In contrast, 
Fast Learning exhibits relatively better adaptability by leveraging rapid
updates. Between these extremes, Moderate Learning serves as a com-
promise, balancing slower adaptation for stability with faster updates for 
responsiveness. The Fast-Slow-Switch strategy enhances flexibility by dis-
cretely alternating between fast and slow learning, but it fails to achieve 
smooth transitions under dynamically evolving conditions. In compari-
son, the proposed adaptive strategy enables finer-granularity adjustment 
to account for both gradual and abrupt changes, which achieves the best 
overall performance.
Fig. 9 provides further insights into the evolution of quantile-specific 
pinball loss trajectories (top), corresponding adaptive learning rate ad-
justments (middle), and the dynamic ensemble weights assigned to each
quantile (bottom) during the COVID-19 period. The outbreak, occur-
ring around March 6–9, induces abrupt distribution shifts, resulting in
Applied Energy 401 (2025) 126812 

D. Qin, X. Wu, D. Sun et al.
Fig. 8. Performance comparison of fixed learning rates, Fast-Slow-Switch, and the proposed adaptive adjustment strategy in terms of MAE and MSE across overall, 
cold wave, and COVID-19 periods.
Fig. 9. Analysis during the COVID-19 period: pinball loss trajectories of each quantile (top), corresponding adaptive learning rate adjustments (middle), and adaptive 
ensembling weights for each quantile (bottom).
Applied Energy 401 (2025) 126812 

D. Qin, X. Wu, D. Sun et al.
Fig. 10. Performance comparison of different quantile combination strategies (Case 1–Case 4) across overall performance (left), cold wave period (middle), 
and COVID-19 period (right). Each case corresponds to a specific set of quantiles used in the ensemble model: Case 1 (T 
= {0.1, 0.3, 0.5, 0.7, 0.9}), Case 2 
(T = {0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8}), Case 3 (T = {0.3, 0.4, 0.5, 0.6, 0.7}), Case 4 (T = {0.3, 0.5, 0.7}). Each cell shows the mean absolute error, with the number of 
trainable parameters (in millions) given in parentheses below.
noticeable surges in pinball loss across all quantiles. Notably, the er-
ror magnitude increases vary among quantiles, reflecting the distinct 
impacts of the shifts on different portions of the load distribution. For 
instance, lower quantiles (𝜏 = 0.3) experience more pronounced error 
increases compared to higher quantiles (𝜏 = 0.7). This disparity stems 
from COVID-driven shutdowns, which caused a structural reduction in 
overall load levels, such that forecasts targeting lower quantiles tend to 
exhibit systematic upward biases. The middle subfigure demonstrates 
the adaptive learning rate adjustments employed under the proposed 
strategy. As the distribution shift occurs, the learning rates dynamically 
increase across all quantiles, enabling faster adaptation to the abrupt 
changes. Once the distribution stabilizes, the learning rates gradually de-
cline, transitioning to slower updates that mitigate overfitting risks and 
ensure robustness during stable conditions. This quantile-specific adap-
tive adjustment mechanism effectively balances responsiveness under 
abrupt shifts and robustness during stable periods. The bottom subfig-
ure depicts the evolution of the ensemble weights for each quantile. It 
is important to clarify that, in our framework, the quantile ensemble 
weights are not solely determined by instantaneous loss minimization. 
Instead, they are adaptively tuned to optimize the accuracy and robust-
ness of the point forecast (i.e., the conditional expectation) by selectively 
aggregating distributional information from multiple quantiles. After 
the COVID-19 shift, we observe that the ensemble weight assigned to 
𝜏 = 0.7 increases substantially while the weights for other quantiles 
remain lower, suggesting that 𝜏 = 0.7 provides more representative in-
formation for expectation estimation under the new regime. This reflects 
the ensemble’s ability to dynamically identify and leverage the most 
informative quantiles for reconstructing the expectation. In summary, 
the interplay between pinball loss, adaptive learning rate, and ensemble 
weights highlights the core strengths of the proposed framework: rapid 
detection and adaptation to distribution shifts at each quantile level, 
coupled with dynamic and principled aggregation of quantile outputs to 
ensure robust point forecasting under highly non-stationary conditions.
4.4. Choice of quantile combinations
The proposed method enables the incorporation of probabilistic in-
formation (quantiles) to improve the accuracy of deterministic forecasts. 
However, determining the optimal set and number of quantiles for en-
sembling remains an open question. To explore this issue, we compare 
four quantile combination strategies as follows:
1. Case 1: Considers five quantiles T = {0.1, 0.3, 0.5, 0.7, 0.9}, includ-
ing both central and tail parts of the distribution.
2. Case 
2: 
Expands 
to 
seven 
quantiles 
T 
=
{0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8}, 
providing 
richer 
granularity 
in 
the middle of the distribution.
3. Case 3: Focuses on a narrower range of five quantiles T 
=
{0.3, 0.4, 0.5, 0.6, 0.7}, emphasizing central distribution areas.
4. Case 4: Considers only three quantiles T = {0.3, 0.5, 0.7}, repre-
senting the core segments of the distribution.
Fig. 10 provides a detailed comparison of the four quantile com-
bination strategies, illustrating their predictive accuracy (MAE) and 
computational burden (number of parameters) under various conditions. 
We can obtain several key findings: (1) Case 2 and Case 3 consistently 
demonstrate superior performance compared to other cases. Notably, 
while Case 2 covers more quantiles and delivers robust accuracy, it 
comes at the cost of the highest computational complexity among the 
four setups. In contrast, Case 3 provides a favorable trade-off between 
accuracy and efficiency, achieving competitive results with moderate 
computational burden. (2) Comparing Case 1 and Case 3, which have 
identical computational complexity, reveals that the specific selection 
of quantile points is crucial for predictive performance. In Case 1, the 
inclusion of extreme (tail) quantiles such as 0.1 and 0.9 does not trans-
late to improved accuracy. This is because standard quantile regression 
techniques tend to underperform at the distribution tails, where data 
are often sparse and estimates are unstable [46,47]. Therefore, simply 
expanding the quantile range is less effective than strategically choosing 
well-calibrated quantile positions. (3) Case 4, which uses the smallest 
set of quantiles, has the lowest computational burden. However, this re-
duced complexity comes at the cost of clearly lower ensemble accuracy, 
since too few quantiles limit the capacity to represent the underlying 
uncertainty and distributional information.
In summary, these results reveal that there is a fundamental trade-off 
between computational efficiency and prediction accuracy, and that the 
choice of quantile locations is as important as the number of quantiles 
used. Case 3 provides an effective compromise with strong predictive 
performance and moderate computational burden, and is thus adopted 
as the default quantile combination in our experiments.
5. Conclusions
In this paper, we propose an innovative framework, Adaptive Online 
Quantile Ensembling, to address the challenge of load forecasting under 
distribution shifts by seamlessly integrating probabilistic load forecast-
ing and deterministic load forecasting. The framework dynamically 
leverages rich distribution information provided by multi-quantile pre-
dictions to enhance deterministic predictions. Key innovations include a 
quantile ensemble strategy that combines long-term stability with short-
term responsiveness, enabling adaptation to diverse distribution shifts; 
and a detect-then-adapt strategy that dynamically adjusts online learn-
ing based on real-time error monitoring for enhanced flexibility and 
robustness.
Extensive experiments demonstrate the superiority of our method 
across multiple scenarios, including overall performance and critical 
periods like cold waves and COVID-19. The proposed framework con-
sistently outperforms baselines, improving both MAE and MSE metrics. 
It exhibits strong adaptability to abrupt and gradual shifts by dynami-
cally leveraging probabilistic insights. In addition, analysis of quantile 
combinations reveals that focusing on central quantiles (e.g., T 
= 
{0.3, 0.4, 0.5, 0.6, 0.7}) achieves a balance between accuracy and com-
putational efficiency, outperforming strategies emphasizing extreme 
quantiles.
Applied Energy 401 (2025) 126812 

D. Qin, X. Wu, D. Sun et al.
Future work could focus on improving quantile regression model-
ing, particularly for better tail distribution modeling. Expanding the 
framework’s generalization and transferability—such as through domain 
adaptation or meta-learning—would be valuable for reliably applying 
the method to new datasets, regions, and usage patterns. In addition, a 
key direction is to develop principled methods for modeling and prop-
agating second-order uncertainty in quantile ensembles—for example, 
through Bayesian approaches, bootstrapped variance estimation, or 
post-hoc construction of predictive intervals—so that the framework 
can provide not only robust point forecasts but also reliable uncertainty 
bounds for risk-aware decision-making. Lastly, scaling the method to 
manage large-scale power systems will be critical for real-time applica-
tions. Overall, the proposed framework offers a robust, adaptive, and 
efficient solution to address the challenges of load forecasting under 
dynamic, non-stationary environments.
CRediT authorship contribution statement
Dalin Qin: Writing – review & editing, Writing – original draft, 
Visualization, Validation, Methodology, Investigation, Formal analy-
sis, Conceptualization. Xian Wu: Writing – original draft, Validation, 
Software, Methodology, Investigation. Dayan Sun: Project admin-
istration, Funding acquisition. Zhifeng Liang: Project administra-
tion, Funding acquisition. Ning Zhang: Writing – review & editing, 
Supervision, Project administration, Funding acquisition.
Declaration of competing interests
The authors declare that they have no known competing financial 
interests or personal relationships that could have appeared to influence 
the work reported in this paper.
Acknowledgement
This work was supported by the Science and Technology Project of 
State Grid Corporation of China under “Research on Key Technologies 
for Power System Source Load Forecasting and Regulation Capability 
Evaluation for Major Weather Processes”, 4000-202355381 A-2–3-XG.
Data availability
Data will be made available upon request. 
References
[1] Hong T, Pinson P, Wang Y, Weron R, Yang D, Zareipour H. Energy forecasting: a 
review and outlook. IEEE Open Access J Power Energy 2020;7:376–88.
[2] Alfares HK, Nazeeruddin M. Electric load forecasting: literature survey and classifi-
cation of methods. Int J Syst Sci 2002;33(1):23–34.
[3] Lee C-M, Ko C-N. Short-term load forecasting using lifting scheme and ARIMA 
models. Expert Syst Appl 2011;38(5):5902–11.
[4] Chen B-J, Chang M-W, et al. Load forecasting using support vector machines: a study 
on EUNITE competition 2001. IEEE Trans Power Syst 2004;19(4):1821–30.
[5] Dudek G. Short-term load forecasting using random forests. In: Intelligent sys-
tems’ 2014: proceedings of the 7th IEEE international conference intelligent systems 
IS’2014, September 24-26, 2014, Warsaw, Poland, volume 2: tools, architectures, 
systems, applications; Springer; 2015. p. 821–8.
[6] Park DC, El-Sharkawi MA, Marks RJ, Atlas LE, Damborg MJ. Electric load forecasting 
using an artificial neural network. IEEE Trans Power Syst 2002;6(2):442–9.
[7] Kong W, Dong ZY, Jia Y, Hill DJ, Xu Y, Zhang Y. Short-term residential load 
forecasting based on LSTM recurrent neural network. IEEE Trans Smart Grid 
2017;10(1):841–51.
[8] Amarasinghe K, Marino DL, Manic M. Deep neural networks for energy load fore-
casting. In: 2017 IEEE 26th international symposium on industrial electronics (ISIE); 
IEEE; 2017. p. 1483–8.
[9] Wang C, Wang Y, Ding Z, Zheng T, Hu J, Zhang K. A transformer-based method of 
multienergy load forecasting in integrated energy system. IEEE Trans Smart Grid 
2022;13(4):2703–14.
[10] Zhang X, Sun Y, Gao D-C, Zou W, Fu J, Ma X. Similarity-based grouping method for 
evaluation and optimization of dataset structure in machine-learning based short-
term building cooling load prediction without measurable occupancy information. 
Appl Energy 2022;327:120144.
[11] Fan C, Sun Y, Zhao Y, Song M, Wang J. Deep learning-based feature engineering 
methods for improved building energy prediction. Appl Energy 2019;240:35–45.
[12] Sun Y, Wang S, Xiao F. Development and validation of a simplified online cooling 
load prediction strategy for a super high-rise building in Hong Kong. Energy Convers 
Manag 2013;68:20–7.
[13] Fan C, Sun Y, Xiao F, Ma J, Lee D, Wang J, et al. Statistical investigations of transfer 
learning-based methodology for short-term building energy predictions. Appl Energy 
2020;262:114499.
[14] Fan C, Lei Y, Sun Y, Piscitelli MS, Chiosa R, Capozzoli A. Data-centric or algorithm-
centric: exploiting the performance of transfer learning for improving building 
energy predictions in data-scarce context. Energy 2022;240:122775.
[15] Hong T, Fan S. Probabilistic electric load forecasting: a tutorial review. Int J Forecast 
2016;32(3):914–38.
[16] Wang Y, Gan D, Sun M, Zhang N, Lu Z, Kang C. Probabilistic individual load 
forecasting using pinball loss guided LSTM. Appl Energy 2019;235:10–20.
[17] Afrasiabi M, Mohammadi M, Rastegar M, Stankovic L, Afrasiabi S, Khazaei M. Deep-
based conditional probability density function forecasting of residential loads. IEEE 
Trans Smart Grid 2020;11(4):3646–57.
[18] Yang Y, Li S, Li W, Qu M. Power load probability density forecasting using Gaussian 
process quantile regression. Appl Energy 2018;213:499–509.
[19] Wen H, Gu J, Ma J, Yuan L, Jin Z. Probabilistic load forecasting via neu-
ral basis expansion model based prediction intervals. IEEE Trans Smart Grid 
2021;12(4):3648–60.
[20] Liu B, Nowotarski J, Hong T, Weron R. Probabilistic load forecasting via quantile 
regression averaging on sister forecasts. IEEE Trans Smart Grid 2015;8(2):730–7.
[21] Zhang J, Wang Y, Sun M, Zhang N, Kang C. Constructing probabilistic load forecast 
from multiple point forecasts: a bootstrap based approach. In: 2018 IEEE Innovative 
smart Grid Technologies-Asia (ISGT Asia); IEEE; 2018. p. 184–9.
[22] Wang Y, Chen Q, Zhang N, Wang Y. Conditional residual modeling for probabilistic 
load forecasting. IEEE Trans Power Syst 2018;33(6):7327–30.
[23] Lu J, Liu A, Dong F, Gu F, Gama J, Zhang G. Learning under concept drift: a review. 
IEEE Trans Knowl Data Eng 2018;31(12):2346–63.
[24] Fekri MN, Patel H, Grolinger K, Sharma V. Deep learning for load forecasting 
with smart meter data: online adaptive recurrent neural network. Appl Energy 
2021;282:116177.
[25] Fujimoto Y, Fujita M, Hayashi Y. Deep reservoir architecture for short-term residen-
tial load forecasting: an online learning scheme for edge computing. Appl Energy 
2021;298:117176.
[26] Wang X, Wang H, Li S, Jin H. A reinforcement learning-based online learning strategy 
for real-time short-term load forecasting. Energy 2024;305:132344.
[27] Von Krannichfeldt L, Wang Y, Hug G. Online ensemble learning for load forecasting. 
IEEE Trans Power Syst 2020;36(1):545–8.
[28] Álvarez V, Mazuelas S, Lozano JA. Probabilistic load forecasting based on adaptive 
online learning. IEEE Trans Power Syst 2021;36(4):3668–80.
[29] Cao C, He Y, Yang X. Online decoupling feature framework for optimal probabilistic 
load forecasting in concept drift environments. Appl Energy 2025;392:125952.
[30] Lemos-Vinasco J, Bacher P, Møller JK. Probabilistic load forecasting considering 
temporal correlation: online models for the prediction of households’ electrical load. 
Appl Energy 2021;303:117594.
[31] de Vilmarest J, Browell J, Fasiolo M, Goude Y, Wintenberger O. Adaptive probabilis-
tic forecasting of electricity (net-) load. IEEE Trans Power Syst 2023;39(2):4154–63.
[32] Kuncheva LI. Classifier ensembles for changing environments. In: International 
workshop on multiple classifier systems; Springer; 2004. p. 1–15.
[33] Gama J, Žliobaitė I, Bifet A, Pechenizkiy M, Bouchachia A. A survey on concept drift 
adaptation. ACM Comput Surv 2014;46(4):1–37.
[34] Cao Z, Wan C, Zhang Z, Li F, Song Y. Hybrid ensemble deep learning for de-
terministic and probabilistic low-voltage load forecasting. IEEE Trans Power Syst 
2019;35(3):1881–97.
[35] Saffari A, Leistner C, Santner J, Godec M, Bischof H. On-line random forests. In: 2009 
IEEE 12th international conference on computer vision workshops, ICCV workshops; 
IEEE; 2009. p. 1393–400.
[36] Bassett Jr G, Koenker R. Asymptotic theory of least absolute error regression. J Am 
Stat Assoc 1978;73(363):618–22.
[37] Koenker R. Quantile regression. Vol. 38. Cambridge university press; 2005.
[38] Shalev-Shwartz S, et al. Online learning and online convex optimization. Found 
Trends Mach Learn 2012;4(2):107–94.
[39] Hill SI, Williamson RC. Convergence of exponentiated gradient algorithms. IEEE 
Trans Signal Process 2002;49(6):1208–15.
[40] Emmons S, Eysenbach B, Kostrikov I, Levine S. RVS: what is essential for offline rl 
via supervised learning?, arXiv preprint arXiv:2112.10751, 2021.
[41] Pham Q, Liu C, Hoi S. Dualnet: continual learning, fast and slow. Adv Neural Inf 
Process Syst 2021;34:16131–44.
[42] Lau Y-YA, Shao Z, Yeung D-Y. Fast and slow streams for online time series fore-
casting without information leakage. In: The thirteenth International Conference on 
Learning Representations; 2025.
[43] Ross GJ, Adams NM, Tasoulis DK, Hand DJ. Exponentially weighted moving average 
charts for detecting concept drift. Pattern Recognit Lett 2012;33(2):191–8.
[44] Roberts SW. Control chart tests based on geometric moving averages. Technometrics 
2000;42(1):97–101.
[45] Farrokhabadi M, Browell J, Wang Y, Makonin S, Su W, Zareipour H. Day-ahead elec-
tricity demand forecasting competition: post-COVID paradigm. IEEE Open Access J 
Power Energy 2022;9:185–91.
[46] Chernozhukov V, Fernández-Val I, Kaji T. Extremal quantile regression. Handb 
Quantile Regress 2017:333–62.
[47] Browell J, Fasiolo M. Probabilistic forecasting of regional net-load with conditional 
extremes and gridded NWP. IEEE Trans Smart Grid 2021;12(6):5011–9.
Applied Energy 401 (2025) 126812 