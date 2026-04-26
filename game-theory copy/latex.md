\documentclass[a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{amsmath,amssymb,mathtools}
\usepackage{multicol}
\usepackage[margin=0.22in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{microtype}
\usepackage{xcolor}
\usepackage{array}
\pagestyle{empty}

\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}
\setlength{\columnsep}{0.10in}
\setlength{\columnseprule}{0.15pt}
\setlength{\abovedisplayskip}{1pt}
\setlength{\belowdisplayskip}{1pt}
\setlength{\abovedisplayshortskip}{1pt}
\setlength{\belowdisplayshortskip}{1pt}
\setlist[itemize]{leftmargin=0.9em,label=\textbullet,itemsep=0pt,topsep=0pt,parsep=0pt,partopsep=0pt}
\setlist[enumerate]{leftmargin=1.1em,itemsep=0pt,topsep=0pt,parsep=0pt,partopsep=0pt}
\titleformat{\section}{\bfseries\scriptsize\color{black}}{}{0pt}{}
\titlespacing*{\section}{0pt}{0.45ex}{0.15ex}

\newcommand{\game}{\Gamma}
\newcommand{\BR}{\operatorname{BR}}
\newcommand{\supp}{\operatorname{supp}}
\newcommand{\co}{\operatorname{co}}
\newcommand{\E}{\mathbb{E}}
\newcommand{\Ind}{\mathbf{1}}
\newcommand{\mc}[1]{\mathcal{#1}}
\newcommand{\term}[1]{\textbf{#1:}}
\newcommand{\tight}{\vspace{-0.25ex}}
\newcommand{\formula}[1]{\[\displaystyle #1\]}

\begin{document}
\fontsize{5.0}{7.55}\selectfont
\begin{center}
{\bfseries\scriptsize Game Theory Cheat Sheet} \hfill {\scriptsize Anastasia Cattaneo, April 2026}
\end{center}
\vspace{-1.5ex}

\begin{multicols}{3}
\raggedright

\section*{LECTURE 1: BASICS}
\begin{itemize}
\item \term{PIMPS} players, information, moves, payoffs, strategies.
\item \term{Static game} one-shot, simultaneous-move game.
\item \term{Dynamic game} sequential game; timing and histories matter.
\item \term{Common knowledge} event $E$ is known by all, all know all know $E$, and so on indefinitely.
\item \term{Complete information} action sets, outcomes, outcome function, and all players' preferences/payoff functions are common knowledge.
\item \term{Perfect information} every information set is a singleton: at each decision node the player observes the full history.
\end{itemize}

\section*{LECTURE 2: EXTENSIVE/NORMAL FORM}
\begin{itemize}
\item \term{Extensive-form elements} game tree, root, decision/internal nodes, actions/edges, terminal nodes, terminal histories, payoffs.
\item \term{Information set} $I\in\mc I_i$ is a set of player $i$'s decision nodes that $i$ cannot distinguish. All nodes in $I$ have the same feasible action set $A(I)$.
\item \term{Pure strategy} complete contingent plan:
\formula{s_i:\mc I_i\to A_i,\qquad s_i(I)\in A(I)\quad\forall I\in\mc I_i.}
\item \term{Normal form} $\game=\langle N,(S_i)_{i\in N},(u_i)_{i\in N}\rangle$.
\item \term{Best response}
\formula{\BR_i(s_{-i})=\arg\max_{s_i\in S_i}u_i(s_i,s_{-i}).}
A rational player chooses only a best response when the opponent strategy is known.
\end{itemize}

\section*{LECTURES 3--4: DOMINANCE AND NASH}
\begin{itemize}
\item \term{Strict dominance} $s_i$ strictly dominates $s'_i$ if
\formula{u_i(s_i,s_{-i})>u_i(s'_i,s_{-i})\quad\forall s_{-i}\in S_{-i}.}
IESDS: iterated elimination of strictly dominated strategies. Strictly dominated strategies are never best responses.
\item \term{Weak dominance} replace $>$ by $\ge$ for all $s_{-i}$ and $>$ for at least one $s_{-i}$.
\item \term{Pure Nash equilibrium} $s^*$ is a NE iff
\formula{u_i(s_i^*,s_{-i}^*)\ge u_i(s_i,s_{-i}^*)\quad\forall i,\forall s_i\in S_i,}
equivalently $s_i^*\in\BR_i(s_{-i}^*)$ for every $i$. No unilateral profitable deviation.
\item \term{How to find NE} underline each player's best response to each opponent strategy. Cells where all players are best responding are NE.
\item \term{Pareto dominance} $x$ Pareto-dominates $y$ if $u_i(x)\ge u_i(y)$ for all $i$ and $>$ for some $j$.
\item \term{Pareto efficient} no feasible outcome Pareto-dominates it.
\item \term{Risk dominance} between two strict NE $s,t$, compute unilateral deviation losses. If
\formula{\prod_i\big[u_i(s)-u_i(t_i,s_{-i})\big]>
\prod_i\big[u_i(t)-u_i(s_i,t_{-i})\big],}
then $s$ risk-dominates $t$: deviating from $s$ is collectively more costly.
\end{itemize}

\section*{LECTURE 5: MIXED STRATEGIES}
\begin{itemize}
\item \term{Mixed strategy} for finite $S_i$, $\sigma_i\in\Delta(S_i)$ where
\formula{\sigma_i(s_i)\ge0,\qquad \sum_{s_i\in S_i}\sigma_i(s_i)=1.}
\item \term{Support} $\supp(\sigma_i)=\{s_i\in S_i:\sigma_i(s_i)>0\}$.
\item \term{Expected payoff}
\formula{u_i(\sigma)=\sum_{s\in S}\left(\prod_{j\in N}\sigma_j(s_j)\right)u_i(s).}
\item \term{Mixed-strategy NE} $\sigma^*$ is a NE iff every pure strategy used with positive probability is a best response to $\sigma_{-i}^*$:
\formula{s_i\in\supp(\sigma_i^*)\Rightarrow u_i(s_i,\sigma_{-i}^*)=\max_{s'_i\in S_i}u_i(s'_i,\sigma_{-i}^*).}
Unused pure strategies must yield weakly lower payoff.
\item \term{Indifference method} in a two-action mix, choose $p,q$ so each player is indifferent between all pure strategies in their support.
\item \term{Nash existence theorem} every finite normal-form game has at least one mixed-strategy Nash equilibrium.
\end{itemize}

\section*{LECTURE 6: BAYESIAN GAMES}
\begin{itemize}
\item \term{Bayesian game} $\langle N,(A_i),(T_i),p,(u_i)\rangle$. Nature draws type profile $t=(t_i,t_{-i})$; player $i$ observes $t_i$ and has belief $p(t_{-i}\mid t_i)$.
\item \term{Bayesian strategy} complete contingent plan by type: $s_i:T_i\to A_i$.
\item \term{Expected payoff conditional on type}
\formula{\begin{aligned}U_i(s\mid t_i)&=\sum_{t_{-i}}p(t_{-i}\mid t_i)\\[-0.4ex]&\quad u_i\big(s_i(t_i),s_{-i}(t_{-i}),t_i,t_{-i}\big).\end{aligned}}
\item \term{Bayesian Nash equilibrium}
\formula{\begin{aligned}s_i^*(t_i)&\in\arg\max_{a_i\in A_i}\sum_{t_{-i}}p(t_{-i}\mid t_i)\\[-0.4ex]&\quad u_i\big(a_i,s_{-i}^*(t_{-i}),t_i,t_{-i}\big),\quad\forall i,t_i.\end{aligned}}
\item \term{What to state in examples} players $N$, type sets $T_i$, beliefs such as $p(a\mid c)=p$, $p(b\mid c)=1-p$, action sets, and payoff matrices by type.
\item \term{Selten/Harsanyi agent-normal-form equivalent} replace each player-type pair $(i,t_i)$ by an agent. This converts incomplete information into a complete-information normal-form game over type-contingent strategies, with expected payoffs.
\item \term{Two-action mixing notation} if $\sigma_1=(p,1-p)$ and $\sigma_2=(q,1-q)$, solve $p$ from $u_2(\sigma_1,X)=u_2(\sigma_1,Y)$ and $q$ from $u_1(X,\sigma_2)=u_1(Y,\sigma_2)$, unless a pure best response applies.
\end{itemize}

\section*{LECTURES 7--8: MECHANISM DESIGN AND AUCTIONS}
\begin{itemize}
\item \term{Environment} agents $N=\{1,\dots,n\}$, type spaces $\Theta_i$, outcome set $X$, valuation/payoff $u_i(x,\theta_i)$.
\item \term{Social choice function}
\formula{f:\Theta_1\times\cdots\times\Theta_n\to X.}
It assigns an outcome to every reported type profile.
\item \term{Mechanism} $M=\langle S_1,
\dots,S_n,g\rangle$, where $g:S_1\times\cdots\times S_n\to X$.
\item \term{Direct mechanism} $M^d=\langle \Theta_1,\dots,\Theta_n,f\rangle$; each agent reports a type.
\item \term{Indirect mechanism} agents choose messages/actions $s_i\in S_i$; outcome is $g(s)$.
\item \term{Implementation} $M$ implements $f$ in equilibrium $e$ if $g(s^*(\theta))=f(\theta)$ for all $\theta$.
\item \term{Incentive compatibility} truth-telling is an equilibrium. Dominant-strategy IC:
\formula{\begin{aligned}u_i(f(\theta_i,\theta_{-i}),\theta_i)&\ge u_i(f(\hat\theta_i,\theta_{-i}),\theta_i)\\[-0.4ex]&\quad\forall i,\theta_i,\hat\theta_i,\theta_{-i}.\end{aligned}}
\item \term{Open auctions} bids are observed dynamically: English ascending auction, Dutch descending auction.
\item \term{Closed auctions} bids are private and simultaneous: first-price and second-price sealed-bid auctions.
\item \term{Second-price sealed-bid auction} highest bidder wins, pays second-highest bid. Utility:
\formula{\begin{gathered}b_{(2)}=\max_{j\ne i}b_j,\qquad
u_i=\begin{cases}v_i-b_{(2)},& b_i>b_{(2)},\\0,& b_i<b_{(2)}.\end{cases}\end{gathered}}
with tie rule specified separately. Bidding $b_i=v_i$ is weakly dominant.
\item \term{First-price sealed-bid auction} highest bidder wins and pays own bid: $u_i=v_i-b_i$ if $i$ wins, otherwise $0$. Bids $b_i>v_i$ are weakly dominated; bidding at or above value is never strictly profitable. In equilibrium with private values, profitable bids usually shade below value.
\end{itemize}

\section*{LECTURE 9: CORRELATION AND CONTRACTS}
\begin{itemize}
\item \term{Security/minimax value} guaranteed payoff from choosing a strategy against the worst opponent response:
\formula{v_i=\max_{s_i\in S_i}\min_{s_{-i}\in S_{-i}}u_i(s_i,s_{-i}).}
Mixed version: $v_i=\max_{\sigma_i}\min_{\sigma_{-i}}u_i(\sigma_i,\sigma_{-i})$.
\item \term{How to find} for each of your rows, take the minimum payoff the opponent can leave you with; choose the row with the largest of those minima.
\item \term{Correlated strategy} probability distribution $\tau\in\Delta(S)$ over pure strategy profiles $s=(s_1,\dots,s_n)$.
\item \term{Expected payoff under correlation}
\formula{u_i(\tau)=\sum_{s\in S}\tau(s)u_i(s).}
\item \term{Individual rationality for coalition $C$} $\tau_C$ is IR if $u_i(\tau_C)\ge v_i$ for every $i\in C$.
\item \term{Correlated equilibrium obedience constraints} if recommendation $s_i$ is received, following it must be optimal:
\formula{\begin{aligned}\sum_{s_{-i}}\tau(s_i,s_{-i})[u_i(s_i,s_{-i})&-u_i(s'_i,s_{-i})]\ge0\\[-0.4ex]&\forall i,s_i,s'_i.\end{aligned}}
\item \term{Contract} agreement before or during play. If signed and enforceable, players are assumed to respect it; it can implement correlated or cooperative outcomes and raise payoffs relative to non-cooperation.
\item \term{Prisoner's dilemma intuition} a contract/correlation device can recommend $(NC,C)$ or $(C,NC)$ probabilistically, improving expected payoffs if both accept and recommendations are binding or incentive-compatible.
\end{itemize}

\section*{LECTURE 10: BARGAINING}
\begin{itemize}
\item \term{Nash programme} transform strategic games into cooperative problems by enlarging feasible agreements, allowing correlation/contracts, and comparing payoffs to disagreement values.
\item \term{Feasible set} all payoff vectors attainable by pure, mixed, or correlated strategies:
\formula{F=\co\{u(s):s\in S\}\subseteq\mathbb R^n.}
It is a convex hull.
\item \term{Disagreement point} $d=(d_1,\dots,d_n)$, usually security values; minimum payoffs if bargaining fails.
\item \term{Individually rational feasible set} $F_d=\{u\in F:u_i\ge d_i\ \forall i\}$.
\item \term{Nash bargaining solution}
\formula{u^*\in\arg\max_{u\in F,\ u\ge d}\prod_{i=1}^n(u_i-d_i).}
For two players: $\max (u_1-d_1)(u_2-d_2)$. Multiplication penalises unequal gains and gives zero if any player gets only disagreement.
\item \term{Nash axioms} strong Pareto efficiency; symmetry; independence of irrelevant alternatives; affine/scale invariance.
\item \term{Egalitarian solution}
\formula{\arg\max_{u\in F,\ u\ge d}\min_i(u_i-d_i).}
Equivalently maximise $\lambda$ subject to $u_i-d_i\ge\lambda$ for all $i$.
\item \term{Utilitarian solution}
\formula{\arg\max_{u\in F,\ u\ge d}\sum_{i=1}^n u_i.}
\end{itemize}

\section*{LECTURE 11: COALITIONAL GAMES}
\begin{itemize}
\item \term{Transferable-utility game} $(N,v)$, where $N=\{1,\dots,n\}$ and $v:2^N\to\mathbb R$ with $v(\varnothing)=0$. There are $2^n$ coalitions.
\item \term{Characteristic function} $v(C)$ is the worth/payoff a coalition $C$ can guarantee for itself.
\item \term{Imputation} allocation $x\in\mathbb R^n$ satisfying individual and collective rationality:
\formula{x_i\ge v(\{i\})\quad\forall i,\qquad \sum_{i\in N}x_i=v(N).}
\item \term{Domination} $x$ dominates $y$ through coalition $C$ if coalition $C$ can afford $x$ and all its members prefer it:
\formula{\sum_{i\in C}x_i\le v(C),\qquad x_i>y_i\quad\forall i\in C.}
\item \term{Monotonicity} $C\subseteq D\Rightarrow v(C)\le v(D)$.
\item \term{Superadditivity} for disjoint coalitions, $C\cap D=\varnothing$,
\formula{v(C\cup D)\ge v(C)+v(D).}
\item \term{Convexity / supermodularity}
\formula{v(C\cup D)+v(C\cap D)\ge v(C)+v(D)\quad\forall C,D\subseteq N.}
Equivalently, marginal contribution rises with coalition size:
\formula{\begin{aligned}C\subseteq D,\ i\notin D\Rightarrow\;&v(C\cup\{i\})-v(C)\\[-0.4ex]&\le v(D\cup\{i\})-v(D).\end{aligned}}
\item \term{Inessential game} $v(N)=\sum_{i\in N}v(\{i\})$. No gain from forming the grand coalition; unique imputation is $x_i=v(\{i\})$. Otherwise the game is essential.
\end{itemize}

\section*{LECTURE 12: THE CORE}
\begin{itemize}
\item \term{Coalitional rationality} no coalition can secure more by leaving:
\formula{\sum_{i\in C}x_i\ge v(C)\quad\forall C\subseteq N.}
\item \term{Core} set of allocations that are collectively and coalitionally rational:
\formula{\begin{aligned}\operatorname{Core}(v)=\{x\in\mathbb R^n:\ &\sum_{i\in N}x_i=v(N),\\[-0.4ex]&\sum_{i\in C}x_i\ge v(C)\ \forall C\subseteq N\}.\end{aligned}}
Individual rationality is included by taking $C=\{i\}$. The core is convex and closed; with finite $v$ it is compact when non-empty. It may be empty.
\item \term{Relation to deviation} an allocation in the core gives no coalition a profitable deviation; this parallels NE's no unilateral profitable deviation.
\item \term{Three-player visualisation} normalise $v(\{i\})=0$ and $v(N)=1$; feasible allocations lie in the simplex with vertices $(1,0,0),(0,1,0),(0,0,1)$.
\item \term{Pair constraints} if $x_1+x_2\ge v(\{1,2\})=0.3$ and $x_1+x_2+x_3=1$, then $x_3\le0.7$.
\item \term{LP feasibility test for the core}
\formula{\begin{aligned}\text{find }x\ \text{s.t.}\quad &\sum_{i\in N}x_i=v(N),\\[-0.4ex]&\sum_{i\in C}x_i\ge v(C)\ \forall C\subseteq N.\end{aligned}}
\end{itemize}

\section*{LECTURE 13: SHAPLEY VALUE}
\begin{itemize}
\item \term{Efficiency axiom} all surplus is allocated:
\formula{\sum_{i\in N}\phi_i(v)=v(N).}
\item \term{Null/dummy player} if $v(C\cup\{i\})=v(C)$ for all $C\subseteq N\setminus\{i\}$, then $\phi_i(v)=0$. More generally, a dummy with constant marginal $v(\{i\})$ gets $v(\{i\})$.
\item \term{Symmetry} if $v(C\cup\{i\})=v(C\cup\{j\})$ for every $C$ excluding $i,j$, then $\phi_i(v)=\phi_j(v)$.
\item \term{Additivity} $\phi_i(v+w)=\phi_i(v)+\phi_i(w)$.
\item \term{Marginal contribution} $\Delta_i v(C)=v(C\cup\{i\})-v(C)$.
\item \term{Shapley value}
\formula{\phi_i(v)=\sum_{C\subseteq N\setminus\{i\}}\frac{|C|!(n-|C|-1)!}{n!}\,\Delta_i v(C).}
Equivalent form:
\formula{\phi_i(v)=\frac1n\sum_{C\subseteq N\setminus\{i\}}\binom{n-1}{|C|}^{-1}\Delta_i v(C).}
\item \term{Interpretation} average marginal contribution of player $i$ across all possible orders in which the grand coalition can be formed.
\item \term{Core link} if the TU game is convex, the Shapley value lies in the core. If not convex, check individual and coalitional rationality manually.
\end{itemize}

\section*{LECTURE 14: STABLE MATCHING}
\begin{itemize}
\item \term{Setting} two sides $O$ and $D$ with strict preferences. A matching $\mu$ maps each $o\in O$ to a $d\in D$ and each $d$ to at most one $o$, with consistency $\mu(o)=d\Leftrightarrow\mu(d)=o$.
\item \term{Perfect matching} every agent on both sides is matched.
\item \term{Blocking/unstable pair} pair $(o,d)$ blocks $\mu$ if
\formula{d\succ_o\mu(o)\quad\text{and}\quad o\succ_d\mu(d).}
Both would rather be matched to each other than keep their assigned partners.
\item \term{Stable matching} individually rational, perfect if required, and has no blocking pair.
\item \term{Gale-Shapley deferred acceptance} proposers apply down their preference list; receivers hold their favourite current proposal and reject the rest; repeat until no rejections/proposals remain.
\item \term{Guarantees} terminates in at most $n^2$ proposals; produces a stable matching.
\item \term{Optimality} $O$-proposing version is $O$-optimal and $D$-pessimal among all stable matchings; reversing proposers reverses the result.
\item \term{Strategy-proofness} with strict preferences, truthful reporting is a dominant strategy for the proposing side, but not generally for the receiving side.
\end{itemize}

\end{multicols}
\end{document}
