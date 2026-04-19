"""Generate detailed mechanism system diagram."""
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent.parent / 'dashboard' / 'public' / 'presentation-plots'
NAVY = '#002147'; CYAN = '#0091D5'; GREEN = '#16a34a'; RED = '#dc2626'
GREY = '#64748b'; ORANGE = '#f59e0b'

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Avenir Next', 'Avenir', 'Helvetica Neue', 'Arial'],
})

fig, ax = plt.subplots(figsize=(14, 7))
ax.set_xlim(-0.5, 15)
ax.set_ylim(-0.5, 8.5)
ax.axis('off')
fig.patch.set_facecolor('white')

ax.text(7.25, 8.0, 'Mechanism: Round-by-Round Pipeline', ha='center', fontsize=16, fontweight='bold', color=NAVY)

# Step 1: Input
rect = FancyBboxPatch((0.3, 5.2), 2.4, 1.8, boxstyle='round,pad=0.1', facecolor='#f1f5f9', edgecolor='#94a3b8', linewidth=1)
ax.add_patch(rect)
ax.text(1.5, 6.6, '1. Input', ha='center', fontsize=12, fontweight='bold', color=NAVY)
ax.text(1.5, 6.05, 'quantile forecast', ha='center', fontsize=9.5, color='#334155')
ax.text(1.5, 5.65, 'participation flag', ha='center', fontsize=9.5, color='#334155')
ax.text(1.5, 5.35, '(from behaviour block)', ha='center', fontsize=8.5, color=GREY)

# Step 2: Deposit
rect = FancyBboxPatch((3.5, 5.2), 2.4, 1.8, boxstyle='round,pad=0.1', facecolor='#fef3c7', edgecolor=ORANGE, linewidth=1)
ax.add_patch(rect)
ax.text(4.7, 6.6, '2. Deposit', ha='center', fontsize=12, fontweight='bold', color=NAVY)
ax.text(4.7, 6.05, 'b = min(W, f*W*c, b_max)', ha='center', fontsize=9, color=ORANGE, fontweight='bold')
ax.text(4.7, 5.65, 'c = confidence(width)', ha='center', fontsize=9, color='#334155')
ax.text(4.7, 5.35, 'W = current wealth', ha='center', fontsize=9, color='#334155')

# Step 3: Skill Gate (KEY)
rect = FancyBboxPatch((6.7, 4.9), 2.6, 2.2, boxstyle='round,pad=0.12', facecolor='#e0f2fe', edgecolor=CYAN, linewidth=2)
ax.add_patch(rect)
ax.text(8.0, 6.7, '3. Skill Gate', ha='center', fontsize=13, fontweight='bold', color=NAVY)
ax.text(8.0, 6.15, 'm = b * (lam + (1-lam)*sig^eta)', ha='center', fontsize=9.5, color=CYAN, fontweight='bold')
ax.text(8.0, 5.7, 'refund = b - m (returned)', ha='center', fontsize=9, color='#334155')
ax.text(8.0, 5.3, 'sig fixed before round', ha='center', fontsize=9, color=GREEN, fontweight='bold')

# Step 4: Aggregate
rect = FancyBboxPatch((10.2, 5.2), 2.2, 1.8, boxstyle='round,pad=0.1', facecolor='#f1f5f9', edgecolor='#94a3b8', linewidth=1)
ax.add_patch(rect)
ax.text(11.3, 6.6, '4. Aggregate', ha='center', fontsize=12, fontweight='bold', color=NAVY)
ax.text(11.3, 6.05, 'r_hat = sum(m*r)/sum(m)', ha='center', fontsize=9, color='#334155')
ax.text(11.3, 5.65, 'quantile averaging', ha='center', fontsize=9, color='#334155')
ax.text(11.3, 5.35, 'delivered to client', ha='center', fontsize=8.5, color=GREY)

# Step 5: Settle
rect = FancyBboxPatch((10.2, 3.0), 2.2, 1.8, boxstyle='round,pad=0.1', facecolor='#f1f5f9', edgecolor='#94a3b8', linewidth=1)
ax.add_patch(rect)
ax.text(11.3, 4.4, '5. Settle', ha='center', fontsize=12, fontweight='bold', color=NAVY)
ax.text(11.3, 3.85, 'Pi = m*(1 + s - s_bar)', ha='center', fontsize=9, color='#334155')
ax.text(11.3, 3.45, 'sum(Pi) = sum(m)', ha='center', fontsize=9, color=GREEN, fontweight='bold')
ax.text(11.3, 3.15, '(budget balanced)', ha='center', fontsize=8.5, color=GREY)

# Step 6: Skill Update
rect = FancyBboxPatch((4.5, 1.0), 3.0, 1.8, boxstyle='round,pad=0.1', facecolor='#dcfce7', edgecolor=GREEN, linewidth=1.2)
ax.add_patch(rect)
ax.text(6.0, 2.4, '6. Skill Update', ha='center', fontsize=12, fontweight='bold', color=NAVY)
ax.text(6.0, 1.85, 'L = (1-rho)*L + rho*loss', ha='center', fontsize=9, color=GREEN, fontweight='bold')
ax.text(6.0, 1.45, 'sig = sig_min + (1-sig_min)*exp(-gam*L)', ha='center', fontsize=8.5, color='#334155')
ax.text(6.0, 1.1, 'absent: staleness decay', ha='center', fontsize=8.5, color=GREY)

# Step 7: Wealth
rect = FancyBboxPatch((0.5, 1.0), 2.4, 1.8, boxstyle='round,pad=0.1', facecolor='#f1f5f9', edgecolor='#94a3b8', linewidth=1)
ax.add_patch(rect)
ax.text(1.7, 2.4, '7. Wealth', ha='center', fontsize=12, fontweight='bold', color=NAVY)
ax.text(1.7, 1.85, 'W = max(0, W + profit)', ha='center', fontsize=9, color='#334155')
ax.text(1.7, 1.45, 'path dependence', ha='center', fontsize=9, color=GREY)

# ARROWS - main flow
ax.annotate('', xy=(3.5, 6.1), xytext=(2.7, 6.1), arrowprops=dict(arrowstyle='->', color=GREY, lw=1.5))
ax.annotate('', xy=(6.7, 6.1), xytext=(5.9, 6.1), arrowprops=dict(arrowstyle='->', color=GREY, lw=1.5))
ax.annotate('', xy=(10.2, 6.1), xytext=(9.3, 6.1), arrowprops=dict(arrowstyle='->', color=CYAN, lw=2.5))
ax.text(9.75, 6.5, 'm', ha='center', fontsize=11, color=CYAN, fontweight='bold')

# m also goes to settle
ax.annotate('', xy=(10.2, 3.9), xytext=(9.3, 5.3), arrowprops=dict(arrowstyle='->', color=CYAN, lw=2, connectionstyle='arc3,rad=-0.15'))
ax.text(9.3, 4.4, 'm', ha='center', fontsize=10, color=CYAN, fontweight='bold')

# Outcome -> Settle
ax.annotate('', xy=(12.4, 4.8), xytext=(13.5, 5.8), arrowprops=dict(arrowstyle='->', color=RED, lw=1.5))
ax.text(13.7, 6.0, 'outcome', ha='left', fontsize=10, color=RED, fontstyle='italic')

# Settle -> Skill Update (loss)
ax.annotate('', xy=(7.5, 2.0), xytext=(10.2, 3.5), arrowprops=dict(arrowstyle='->', color=GREEN, lw=1.5, linestyle='dashed'))
ax.text(9.0, 2.5, 'loss', ha='center', fontsize=10, color=GREEN, fontstyle='italic')

# Settle -> Wealth (profit)
ax.annotate('', xy=(2.9, 1.9), xytext=(10.2, 3.2), arrowprops=dict(arrowstyle='->', color=GREY, lw=1.2, linestyle='dashed'))
ax.text(6.8, 2.9, 'profit', ha='center', fontsize=9, color=GREY, fontstyle='italic')

# Skill Update -> Skill Gate (sigma next round)
ax.annotate('', xy=(8.0, 4.9), xytext=(7.0, 2.8), arrowprops=dict(arrowstyle='->', color=GREEN, lw=2.5))
ax.text(7.0, 3.7, 'sig\n(next round)', ha='center', fontsize=9.5, color=GREEN, fontweight='bold', linespacing=0.9)

# Wealth -> Deposit (next round)
ax.annotate('', xy=(3.5, 5.5), xytext=(1.7, 2.8), arrowprops=dict(arrowstyle='->', color=GREY, lw=1.5, linestyle='dotted'))
ax.text(2.2, 4.0, 'W\n(next round)', ha='center', fontsize=9, color=GREY, fontstyle='italic', linespacing=0.9)

# KEY INSIGHT
ax.text(7.25, -0.1, 'KEY: Same effective wager m determines both aggregation weight and financial exposure',
        ha='center', va='center', fontsize=11.5, fontweight='bold', color=NAVY,
        bbox=dict(boxstyle='round,pad=0.5', facecolor='#e0f2fe', edgecolor=CYAN, lw=1.5))

plt.tight_layout(pad=0.3)
plt.savefig(OUT / 'mechanism_steps.png', dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print('Done: mechanism_steps.png')
