# presentation/R/plot_skill_signal.R
# Skill signal mapping: σ = σ_min + (1 − σ_min) · exp(−γ · L)
# Uses parametric data — no external file reads.
#
# Run from project root:
#   Rscript presentation/R/plot_skill_signal.R

source("presentation/R/theme_thesis.R")

# ---------------------------------------------------------------------------
# 1. Define parameters
# ---------------------------------------------------------------------------
sigma_min <- 0.05
gamma     <- 16.0

# Skill mapping function
skill_map <- function(L, sigma_min, gamma) {
  sigma_min + (1 - sigma_min) * exp(-gamma * L)
}

# ---------------------------------------------------------------------------
# 2. Generate smooth curve data
# ---------------------------------------------------------------------------
L_seq <- seq(0, 0.5, length.out = 500)
sigma_seq <- skill_map(L_seq, sigma_min, gamma)

df_curve <- data.frame(L = L_seq, sigma = sigma_seq)

# ---------------------------------------------------------------------------
# 3. Define three example forecaster dots
# ---------------------------------------------------------------------------
forecaster_dots <- data.frame(
  label  = c("Skilled", "Moderate", "Unskilled"),
  L      = c(0.02, 0.15, 0.38),
  stringsAsFactors = FALSE
)
forecaster_dots$sigma <- skill_map(forecaster_dots$L, sigma_min, gamma)

dot_colours <- c(PALETTE$teal, PALETTE$coral, PALETTE$slate)

# ---------------------------------------------------------------------------
# 4. Build the plot (curve + dots only, no formula/parameter annotations)
# ---------------------------------------------------------------------------
p <- ggplot() +
  # Shaded region showing the bounded range [σ_min, 1]
  annotate("rect",
           xmin = -Inf, xmax = Inf,
           ymin = sigma_min, ymax = 1,
           fill = PALETTE$teal, alpha = 0.05) +
  # σ_min floor line
  geom_hline(yintercept = sigma_min, linetype = "dashed",
             colour = PALETTE$coral, linewidth = 0.6, alpha = 0.7) +
  annotate("text",
           x = max(L_seq) * 0.85, y = sigma_min + 0.03,
           label = sprintf("\u03C3_min = %.2f", sigma_min),
           size = 7, colour = PALETTE$coral, fontface = "bold") +
  # σ = 1 ceiling line
  geom_hline(yintercept = 1, linetype = "dotted",
             colour = PALETTE$slate, linewidth = 0.4, alpha = 0.5) +
  annotate("text",
           x = max(L_seq) * 0.85, y = 0.97,
           label = "\u03C3 = 1 (perfect forecaster)",
           size = 6, colour = PALETTE$slate, fontface = "italic") +
  # Main curve
  geom_line(data = df_curve, aes(x = L, y = sigma),
            colour = PALETTE$navy, linewidth = 1.4) +
  # Forecaster dots
  geom_point(data = forecaster_dots, aes(x = L, y = sigma),
             fill = dot_colours, colour = "white",
             shape = 21, size = 9, stroke = 1.5) +
  # Forecaster labels
  geom_label(data = forecaster_dots, aes(x = L, y = sigma, label = label),
             size = 6, fontface = "bold",
             fill = "white", colour = PALETTE$charcoal,
             label.padding = unit(0.4, "lines"),
             label.r = unit(0.3, "lines"),
             nudge_y = c(0.10, 0.10, 0.10)) +
  # Scales
  scale_x_continuous(
    limits = c(-0.01, max(L_seq) + 0.01),
    labels = scales::number_format(accuracy = 0.01),
    expand = c(0, 0)
  ) +
  scale_y_continuous(
    limits = c(0, 1.08),
    breaks = seq(0, 1, 0.2),
    labels = scales::number_format(accuracy = 0.1)
  ) +
  labs(
    title = NULL,
    subtitle = NULL,
    x = expression(bold("Mean Loss") ~ (L)),
    y = expression(bold("Skill Parameter") ~ (sigma))
  ) +
  theme_thesis()

# ---------------------------------------------------------------------------
# 5. Save to both output directories
# ---------------------------------------------------------------------------
save_dual(p, "skill_signal_clean.png")

message("Done: skill_signal_clean.png")
