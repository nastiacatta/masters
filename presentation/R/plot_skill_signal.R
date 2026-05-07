# presentation/R/plot_skill_signal.R
# Skill signal mapping: σ = σ_min + (1 − σ_min) · exp(−γ · L)
# Uses parametric data — no external file reads.
#
# Run from project root:
#   Rscript presentation/R/plot_skill_signal.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(ggrepel)
})

# ---------------------------------------------------------------------------
# 1. Parameters
# ---------------------------------------------------------------------------
sigma_min <- 0.05
gamma     <- 16.0

skill_map <- function(L, sigma_min, gamma) {
  sigma_min + (1 - sigma_min) * exp(-gamma * L)
}

# ---------------------------------------------------------------------------
# 2. Curve data
# ---------------------------------------------------------------------------
L_seq <- seq(0, 0.5, length.out = 600)
df_curve <- data.frame(
  L     = L_seq,
  sigma = skill_map(L_seq, sigma_min, gamma)
)

# Three illustrative forecasters
forecaster_dots <- data.frame(
  label  = c("Skilled", "Moderate", "Unskilled"),
  L      = c(0.02, 0.15, 0.38),
  colour = c(PALETTE$teal, PALETTE$coral, PALETTE$slate),
  stringsAsFactors = FALSE
)
forecaster_dots$sigma <- skill_map(forecaster_dots$L, sigma_min, gamma)

# ---------------------------------------------------------------------------
# 3. Plot
# ---------------------------------------------------------------------------
p <- ggplot() +
  # Bounded range [σ_min, 1] lightly shaded
  annotate("rect",
           xmin = -Inf, xmax = Inf,
           ymin = sigma_min, ymax = 1,
           fill = PALETTE$teal, alpha = 0.04) +

  # σ_min floor
  geom_hline(yintercept = sigma_min, linetype = "dashed",
             colour = PALETTE$coral, linewidth = 0.55, alpha = 0.8) +
  # Place σ_min annotation on the right-hand side away from "Skilled" dot
  annotate("text",
           x = max(L_seq) * 0.985, y = sigma_min + 0.05,
           label = sprintf("\u03C3_min = %.2f", sigma_min),
           hjust = 1, size = TYPO$annot_med,
           colour = PALETTE$coral, fontface = "bold") +

  # σ = 1 ceiling — placed just above the line inside headroom
  geom_hline(yintercept = 1, linetype = "dotted",
             colour = PALETTE$slate, linewidth = 0.45, alpha = 0.6) +
  annotate("text",
           x = max(L_seq) * 0.985, y = 1.04,
           label = "\u03C3 = 1 (perfect forecaster)",
           hjust = 1, size = TYPO$annot_small + 0.5,
           colour = PALETTE$slate, fontface = "italic") +

  # Main curve
  geom_line(data = df_curve, aes(x = L, y = sigma),
            colour = PALETTE$navy, linewidth = 1.6) +

  # Forecaster dots
  geom_point(data = forecaster_dots,
             aes(x = L, y = sigma),
             fill = forecaster_dots$colour, colour = "white",
             shape = 21, size = 8, stroke = 1.6) +

  # Non-overlapping labels with leader lines. Nudge Skilled (near ceiling)
  # downward; nudge the others upward so they sit clear of the curve.
  geom_label_repel(
    data        = forecaster_dots,
    aes(x = L, y = sigma, label = label),
    size        = TYPO$annot_med,
    fontface    = "bold",
    fill        = "white",
    colour      = PALETTE$charcoal,
    label.size  = 0,
    label.padding = unit(0.35, "lines"),
    nudge_x     = c(0.07, 0.07, -0.07),
    nudge_y     = c(-0.15, 0.18, 0.15),
    segment.colour = PALETTE$slate,
    segment.alpha  = 0.6,
    box.padding = 0.5,
    point.padding = 0.4,
    min.segment.length = 0,
    direction = "both",
    seed        = 1
  ) +

  scale_x_continuous(
    limits = c(-0.005, max(L_seq) + 0.005),
    breaks = seq(0, 0.5, 0.1),
    labels = scales::number_format(accuracy = 0.01),
    expand = c(0, 0)
  ) +
  scale_y_continuous(
    limits = c(0, 1.12),
    breaks = seq(0, 1, 0.2),
    labels = scales::number_format(accuracy = 0.1)
  ) +
  labs(
    x = expression(bold("Mean loss") ~ italic(L)),
    y = expression(bold("Skill") ~ italic(sigma))
  ) +
  theme_thesis()

# ---------------------------------------------------------------------------
# 4. Save
# ---------------------------------------------------------------------------
save_dual(p, "skill_signal_clean.png", width = 12, height = 8)
message("Done: skill_signal_clean.png")
