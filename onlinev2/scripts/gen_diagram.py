"""Generate the five-step per-round pipeline diagram.

The figure mirrors the thesis text (Chapter 3, §3.1): each round runs
submission → skill gate → aggregation → scoring & settlement →
state update, with a single feedback arrow carrying σ to the next
round's skill gate.

Output: dashboard/public/presentation-plots/mechanism_steps.png
        writing/figures/mechanism_steps.png
        writing/overleaf/figures/mechanism_steps.png
"""
from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

matplotlib.use('Agg')

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_PATHS = [
    REPO_ROOT / 'dashboard' / 'public' / 'presentation-plots' / 'mechanism_steps.png',
    REPO_ROOT / 'writing' / 'figures' / 'mechanism_steps.png',
    REPO_ROOT / 'writing' / 'overleaf' / 'figures' / 'mechanism_steps.png',
]

# Palette lifted from the slide deck (presentationConstants.ts).
NAVY = '#1b2a4a'
TEAL = '#2e8b8b'
SLATE = '#475569'
BORDER = '#d6dce4'
OFF_WHITE = '#fafafa'
TEAL_SOFT = '#e8f2f2'

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Avenir Next', 'Avenir', 'Helvetica Neue', 'Arial'],
})

STEPS = [
    {
        'label': '1. Submission',
        'formula': r'$q_i(\tau),\ b_i$',
        'caption': 'Each forecaster\nsubmits quantile\nforecast and deposit',
        'emph': False,
    },
    {
        'label': '2. Skill gate',
        'formula': r'$m_i = b_i \cdot g(\sigma_i)$',
        'caption': 'Deposit modulated\nby pre-round skill;\nremainder refunded',
        'emph': True,
    },
    {
        'label': '3. Aggregation',
        'formula': r'$\hat q(\tau)=\sum_i w_i\, q_i(\tau)$',
        'caption': r'Weighted quantile' '\n' r'average; weights' '\n' r'$w_i=m_i/\sum_j m_j$',
        'emph': False,
    },
    {
        'label': '4. Settlement',
        'formula': r'$\pi_i = m_i\,(1 + s_i - \bar s)$',
        'caption': 'Outcome scored;\nLambert payoff —\nbudget balanced',
        'emph': False,
    },
    {
        'label': '5. State update',
        'formula': r'$\sigma_{i,t+1} = \sigma_{\min} + (1-\sigma_{\min})e^{-\gamma L_i}$',
        'caption': 'EWMA of loss maps\nto bounded skill\nfor next round',
        'emph': True,
    },
]

# ── Layout ────────────────────────────────────────────────────────────────
# Canvas is 16 wide by 8 tall; box row is centred at y=4.8 with feedback
# arrow looping beneath. Box width chosen so arrows between them have a
# small but clear gap.
FIG_W, FIG_H = 16.0, 7.0
BOX_W, BOX_H = 2.75, 2.8
BOX_Y = 3.0          # bottom of box
GAP = 0.35           # arrow gap between boxes
N = len(STEPS)
TOTAL_W = N * BOX_W + (N - 1) * GAP
X0 = (FIG_W - TOTAL_W) / 2  # left edge of first box

fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
ax.set_xlim(0, FIG_W)
ax.set_ylim(0, FIG_H)
ax.set_axis_off()
fig.patch.set_facecolor('white')

# Title
ax.text(
    FIG_W / 2, FIG_H - 0.45,
    'Round-by-round pipeline',
    ha='center', va='center',
    fontsize=17, fontweight='bold', color=NAVY,
)
ax.text(
    FIG_W / 2, FIG_H - 0.95,
    'Every step is a pure function of the mechanism state and current-round inputs',
    ha='center', va='center',
    fontsize=10.5, color=SLATE, style='italic',
)

# ── Step boxes ────────────────────────────────────────────────────────────
box_centres = []
for i, step in enumerate(STEPS):
    x = X0 + i * (BOX_W + GAP)
    cx = x + BOX_W / 2
    cy = BOX_Y + BOX_H / 2
    box_centres.append((cx, cy))

    face = TEAL_SOFT if step['emph'] else OFF_WHITE
    edge = TEAL if step['emph'] else BORDER
    lw = 2.0 if step['emph'] else 1.2

    ax.add_patch(FancyBboxPatch(
        (x, BOX_Y), BOX_W, BOX_H,
        boxstyle='round,pad=0.02,rounding_size=0.18',
        facecolor=face, edgecolor=edge, linewidth=lw,
    ))

    # Label (step title)
    ax.text(
        cx, BOX_Y + BOX_H - 0.35,
        step['label'],
        ha='center', va='top',
        fontsize=12.5, fontweight='bold', color=NAVY,
    )

    # Formula — centred
    ax.text(
        cx, BOX_Y + BOX_H - 1.15,
        step['formula'],
        ha='center', va='top',
        fontsize=11.5, color=NAVY,
    )

    # Caption (plain-English)
    ax.text(
        cx, BOX_Y + 0.55,
        step['caption'],
        ha='center', va='bottom',
        fontsize=9.5, color=SLATE, style='italic', linespacing=1.25,
    )

# ── Forward arrows between boxes ──────────────────────────────────────────
for i in range(N - 1):
    x0 = X0 + i * (BOX_W + GAP) + BOX_W
    x1 = X0 + (i + 1) * (BOX_W + GAP)
    y = BOX_Y + BOX_H / 2
    # Highlight the arrow exiting the skill gate (carries m_i onward).
    is_wager_edge = (i == 1)
    colour = TEAL if is_wager_edge else SLATE
    lw = 2.3 if is_wager_edge else 1.6
    arrow = FancyArrowPatch(
        (x0 + 0.02, y), (x1 - 0.02, y),
        arrowstyle='-|>', mutation_scale=18,
        color=colour, linewidth=lw,
    )
    ax.add_patch(arrow)
    if is_wager_edge:
        ax.text(
            (x0 + x1) / 2, y + 0.25,
            r'$m_i$',
            ha='center', va='bottom',
            fontsize=11, color=TEAL, fontweight='bold',
        )

# ── Outcome input into settlement ─────────────────────────────────────────
settle_cx, settle_cy = box_centres[3]
ax.annotate(
    '',
    xy=(settle_cx, BOX_Y + BOX_H + 0.02),
    xytext=(settle_cx, BOX_Y + BOX_H + 0.65),
    arrowprops=dict(arrowstyle='-|>', color=SLATE, lw=1.4),
)
ax.text(
    settle_cx, BOX_Y + BOX_H + 0.80,
    r'outcome  $y_t$',
    ha='center', va='bottom',
    fontsize=9.5, color=SLATE, style='italic',
)

# ── Feedback arrow: state update → skill gate (next round) ────────────────
gate_cx, _ = box_centres[1]
update_cx, _ = box_centres[4]
feedback_y = BOX_Y - 1.1
# Descend out of step 5
arrow_down = FancyArrowPatch(
    (update_cx, BOX_Y), (update_cx, feedback_y),
    arrowstyle='-', color=TEAL, linewidth=1.8,
    linestyle=(0, (6, 4)),
)
# Horizontal run back to step 2
arrow_across = FancyArrowPatch(
    (update_cx, feedback_y), (gate_cx, feedback_y),
    arrowstyle='-', color=TEAL, linewidth=1.8,
    linestyle=(0, (6, 4)),
)
# Up into step 2 with arrowhead
arrow_up = FancyArrowPatch(
    (gate_cx, feedback_y), (gate_cx, BOX_Y - 0.02),
    arrowstyle='-|>', mutation_scale=16,
    color=TEAL, linewidth=1.8,
    linestyle=(0, (6, 4)),
)
for p in (arrow_down, arrow_across, arrow_up):
    ax.add_patch(p)
ax.text(
    (gate_cx + update_cx) / 2, feedback_y - 0.30,
    r'skill $\sigma_{i,t+1}$ feeds forward to the next round',
    ha='center', va='top',
    fontsize=10, color=TEAL, style='italic', fontweight='bold',
)

# ── Insight banner ────────────────────────────────────────────────────────
banner_y = 0.35
ax.add_patch(FancyBboxPatch(
    (X0, banner_y), TOTAL_W, 0.55,
    boxstyle='round,pad=0.02,rounding_size=0.1',
    facecolor=TEAL_SOFT, edgecolor=TEAL, linewidth=1.0,
))
ax.text(
    X0 + TOTAL_W / 2, banner_y + 0.28,
    'The effective wager $m_i$ is the single object that controls both aggregation weight and financial exposure',
    ha='center', va='center',
    fontsize=10.5, color=NAVY, fontweight='bold',
)

plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

for out in OUT_PATHS:
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=220, bbox_inches='tight', facecolor='white')
plt.close(fig)

for out in OUT_PATHS:
    print(f'Done: {out.relative_to(REPO_ROOT)}')
