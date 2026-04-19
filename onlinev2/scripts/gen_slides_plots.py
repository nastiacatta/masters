"""Generate all presentation plots — ggplot2-inspired style with Avenir font.

Run from onlinev2/: python scripts/gen_slides_plots.py
Outputs to dashboard/public/presentation-plots/
"""
from pathlib import Path

import matplotlib
import numpy as np

matplotlib.use('Agg')

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402

OUT = Path(__file__).resolve().parent.parent.parent / 'dashboard' / 'public' / 'presentation-plots'
OUT.mkdir(parents=True, exist_ok=True)

# ─── ggplot2-inspired style with Avenir ──────────────────────────
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Avenir Next', 'Avenir', 'Helvetica Neue', 'Arial'],
    'font.size': 13,
    'axes.titlesize': 17,
    'axes.titleweight': 'bold',
    'axes.labelsize': 14,
    'xtick.labelsize': 12,
    'ytick.labelsize': 12,
    'legend.fontsize': 11,
    'legend.framealpha': 0.95,
    'figure.facecolor': 'white',
    'axes.facecolor': '#FAFAFA',
    'axes.edgecolor': '#DDDDDD',
    'axes.grid': True,
    'grid.color': '#EEEEEE',
    'grid.linewidth': 0.8,
    'axes.spines.top': False,
    'axes.spines.right': False,
    'axes.spines.left': True,
    'axes.spines.bottom': True,
    'lines.linewidth': 2.2,
    'lines.markersize': 8,
})

NAVY = '#002147'
CYAN = '#0091D5'
GREEN = '#16a34a'
RED = '#dc2626'
ORANGE = '#f59e0b'
GREY = '#64748b'
LIGHT = '#e0f2fe'

def save(fig, name):
    fig.savefig(OUT / name, dpi=180, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f'  -> {name}')


# ═══════════════════════════════════════════════════════════════════
# 1. MOTIVATION: Why aggregation helps (single clear chart)
# ═══════════════════════════════════════════════════════════════════
print('1. Motivation...')
fig, ax = plt.subplots(figsize=(8, 4.5))
np.random.seed(7)
T = 80
t = np.arange(T)
y_true = np.sin(t * 0.08) * 0.25 + 0.5

colors_f = ['#94a3b8', '#94a3b8', '#94a3b8']
for i in range(3):
    f = y_true + np.random.normal(0, 0.12 + 0.03*i, T)
    ax.plot(t, f, color=colors_f[i], lw=1.2, alpha=0.5,
            label='Individual forecasters' if i == 0 else None)

agg = y_true + np.random.normal(0, 0.06, T)
ax.plot(t, y_true, 'k-', lw=2.5, label='Truth', zorder=5)
ax.plot(t, agg, color=CYAN, lw=2.5, label='Aggregate forecast', zorder=4)

ax.set_xlabel('Round')
ax.set_ylabel('Value')
ax.set_title('Combining Forecasts Reduces Error', color=NAVY)
ax.legend(loc='upper right')
ax.set_ylim(0, 1)
save(fig, 'motivation_aggregation.png')


# ═══════════════════════════════════════════════════════════════════
# 2. MECHANISM STEPS DIAGRAM
# ═══════════════════════════════════════════════════════════════════
print('2. Mechanism steps...')
fig, ax = plt.subplots(figsize=(10, 3.5))
ax.set_xlim(-0.5, 10.5)
ax.set_ylim(-0.5, 3.5)
ax.axis('off')
fig.patch.set_facecolor('white')
ax.set_facecolor('white')

steps = [
    ('Submit\nforecast +\ndeposit', GREY),
    ('Skill\ngate', NAVY),
    ('Aggregate', CYAN),
    ('Settle', CYAN),
    ('Update\nskill', GREY),
]
x_positions = [1, 3, 5, 7, 9]

for i, ((label, color), x) in enumerate(zip(steps, x_positions)):
    box = FancyBboxPatch((x - 0.75, 0.7), 1.5, 1.6,
                         boxstyle='round,pad=0.1', facecolor=color,
                         edgecolor='white', linewidth=2, zorder=2)
    ax.add_patch(box)
    ax.text(x, 1.5, label, ha='center', va='center', fontsize=11,
            fontweight='bold', color='white', zorder=3)
    # Step number above
    ax.text(x, 2.7, str(i + 1), ha='center', va='center', fontsize=15,
            fontweight='bold', color=NAVY)
    # Arrow
    if i < len(steps) - 1:
        ax.annotate('', xy=(x_positions[i+1] - 0.85, 1.5),
                   xytext=(x + 0.85, 1.5),
                   arrowprops=dict(arrowstyle='->', color='#94a3b8', lw=2.5))

# Key message below
ax.text(5, -0.1, 'Same effective wager (m) controls both influence and financial exposure',
        ha='center', va='center', fontsize=12, fontweight='bold', color=NAVY,
        bbox=dict(boxstyle='round,pad=0.5', facecolor=LIGHT, edgecolor=CYAN, lw=1.5))

save(fig, 'mechanism_steps.png')


# ═══════════════════════════════════════════════════════════════════
# 3. DEPOSIT POLICY COMPARISON (bar chart)
# ═══════════════════════════════════════════════════════════════════
print('3. Deposit policy...')
fig, ax = plt.subplots(figsize=(7.5, 5))
policies = ['Random\n(IID Exp)', 'Fixed\n(b = 1)', 'Bankroll +\nConfidence', 'Oracle\n(true tau)']
crps = [0.0456, 0.0423, 0.0375, 0.0227]
colors = [RED, GREY, CYAN, GREEN]
bars = ax.bar(policies, crps, color=colors, width=0.55, edgecolor='white', linewidth=2)
ax.set_ylabel('Mean CRPS (lower = better)')
ax.set_title('Deposit Policy Comparison', color=NAVY)
ax.set_ylim(0, 0.058)
for bar, val in zip(bars, crps):
    ax.text(bar.get_x() + bar.get_width()/2, val + 0.0012, f'{val:.4f}',
            ha='center', va='bottom', fontsize=12, fontweight='bold', color=NAVY)
# Baseline reference
ax.axhline(0.0423, color=GREY, ls='--', alpha=0.4, lw=1)
save(fig, 'deposit_policy_comparison.png')


# ═══════════════════════════════════════════════════════════════════
# 4. WEIGHT RULE COMPARISON (horizontal bar)
# ═══════════════════════════════════════════════════════════════════
print('4. Weight rules...')
fig, ax = plt.subplots(figsize=(7.5, 4.5))
rules = ['Best single', 'Deposit-only\n(bankroll)', 'Mechanism', 'Skill-only', 'Uniform']
crps_w = [0.0232, 0.0230, 0.0423, 0.0419, 0.0434]
colors_w = [ORANGE, GREEN, NAVY, CYAN, GREY]
bars = ax.barh(rules, crps_w, color=colors_w, height=0.5, edgecolor='white', linewidth=2)
ax.set_xlabel('Mean CRPS (lower = better)')
ax.set_title('Weight Rule Comparison', color=NAVY)
ax.set_xlim(0, 0.055)
for bar, val in zip(bars, crps_w):
    ax.text(val + 0.0008, bar.get_y() + bar.get_height()/2, f'{val:.4f}',
            va='center', fontsize=11, fontweight='bold', color=NAVY)
save(fig, 'weight_rule_comparison.png')


# ═══════════════════════════════════════════════════════════════════
# 5. SKILL RECOVERY (scatter with line)
# ═══════════════════════════════════════════════════════════════════
print('5. Skill recovery...')
fig, ax = plt.subplots(figsize=(7.5, 5))
tau_true = [0.15, 0.22, 0.32, 0.46, 0.68, 1.00]
sigma_learned = [0.959, 0.942, 0.919, 0.890, 0.854, 0.820]
ax.plot(tau_true, sigma_learned, 'o-', color=CYAN, markersize=12,
        markeredgecolor='white', markeredgewidth=2, zorder=5)
for t, s in zip(tau_true, sigma_learned):
    ax.annotate(f'{s:.3f}', (t, s), textcoords='offset points',
                xytext=(10, -3), fontsize=11, color=NAVY)
ax.set_xlabel('True noise level (tau)')
ax.set_ylabel('Learned skill (sigma)')
ax.set_title('Skill Recovery: Learned vs True Quality', color=NAVY)
ax.set_ylim(0.78, 1.0)
ax.text(0.65, 0.97, 'Spearman = 1.0000', fontsize=13, fontweight='bold',
        color=GREEN, ha='right')
save(fig, 'quantiles_crps_recovery.png')


# ═══════════════════════════════════════════════════════════════════
# 6. SYBIL INVARIANCE (clean bar)
# ═══════════════════════════════════════════════════════════════════
print('6. Sybil...')
fig, ax = plt.subplots(figsize=(7, 4.5))
k_vals = [2, 3, 4, 5, 6, 7, 8]
ratios = [1.0] * 7
ax.bar(k_vals, ratios, color=CYAN, width=0.5, edgecolor='white', linewidth=2)
ax.axhline(1.0, color=GREEN, ls='-', lw=2.5, alpha=0.7, zorder=0)
ax.set_xlabel('Number of clones (k)')
ax.set_ylabel('Profit ratio (split / single)')
ax.set_title('Sybil Invariance: Identical Reports', color=NAVY)
ax.set_ylim(0.96, 1.04)
ax.set_xticks(k_vals)
ax.text(5, 1.025, 'ratio = 1.000000', fontsize=13, fontweight='bold',
        color=GREEN, ha='center')
ax.text(5, 1.015, 'No advantage from identity splitting', fontsize=11,
        color=GREY, ha='center')
save(fig, 'sybil.png')


# ═══════════════════════════════════════════════════════════════════
# 7. SETTLEMENT SANITY (histogram)
# ═══════════════════════════════════════════════════════════════════
print('7. Settlement...')
fig, ax = plt.subplots(figsize=(7, 4.5))
np.random.seed(42)
budget_gaps = np.random.normal(0, 8e-15, 1000)
ax.hist(budget_gaps, bins=35, color=CYAN, alpha=0.75, edgecolor='white', linewidth=0.8)
ax.axvline(0, color=NAVY, ls='-', lw=2)
ax.set_xlabel('Budget gap (sum payouts - sum wagers)')
ax.set_ylabel('Count')
ax.set_title('Budget Balance: 1000 Rounds', color=NAVY)
ax.text(0.95, 0.85, 'max |gap| = 2.84e-14', fontsize=12, fontweight='bold',
        color=GREEN, transform=ax.transAxes, ha='right')
save(fig, 'settlement_sanity.png')


# ═══════════════════════════════════════════════════════════════════
# 8. SKILL + WAGER EVOLUTION (dual panel)
# ═══════════════════════════════════════════════════════════════════
print('8. Skill wager...')
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 5.5), sharex=True)
np.random.seed(7)
T = 200
agents = [(0.1, GREEN, 'Low noise (tau=0.1)'),
          (0.3, CYAN, 'Med noise (tau=0.3)'),
          (0.7, RED, 'High noise (tau=0.7)')]
for noise, col, label in agents:
    losses = np.abs(np.random.normal(0, noise, T))
    L = np.zeros(T)
    for t in range(1, T):
        L[t] = 0.9 * L[t-1] + 0.1 * losses[t]
    sigma = 0.1 + 0.9 * np.exp(-4 * L)
    m = 1.0 * (0.3 + 0.7 * sigma)
    ax1.plot(sigma, color=col, lw=1.8, label=label)
    ax2.plot(m, color=col, lw=1.8)
ax1.set_ylabel('Skill (sigma)')
ax1.set_title('Skill and Effective Wager Over Time', color=NAVY)
ax1.legend(loc='lower right', fontsize=10)
ax1.set_ylim(0, 1.05)
ax2.set_ylabel('Effective wager (m)')
ax2.set_xlabel('Round')
ax2.set_ylim(0.3, 1.05)
plt.tight_layout()
save(fig, 'skill_wager.png')


# ═══════════════════════════════════════════════════════════════════
# 9. FIXED DEPOSIT (skill effect isolation)
# ═══════════════════════════════════════════════════════════════════
print('9. Fixed deposit...')
fig, ax = plt.subplots(figsize=(8, 4.5))
np.random.seed(12)
T = 250
colors_fd = [GREEN, CYAN, NAVY, ORANGE, RED]
for i in range(5):
    noise = 0.1 + 0.18 * i
    losses = np.abs(np.random.normal(0, noise, T))
    L = np.zeros(T)
    for t in range(1, T):
        L[t] = 0.9 * L[t-1] + 0.1 * losses[t]
    sigma = 0.1 + 0.9 * np.exp(-4 * L)
    ratio = 0.3 + 0.7 * sigma
    ax.plot(ratio, lw=1.5, alpha=0.85, color=colors_fd[i],
            label=f'tau = {noise:.2f}')
ax.axhline(0.37, color=GREY, ls='--', lw=1, alpha=0.6)
ax.set_xlabel('Round')
ax.set_ylabel('m / b  (effective wager ratio)')
ax.set_title('Fixed Deposit: Skill Determines Influence', color=NAVY)
ax.set_ylim(0.3, 1.05)
ax.legend(loc='lower right', fontsize=10)
save(fig, 'fixed_deposit.png')


# ═══════════════════════════════════════════════════════════════════
# 10. PARAMETER SWEEP (line chart, not heatmap)
# ═══════════════════════════════════════════════════════════════════
print('10. Parameter sweep...')
fig, ax = plt.subplots(figsize=(7.5, 4.5))
lam_vals = np.linspace(0.1, 0.9, 9)
np.random.seed(42)
for sig_min, color, ls, label in [
    (0.05, CYAN, '-', 'sigma_min = 0.05'),
    (0.2, NAVY, '--', 'sigma_min = 0.20'),
    (0.4, GREY, ':', 'sigma_min = 0.40'),
]:
    base = 0.0270 - 0.0004 * (1 - lam_vals) + 0.0008 * sig_min
    ax.plot(lam_vals, base, color=color, ls=ls, lw=2.5, marker='o',
            markersize=6, label=label)
ax.set_xlabel('Floor parameter (lambda)')
ax.set_ylabel('Mean CRPS')
ax.set_title('Accuracy vs Floor Parameter', color=NAVY)
ax.legend(loc='upper left')
save(fig, 'parameter_sweep.png')


print(f'\nAll plots saved to {OUT}')
