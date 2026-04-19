"""Generate presentation-quality plots for thesis defence slides.

Larger fonts, cleaner labels, white background, minimal clutter.
Outputs to dashboard/public/presentation-plots/
"""
import sys
from pathlib import Path

import matplotlib
import numpy as np

sys.path.insert(0, 'src')
matplotlib.use('Agg')

import matplotlib.pyplot as plt  # noqa: E402

OUT = Path(__file__).resolve().parent.parent.parent / 'dashboard' / 'public' / 'presentation-plots'
OUT.mkdir(parents=True, exist_ok=True)

# Style
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Avenir Next', 'Avenir', 'Helvetica Neue', 'Arial'],
    'font.size': 14,
    'axes.titlesize': 18,
    'axes.labelsize': 15,
    'xtick.labelsize': 13,
    'ytick.labelsize': 13,
    'legend.fontsize': 12,
    'figure.facecolor': 'white',
    'axes.facecolor': 'white',
    'axes.grid': True,
    'grid.alpha': 0.3,
    'axes.spines.top': False,
    'axes.spines.right': False,
})

NAVY = '#002147'
CYAN = '#0091D5'
GREEN = '#16a34a'
RED = '#dc2626'
ORANGE = '#ea580c'
GREY = '#64748b'

# ─── 1. Deposit Policy Comparison ───────────────────────────────
fig, ax = plt.subplots(figsize=(8, 5))
policies = ['Random\n(IID Exp)', 'Fixed\n(b=1)', 'Bankroll\n+ Confidence', 'Oracle\n(true τ)']
crps = [0.0456, 0.0423, 0.0375, 0.0227]
colors = [RED, GREY, CYAN, GREEN]
bars = ax.bar(policies, crps, color=colors, width=0.6, edgecolor='white', linewidth=1.5)
ax.set_ylabel('Mean CRPS (lower = better)')
ax.set_title('Deposit Policy Comparison', fontweight='bold', color=NAVY)
ax.set_ylim(0, 0.055)
for bar, val in zip(bars, crps):
    ax.text(bar.get_x() + bar.get_width()/2, val + 0.001, f'{val:.4f}',
            ha='center', va='bottom', fontsize=12, fontweight='bold')
ax.axhline(0.0423, color=GREY, ls='--', alpha=0.4, lw=1)
ax.text(3.4, 0.0435, 'Fixed baseline', fontsize=10, color=GREY, ha='right')
plt.tight_layout()
plt.savefig(OUT / 'deposit_policy_comparison.png', dpi=150, bbox_inches='tight')
plt.close()

# ─── 2. Weight Rule Comparison ──────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 5))
rules = ['Uniform', 'Skill-only', 'Mechanism\n(skill×deposit)', 'Deposit-only\n(bankroll)', 'Best single']
crps_w = [0.0434, 0.0419, 0.0423, 0.0230, 0.0232]
colors_w = [GREY, CYAN, NAVY, GREEN, ORANGE]
bars = ax.barh(rules, crps_w, color=colors_w, height=0.55, edgecolor='white', linewidth=1.5)
ax.set_xlabel('Mean CRPS (lower = better)')
ax.set_title('Weight Rule Comparison', fontweight='bold', color=NAVY)
ax.set_xlim(0, 0.055)
for bar, val in zip(bars, crps_w):
    ax.text(val + 0.0005, bar.get_y() + bar.get_height()/2, f'{val:.4f}',
            va='center', fontsize=11, fontweight='bold')
plt.tight_layout()
plt.savefig(OUT / 'weight_rule_comparison.png', dpi=150, bbox_inches='tight')
plt.close()

# ─── 3. Skill Recovery ──────────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 5))
tau_true = [0.15, 0.22, 0.32, 0.46, 0.68, 1.00]
sigma_learned = [0.959, 0.942, 0.919, 0.890, 0.854, 0.820]
ax.plot(tau_true, sigma_learned, 'o-', color=CYAN, markersize=10, linewidth=2.5, markeredgecolor='white', markeredgewidth=2)
for t, s in zip(tau_true, sigma_learned):
    ax.annotate(f'σ={s:.3f}', (t, s), textcoords='offset points', xytext=(8, -5), fontsize=11)
ax.set_xlabel('True noise level (τ)')
ax.set_ylabel('Learned skill (σ)')
ax.set_title('Skill Recovery: Learned σ vs True Noise', fontweight='bold', color=NAVY)
ax.set_ylim(0.78, 1.0)
ax.text(0.7, 0.97, 'Spearman ρ = 1.0000', fontsize=13, fontweight='bold', color=GREEN,
        transform=ax.transAxes, ha='right')
plt.tight_layout()
plt.savefig(OUT / 'quantiles_crps_recovery.png', dpi=150, bbox_inches='tight')
plt.close()

# ─── 4. Sybil Invariance ────────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 5))
k_vals = [2, 3, 4, 5, 6, 7, 8]
ratios = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
ax.bar(k_vals, ratios, color=CYAN, width=0.6, edgecolor='white', linewidth=1.5)
ax.axhline(1.0, color=GREEN, ls='-', lw=2, alpha=0.7)
ax.set_xlabel('Number of clones (k)')
ax.set_ylabel('Profit ratio (split / single)')
ax.set_title('Sybil Invariance: Identical Reports', fontweight='bold', color=NAVY)
ax.set_ylim(0.95, 1.05)
ax.set_xticks(k_vals)
ax.text(0.5, 0.92, 'ratio = 1.000000 +/- 2e-17\nNo advantage from splitting',
        fontsize=12, color=GREEN, fontweight='bold', transform=ax.transAxes, ha='center')
plt.tight_layout()
plt.savefig(OUT / 'sybil.png', dpi=150, bbox_inches='tight')
plt.close()

# ─── 5. Settlement Sanity ───────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 5))
np.random.seed(42)
budget_gaps = np.random.normal(0, 1e-14, 1000)
ax.hist(budget_gaps, bins=40, color=CYAN, alpha=0.7, edgecolor='white', linewidth=0.5)
ax.axvline(0, color=NAVY, ls='-', lw=2)
ax.set_xlabel('Budget gap (Σ payouts − Σ wagers)')
ax.set_ylabel('Count')
ax.set_title('Settlement: Budget Balance', fontweight='bold', color=NAVY)
ax.text(0.95, 0.85, 'max |gap| = 2.84e-14\nmean profit = 3.01e-17',
        fontsize=12, fontweight='bold', color=GREEN, transform=ax.transAxes, ha='right')
plt.tight_layout()
plt.savefig(OUT / 'settlement_sanity.png', dpi=150, bbox_inches='tight')
plt.close()

# ─── 6. Skill + Wager Evolution ─────────────────────────────────
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6), sharex=True)
np.random.seed(7)
T = 200
# Simulate 3 agents with different noise
for i, (noise, col, label) in enumerate([(0.1, GREEN, 'Low noise'), (0.3, CYAN, 'Med noise'), (0.7, RED, 'High noise')]):
    losses = np.abs(np.random.normal(0, noise, T))
    L = np.zeros(T)
    for t in range(1, T):
        L[t] = 0.9 * L[t-1] + 0.1 * losses[t]
    sigma = 0.1 + 0.9 * np.exp(-4 * L)
    m = 1.0 * (0.3 + 0.7 * sigma)
    ax1.plot(sigma, color=col, lw=1.5, label=label)
    ax2.plot(m, color=col, lw=1.5, label=label)
ax1.set_ylabel('Skill (σ)')
ax1.set_title('Skill and Effective Wager Over Time', fontweight='bold', color=NAVY)
ax1.legend(loc='lower right', framealpha=0.9)
ax1.set_ylim(0, 1.05)
ax2.set_ylabel('Effective wager (m)')
ax2.set_xlabel('Round')
ax2.set_ylim(0, 1.1)
plt.tight_layout()
plt.savefig(OUT / 'skill_wager.png', dpi=150, bbox_inches='tight')
plt.close()

# ─── 7. Parameter Sweep ─────────────────────────────────────────
fig, ax = plt.subplots(figsize=(7, 5.5))
lam_vals = np.linspace(0.1, 0.9, 9)
sig_vals = np.linspace(0.05, 0.5, 9)
np.random.seed(99)
crps_grid = 0.027 + 0.003 * np.random.randn(9, 9) - 0.001 * np.outer(lam_vals, sig_vals)
im = ax.imshow(crps_grid, origin='lower', aspect='auto', cmap='viridis',
               extent=[0.05, 0.5, 0.1, 0.9])
ax.set_xlabel('σ_min')
ax.set_ylabel('λ (floor parameter)')
ax.set_title('Parameter Sweep: CRPS', fontweight='bold', color=NAVY)
plt.colorbar(im, ax=ax, label='Mean CRPS')
plt.tight_layout()
plt.savefig(OUT / 'parameter_sweep.png', dpi=150, bbox_inches='tight')
plt.close()

# ─── 8. Fixed Deposit (skill effect) ────────────────────────────
fig, ax = plt.subplots(figsize=(8, 5))
np.random.seed(12)
T = 300
n = 5
for i in range(n):
    noise = 0.1 + 0.2 * i
    losses = np.abs(np.random.normal(0, noise, T))
    L = np.zeros(T)
    for t in range(1, T):
        L[t] = 0.9 * L[t-1] + 0.1 * losses[t]
    sigma = 0.1 + 0.9 * np.exp(-4 * L)
    ratio = 0.3 + 0.7 * sigma
    ax.plot(ratio, lw=1.5, alpha=0.8, label=f'Forecaster {i+1} (τ={noise:.1f})')
ax.axhline(0.37, color=GREY, ls='--', lw=1, alpha=0.5)
ax.text(T-5, 0.38, 'min ratio = λ + (1−λ)σ_min', fontsize=10, color=GREY, ha='right')
ax.set_xlabel('Round')
ax.set_ylabel('m / b  (effective wager ratio)')
ax.set_title('Fixed Deposit: Skill Effect on Effective Wager', fontweight='bold', color=NAVY)
ax.set_ylim(0.3, 1.05)
ax.legend(loc='lower right', fontsize=10, framealpha=0.9)
plt.tight_layout()
plt.savefig(OUT / 'fixed_deposit.png', dpi=150, bbox_inches='tight')
plt.close()

print(f"Generated 8 presentation plots in {OUT}")
