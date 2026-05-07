# presentation/R/plot_positioning_matrix.R
# Literature positioning matrix: 2×2 grid of Adaptiveness × Self-financed.
# Aligned with the React version in PositioningMatrixSlide.tsx.
#
# Run from project root:
#   Rscript presentation/R/plot_positioning_matrix.R

source("presentation/R/theme_thesis.R")

suppressPackageStartupMessages({
  library(dplyr)
})

# ---------------------------------------------------------------------------
# 1. Static node data (4 nodes, matching the dashboard slide)
# ---------------------------------------------------------------------------
nodes <- tibble::tribble(
  ~label,                                     ~x,   ~y,   ~highlight,
  "Lambert et al.\n(single-shot Lambert)",    0.25, 0.80, FALSE,
  "Raja et al.\n(client-reward PM)",          0.25, 0.50, FALSE,
  "Vitali & Pinson\n(OGD + Shapley)",         0.75, 0.25, FALSE,
  "THIS THESIS\nSkill + self-financed",       0.75, 0.80, TRUE
)

# ---------------------------------------------------------------------------
# 2. Plot
# ---------------------------------------------------------------------------
p <- ggplot(nodes, aes(x = x, y = y)) +
  # Quadrant tints — keep the teal for the project's quadrant
  annotate("rect", xmin = 0, xmax = 0.5, ymin = 0.5, ymax = 1,
           fill = "#F0F4F8", alpha = 0.55) +
  annotate("rect", xmin = 0.5, xmax = 1, ymin = 0.5, ymax = 1,
           fill = "#E8F2F2", alpha = 0.7) +
  annotate("rect", xmin = 0, xmax = 0.5, ymin = 0, ymax = 0.5,
           fill = "#F8FAFC", alpha = 0.6) +
  annotate("rect", xmin = 0.5, xmax = 1, ymin = 0, ymax = 0.5,
           fill = "#F5F0FA", alpha = 0.6) +
  # Dividers
  geom_hline(yintercept = 0.5, linetype = "dashed", colour = PALETTE$slate,
             linewidth = 0.5, alpha = 0.6) +
  geom_vline(xintercept = 0.5, linetype = "dashed", colour = PALETTE$slate,
             linewidth = 0.5, alpha = 0.6) +
  # Non-highlighted nodes
  geom_point(data = filter(nodes, !highlight),
             size = 8, shape = 21, fill = PALETTE$slate,
             colour = "white", stroke = 1.5, alpha = 0.85) +
  geom_label(data = filter(nodes, !highlight),
             aes(label = label),
             size = 4.8, fontface = "bold",
             fill = "white", colour = PALETTE$charcoal,
             label.padding = unit(0.45, "lines"),
             label.r = unit(0.3, "lines"),
             nudge_y = -0.11, alpha = 0.95) +
  # Highlighted node — thesis
  geom_point(data = filter(nodes, highlight),
             size = 14, shape = 21, fill = PALETTE$teal,
             colour = "white", stroke = 2.5) +
  geom_label(data = filter(nodes, highlight),
             aes(label = label),
             size = 5.4, fontface = "bold",
             fill = PALETTE$navy, colour = "white",
             label.padding = unit(0.6, "lines"),
             label.r = unit(0.35, "lines"),
             nudge_y = -0.15) +
  scale_x_continuous(
    limits = c(-0.04, 1.04),
    breaks = c(0.25, 0.75),
    labels = c("Static\n(no learning)", "Adaptive\n(learns over time)"),
    expand = c(0, 0)
  ) +
  scale_y_continuous(
    limits = c(-0.04, 1.04),
    breaks = c(0.25, 0.75),
    labels = c("Not self-financed", "Self-financed"),
    expand = c(0, 0)
  ) +
  labs(
    x = expression(bold("Adaptiveness") ~ rightarrow),
    y = expression(bold("Self-financing") ~ rightarrow)
  ) +
  theme_thesis() +
  theme(
    panel.grid.major.y = element_blank(),
    axis.text = element_text(size = 14, face = "bold")
  ) +
  coord_fixed(ratio = 1)

save_dual(p, "positioning_matrix.png", width = 12, height = 12)
message("Done: positioning_matrix.png")
